import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';



// Загружаем Stripe (замени на свой публичный ключ из .env)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const GET_MY_CART = gql`
  query GetMyCart {
    getMyCart {
      id
      items {
        quantity
        product {
          id
          name
          price
          image
        }
      }
    }
  }
`;

const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent {
    createPaymentIntent {
      clientSecret
      amount
    }
  }
`;

const CREATE_ORDER_AFTER_PAYMENT = gql`
  mutation CreateOrderAfterPayment(
    $paymentIntentId: String!
    $shippingAddress: ShippingAddressInput!
  ) {
    createOrderAfterPayment(
      paymentIntentId: $paymentIntentId
      shippingAddress: $shippingAddress
    ) {
      id
      totalAmount
      status
    }
  }
`;

// Компонент формы оплаты
function CheckoutForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  });

  const { data: cartData, loading: cartLoading } = useQuery(GET_MY_CART);
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);
  const [createOrder] = useMutation(CREATE_ORDER_AFTER_PAYMENT);

  const calculateTotal = () => {
    if (!cartData?.getMyCart?.items) return 0;
    return cartData.getMyCart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      alert('Stripe is not loaded yet. Please wait.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Создаём Payment Intent
      const { data } = await createPaymentIntent();
      const clientSecret = data.createPaymentIntent.clientSecret;

      // 2. Подтверждаем оплату
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingInfo.fullName,
            phone: shippingInfo.phone
          }
        }
      });

      if (error) {
        alert('❌ Payment failed: ' + error.message);
        setProcessing(false);
        return;
      }

      // 3. Создаём заказ после успешной оплаты
      await createOrder({
        variables: {
          paymentIntentId: paymentIntent.id,
          shippingAddress: shippingInfo
        }
      });

      alert('✅ Order placed successfully!');
      navigate('/my-orders'); // Перенаправляем на главную

    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Error: ' + err.message);
      setProcessing(false);
    }
  };

  const handleChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const cart = cartData?.getMyCart;
  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
        <p className="text-base-content/60 mb-6">
          Add some products before checkout!
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">💳 Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Payment Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Shipping Address</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={shippingInfo.fullName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Address *</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="123 Main Street, Apt 4B"
                    value={shippingInfo.address}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City *</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="New York"
                      value={shippingInfo.city}
                      onChange={handleChange}
                      className="input input-bordered"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Postal Code *</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="10001"
                      value={shippingInfo.postalCode}
                      onChange={handleChange}
                      className="input input-bordered"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Country *</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="United States"
                    value={shippingInfo.country}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone *</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={shippingInfo.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              <div className="divider"></div>

              {/* Card Details */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-lg">Card Details *</span>
                </label>
                <div className="p-4 border-2 border-base-300 rounded-lg bg-base-200">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt">
                    💡 Test card: 4242 4242 4242 4242 | Any future date | Any CVV
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                disabled={!stripe || processing}
              >
                {processing ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    💳 Pay ${(calculateTotal() * 1.1).toFixed(2)}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="btn btn-outline btn-block"
              >
                ← Back to Cart
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card bg-base-100 shadow-xl h-fit sticky top-4">
          <div className="card-body">
            <h2 className="card-title mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex gap-3 p-3 bg-base-200 rounded-lg">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-base-content/60">
                      ${item.product.price} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider"></div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-semibold text-success">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span className="font-semibold">${(calculateTotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="flex justify-between text-xl">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary">
                  ${(calculateTotal() * 1.1).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm">🔒 Your payment is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Главный компонент страницы
export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}