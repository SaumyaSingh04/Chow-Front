import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { FaTruck, FaShieldAlt, FaCreditCard, FaHeadset, FaGift, FaBox, FaStar, FaSmile, FaFire, FaTags, FaCrown, FaMagic, FaFolder } from "react-icons/fa";
import ProductCard from "../../components/ProductCard.jsx";
import ban1 from "../../assets/ban1.jpg";
import compressedcard1 from "../../assets/compressedcard1.jpg";
import compressedcard2 from "../../assets/compressedcard2.jpg";

const Home = () => {
  const { fetchItems, getFeaturedItems, getSubcategories, fetchCategories, getActiveSweetDeal, items, categories } = useApi();
  const [featured, setFeatured] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sweetDeal, setSweetDeal] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (dataLoaded) {
      setPageLoading(false);
      return;
    }
    
    const load = async () => {
      const [itemsData, categoriesData, featuredData, subcatsData, activeDealData] = await Promise.all([
        fetchItems(),
        fetchCategories(),
        getFeaturedItems("popular"),
        getSubcategories(),
        getActiveSweetDeal()
      ]);
      setFeatured(featuredData);
      const processedSubcats = Array.isArray(subcatsData) ? subcatsData : subcatsData?.subcategories || [];
      setSubcategories(processedSubcats);
      setSweetDeal(activeDealData);
      setDataLoaded(true);
      setPageLoading(false);
    };
    load();
  }, [dataLoaded]);

  useEffect(() => {
    if (sweetDeal?.endDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(sweetDeal.endDate).getTime();
        const startTime = new Date(sweetDeal.createdAt).getTime();
        const totalDuration = endTime - startTime;
        const distance = endTime - now;

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
          setProgressPercentage(Math.min(100, Math.max(0, (distance / totalDuration) * 100)));
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setProgressPercentage(0);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sweetDeal]);

  return (
    <main className="bg-black relative">

      {/* ================= HERO ================= */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">

          {/* CATEGORIES - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-2 bg-white rounded-lg p-4 h-fit">
            <h4 className="font-semibold mb-3 text-[#d80a4e] flex items-center text-lg">
              <FaFolder className="mr-2" /> Categories
            </h4>
            {subcategories.slice(0, 5).map((subcat, i) => {
              const icons = [<FaStar />, <FaGift />, <FaBox />, <FaSmile />, <FaFire />];
              return (
                <button 
                  key={subcat._id} 
                  onClick={() => {
                    setSelectedSubcategory(subcat._id);
                    setTimeout(() => {
                      // Find the category that contains this subcategory
                      const targetCategory = categories.find(cat => 
                        subcat.categories?.some(subcatCat => 
                          (typeof subcatCat === 'object' ? subcatCat._id : subcatCat) === cat._id
                        )
                      );
                      if (targetCategory) {
                        const categorySection = document.getElementById(`category-${targetCategory._id}`);
                        if (categorySection) {
                          categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }, 100);
                  }}
                  className="flex items-center gap-2 text-base py-2 px-2 hover:bg-pink-50 hover:text-[#d80a4e] transition-colors cursor-pointer rounded w-full text-left"
                >
                  <span className="text-[#d80a4e] text-base">{icons[i] || <FaFolder />}</span>
                  {subcat.name}
                </button>
              );
            })}
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="space-y-1 text-base text-black font-bold">
                <Link to="/specials?filter=value-of-day" className="flex items-center gap-2 py-1 hover:text-[#d80a4e] cursor-pointer">
                  <FaTags className="text-[#d80a4e] text-sm" />Value of the Day
                </Link>
                <Link to="/specials?filter=top-100" className="flex items-center gap-2 py-1 hover:text-[#d80a4e] cursor-pointer">
                  <FaCrown className="text-[#d80a4e] text-sm" />Top 100 Offers
                </Link>
                <Link to="/specials?filter=new-arrival" className="flex items-center gap-2 py-1 hover:text-[#d80a4e] cursor-pointer">
                  <FaMagic className="text-[#d80a4e] text-sm" />New Arrival
                </Link>
              </div>
            </div>
          </div>

          {/* MAIN SLIDER */}
          <div className="lg:col-span-7 relative rounded-lg overflow-hidden h-[250px] sm:h-[350px] lg:h-[420px]">
            <img
              src={ban1}
              className="w-full h-full object-cover brightness-90"
            />
            <div className="absolute inset-0" />
            <div className="absolute inset-0 p-4 sm:p-6 lg:p-10 flex flex-col justify-center animate-fade-in">
              <p className="text-pink-500 mb-2 text-base sm:text-lg animate-fade-in-delay-1">Deliciously Crafted Treats</p>
              <h1 className="text-white text-2xl sm:text-3xl lg:text-5xl font-bold animate-fade-in-delay-2">
                Premium Sweets <br />
                <span className="text-pink-500">& Exquisite</span> Flavors.
              </h1>
              <Link
                to="/shop"
                className="mt-4 sm:mt-6 bg-white text-black px-4 sm:px-6 py-2 sm:py-3 w-fit rounded text-base sm:text-lg animate-fade-in-delay-3 hover:bg-gray-100 transition-colors"
              >
                Shop Now →
              </Link>
            </div>
          </div>

          {/* RIGHT BANNERS - Stack on mobile */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-3 sm:gap-6">
            <div className="relative rounded-lg overflow-hidden flex-1 h-[120px] sm:h-[150px] lg:h-auto">
              <img src={compressedcard1} className="w-full h-full object-cover brightness-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-sm sm:text-base font-medium text-center px-2 sm:px-4">Freshly Sweet Made, Every Day...</p>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden flex-1 h-[120px] sm:h-[150px] lg:h-auto">
              <img src={compressedcard2} className="w-full h-full object-cover brightness-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-sm sm:text-base font-medium text-center px-2 sm:px-4">Freshly Sweet Made, Every Day...</p>
              </div>
            </div>        
            </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-[1700px] mx-auto px-3 sm:px-6 pb-6 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-white">
          {[
            [<FaTruck />, "Free shipping", "Free shipping orders under 5KM"],
            [<FaShieldAlt />, "Secured Shipping", "No Damage Packed Shipping"],
            [<FaCreditCard />, "Secured Payments", "All major credit cards"],
            [<FaHeadset />, "Customer Service", "Top notch service"],
          ].map((f, i) => (
            <div key={i} className="border border-gray-700 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <div className="text-[#d80a4e] text-xl sm:text-2xl">{f[0]}</div>
                <h4 className="font-semibold text-base sm:text-lg">{f[1]}</h4>
              </div>
              <p className="text-sm sm:text-base text-gray-400">{f[2]}</p>
            </div>
          ))}
        </div>
      </section>

    {/* ================= Dynamic Category Sections ================= */}
{categories.map((category) => {
  let categoryItems = items
    .filter(item => {
      const itemCategories = Array.isArray(item.categories)
        ? item.categories
        : [item.category];
      return itemCategories.some(cat =>
        (typeof cat === 'object' ? cat._id : cat) === category._id
      );
    });

  // Filter by subcategory if one is selected
  if (selectedSubcategory) {
    const filteredBySubcategory = categoryItems.filter(item => {
      const itemSubcategories = Array.isArray(item.subcategories) ? item.subcategories : [];
      return itemSubcategories.some(subcat => {
        const subcatId = typeof subcat === 'object' ? subcat._id : subcat;
        return subcatId === selectedSubcategory;
      });
    });
    
    // Only apply subcategory filter if there are matching products
    if (filteredBySubcategory.length > 0) {
      categoryItems = filteredBySubcategory;
    }
  }

  categoryItems = categoryItems.slice(0, 8);

  const categorySubcategories = subcategories.filter(
    sub => {
      // Handle both populated and non-populated categories
      const subCategories = Array.isArray(sub.categories) ? sub.categories : [];
      return subCategories.some(cat => 
        (typeof cat === 'object' ? cat._id : cat) === category._id
      );
    }
  );

  if (categoryItems.length === 0) return null;

  return (
    <section key={category._id} className="bg-white py-4 sm:py-6" id={`category-${category._id}`}>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6">

        {/* Category Title and Subcategories */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#d80a4e] mb-2 sm:mb-0">
            {category.name}
          </h2>
          
          {categorySubcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categorySubcategories.map((subcategory) => (
                <button
                  key={subcategory._id}
                  onClick={() => setSelectedSubcategory(selectedSubcategory === subcategory._id ? null : subcategory._id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border 
                             text-xs sm:text-sm md:text-base font-medium
                             transition whitespace-nowrap ${
                               selectedSubcategory === subcategory._id
                                 ? 'border-[#d80a4e] text-[#d80a4e] bg-pink-50'
                                 : 'text-gray-700 hover:border-[#d80a4e] hover:text-[#d80a4e]'
                             }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" id={`products-${category._id}`}>
            {categoryItems.map(product => (
              <div
                key={product._id}
                className="min-w-full sm:min-w-[260px] lg:min-w-[300px] flex-shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          {categoryItems.length > 1 && (
            <>
              <button
                onClick={() => {
                  const container = document.getElementById(`products-${category._id}`);
                  const itemWidth = container.querySelector('div').offsetWidth + 16; // +16 for gap
                  container.scrollBy({ left: -itemWidth, behavior: 'smooth' });
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 text-xl p-2 rounded-full shadow-md z-10"
              >
                ‹‹
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById(`products-${category._id}`);
                  const itemWidth = container.querySelector('div').offsetWidth + 16; // +16 for gap
                  container.scrollBy({ left: itemWidth, behavior: 'smooth' });
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 text-xl p-2 rounded-full shadow-md z-10"
              >
                ››
              </button>
            </>
          )}
        </div>


      </div>
    </section>
  );
})}

      {sweetDeal && (
      <section className="bg-[#f7efe9] py-6 sm:py-12">
  <div className="max-w-[1400px] mx-auto px-3 sm:px-6 grid lg:grid-cols-2 gap-6 sm:gap-12 items-center">

    {/* LEFT CONTENT */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#d80a4e] font-bold text-lg">₹{sweetDeal.salePrice}</span>
        <span className="line-through text-gray-400">₹{sweetDeal.originalPrice}</span>
      </div>

      <h2 className="text-4xl font-bold mb-4">
        {sweetDeal.title}
      </h2>

      <p className="text-gray-600 max-w-xl mb-6 leading-relaxed">
        {sweetDeal.description}
      </p>

      {/* PROGRESS BAR */}
      <div className="w-full h-1 bg-gray-200 rounded mb-6">
        <div className="h-full bg-[#d80a4e] rounded" style={{width: `${progressPercentage}%`}} />
      </div>

      {/* COUNTDOWN */}
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
        {[
          [timeLeft.days, "Days"],
          [timeLeft.hours, "Hours"],
          [timeLeft.minutes.toString().padStart(2, '0'), "Minutes"],
          [timeLeft.seconds.toString().padStart(2, '0'), "Seconds"],
        ].map((t, i) => (
          <div
            key={i}
            className="bg-white w-14 h-14 sm:w-20 sm:h-20 rounded-lg flex flex-col items-center justify-center shadow"
          >
            <span className="text-base sm:text-xl font-bold">{t[0]}</span>
            <span className="text-xs text-gray-500">{t[1]}</span>
          </div>
        ))}

        <p className="text-xs sm:text-sm text-gray-500 ml-2 sm:ml-4 max-w-[120px]">
          Remains until the end of the offer
        </p>
      </div>
    </div>

    {/* RIGHT VIDEO */}
    <div className="relative overflow-hidden rounded-lg">
      {sweetDeal?.videoUrl && (
        <video
          src={sweetDeal.videoUrl}
          className="w-full h-[250px] sm:h-[350px] lg:h-[420px] object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      )}
    </div>

  </div>
</section>
      )}

    </main>
  );
};

export default Home;