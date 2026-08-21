import React, { useState } from 'react';
import { Eye, Volume2, Sparkles, Armchair, Zap } from 'lucide-react';

interface Experience {
  id: string;
  name: string;
  badge: string;
  description: string;
  features: string[];
  imageUrl: string;
  icon: React.ElementType;
}

const EXPERIENCES: Experience[] = [
  {
    id: 'exp1',
    name: 'IMAX 3D Laser',
    badge: 'Ultimate Immersion',
    description: 'Custom-designed screen geometry and next-gen dual 4K laser projection systems deliver unmatched brightness and color accuracy.',
    features: ['Expanded 1.43:1 Aspect Ratio', 'Dual 4K Precision Laser', '12-Channel Immersive Sound'],
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    icon: Eye
  },
  {
    id: 'exp2',
    name: 'Dolby Cinema',
    badge: 'True Black & Sound',
    description: 'Dolby Vision dual laser HDR combined with Dolby Atmos multidimensional sound for a thrilling, breathtaking cinematic journey.',
    features: ['Ultra-Vivid Dolby Vision', 'Spatial 360 Dolby Atmos', 'Luxury Leather Seats'],
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop',
    icon: Volume2
  },
  {
    id: 'exp3',
    name: '4DX Motion Theater',
    badge: 'Absolute Realism',
    description: 'Motion-activated seats synchronized with environmental effects including wind, fog, lightning, water sprays, and scents.',
    features: ['21 Synchronized Motion Effects', 'Wind, Rain & Smoke Simulators', 'High-Octane Action Tuning'],
    imageUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1200&auto=format&fit=crop',
    icon: Zap
  },
  {
    id: 'exp4',
    name: 'VIP Recliner Suite',
    badge: 'First Class Luxury',
    description: 'Electric motor recliners with personal seat-side dining service, gourmet snacks, and heated seating options.',
    features: ['Full Recline Leather Seats', 'In-Seat Waiter Service', 'Private Lounge Access'],
    imageUrl: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?q=80&w=1200&auto=format&fit=crop',
    icon: Armchair
  }
];

export const ExperienceSection: React.FC = () => {
  const [activeExp, setActiveExp] = useState<Experience>(EXPERIENCES[0]);

  return (
    <section id="experiences" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Premium Technologies
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Next-Generation Cinema Formats
            </h2>
            <p className="text-slate-400 text-sm">
              Experience movies the way visionaries intended with unmatched visual clarity and spatial sound.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXPERIENCES.map((exp) => {
              const IconComponent = exp.icon;
              const isActive = activeExp.id === exp.id;
              return (
                <button
                  key={exp.id}
                  onClick={() => setActiveExp(exp)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-gradient-to-b from-red-600/20 to-red-950/40 border-red-500 shadow-xl shadow-red-600/20 transform scale-102'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      {exp.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className={`text-base font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {exp.name}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/80 rounded-2xl border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                {activeExp.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {activeExp.name}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {activeExp.description}
              </p>

              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Highlights</h5>
                <ul className="space-y-2">
                  {activeExp.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm font-medium text-slate-200">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-6 relative aspect-video rounded-xl overflow-hidden border border-white/15 shadow-2xl">
              <img
                src={activeExp.imageUrl}
                alt={activeExp.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
