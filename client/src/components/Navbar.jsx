import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_CART_COUNT = gql`
  query GetMyCart {
    getMyCart {
      id
      items {
        quantity
      }
    }
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();

  // Получаем количество товаров в корзине (только для обычных пользователей)
  const { data: cartData } = useQuery(GET_CART_COUNT, {
    skip: !user || user.role === 'admin', // 👈 Не загружаем для админа
  });

  const cartItemsCount = cartData?.getMyCart?.items?.reduce(
    (total, item) => total + item.quantity,
    0
  ) || 0;

  return (
    <nav className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          🛒 E-Commerce
        </Link>
      </div>

      <div className="flex-none gap-2">
        {user ? (
          <>
            {/* User Links - только для обычных пользователей */}
            {user.role !== 'admin' && (
              <>
                <Link to="/cart" className="btn btn-ghost btn-sm gap-2">
                  <div className="indicator">
                    <span className="text-xl">🛒</span>
                    {cartItemsCount > 0 && (
                      <span className="indicator-item badge badge-primary badge-sm">
                        {cartItemsCount}
                      </span>
                    )}
                  </div>
                  Cart
                </Link>
                <Link to="/my-orders" className="btn btn-ghost btn-sm">
                  📦 My Orders
                </Link>
              </>
            )}

            {/* Admin Links - только для админа */}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="btn btn-ghost btn-sm">
                  📦 Products
                </Link>
                <Link to="/orders" className="btn btn-ghost btn-sm">
                  📋 Orders
                </Link>
              </>
            )}

            <span className="text-sm">
              Hi, {user.username}!
              {user.role === 'admin' && <span className="badge badge-primary ml-2">Admin</span>}
            </span>

            <button onClick={logout} className="btn btn-ghost btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}