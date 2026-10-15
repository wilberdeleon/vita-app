import { EmptyState, Screen, ScreenHeader } from '../../../components/ui';

/**
 * My Journey — slice 6.1, the truthful foundation.
 *
 * Until slice 6.1 this tab rendered `JOURNEY_FIXTURE` unconditionally: a
 * 185.2 lb current weight, a green "−2.4 lbs", "Week 4 of 24", completed
 * milestones, a workout count and "Keep the momentum." — none of it entered
 * by the person holding the phone. It now says only what VITA knows.
 *
 * No weight is stored yet, so the screen is the empty state and nothing else:
 * no chart, no stage, no milestones, no Overview/Weight/Photos switcher over
 * three bodies that would each say the same nothing. **There is deliberately
 * no Log Weight action** — logging is slice 6.3, and a button into an
 * unfinished flow would be its own small lie. Photos is Sprint 7.
 */
export default function Journey() {
  return (
    <Screen dockClearance>
      <ScreenHeader title="My Journey" settings />
      <EmptyState
        icon="footsteps-outline"
        title="No weight entries yet"
        body="Weight you record will appear here, over time."
      />
    </Screen>
  );
}
