'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { runMockRehearsal } from '@/lib/rehearsalEngine';
import { getOptionalSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { PERSONA_DISCLAIMER, SAFETY_COPY, TOPICS, getTopic } from '@/lib/topics';
import type { Persona, PersonaReaction, RoomReport, TopicId } from '@/lib/types';

type AppStep = 'topic' | 'audience' | 'room' | 'report';
type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = { 0: SpeechRecognitionAlternative; isFinal: boolean };
type SpeechRecognitionEvent = { results: SpeechRecognitionResult[] };
type SpeechRecognitionLike = { continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void; onresult: ((event: SpeechRecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global { interface Window { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor } }

const COLORS = ['#ff7ab6', '#57f2cc', '#8bd3ff', '#ffd166', '#c8b6ff', '#b8f7d4'];
const STEP_LABELS: Record<AppStep, string> = { topic: 'Topic', audience: 'Audience', room: 'Room', report: 'Report' };

function clonePersonas(personas: Persona[]) {
  return personas.map((persona) => ({ ...persona, caresAbout: [...persona.caresAbout], reactsTo: [...persona.reactsTo] }));
}

function AppChrome({ step, children }: { step: AppStep; children: React.ReactNode }) {
  const steps: AppStep[] = ['topic', 'audience', 'room', 'report'];
  const activeIndex = steps.indexOf(step);
  return (
    <main className={`app-shell app-step-${step}`}>
      <nav className="topbar" aria-label="room-reader app navigation">
        <div className="brand"><span className="logo-mark small">rr</span><div><strong>room-reader</strong><small>Know the room before you enter it.</small></div></div>
        <div className="stepper" aria-label="Rehearsal setup progress">
          {steps.map((item, index) => <span key={item} className={index <= activeIndex ? 'done' : ''}>{index + 1}. {STEP_LABELS[item]}</span>)}
        </div>
      </nav>
      {children}
    </main>
  );
}

function SafetyNote() {
  return <div className="safety-note compact"><strong>Safety framing:</strong> {SAFETY_COPY}<br /><span>{PERSONA_DISCLAIMER}</span></div>;
}

function TopicSetupScreen({ selected, onSelect, onContinue }: { selected: TopicId; onSelect: (id: TopicId) => void; onContinue: () => void }) {
  return (
    <section className="screen topic-screen">
      <div className="cinema-hero">
        <div className="cinema-copy">
          <p className="eyebrow">step 1 / setup</p>
          <h1>room-reader</h1>
          <p className="tagline">Know the room before you enter it.</p>
          <p>Speak your pitch, joke, interview answer, or demo. Watch a simulated room react before the real room hears it.</p>
          <button className="primary big hero-launch" onClick={onContinue}>Launch rehearsal</button>
        </div>
        <div className="cinema-frame" aria-label="Vintage black-and-white theater audience clapping">
          <div className="film-label">audience reaction loop · archival mode</div>
        </div>
      </div>
      <div className="screen-hero compact-heading">
        <p className="eyebrow">choose the room</p>
        <h2>Choose your rehearsal room</h2>
        <p>Pick the situation first. The audience, criteria, stage language, and report change around that room.</p>
      </div>
      <div className="topic-grid app-topic-grid">
        {TOPICS.map((topic) => (
          <button key={topic.id} className={`topic-card ${selected === topic.id ? 'active' : ''}`} style={{ '--accent': topic.accent } as React.CSSProperties} onClick={() => onSelect(topic.id)}>
            <span>{topic.label}</span>
            <small>{topic.criteria.slice(0, 4).join(' · ')}</small>
          </button>
        ))}
      </div>
      <SafetyNote />
      <div className="screen-actions"><button className="primary big" onClick={onContinue}>Continue to audience setup</button></div>
    </section>
  );
}

function AudienceEditor({ personas, onAdd, onRemove, onReset }: { personas: Persona[]; onAdd: (persona: Persona) => void; onRemove: (id: string) => void; onReset: () => void }) {
  const [name, setName] = useState('Club booker agent');
  const [role, setRole] = useState('decides whether this set gets another slot');
  const [cares, setCares] = useState('quick opener, laugh frequency, strong closer');

  const add = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onAdd({ id: `custom-${Date.now()}`, name: trimmedName, role: role.trim() || 'registered audience agent', caresAbout: cares.split(',').map((item) => item.trim()).filter(Boolean), reactsTo: ['confusion', 'red flags', 'strong lines'], color: COLORS[personas.length % COLORS.length] });
    setName('');
  };

  return (
    <section className="audience-editor" aria-label="Registered audience editor">
      <div className="section-row"><div><p className="eyebrow">registered audience</p><h2>Register the audience</h2></div><button className="secondary tiny" onClick={onReset}>Reset topic room</button></div>
      <p className="helper">Add or remove audience agents before entering the room. These are rehearsal assumptions — not psychological profiles.</p>
      <div className="persona-form horizontal">
        <input aria-label="Persona name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Persona name" />
        <input aria-label="Persona role" value={role} onChange={(event) => setRole(event.target.value)} placeholder="What do they care about?" />
        <input aria-label="Persona criteria" value={cares} onChange={(event) => setCares(event.target.value)} placeholder="criteria, comma separated" />
        <button className="primary compact" onClick={add}>Add audience agent</button>
      </div>
      <div className="registered-list setup-list">
        {personas.map((persona) => (
          <article key={persona.id} className="registered-card" style={{ '--accent': persona.color } as React.CSSProperties}>
            <div><span className="dot" /> <strong>{persona.name}</strong></div>
            <p>{persona.archetype ?? persona.role}</p>
            <small>{persona.publicHandleOrRole ?? persona.role}</small>
            <small>{persona.caresAbout.join(' · ')}</small>
            <button className="ghost-danger" onClick={() => onRemove(persona.id)} aria-label={`Remove ${persona.name}`}>remove</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function PersonaPromptPanel() {
  const prompt = `You are creating an editable stand-up comedy audience card for a rehearsal simulator.

Important framing:
This is NOT a personality profile, psychological analysis, diagnosis, or prediction of a real person. It is an editable rehearsal assumption based only on explicit, non-sensitive information or public interviews.

Task:
Return one valid JSON audience card for this person. Include audience_card, comedy_judging_lens, simulator_defaults, feedback_voice, omitted_sensitive_info, and low_confidence. Keep out medical, financial, address/contact, religion, political affiliation, sexuality/gender identity, family/friend/coworker names, trauma, private accounts, and confidential details. For public figures, use only public communication/interview signals and say it is public-figure-inspired, not a real-person prediction.

Comedy criteria to score 0-10: quick_opener, clear_setups, sharp_punchlines, laugh_frequency, no_silence_without_laughter, original_topic, strong_closer.
Red flags to score 0-10: stolen_jokes, crowdwork_without_jokes, closer_without_jokes, unreasonably_long_setups, name_dropping_flex_without_jokes, excessive_joke_repetition, begging_for_applause.

Return JSON only.`;

  const copyPrompt = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) await navigator.clipboard.writeText(prompt);
  };

  return (
    <section className="persona-prompt-panel">
      <div className="section-row">
        <div>
          <p className="eyebrow">ask others for cards</p>
          <h3>Ask a friend or public-figure research pass</h3>
        </div>
        <button className="secondary tiny" onClick={copyPrompt}>Copy persona request prompt</button>
      </div>
      <p className="helper">Copy this prompt and send it to friends, coaches, or a research pass. Paste the returned JSON into future audience cards.</p>
      <textarea aria-label="Persona request prompt" readOnly value={prompt} />
    </section>
  );
}

function ComedyRubric({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <section className="rubric-panel"><div className="rubric-grid"><article><h3>Good comedy set criteria</h3><p>Quick opener · clear setups · sharp punchlines · laugh frequency · no silence without laughter · original topic · strong closer</p></article><article><h3>Red flags</h3><p>Stolen jokes · crowdwork without jokes · closer without jokes · unreasonably long setups · name dropping/flex with no jokes · same joke too often · begging for applause</p></article></div></section>;
}

function AudienceSetupScreen({ topicId, personas, onAdd, onRemove, onReset, onBack, onEnter }: { topicId: TopicId; personas: Persona[]; onAdd: (persona: Persona) => void; onRemove: (id: string) => void; onReset: () => void; onBack: () => void; onEnter: () => void }) {
  return (
    <section className="screen audience-screen">
      <div className="screen-hero split"><div><p className="eyebrow">step 2 / cast the room</p><h1>Build the room before you walk in</h1><p>The demo should feel like the audience is already waiting behind the door.</p></div><div className="room-pass"><span>{personas.length}</span><small>registered audience agents</small></div></div>
      <AudienceEditor personas={personas} onAdd={onAdd} onRemove={onRemove} onReset={onReset} />
      <PersonaPromptPanel />
      <ComedyRubric visible={topicId === 'standup-comedy'} />
      <div className="screen-actions"><button className="secondary" onClick={onBack}>Back to topic</button><button className="primary big" onClick={onEnter}>Enter rehearsal room</button></div>
    </section>
  );
}

function PixelPerson({ persona, reaction, index, live }: { persona: Persona; reaction?: PersonaReaction; index: number; live: boolean }) {
  const liveEmoji = ['💭', '👀', '📝', '⚡', '❓'][index % 5];
  return <div className="seat" style={{ '--person': persona.color, '--delay': `${index * 80}ms` } as React.CSSProperties}>{reaction ? <div className="bubble" aria-label={`${persona.name} reaction ${reaction.label}`}>{reaction.emoji}</div> : live ? <div className="bubble live" aria-label={`${persona.name} is thinking`}>{liveEmoji}</div> : null}<div className="agent-console"><span /> agent-{String(index + 1).padStart(2, '0')} · {reaction ? reaction.label : live ? 'thinking…' : 'waiting'}</div><div className="pixel-person" title={persona.name}><div className="pixel-hair" /><div className="pixel-head"><span className="eye left" /><span className="eye right" /></div><div className="pixel-body" /></div><small>{persona.name}</small></div>;
}

function PixelAudience({ personas, report, live }: { personas: Persona[]; report: RoomReport | null; live: boolean }) {
  return <section className="stage-wrap room-stage" aria-label="Pixel audience"><div className="stage-header"><div><div className="eyebrow">audience agents waiting</div><h2>registered room</h2></div><div className={`live-pill ${live ? 'on' : ''}`}>{live ? 'live rehearsal signal' : 'idle / ready'}</div></div><div className="stage-glow" /><div className="speaker-zone"><div className="mic"><span />🎙</div><div><div className="speaker-label">speaker spotlight</div><p>Speak or paste. Audience agents react through topic-specific lenses.</p></div></div><div className="audience-risers">{personas.map((persona, index) => <PixelPerson key={persona.id} persona={persona} index={index} live={live} reaction={report?.personaReactions.find((r) => r.personaId === persona.id)} />)}</div></section>;
}

function RehearsalInput({ transcript, setTranscript, onRun, onLoadDemo, disabled, onListeningChange }: { transcript: string; setTranscript: (value: string) => void; onRun: () => void; onLoadDemo: () => void; disabled: boolean; onListeningChange: (value: boolean) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('Textarea fallback is always available.');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const updateListening = useCallback((value: boolean) => { setListening(value); onListeningChange(value); }, [onListeningChange]);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSupported(Boolean(Ctor));
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onresult = (event) => { const phrase = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' '); if (phrase.trim()) setTranscript(phrase.trim()); };
    recognition.onerror = () => { updateListening(false); setStatus('Mic/STT hit a browser permission or support issue. Typed rehearsal still works.'); };
    recognition.onend = () => updateListening(false);
    recognitionRef.current = recognition; setStatus('Speech-to-text is available in this browser.');
    return () => recognition.stop();
  }, [setTranscript, updateListening]);

  const toggleMic = () => {
    const recognition = recognitionRef.current;
    if (!recognition) { setStatus('Speech-to-text is unavailable here. Use the textarea fallback.'); return; }
    if (listening) { recognition.stop(); updateListening(false); setStatus('Stopped listening. You can edit before running the room check.'); return; }
    try { recognition.start(); updateListening(true); setStatus('Listening… audience agents are forming live reactions.'); } catch { setStatus('Mic could not start. Use the textarea fallback.'); updateListening(false); }
  };

  return <section className="room-control-panel"><div className="eyebrow">live rehearsal</div><h2>Say it to the room</h2><div className="input-actions"><button className="secondary" onClick={onLoadDemo}>Load demo</button><button className={`secondary ${listening ? 'recording' : ''}`} onClick={toggleMic} aria-pressed={listening}>{listening ? 'Stop mic' : supported ? 'Start mic' : 'Mic unavailable'}</button></div><p className="helper">{status}</p><textarea aria-label="Rehearsal transcript textarea fallback" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Speak, type, or paste your rehearsal…" /><button className="primary big" disabled={disabled} onClick={onRun}>Run Room Check</button></section>;
}

function RoomScreen({ topicLabel, personas, transcript, setTranscript, report, listening, setListening, onLoadDemo, onRun, onBack }: { topicLabel: string; personas: Persona[]; transcript: string; setTranscript: (value: string) => void; report: RoomReport | null; listening: boolean; setListening: (value: boolean) => void; onLoadDemo: () => void; onRun: () => void; onBack: () => void }) {
  return <section className="screen room-screen"><div className="room-title-row"><button className="secondary" onClick={onBack}>Back to audience</button><div><p className="eyebrow">step 3 / simulation</p><h1>{topicLabel} rehearsal room</h1></div></div><div className="room-stage-layout"><PixelAudience personas={personas} report={report} live={listening || transcript.trim().length > 30} /><RehearsalInput transcript={transcript} setTranscript={setTranscript} onLoadDemo={onLoadDemo} onRun={onRun} disabled={!transcript.trim()} onListeningChange={setListening} /></div></section>;
}

function ReportAudienceStrip({ reactions }: { reactions: PersonaReaction[] }) {
  return <div className="report-audience-strip" aria-label="Registered persona reactions live"><p className="eyebrow">registered persona agents reacted</p><div>{reactions.map((reaction, index) => <article key={reaction.personaId} style={{ '--delay': `${index * 90}ms` } as React.CSSProperties}><span>{reaction.emoji}</span><strong>{reaction.personaName}</strong><small>{reaction.label}</small></article>)}</div></div>;
}

function RoomReportView({ report, analysisMode, onRehearseRevised, onNewRoom }: { report: RoomReport; analysisMode: string; onRehearseRevised: () => void; onNewRoom: () => void }) {
  return <section className="screen report-screen" aria-label="Room report"><div className="report-header app-report-header"><div><p className="eyebrow">step 4 / final room report</p><h1>{report.roomTemperature}</h1><p className="agent-source">{analysisMode}</p></div><div className="report-actions"><button className="secondary" onClick={onNewRoom}>New room</button><button className="primary big" onClick={onRehearseRevised}>Rehearse revised version</button></div></div><ReportAudienceStrip reactions={report.personaReactions} /><div className="score-grid">{Object.entries(report.scores).map(([name, score]) => <div className="score" key={name}><span>{name}</span><strong>{score}</strong><div><i style={{ width: `${score}%` }} /></div></div>)}</div><div className="report-columns"><article><h3>What landed</h3><ul>{report.consensus.whatLanded.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h3>Where the room got confused</h3><p>{report.consensus.whereRoomGotLost}</p><h3>Hardest questions</h3><ul>{report.consensus.hardestQuestions.map((q) => <li key={q}>{q}</li>)}</ul></article></div><article className="rewrite"><h3>Highest risk moment</h3><p>{report.consensus.highestRiskMoment}</p></article><h2>Persona-by-persona reactions</h2><div className="reaction-list">{report.personaReactions.map((reaction) => <article key={reaction.personaId}><div className="reaction-title"><span>{reaction.emoji}</span><strong>{reaction.personaName}</strong><em>{reaction.label}</em></div><p>{reaction.gutReaction}</p><dl><dt>Best moment</dt><dd>{reaction.bestMoment}</dd><dt>Weak point</dt><dd>{reaction.weakPoint}</dd><dt>Hard question</dt><dd>{reaction.hardQuestion}</dd><dt>Suggested fix</dt><dd>{reaction.suggestedFix}</dd></dl></article>)}</div><article className="rewrite"><h3>Suggested rewrite</h3><p>{report.consensus.improvedVersion}</p></article></section>;
}

export default function Home() {
  const [step, setStep] = useState<AppStep>('topic');
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('standup-comedy');
  const topic = useMemo(() => getTopic(selectedTopic), [selectedTopic]);
  const [registeredPersonas, setRegisteredPersonas] = useState<Persona[]>(() => clonePersonas(getTopic('standup-comedy').personas));
  const [transcript, setTranscript] = useState(topic.demoSeed);
  const [report, setReport] = useState<RoomReport | null>(null);
  const [listening, setListening] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('mock-ready');

  useEffect(() => { if (typeof window !== 'undefined') void isSupabaseConfigured(); }, []);
  useEffect(() => { setTranscript(topic.demoSeed); setRegisteredPersonas(clonePersonas(topic.personas)); setReport(null); setListening(false); }, [topic]);

  const run = async () => {
    setListening(false);
    setAnalysisMode('calling OpenAI persona agents…');
    try {
      const response = await fetch('/api/rehearse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: selectedTopic, transcript, personas: registeredPersonas })
      });
      if (!response.ok) throw new Error(`rehearse route ${response.status}`);
      const payload = await response.json() as { source?: string; model?: string; report?: RoomReport };
      if (!payload.report) throw new Error('missing report');
      setReport(payload.report);
      setAnalysisMode(payload.source === 'openai' ? `OpenAI persona agents · ${payload.model ?? 'live'}` : 'mock fallback · no API response');
    } catch {
      setReport(runMockRehearsal(selectedTopic, transcript, registeredPersonas));
      setAnalysisMode('local mock fallback');
    }
    setStep('report');
    window.localStorage.setItem('room-reader:last-transcript', transcript);
    const supabase = getOptionalSupabaseClient();
    if (supabase) await supabase.from('room_reader_rooms').insert({ slug: `demo-${Date.now()}`, title: topic.label, topic: selectedTopic });
  };

  return <AppChrome step={step}>{step === 'topic' ? <TopicSetupScreen selected={selectedTopic} onSelect={setSelectedTopic} onContinue={() => setStep('audience')} /> : null}{step === 'audience' ? <AudienceSetupScreen topicId={selectedTopic} personas={registeredPersonas} onAdd={(persona) => setRegisteredPersonas((current) => [...current, persona].slice(0, 8))} onRemove={(id) => setRegisteredPersonas((current) => current.length > 1 ? current.filter((persona) => persona.id !== id) : current)} onReset={() => setRegisteredPersonas(clonePersonas(topic.personas))} onBack={() => setStep('topic')} onEnter={() => setStep('room')} /> : null}{step === 'room' ? <RoomScreen topicLabel={topic.label} personas={registeredPersonas} transcript={transcript} setTranscript={(value) => { setTranscript(value); setReport(null); }} report={report} listening={listening} setListening={setListening} onLoadDemo={() => setTranscript(topic.demoSeed)} onRun={run} onBack={() => setStep('audience')} /> : null}{step === 'report' && report ? <RoomReportView report={report} analysisMode={analysisMode} onNewRoom={() => setStep('topic')} onRehearseRevised={() => { setTranscript(report.consensus.improvedVersion); setReport(null); setStep('room'); }} /> : null}</AppChrome>;
}
