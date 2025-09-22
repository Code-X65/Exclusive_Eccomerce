import React, { useContext } from 'react';
import { CartContext } from '../components/CartContext';

const ShoppingCart = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleClear = () => {
    clearCart();
  };

  return (
    <div className="shopping-cart">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul>
            {cartItems.map(item => (
              <li key={item.id} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
                <button onClick={() => handleRemove(item.id)} className="text-red-500">Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={handleClear} className="mt-4 bg-red-500 text-white px-4 py-2">Clear Cart</button>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;