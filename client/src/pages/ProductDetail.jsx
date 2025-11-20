import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';

const GET_PRODUCT = gql`
  query GetProduct($productId: ID!) {
    getProduct(productId: $productId) {
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
      createdAt
    }
  }
`;

const GET_MY_CART = gql`
  query GetMyCart {
    getMyCart {
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

const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      items {
        quantity
        product {
          id
          name
          price
        }
      }
    }
  }
`;

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { productId }
  });

  const [addToCart, { loading: addingToCart }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_MY_CART }],
    onCompleted: () => {
      alert('✅ Added to cart successfully!');
    },
    onError: (err) => {
      alert('❌ Error: ' + err.message);
    }
  });

  const handleAddToCart = () => {
    addToCart({
      variables: {
        productId,
        quantity
      }
    });
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= data.getProduct.stock) {
      setQuantity(newQuantity);
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
        <span>Error loading product: {error.message}</span>
      </div>
    );
  }

  const product = data.getProduct;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li><button onClick={() => navigate('/')}>Home</button></li>
          <li><button onClick={() => navigate('/')}>Products</button></li>
          <li>{product.category.name}</li>
          <li>{product.name}</li>
        </ul>
      </div>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="bg-base-200 rounded-xl p-8 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[500px] object-contain"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500?text=No+Image';
            }}
          />
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          {/* Category Badge */}
          <div className="badge badge-primary badge-lg">
            {product.category.name}
          </div>

          {/* Product Name */}
          <h1 className="text-4xl font-bold">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-primary">
              ${product.price}
            </span>
            <span className="text-base-content/60">USD</span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Availability:</span>
            {product.stock > 0 ? (
              <div className="badge badge-success gap-2">
                ✓ In Stock ({product.stock} available)
              </div>
            ) : (
              <div className="badge badge-error gap-2">
                ✗ Out of Stock
              </div>
            )}
          </div>

          <div className="divider"></div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <p className="text-base-content/70 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="divider"></div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="btn btn-circle btn-outline"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="text-2xl font-bold w-16 text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="btn btn-circle btn-outline"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-lg flex-1"
              disabled={product.stock === 0 || addingToCart}
            >
              {addingToCart ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Adding to Cart...
                </>
              ) : (
                <>
                  🛒 Add to Cart
                </>
              )}
            </button>
            
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/')}
            >
              ← Back
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-base-200 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-base-content/60">Product ID:</span>
              <span className="font-mono">{product.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/60">Added:</span>
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}