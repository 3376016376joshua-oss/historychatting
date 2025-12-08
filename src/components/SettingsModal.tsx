import React, { useState } from 'react';
import { SimulationSettings } from '../types';
import { User, Play } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: SimulationSettings) => void;
  initialSettings: SimulationSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onStart, initialSettings }) => {
  const [settings, setSettings] = useState<SimulationSettings>(initialSettings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(settings);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1c1c1c] border border-[#333] rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-[#141414] border-b border-[#333] p-6 flex justify-between items-center">
          <h2 className="text-[#cfa558] text-xl font-serif font-bold flex items-center gap-2 uppercase tracking-widest">
            <User className="w-5 h-5" />
            Initialize Session
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Person */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#888] uppercase tracking-wider flex items-center gap-2">
              Target Historical Figure
            </label>
            <input
              type="text"
              required
              value={settings.targetPerson}
              onChange={(e) => setSettings({ ...settings, targetPerson: e.target.value })}
              placeholder="e.g. Qin Shi Huang"
              className="w-full bg-[#2a2a2a] text-[#e0e0e0] px-4 py-3 border border-[#333] focus:border-[#cfa558] outline-none transition-colors placeholder-[#555]"
            />
          </div>

          {/* Grade Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#888] uppercase tracking-wider flex items-center gap-2">
              Student Grade Level
            </label>
            <select
              value={settings.studentGrade}
              onChange={(e) => setSettings({ ...settings, studentGrade: e.target.value })}
              className="w-full bg-[#2a2a2a] text-[#e0e0e0] px-4 py-3 border border-[#333] focus:border-[#cfa558] outline-none transition-colors"
            >
              <option value="Elementary (Grade 1-5)">Elementary (Grade 1-5)</option>
              <option value="Middle School (Grade 6-8)">Middle School (Grade 6-8)</option>
              <option value="High School (Grade 9-12)">High School (Grade 9-12)</option>
              <option value="University">University</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#888] uppercase tracking-wider flex items-center gap-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full bg-[#2a2a2a] text-[#e0e0e0] px-4 py-3 border border-[#333] focus:border-[#cfa558] outline-none transition-colors"
            >
              <option value="English">English</option>
              <option value="zh-CN">Simplified Chinese (zh-CN)</option>
              <option value="zh-TW">Traditional Chinese (zh-TW)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#cfa558] hover:bg-[#b08d3e] text-[#121212] font-bold uppercase tracking-widest py-4 px-6 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Enter History
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;