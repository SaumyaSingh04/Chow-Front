import React from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb.jsx";
import amavatBarfi from "../../assets/Amavat Barfi (1).jpg";
import chocolateBarfi from "../../assets/Chocolate Fruits Barfi (1).jpg";

const About = () => {
  return (
    <div className="bg-white">
       <Breadcrumb currentPage="About" />
      {/* Top Images */}
      <div className="max-w-7xl mx-auto px-6 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <img
            src={amavatBarfi}
            alt="Sweet"
            className="w-full h-90 object-cover"
          />
          <img
            src={chocolateBarfi}
            alt="Sweet"
            className="w-full h-90 object-cover"
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
          <div className=" p-6 rounded-lg mb-6">
            <div className="space-y-4 text-gray-700">
              <div>
                <div className="flex items-center justify-center gap-2 text-[#d80a4e] font-semibold mb-2">
                  <span className="text-lg">📍</span>
                  <span>Visit Us:</span>
                </div>
                <p>Vijay Chowk, in front of Vijay Talkies, Golghar, Gorakhpur</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-2 text-[#d80a4e] font-semibold mb-2">
                  <span className="text-lg">📞</span>
                  <span>Call Now:</span>
                </div>
                <p>075250 25100</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-2 text-[#d80a4e] font-semibold mb-2">
                  <span className="text-lg">📲</span>
                  <span>Order Online:</span>
                </div>
                <p>Swiggy | Zomato</p>
              </div>
              
              <p className="text-[#d80a4e] font-semibold mt-4">
                Taste the tradition, indulge in excellence! 🍬✨
              </p>
            </div>
          </div>
          
          <div className="space-x-4">
            <Link to="/contact" className="bg-[#d80a4e] text-white px-6 py-3 rounded hover:bg-[#b8083e] transition-colors">
              Contact Us
            </Link>
            <Link to="/shop" className="bg-gray-800 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
