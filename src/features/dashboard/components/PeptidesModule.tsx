import { CompactPeptidesModule } from '../../../components/modules';
import { compactPeptidesView, type TodayRoutine } from '../../../lib/peptides';
import type { ModuleSize } from '../modules';

type Props = {
  today: readonly TodayRoutine[];
  isEmpty: boolean;
  isLoading: boolean;
  size: ModuleSize;
  onOpen: () => void;
  /** Enters Home's edit mode. */
  onLongPress?: () => void;
};

/**
 * Peptides on Home — Home's data, meeting the shared presentation.
 *
 * ## What this file is now
 *
 * Until 5.6B.3 it drew the module itself, and Fuel drew a different one from a
 * different selector: the same day read `4 scheduled · 4 today` here and `None
 * logged` there. The founder ruled that equivalent data must produce
 * equivalent presentation, so the drawing moved to
 * `components/modules/CompactPeptidesModule` and the wording to
 * `compactPeptidesView` in the peptide domain. **Home's version is the
 * source** — the shared component is what this file used to contain, visually
 * unchanged.
 *
 * Sprint 3's wording rules — *scheduled* never *due*, an unanswered day stays
 * unanswered, nothing is scored, the amount is the user's own — now live in
 * that one selector and are tested there. **Nothing here mutates peptide
 * data**; the module has nothing to write with.
 */
export function PeptidesModule({ today, isEmpty, isLoading, size, onOpen, onLongPress }: Props) {
  return (
    <CompactPeptidesModule
      view={compactPeptidesView(today, isEmpty, isLoading)}
      size={size}
      onOpen={onOpen}
      onLongPress={onLongPress}
    />
  );
}
