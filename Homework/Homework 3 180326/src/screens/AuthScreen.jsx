import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

const foodImages = [
  { emoji: '🍜', name: 'Noodles', delay: '0s' },
  { emoji: '🍚', name: 'Rice', delay: '0.5s' },
  { emoji: '🥗', name: 'Salad', delay: '1s' },
  { emoji: '🍲', name: 'Soup', delay: '1.5s' },
  { emoji: '🥟', name: 'Dumpling', delay: '2s' },
  { emoji: '🍗', name: 'Chicken', delay: '2.5s' },
  { emoji: '🥩', name: 'Meat', delay: '3s' },
  { emoji: '🥬', name: 'Veggie', delay: '3.5s' },
  { emoji: '🍜', name: 'Noodles', delay: '4s' },
  { emoji: '🍛', name: 'Curry', delay: '4.5s' },
];

function FloatingFood({ emoji, top, left, delay, size }) {
  return (
    <div
      className="absolute animate-float opacity-20 select-none"
      style={{
        top,
        left,
        animationDelay: delay,
        fontSize: size,
      }}
    >
      {emoji}
    </div>
  );
}

export default function AuthScreen() {
  const { login, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username.trim()) {
      setError('Please enter your username');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    if (isLogin) {
      const result = login(formData.username, formData.password);
      if (!result.success) {
        setError(result.error);
      }
    } else {
      const result = signUp(formData.username, formData.password);
      if (!result.success) {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', password: '' });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <ChefHat className="w-8 h-8 text-white" />
              <span className="text-white text-xl font-semibold">Healthy Food Menu</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4">
              Eat Healthy,<br />Live Better
            </h1>
            <p className="text-white/80 text-xl max-w-md">
              Your personal AI-powered healthy meal assistant
            </p>
          </div>

          <div className="relative w-96 h-96">
            {foodImages.map((food, index) => (
              <FloatingFood
                key={index}
                emoji={food.emoji}
                top={`${(index * 11) % 70}%`}
                left={`${(index * 17) % 70}%`}
                delay={food.delay}
                size={`${40 + (index * 7) % 30}px`}
              />
            ))}
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-full p-8 shadow-2xl animate-pulse">
                <span className="text-7xl">🍽️</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-100 rounded-full px-4 py-2 mb-4">
              <ChefHat className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600 font-semibold">Healthy Food Menu</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-500">
              {isLogin 
                ? 'Sign in to continue your healthy journey' 
                : 'Start your healthy eating journey today'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-semibold hover:from-primary-500 hover:to-primary-400 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-primary-600 hover:text-primary-700 font-semibold"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
          }
          75% {
            transform: translateY(-25px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
