import { EmptyState, Screen, ScreenHeader } from '../../../components/ui';

/**
 * Recents driven by real logging history ship in slice 2.7. The interim
 * fixture list was retired with the fixture catalog in 2.6 — showing a
 * placeholder list of foods the user never logged would be a lie about
 * their own history.
 */
export default function RecentFoods() {
  return (
    <Screen>
      <ScreenHeader title="Recent Foods" back />
      <EmptyState
        icon="time-outline"
        title="Nothing logged yet"
        body="Foods you log will show up here for quick re-logging."
      />
    </Screen>
  );
}
