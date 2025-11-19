import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

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
            <span className="text-sm">Привет, {user.username}!</span>
            <button onClick={logout} className="btn btn-ghost btn-sm">
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Вход
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}