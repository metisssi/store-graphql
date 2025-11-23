import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const GET_MY_ORDERS = gql`
  query GetMyOrders {
    getMyOrders {
      id
      items {
        name
        price
        quantity
        image
      }
      totalAmount
      status
      paymentStatus
      isPaid
      paidAt
      shippingAddress {
        fullName
        address
        city
        postalCode
        country
        phone
      }
      createdAt
    }
  }
`;

export default function MyOrders() {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_MY_ORDERS);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'shipped': return 'badge-primary';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '⏳ Pending';
      case 'processing': return '🔄 Processing';
      case 'shipped': return '🚚 Shipped';
      case 'delivered': return '✅ Delivered';
      case 'cancelled': return '❌ Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading orders: {error.message}</span>
      </div>
    );
  }

  const orders = data?.getMyOrders || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📦 My Orders</h1>
        <p className="text-base-content/60">
          {orders.length === 0 
            ? 'You have no orders yet' 
            : `Total orders: ${orders.length}`}
        </p>
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
          <p className="text-base-content/60 mb-6">
            Time to make your first order!
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-base-content/60">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`badge ${getStatusBadgeClass(order.status)} badge-lg`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold mb-3">🛍️ Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 bg-base-200 p-3 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-base-content/60">
                              ${item.price} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div>
                    {/* Shipping Address */}
                    <h4 className="font-semibold mb-2">📍 Shipping Address</h4>
                    <div className="text-sm space-y-1 mb-4 bg-base-200 p-3 rounded-lg">
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      <p>📞 {order.shippingAddress.phone}</p>
                    </div>

                    {/* Order Total */}
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      {order.isPaid && (
                        <p className="text-xs text-success mt-2">
                          ✓ Paid on {new Date(order.paidAt).toLocaleDateString('en-US')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}