// Player + onboarding profile. PlayerProfile (style + personality) powers
// BOTH games — build the onboarding form once, everything reads from it.

export interface Player {
  id: string
  displayName: string
  avatarUrl?: string
  createdAt: string
}

// Texting-style traits — fuel for Spot the AI. Thin profiles make the AI
// easy to spot, so collecting real detail here matters.
export interface StyleProfile {
  capitalization: 'lowercase' | 'normal' | 'allcaps'
  emojiFrequency: 'none' | 'occasional' | 'heavy'
  punctuation: 'none' | 'ellipsis' | 'proper'
  messageLength: 'short' | 'paragraph'
  catchphrases: string[]
}

export interface PersonalityAnswer {
  prompt: string
  answer: string
}

export interface PlayerProfile {
  playerId: string
  style: StyleProfile
  personality: PersonalityAnswer[]
  updatedAt: string
}
