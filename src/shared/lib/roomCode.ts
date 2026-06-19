// Word-pair room codes ("MOSS-RAVEN"). Short, speakable, fits the tone
// better than a numeric PIN.

const WORDS = [
  'moss', 'raven', 'plum', 'fox', 'oak', 'birch', 'fern', 'lark',
  'mint', 'sage', 'jasper', 'willow', 'cocoa', 'amber', 'linen', 'piper',
  'hazel', 'indigo', 'maple', 'cedar', 'finch', 'cobalt', 'dove', 'ember',
  'grove', 'harbor', 'ivy', 'juniper', 'kelp', 'lilac', 'mango', 'nova',
  'onyx', 'pearl', 'quartz', 'ruby', 'spruce', 'tango', 'umber', 'violet',
] as const

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

// WORD-WORD, uppercase, never repeats a word within one code.
export function generateRoomCode(): string {
  const a = pickWord()
  let b = pickWord()
  while (b === a) b = pickWord()
  return `${a.toUpperCase()}-${b.toUpperCase()}`
}
