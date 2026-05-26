import React, { createContext, useContext, useState, useEffect } from 'react';

// PRICE MARKUP: Customer pays farmer price × 1.90 (90% platform margin)
export const CUSTOMER_MARKUP = 1.90;
export const getCustomerPrice = (farmerPrice) => Math.round(farmerPrice * CUSTOMER_MARKUP * 100) / 100;

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('inari_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('inari_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item._id === product._id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prevItems.map((item) =>
          item._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      // Store the customer price (markup applied) alongside the farmer price
      return [...prevItems, {
        ...product,
        farmerPrice: product.price,
        price: getCustomerPrice(product.price),
        quantity: Math.min(quantity, product.stock)
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 15.00;
  const estimatedTax = subtotal * 0.13; // 13% Nepal VAT
  const total = subtotal + shippingFee + estimatedTax;

  const value = {
    cartItems, itemsCount, subtotal, shippingFee, estimatedTax, total,
    addToCart, removeFromCart, updateQuantity, clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};