import { useState } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: cartData } = useQuery(GET_CART_COUNT, {
    skip: !user || user.role === 'admin',
  });

  const cartItemsCount = cartData?.getMyCart?.items?.reduce(
    (total, item) => total + item.quantity,
    0
  ) || 0;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar bg-base-100 shadow-lg">
      {/* Logo */}
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl" onClick={closeMenu}>
          🛒 E-Commerce
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex flex-none gap-2">
        {user ? (
          <>
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

      {/* Mobile Menu Button */}
      <div className="md:hidden flex-none">
        {/* Cart icon for mobile (quick access) */}
        {user && user.role !== 'admin' && (
          <Link to="/cart" className="btn btn-ghost btn-sm mr-1">
            <div className="indicator">
              <span className="text-xl">🛒</span>
              {cartItemsCount > 0 && (
                <span className="indicator-item badge badge-primary badge-xs">
                  {cartItemsCount}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Hamburger Button */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-base-100 shadow-lg z-50 md:hidden">
          <div className="flex flex-col p-4 gap-2">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center justify-between py-2 border-b border-base-300 mb-2">
                  <span className="font-semibold">
                    Hi, {user.username}!
                    {user.role === 'admin' && (
                      <span className="badge badge-primary ml-2">Admin</span>
                    )}
                  </span>
                </div>

                {/* User Links */}
                {user.role !== 'admin' && (
                  <>
                    <Link
                      to="/cart"
                      className="btn btn-ghost justify-start gap-3"
                      onClick={closeMenu}
                    >
                      <span className="text-xl">🛒</span>
                      Cart
                      {cartItemsCount > 0 && (
                        <span className="badge badge-primary badge-sm">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/my-orders"
                      className="btn btn-ghost justify-start gap-3"
                      onClick={closeMenu}
                    >
                      <span className="text-xl">📦</span>
                      My Orders
                    </Link>
                  </>
                )}

                {/* Admin Links */}
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className="btn btn-ghost justify-start gap-3"
                      onClick={closeMenu}
                    >
                      <span className="text-xl">📦</span>
                      Products
                    </Link>
                    <Link
                      to="/orders"
                      className="btn btn-ghost justify-start gap-3"
                      onClick={closeMenu}
                    >
                      <span className="text-xl">📋</span>
                      Orders
                    </Link>
                  </>
                )}

                <div className="divider my-1"></div>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="btn btn-error btn-outline justify-start gap-3"
                >
                  <span className="text-xl">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-ghost justify-start gap-3"
                  onClick={closeMenu}
                >
                  <span className="text-xl">🔑</span>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary justify-start gap-3"
                  onClick={closeMenu}
                >
                  <span className="text-xl">✨</span>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}