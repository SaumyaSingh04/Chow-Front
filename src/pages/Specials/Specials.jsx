import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';

const Specials = () => {
  const { fetchCategories, getFeaturedItems, getItemsByCategory, categories, loading } = useApi();
  const [specialProducts, setSpecialProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      const featured = await getFeaturedItems('special');
      setSpecialProducts(featured);
    };
    loadData();
  }, []);

  const handleCategoryFilter = async (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      const featured = await getFeaturedItems('special');
      setSpecialProducts(featured);
    } else {
      const categoryItems = await getItemsByCategory(catId);
      setSpecialProducts(categoryItems);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-white">Loading Specials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="bg-red-600 text-white p-4">
                  <h3 className="font-bold flex items-center">
                    <i className="fas fa-bars mr-2"></i>
                    Categories
                  </h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    <li 
                      onClick={() => handleCategoryFilter('all')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        activeCategory === 'all' 
                          ? 'text-red-600 bg-red-50' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <i className="fas fa-star mr-3 text-red-500"></i>
                      <span>All Specials</span>
                    </li>
                    {categories.map((category) => (
                      <li 
                        key={category._id}
                        onClick={() => handleCategoryFilter(category._id)}
                        className={`flex items-center p-2 rounded cursor-pointer ${
                          activeCategory === category._id 
                            ? 'text-red-600 bg-red-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <i className="fas fa-gift mr-3 text-red-500"></i>
                        <span>{category.name}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="hover:text-red-600 cursor-pointer">Value of the Day</div>
                      <div className="hover:text-red-600 cursor-pointer">Top 100 Offers</div>
                      <div className="hover:text-red-600 cursor-pointer">New Arrivals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Hero Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg relative overflow-hidden h-96 shadow-lg">
                <div className="absolute inset-0">
                  <img 
                    src="/assets/img/slider/banner-1.jpg" 
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                  <h4 className="text-red-600 text-sm mb-2 font-medium">Deliciously Crafted Treats</h4>
                  <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Premium Sweets<br/>
                    <span className="text-yellow-400">& Exquisite</span><br/>
                    Flavors
                  </h3>
                  <Link 
                    to="/shop" 
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 inline-flex items-center w-fit transition-colors"
                  >
                    Shop Now <i className="fas fa-long-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg relative overflow-hidden shadow-lg">
                <img 
                  src="/assets/img/product/home-one/product-1.jpg" 
                  alt="Sweet Product"
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <p className="text-red-600 text-sm mb-2 font-medium">Freshly Made Sweets</p>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    Every Day, Just for You
                  </h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg relative overflow-hidden shadow-lg">
                <img 
                  src="/assets/img/product/home-one/product-2.jpg" 
                  alt="Sweet Product"
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <p className="text-green-600 text-sm mb-2 font-medium">Freshly Made Sweets</p>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    Every Day, Just for You
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
              <i className="fas fa-shipping-fast text-2xl mb-2"></i>
              <h4 className="font-semibold">Free shipping</h4>
              <p className="text-sm text-gray-300">On orders over ₹500</p>
            </div>
            <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
              <i className="fas fa-shield-alt text-2xl mb-2"></i>
              <h4 className="font-semibold">Secured Shopping</h4>
              <p className="text-sm text-gray-300">Safe & secure checkout</p>
            </div>
            <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
              <i className="fas fa-credit-card text-2xl mb-2"></i>
              <h4 className="font-semibold">Secured Payments</h4>
              <p className="text-sm text-gray-300">Multiple payment options</p>
            </div>
            <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
              <i className="fas fa-headset text-2xl mb-2"></i>
              <h4 className="font-semibold">Customer Service</h4>
              <p className="text-sm text-gray-300">24/7 support available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">
              Popular <span className="text-red-600">Sweets</span>
            </h2>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex space-x-6 flex-wrap">
              <button 
                onClick={() => handleCategoryFilter('all')}
                className={`font-medium pb-1 ${
                  activeCategory === 'all' 
                    ? 'text-red-600 border-b-2 border-red-600' 
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                All
              </button>
              {categories.slice(0, 4).map((category) => (
                <button 
                  key={category._id}
                  onClick={() => handleCategoryFilter(category._id)}
                  className={`font-medium pb-1 ${
                    activeCategory === category._id 
                      ? 'text-red-600 border-b-2 border-red-600' 
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {specialProducts.length > 0 ? specialProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.images?.[0] || '/assets/img/product/home-one/product-1.jpg'} 
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Special
                    </div>
                  </div>
                  {product.discount && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {product.discount}% OFF
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                      Add To Cart
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No special products available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Exclusive Deals Section */}
      <section className="py-16 bg-pink-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Exclusive Sweet Deals</h2>
              <p className="text-gray-600 mb-8">
                Indulge in our premium selection of sweets, crafted with the finest ingredients. 
                Enjoy our a luxurious taste experience. Our special deals bring you the best 
                of our collection at irresistible prices. Perfect for celebrations, gifts, or simply 
                treating yourself to the finest sweets available. Don't miss out on these limited 
                time offers!
              </p>
              
              <div className="flex space-x-4 text-center mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <div className="text-sm text-gray-600">Hours</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-red-600">00</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-red-600">00</div>
                  <div className="text-sm text-gray-600">Seconds</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">Remains until the end of the offer</p>
            </div>
            
            <div className="relative">
              <img 
                src="/assets/img/banner/about-banner-1.jpg" 
                alt="Chowdhry Store"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white bg-opacity-90 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all">
                  <i className="fas fa-play text-red-600 text-xl ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Specials;