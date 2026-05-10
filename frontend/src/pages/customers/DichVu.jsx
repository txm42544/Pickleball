import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/DichVu.css";

const servicesData = [
  {
    category: "Dịch Vụ",
    items: [
      { name: "Áo Mưa (Cái)", price: 10000 },
      { name: "Bóng Facolos (Trái)", price: 50000 },
      { name: "Bóng thi đấu Frankin X (Trái)", price: 65000 },
      { name: "Bóng Vicc (Trái)", price: 50000 },
    ],
  },
  {
    category: "Đồ Ăn",
    items: [
      { name: "Bánh Ruốc Kinh Đô (Cái)", price: 10000 },
      { name: "Sữa đậu nành Fami (Hộp)", price: 10000 },
    ],
  },
  {
    category: "Nước",
    items: [
      { name: "Aquafina (Chai)", price: 10000 },
      { name: "Aquarius xanh (Chai)", price: 15000 },
    ],
  },
];

export function DichVu() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  const initialServices = location.state?.services || [];
  const returnPath = location.state?.returnPath || "/chitietve"; // mặc định về /chitietve

  const [cart, setCart] = useState(() => {
    const init = {};
    initialServices.forEach((s) => {
      const key = s.name || s.ten; // nếu s.name không có thì lấy s.ten
      const qty = s.qty || 1;
      if (key) init[key] = qty;
    });
    return init;
  });

  const [searchText, setSearchText] = useState("");

  const categoryRefs = {
    "Dịch Vụ": useRef(null),
    "Đồ Ăn": useRef(null),
    Nước: useRef(null),
  };

  const handleAdd = (item) =>
    setCart((prev) => ({ ...prev, [item.name]: (prev[item.name] || 0) + 1 }));
  const handleRemove = (item) =>
    setCart((prev) => {
      if (!prev[item.name]) return prev;
      const newQty = prev[item.name] - 1;
      const newCart = { ...prev };
      if (newQty <= 0) delete newCart[item.name];
      else newCart[item.name] = newQty;
      return newCart;
    });

  const handleScrollTo = (category) =>
    categoryRefs[category].current.scrollIntoView({ behavior: "smooth" });

  const filteredData = servicesData.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    ),
  }));

  const handleAddServices = () => {
    const servicesArray = Object.entries(cart).map(([name, qty]) => {
      const itemData = servicesData
        .flatMap((c) => c.items)
        .find((i) => i.name === name);
      const price = itemData ? itemData.price : 0; // nếu không tìm thấy thì mặc định 0

      return { name, qty, price };
    });
    // Quay lại ChiTietXeVe.jsx với mảng services và event
    navigate(returnPath, { state: { event, services: servicesArray } });
  };

  return (
    <div className="dv-container">
      <h2>Dịch vụ dành cho bạn</h2>
      <div className="category-buttons">
        {["Dịch Vụ", "Đồ Ăn", "Nước"].map((cat) => (
          <button key={cat} onClick={() => handleScrollTo(cat)}>
            {cat}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Nhập tên sản phẩm"
        className="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {filteredData.map((category) => (
        <div
          key={category.category}
          className="category-section"
          ref={categoryRefs[category.category]}
        >
          <h3>{category.category}</h3>
          <div className="items-grid">
            {category.items.map((item) => {
              const qty = cart[item.name] || 0;
              return (
                <div key={item.name} className="item-card-dichvu">
                  <div className="item-image-dichvu"></div>
                  <div className="item-info-dichvu">
                    <div className="item-name-dichvu">{item.name}</div>
                    <div className="item-price-dichvu">
                      {item.price.toLocaleString()} đ
                    </div>
                  </div>
                  <div className="item-actions-dichvu">
                    {qty > 0 && (
                      <button onClick={() => handleRemove(item)}>-</button>
                    )}
                    <span>{qty}</span>
                    <button onClick={() => handleAdd(item)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(cart).length > 0 && (
        <div className="cart-summary-dichvu">
          {Object.values(cart).reduce((a, b) => a + b, 0)} món | Tổng cộng:{" "}
          {Object.entries(cart)
            .reduce((sum, [name, qty]) => {
              const item = servicesData
                .flatMap((c) => c.items)
                .find((i) => i.name === name);
              return sum + qty * (item ? item.price : 0);
            }, 0)
            .toLocaleString()}{" "}
          đ
          <button className="add-services-btn" onClick={handleAddServices}>
            Thêm dịch vụ
          </button>
        </div>
      )}
    </div>
  );
}
