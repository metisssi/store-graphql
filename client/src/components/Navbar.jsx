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
            {/* Показываем ссылку на админку если пользователь - админ */}
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-ghost btn-sm">
                ⚙️ Админ панель
              </Link>
            )}
            
            <span className="text-sm">
              Привет, {user.username}! 
              {user.role === 'admin' && <span className="badge badge-primary ml-2">Admin</span>}
            </span>
            
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