import { getTopic } from './topics';
import type { Persona, PersonaReaction, RoomReport, TopicId } from './types';

const EMOJI = ['😂', '😬', '❓', '🔥', '🧊', '💸', '🛠', '✨', '⚠️', '🧠', '⏱', '🎯', '🌀'] as const;

function clamp(value: number) {
  return Math.max(15, Math.min(98, Math.round(value)));
}

function includesAny(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

function strongestLine(transcript: string) {
  const sentences = transcript.split(/[.!?\n]+/).map((s) => s.trim()).filter(Boolean);
  if (!sentences.length) return 'The opening needs a concrete line before the room can react.';
  return sentences.sort((a, b) => b.length - a.length)[0];
}

function baseScores(topicId: TopicId, transcript: string) {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const short = wordCount < 18;
  const vague = !includesAny(transcript, ['because', 'so', 'proof', 'shipped', 'demo', 'customer', 'risk', 'next', 'before', 'after']);
  const hook = includesAny(transcript, ['before', 'dangerous', 'helps', 'goal', 'hard part', 'launch', 'real room', 'trust']);
  const proof = includesAny(transcript, ['proof', 'traction', 'customer', 'shipped', 'milestone', 'deadline', 'market', 'wedge']);
  const ai = includesAny(transcript, ['ai', 'agent', 'codex', 'startup', 'investor']);
  const comedy = topicId === 'standup-comedy';

  return {
    clarity: clamp(76 + (hook ? 9 : 0) + (proof ? 5 : 0) - (short ? 33 : 0) - (vague ? 15 : 0)),
    energy: clamp(70 + (hook ? 12 : 0) + (comedy ? 6 : 0) - (short ? 12 : 0)),
    trust: clamp(68 + (proof ? 17 : 0) - (vague ? 13 : 0) - (ai && !proof ? 5 : 0)),
    novelty: clamp(66 + (ai ? 15 : 0) + (hook ? 8 : 0) - (vague ? 5 : 0)),
    risk: clamp(30 + (includesAny(transcript, ['cringe', 'dangerous', 'missed', 'risk']) ? 18 : 0) + (short ? 12 : 0)),
    landing: clamp(70 + (hook ? 11 : 0) + (proof ? 6 : 0) - (short ? 28 : 0) - (vague ? 9 : 0))
  };
}

function visibleReactionEmoji(persona: Persona) {
  const reaction = persona.simulatorDefaults?.defaultVisibleReaction;
  if (reaction === 'loud_laugh') return '😂';
  if (reaction === 'chuckle') return '😄';
  if (reaction === 'smirk') return '😏';
  if (reaction === 'silent_nod') return '🙂';
  if (reaction === 'inward_smile') return '😊';
  return null;
}

function chooseEmoji(topicId: TopicId, persona: Persona, transcript: string, scores: RoomReport['scores']) {
  const text = transcript.toLowerCase();
  if (scores.clarity < 60) return '❓';
  if (persona.id.includes('investor') && !includesAny(text, ['proof', 'traction', 'customer', 'market'])) return '💸';
  if ((persona.id.includes('technical') || persona.id.includes('engineer')) && !includesAny(text, ['how', 'built', 'architecture', 'api', 'implementation', 'technical'])) return '🛠';
  if (topicId === 'standup-comedy') {
    const defaultEmoji = visibleReactionEmoji(persona);
    if (includesAny(text, ['give it up', 'applause', 'clap', 'crowdwork crowdwork'])) return persona.id === 'george' ? '😬' : '🧊';
    if (includesAny(text, ['hurt', 'dangerous', 'punchline', 'joke', 'closer'])) return defaultEmoji ?? '😂';
  }
  if (topicId === 'hard-conversation' && includesAny(text, ['missed', 'risk', 'agree'])) return '⚠️';
  if (scores.novelty > 78) return '🔥';
  if (scores.trust > 78) return '🎯';
  return EMOJI[(persona.name.length + transcript.length) % EMOJI.length];
}

function reactionForPersona(topicId: TopicId, persona: Persona, transcript: string, scores: RoomReport['scores']): PersonaReaction {
  const short = transcript.trim().split(/\s+/).filter(Boolean).length < 18;
  const vague = scores.clarity < 65;
  const emoji = chooseEmoji(topicId, persona, transcript, scores);
  const clearHook = includesAny(transcript, ['helps', 'before', 'hard part', 'goal', 'started', 'missed']);
  const proofMissing = !includesAny(transcript, ['proof', 'traction', 'customer', 'shipped', 'milestone', 'deadline']);

  const topicCopy: Record<TopicId, { landed: string; weak: string; question: string; fix: string }> = {
    'standup-comedy': {
      landed: clearHook ? 'The premise has a real laugh shape: setup, turn, sting.' : 'There is a recognizable comic premise trying to emerge.',
      weak: short ? 'Needs more setup before the punchline; right now the room has to fill in context.' : 'Watch the cringe edge and trim any dead air between setup and punchline.',
      question: 'What is the exact laugh beat, and can the setup be understood in five seconds?',
      fix: 'Make the setup concrete, then land the punchline as the shortest sentence in the bit.'
    },
    'founder-pitch': {
      landed: clearHook ? 'The “before the real room hears it” hook makes the value instantly demoable.' : 'The room understands there is a product trying to reduce communication risk.',
      weak: proofMissing ? 'Needs proof: market wedge, traction signal, or a concrete user workflow.' : 'The wedge is promising; tighten the buyer and activation moment.',
      question: persona.id.includes('technical') ? 'How does the rehearsal engine decide reactions without pretending to analyze real people?' : 'Who feels this pain weekly, and what proof says they will pay or switch?',
      fix: 'Add one buyer, one repeated pain, one proof point, and a 10-second workflow.'
    },
    'job-interview': {
      landed: 'The strongest part is ownership under constraints and a concrete sequence of action.',
      weak: vague ? 'Needs more specific metrics, tradeoffs, or failure modes to prove depth.' : 'Good story; make the business impact explicit at the end.',
      question: 'What changed because of your work, and what tradeoff would you make differently now?',
      fix: 'Use STAR in four crisp beats: situation, action, measurable result, learned tradeoff.'
    },
    'product-demo': {
      landed: 'The goal of finding confusion before launch is easy to understand.',
      weak: vague ? 'Needs more “what am I seeing right now?” narration for first-time users.' : 'The workflow is clear; highlight the aha moment sooner.',
      question: 'What changes on screen in the first 20 seconds that proves value?',
      fix: 'Open with the painful before-state, then show one visible reaction and one report line.'
    },
    'team-update': {
      landed: 'The room can hear progress, risk, and a possible ask.',
      weak: 'Make owners and dates impossible to miss so teammates know what to do next.',
      question: 'What is blocked, who owns the next move, and by when?',
      fix: 'Format as shipped / blocked / ask / owner / deadline.'
    },
    'hard-conversation': {
      landed: 'The conversation names a specific event and moves toward an agreement.',
      weak: 'Soften blame while keeping the ask clear; lead with shared outcome.',
      question: 'What do you want them to do differently without making them defend their identity?',
      fix: 'Use: shared goal, observable fact, impact, request, invitation to add context.'
    }
  };

  const personaComedyCopy = topicId === 'standup-comedy'
    ? {
        landed: persona.id === 'ondrey' ? 'The structure lens sees the premise forming; the closer needs to pay off with an actual punchline.' : persona.id === 'george' ? 'The editorial lens likes tight, unexpected lines with no wasted phrasing.' : persona.id === 'tony' ? 'The product-builder lens rewards the fast joke economy: clean setup, sharp turn, no filler.' : persona.id.includes('regular') ? 'The opener/premise has a recognizable club shape; now it needs tighter laugh density.' : persona.id.includes('edgy') ? 'The AI insecurity angle can feel original if the punchline stays specific.' : persona.id.includes('confused') ? 'The setup is understandable when the speaker gives context before the turn.' : topicCopy[topicId].landed,
        weak: persona.id === 'ondrey' ? 'Setups are judged against laugh rhythm: long setup, filler crowdwork, or a closer without jokes will drop the room.' : persona.id === 'george' ? 'Cut corporate or AI-sounding filler; every sentence needs a punchline, turn, or clean callback.' : persona.id === 'tony' ? 'Overexplaining, soft turns, and a weak closer make the set feel like product copy instead of comedy.' : persona.id.includes('regular') ? 'Track laugh frequency: no long silence unless the next line pays it off.' : persona.id.includes('edgy') ? 'Avoid hacky AI premises or repeating the same joke shape.' : persona.id.includes('coworker') ? 'Watch cringe/offense risk if the joke begs for approval instead of earning laughs.' : persona.id.includes('confused') ? 'Long setups lose this listener before the punchline arrives.' : topicCopy[topicId].weak,
        question: persona.id === 'ondrey' ? 'Where is the first laugh, how frequent are the laughs, and does the closer actually pay off?' : persona.id === 'george' ? 'Which lines are actual jokes versus vibes, and can the filler be cut by half?' : persona.id === 'tony' ? 'Where is the actual joke, and can the setup be cut without losing the punchline?' : persona.id.includes('regular') ? 'Where is the first laugh, and is there another laugh every few beats?' : persona.id.includes('edgy') ? 'Is this topic original, or have comics already done the same AI insecurity angle?' : persona.id.includes('coworker') ? 'Does any line feel like a flex, stolen joke, or applause beg instead of a joke?' : persona.id.includes('confused') ? 'Can the setup be understood in five seconds before the punchline?' : 'Does the closer contain an actual joke, not just a button or applause request?',
        fix: persona.id === 'ondrey' ? 'Compress the setup, keep punchlines frequent, and rewrite the closer as the sharpest joke in the set.' : persona.id === 'george' ? 'Remove filler and telegraphed lines; keep only tight angles, unexpected turns, and one clean closer callback.' : persona.id === 'tony' ? 'Cut the filler, sharpen the turn, and make the closer a harder punchline instead of a soft ending.' : persona.id.includes('regular') ? 'Cut setup words until the first laugh arrives faster, then preserve rhythm.' : persona.id.includes('edgy') ? 'Swap generic AI lines for one weird personal detail only you would say.' : persona.id.includes('coworker') ? 'Remove applause begging/name-dropping and let the joke carry status.' : persona.id.includes('confused') ? 'Add one concrete premise sentence before the turn.' : 'Make the closer a real punchline, not just an ending.'
      }
    : null;
  const copy = personaComedyCopy ?? topicCopy[topicId];

  return {
    personaId: persona.id,
    personaName: persona.name,
    emoji,
    label: emoji === '😂' ? 'laugh landed' : emoji === '😬' ? 'cringe risk' : emoji === '❓' ? 'lost me' : emoji === '💸' ? 'wants proof' : emoji === '🛠' ? 'asks how' : emoji === '🔥' ? 'strong hook' : emoji === '🎯' ? 'clear' : emoji === '⚠️' ? 'risky but useful' : 'engaged',
    gutReaction: `${persona.name} is listening for ${persona.caresAbout.slice(0, 2).join(' and ')}. ${persona.rehearsalLens ? `${persona.rehearsalLens} ` : ''}${vague ? 'They are interested but not fully oriented yet.' : 'They can follow the arc and have a useful next question.'}`,
    bestMoment: copy.landed,
    weakPoint: copy.weak,
    hardQuestion: copy.question,
    suggestedFix: copy.fix
  };
}

export function runMockRehearsal(topicId: TopicId | string, transcript: string, registeredPersonas?: Persona[]): RoomReport {
  const topic = getTopic(topicId);
  const cleanTranscript = transcript.trim() || topic.demoSeed;
  const audience = registeredPersonas?.length ? registeredPersonas : topic.personas;
  const scores = baseScores(topic.id, cleanTranscript);
  const comedy = topic.id === 'standup-comedy' ? analyzeComedySet(cleanTranscript) : null;
  const adjustedScores = comedy ? adjustComedyScores(scores, comedy) : scores;
  const personaReactions = audience.map((persona) => reactionForPersona(topic.id, persona, cleanTranscript, adjustedScores));
  const cold = adjustedScores.landing < 55;
  const warm = adjustedScores.landing >= 55 && adjustedScores.landing < 78;
  const strongest = strongestLine(cleanTranscript);
  const hardestQuestions = personaReactions.map((r) => r.hardQuestion).slice(0, 4);
  const comedyNotes = comedy ? buildComedyConsensus(comedy) : null;

  return {
    topicId: topic.id,
    roomTemperature: cold ? 'Chilly: the room needs more setup before it trusts the message.' : warm ? 'Warming: the room gets the promise, but wants sharper proof and pacing.' : 'Hot: the room understands the hook and has productive questions.',
    scores: adjustedScores,
    personaReactions,
    consensus: {
      strongestLine: strongest,
      whereRoomGotLost: comedyNotes?.whereLost ?? (adjustedScores.clarity < 65 ? 'The room got lost because it needs more setup, fewer abstractions, and one concrete example.' : 'The room mostly followed; confusion clusters around proof, next step, or mechanism.'),
      highestRiskMoment: comedyNotes?.riskMoment ?? (adjustedScores.risk > 45 ? 'The riskiest moment is the line that could sound vague, defensive, or socially costly without context.' : 'The main risk is under-explaining the stakes, not tone.'),
      whatLanded: [
        strongest,
        personaReactions[0]?.bestMoment ?? 'The topic has a clear rehearsal purpose.',
        comedyNotes?.criteriaLine ?? (adjustedScores.novelty > 75 ? 'The idea feels fresh enough to earn attention.' : 'The structure is understandable enough to improve quickly.')
      ],
      hardestQuestions: comedyNotes ? [comedyNotes.hardQuestion, ...hardestQuestions].slice(0, 4) : hardestQuestions,
      improvedVersion: buildImprovedVersion(topic.id, cleanTranscript, adjustedScores, comedy)
    }
  };
}

type ComedySignals = {
  criteria: string[];
  redFlags: string[];
  hasQuickOpener: boolean;
  hasSharpPunchline: boolean;
  hasCloser: boolean;
};

function analyzeComedySet(transcript: string): ComedySignals {
  const text = transcript.toLowerCase();
  const sentences = transcript.split(/[.!?\n]+/).map((s) => s.trim()).filter(Boolean);
  const firstSentenceWords = sentences[0]?.split(/\s+/).filter(Boolean).length ?? 0;
  const criteria = [
    firstSentenceWords > 0 && firstSentenceWords <= 16 ? 'quick opener' : '',
    sentences.length >= 2 ? 'clear setups' : '',
    includesAny(text, ['punchline', 'that hurt', 'because it was right', 'commitment issues', 'joke']) ? 'sharp punchlines' : '',
    sentences.length >= 3 || includesAny(text, ['laugh', 'laughter', 'punchline']) ? 'laugh frequency' : '',
    !includesAny(text, ['pause', 'silence', 'dead air']) ? 'no silence without laughter' : '',
    includesAny(text, ['ai', 'calendar', 'room', 'cofounder', 'insecurities']) ? 'original topic' : '',
    includesAny(text, ['closer', 'finally', 'last thing']) ? 'strong closer' : ''
  ].filter(Boolean);
  const redFlags = [
    includesAny(text, ['stolen', 'borrowed joke']) ? 'stolen jokes' : '',
    (text.match(/crowdwork/g)?.length ?? 0) >= 2 && !includesAny(text, ['joke', 'punchline', 'laugh']) ? 'crowdwork without jokes' : '',
    includesAny(text, ['closer']) && !includesAny(text, ['joke', 'punchline', 'laugh']) ? 'closer without jokes' : '',
    firstSentenceWords > 28 ? 'unreasonably long setups' : '',
    includesAny(text, ['i met elon', 'i met drake', 'i know elon', 'name drop']) ? 'name dropping or other flex with no jokes' : '',
    (text.match(/same joke|again|repeat/g)?.length ?? 0) >= 2 ? 'excessive use of the same joke' : '',
    includesAny(text, ['give it up for me', 'clap', 'applause']) ? 'begging for applause' : ''
  ].filter(Boolean);
  return {
    criteria,
    redFlags,
    hasQuickOpener: criteria.includes('quick opener'),
    hasSharpPunchline: criteria.includes('sharp punchlines'),
    hasCloser: criteria.includes('strong closer')
  };
}

function adjustComedyScores(scores: RoomReport['scores'], comedy: ComedySignals): RoomReport['scores'] {
  const redPenalty = comedy.redFlags.length * 11;
  const criteriaBonus = comedy.criteria.length * 3;
  return {
    ...scores,
    clarity: clamp(scores.clarity + (comedy.hasQuickOpener ? 4 : -9) - Math.min(redPenalty, 24)),
    energy: clamp(scores.energy + criteriaBonus - Math.min(redPenalty, 26)),
    trust: clamp(scores.trust - Math.min(redPenalty, 35)),
    risk: clamp(scores.risk + redPenalty),
    landing: clamp(scores.landing + criteriaBonus - redPenalty - (comedy.hasSharpPunchline ? 0 : 12) - (comedy.hasCloser ? 0 : 5))
  };
}

function buildComedyConsensus(comedy: ComedySignals) {
  const criteriaList = 'quick opener, clear setups, sharp punchlines, laugh frequency, no silence without laughter, original topic, strong closer';
  const redFlagList = comedy.redFlags.length ? comedy.redFlags.join(', ') : 'no major comedy red flags detected';
  return {
    criteriaLine: `Comedy set criteria checked: ${criteriaList}. Strongest signals here: ${comedy.criteria.join(', ') || 'none yet'}.`,
    whereLost: `Comedy room got confused around the set mechanics and needs more setup before the punchline. Judge it by: ${criteriaList}. Missing or weak signals: ${['quick opener', 'clear setups', 'sharp punchlines', 'laugh frequency', 'strong closer'].filter((item) => !comedy.criteria.includes(item)).join(', ') || 'mostly covered'}.`,
    riskMoment: `Comedy red flags detected: ${redFlagList}. Watch especially for begging for applause, name dropping, crowdwork without jokes, closer without jokes, long setups, repeated jokes, or stolen-joke risk.`,
    hardQuestion: 'Where is the first laugh, how many laughs per minute are expected, and does the closer contain an actual joke?'
  };
}

function buildImprovedVersion(topicId: TopicId, transcript: string, scores: RoomReport['scores'], comedy?: ComedySignals | null) {
  const opening: Record<TopicId, string> = {
    'standup-comedy': 'Here is the cleaner version: set the scene in one sentence, make the insecurity specific, then let the punchline be the shortest line.',
    'founder-pitch': 'room-reader is a rehearsal room for high-stakes communication: before you pitch, demo, interview, or have a hard conversation, you can see where a simulated room gets excited, confused, or skeptical.',
    'job-interview': 'A stronger answer would lead with the result, then show the decision you owned, the tradeoff you made, and the measurable impact.',
    'product-demo': 'In the revised demo, start by naming the user’s fear: “I do not know how this will land.” Then show speech input, audience reactions, and one report insight.',
    'team-update': 'A clearer update: “Shipped: the first milestone. Blocked: API review. Risk: launch slips if unresolved by Thursday. Ask: backend review today and design feedback tomorrow.”',
    'hard-conversation': 'A safer revision: “I want us to hit the launch together. When the handoff update came late, the risk increased. Can we agree on an earlier escalation signal next time?”'
  };
  const proofLine = scores.trust < 75 ? ' Add one concrete proof point, owner, metric, or example so the room does not have to trust a vibe.' : ' Keep the concrete proof; it is doing trust-building work.';
  const comedyLine = topicId === 'standup-comedy' && comedy
    ? ` Rewrite against comedy criteria: quick opener, clear setups, sharp punchlines, laugh frequency, no silence without laughter, original topic, strong closer. Remove red flags: ${comedy.redFlags.join(', ') || 'none detected'}.`
    : '';
  return `${opening[topicId]}${topicId === 'standup-comedy' ? comedyLine : proofLine} Original core to preserve: “${strongestLine(transcript)}”`;
}
