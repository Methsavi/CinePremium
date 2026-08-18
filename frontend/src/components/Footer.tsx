import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant w-full mt-auto">
      <div className="w-full py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-4">
        <h2 className="font-display text-xl font-bold text-on-surface">CinePremium</h2>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a href="#" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Contact Us
          </a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Help Center
          </a>
        </div>

        <p className="text-sm text-primary">© 2024 CinePremium. All rights reserved.</p>
      </div>
    </footer>
  );
};
