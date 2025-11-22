import { useState, useMemo } from 'react';
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
  const navigate = useNavigate();
  
  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  // Фильтрация и сортировка товаров
  const filteredProducts = useMemo(() => {
    if (!data?.getProducts) return [];

    let products = [...data.getProducts];

    // Поиск по названию и описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category.id === selectedCategory);
    }

    // Фильтр по цене
    if (priceRange.min !== '') {
      products = products.filter((p) => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      products = products.filter((p) => p.price <= parseFloat(priceRange.max));
    }

    // Сортировка
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        // Уже отсортировано по createdAt на бэкенде
        break;
    }

    return products;
  }, [data, searchQuery, selectedCategory, sortBy, priceRange]);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedCategory !== 'all' || 
    sortBy !== 'newest' || 
    priceRange.min || 
    priceRange.max;

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

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body p-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="form-control flex-1">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="btn btn-ghost"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 mt-3">
            {/* Category Filter */}
            <select
              className="select select-bordered select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categoriesData?.getCategories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              className="select select-bordered select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min $"
                className="input input-bordered input-sm w-24"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max $"
                className="input input-bordered input-sm w-24"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button 
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-base-content/60 mt-2">
            Showing {filteredProducts.length} of {data.getProducts.length} products
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">No products found</h3>
          <p className="text-base-content/60 mb-4">
            Try adjusting your search or filters
          </p>
          <button className="btn btn-primary" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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
                    <span
                      className={`text-lg font-semibold ${
                        product.stock === 0
                          ? 'text-error'
                          : product.stock < 5
                          ? 'text-warning'
                          : 'text-success'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                </div>

                <div className="card-actions justify-stretch mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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
      )}
    </div>
  );
}