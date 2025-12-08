import React, { useState, useEffect } from 'react';
import { PersonaProfile } from '../types';
import { RefreshCw, MapPin, Award, User, Quote } from 'lucide-react';

interface SidebarProps {
  profile: PersonaProfile | null;
  onReset: () => void;
  isLoading: boolean;
}

// More stable Wikimedia Commons thumbnails
const AVATAR_MAP: Record<string, string> = {
  'EASTERN_MALE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Qin_Shi_Huang.jpg/800px-Qin_Shi_Huang.jpg', 
  'WESTERN_MALE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg', 
  'EASTERN_FEMALE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Empress_Wu_Zetian.jpg/800px-Empress_Wu_Zetian.jpg', 
  'WESTERN_FEMALE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Statue-Kleopatra-VII.jpg/800px-Statue-Kleopatra-VII.jpg',
  'MIDDLE_EASTERN_MALE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Saladin2.jpg/800px-Saladin2.jpg',
  'MIDDLE_EASTERN_FEMALE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Zenobia_coin.jpg/800px-Zenobia_coin.jpg',
  'OTHER': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat_skull_msc.jpg/640px-Cat_skull_msc.jpg'
};

export const getAvatarUrl = (profile: PersonaProfile | null): string => {
  if (!profile) return '';
  
  let key = `${profile.region}_${profile.gender}`;
  
  // Fuzzy match defaults
  if (!AVATAR_MAP[key]) {
      if (profile.region === 'EASTERN') key = 'EASTERN_MALE';
      else if (profile.region === 'WESTERN') key = 'WESTERN_MALE';
      else if (profile.region === 'MIDDLE_EASTERN') key = 'MIDDLE_EASTERN_MALE';
      else key = 'WESTERN_MALE'; 
  }

  return AVATAR_MAP[key] || AVATAR_MAP['WESTERN_MALE'];
};

const Sidebar: React.FC<SidebarProps> = ({ profile, onReset, isLoading }) => {
  const [imgError, setImgError] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string>('');

  // Reset error state when profile changes
  useEffect(() => {
    if (profile?.name !== currentProfileId) {
      setImgError(false);
      if (profile?.name) setCurrentProfileId(profile.name);
    }
  }, [profile, currentProfileId]);

  if (isLoading || !profile) {
    return (
      <div className="w-full h-full bg-[#141414] border-r border-[#222] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-32 h-32 rounded-full bg-[#1a1a1a] border-2 border-[#222]"></div>
        <div className="h-6 w-3/4 bg-[#1a1a1a] rounded"></div>
        <div className="h-4 w-1/2 bg-[#1a1a1a] rounded"></div>
      </div>
    );
  }

  const realisticUrl = getAvatarUrl(profile);
  // Fallback to a nice artistic generated avatar if the real image fails
  const fallbackUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${profile.name}&backgroundColor=cfa558&backgroundType=gradientLinear`;

  return (
    <div className="w-full h-full bg-[#141414] border-r border-[#222] flex flex-col text-[#e0e0e0] overflow-y-auto custom-scrollbar">
      {/* Profile Header */}
      <div className="p-8 flex flex-col items-center text-center border-b border-[#222]">
        <div className="w-48 h-48 rounded-full border-4 border-[#cfa558]/30 p-1.5 mb-6 shadow-2xl relative group">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] relative">
               <img 
                 src={imgError ? fallbackUrl : realisticUrl} 
                 alt={profile.name}
                 onError={() => setImgError(true)}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
               />
               <div className="absolute inset-0 ring-inset ring-2 ring-black/20 rounded-full pointer-events-none"></div>
            </div>
            {/* Decorative decorative elements */}
            <div className="absolute -bottom-2 -right-2 bg-[#0f0f0f] border border-[#cfa558] text-[#cfa558] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                {profile.region}
            </div>
        </div>
        
        <h1 className="text-[#cfa558] text-2xl font-serif font-bold uppercase tracking-widest mb-2 leading-tight">
          {profile.name}
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{profile.title}</p>
      </div>

      {/* Info Sections */}
      <div className="p-8 space-y-10 flex-1">
        
        {/* Era */}
        <div className="space-y-3">
          <h3 className="text-[#cfa558] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Era
          </h3>
          <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-sm border-l-2 border-l-[#cfa558]">
            <p className="text-sm text-gray-400 font-serif">{profile.era}</p>
          </div>
        </div>

        {/* Bio/Who am I */}
        <div className="space-y-3">
          <h3 className="text-[#cfa558] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
             <User className="w-4 h-4" />
             Who Am I?
          </h3>
          <div className="relative">
             <Quote className="w-8 h-8 text-[#222] absolute -top-4 -left-2 z-0" />
             <p className="text-sm text-gray-400 italic leading-relaxed relative z-10 pl-2">
               "{profile.bio_quote}"
             </p>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="text-[#cfa558] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4" />
            Key Achievements
          </h3>
          <ul className="space-y-3">
            {profile.key_achievements.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-gray-400 group">
                <span className="text-[#cfa558] mt-1.5 opacity-50 group-hover:opacity-100 transition-opacity">•</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Footer / Reset */}
      <div className="p-6 border-t border-[#222]">
        <button 
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3 border border-[#333] text-gray-500 hover:text-[#cfa558] hover:border-[#cfa558] transition-all text-xs uppercase tracking-widest rounded-sm bg-[#1a1a1a] hover:bg-[#1f1f1f]"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Conversation
        </button>
      </div>
    </div>
  );
};

export default Sidebar;