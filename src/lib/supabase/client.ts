import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase architecture is in place per founder decision (Sprint 0), but no
 * live data flows yet. Feature api.ts modules will call getSupabase() in
 * later sprints; until env vars are set, isSupabaseConfigured() is false and
 * features serve fixture data instead.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) {
      throw new Error(
        'Supabase is not configured. Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      );
    }
    client = createClient(url, anonKey);
  }
  return client;
}
