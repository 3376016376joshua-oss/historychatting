import React from 'react';
import { OrchestratorResponse } from '../types';
import { 
  LineChart, 
  Lightbulb, 
  HelpCircle, 
  BookOpen, 
  BrainCircuit, 
  MessageSquareQuote,
  Activity
} from 'lucide-react';

interface TeacherDashboardProps {
  latestResponse: OrchestratorResponse | null;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ latestResponse }) => {
  if (!latestResponse) {
    return (
      <div className="h-full bg-[#1a1a1a] border border-[#333] rounded-lg p-8 flex flex-col items-center justify-center text-[#444] text-center">
        <Activity className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-serif text-[#666]">Waiting for Data</h3>
        <p className="max-w-xs mx-auto mt-2 text-sm">
          Start a conversation to see the real-time AI Orchestrator analysis and teacher insights.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#1a1a1a] rounded-lg border border-[#333] flex flex-col overflow-hidden text-gray-300">
      <div className="bg-[#141414] p-4 border-b border-[#333] flex items-center justify-between">
        <h2 className="text-[#cfa558] font-bold flex items-center gap-2 font-serif tracking-wide">
          <BrainCircuit className="w-5 h-5 text-[#cfa558]" />
          Orchestrator Insights
        </h2>
        <span className="px-2 py-1 rounded bg-[#0a0a0a] text-[#555] text-[10px] uppercase tracking-wider font-bold border border-[#222]">
          Live Analysis
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        
        {/* Emotion Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1f1f1f] p-4 rounded border border-[#333]">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-1">Detected Emotion</h4>
            <p className="text-base font-semibold text-gray-200 capitalize">{latestResponse.emotion_tag}</p>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded border border-[#333]">
             <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-1">Internal Guess</h4>
            <p className="text-base font-semibold text-gray-200 capitalize">{latestResponse.emotion_guess}</p>
          </div>
        </div>

        {/* Teacher Note */}
        <div className="bg-[#252520] p-4 rounded border border-[#cfa558]/30 relative">
          <div className="absolute top-4 right-4">
            <Lightbulb className="w-5 h-5 text-[#cfa558]" />
          </div>
          <h4 className="text-xs font-bold text-[#cfa558] uppercase mb-2">Teacher Note</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {latestResponse.teacher_note}
          </p>
        </div>

        {/* Knowledge Covered */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#666] uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Knowledge Covered
          </h4>
          <div className="flex flex-wrap gap-2">
            {latestResponse.knowledge_covered && latestResponse.knowledge_covered.length > 0 ? (
              latestResponse.knowledge_covered.map((point, idx) => (
                <span key={idx} className="bg-[#1f2937] text-gray-300 px-3 py-1.5 rounded-sm text-xs border border-[#374151] font-medium">
                  {point}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm italic">No specific concepts recorded yet.</span>
            )}
          </div>
        </div>

        {/* Confusion & Focus */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[#1f1f1f] p-4 rounded border border-[#333]">
            <h4 className="text-[10px] font-bold text-rose-400 uppercase mb-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Potential Confusion
            </h4>
            <p className="text-gray-400 text-sm">
              {latestResponse.possible_confusion || "None detected."}
            </p>
          </div>
          
          <div className="bg-[#1f1f1f] p-4 rounded border border-[#333]">
             <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1">
              <LineChart className="w-3 h-3" />
              Student Focus
            </h4>
            <p className="text-gray-400 text-sm">
              {latestResponse.student_focus}
            </p>
          </div>
        </div>

        {/* Suggested Follow-up */}
        <div className="border-t border-[#222] pt-4">
          <h4 className="text-[10px] font-bold text-[#555] uppercase mb-2 flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4" />
            Suggested Follow-up
          </h4>
          <p className="text-gray-400 italic text-sm bg-[#0a0a0a] p-3 rounded border border-[#222]">
            "{latestResponse.follow_up_question}"
          </p>
        </div>

        {/* Persona Metadata */}
        <div className="mt-4 pt-4 border-t border-[#222] flex justify-between items-center text-xs text-[#444]">
           <span>Style: {latestResponse.persona_style}</span>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;