import { DASHBOARD_FIXTURE } from './mock';
import type { DashboardData } from './types';

/**
 * Data boundary for the Dashboard. Sprint 0 serves fixtures; a later sprint
 * replaces the body with Supabase queries — the screen contract is stable.
 */
export function getDashboard(): DashboardData {
  return DASHBOARD_FIXTURE;
}
