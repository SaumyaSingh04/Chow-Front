import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { FaTruck, FaShieldAlt, FaCreditCard, FaHeadset, FaGift, FaBox, FaStar, FaSmile, FaFire, FaTags, FaCrown, FaMagic, FaFolder } from "react-icons/fa";
import ProductCard from "../../components/ProductCard.jsx";

const Home = () => {
  const { fetchItems, getFeaturedItems, getSubcategories, fetchCategories, items, categories, loading } = useApi();
  const [featured, setFeatured] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const load = async () => {
      await fetchItems();
      await fetchCategories();
      setFeatured(await getFeaturedItems("popular"));
      const subcats = await getSubcategories();
      setSubcategories(Array.isArray(subcats) ? subcats : subcats?.subcategories || []);
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = items.filter(item => {
        const itemCategories = Array.isArray(item.categories) ? item.categories : [item.category];
        return itemCategories.some(cat => {
          const catId = typeof cat === 'object' ? cat._id : cat;
          return catId === selectedCategory;
        });
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items.slice(0, 8));
    }
  }, [items, selectedCategory]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-14 w-14 border-b-4 border-red-600 rounded-full" />
      </div>
    );
  }

  return (
    <main className="bg-black">

      {/* ================= HERO ================= */}
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CATEGORIES */}
          <div className="lg:col-span-2 bg-white rounded-lg p-4 h-fit">
            <h4 className="font-semibold mb-3 text-[#d80a4e] flex items-center">
              <FaFolder className="mr-2" /> Categories
            </h4>
            {subcategories.slice(0, 5).map((subcat, i) => {
              const icons = [<FaStar />, <FaGift />, <FaBox />, <FaSmile />, <FaFire />];
              return (
                <Link 
                  key={subcat._id} 
                  to={`/shop?subcategory=${subcat._id}`}
                  className="flex items-center gap-2 text-sm py-2 px-2 hover:bg-pink-50 hover:text-[#d80a4e] transition-colors cursor-pointer rounded"
                >
                  <span className="text-[#d80a4e] text-sm">{icons[i] || <FaFolder />}</span>
                  {subcat.name}
                </Link>
              );
            })}
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="space-y-1 text-sm text-black font-bold">
                <Link to="/specials?filter=value-of-day" className="flex items-center gap-2 py-1 hover:text-[#d80a4e] cursor-pointer">
                  <FaTags className="text-[#d80a4e] text-xs" />Value of the Day
                </Link>
                <Link to="/specials?filter=top-100" className="flex items-center gap-2 py-1 hover:text-[#d80a4e] cursor-pointer">
                  <FaCrown className="text-[#d80a4e] text-xs" />Top 100 Offers
                </Link>
                <Link to="/specials?filter=new-arrival" className="flex items-center gap-2 py-1 hover:text-[#d80a4e] cursor-pointer">
                  <FaMagic className="text-[#d80a4e] text-xs" />New Arrival
                </Link>
              </div>
            </div>
          </div>

          {/* MAIN SLIDER */}
          <div className="lg:col-span-7 relative rounded-lg overflow-hidden h-[420px]">
            <img
              src="/src/assets/ban1.jpg"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" />
            <div className="absolute inset-0 p-10 flex flex-col justify-center animate-fade-in">
              <p className="text-pink-500 mb-2 animate-fade-in-delay-1">Deliciously Crafted Treats</p>
              <h1 className="text-white text-4xl font-bold animate-fade-in-delay-2">
                Premium Sweets <br />
                <span className="text-pink-500">& Exquisite</span> Flavors.
              </h1>
              <Link
                to="/shop"
                className="mt-6 bg-white text-black px-6 py-3 w-fit rounded animate-fade-in-delay-3 hover:bg-gray-100 transition-colors"
              >
                Shop Now →
              </Link>
            </div>
          </div>

          {/* RIGHT BANNERS */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="relative rounded-lg overflow-hidden">
              <img src="/src/assets/compressedcard1.jpg" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-sm font-medium text-center px-4">Freshly Sweet Made, Every Day...</p>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden">
              <img src="/src/assets/compressedcard2.jpg" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-sm font-medium text-center px-4">Freshly Sweet Made, Every Day...</p>
              </div>
            </div>        
            </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-[1700px] mx-auto px-6 pb-10">
        <div className="grid md:grid-cols-4 gap-6 text-white">
          {[
            [<FaTruck />, "Free shipping", "Free shipping orders under 5KM"],
            [<FaShieldAlt />, "Secured Shipping", "No Damage Packed Shipping"],
            [<FaCreditCard />, "Secured Payments", "All major credit cards"],
            [<FaHeadset />, "Customer Service", "Top notch service"],
          ].map((f, i) => (
            <div key={i} className="border border-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <div className="text-[#d80a4e] text-xl">{f[0]}</div>
                <h4 className="font-semibold">{f[1]}</h4>
              </div>
              <p className="text-sm text-gray-400">{f[2]}</p>
            </div>
          ))}
        </div>
      </section>

     {/* ================= POPULAR SWEETS ================= */}
<section className="bg-white py-10">
  <div className="max-w-[1400px] mx-auto px-6">

    {/* Header */}
    <div className="flex justify-between items-end mb-10">
      <h2 className="text-4xl font-bold text-black">
        {categories[0]?.name || "Popular"}{" "}
        <span className="text-[#d80a4e] underline underline-offset-4">
          {categories[1]?.name || "Sweets"}
        </span>
      </h2>

      <div className="flex gap-10 text-[15px] font-medium">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`${!selectedCategory ? 'text-[#d80a4e] underline underline-offset-4' : 'text-black hover:text-[#d80a4e]'}`}
        >
          All
        </button>
        {categories.slice(0, 3).map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            className={`${selectedCategory === category._id ? 'text-[#d80a4e] underline underline-offset-4' : 'text-black hover:text-[#d80a4e]'}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>

    {/* Products Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {filteredItems.map(p => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>

  </div>
</section>
      {/* ================= EXCLUSIVE SWEET DEALS ================= */}
<section className="bg-[#f7efe9] ">
  <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

    {/* LEFT CONTENT */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#d80a4e] font-bold text-lg">₹49.00</span>
        <span className="line-through text-gray-400">₹59.00</span>
      </div>

      <h2 className="text-4xl font-bold mb-4">
        Exclusive Sweet Deals
      </h2>

      <p className="text-gray-600 max-w-xl mb-6 leading-relaxed">
        Indulge in our premium selection of sweets, crafted with the finest
        ingredients to offer you a luxurious taste experience. Our special
        deals bring you the best of our collection at irresistible prices.
        Perfect for celebrations, gifts, or simply treating yourself to the
        finest sweets available. Don’t miss out on these limited-time offers!
      </p>

      {/* PROGRESS BAR */}
      <div className="w-full h-1 bg-gray-200 rounded mb-6">
        <div className="w-1/3 h-full bg-[#d80a4e] rounded" />
      </div>

      {/* COUNTDOWN */}
      <div className="flex gap-4 items-center">
        {[
          ["0", "Days"],
          ["0", "Hour"],
          ["00", "Minute"],
          ["00", "Second"],
        ].map((t, i) => (
          <div
            key={i}
            className="bg-white w-20 h-20 rounded-lg flex flex-col items-center justify-center shadow"
          >
            <span className="text-xl font-bold">{t[0]}</span>
            <span className="text-xs text-gray-500">{t[1]}</span>
          </div>
        ))}

        <p className="text-sm text-gray-500 ml-4 max-w-[120px]">
          Remains until the end of the offer
        </p>
      </div>
    </div>

    {/* RIGHT VIDEO */}
    <div className="relative  overflow-hidden">
      <img
        src="/src/assets/Screenshot 2025-12-16 at 21.07.41.png"
        alt="Chowdhry Sweet House"
        className="w-full h-[420px] object-cover"
      />
      <button
        onClick={() => setShowVideo(true)}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg text-xl">
          ▶
        </div>
      </button>
    </div>
    {showVideo && (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        <div className="w-[90%] max-w-3xl aspect-video bg-black relative">
          <button
            onClick={() => setShowVideo(false)}
            className="absolute -top-10 right-0 text-white text-xl"
          >
            ✕
          </button>
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/FhlsxCf1aOU?autoplay=1"
            title="Chowdhry Sweet House Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )}

  </div>
</section>

    </main>
  );
};

export default Home;
