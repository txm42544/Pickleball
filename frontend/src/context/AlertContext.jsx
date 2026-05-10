import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Popup from "../components/Popup";

const AlertContext = createContext({ showAlert: () => {} });

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({ open: false, type: "info", title: "", message: "", autoCloseMs: 1800 });
  const timerRef = useRef(null);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  const showAlert = useCallback((options) => {
    const normalized = typeof options === "string" ? { message: options } : options || {};
    const { message = "", title = "", type = "info", autoCloseMs = 1800 } = normalized;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAlertState({ open: true, type, title, message, autoCloseMs });
    if (autoCloseMs) {
      timerRef.current = setTimeout(() => {
        closeAlert();
      }, autoCloseMs);
    }
  }, [closeAlert]);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => showAlert({ message: msg, type: "info" });
    return () => {
      window.alert = originalAlert;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Popup
        open={alertState.open}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
