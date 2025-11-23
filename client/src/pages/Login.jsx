import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
      email
      role
      token
    }
  }
`;

export default function Login() {
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const [loginUser, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
     
      
      // 1. Save user
      login(data.login);
      
      // 2. Hard redirect via window.location
      setTimeout(() => {
        if (data.login.role === 'admin') {
      
          window.location.href = '/admin';
        } else {
          
          window.location.href = '/';
        }
      }, 100);  // Small delay so login() has time to execute
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({ variables: formData });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-20">
                <span className="text-3xl">🛒</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold">Welcome!</h2>
            <p className="text-base-content/60 mt-2">Log in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="input input-bordered w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error.message}</span>
              </div>
            )}

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Don't have an account?{' '}
              <Link to="/register" className="link link-primary font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}