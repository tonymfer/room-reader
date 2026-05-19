import type { Persona, Topic, TopicId } from './types';

export const SAFETY_COPY = 'room-reader uses editable audience cards and topic-specific lenses for rehearsal. It does not analyze, diagnose, or clone real personalities.';
export const PERSONA_DISCLAIMER = 'Personas are rehearsal assumptions, not psychological profiles.';

const p = (id: string, name: string, role: string, caresAbout: string[], reactsTo: string[], color: string): Persona => ({ id, name, role, caresAbout, reactsTo, color });

export const TOPICS: Topic[] = [
  { id: 'standup-comedy', label: 'Standup comedy', accent: '#ff7ab6', criteria: ['quick opener','clear setups','sharp punchlines','laugh frequency','strong closer'], demoSeed: 'I started using AI to write jokes, which is dangerous because now even my insecurities have a cofounder. I asked it for a punchline and it said, “Have you tried being more relatable?” That hurt because it was right. For my closer: turns out the robot was my most honest friend and somehow still refused to come to my show.', safetyCopy: SAFETY_COPY, personaDisclaimer: PERSONA_DISCLAIMER, personas: [
    {
      id: 'ondrey',
      name: 'Ondrey',
      role: 'stand-up comedy coach and open mic organizer',
      publicHandleOrRole: 'stand-up comedy coach and open mic organizer',
      archetype: 'structure-focused comedy audience member',
      rehearsalLens: 'Assumes the audience member values efficient joke writing, consistent laugh rhythm, and strong closers during stand-up rehearsals.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      caresAbout: ['quick opener', 'clear setups', 'sharp punchlines', 'laugh frequency', 'strong closer'],
      reactsTo: ['quick laugh after efficient setup', 'visible approval for strong closer', 'engagement when punchlines stay frequent'],
      comedyTaste: { preferredStyles: ['observational', 'roast', 'storytelling', 'crowdwork'], avoidedStyles: ['anti-humor', 'political', 'cringe'], laughThreshold: 'medium' },
      criteriaWeights: { quick_opener: 9, clear_setups: 10, sharp_punchlines: 10, laugh_frequency: 10, no_silence_without_laughter: 9, original_topic: 8, strong_closer: 10 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 9, closer_without_jokes: 10, unreasonably_long_setups: 10, name_dropping_flex_without_jokes: 8, excessive_joke_repetition: 8, begging_for_applause: 9 },
      simulatorDefaults: { defaultVisibleReaction: 'chuckle', positiveSignals: ['quick laugh after efficient setup', 'visible approval for strong closer', 'engagement when punchlines stay frequent'], negativeSignals: ['attention drop during long setup', 'reduced reaction to filler crowdwork', 'visible disengagement when applause is requested directly'] },
      feedbackVoice: { toneTags: ['analytical', 'blunt', 'generous'], sampleQuoteGreatSet: 'That was tight — strong structure, real punchlines, and the closer actually paid off.', sampleQuoteMediocreSet: 'The ideas are there, but the setups are taking too long compared to the laughs.', sampleQuoteBombingSet: 'This felt more like talking on stage than delivering jokes.' },
      color: '#ff7ab6'
    },
    {
      id: 'george',
      name: 'George',
      role: 'marketing professional, Forbes Councils member',
      publicHandleOrRole: 'marketing professional, Forbes Councils member',
      archetype: 'marketing operator with sharp editorial instincts',
      rehearsalLens: 'Editable rehearsal assumption card for stand-up practice. Not a profile of a real person.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      caresAbout: ['sharp punchlines', 'original topic', 'strong closer', 'tight phrasing'],
      reactsTo: ['tight punchline with no wasted words', 'unexpected angle on a familiar topic', 'clean callback at the closer'],
      comedyTaste: { preferredStyles: ['deadpan', 'observational', 'dark', 'wordplay'], avoidedStyles: ['cringe', 'crowdwork'], laughThreshold: 'high' },
      criteriaWeights: { quick_opener: 8, clear_setups: 7, sharp_punchlines: 10, laugh_frequency: 8, no_silence_without_laughter: 9, original_topic: 9, strong_closer: 9 },
      redFlagSensitivity: { stolen_jokes: 8, crowdwork_without_jokes: 9, closer_without_jokes: 9, unreasonably_long_setups: 9, name_dropping_flex_without_jokes: 8, excessive_joke_repetition: 7, begging_for_applause: 9 },
      simulatorDefaults: { defaultVisibleReaction: 'smirk', positiveSignals: ['tight punchline with no wasted words', 'unexpected angle on a familiar topic', 'clean callback at the closer'], negativeSignals: ['AI-sounding phrasing or corporate tone', 'overlong setup that telegraphs the punchline', 'name-dropping with no joke attached'] },
      feedbackVoice: { toneTags: ['blunt', 'dry', 'analytical'], sampleQuoteGreatSet: 'Tight. Every line earned its spot, closer hit clean.', sampleQuoteMediocreSet: 'Setups dragged. Two good punchlines buried in filler.', sampleQuoteBombingSet: 'No jokes, just vibes. Cut half of it and start over.' },
      color: '#8bd3ff'
    },
    {
      id: 'tony',
      name: 'Tony',
      role: 'Web3 front-end developer',
      publicHandleOrRole: 'Web3 front-end developer',
      archetype: 'fast-taste product builder with blunt editorial standards',
      rehearsalLens: 'Editable rehearsal assumption card for stand-up practice. Not a profile of a real person.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: true,
      confidenceNotes: [
        'Based only on explicit non-sensitive communication style signals from prior conversations.',
        'Comedy taste was not directly provided, so style preferences use conservative rehearsal defaults.'
      ],
      sourceConfidence: { overall: 'low', name: 'high', role: 'medium', comedyTaste: 'low', feedbackVoice: 'medium' },
      caresAbout: ['fast joke economy', 'sharp punchlines', 'simple original angle', 'strong closer'],
      reactsTo: ['fast joke economy', 'sharp punchline with no filler', 'simple but original angle'],
      comedyTaste: { preferredStyles: ['deadpan', 'observational', 'wordplay', 'roast'], avoidedStyles: ['cringe', 'political', 'storytelling'], laughThreshold: 'high' },
      criteriaWeights: { quick_opener: 9, clear_setups: 9, sharp_punchlines: 10, laugh_frequency: 9, no_silence_without_laughter: 8, original_topic: 8, strong_closer: 9 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 9, closer_without_jokes: 10, unreasonably_long_setups: 9, name_dropping_flex_without_jokes: 9, excessive_joke_repetition: 8, begging_for_applause: 10 },
      simulatorDefaults: { defaultVisibleReaction: 'smirk', positiveSignals: ['fast joke economy', 'sharp punchline with no filler', 'simple but original angle'], negativeSignals: ['overexplaining the premise', 'forced cleverness without payoff', 'soft closer after a long setup'] },
      feedbackVoice: { toneTags: ['blunt', 'analytical', 'dry'], sampleQuoteGreatSet: 'This works. Setup is clean, punchlines are sharp, closer actually lands.', sampleQuoteMediocreSet: 'Premise is fine, but the jokes are too soft. Needs a harder turn.', sampleQuoteBombingSet: 'Too much explaining, not enough comedy. Cut the filler and find the actual joke.' },
      color: '#ffd166'
    },
    {
      id: 'balaji',
      name: 'Balaji',
      role: 'technology founder and investor',
      publicHandleOrRole: 'technology founder and investor',
      archetype: 'systems-level futurist who wants high-signal jokes',
      rehearsalLens: 'Public-figure-inspired rehearsal assumption based on public interviews and writing style, not a real-person prediction.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: true,
      confidenceNotes: ['Built from broad public signals only; no private or sensitive inference.', 'Use as a high-signal tech audience lens, not a claim about the real person.'],
      sourceConfidence: { overall: 'low', name: 'high', role: 'medium', comedyTaste: 'low', feedbackVoice: 'low' },
      caresAbout: ['original thesis', 'intellectual compression', 'technical plausibility', 'strong closer'],
      reactsTo: ['dense idea with a clean joke', 'surprising systems analogy', 'future-facing premise with a punchline'],
      comedyTaste: { preferredStyles: ['observational', 'deadpan', 'wordplay', 'dark'], avoidedStyles: ['physical', 'cringe', 'crowdwork'], laughThreshold: 'high' },
      criteriaWeights: { quick_opener: 8, clear_setups: 9, sharp_punchlines: 10, laugh_frequency: 7, no_silence_without_laughter: 7, original_topic: 10, strong_closer: 9 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 8, closer_without_jokes: 9, unreasonably_long_setups: 8, name_dropping_flex_without_jokes: 8, excessive_joke_repetition: 8, begging_for_applause: 10 },
      simulatorDefaults: { defaultVisibleReaction: 'silent_nod', positiveSignals: ['compressed high-signal idea', 'surprising technical analogy', 'original thesis with a joke attached'], negativeSignals: ['vague futurism with no punchline', 'name-dropping instead of argument', 'long premise without payoff'] },
      feedbackVoice: { toneTags: ['analytical', 'dry', 'blunt'], sampleQuoteGreatSet: 'High signal. The premise has a thesis and the punchline compresses it.', sampleQuoteMediocreSet: 'Interesting idea, but it is still an essay. Convert the argument into jokes.', sampleQuoteBombingSet: 'Too much abstraction, not enough comedy. The room cannot laugh at a whitepaper.' },
      color: '#57f2cc'
    },
    {
      id: 'elon-musk',
      name: 'Elon Musk',
      role: 'technology entrepreneur and product builder',
      publicHandleOrRole: 'technology entrepreneur and product builder',
      archetype: 'first-principles builder who rewards absurd efficiency',
      rehearsalLens: 'Public-figure-inspired rehearsal assumption based on public interviews and product persona, not a real-person prediction.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: true,
      confidenceNotes: ['Built from broad public signals only; not a claim about private taste.', 'Use as a product-builder audience lens for rehearsal.'],
      sourceConfidence: { overall: 'low', name: 'high', role: 'medium', comedyTaste: 'low', feedbackVoice: 'low' },
      caresAbout: ['first-principles angle', 'absurd premise', 'speed', 'punchline efficiency'],
      reactsTo: ['weird but logical turn', 'compressed absurdity', 'technical premise made simple'],
      comedyTaste: { preferredStyles: ['absurdist', 'deadpan', 'observational', 'wordplay'], avoidedStyles: ['political', 'storytelling', 'cringe'], laughThreshold: 'medium' },
      criteriaWeights: { quick_opener: 9, clear_setups: 8, sharp_punchlines: 10, laugh_frequency: 9, no_silence_without_laughter: 8, original_topic: 10, strong_closer: 8 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 8, closer_without_jokes: 9, unreasonably_long_setups: 10, name_dropping_flex_without_jokes: 7, excessive_joke_repetition: 8, begging_for_applause: 10 },
      simulatorDefaults: { defaultVisibleReaction: 'smirk', positiveSignals: ['absurd idea that still makes sense', 'fast technical punchline', 'bold original premise'], negativeSignals: ['slow setup', 'safe corporate joke', 'explaining instead of landing'] },
      feedbackVoice: { toneTags: ['blunt', 'dry', 'snarky'], sampleQuoteGreatSet: 'Funny because it is weird and true. Also efficient.', sampleQuoteMediocreSet: 'Good premise, but the payload-to-setup ratio is bad.', sampleQuoteBombingSet: 'Delete the boring part. Actually, delete most of it.' },
      color: '#c8b6ff'
    },
    {
      id: 'xi-jinping',
      name: 'Xi Jinping',
      role: 'public governance leader',
      publicHandleOrRole: 'public governance leader',
      archetype: 'formal institutional audience lens focused on order and clarity',
      rehearsalLens: 'Public-figure-inspired rehearsal assumption based on public speech style, not a real-person prediction or political profile.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: true,
      confidenceNotes: ['Built from public formal communication signals only.', 'Avoids political belief inference; use only as an institutional-formality lens.'],
      sourceConfidence: { overall: 'low', name: 'high', role: 'medium', comedyTaste: 'low', feedbackVoice: 'low' },
      caresAbout: ['clear structure', 'controlled tone', 'social risk', 'respectful closer'],
      reactsTo: ['disciplined setup', 'clean metaphor', 'joke that avoids unnecessary chaos'],
      comedyTaste: { preferredStyles: ['deadpan', 'observational', 'wordplay'], avoidedStyles: ['roast', 'cringe', 'political'], laughThreshold: 'high' },
      criteriaWeights: { quick_opener: 7, clear_setups: 10, sharp_punchlines: 8, laugh_frequency: 7, no_silence_without_laughter: 8, original_topic: 7, strong_closer: 10 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 9, closer_without_jokes: 10, unreasonably_long_setups: 8, name_dropping_flex_without_jokes: 9, excessive_joke_repetition: 8, begging_for_applause: 10 },
      simulatorDefaults: { defaultVisibleReaction: 'silent_nod', positiveSignals: ['clean structured premise', 'controlled deadpan turn', 'strong composed closer'], negativeSignals: ['chaotic crowdwork', 'needless provocation', 'messy ending without joke'] },
      feedbackVoice: { toneTags: ['terse', 'analytical', 'dry'], sampleQuoteGreatSet: 'Clear structure, disciplined tone, effective close.', sampleQuoteMediocreSet: 'The setup is understandable, but the turn needs more control.', sampleQuoteBombingSet: 'Too loose. Restore structure before asking for laughter.' },
      color: '#b8f7d4'
    },
    {
      id: 'mark-zuckerberg',
      name: 'Mark Zuckerberg',
      role: 'technology founder and product operator',
      publicHandleOrRole: 'technology founder and product operator',
      archetype: 'product-scale operator who rewards clear mechanics',
      rehearsalLens: 'Public-figure-inspired rehearsal assumption based on public product interviews, not a real-person prediction.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: true,
      confidenceNotes: ['Built from broad public product/operator signals only.', 'Use as a product-mechanics audience lens, not a private taste claim.'],
      sourceConfidence: { overall: 'low', name: 'high', role: 'medium', comedyTaste: 'low', feedbackVoice: 'low' },
      caresAbout: ['clear setup mechanics', 'iteration speed', 'simple human premise', 'callback closer'],
      reactsTo: ['simple premise with strong mechanism', 'clean callback', 'specific social observation'],
      comedyTaste: { preferredStyles: ['observational', 'deadpan', 'wordplay', 'storytelling'], avoidedStyles: ['dark', 'cringe', 'political'], laughThreshold: 'medium' },
      criteriaWeights: { quick_opener: 8, clear_setups: 10, sharp_punchlines: 9, laugh_frequency: 8, no_silence_without_laughter: 8, original_topic: 8, strong_closer: 9 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 8, closer_without_jokes: 10, unreasonably_long_setups: 9, name_dropping_flex_without_jokes: 8, excessive_joke_repetition: 9, begging_for_applause: 10 },
      simulatorDefaults: { defaultVisibleReaction: 'inward_smile', positiveSignals: ['clear mechanism behind the joke', 'specific social observation', 'callback that compounds'], negativeSignals: ['unclear premise', 'repeated same joke shape', 'closer that does not resolve'] },
      feedbackVoice: { toneTags: ['analytical', 'terse', 'dry'], sampleQuoteGreatSet: 'The mechanism is clear and the callback compounds nicely.', sampleQuoteMediocreSet: 'The premise works, but the joke loop needs a sharper iteration.', sampleQuoteBombingSet: 'The structure is not legible. Simplify the setup and rebuild the punchline.' },
      color: '#9ad7ff'
    },
    {
      id: 'generic-audience',
      name: 'Generic audience',
      role: 'neutral rehearsal listener',
      publicHandleOrRole: 'neutral rehearsal listener',
      archetype: 'generic comedy audience member',
      rehearsalLens: 'Use as a neutral rehearsal listener who rewards clear setups, fast punchlines, and consistent laughs.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: true,
      sourceConfidence: { overall: 'low', name: 'low', role: 'low', comedyTaste: 'low', feedbackVoice: 'low' },
      caresAbout: ['clear setups', 'fast punchlines', 'consistent laughs', 'strong closing joke'],
      reactsTo: ['quick laughs after punchlines', 'leaning in during strong setups', 'smiling at original angles', 'stronger reaction to callbacks'],
      comedyTaste: { preferredStyles: ['clear observational jokes', 'concise setups', 'specific punchlines', 'original angles', 'strong closing joke'], avoidedStyles: ['overlong setups', 'crowdwork without jokes', 'repeated punchlines', 'name-dropping without payoff', 'begging for applause'], laughThreshold: 'medium' },
      criteriaWeights: { quick_opener: 8, clear_setups: 8, sharp_punchlines: 9, laugh_frequency: 9, no_silence_without_laughter: 8, original_topic: 7, strong_closer: 8 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 8, closer_without_jokes: 9, unreasonably_long_setups: 8, name_dropping_flex_without_jokes: 7, excessive_joke_repetition: 8, begging_for_applause: 8 },
      simulatorDefaults: { defaultVisibleReaction: 'silent_nod', positiveSignals: ['quick laughs after punchlines', 'leaning in during strong setups', 'smiling at original angles', 'stronger reaction to callbacks'], negativeSignals: ['silence after long setups', 'looking away during unclear premises', 'polite smile without laughter', 'drop in attention after repeated jokes'] },
      feedbackVoice: { toneTags: ['direct', 'practical', 'rehearsal-focused', 'non-personal'], sampleQuoteGreatSet: 'This works because the jokes start quickly, the premises are clear, and the closer actually pays off.', sampleQuoteMediocreSet: 'There are funny ideas here, but the setups need trimming and the punchlines need to land more often.', sampleQuoteBombingSet: 'The main issue is silence between laughs. Cut the long explanations, keep only the setups that create a real punchline.' },
      color: '#f3f4f6'
    },
    {
      id: 'alex',
      name: 'Alex',
      role: 'comedy club regular',
      publicHandleOrRole: 'comedy club regular',
      archetype: 'comedy nerd with high standards — seen too many open mics',
      rehearsalLens: 'Editable rehearsal assumption for a comedy club regular who rewards original premises, sharp tags, and callbacks that do real work.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: true,
      sourceConfidence: { overall: 'low', name: 'low', role: 'medium', comedyTaste: 'low', feedbackVoice: 'low' },
      caresAbout: ['sharp punchlines', 'original topic', 'callbacks', 'tags harder than the first punchline'],
      reactsTo: ['callback lands three bits later', 'tag harder than the original punchline', 'premise no one else would touch'],
      comedyTaste: { preferredStyles: ['deadpan', 'absurdist', 'wordplay', 'storytelling'], avoidedStyles: ['cringe', 'crowdwork'], laughThreshold: 'high' },
      criteriaWeights: { quick_opener: 7, clear_setups: 7, sharp_punchlines: 9, laugh_frequency: 8, no_silence_without_laughter: 7, original_topic: 9, strong_closer: 8 },
      redFlagSensitivity: { stolen_jokes: 10, crowdwork_without_jokes: 8, closer_without_jokes: 7, unreasonably_long_setups: 7, name_dropping_flex_without_jokes: 8, excessive_joke_repetition: 7, begging_for_applause: 9 },
      simulatorDefaults: { defaultVisibleReaction: 'smirk', positiveSignals: ['callback lands three bits later', 'tag harder than the original punchline', 'premise no one else would touch'], negativeSignals: ['airport bit', 'men vs women premise', "self-aware nod that the joke didn't land"] },
      feedbackVoice: { toneTags: ['terse', 'dry', 'snarky'], sampleQuoteGreatSet: 'Premises were weird, punchlines were sharper than the setups promised, and the callback at the end did real work.', sampleQuoteMediocreSet: 'Three good jokes hiding inside fifteen minutes of stage time.', sampleQuoteBombingSet: "That wasn't a set, that was a man remembering things into a microphone." },
      color: '#ff9f1c'
    },
    {
      id: 'marcus',
      name: 'Marcus',
      role: 'founder',
      publicHandleOrRole: 'founder',
      archetype: 'Australian founder, analytical and dry',
      rehearsalLens: 'Editable rehearsal assumption for an analytical founder who rewards crisp reframes, callbacks, and observations that name something everyone noticed.',
      safetyFraming: 'Editable rehearsal assumption, not a psychological profile.',
      lowConfidence: false,
      sourceConfidence: { overall: 'medium', name: 'medium', role: 'medium', comedyTaste: 'medium', feedbackVoice: 'medium' },
      caresAbout: ['clear setups', 'sharp punchlines', 'original topic', 'callbacks that tie the set together'],
      reactsTo: ['a punchline that reframes the setup completely', 'a callback that lands ten minutes later', 'a crisp observation about something everyone noticed but no one named'],
      comedyTaste: { preferredStyles: ['observational', 'deadpan', 'storytelling', 'wordplay'], avoidedStyles: ['cringe', 'begging_for_applause'], laughThreshold: 'high' },
      criteriaWeights: { quick_opener: 7, clear_setups: 8, sharp_punchlines: 9, laugh_frequency: 8, no_silence_without_laughter: 7, original_topic: 9, strong_closer: 8 },
      redFlagSensitivity: { stolen_jokes: 9, crowdwork_without_jokes: 7, closer_without_jokes: 8, unreasonably_long_setups: 8, name_dropping_flex_without_jokes: 9, excessive_joke_repetition: 7, begging_for_applause: 9 },
      simulatorDefaults: { defaultVisibleReaction: 'smirk', positiveSignals: ['a punchline that reframes the setup completely', 'a callback that lands ten minutes later', 'a crisp observation about something everyone noticed but no one named'], negativeSignals: ['a setup that telegraphs the punchline', 'applause breaks substituted for laughs', 'a long anecdote with no payoff'] },
      feedbackVoice: { toneTags: ['dry', 'analytical', 'blunt'], sampleQuoteGreatSet: "Tight. Every setup paid off and the closer tied the whole thing together — I'd watch that again.", sampleQuoteMediocreSet: 'A few real laughs in there, but the middle sagged and half the bits felt interchangeable.', sampleQuoteBombingSet: 'Mate, that was mostly throat-clearing — no clear premise, no payoff, and the crowdwork was filler.' },
      color: '#00b4d8'
    }
  ]},
  { id: 'founder-pitch', label: 'Founder pitch', accent: '#57f2cc', criteria: ['market','traction','wedge','workflow clarity','proof'], demoSeed: 'room-reader helps people rehearse high-stakes communication by simulating topic-specific audience reactions before the real room hears it. You speak your pitch, and the room tells you where it lands, where it confuses people, and what to try next.', safetyCopy: SAFETY_COPY, personaDisclaimer: PERSONA_DISCLAIMER, personas: [
    p('skeptical-investor','Skeptical investor','hunts for proof and wedge',['market','traction','proof'],['vague claims','no wedge'],'#57f2cc'),
    p('technical-founder','Technical founder','tests whether it can be built',['feasibility','architecture','implementation'],['hand-wavy tech'],'#8bd3ff'),
    p('busy-operator','Busy operator','cares if it saves time today',['practical value','speed','cost'],['unclear workflow'],'#ffd166'),
    p('design-user','Design-sensitive user','notices taste and activation',['taste','clarity','activation'],['confusing UX'],'#ff7ab6'),
    p('early-adopter','Friendly early adopter','leans forward for novelty',['novelty','excitement'],['promising hooks'],'#c8b6ff')
  ]},
  { id: 'job-interview', label: 'Job interview', accent: '#8bd3ff', criteria: ['ownership','specificity','tradeoffs','impact','humility'], demoSeed: 'I led the migration under a tight deadline. The hard part was not just writing code, but aligning the team around risk. I broke the project into reversible steps, shipped the first milestone early, and used that to build trust.', safetyCopy: SAFETY_COPY, personaDisclaimer: PERSONA_DISCLAIMER, personas: [
    p('hiring-manager','Hiring manager','listens for ownership and impact',['ownership','clarity','business impact'],['clear outcomes'],'#8bd3ff'),
    p('senior-engineer','Senior engineer','probes depth and tradeoffs',['depth','tradeoffs','correctness'],['hand-wavy details'],'#57f2cc'),
    p('recruiter','Recruiter','tracks concise role fit',['concise story','role fit'],['rambling'],'#ffd166'),
    p('culture','Culture interviewer','watches collaboration tone',['collaboration','humility'],['blamey framing'],'#ff7ab6'),
    p('bar-raiser','Bar raiser','asks for evidence',['evidence','specificity','red flags'],['generic claims'],'#c8b6ff')
  ]},
  { id: 'product-demo', label: 'Product demo', accent: '#ffd166', criteria: ['what is this','activation','speed','trust','polish'], demoSeed: 'This tool lets you speak or type a demo script, then shows how different user types react. The goal is to find confusion before launch, not after.', safetyCopy: SAFETY_COPY, personaDisclaimer: PERSONA_DISCLAIMER, personas: [
    p('first-time-user','First-time user','needs the product in one sentence',['what is this?'],['unclear opening'],'#ffd166'),
    p('power-user','Power user','watches workflow speed',['workflow speed'],['too many steps'],'#57f2cc'),
    p('buyer','Buyer','needs value and trust',['value','trust'],['unsupported claims'],'#8bd3ff'),
    p('designer','Designer','notices polish and interaction',['polish','interaction'],['rough edges'],'#ff7ab6'),
    p('engineer','Engineer','checks reliability',['feasibility','reliability'],['fragile demo'],'#c8b6ff')
  ]},
  { id: 'team-update', label: 'Team update', accent: '#b8f7d4', criteria: ['progress','blockers','asks','risk','coordination'], demoSeed: 'We shipped the first milestone, but the API integration is still the main risk. I need design feedback by Thursday and one backend review so we can unblock the launch path.', safetyCopy: SAFETY_COPY, personaDisclaimer: PERSONA_DISCLAIMER, personas: [
    p('manager','Manager','wants progress, blockers, asks',['progress','blockers','asks'],['unclear owner'],'#b8f7d4'),
    p('teammate','Teammate','tracks dependencies',['dependencies','coordination'],['missing handoff'],'#8bd3ff'),
    p('exec','Exec','scans outcome and risk',['outcome','risk'],['activity without result'],'#ffd166'),
    p('team-designer','Designer','asks about user impact',['user impact'],['internal-only update'],'#ff7ab6'),
    p('team-engineer','Engineer','hunts technical blockers',['technical blockers'],['vague blockers'],'#57f2cc')
  ]},
  { id: 'hard-conversation', label: 'Hard conversation', accent: '#c8b6ff', criteria: ['clarity','empathy','specific ask','tone','repair path'], demoSeed: 'I want to talk about the missed handoff yesterday. I know the timeline was intense, but when the update came late it put the launch at risk. Can we agree on a clearer escalation path next time?', safetyCopy: SAFETY_COPY, personaDisclaimer: PERSONA_DISCLAIMER, personas: [
    p('defensive-listener','Defensive listener','hears blame quickly',['fairness','specificity'],['accusatory tone'],'#ff7ab6'),
    p('empathetic-listener','Empathetic listener','looks for repair',['care','context'],['cold delivery'],'#b8f7d4'),
    p('direct-operator','Direct operator','wants the ask',['specific ask','next step'],['soft ambiguity'],'#ffd166'),
    p('avoidant-teammate','Conflict-avoidant teammate','feels tension spikes',['safety','tone'],['too intense'],'#8bd3ff'),
    p('mediator','Mediator','balances both sides',['shared facts','repair path'],['one-sided story'],'#c8b6ff')
  ]}
];

export function getTopic(id: TopicId | string): Topic {
  return TOPICS.find((topic) => topic.id === id) ?? TOPICS[0];
}

export function getTopicPersonas(id: TopicId | string): Persona[] {
  return getTopic(id).personas;
}
