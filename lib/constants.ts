export const EXAM = {
  DEFAULT_PASSING_SCORE: 70,
  DEFAULT_TIME_LIMIT_MINUTES: 30,
} as const;

export const SESSION = {
  COOKIE_NAME: "auth-token",
  MAX_AGE_SECONDS: 60 * 60 * 24 * 7,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 8,
  BCRYPT_ROUNDS: 12,
} as const;

export const INVITE_CODE = {
  DEFAULT_MAX_USES: 500,
} as const;