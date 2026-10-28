import { createContext, useContext, useEffect } from 'react';

/**
 * Lets an open `VitaSheet` tell the `Screen` it was rendered inside that it
 * is open, so the screen stops taking taps that belong to the sheet.
 *
 * ## Why a sheet has to say so
 *
 * React Native routes touches through the **React tree, not the native view
 * tree**. A sheet's `Modal` is drawn in its own native window, but in React it
 * is still a child of whatever rendered it — almost always a `Screen`, and so
 * the screen's `ScrollView`. That scroll view keeps the default
 * `keyboardShouldPersistTaps` (`'never'`), which claims every touch in the
 * *capture* phase while a keyboard is up, before anything inside it can.
 *
 * So with the number pad open, the first tap on a sheet's primary button
 * went to the screen behind the sheet and was spent dismissing the keyboard;
 * only the second tap reached the button. The sheet's own `ScrollView`
 * already said `'handled'` — it was simply never asked. Found in Log Weight
 * and Add Water's custom amount (Audit Log, 2026-10-28), and reproduced on a
 * physical iPhone, not only the simulator.
 *
 * ## Why only while a sheet is open
 *
 * The screen keeps its current behaviour everywhere else. A screen that did
 * not opt into `keyboardAware` still dismisses on the first tap, exactly as
 * before; it switches to `'handled'` only for as long as one of its sheets is
 * on screen, which is the one case where its capture is wrong.
 *
 * The report is a count, not a flag, so two sheets on one screen (one closing
 * as the next opens) cannot switch it back early.
 */
export const SheetPresenceContext = createContext<((delta: 1 | -1) => void) | null>(null);

/** Reports this sheet as open to the enclosing `Screen` while `visible`. */
export function useReportSheetOpen(visible: boolean) {
  const report = useContext(SheetPresenceContext);

  useEffect(() => {
    // Outside a `Screen` there is no scroll view to hand the taps back from.
    if (!visible || !report) return;
    report(1);
    return () => report(-1);
  }, [visible, report]);
}
