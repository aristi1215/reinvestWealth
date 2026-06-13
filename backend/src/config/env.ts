export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3001),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  ENABLE_SUPABASE: Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  ),
  ENABLE_GEMINI: Boolean(process.env.GEMINI_API_KEY),
  ENABLE_PLAYWRIGHT: process.env.ENABLE_PLAYWRIGHT === 'true',
  ENABLE_SCHEDULER: process.env.ENABLE_SCHEDULER === 'true',
  isProduction: process.env.NODE_ENV === 'production',
}

export function logEnvStatus() {
  console.log(
    [
      `[env] mode=${env.NODE_ENV}`,
      `supabase=${env.ENABLE_SUPABASE ? 'on' : 'mock'}`,
      `gemini=${env.ENABLE_GEMINI ? 'on' : 'mock'}`,
      `playwright=${env.ENABLE_PLAYWRIGHT ? 'on' : 'mock'}`,
      `scheduler=${env.ENABLE_SCHEDULER ? 'on' : 'off'}`,
    ].join(' '),
  )
}
