import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/index.jsx';

const ProductCard = ({ product, showSpecialTag = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };
  return (
    <div className="group">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block overflow-hidden rounded-md relative">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-[230px] w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {showSpecialTag && (
          <div className="absolute top-2 left-2">
            <div className="bg-[#d80a4e] text-white px-2 py-1 rounded text-xs font-semibold">
              Special
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="pt-1 relative h-20 overflow-hidden">
        {/* Default Content */}
        <div className="transition-all duration-700 ease-out transform group-hover:translate-y-[-80px] group-hover:opacity-0">
          <Link to={`/product/${product._id}`}>
            <h4 className="text-base font-medium text-black mb-0 hover:text-[#d80a4e]">
              {product.name}
            </h4>
          </Link>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-black">
              ₹{product.discountPrice}
            </span>
            <span className="text-sm text-gray-500">
              {product.weight}g
            </span>
          </div>
        </div>

        {/* Hover Content */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out transform translate-y-[80px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <button 
            onClick={handleAddToCart}
            className="text-[#d80a4e] font-semibold text-lg hover:text-[#b8083e] transition-colors flex items-center gap-1 underline underline-offset-4"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;