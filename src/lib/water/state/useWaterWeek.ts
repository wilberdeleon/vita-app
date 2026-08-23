/**
 * The recent-days strip's data, derived on each render.
 *
 * A thin wrapper over `buildWaterWeek`, which holds all the logic and is pure.
 * The only thing this adds is where the two inputs come from: past days out of
 * the provider's `history`, and today's total out of the live entry array — so
 * logging a drink moves today's column immediately.
 */

import { useMemo } from 'react';
import { totalMl } from '../model/totals';
import { buildWaterWeek, WEEK_DAYS, type WaterDay } from '../model/week';
import { useWater } from './WaterProvider';

export function useWaterWeek(days: number = WEEK_DAYS): WaterDay[] {
  const { logDate, entries, history } = useWater();

  return useMemo(
    () => buildWaterWeek(logDate, history, totalMl(entries), days),
    [logDate, history, entries, days],
  );
}
