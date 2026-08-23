import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { 
  Film, Tv, Compass, ShieldCheck, HelpCircle, 
  FileText, Sparkles, ArrowUpRight, Heart, MapPin
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080d1a] border-t border-white/10 w-full mt-auto relative overflow-hidden text-sm text-on-surface-variant selection:bg-primary selection:text-white">
      {/* Subtle background ambient gradient */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-14 pb-8 space-y-12 relative z-10">
        
        {/* Top Multi-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand Col (Spans 2 on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-bold text-white hover:text-primary transition-colors">
              <img src={logo} alt="CinePremium" className="w-9 h-9 rounded-xl object-contain shadow-lg" />
              <span>Cine<span className="text-primary">Premium</span></span>
            </Link>
            <p className="text-xs sm:text-sm text-[#908fa0] leading-relaxed max-w-sm">
              Sri Lanka's premier cinematic network. Delivering next-generation IMAX 3D, Dolby Atmos, and luxury VIP recliner movie experiences.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#c0c1ff] font-medium pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Network Status: Live & Operational</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-primary" />
              <span>Explore</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/cinemas" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Cinema Auditoriums
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Experiences */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Tv className="w-3.5 h-3.5 text-primary" />
              <span>Experiences</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/imax" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                  <span>IMAX 3D Laser</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link to="/dolby-cinema" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                  <span>Dolby Cinema</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link to="/4dx" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                  <span>4DX Motion</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link to="/screenx" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                  <span>ScreenX 270°</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link to="/vip-recliners" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                  <span>VIP Luxury Recliners</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Legal */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span>Support & Legal</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/help-center" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Manage & Cancel Bookings
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-[#908fa0] hover:text-white hover:translate-x-1 transition-all inline-block">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Divider */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#908fa0]">
          <p className="flex items-center gap-1">
            <span>© 2026 CinePremium Ltd. All rights reserved.</span>
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 bg-[#151b2d] px-3 py-1 rounded-full border border-white/10 text-white font-medium text-[11px]">
              <span className="text-primary font-bold">LKR</span>
              <span>Rs. Sri Lankan Rupee</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
