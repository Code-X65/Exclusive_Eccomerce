import React, { useContext } from 'react';
import { CartContext } from '../components/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul>
            {cartItems.map(item => (
              <li key={item.id} className="flex justify-between items-center mb-4">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
                <button onClick={() => handleRemove(item.id)} className="text-red-500">Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={handleClearCart} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Clear Cart</button>
        </div>
      )}
    </div>
  );
};

export default CartPage;