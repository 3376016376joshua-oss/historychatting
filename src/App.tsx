import React, { useState, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import TeacherDashboard from './components/TeacherDashboard';
import SettingsModal from './components/SettingsModal';
import Sidebar, { getAvatarUrl } from './components/Sidebar';
import { ChatMessage, OrchestratorResponse, SimulationSettings, ConnectionStatus, PersonaProfile } from './types.ts';
import { sendMessageToOrchestrator, generatePersonaProfile } from './services/geminiService';
import { BrainCircuit, X, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const [latestAnalysis, setLatestAnalysis] = useState<OrchestratorResponse | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [settings, setSettings] = useState<SimulationSettings>({
    targetPerson: 'Qin Shi Huang',
    studentGrade: 'Middle School (Grade 6-8)',
    language: 'English'
  });

  const [profile, setProfile] = useState<PersonaProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const handleStartSession = useCallback(async (newSettings: SimulationSettings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
    setMessages([]);
    setLatestAnalysis(null);
    setProfile(null);
    setIsProfileLoading(true);

    try {
      const generatedProfile = await generatePersonaProfile(newSettings.targetPerson, newSettings.language);
      setProfile(generatedProfile);
      
      // Initial greeting message from the historical figure
      const initialGreeting: ChatMessage = {
          id: 'init',
          role: 'assistant',
          content: `Greetings. I am ${generatedProfile.name}. I sense you come from a distant time. Speak, what brings you to my era?`,
          timestamp: new Date()
      };
      setMessages([initialGreeting]);

    } catch (err) {
      console.error("Failed to load profile", err);
      // Fallback
      setProfile({
        name: newSettings.targetPerson,
        title: "Historical Figure",
        era: "Unknown Era",
        bio_quote: "I am ready to answer your questions.",
        key_achievements: ["History", "Leadership", "Legacy"],
        region: 'WESTERN', // Default
        gender: 'MALE' // Default
      });
    } finally {
      setIsProfileLoading(false);
    }

  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || status === ConnectionStatus.LOADING) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setStatus(ConnectionStatus.LOADING);

    try {
      const response = await sendMessageToOrchestrator(
        inputValue,
        messages, 
        settings
      );

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setLatestAnalysis(response);
      setStatus(ConnectionStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(ConnectionStatus.ERROR);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "The annals of history are currently unreachable. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleReset = () => {
      setIsSettingsOpen(true);
  }

  // Calculate avatar URL based on loaded profile
  const currentAvatarUrl = profile ? getAvatarUrl(profile) : undefined;

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar (Left) */}
      <aside className="hidden md:block w-[350px] flex-shrink-0 z-20">
        <Sidebar 
          profile={profile} 
          onReset={handleReset} 
          isLoading={isProfileLoading} 
        />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header Overlay for Titles/Controls */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-10">
           <div className="bg-[#1a1a1a]/80 backdrop-blur border border-[#333] px-4 py-2 rounded-sm pointer-events-auto">
             <h1 className="text-[#cfa558] font-serif text-lg font-bold tracking-[0.2em] uppercase">
                Eternal Dialogue
             </h1>
           </div>
           
           <div className="flex gap-2 pointer-events-auto">
             <button 
                onClick={() => setIsDashboardOpen(true)}
                className="bg-[#1a1a1a] border border-[#333] hover:border-[#cfa558] text-[#cfa558] p-2 rounded-sm transition-all"
                title="Teacher Insights"
             >
                <BrainCircuit className="w-5 h-5" />
             </button>

             <button 
                onClick={handleReset}
                className="bg-[#1a1a1a] border border-[#333] hover:border-red-500 text-[#888] hover:text-red-500 p-2 rounded-sm transition-all flex items-center gap-2"
                title="End Session & Select New Character"
             >
                <LogOut className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Exit</span>
             </button>

             <div className="flex items-center gap-2 bg-[#1a1a1a]/80 backdrop-blur border border-[#333] px-3 py-2 rounded-sm hidden lg:flex">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] uppercase font-bold text-[#888] tracking-widest">System Online</span>
             </div>
           </div>
        </header>

        <ChatInterface 
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={handleSendMessage}
          status={status}
          personaName={profile?.name || settings.targetPerson}
          avatarUrl={currentAvatarUrl}
        />
      </main>

      {/* Teacher Dashboard Modal */}
      {isDashboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
           <div className="h-full w-full md:w-[450px] bg-[#1a1a1a] border-l border-[#333] shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="p-4 flex justify-end">
                <button onClick={() => setIsDashboardOpen(false)} className="text-[#666] hover:text-white">
                    <X className="w-6 h-6" />
                </button>
              </div>
              <div className="h-[calc(100%-60px)] px-4 pb-4">
                 <TeacherDashboard latestResponse={latestAnalysis} />
              </div>
           </div>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onStart={handleStartSession}
        initialSettings={settings}
      />
    </div>
  );
};

export default App;