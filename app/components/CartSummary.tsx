import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartSummaryProps {
  cart: Product[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart }) => {
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="bg-purple-500 shadow-md rounded-lg p-4 mt-4 text-white">
      <h2 className="text-lg font-semibold mb-2 flex items-center ">
        <FaShoppingCart className="mr-2" />
        Your Cart
      </h2>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="flex justify-between items-center mb-2">
                <span>{item.name}</span>
                <span>{item.price} Algo</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-2 mt-2">
            <p className="font-bold flex justify-between items-center">
              <span>Total:</span>
              <span>{totalAmount} Algo</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSummary;
