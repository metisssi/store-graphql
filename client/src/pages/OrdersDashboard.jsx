import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';

const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    getAllOrders {
      id
      user {
        id
        username
        email
      }
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
      updatedAt
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export default function OrdersDashboard() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { loading, error, data, refetch } = useQuery(GET_ALL_ORDERS);
  
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      alert('✅ Order status updated!');
      refetch();
    },
    onError: (err) => {
      alert('❌ Error: ' + err.message);
    }
  });

  const handleStatusChange = (orderId, newStatus) => {
    if (window.confirm(`Change order status to "${newStatus}"?`)) {
      updateOrderStatus({
        variables: {
          orderId,
          status: newStatus
        }
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'processing':
        return 'badge-info';
      case 'shipped':
        return 'badge-primary';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'succeeded':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      default:
        return 'badge-ghost';
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

  const orders = data?.getAllOrders || [];
  
  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📦 Orders Management</h1>
        <p className="text-base-content/60">
          Total: {orders.length} orders
        </p>
      </div>

      {/* Mobile Filter - Dropdown */}
      <div className="md:hidden mb-6">
        <select
          className="select select-bordered w-full"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Filter - Tabs */}
      <div className="hidden md:block tabs tabs-boxed mb-6">
        {statusOptions.map((option) => (
          <a
            key={option.value}
            className={`tab ${selectedStatus === option.value ? 'tab-active' : ''}`}
            onClick={() => setSelectedStatus(option.value)}
          >
            {option.label} ({option.count})
          </a>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold mb-2">No orders found</h3>
          <p className="text-base-content/60">
            {selectedStatus === 'all' 
              ? 'No orders have been placed yet' 
              : `No orders with status "${selectedStatus}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 md:p-6">
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-base-content/60">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`badge ${getStatusBadgeClass(order.status)} badge-lg`}>
                      {order.status.toUpperCase()}
                    </div>
                    <div className={`badge ${getPaymentBadgeClass(order.paymentStatus)} badge-sm`}>
                      {order.paymentStatus}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold mb-2">👤 Customer</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>{order.user.username}</strong></p>
                      <p>{order.user.email}</p>
                    </div>

                    <h4 className="font-semibold mt-4 mb-2">📍 Shipping Address</h4>
                    <div className="text-sm space-y-1">
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      <p>📞 {order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-2">📦 Items ({order.items.length})</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 bg-base-200 p-2 rounded">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50';
                            }}
                          />
                          <div className="flex-1 text-sm">
                            <p className="font-semibold line-clamp-1">{item.name}</p>
                            <p className="text-base-content/60">
                              ${item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Change */}
                  <div>
                    <h4 className="font-semibold mb-2">🔄 Change Status</h4>
                    
                    {/* Mobile: Dropdown */}
                    <div className="md:hidden mb-3">
                      <select
                        className="select select-bordered select-sm w-full"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={order.status === 'delivered'}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Desktop: Buttons */}
                    <div className="hidden md:block space-y-2">
                      <button
                        onClick={() => handleStatusChange(order.id, 'processing')}
                        className="btn btn-info btn-sm btn-block"
                        disabled={order.status === 'processing' || order.status === 'delivered'}
                      >
                        Mark as Processing
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'shipped')}
                        className="btn btn-primary btn-sm btn-block"
                        disabled={order.status === 'shipped' || order.status === 'delivered'}
                      >
                        Mark as Shipped
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        className="btn btn-success btn-sm btn-block"
                        disabled={order.status === 'delivered'}
                      >
                        Mark as Delivered
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className="btn btn-error btn-sm btn-block"
                        disabled={order.status === 'cancelled' || order.status === 'delivered'}
                      >
                        Cancel Order
                      </button>
                    </div>

                    <div className="divider my-2"></div>

                    <div className="bg-base-200 p-3 rounded">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subtotal:</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      {order.isPaid && (
                        <p className="text-xs text-success mt-2">
                          ✓ Paid on {new Date(order.paidAt).toLocaleDateString()}
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