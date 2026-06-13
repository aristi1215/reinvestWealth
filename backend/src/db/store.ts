import { env } from '../config/env.js'
import { memoryStore } from './memoryStore.js'
import { supabaseStore } from './supabaseStore.js'

export const store = env.ENABLE_SUPABASE ? supabaseStore : memoryStore
