import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/api";
import "./NotificationBell.css";

const POLL_MS = 10000;

const getRoleInfo = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const khach = JSON.parse(localStorage.getItem("khach") || "null");

  if (user && (user.role === "Nhân viên" || user.role === "Quản lý")) {
    return { type: "admin", maKH: null };
  }

  if (khach?.MaKH) {
    return { type: "khachhang", maKH: khach.MaKH };
  }

  return { type: null, maKH: null };
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [{ roleType, maKH }, setRoleState] = useState(() => {
    const info = getRoleInfo();
    return { roleType: info.type, maKH: info.maKH };
  });
  const [count, setCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);

  const getSeenStorageKey = (role, customerId) => {
    if (role === "admin") return "notif:seen:admin";
    if (role === "khachhang") return `notif:seen:khach:${customerId || "unknown"}`;
    return "notif:seen:guest";
  };

  const getSeenSet = (role, customerId) => {
    const key = getSeenStorageKey(role, customerId);
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.map((item) => String(item)));
    } catch {
      return new Set();
    }
  };

  const setSeenSet = (role, customerId, seenSet) => {
    const key = getSeenStorageKey(role, customerId);
    const values = Array.from(seenSet);
    const trimmed = values.slice(-1000);
    localStorage.setItem(key, JSON.stringify(trimmed));
  };

  useEffect(() => {
    const syncRole = () => {
      const info = getRoleInfo();
      setRoleState({ roleType: info.type, maKH: info.maKH });
    };
    syncRole();
    window.addEventListener("storage", syncRole);
    return () => window.removeEventListener("storage", syncRole);
  }, []);

  useEffect(() => {
    let disposed = false;

    const fetchCount = async () => {
      if (!roleType) {
        if (!disposed) setCount(0);
        return;
      }

      try {
        let latestItems = [];

        if (roleType === "admin") {
          const { data } = await axios.get("/api/admin/notifications/pending-count");
          latestItems = Array.isArray(data?.pendingItems) ? data.pendingItems.map((item) => String(item)) : [];
        }

        if (roleType === "khachhang" && maKH && latestItems.length === 0) {
          const { data } = await axios.get("/api/client/notifications/accepted-count", {
            params: { MaKH: maKH },
          });
          latestItems = Array.isArray(data?.acceptedItems) ? data.acceptedItems.map((item) => String(item)) : [];
        }

        if (!disposed) {
          const seenSet = getSeenSet(roleType, maKH);
          const unread = latestItems.filter((item) => !seenSet.has(item)).length;
          setCurrentItems(latestItems);
          setCount(latestItems.length);
          setUnreadCount(unread);
        }
      } catch {
        if (!disposed) {
          setCurrentItems([]);
          setCount(0);
          setUnreadCount(0);
        }
      }
    };

    fetchCount();
    const timer = setInterval(fetchCount, POLL_MS);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [roleType, maKH]);

  const tooltipText = useMemo(() => {
    if (roleType === "admin") return "Yêu cầu chờ xác nhận";
    if (roleType === "khachhang") return "Thông báo sân đã xác nhận";
    return "Thông báo";
  }, [roleType]);

  if (!roleType) return null;

  const handleClick = () => {
    const seenSet = getSeenSet(roleType, maKH);
    currentItems.forEach((item) => seenSet.add(String(item)));
    setSeenSet(roleType, maKH, seenSet);
    setUnreadCount(0);

    if (roleType === "admin") {
      navigate("/dat-san");
      return;
    }
    navigate("/booking-history");
  };

  return (
    <button type="button" className="notify-bell" onClick={handleClick} title={tooltipText}>
      <span className="notify-bell-icon" aria-hidden="true">🔔</span>
      {unreadCount > 0 && <span className="notify-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
    </button>
  );
}
