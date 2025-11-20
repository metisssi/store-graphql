import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

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
  const { loading, error, data } = useQuery(GET_PRODUCTS);

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
        <span>Ошибка загрузки товаров: {error.message}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Добро пожаловать, {user.username}! 👋
        </h1>
        <p className="text-base-content/60">
          Просмотрите наш каталог товаров
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.getProducts.map((product) => (
          <div key={product.id} className="card bg-base-100 shadow-xl">
            <figure>
              <img 
                src={product.image} 
                alt={product.name}
                className="h-48 w-full object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p className="text-sm text-base-content/60">{product.description}</p>
              
              <div className="badge badge-outline">{product.category.name}</div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-bold">${product.price}</span>
                <span className="text-sm">
                  Осталось: <span className="font-semibold">{product.stock}</span>
                </span>
              </div>
              
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm">
                  Добавить в корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.getProducts.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-bold mb-2">Товаров пока нет</h3>
          <p className="text-base-content/60">
            {user.role === 'admin' 
              ? 'Перейдите в админ панель чтобы добавить товары'
              : 'Скоро здесь появятся товары!'
            }
          </p>
        </div>
      )}
    </div>
  );
}