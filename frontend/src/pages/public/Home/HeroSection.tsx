import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[600px] flex items-center justify-center">
      {/* Background Image - Contained */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Delicious Indian Food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
          Ghar Ki Rasoee, <br />
          <span className="text-primary-400">Away From Home</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-sm">
          Fresh, home-style Indian tiffins delivered to your doorstep in Canada. 
          Taste the tradition, feel the comfort.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mb-8">
             <button 
               onClick={() => navigate('/menu')}
               className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-bold text-lg transition flex items-center gap-2 shadow-lg transform hover:scale-105"
             >
               <Search size={22} />
               Find Food
             </button>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-white/90 text-sm font-medium">
          <span className="flex items-center gap-1">🌿 Pure Veg Options</span>
          <span className="flex items-center gap-1">🚚 Free Delivery</span>
          <span className="flex items-center gap-1">🏠 Home Style</span>
        </div>
      </div>

    </div>
  );
};

export default HeroSection;
