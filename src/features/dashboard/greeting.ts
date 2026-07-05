/**
 * Time-of-day greeting (founder decision, July 2026): calm, encouraging,
 * personal. Morning 5–11, afternoon 12–16, evening otherwise.
 */
export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}
