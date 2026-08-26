export const INTRO_SESSION_KEY = 'orbit-archive:intro-seen:v1'

export function hasSeenSessionIntro(storage) {
  try {
    const session = storage ?? globalThis.sessionStorage
    return session?.getItem(INTRO_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markSessionIntroSeen(storage) {
  try {
    const session = storage ?? globalThis.sessionStorage
    session?.setItem(INTRO_SESSION_KEY, '1')
    return true
  } catch {
    return false
  }
}
