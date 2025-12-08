export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface OrchestratorResponse {
  persona_name: string;
  persona_style: string;
  reply: string;
  emotion_tag: string;
  follow_up_question: string;
  teacher_note: string;
  student_focus: string;
  knowledge_covered: string[];
  possible_confusion: string;
  emotion_guess: string;
}

export type RegionType = 'EASTERN' | 'WESTERN' | 'MIDDLE_EASTERN' | 'OTHER';
export type GenderType = 'MALE' | 'FEMALE';

export interface PersonaProfile {
  name: string;
  title: string;
  era: string;
  bio_quote: string;
  key_achievements: string[];
  region: RegionType;
  gender: GenderType;
}

export interface SimulationSettings {
  targetPerson: string;
  studentGrade: string;
  language: string;
}

export enum ConnectionStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
  SUCCESS = 'success',
}