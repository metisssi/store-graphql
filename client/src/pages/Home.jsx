import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
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
`;

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
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
        <span>Error loading products: {error.message}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome, {user.username}! 👋
        </h1>
        <p className="text-base-content/60">
          Browse our product catalog
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.getProducts.map((product) => (
          <div 
            key={product.id} 
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleViewProduct(product.id)}
          >
            <figure className="relative h-64 overflow-hidden bg-base-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }}
              />

              {product.stock < 5 && product.stock > 0 && (
                <div className="badge badge-warning absolute top-2 right-2">
                  Low Stock!
                </div>
              )}
              {product.stock === 0 && (
                <div className="badge badge-error absolute top-2 right-2">
                  Out of Stock
                </div>
              )}
            </figure>

            <div className="card-body p-4">
              <div className="badge badge-outline badge-sm mb-2">
                {product.category.name}
              </div>

              <h2 className="card-title text-lg line-clamp-2 min-h-[3.5rem]">
                {product.name}
              </h2>

              <p className="text-sm text-base-content/60 line-clamp-2 min-h-[2.5rem]">
                {product.description}
              </p>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-base-content/60">Price</p>
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-base-content/60">Stock</p>
                  <span className={`text-lg font-semibold ${
                    product.stock === 0 ? 'text-error' :
                    product.stock < 5 ? 'text-warning' :
                    'text-success'
                  }`}>
                    {product.stock}
                  </span>
                </div>
              </div>

              <div className="card-actions justify-stretch mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Чтобы не срабатывал клик на карточке
                    handleViewProduct(product.id);
                  }}
                  className="btn btn-primary btn-block btn-sm"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.getProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold mb-2">No Products Yet</h3>
          <p className="text-base-content/60">
            {user.role === 'admin'
              ? 'Go to admin panel to add products'
              : 'Products coming soon!'
            }
          </p>
        </div>
      )}
    </div>
  );
}