import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      id
      username
      email
      token
    }
  }
`;

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registerUser, { loading, error }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      console.log(data)
      login(data.register);
      navigate('/');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser({ 
      variables: { 
        registerInput: formData 
      } 
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="avatar placeholder mb-4">
              <div className="bg-secondary text-secondary-content rounded-full w-20">
                <span className="text-3xl">✨</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-base-content/60 mt-2">Join us today!</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Password */}
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
                  placeholder="Minimum 6 characters"
                  className="input input-bordered w-full pr-10"
                  required
                  minLength={6}
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

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="input input-bordered w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input type="checkbox" className="checkbox checkbox-primary" required />
                <span className="label-text text-sm">
                  I agree to the{' '}
                  <a href="#" className="link link-primary">terms of service</a>
                </span>
              </label>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Signing up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider">OR</div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-base-content/60">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary font-medium">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}