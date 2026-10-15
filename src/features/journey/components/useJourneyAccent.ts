import { journeyAccent } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** Journey gold for the active scheme — identity only, never a verdict. */
export function useJourneyAccent(): string {
  return journeyAccent[useTheme().scheme];
}
