// ruin AI edge function — runs LLM calls server-side so the key never
// reaches the browser. Both games via a `mode` field:
//   { mode: 'imitate', profile, prompt } → Spot the AI (impersonate)
//   { mode: 'quiz', profiles }           → Quiz (generate a question)
// Provider: Groq (OpenAI-compatible, direct fetch). Secret: GROQ_API_KEY.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const key = Deno.env.get('GROQ_API_KEY')
  if (!key) return json({ error: 'Groq key not configured' }, 503)

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }

  try {
    const result = body.mode === 'quiz'
      ? await runQuiz(body, key)
      : await runImitate(body, key)
    return json(result, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'AI call failed' }, 502)
  }
})

async function runImitate(body: ImitateReq, key: string): Promise<{ text: string }> {
  const { profile, prompt } = body
  const system = `You're playing a party game where you must respond to a prompt exactly as a specific real person would, fully in their texting style. Their profile: ${JSON.stringify(profile)}.

Respond to this prompt in 1–3 short messages, matching their capitalization, punctuation, emoji habits, and typical phrases. Stay fully in character. Do not mention you are an AI or break the bit.

Prompt: ${prompt}`
  return { text: await complete(key, system) }
}

async function runQuiz(body: QuizReq, key: string): Promise<QuizResult> {
  const { profiles } = body
  const names = profiles.map((p) => p.name)
  const system = `Given these player profiles: ${JSON.stringify(profiles)}

Generate one lighthearted "most likely to" trivia question for a party game. Keep it fun and harmless, never embarrassing or personal. Return strict JSON only, no other text:
{ "question": string, "options": [${names.map((n) => `"${n}"`).join(', ')}], "correct_answer": string }`
  return JSON.parse(await complete(key, system))
}

async function complete(key: string, system: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }],
      temperature: 0.9,
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: CORS })
}

interface ImitateReq {
  mode: 'imitate'
  profile: { style: unknown; catchphrases: string[] }
  prompt: string
}
interface QuizReq {
  mode: 'quiz'
  profiles: { name: string; style: unknown }[]
}
interface QuizResult {
  question: string
  options: string[]
  correct_answer: string
}
