import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('inari_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage whenever cart updates
  useEffect(() => {
    localStorage.setItem('inari_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item._id === product._id);
      if (existing) {
        // Enforce max stock limit
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prevItems.map((item) =>
          item._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevItems, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Computations
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 15.00;
  const estimatedTax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingFee + estimatedTax;

  const value = {
    cartItems,
    itemsCount,
    subtotal,
    shippingFee,
    estimatedTax,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
