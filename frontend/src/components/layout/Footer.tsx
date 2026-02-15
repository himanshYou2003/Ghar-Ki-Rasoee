import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Ghar Ki Rasoee Logo" className="h-8 w-auto" />
              <span className="text-2xl font-bold text-primary tracking-tight">GHAR KI RASOEE</span>
            </div>
            <p className="mt-4 text-text-secondary text-sm leading-relaxed">
              Serving fresh, home-style Indian meals with love and tradition. No preservatives, just pure taste.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-surface text-text-secondary hover:text-primary hover:bg-primary/10 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 rounded-full bg-surface text-text-secondary hover:text-primary hover:bg-primary/10 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 rounded-full bg-surface text-text-secondary hover:text-primary hover:bg-primary/10 transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-text-secondary">
          <p>&copy; {new Date().getFullYear()} Ghar Ki Rasoee. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ in Canada</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
