import { describe, expect, it } from 'vitest';
import { getTopic, getTopicPersonas, TOPICS } from '../lib/topics';
import { runMockRehearsal } from '../lib/rehearsalEngine';

const safetyCopy = 'room-reader uses editable audience cards and topic-specific lenses for rehearsal. It does not analyze, diagnose, or clone real personalities.';

describe('room-reader core rehearsal logic', () => {
  it('returns topic-specific personas for each required topic', () => {
    expect(TOPICS.map((topic) => topic.id)).toEqual([
      'standup-comedy',
      'founder-pitch',
      'job-interview',
      'product-demo',
      'team-update',
      'hard-conversation'
    ]);
    expect(getTopicPersonas('standup-comedy').map((p) => p.name)).toEqual(['Ondrey', 'George', 'Tony', 'Balaji', 'Elon Musk', 'Xi Jinping', 'Mark Zuckerberg', 'Generic audience', 'Alex', 'Marcus']);
    expect(getTopicPersonas('founder-pitch').map((p) => p.name)).toContain('Skeptical investor');
    expect(getTopicPersonas('product-demo').map((p) => p.name)).toContain('First-time user');
  });

  it('mock rehearsal returns one reaction per persona', () => {
    const topic = getTopic('founder-pitch');
    const report = runMockRehearsal(topic.id, topic.demoSeed);
    expect(report.personaReactions).toHaveLength(topic.personas.length);
    expect(report.personaReactions.every((r) => r.emoji && r.hardQuestion && r.suggestedFix)).toBe(true);
  });

  it('short transcript produces lower clarity and asks for more setup', () => {
    const report = runMockRehearsal('standup-comedy', 'AI joke.');
    expect(report.scores.clarity).toBeLessThan(65);
    expect(`${report.consensus.whereRoomGotLost} ${report.personaReactions[0].weakPoint}`.toLowerCase()).toContain('more setup');
  });

  it('founder pitch includes investor, technical, and operator style reactions', () => {
    const report = runMockRehearsal('founder-pitch', 'AI startup for investors with a clear wedge, workflow, and technical agent demo.');
    const names = report.personaReactions.map((r) => r.personaName);
    const combined = report.personaReactions.map((r) => `${r.hardQuestion} ${r.gutReaction}`).join(' ').toLowerCase();
    expect(names).toContain('Skeptical investor');
    expect(names).toContain('Technical founder');
    expect(names).toContain('Busy operator');
    expect(combined).toMatch(/proof|market|traction|architecture|workflow/);
  });

  it('comedy topic includes laugh, cringe, and setup style reactions', () => {
    const report = runMockRehearsal('standup-comedy', getTopic('standup-comedy').demoSeed);
    const combined = report.personaReactions.map((r) => `${r.personaName} ${r.label} ${r.gutReaction} ${r.weakPoint} ${r.hardQuestion}`).join(' ').toLowerCase();
    expect(combined).toMatch(/ondrey|george|tony|balaji|elon musk|xi jinping|mark zuckerberg|generic audience|alex|marcus/);
    expect(combined).toMatch(/laugh|punchline|setup|closer/);
  });

  it('comedy topic judges by explicit set criteria and red flags', () => {
    const report = runMockRehearsal('standup-comedy', 'Before I start, give it up for me. I met Elon at a party. Anyway, crowdwork crowdwork crowdwork.');
    const combined = `${report.consensus.whereRoomGotLost} ${report.consensus.highestRiskMoment} ${report.consensus.hardestQuestions.join(' ')} ${report.consensus.improvedVersion}`.toLowerCase();
    expect(combined).toMatch(/quick opener|clear setups|sharp punchlines|laugh frequency|strong closer/);
    expect(combined).toMatch(/begging for applause|name dropping|crowdwork without jokes|closer without jokes|long setups/);
    expect(report.scores.landing).toBeLessThan(70);
  });

  it('mock rehearsal can evaluate a custom registered audience instead of default personas', () => {
    const customPersonas = [
      { id: 'agent-booker', name: 'Club booker agent', role: 'decides if this set gets another slot', caresAbout: ['laugh frequency', 'closer'], reactsTo: ['silence', 'stolen jokes'], color: '#ff7ab6' }
    ];
    const report = runMockRehearsal('standup-comedy', 'Fast opener. My calendar has commitment issues. Punchline. Strong closer.', customPersonas);
    expect(report.personaReactions).toHaveLength(1);
    expect(report.personaReactions[0].personaName).toBe('Club booker agent');
  });

  it('improvedVersion is non-empty', () => {
    const report = runMockRehearsal('job-interview', getTopic('job-interview').demoSeed);
    expect(report.consensus.improvedVersion.trim().length).toBeGreaterThan(40);
  });

  it('exports required safety copy for visible rendering', () => {
    expect(getTopic('hard-conversation').safetyCopy).toBe(safetyCopy);
    expect(getTopic('hard-conversation').personaDisclaimer).toBe('Personas are rehearsal assumptions, not psychological profiles.');
  });

  it('does not require Supabase env vars for mock mode', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => runMockRehearsal('team-update', 'We shipped the milestone and need help unblocking the API risk.')).not.toThrow();
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });
});
