import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Get or create session ID
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', sid);
    }
    setSessionId(sid);
    fetchCart(sid);
  }, []);

  const fetchCart = async (sid) => {
    try {
      const response = await axios.get(`/api/client/cart/${sid}`);
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
  };

  const addToCart = async (product, quantity = 1, color = null) => {
    try {
      await axios.post(`/api/client/cart`, {
        sessionId,
        productId: product.id,
        quantity,
        color: color || (product.colors ? JSON.parse(product.colors)[0] : null)
      });
      await fetchCart(sessionId);
      // alert('Sản phẩm đã được thêm vào giỏ hàng!'); // Có thể thêm thông báo thành công nếu muốn
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Hiển thị thông báo lỗi từ backend
      alert(error.response?.data?.error || 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await axios.put(`/api/client/cart/${itemId}`, { quantity });
      await fetchCart(sessionId);
    } catch (error) {
      console.error('Error updating cart:', error);
      // Hiển thị thông báo lỗi từ backend
      alert(error.response?.data?.error || 'Không thể cập nhật số lượng.');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/client/cart/${itemId}`);
      await fetchCart(sessionId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`/api/client/cart/session/${sessionId}`);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        sessionId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
