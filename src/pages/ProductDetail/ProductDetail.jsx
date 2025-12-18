import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById } = useApi();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await getItemById(id);
        setProduct(productData.item || productData);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stockQty > 0 && product.status === 'active') {
      addToCart(product, quantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-[#d80a4e] text-white px-6 py-2 rounded-lg hover:bg-[#b8083e]"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb currentPage={product.name} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Media Gallery */}
          <div className="flex gap-4">
            {/* Thumbnail Gallery - Side */}
            <div className="flex flex-col gap-3 w-20">
              {/* Show up to 3 images */}
              {product.images?.slice(0, 3).map((image, index) => (
                <button
                  key={`img-${index}`}
                  onClick={() => {
                    if (selectedImage !== index) {
                      setIsTransitioning(true);
                      setTimeout(() => setSelectedImage(index), 150);
                    }
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${
                    selectedImage === index 
                      ? 'border-[#d80a4e] ring-2 ring-[#d80a4e]/20 shadow-lg' 
                      : 'border-gray-200 hover:border-[#d80a4e]/50 hover:shadow-md'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-110" 
                  />
                </button>
              ))}
              
              {/* Video thumbnail */}
              {product.video && (
                <button
                  onClick={() => {
                    const videoIndex = product.images?.length || 0;
                    if (selectedImage !== videoIndex) {
                      setIsTransitioning(true);
                      setTimeout(() => setSelectedImage(videoIndex), 150);
                    }
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 relative group ${
                    selectedImage === (product.images?.length || 0) 
                      ? 'border-[#d80a4e] ring-2 ring-[#d80a4e]/20 shadow-lg' 
                      : 'border-gray-200 hover:border-[#d80a4e]/50 hover:shadow-md'
                  }`}
                >
                  <img 
                    src={product.images?.[0]} 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-200 group-hover:bg-black/50">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 transition-all duration-200 group-hover:bg-white/30 group-hover:scale-110">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </div>
            
            {/* Main Display */}
            <div className="flex-1 aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-lg border border-gray-200 relative">
              <div className={`w-full h-full transition-all duration-500 ease-in-out ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}>
                {selectedImage < (product.images?.length || 0) ? (
                  <img
                    src={product.images?.[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onLoad={() => setIsTransitioning(false)}
                  />
                ) : product.video ? (
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                    poster={product.images?.[0]}
                    onLoadedData={() => setIsTransitioning(false)}
                  >
                    <source src={product.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p>No media available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {product.isBestRated && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ⭐ Best Rated
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    🔥 Best Seller
                  </span>
                )}
                {product.isOnSale && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    💰 On Sale
                  </span>
                )}
                {product.isPopular && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ⚡ Popular
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3">
                {product.discountPrice ? (
                  <>
                    <p className="text-2xl font-semibold text-[#d80a4e]">₹{product.discountPrice}</p>
                    <p className="text-lg text-gray-500 line-through">₹{product.price}</p>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <p className="text-2xl font-semibold text-[#d80a4e]">₹{product.price}</p>
                )}
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {product.category && (
                <div>
                  <span className="font-medium">Category:</span> {product.category.name || product.category}
                </div>
              )}
              {product.subcategory && (
                <div>
                  <span className="font-medium">Subcategory:</span> {product.subcategory.name || product.subcategory}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Stock:</span>
              {product.stockQty > 0 ? (
                <span className="text-green-600 font-medium">
                  {product.stockQty} items available
                </span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDesc && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-gray-600 leading-relaxed">{product.shortDesc}</p>
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stockQty === 0}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQty || 0, quantity + 1))}
                    disabled={product.stockQty === 0 || quantity >= product.stockQty}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stockQty === 0 || product.status === 'inactive'}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  product.stockQty === 0 || product.status === 'inactive'
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-[#d80a4e] text-white hover:bg-[#b8083e]'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
                <span>
                  {product.stockQty === 0 ? 'Out of Stock' : 
                   product.status === 'inactive' ? 'Unavailable' : 'Add to Cart'}
                </span>
              </button>

              {/* Product Status */}
              {product.status === 'inactive' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ This product is currently inactive and unavailable for purchase.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Long Description - Bottom Section */}
        {product.longDesc && (
          <div className="max-w-6xl mx-auto px-4 py-8 border-t border-gray-200 mt-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Detailed Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{product.longDesc}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;