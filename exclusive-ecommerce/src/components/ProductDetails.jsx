import React from 'react';

const ProductDetails = ({ product }) => {
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="product-details">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <img src={product.image} alt={product.name} className="w-full h-auto" />
      <p className="mt-4">{product.description}</p>
      <p className="mt-2 text-lg font-semibold">${product.price}</p>
      <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetails;