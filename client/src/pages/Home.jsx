import { useMutation, useQuery } from '@apollo/client/react';
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

const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int){
    addToCart(productId: $productId, quantity: $quantity){
       id
      items {
        quantity
        product {
          id
          name
          price
          image
        }
      }
      updatedAt
    }
  }
`

const [addToCart] = useMutation(ADD_TO_CART, {
  refetchQueries: [{ query: GET_MY_CARD}],
  onError: (err) => alert('Ошибка: ' + err.message),
})



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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.getProducts.map((product) => (
          <div key={product.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {/* Картинка с фиксированной высотой */}
            <figure className="relative h-64 overflow-hidden bg-base-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }}
              />

              {/* Badge на картинке */}
              {product.stock < 5 && product.stock > 0 && (
                <div className="badge badge-warning absolute top-2 right-2">
                  Осталось мало!
                </div>
              )}
              {product.stock === 0 && (
                <div className="badge badge-error absolute top-2 right-2">
                  Нет в наличии
                </div>
              )}
            </figure>

            <div className="card-body p-4">
              {/* Категория */}
              <div className="badge badge-outline badge-sm mb-2">
                {product.category.name}
              </div>

              {/* Название товара */}
              <h2 className="card-title text-lg line-clamp-2 min-h-[3.5rem]">
                {product.name}
              </h2>

              {/* Описание */}
              <p className="text-sm text-base-content/60 line-clamp-2 min-h-[2.5rem]">
                {product.description}
              </p>

              {/* Цена и количество */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-base-content/60">Цена</p>
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-base-content/60">В наличии</p>
                  <span className={`text-lg font-semibold ${product.stock === 0 ? 'text-error' :
                      product.stock < 5 ? 'text-warning' :
                        'text-success'
                    }`}>
                    {product.stock}
                  </span>
                </div>
              </div>

              {/* Кнопка */}
              <div className="card-actions justify-stretch mt-4">
                <button
                  className="btn btn-primary btn-block"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Нет в наличии' : '🛒 В корзину'}
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