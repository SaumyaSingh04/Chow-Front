import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Breadcrumb from "../../components/Breadcrumb.jsx";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  const subtotal = getCartTotal();
  const taxRate = 0.05; // 5% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user._id) {
      navigate('/account');
      return;
    }
    
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb currentPage="Product Cart" />

      {cartItems.length === 0 ? (
        /* EMPTY CART */
        <div className="flex items-center justify-center py-24 px-6">
          <div className="text-center max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Your Cart is Empty 🍬
            </h2>
            <p className="text-gray-600 mb-8">
              It looks like your cart is missing some sweetness! Explore our
              delightful collection of traditional Indian sweets and add your
              favorites.
            </p>
            <Link
              to="/shop"
              className="bg-[#d80a4e] text-white px-8 py-3 font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        /* CART CONTENT */
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
            
            {/* LEFT – CART TABLE */}
            <div className="lg:col-span-2">
              <div className="border border-gray-200">

                {/* HEADER - Hidden on mobile */}
                <div className="hidden sm:grid grid-cols-7 text-sm font-semibold text-gray-700 border-b px-4 py-3 bg-gray-50">
                  <div>Images</div>
                  <div>Name</div>
                  <div>Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div>Total</div>
                  <div className="text-center">Remove</div>
                </div>

                {/* ROWS */}
                {cartItems.map((item) => (
                  <div key={item._id}>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden border-b p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={item.images?.[0] || item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover border rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">₹{item.price}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex border rounded">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="px-3 py-1 border-r hover:bg-gray-100 text-sm"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="px-3 py-1 border-l hover:bg-gray-100 text-sm"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="text-red-500 hover:text-red-700 text-sm mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden sm:grid grid-cols-7 items-center text-sm px-4 py-5 border-b">
                      {/* IMAGE */}
                      <div>
                        <img
                          src={item.images?.[0] || item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-20 h-20 object-cover border"
                        />
                      </div>

                      {/* NAME */}
                      <div className="font-medium text-gray-800">
                        {item.name}
                      </div>

                      {/* UNIT PRICE */}
                      <div>₹{item.price}</div>

                      {/* QUANTITY */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex border">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="px-3 border-r hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="px-3 border-l hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* TOTAL */}
                      <div>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>

                      {/* REMOVE */}
                      <div className="text-center">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-xl text-gray-500 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT – CART TOTALS */}
            <div className="border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-semibold mb-6 text-gray-800">
                Cart Totals
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span>Subtotal</span>
                  <span>
                    ₹ {getCartTotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span>Tax (5%)</span>
                  <span>
                    ₹ {taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ₹ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="block w-full mt-6 bg-[#d80a4e] text-white py-3 text-center font-semibold hover:bg-[#b8083e] transition"
              >
                Proceed to Checkout
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
