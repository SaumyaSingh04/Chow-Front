import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../context/ApiContext';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const Payment = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { createOrder, addUserAddress } = useApi();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    if (paymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
      alert('Please fill all card details');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const billingDetails = JSON.parse(localStorage.getItem('billingDetails') || '{}');
      
      // First create/get address ID
      let addressId;
      if (billingDetails && Object.keys(billingDetails).length > 0) {
        const addressData = {
          addressType: billingDetails.addressType || 'home',
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
        
        const addressResponse = await addUserAddress(user._id || user.id, addressData);
        console.log('Address response:', addressResponse);
        // Extract address ID from response - it's in an array
        if (addressResponse.address && Array.isArray(addressResponse.address)) {
          addressId = addressResponse.address[0]._id;
        } else if (addressResponse._id) {
          addressId = addressResponse._id;
        } else {
          throw new Error('Failed to get address ID');
        }
      } else {
        // Use default address ID or create a temporary one
        addressId = '000000000000000000000000'; // Placeholder
      }
      
      const orderData = {
        userId: user._id || user.id,
        addressId: addressId,
        items: cartItems.map(item => ({
          itemId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal() * 1.05,
        status: 'pending',
        paymentStatus: 'pending'
      };

      console.log('Final order data being sent:', orderData);
      console.log('User data:', user);
      console.log('Cart items:', cartItems);
      console.log('Address ID:', addressId);

      const orderResponse = await createOrder(orderData);
      console.log('Order creation response:', orderResponse);
      alert('Payment successful! Order placed.');
      clearCart();
      navigate('/orders');
    } catch (error) {
      alert('Failed to place order. Please try again.');
      console.error('Order creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb currentPage="Payment" />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left - Payment Methods */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
            
            <div className="space-y-4">
              {/* Credit/Debit Card */}
              <div className="border rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">Credit/Debit Card</span>
                </label>
                
                {paymentMethod === 'card' && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                      className="w-full p-3 border rounded focus:outline-none focus:border-[#d80a4e]"
                    />
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardDetails.cardName}
                      onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                      className="w-full p-3 border rounded focus:outline-none focus:border-[#d80a4e]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                        className="p-3 border rounded focus:outline-none focus:border-[#d80a4e]"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                        className="p-3 border rounded focus:outline-none focus:border-[#d80a4e]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* UPI */}
              <div className="border rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">UPI Payment</span>
                </label>
              </div>

              {/* Net Banking */}
              <div className="border rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">Net Banking</span>
                </label>
              </div>

              {/* Cash on Delivery */}
              <div className="border rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">Cash on Delivery</span>
                </label>
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
                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Total Amount</span>
                  <span>INR {(getCartTotal() * 1.05).toFixed(2)}</span>
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