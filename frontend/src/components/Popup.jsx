import React from "react";
import "../css/Popup.css";

export default function Popup({ open, type = "info", title, message, onClose }) {
  if (!open) return null;

  const icon = type === "success" ? "✔" : type === "error" ? "✖" : "i";

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`popup-icon ${type}`}>{icon}</div>
        {title && <div className="popup-title">{title}</div>}
        {message && <p className="popup-message">{message}</p>}
      </div>
    </div>
  );
}
