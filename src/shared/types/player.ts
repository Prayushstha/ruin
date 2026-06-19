/**
 * Player identity and onboarding profile.
 *
 * A Player is the human account; PlayerProfile is the style + personality
 * data collected at onboarding that powers BOTH games (see idea.md
 * "Player Profile"). Build the onboarding form once and everything
 * downstream reads from it.
 */

/** A registered user. */
export interface Player {
  id: string
  displayName: string
  avatarUrl?: string
  createdAt: string
}

/**
 * Texting-style traits — the fuel for Spot the AI. Thin profiles make the
 * AI's mimicry weak and easy to spot, so collecting real detail here matters.
 */
export interface StyleProfile {
  capitalization: 'lowercase' | 'normal' | 'allcaps'
  emojiFrequency: 'none' | 'occasional' | 'heavy'
  punctuation: 'none' | 'ellipsis' | 'proper'
  messageLength: 'short' | 'paragraph'
  /** Phrases this person actually says ("no cap", "lowkey", …). */
  catchphrases: string[]
}

/** One "would rather" / "most likely to" / quick-fact answer. */
export interface PersonalityAnswer {
  prompt: string
  answer: string
}

/** The full onboarding profile, shared by both games. */
export interface PlayerProfile {
  playerId: string
  style: StyleProfile
  personality: PersonalityAnswer[]
  updatedAt: string
}
