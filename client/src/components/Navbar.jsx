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
  
  // Получаем количество товаров в корзине
  const { data: cartData } = useQuery(GET_CART_COUNT, {
    skip: !user, // Не загружаем если пользователь не залогинен
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
            {/* Cart Link - НОВОЕ! */}
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

            {/* Admin Link */}
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-ghost btn-sm">
                ⚙️ Admin Panel
              </Link>
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