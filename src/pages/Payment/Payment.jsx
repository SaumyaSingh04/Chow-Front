import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../context/ApiContext';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const Payment = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { createOrder, addUserAddress, getUserAddresses, service } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({ distance: 0, deliveryFee: 0 });

  useEffect(() => {
    const savedDeliveryInfo = localStorage.getItem('deliveryInfo');
    if (savedDeliveryInfo) {
      setDeliveryInfo(JSON.parse(savedDeliveryInfo));
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const billingDetails = JSON.parse(localStorage.getItem('billingDetails') || '{}');
      
      // Check if address already exists
      const userAddresses = await getUserAddresses(user._id || user.id);
      const addresses = userAddresses.addresses || userAddresses.address || [];
      
      const existingAddress = addresses.find(addr => 
        addr.firstName === billingDetails.firstName &&
        addr.lastName === billingDetails.lastName &&
        addr.street === billingDetails.address &&
        addr.city === billingDetails.city &&
        addr.state === billingDetails.state &&
        addr.postcode === billingDetails.postcode &&
        addr.phone === billingDetails.phone
      );
      
      let addressId;
      
      if (existingAddress) {
        addressId = existingAddress._id;
      } else {
        const addressData = {
          addressType: billingDetails.addressType || 'delivery',
          firstName: billingDetails.firstName,
          lastName: billingDetails.lastName,
          street: billingDetails.address,
          apartment: billingDetails.apartment || '',
          city: billingDetails.city,
          state: billingDetails.state,
          postcode: billingDetails.postcode,
          email: billingDetails.email,
          phone: billingDetails.phone,
          orderNotes: billingDetails.orderNotes || ''
        };
        
        const newAddressResponse = await addUserAddress(user._id || user.id, addressData);
        addressId = newAddressResponse.address?._id || newAddressResponse.addressId || newAddressResponse._id;
      }
      
      if (!addressId) {
        throw new Error('Failed to get address ID');
      }
      
      const totalAmount = getCartTotal() * 1.05 + deliveryInfo.deliveryFee;
      
      // Create Razorpay order
      const razorpayOrder = await service.post('/api/payment/create-order', {
        amount: totalAmount,
        currency: 'INR'
      });

      const options = {
        key: 'rzp_test_o05Pgdf286j2Pl',
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: 'Chowdhry',
        description: 'Order Payment',
        order_id: razorpayOrder.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            await service.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // Create order after successful payment
            const orderData = {
              userId: user._id || user.id,
              addressId: addressId,
              items: cartItems.map(item => ({
                itemId: item._id,
                quantity: item.quantity,
                price: item.price
              })),
              totalAmount: totalAmount,
              distance: deliveryInfo.distance,
              deliveryFee: deliveryInfo.deliveryFee,
              status: 'pending',
              paymentStatus: 'paid',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            };

            await createOrder(orderData);
            alert('Payment successful! Order placed.');
            clearCart();
            
            // Clean up localStorage
            localStorage.removeItem('billingDetails');
            localStorage.removeItem('deliveryInfo');
            
            navigate('/orders');
          } catch (error) {
            alert('Payment verification failed. Please contact support.');
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: `${billingDetails.firstName} ${billingDetails.lastName}`,
          email: billingDetails.email,
          contact: billingDetails.phone
        },
        theme: {
          color: '#d80a4e'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Failed to initiate payment. Please try again.');
      console.error('Payment initiation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb currentPage="Payment" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          
          {/* Left - Payment Methods */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
            
            <div className="space-y-4">
              {/* Razorpay Payment */}
              <div className="border-2 border-[#d80a4e] rounded-lg p-6 bg-pink-50">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-lg font-semibold text-[#d80a4e]">Secure Payment with Razorpay</span>
                </div>
                <div className="text-center text-gray-600 mb-4">
                  <p>Pay securely using Credit/Debit Card, UPI, Net Banking, or Wallet</p>
                </div>
                <div className="flex justify-center space-x-4 text-sm text-gray-500">
                  <span>💳 Cards</span>
                  <span>📱 UPI</span>
                  <span>🏦 Net Banking</span>
                  <span>💰 Wallets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div className="border-2 border-pink-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>INR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>INR {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>INR {(getCartTotal() * 0.05).toFixed(2)}</span>
                </div>
                {deliveryInfo.distance > 0 && (
                  <>
                    <div className="flex justify-between text-blue-600">
                      <span>Distance</span>
                      <span>{deliveryInfo.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>INR {deliveryInfo.deliveryFee.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Total Amount</span>
                  <span>INR {(getCartTotal() * 1.05 + deliveryInfo.deliveryFee).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-6 bg-[#d80a4e] text-white py-3 rounded font-semibold hover:bg-[#b8083e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;