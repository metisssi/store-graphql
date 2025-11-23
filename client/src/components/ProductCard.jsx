import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={handleViewProduct}
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

        {/* ⭐ Rating Display */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-sm mb-2">
            <span>⭐ {product.averageRating.toFixed(1)}</span>
            <span className="text-base-content/60">({product.reviewCount})</span>
          </div>
        )}

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
              handleViewProduct();
            }}
            className="btn btn-primary btn-block btn-sm"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}