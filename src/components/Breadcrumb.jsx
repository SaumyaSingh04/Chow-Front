import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ currentPage }) => {
  return (
    <div className=" py-4 md:py-8 min-h-[80px] md:min-h-[100px] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex items-start justify-between mb-2 md:mb-4">
          <div className="flex items-center text-xs md:text-sm">
            <Link to="/" className="text-gray-600 hover:text-[#d80a4e]">Home</Link>
            <span className="mx-1 md:mx-2 text-gray-400">/</span>
            <span className="text-gray-800">{currentPage}</span>
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold">{currentPage}</h1>
      </div>
      <img src="/src/assets/logo.png" alt="Chowdhry Sweet House" className="h-20 md:h-40 absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2" />
    </div>
  );
};

export default Breadcrumb;