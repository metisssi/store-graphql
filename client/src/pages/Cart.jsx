import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const GET_MY_CART = gql`
  query GetMyCart {
    getMyCart {
      id
      items {
        quantity
        product {
          id
          name
          description
          price
          image
          stock
          category {
            id
            name
          }
        }
      }
      updatedAt
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      id
      items {
        quantity
        product {
          id
        }
      }
    }
  }
`;

const UPDATE_CART_ITEM_QUANTITY = gql`
  mutation UpdateCartItemQuantity($productId: ID!, $quantity: Int!) {
    updateCartItemQuantity(productId: $productId, quantity: $quantity) {
      id
      items {
        quantity
        product {
          id
        }
      }
    }
  }
`;

const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      id
      items {
        quantity
      }
    }
  }
`;

export default function Cart() {
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(GET_MY_CART);

    const [removeFromCart] = useMutation(REMOVE_FROM_CART, {
        refetchQueries: [{ query: GET_MY_CART }],
        onCompleted: () => {
            alert('✅ Product removed from cart!');
        },
        onError: (err) => {
            alert('❌ Error: ' + err.message);
        }
    });

    const [updateQuantity] = useMutation(UPDATE_CART_ITEM_QUANTITY, {
        refetchQueries: [{ query: GET_MY_CART }],
        onError: (err) => {
            alert('❌ Error: ' + err.message);
        }
    });

    const [clearCart] = useMutation(CLEAR_CART, {
        refetchQueries: [{ query: GET_MY_CART }],
        onCompleted: () => {
            alert('✅ Cart cleared!');
        },
        onError: (err) => {
            alert('❌ Error: ' + err.message);
        }
    });

    const handleRemoveFromCart = (productId) => {
        if (window.confirm('Remove this product from cart?')) {
            removeFromCart({ variables: { productId } });
        }
    };

    const handleUpdateQuantity = (productId, newQuantity, maxStock) => {
        if (newQuantity < 1) return;
        if (newQuantity > maxStock) {
            alert(`Maximum available stock: ${maxStock}`);
            return;
        }
        updateQuantity({ variables: { productId, quantity: newQuantity } });
    };

    const handleClearCart = () => {
        if (window.confirm('Clear entire cart?')) {
            clearCart();
        }
    };

    const calculateTotal = () => {
        if (!data?.getMyCart?.items) return 0;
        return data.getMyCart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
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
                <span>Error loading cart: {error.message}</span>
            </div>
        );
    }

    const cart = data?.getMyCart;
    const isEmpty = !cart || cart.items.length === 0;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">🛒 Shopping Cart</h1>
                    <p className="text-base-content/60">
                        {isEmpty ? 'Your cart is empty' : `${cart.items.length} item(s) in cart`}
                    </p>
                </div>
                {!isEmpty && (
                    <button
                        onClick={handleClearCart}
                        className="btn btn-error btn-outline"
                    >
                        🗑️ Clear Cart
                    </button>
                )}
            </div>

            {isEmpty ? (
                /* Empty State */
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
                    <p className="text-base-content/60 mb-6">
                        Add some products to get started!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                /* Cart Items */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => (
                            <div key={item.product.id} className="card bg-base-100 shadow-xl">
                                <div className="card-body p-4">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-24 h-24 object-contain rounded cursor-pointer hover:scale-105 transition"
                                            onClick={() => navigate(`/product/${item.product.id}`)}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/150';
                                            }}
                                        />

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3
                                                        className="font-bold text-lg cursor-pointer hover:text-primary transition"
                                                        onClick={() => navigate(`/product/${item.product.id}`)}
                                                    >
                                                        {item.product.name}
                                                    </h3>
                                                    <div className="badge badge-outline badge-sm">
                                                        {item.product.category?.name || 'No Category'} {/* 👈 Добавь ?. */}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.product.id)}
                                                    className="btn btn-ghost btn-sm btn-circle"
                                                >
                                                    ❌
                                                </button>
                                            </div>

                                            <p className="text-sm text-base-content/60 line-clamp-2 mb-3">
                                                {item.product.description}
                                            </p>

                                            {/* Price and Quantity */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-2xl font-bold text-primary">
                                                        ${item.product.price}
                                                    </span>
                                                    <span className="text-sm text-base-content/60 ml-2">
                                                        each
                                                    </span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQuantity(
                                                                item.product.id,
                                                                item.quantity - 1,
                                                                item.product.stock
                                                            )
                                                        }
                                                        className="btn btn-sm btn-circle btn-outline"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-lg font-bold w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQuantity(
                                                                item.product.id,
                                                                item.quantity + 1,
                                                                item.product.stock
                                                            )
                                                        }
                                                        className="btn btn-sm btn-circle btn-outline"
                                                        disabled={item.quantity >= item.product.stock}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-right mt-2">
                                                <span className="text-sm text-base-content/60">Subtotal: </span>
                                                <span className="text-lg font-bold">
                                                    ${(item.product.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Stock Warning */}
                                            {item.quantity >= item.product.stock && (
                                                <div className="alert alert-warning mt-2 py-2">
                                                    <span className="text-xs">⚠️ Maximum stock reached</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-xl sticky top-4">
                            <div className="card-body">
                                <h2 className="card-title">Order Summary</h2>

                                <div className="divider"></div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-base-content/60">Subtotal:</span>
                                        <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-base-content/60">Shipping:</span>
                                        <span className="font-semibold">Free</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-base-content/60">Tax:</span>
                                        <span className="font-semibold">${(calculateTotal() * 0.1).toFixed(2)}</span>
                                    </div>

                                    <div className="divider"></div>

                                    <div className="flex justify-between text-xl">
                                        <span className="font-bold">Total:</span>
                                        <span className="font-bold text-primary">
                                            ${(calculateTotal() * 1.1).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}  // 👈 Добавь navigate
                                    className="btn btn-primary btn-block mt-6"
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="btn btn-outline btn-block"
                                >
                                    Continue Shopping
                                </button>

                                <div className="mt-4 text-xs text-base-content/60 text-center">
                                    🔒 Secure checkout guaranteed
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}