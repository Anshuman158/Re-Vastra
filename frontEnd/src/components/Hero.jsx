import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Sparkles, Users, ShoppingBag, TrendingUp, ArrowRight, Star, Shield, Clock } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const { products } = useContext(ShopContext);

  // Quick stats
  const totalProducts = products?.length || 0;

  const categories = [
    { name: 'Ethnic Wear', icon: '👗', color: 'from-pink-500 to-rose-500' },
    { name: 'Formal', icon: '👔', color: 'from-blue-500 to-indigo-500' },
    { name: 'Party Wear', icon: '✨', color: 'from-purple-500 to-violet-500' },
    { name: 'Accessories', icon: '👜', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-500/5 to-transparent rounded-full"></div>
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}></div>

      {/* Main Content */}
      <div className="relative z-10 container-custom pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">

          {/* Left: Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-white/70 text-sm font-medium">Campus Fashion Rental Platform</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1]">
                <span className="block">Rent the Look,</span>
                <span className="block bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Own the Moment
                </span>
              </h1>
              <p className="text-lg text-neutral-400 max-w-lg leading-relaxed">
                Access premium fashion for every occasion. Save money, save the planet,
                and always look your best without buying.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/collection')}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-pink-500 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Exploring <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => navigate('/lend')}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                List Your Wardrobe
              </button>
            </div>

            {/* Trust Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Shield size={22} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-sm text-neutral-500">Verified Items</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Clock size={22} className="text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">24hr</p>
                  <p className="text-sm text-neutral-500">Quick Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp size={22} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalProducts}+</p>
                  <p className="text-sm text-neutral-500">Items Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Featured Categories / Visual */}
          <div className="relative hidden lg:block">
            {/* Category cards in a 2x2 grid */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {categories.map((cat, index) => (
                <div
                  key={cat.name}
                  className="cursor-pointer group transition-all duration-500 hover:scale-105 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate('/collection')}
                >
                  <div className={`bg-gradient-to-br ${cat.color} p-[1px] rounded-2xl shadow-xl shadow-black/20`}>
                    <div className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-6">
                      <span className="text-4xl mb-3 block">{cat.icon}</span>
                      <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                      <p className="text-neutral-500 text-sm mt-1 flex items-center gap-1">
                        Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Quick Category Pills (Mobile visible) */}
        <div className="mt-12 lg:mt-0">
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {['Wedding', 'Party', 'Casual', 'Formal', 'Festive'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate('/collection')}
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
