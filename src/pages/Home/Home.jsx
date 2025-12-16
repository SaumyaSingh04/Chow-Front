import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";

const Home = () => {
  const { fetchItems, getFeaturedItems, items, loading } = useApi();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const load = async () => {
      await fetchItems();
      setFeatured(await getFeaturedItems("popular"));
    };
    load();
  }, []);

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
          <div className="lg:col-span-2 bg-white rounded-lg p-5">
            <h4 className="font-semibold mb-4 text-[#d80a4e]">Categories</h4>
            {[
              "Customized",
              "Gift Boxes",
              "Hampers",
              "Box of Smiles",
              "Our Specials",
            ].map((c, i) => (
              <p key={i} className="text-sm py-2 border-b last:border-0">
                {c}
              </p>
            ))}
          </div>

          {/* MAIN SLIDER */}
          <div className="lg:col-span-7 relative rounded-lg overflow-hidden h-[420px]">
            <img
              src="/assets/img/slider/banner-1.jpg"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 p-10 flex flex-col justify-center">
              <p className="text-pink-500 mb-2">Deliciously Crafted Treats</p>
              <h1 className="text-white text-4xl font-bold">
                Premium Sweets <br />
                <span className="text-pink-500">& Exquisite</span> Flavors.
              </h1>
              <Link
                to="/shop"
                className="mt-6 bg-white text-black px-6 py-3 w-fit rounded"
              >
                Shop Now →
              </Link>
            </div>
          </div>

          {/* RIGHT BANNERS */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <img src="/assets/img/banner/banner-01.jpg" className="rounded-lg" />
            <img src="/assets/img/banner/banner-02.jpg" className="rounded-lg" />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-[1400px] mx-auto px-6 pb-10">
        <div className="grid md:grid-cols-4 gap-6 text-white">
          {[
            ["Free shipping", "Free shipping orders under 5KM"],
            ["Secured Shipping", "No Damage Packed Shipping"],
            ["Secured Payments", "All major credit cards"],
            ["Customer Service", "Top notch service"],
          ].map((f, i) => (
            <div key={i} className="border border-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold">{f[0]}</h4>
              <p className="text-sm text-gray-400 mt-1">{f[1]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= POPULAR SWEETS ================= */}
      <section className="bg-white py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              Popular <span className="text-pink-600">Sweets</span>
            </h2>
            <div className="flex gap-6 text-sm">
              <span className="text-pink-600 font-semibold">All</span>
              <span>Gift</span>
              <span>Test Cat</span>
              <span>Popular</span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {(featured.length ? featured : items).slice(0, 4).map(p => (
              <div key={p._id} className="border rounded-lg overflow-hidden">
                <img
                  src={p.images?.[0]}
                  className="h-44 w-full object-cover"
                />
                <div className="p-4">
                  <h4 className="text-sm font-semibold">{p.name}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">₹{p.price}</span>
                    <button className="text-pink-600 text-sm font-medium">
                      Add To Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ================= EXCLUSIVE SWEET DEALS ================= */}
<section className="bg-[#f7efe9] py-20">
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
    <div className="relative rounded-xl overflow-hidden">
      <img
        src="/assets/img/video/store.jpg"
        alt="Chowdhry Sweet House"
        className="w-full h-[420px] object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
          ▶
        </div>
      </div>
    </div>

  </div>
</section>

    </main>
  );
};

export default Home;
