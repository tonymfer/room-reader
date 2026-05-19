import { NextResponse } from 'next/server';
import { runMockRehearsal } from '@/lib/rehearsalEngine';
import { getTopic } from '@/lib/topics';
import type { Persona, RoomReport, TopicId } from '@/lib/types';

type RehearseRequest = {
  topicId?: TopicId;
  transcript?: string;
  personas?: Persona[];
};

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidReport(value: unknown, personaCount: number): value is RoomReport {
  if (!isObject(value)) return false;
  const scores = value.scores;
  const reactions = value.personaReactions;
  const consensus = value.consensus;
  if (!isObject(scores) || !Array.isArray(reactions) || !isObject(consensus)) return false;
  if (personaCount > 0 && reactions.length !== personaCount) return false;
  for (const key of ['clarity', 'energy', 'trust', 'novelty', 'risk', 'landing']) {
    if (typeof scores[key] !== 'number') return false;
  }
  for (const reaction of reactions) {
    if (!isObject(reaction)) return false;
    for (const key of ['personaId', 'personaName', 'emoji', 'label', 'gutReaction', 'bestMoment', 'weakPoint', 'hardQuestion', 'suggestedFix']) {
      if (typeof reaction[key] !== 'string' || !reaction[key]) return false;
    }
  }
  for (const key of ['strongestLine', 'whereRoomGotLost', 'highestRiskMoment', 'improvedVersion']) {
    if (typeof consensus[key] !== 'string' || !consensus[key]) return false;
  }
  return Array.isArray(consensus.whatLanded) && Array.isArray(consensus.hardestQuestions);
}

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
    if (!match) throw new Error('No JSON object returned');
    return JSON.parse(match[1]);
  }
}

function normalizePersonaIdentity(report: RoomReport, personas: Persona[]): RoomReport {
  return {
    ...report,
    personaReactions: report.personaReactions.map((reaction, index) => {
      const persona = personas[index];
      if (!persona) return reaction;
      return {
        ...reaction,
        personaId: persona.id,
        personaName: persona.name
      };
    })
  };
}

function buildPrompt(topicId: TopicId, transcript: string, personas: Persona[], fallback: RoomReport) {
  const topic = getTopic(topicId);
  return `You are the rehearsal engine for room-reader: a simulated room for high-stakes communication.

Safety rules:
- Do NOT claim to clone, diagnose, analyze, or predict real people.
- Personas are editable audience cards and topic-specific rehearsal lenses only.
- If a persona has a real-sounding name, treat it as a rehearsal assumption, not a psychological profile.
- Produce useful rehearsal feedback, not personal judgments.

Topic: ${topic.label}
Topic criteria: ${topic.criteria.join(', ')}
Transcript:\n${transcript}

Registered audience cards JSON:\n${JSON.stringify(personas, null, 2)}

Return ONLY valid JSON matching this TypeScript shape:
{
  "topicId": ${JSON.stringify(topicId)},
  "roomTemperature": string,
  "scores": { "clarity": number, "energy": number, "trust": number, "novelty": number, "risk": number, "landing": number },
  "personaReactions": [
    { "personaId": string, "personaName": string, "emoji": string, "label": string, "gutReaction": string, "bestMoment": string, "weakPoint": string, "hardQuestion": string, "suggestedFix": string }
  ],
  "consensus": { "strongestLine": string, "whereRoomGotLost": string, "highestRiskMoment": string, "whatLanded": string[], "hardestQuestions": string[], "improvedVersion": string }
}

Hard requirements:
- personaReactions length must equal ${personas.length}; use exactly the personaId/personaName values provided.
- Scores must be integers 15-98.
- Make each persona reaction distinct and tied to that persona's caresAbout/reactsTo/lens.
- Include hardest questions that would actually be asked in the room.
- improvedVersion must be a rehearseable rewrite, not meta commentary.
- Keep JSON concise enough for a live demo.

If uncertain, use this deterministic fallback as structural reference but improve the wording:\n${JSON.stringify(fallback, null, 2)}`;
}

export async function POST(request: Request) {
  let body: RehearseRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const topicId = body.topicId ?? 'standup-comedy';
  const topic = getTopic(topicId);
  const transcript = body.transcript?.trim() || topic.demoSeed;
  const personas = body.personas?.length ? body.personas : topic.personas;
  const fallback = runMockRehearsal(topic.id, transcript, personas);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ source: 'mock', reason: 'OPENAI_API_KEY missing', report: fallback });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You return strict JSON only. You are concise, concrete, safe, and demo-oriented.' },
          { role: 'user', content: buildPrompt(topic.id, transcript, personas, fallback) }
        ]
      })
    });

    if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('OpenAI response had no message content');
    const parsed = extractJson(content);
    if (!isValidReport(parsed, personas.length)) throw new Error('OpenAI JSON did not match RoomReport shape');

    const normalized = normalizePersonaIdentity(parsed, personas);
    return NextResponse.json({ source: 'openai', model: MODEL, report: normalized });
  } catch (error) {
    console.error('OpenAI rehearsal route fell back to mock:', error);
    return NextResponse.json({ source: 'mock', reason: 'OpenAI call failed or returned invalid JSON', report: fallback });
  }
}
