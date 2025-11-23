import { useState, useMemo, useEffect } from 'react';

export default function SearchFilters({ products, categories, onFilteredProducts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Вся логика фильтрации здесь!
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = [...products];

    // Поиск по названию и описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category.id === selectedCategory);
    }

    // Фильтр по цене
    if (priceRange.min !== '') {
      result = result.filter((p) => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      result = result.filter((p) => p.price <= parseFloat(priceRange.max));
    }

    // Сортировка
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy, priceRange]);

  // Отправляем отфильтрованные продукты в Home
  useEffect(() => {
    onFilteredProducts(filteredProducts);
  }, [filteredProducts, onFilteredProducts]);

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    sortBy !== 'newest' ||
    priceRange.min ||
    priceRange.max;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
  };

  return (
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
            {categories?.map((cat) => (
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
          Showing {filteredProducts.length} of {products?.length || 0} products
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      </div>
    </div>
  );
}