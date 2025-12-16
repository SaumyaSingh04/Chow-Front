import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-white">
       {/* Breadcrumb */}
       <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between mb-4 relative">
            <div className="flex items-center text-sm">
              <Link to="/" className="text-gray-600 hover:text-[#d80a4e]">Home</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-800">Contact</span>
            </div>
            <img src="/src/assets/logo.png" alt="Chowdhry Sweet House" className="h-40 absolute right-0 top-1/2 transform -translate-y-1/3" />
          </div>
          <h1 className="text-4xl font-bold">Contact Us</h1>
        </div>
      </div>
      {/* Top Images */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <img
            src="/assets/img/product/home-one/product-1.jpg"
            alt="Sweet"
            className="w-full h-72 object-cover"
          />
          <img
            src="/assets/img/product/home-one/product-2.jpg"
            alt="Sweet"
            className="w-full h-72 object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <span className="text-sm text-gray-500 block mb-2">
          About Us
        </span>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
          The Story of Chowdhry Sweet House – A Legacy of Sweetness Since 1970
        </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          In the heart of Gorakhpur, at Vijay Chowk, stands{" "}
          <strong>Chowdhry Sweet House</strong>, a name synonymous with
          tradition, taste, and trust. Since{" "}
          <strong>1970</strong>, this beloved establishment has been serving
          generations with the finest Indian sweets and savory delights,
          making it a cherished part of the city's culinary heritage.
        </p>

        {/* Section */}
        <h3 className="text-lg font-bold text-[#d80a4e] mb-3">
          A Tradition of Authenticity & Quality
        </h3>

        <p className="text-gray-700 mb-6 leading-relaxed">
          From the melt-in-your-mouth <strong>Rajbhog</strong> to the rich,
          creamy <strong>Rasmalai</strong>, every sweet at Chowdhry Sweet
          House is crafted with love and perfection. Our commitment to using{" "}
          <strong>pure ingredients</strong> and maintaining the{" "}
          <strong>highest hygiene standards</strong> has earned us the trust
          of thousands of customers.
        </p>

        {/* Section */}
        <h3 className="text-lg font-bold text-[#d80a4e] mb-3">
          A Culinary Destination Beyond Sweets
        </h3>

        <p className="text-gray-700 mb-6 leading-relaxed">
          More than just a sweet shop, <strong>Chowdhry Sweet House</strong>{" "}
          is a <strong>family-friendly vegetarian restaurant</strong>,
          offering a delightful mix of traditional{" "}
          <strong>North Indian dishes</strong>, snacks, and desserts.
          Whether you’re indulging in a plate of{" "}
          <strong>chaat</strong>, savoring a warm{" "}
          <strong>gulab jamun</strong>, or enjoying a hearty meal, every
          visit here is a flavorful experience.
        </p>

        {/* Section */}
        <h3 className="text-lg font-bold text-[#d80a4e] mb-4">
          Why Gorakhpur Loves Us?
        </h3>

        <ul className="space-y-2 text-gray-700">
          <li>⭐ <strong>Over 50 Years of Excellence</strong></li>
          <li>⭐ <strong>4.4/5 Swiggy | 4.3/5 Zomato | 3.9/5 Justdial</strong></li>
          <li>⭐ <strong>Top Choice for Festivals & Celebrations</strong></li>
          <li>⭐ <strong>Hygienic & Authentic Preparation</strong></li>
        </ul>

        {/* Visit */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-[#d80a4e] font-semibold">
            <span className="text-lg">📍</span>
            <span>Visit Us:</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
