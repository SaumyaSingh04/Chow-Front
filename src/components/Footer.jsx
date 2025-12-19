import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaDribbble,
  FaBehance,
  FaYoutube,
  FaPhoneAlt,
} from "react-icons/fa";
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#f6efeb] text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          
          {/* Logo & Description */}
          <div>
            <img
              src={logo}
              alt="Chowdhry"
              className="w-32 sm:w-40 lg:w-48 mb-4"
            />
            <p className="text-xs sm:text-sm leading-relaxed max-w-xs">
              Experience the delightful fusion of tradition and taste at
              Chowdhry Sweet House. <br /><br />
              Our handcrafted sweets, made with love and the finest
              ingredients, bring you a perfect blend of authentic flavors
              and fresh sweetness. <br /><br />
              Visit us to indulge in the finest sweets and create memorable
              moments.
            </p>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="#">Custom Service</Link></li>
              <li><Link to="#">FAQs</Link></li>
              <li><Link to="#">Ordering Tracking</Link></li>
              <li><Link to="#">Contacts</Link></li>
              <li><Link to="#">About</Link></li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="font-semibold mb-4">My Account</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Terms & Condition</Link></li>
              <li><Link to="#">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Our</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-center gap-2"><FaFacebookF /> Facebook</li>
              <li className="flex items-center gap-2"><FaDribbble /> Dribbble</li>
              <li className="flex items-center gap-2"><FaTwitter /> Twitter</li>
              <li className="flex items-center gap-2"><FaBehance /> Behance</li>
              <li className="flex items-center gap-2"><FaYoutube /> Youtube</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-8 sm:mt-12 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <FaPhoneAlt />
            <span>+91 7525025100</span>
          </div>

          <p className="text-center sm:text-left">
            Copyright 2025 <strong>Chowdhry Sweet House</strong>. All rights
            reserved. Powered by <strong>Shine Infosolutions</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
