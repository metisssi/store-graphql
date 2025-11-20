import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';  // 👈 ПРОВЕРЬ ЧТО ИМПОРТИРОВАН!

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
    const { user } = useAuth();
    return !user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    

    
    if (!user) {
      
        return <Navigate to="/login" replace />;
    }
    
    if (user.role !== 'admin') {
        console.log('❌ Не админ, редирект на /');
        return <Navigate to="/" replace />;
    }
    
  
    return children;
};

function App() {
    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <Routes>
                    {/* Главная страница */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Админ панель - ПРОВЕРЬ ЧТО ЭТО ЕСТЬ! */}
                    <Route 
                        path="/admin" 
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        } 
                    />

                    {/* Логин */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />

                    {/* Регистрация */}
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;