
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import "../../css/DatSanThang.css";
import "../../css/DatSanNgay.css";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import { DEFAULT_PAYMENT_IMAGE, withFallbackImage, withUploadBase } from "../../utils/api";

export function DatSanThang() {
	const [activeTab] = useState("weekday");
	const navigate = useNavigate();
	const { showAlert } = useAlert();
	const VIP_PRICE_FACTOR = 1.15;
	const MONTHLY_COURT_IDS = ["S5", "S6", "S7"];
	const MONTHLY_COURT_LABELS = {
		S5: "T5",
		S6: "T6",
		S7: "T7",
	};
	const DEFAULT_MONTHLY_COURT = MONTHLY_COURT_IDS[0];

	// 🧩 State cho lịch đặt sân tháng đã có
	const [existingBookings, setExistingBookings] = useState([]);
	const [showBookingsModal, setShowBookingsModal] = useState(false);
	const [sanList, setSanList] = useState([]);
	const [selectedMonthlyBooking, setSelectedMonthlyBooking] = useState(null);
	const [showCancelConfirmPopup, setShowCancelConfirmPopup] = useState(false);
	const [bookingActionLoading, setBookingActionLoading] = useState(false);
	const [zoomedImage, setZoomedImage] = useState(null);
	const acceptedOverridesRef = useRef(new Set());
	const acceptingMonthlyRef = useRef(false);

	// 🧩 Lấy thông tin người dùng đăng nhập từ localStorage
	const currentUser =
		JSON.parse(localStorage.getItem("user")) ||
		JSON.parse(localStorage.getItem("khach"));

	// 🔐 Nếu chưa login, redirect về login
	if (!currentUser) {
		console.warn("⚠️ Chưa đăng nhập, redirect về login");
		setTimeout(() => {
			alert("⚠️ Vui lòng đăng nhập trước khi đặt sân!");
			navigate("/login");
		}, 100);
		return null;
	}

	let role = "";
	let maNguoiDung = "";
	let isKhachHang = false;

	if (currentUser?.role === "Nhân viên" || currentUser?.role === "Quản lý") {
		role = "nhanvien";
		maNguoiDung = currentUser.maNV;
		isKhachHang = false;
		console.log("🔹 Đang đăng nhập với vai trò:", currentUser.role);
		console.log("Mã nhân viên:", maNguoiDung);
	} else if (currentUser?.MaKH) {
		role = "khachhang";
		maNguoiDung = currentUser.MaKH;
		isKhachHang = true;
		console.log("🔹 Khách hàng đăng nhập:");
		console.log("Mã KH:", currentUser.MaKH);
		console.log("Tên KH:", currentUser.TenKh);
		console.log("SĐT:", currentUser.SDT);
	}

	// ===== Khách hàng =====
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [searchTen, setSearchTen] = useState([]);
	const [searchSdt, setSearchSdt] = useState([]);
	const typingTimeout = useRef(null);

	const getCourtNumber = (maSan) => {
		const parsed = parseInt(String(maSan || "").replace(/\D/g, ""), 10);
		return Number.isNaN(parsed) ? null : parsed;
	};

	const isVipCourt = (san, index = 0) => {
		const courtNumber = getCourtNumber(san?.MaSan) ?? index + 1;
		return san?.LoaiSan === "VIP" && (courtNumber > 0 || index >= 0);
	};

	const getMonthlyCourtLabel = (courtId) => MONTHLY_COURT_LABELS[String(courtId || "").trim()] || String(courtId || "").trim();

	const parseCourtList = (courtValue) => {
		if (Array.isArray(courtValue)) {
			return courtValue.map((item) => String(item || "").trim()).filter(Boolean);
		}
		return String(courtValue || "")
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	};

	const formatCourtLabel = (san, index = 0) => {
		if (!san) return "Sân";
		const mappedLabel = getMonthlyCourtLabel(san?.MaSan);
		if (mappedLabel) return mappedLabel;
		// Luôn hiển thị SÂN VIP 1 cho sân số 6
		if (isVipCourt(san, index)) {
			return "SÂN VIP 1";
		}
		return san.TenSan?.trim() || san.MaSan;
	};

	const normalizeStatus = (status) =>
		String(status || "")
			.toLowerCase()
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/đ/g, "d");

	const isCancelledStatus = (status) => {
		const normalized = normalizeStatus(status);
		return normalized.includes("huy") || normalized.includes("cancel");
	};

	const isAcceptedStatus = (status) => {
		const normalized = normalizeStatus(status);
		return (
			normalized.includes("hoat dong") ||
			normalized.includes("accepted") ||
			normalized.includes("da xac nhan") ||
			normalized.includes("da dat san")
		);
	};

	const isPendingStatus = (status) => {
		const normalized = normalizeStatus(status);
		return normalized.includes("cho xac nhan") || normalized.includes("pending");
	};

	const getMonthlyStatusLabel = (status) => {
		if (isAcceptedStatus(status)) return "Đã đặt sân";
		if (isPendingStatus(status)) return "Chờ xác nhận";
		if (isCancelledStatus(status)) return "Hủy";
		return status || "Chờ xác nhận";
	};

	const getEffectiveStatus = (booking) => {
		if (!booking) return "Chờ xác nhận";
		if (acceptedOverridesRef.current.has(booking.MaDatSanThang)) return "Hoạt động";
		return booking.TrangThai;
	};

	// ===== Chọn sân =====
	const [selectedCourts, setSelectedCourts] = useState([DEFAULT_MONTHLY_COURT]);

	const toggleCourt = () => {
		setSelectedCourts([DEFAULT_MONTHLY_COURT]);
	};

	// ===== Khung ngày cố định: 30 ngày tiếp theo kể từ hôm nay =====
	const bookingWindowStart = useMemo(() => dayjs().startOf("day"), []);
	const bookingWindowEnd = useMemo(() => bookingWindowStart.add(29, "day"), [bookingWindowStart]);
	const [dayChecked] = useState([]);
	const [gioVao, setGioVao] = useState("05:00");
	const [gioRa, setGioRa] = useState("06:00");
	const [isPreparingConfirm, setIsPreparingConfirm] = useState(false);
	const [rangeAnchorSlot, setRangeAnchorSlot] = useState(null);

	// 🧩 Fetch danh sách sân và lịch đặt tháng hiện tại
	useEffect(() => {
		fetchSanList();
		fetchExistingBookings();
	}, []);

	const fetchSanList = async () => {
		try {
			const res = await axios.get("/api/admin/san/list");
			const data = Array.isArray(res.data) ? res.data : [];
			const normalized = data
				.filter((san) => san.TrangThai === "Hoạt động" && MONTHLY_COURT_IDS.includes(san.MaSan))
				.sort((a, b) => MONTHLY_COURT_IDS.indexOf(a.MaSan) - MONTHLY_COURT_IDS.indexOf(b.MaSan))
				.map((san, idx) => {
					const courtNumber = getCourtNumber(san.MaSan) ?? idx + 1;
					const vip = san.LoaiSan === "VIP";
					return {
						...san,
						LoaiSan: vip ? "VIP" : "Thường",
						TenSan: getMonthlyCourtLabel(san.MaSan) || san.TenSan?.trim() || san.MaSan || `Sân ${courtNumber}`,
					};
				});
			setSanList(normalized);
			const firstAvailableCourt = MONTHLY_COURT_IDS.find((courtId) => normalized.some((san) => san.MaSan === courtId));
			if (firstAvailableCourt) {
				setSelectedCourts([firstAvailableCourt]);
			}
		} catch (err) {
			console.error("Lỗi khi tải danh sách sân:", err);
		}
	};

	const fetchExistingBookings = async () => {
		try {
			const res = await axios.get("/api/admin/santhang/list", {
				params: { _ts: Date.now() },
			});
			const bookings = (res.data.data || []).map((booking) => {
				if (acceptedOverridesRef.current.has(booking.MaDatSanThang)) {
					return { ...booking, TrangThai: "Hoạt động" };
				}
				return booking;
			});
			const normalizeDays = (days) => {
				if (Array.isArray(days)) return days;
				if (!days) return [];
				try {
					return JSON.parse(days);
				} catch {
					return String(days)
						.replace(/\[|\]|"/g, "")
						.split(",")
						.map((d) => d.trim())
						.filter(Boolean);
				}
			};

			const selectedDatesSet = new Set(selectedBookingDates);

			// Lọc booking giao với khung 30 ngày tới
			const filtered = bookings
				.map((b) => ({ ...b, DanhSachNgay: normalizeDays(b.DanhSachNgay) }))
				.filter((b) => {
					const dates = b.DanhSachNgay || [];
					return dates.some((d) => selectedDatesSet.has(dayjs(d).format("YYYY-MM-DD")));
				})
				.filter((b) => !isCancelledStatus(b.TrangThai));
			setExistingBookings(filtered);
		} catch (err) {
			console.error("Lỗi khi tải lịch đặt tháng:", err);
		}
	};

	const toggleDay = () => {};

	const parseTimeToMinutes = (timeText) => {
		const [hour = 0, minute = 0] = String(timeText || "00:00").split(":").map(Number);
		return hour * 60 + minute;
	};

	const slotToLabel = (slotIndex) => `${String(slotIndex + 5).padStart(2, "0")}:00`;

	const hourSlots = useMemo(() => Array.from({ length: 19 }, (_, idx) => idx), []);

	const selectedBookingDates = useMemo(() => {
		return Array.from({ length: 30 }, (_, index) =>
			bookingWindowStart.add(index, "day").format("YYYY-MM-DD")
		);
	}, [bookingWindowStart]);

	const isCourtBlockedByMonthlyBooking = (courtId) => {
		if (!courtId || !selectedBookingDates.length) return false;

		const start = parseTimeToMinutes(gioVao);
		const end = parseTimeToMinutes(gioRa);
		if (end <= start) return false;

		return existingBookings.some((booking) => {
			const bookedCourts = Array.isArray(booking.DanhSachSan)
				? booking.DanhSachSan
				: String(booking.DanhSachSan || "")
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean);

			if (!bookedCourts.includes(courtId)) return false;

			const bookedDays = Array.isArray(booking.DanhSachNgay)
				? booking.DanhSachNgay
				: [];
			const hasSameDate = selectedBookingDates.some((date) => bookedDays.includes(date));
			if (!hasSameDate) return false;

			const bookedStart = parseTimeToMinutes(String(booking.GioBatDau || "00:00").slice(0, 5));
			const bookedEnd = parseTimeToMinutes(String(booking.GioKetThuc || "00:00").slice(0, 5));
			return start < bookedEnd && bookedStart < end;
		});
	};

	const getBlockedSlotsForCourt = (courtId) => {
		if (!courtId || !selectedBookingDates.length) return new Set();
		const blocked = new Set();

		existingBookings.forEach((booking) => {
			const bookedCourts = Array.isArray(booking.DanhSachSan)
				? booking.DanhSachSan
				: String(booking.DanhSachSan || "")
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean);

			if (!bookedCourts.includes(courtId)) return;

			const bookedDays = Array.isArray(booking.DanhSachNgay)
				? booking.DanhSachNgay
				: [];
			const hasSameDate = selectedBookingDates.some((date) => bookedDays.includes(date));
			if (!hasSameDate) return;

			const startHour = Number(String(booking.GioBatDau || "00:00").slice(0, 2));
			const endHour = Number(String(booking.GioKetThuc || "00:00").slice(0, 2));
			for (let hour = startHour; hour < endHour; hour++) {
				const slot = hour - 5;
				if (slot >= 0 && slot < hourSlots.length) blocked.add(slot);
			}
		});

		return blocked;
	};

	const findBookingForSlot = (courtId, slotIndex) => {
		if (!courtId || !selectedBookingDates.length) return null;

		for (const booking of existingBookings) {
			const bookedCourts = Array.isArray(booking.DanhSachSan)
				? booking.DanhSachSan
				: String(booking.DanhSachSan || "")
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean);

			if (!bookedCourts.includes(courtId)) continue;

			const bookedDays = Array.isArray(booking.DanhSachNgay) ? booking.DanhSachNgay : [];
			const hasSameDate = selectedBookingDates.some((date) => bookedDays.includes(date));
			if (!hasSameDate) continue;

			const startHour = Number(String(booking.GioBatDau || "00:00").slice(0, 2));
			const endHour = Number(String(booking.GioKetThuc || "00:00").slice(0, 2));
			const startSlot = startHour - 5;
			const endSlot = endHour - 5;

			if (slotIndex >= startSlot && slotIndex < endSlot) {
				return booking;
			}
		}

		return null;
	};

	const findBookingsForSlot = (courtId, slotIndex) => {
		if (!courtId || !selectedBookingDates.length) return [];

		return existingBookings.filter((booking) => {
			const bookedCourts = Array.isArray(booking.DanhSachSan)
				? booking.DanhSachSan
				: String(booking.DanhSachSan || "")
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean);

			if (!bookedCourts.includes(courtId)) return false;

			const bookedDays = Array.isArray(booking.DanhSachNgay) ? booking.DanhSachNgay : [];
			const hasSameDate = selectedBookingDates.some((date) => bookedDays.includes(date));
			if (!hasSameDate) return false;

			const startHour = Number(String(booking.GioBatDau || "00:00").slice(0, 2));
			const endHour = Number(String(booking.GioKetThuc || "00:00").slice(0, 2));
			const startSlot = startHour - 5;
			const endSlot = endHour - 5;

			return slotIndex >= startSlot && slotIndex < endSlot;
		});
	};

	const handleAdminAcceptMonthly = async () => {
		if (bookingActionLoading || acceptingMonthlyRef.current) return;
		if (!selectedMonthlyBooking?.MaDatSanThang) {
			const message = "Không tìm thấy mã đặt sân tháng để xác nhận.";
			showAlert({ type: "error", title: "Thiếu dữ liệu", message });
			window.alert(message);
			return;
		}
		const bookingId = selectedMonthlyBooking.MaDatSanThang;
		acceptedOverridesRef.current.add(bookingId);
		setExistingBookings((prev) =>
			prev.map((item) =>
				item.MaDatSanThang === bookingId
					? { ...item, TrangThai: "Hoạt động" }
					: item
			)
		);
		setSelectedMonthlyBooking((prev) =>
			prev ? { ...prev, TrangThai: "Hoạt động" } : prev
		);
		acceptingMonthlyRef.current = true;
		setBookingActionLoading(true);
		try {
			const { data: result } = await axios.put(
				"/api/admin/santhang/accept",
				{ MaDatSanThang: bookingId },
				{ timeout: 10000 }
			);

			const acceptedStatus = result?.data?.TrangThai || "Hoạt động";
			setExistingBookings((prev) =>
				prev.map((item) =>
					item.MaDatSanThang === bookingId
						? { ...item, TrangThai: acceptedStatus }
						: item
				)
			);
			setSelectedMonthlyBooking(null);
			showAlert({ type: "success", title: "Đã xác nhận", message: "Đã xác nhận lịch đặt sân tháng." });
			await fetchExistingBookings();
		} catch (err) {
			console.error(err);
			const message = err?.response?.data?.message || err?.message || "Không thể xác nhận lịch sân tháng.";
			acceptedOverridesRef.current.delete(bookingId);
			await fetchExistingBookings();
			showAlert({ type: "error", title: "Lỗi xác nhận", message });
			window.alert(message);
		} finally {
			acceptingMonthlyRef.current = false;
			setBookingActionLoading(false);
		}
	};

	const handleAdminCancelMonthly = async () => {
		if (!selectedMonthlyBooking?.MaDatSanThang || bookingActionLoading) return;
		const bookingId = selectedMonthlyBooking.MaDatSanThang;

		try {
			setBookingActionLoading(true);
			await axios.put("/api/admin/santhang/cancel", {
				MaDatSanThang: bookingId,
			});
			acceptedOverridesRef.current.delete(bookingId);
			showAlert({ type: "success", title: "Đã hủy", message: "Đã hủy lịch sân tháng." });
			setShowCancelConfirmPopup(false);
			setSelectedMonthlyBooking(null);
			await fetchExistingBookings();
		} catch (err) {
			console.error(err);
			showAlert({ type: "error", title: "Lỗi hủy", message: "Không thể hủy lịch sân tháng." });
		} finally {
			setBookingActionLoading(false);
		}
	};

	const selectedStartSlot = Math.max(0, Math.floor(parseTimeToMinutes(gioVao) / 60) - 5);
	const selectedEndSlotExclusive = selectedStartSlot + 1;

	const handleTimeSlotClick = (courtId, slotIndex) => {
		if (!isKhachHang) return;
		if (!MONTHLY_COURT_IDS.includes(courtId)) return;
		const blockedSlots = getBlockedSlotsForCourt(courtId);
		if (blockedSlots.has(slotIndex)) return;
		setSelectedCourts([courtId]);
		setRangeAnchorSlot(slotIndex);
		setGioVao(slotToLabel(slotIndex));
		setGioRa(slotToLabel(slotIndex + 1));
	};

	const toggleCourtByGrid = (courtId) => {
		if (!MONTHLY_COURT_IDS.includes(courtId)) return;
		setSelectedCourts([courtId]);
	};

	const getHourlyPrice = (court, hour) => {
		const after16 = hour >= 16;
		const base = after16
			? Number(court?.GiaThueSau16 || 160000)
			: Number(court?.GiaThueTruoc16 || 100000);
		const vip = court?.LoaiSan === "VIP";
		return Math.round(vip ? base * VIP_PRICE_FACTOR : base);
	};

	const estimatedTotal = useMemo(() => {
		const start = parseTimeToMinutes(gioVao);
		const end = parseTimeToMinutes(gioRa);
		if (end <= start) return 0;
		if (!selectedCourts.length || !selectedBookingDates.length) return 0;

		const selectedCourtObjects = sanList.filter((court) => selectedCourts.includes(court.MaSan));
		const hourStart = Math.floor(start / 60);
		const hourEnd = Math.floor(end / 60);

		const oneDayTotal = selectedCourtObjects.reduce((sum, court) => {
			let courtAmount = 0;
			for (let hour = hourStart; hour < hourEnd; hour++) {
				courtAmount += getHourlyPrice(court, hour);
			}
			return sum + courtAmount;
		}, 0);

		return oneDayTotal * selectedBookingDates.length;
	}, [gioVao, gioRa, sanList, selectedBookingDates, selectedCourts]);

	const selectedRangeLabel = useMemo(
		() => `${bookingWindowStart.format("DD/MM/YYYY")} - ${bookingWindowEnd.format("DD/MM/YYYY")}`,
		[bookingWindowStart, bookingWindowEnd]
	);

	const buildMonthlyGrid = () => {
		const gridEl = document.getElementById("monthly-grid");
		if (!gridEl) return;
		gridEl.innerHTML = "";

		const headWrapper = document.createElement("div");
		headWrapper.className = "grid-head-wrapper";
		const head = document.createElement("div");
		head.className = "grid-head";

		const blank = document.createElement("div");
		blank.className = "hcell side";
		blank.textContent = "Sân / Giờ";
		head.appendChild(blank);

		hourSlots.forEach((slot) => {
			const h = document.createElement("div");
			h.className = "hcell";
			h.textContent = `${slotToLabel(slot)}-${slotToLabel(slot + 1)}`;
			head.appendChild(h);
		});

		headWrapper.appendChild(head);
		gridEl.appendChild(headWrapper);

		const rowsWrapper = document.createElement("div");
		rowsWrapper.className = "grid-rows-wrapper";

		sanList.forEach((san, idx) => {
			const row = document.createElement("div");
			row.className = "row";

			const side = document.createElement("div");
			side.className = "cell side";
			side.textContent = formatCourtLabel(san, idx);
			if (isKhachHang) {
				side.style.cursor = "pointer";
				side.addEventListener("click", () => toggleCourtByGrid(san.MaSan));
			}
			row.appendChild(side);

			const blockedSlots = getBlockedSlotsForCourt(san.MaSan);
			const isSelectedCourt = selectedCourts.includes(san.MaSan);

				hourSlots.forEach((slot) => {
				const cell = document.createElement("div");
				const blocked = blockedSlots.has(slot);
					const selected = isKhachHang && isSelectedCourt && slot === selectedStartSlot;

					if (blocked) {
						const matchedBookings = findBookingsForSlot(san.MaSan, slot);
						const acceptedBooking = matchedBookings.find((b) => isAcceptedStatus(getEffectiveStatus(b)));
						const pendingBooking = matchedBookings.find((b) => isPendingStatus(getEffectiveStatus(b)));
						const bookingInfo = acceptedBooking || pendingBooking || matchedBookings[0] || findBookingForSlot(san.MaSan, slot);
					cell.className = "cell slot booked";
						cell.textContent = isAcceptedStatus(getEffectiveStatus(bookingInfo))
							? "Đã đặt sân"
							: "Chờ xác nhận";
					const tenKh = bookingInfo?.GhiChu || bookingInfo?.MaKH || "Khách";
						const statusText = getMonthlyStatusLabel(getEffectiveStatus(bookingInfo));
					cell.title = `${tenKh} • ${statusText}`;
					if (!isKhachHang && bookingInfo) {
						cell.style.cursor = "pointer";
						cell.addEventListener("click", () => setSelectedMonthlyBooking(bookingInfo));
					}
				} else if (selected) {
					cell.className = "cell slot avail selected-slot";
					cell.textContent = "Đã chọn";
					cell.title = "Khung giờ đã chọn";
						if (isKhachHang) {
							cell.addEventListener("click", () => handleTimeSlotClick(san.MaSan, slot));
						}
				} else {
					cell.className = "cell slot avail";
						cell.title = isKhachHang ? "Nhấn để chọn khung giờ" : "Ô trống";
						if (isKhachHang) {
							cell.addEventListener("click", () => handleTimeSlotClick(san.MaSan, slot));
						}
				}

				row.appendChild(cell);
			});

			rowsWrapper.appendChild(row);
		});

		gridEl.appendChild(rowsWrapper);
	};

	useEffect(() => {
		if (sanList.length > 0) buildMonthlyGrid();
	}, [sanList, existingBookings, selectedCourts, gioVao, selectedStartSlot, selectedBookingDates]);

	const handleConfirm = () => {
		if (!isKhachHang) {
			showAlert({ type: "error", title: "Không được phép", message: "Admin chỉ có thể xác nhận hoặc hủy booking." });
			return;
		}
		const selectedMonthlyCourt = selectedCourts[0];
		if (!selectedMonthlyCourt || !MONTHLY_COURT_IDS.includes(selectedMonthlyCourt)) {
			showAlert({ type: "error", title: "Thiếu sân tháng", message: "Vui lòng chọn một sân tháng trong T5, T6, T7.", autoCloseMs: 2200 });
			return;
		}

		const gioVaoMinutes = parseTimeToMinutes(gioVao);
		const gioRaMinutes = parseTimeToMinutes(gioRa);
		if (gioRaMinutes <= gioVaoMinutes) {
			showAlert({ type: "error", title: "Giờ không hợp lệ", message: "Giờ kết thúc phải lớn hơn giờ bắt đầu", autoCloseMs: 2200 });
			return;
		}

		const customerId = isKhachHang ? maNguoiDung : (selectedCustomer || null);
		const customerDisplayName =
			customerName ||
			(isKhachHang ? (currentUser?.TenKh || currentUser?.TenKH || "") : "Khách lẻ");

		const danhSachNgay = selectedBookingDates;

		if (danhSachNgay.length === 0) {
			showAlert({ type: "error", title: "Ngày không hợp lệ", message: "Không có ngày nào hợp lệ để đặt sân!", autoCloseMs: 2200 });
			return;
		}

		const hasBlockedCourt = selectedCourts.some((courtId) => isCourtBlockedByMonthlyBooking(courtId));
		if (hasBlockedCourt) {
			showAlert({ type: "error", title: "Lịch bị trùng", message: "Có sân bị trùng lịch trong khung giờ đã chọn. Vui lòng bỏ chọn sân bị khóa hoặc đổi giờ." });
			return;
		}

		setIsPreparingConfirm(true);

		const payload = {
			MaSan: selectedCourts,
			MaKH: customerId,
			MaNV: !isKhachHang ? maNguoiDung : null,
			Role: role,
			MaNguoiDung: maNguoiDung,
			GioVao: gioVao,
			GioRa: gioRa,
			TongGio: 1,
			TongTien: estimatedTotal,
			GiamGia: 0,
			TongTienThuc: estimatedTotal,
			GhiChu: customerDisplayName,
			LoaiDat: "Đặt sân tháng",
			Thang: bookingWindowStart.month() + 1,
			Nam: bookingWindowStart.year(),
			NgayDat: danhSachNgay,
			ThuChon: [],
		};

		//  Chuyển sang trang xác nhận & truyền toàn bộ payload
		console.log("✅ Payload gửi sang trang xác nhận:", payload);

		//  Lưu dữ liệu vào localStorage trước khi chuyển
		localStorage.setItem("bookingData", JSON.stringify(payload));

		// Điều hướng đến trang xác nhận (truyền thêm qua state để tránh mất dữ liệu)
		navigate("/xacnhansan", { state: { bookingData: payload } });
		setIsPreparingConfirm(false);
	};

	// ===== RENDER =====
	return (
		<div className={`sanngay-container santhang-page ${role === "khachhang" ? "santhang-customer" : ""}`}>
			{role !== "khachhang" && <Sidebar />}
			<div className="sanngay-content santhang-page-content">
				<header className="datsan-header">
					<div className="left">
						<div className="control">
							<label>Chu kỳ đặt sân tháng</label>
							<input value={`30 ngày tiếp theo (${selectedRangeLabel})`} readOnly />
						</div>
					</div>
					<div className="right legend">
						<span className="dot a"></span>
						<small>Còn trống</small>
						<span className="dot c"></span>
						<small>Đã đặt</small>
						<span className="dot s"></span>
						<small>Đang chọn</small>
						<div className="vip-legend">
							<div className="vip-legend-item">
								<span className="vip-dot"></span>
								<small>Sân VIP</small>
							</div>
							<div className="vip-legend-item">
								<span className="normal-dot"></span>
								<small>Sân thường</small>
							</div>
						</div>
					</div>
				</header>

				<div className="inside-st-content">
					<div className="st-card st-plan-card compact-card single-court-card">
						<div className="single-court-pill">
							<span className="single-court-pill-label">Sân tháng áp dụng</span>
							<span className="single-court-pill-value">T5, T6, T7</span>
						</div>
						<p className="single-court-hint">Chọn khung giờ một lần, hệ thống tự áp dụng cho chu kỳ 30 ngày.</p>
					</div>

				<div className="grid-wrapper monthly-grid-compact" id="monthly-grid"></div>

				{isKhachHang && (
				<div className="selection-summary monthly-selection-summary">
					<div className="selection-header">Chi tiết lựa chọn sân tháng</div>
					<div className="selection-list">
						<div className="selection-item">
							<div className="selection-meta">
								<span className="selection-court vip">Sân: {selectedCourts.map(getMonthlyCourtLabel).join(", ") || "-"}</span>
								<span className="selection-time">Chu kỳ: {selectedRangeLabel}</span>
								<span className="selection-time">Giờ: {gioVao} - {gioRa}</span>
							</div>
						</div>
					</div>
				</div>
				)}

				{isKhachHang && (
				<div className="confirm-area monthly-confirm-area">
					<div className="total">Tổng: {estimatedTotal.toLocaleString("vi-VN")} đ</div>
					<button className="btn-confirm" onClick={handleConfirm} disabled={isPreparingConfirm}>
						{isPreparingConfirm ? "Đang xử lý..." : "Xác nhận"}
					</button>
				</div>
				)}
			</div>
			</div>

			{selectedMonthlyBooking && !isKhachHang && (
				<div className="booking-modal" onClick={() => { setSelectedMonthlyBooking(null); setShowCancelConfirmPopup(false); }}>
					<div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Chi tiết đặt sân tháng</h3>
							<button className="close-btn" onClick={() => { setSelectedMonthlyBooking(null); setShowCancelConfirmPopup(false); }}>
								&times;
							</button>
						</div>
						<div className="modal-body">
							<p><strong>Mã đặt:</strong> {selectedMonthlyBooking.MaDatSanThang}</p>
							<p><strong>Khách hàng:</strong> {selectedMonthlyBooking.TenKhach || selectedMonthlyBooking.GhiChu || selectedMonthlyBooking.MaKH || "Khách"}</p>
							<p><strong>Mã KH:</strong> {selectedMonthlyBooking.MaKH || "Không có"}</p>
							<p><strong>SĐT:</strong> {selectedMonthlyBooking.KhachSDT || "Không có"}</p>
							<p><strong>Email:</strong> {selectedMonthlyBooking.KhachEmail || "Không có"}</p>
							<p><strong>Sân:</strong> {parseCourtList(selectedMonthlyBooking.DanhSachSan).map(getMonthlyCourtLabel).join(", ")}</p>
							<p><strong>Khung giờ:</strong> {selectedMonthlyBooking.GioBatDau} - {selectedMonthlyBooking.GioKetThuc}</p>
							<p><strong>Trạng thái:</strong> {getMonthlyStatusLabel(getEffectiveStatus(selectedMonthlyBooking))}</p>
							{selectedMonthlyBooking.PaymentScreenshot && (
								<img
									src={withUploadBase(`/uploads/payments/${selectedMonthlyBooking.PaymentScreenshot}`)}
									alt="Payment"
									style={{ width: "100%", marginTop: "10px", cursor: "pointer" }}
									onError={(e) => withFallbackImage(e, DEFAULT_PAYMENT_IMAGE)}
									onClick={() => setZoomedImage(selectedMonthlyBooking.PaymentScreenshot)}
								/>
							)}
						</div>

						<div style={{ marginTop: "14px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
							{!isAcceptedStatus(getEffectiveStatus(selectedMonthlyBooking)) && (
								<button
									type="button"
									className="btn-confirm"
									onClick={(e) => {
										e.stopPropagation();
										handleAdminAcceptMonthly();
									}}
									disabled={bookingActionLoading}
								>
									{bookingActionLoading ? "Đang xử lý..." : "Xác nhận"}
								</button>
							)}
							<button className="cancel-btn" onClick={() => setShowCancelConfirmPopup(true)} disabled={bookingActionLoading}>
								{bookingActionLoading ? "Đang xử lý..." : "Hủy"}
							</button>
						</div>
					</div>
				</div>
			)}

			{selectedMonthlyBooking && showCancelConfirmPopup && (
				<div className="booking-modal" onClick={() => setShowCancelConfirmPopup(false)}>
					<div className="booking-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
						<div className="modal-header">
							<h3>Xác nhận hủy sân</h3>
							<button className="close-btn" onClick={() => setShowCancelConfirmPopup(false)}>
								&times;
							</button>
						</div>
						<div className="modal-body">
							<p>Bạn có chắc chắn muốn hủy sân này không?</p>
						</div>
						<div style={{ marginTop: "12px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
							<button className="btn-confirm" onClick={handleAdminCancelMonthly} disabled={bookingActionLoading}>
								{bookingActionLoading ? "Đang xử lý..." : "Đồng ý hủy"}
							</button>
							<button className="cancel-btn" onClick={() => setShowCancelConfirmPopup(false)} disabled={bookingActionLoading}>
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}

			{zoomedImage && (
				<div className="image-modal" onClick={() => setZoomedImage(null)}>
					<img
						src={withUploadBase(`/uploads/payments/${zoomedImage}`)}
						alt="Payment"
						onError={(e) => withFallbackImage(e, DEFAULT_PAYMENT_IMAGE)}
					/>
				</div>
			)}

	    {/* Modal xem lịch đặt tháng */}
			{showBookingsModal && (
				<div
					className="bookings-modal-overlay"
					onClick={() => setShowBookingsModal(false)}
				>
					<div className="bookings-modal" onClick={(e) => e.stopPropagation()}>
						<div className="bookings-modal-header">
							<h3>Lịch đặt sân tháng (30 ngày tới)</h3>
							<button
								className="modal-close"
								onClick={() => setShowBookingsModal(false)}
							>
								×
							</button>
						</div>
						<div className="bookings-modal-body">
							{existingBookings.length === 0 ? (
								<p className="no-bookings">Chưa có lịch đặt nào trong tháng này</p>
							) : (
								<table className="bookings-table">
									<thead>
										<tr>
											<th>Mã</th>
											<th>Khách hàng</th>
											<th>Sân</th>
											<th>Giờ</th>
											<th>Các ngày đặt</th>
											<th>Trạng thái</th>
											{!isKhachHang && <th>Thao tác</th>}
										</tr>
									</thead>
									<tbody>
										{existingBookings.map((b, idx) => {
											const danhSachSan = Array.isArray(b.DanhSachSan)
												? b.DanhSachSan
												: String(b.DanhSachSan || "")
													.split(",")
													.map((s) => s.trim())
													.filter(Boolean);
											const filteredDates = (b.DanhSachNgay || []).filter((d) => {
														return selectedBookingDates.includes(dayjs(d).format("YYYY-MM-DD"));
											});

											return (
												<tr key={idx}>
													<td>
														<strong>{b.MaDatSanThang}</strong>
													</td>
													<td>{b.GhiChu || b.MaKH}</td>
													<td>
														<div className="san-badges">
															{danhSachSan.map((s, i) => {
																const san = sanList.find((item) => item.MaSan === s);
																const idx = sanList.findIndex((item) => item.MaSan === s);
																return (
																	<span
																		key={i}
																		className={`san-badge ${isVipCourt(san, idx) ? "vip" : ""}`}
																	>
																		{getMonthlyCourtLabel(s) || formatCourtLabel(san || { MaSan: s }, idx)}
																	</span>
																);
															})}
														</div>
													</td>
													<td>
														{b.GioBatDau} - {b.GioKetThuc}
													</td>
													<td>
														<div className="dates-list">
															{filteredDates.slice(0, 5).map((d, i) => (
																<span key={i} className="date-badge">
																	{dayjs(d).format("DD/MM")}
																</span>
															))}
															{filteredDates.length > 5 && (
																<span className="date-badge more">
																	+{filteredDates.length - 5}
																</span>
															)}
														</div>
													</td>
													<td>{getMonthlyStatusLabel(getEffectiveStatus(b))}</td>
													{!isKhachHang && (
														<td>
															<button className="btn-confirm" onClick={() => setSelectedMonthlyBooking({ ...b, TrangThai: getEffectiveStatus(b) })}>
																Chi tiết
															</button>
														</td>
													)}
												</tr>
											);
										})}
									</tbody>
								</table>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);

}

