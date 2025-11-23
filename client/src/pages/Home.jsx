import { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import SearchFilters from '../components/SearchFilters';
import ProductCard from '../components/ProductCard';

const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      id
      name
      description
      price
      image
      stock
      averageRating
      reviewCount
      category {
        id
        name
      }
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    getCategories {
      id
      name
    }
  }
`;

export default function Home() {
  const { user } = useAuth();
  const [filteredProducts, setFilteredProducts] = useState([]);

  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  // Callback для получения отфильтрованных продуктов из SearchFilters
  const handleFilteredProducts = useCallback((products) => {
    setFilteredProducts(products);
  }, []);

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
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">
          Welcome, {user.username}! 👋
        </h1>
        <p className="text-base-content/60">
          Browse our product catalog
        </p>
      </div>

      {/* Search and Filters - вся логика там! */}
      <SearchFilters
        products={data?.getProducts}
        categories={categoriesData?.getCategories}
        onFilteredProducts={handleFilteredProducts}
      />

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">No products found</h3>
          <p className="text-base-content/60 mb-4">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}