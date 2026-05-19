export type TopicId =
  | 'standup-comedy'
  | 'founder-pitch'
  | 'job-interview'
  | 'product-demo'
  | 'team-update'
  | 'hard-conversation';

export type Persona = {
  id: string;
  name: string;
  role: string;
  caresAbout: string[];
  reactsTo: string[];
  color: string;
  publicHandleOrRole?: string;
  archetype?: string;
  rehearsalLens?: string;
  safetyFraming?: string;
  lowConfidence?: boolean;
  confidenceNotes?: string[];
  sourceConfidence?: {
    overall: 'low' | 'medium' | 'high';
    name: 'low' | 'medium' | 'high';
    role: 'low' | 'medium' | 'high';
    comedyTaste: 'low' | 'medium' | 'high';
    feedbackVoice: 'low' | 'medium' | 'high';
  };
  comedyTaste?: {
    preferredStyles: string[];
    avoidedStyles: string[];
    laughThreshold: 'low' | 'medium' | 'high';
  };
  criteriaWeights?: Record<string, number>;
  redFlagSensitivity?: Record<string, number>;
  simulatorDefaults?: {
    defaultVisibleReaction: 'loud_laugh' | 'chuckle' | 'smirk' | 'silent_nod' | 'inward_smile';
    positiveSignals: string[];
    negativeSignals: string[];
  };
  feedbackVoice?: {
    toneTags: string[];
    sampleQuoteGreatSet: string;
    sampleQuoteMediocreSet: string;
    sampleQuoteBombingSet: string;
  };
};

export type Topic = {
  id: TopicId;
  label: string;
  accent: string;
  criteria: string[];
  demoSeed: string;
  safetyCopy: string;
  personaDisclaimer: string;
  personas: Persona[];
};

export type PersonaReaction = {
  personaId: string;
  personaName: string;
  emoji: string;
  label: string;
  gutReaction: string;
  bestMoment: string;
  weakPoint: string;
  hardQuestion: string;
  suggestedFix: string;
};

export type RoomReport = {
  topicId: TopicId;
  roomTemperature: string;
  scores: { clarity: number; energy: number; trust: number; novelty: number; risk: number; landing: number };
  personaReactions: PersonaReaction[];
  consensus: { strongestLine: string; whereRoomGotLost: string; highestRiskMoment: string; whatLanded: string[]; hardestQuestions: string[]; improvedVersion: string };
};
