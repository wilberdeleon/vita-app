/**
 * Slice 6.5 — the Journey lifecycle, through the real routes and the real
 * providers over in-memory AsyncStorage.
 *
 * A Journey is something the user starts, lives through and finishes. These
 * pin that: no pillars before a Journey exists; a four-step start that writes
 * nothing until Begin; an active home that is about *this* Journey; weight
 * that belongs to exactly one Journey; an end date that never finishes a
 * Journey on its own; and finished Journeys preserved, read-only.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
const mockDismissTo = jest.fn();
const mockRedirect = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: (...args: unknown[]) => mockPush(...args),
    navigate: jest.fn(),
    replace: jest.fn(),
    dismissTo: (...args: unknown[]) => mockDismissTo(...args),
  },
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
  useLocalSearchParams: () => mockParams,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Journey from '../../../app/(vita)/(tabs)/journey';
import JourneyDetail from '../../../app/(vita)/journey/[id]';
import StartJourney from '../../../app/(vita)/journey/start';
import { shiftLogDate } from '../../../lib/daily';
import { plannedEndFor, toKg } from '../../../lib/journey';
import { calendarDay, dateRange } from '../format';
import {
  TODAY,
  at,
  control,
  entry,
  field,
  hasControl,
  hasPillars,
  journeyFixture,
  mountApp,
  pillar,
  press,
  seedStorage,
  storedJourneys,
  storedWeights,
  text,
  type,
  unmountApp,
} from './journeyHarness';

beforeEach(async () => {
  mockParams = {};
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

afterEach(async () => {
  await unmountApp();
  jest.restoreAllMocks();
});

function confirmAlertWith(choice: string) {
  return jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    buttons?.find((button) => button.text === choice)?.onPress?.();
  });
}

const ACTIVE = journeyFixture({ id: 'j-a', name: 'Summer Transformation' }); // started 10 days ago, 90 days
const DONE = journeyFixture({
  id: 'j-d',
  name: 'Spring Reset',
  startDate: shiftLogDate(TODAY, -200),
  status: 'completed',
  createdAt: at(200, 7),
  completedAt: at(110, 18),
});

/* ─── no active Journey ─────────────────────────────────────────────── */

describe('with no active Journey', () => {
  it('there are no pillars — only Start a New Journey, and no empty Past Journeys heading', async () => {
    const tree = await mountApp(<Journey />);
    expect(hasPillars(tree)).toBe(false);
    expect(text(tree)).toContain('Start a New Journey');
    expect(text(tree)).not.toContain('PAST JOURNEYS');
    await press(tree, 'Start a New Journey');
    expect(mockPush).toHaveBeenCalledWith('/journey/start');
  });

  it('finished Journeys are listed under Past Journeys and open their summary', async () => {
    await seedStorage({ journeys: [DONE] });
    const tree = await mountApp(<Journey />);
    expect(hasPillars(tree)).toBe(false);
    expect(text(tree)).toContain('PAST JOURNEYS');
    expect(text(tree)).toContain('Spring Reset');
    await press(tree, /^Spring Reset, completed\./);
    expect(mockPush).toHaveBeenCalledWith('/journey/j-d');
  });

  it('legacy 6.4 weigh-ins do not make a Journey appear', async () => {
    await seedStorage({ weights: [entry('old', at(3, 7), 181)] });
    const tree = await mountApp(<Journey />);
    expect(hasPillars(tree)).toBe(false);
    expect(text(tree)).not.toContain('181.0');
    expect(await storedJourneys()).toEqual([]);
  });
});

/* ─── starting a Journey ────────────────────────────────────────────── */

describe('Start a New Journey', () => {
  async function continueTo(tree: Awaited<ReturnType<typeof mountApp>>) {
    await press(tree, 'Continue');
  }

  it('walks Name → Duration → Starting weight → Review, and each step requires its answer', async () => {
    const tree = await mountApp(<StartJourney />);
    expect(text(tree)).toContain('STEP 1 OF 4');
    expect(control(tree, 'Continue').props.disabled).toBe(true);
    await type(tree, 'Journey name', '   ');
    expect(control(tree, 'Continue').props.disabled).toBe(true);
    await type(tree, 'Journey name', '  Summer   Transformation ');
    await continueTo(tree);

    expect(text(tree)).toContain('How long do you want this Journey to run?');
    expect(control(tree, 'Continue').props.disabled).toBe(true);
    await press(tree, 'Custom');
    await type(tree, 'End date, year dash month dash day', TODAY);
    expect(text(tree)).toContain('Choose a date after today.');
    expect(control(tree, 'Continue').props.disabled).toBe(true);
    await press(tree, '90 days');
    const end = plannedEndFor('90d', TODAY);
    expect(text(tree)).toContain(`${calendarDay(end, true)} · 90 days`);
    await continueTo(tree);

    expect(text(tree)).toContain('Record your starting weight');
    expect(control(tree, 'Continue').props.disabled).toBe(true);
    await type(tree, 'Starting weight in pounds', '0');
    expect(control(tree, 'Continue').props.disabled).toBe(true);
    await type(tree, 'Starting weight in pounds', '180.4');
    await continueTo(tree);

    const review = text(tree);
    for (const fact of ['Summer Transformation', `${calendarDay(TODAY, true)} (today)`, calendarDay(end, true), '90 days', '180.4 lb']) {
      expect(review).toContain(fact);
    }
    for (const absent of ['BMI', 'goal', 'target', 'calorie']) expect(review.toLowerCase()).not.toContain(absent.toLowerCase());
    // Nothing written yet.
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('Begin Journey writes the Journey and a starting weigh-in it owns, then closes the flow', async () => {
    const tree = await mountApp(<StartJourney />);
    await type(tree, 'Journey name', 'Summer Transformation');
    await press(tree, 'Continue');
    await press(tree, '30 days');
    await press(tree, 'Continue');
    await press(tree, 'Weight unit, kg');
    await type(tree, 'Starting weight in kilograms', '81.6');
    await press(tree, 'Continue');
    await press(tree, 'Begin Journey');

    const [journey] = await storedJourneys();
    expect(journey).toMatchObject({
      name: 'Summer Transformation',
      startDate: TODAY,
      plannedEndDate: shiftLogDate(TODAY, 29),
      status: 'active',
    });
    const [first] = await storedWeights();
    expect(first).toMatchObject({ weightKg: 81.6, enteredUnit: 'kg', journeyId: journey.id, loggedAt: journey.createdAt });
    // Finishing closes the creation screen: Back never reveals the wizard.
    expect(mockDismissTo).toHaveBeenCalledWith('/journey');
  });

  it('leaving before Begin writes nothing', async () => {
    const tree = await mountApp(<StartJourney />);
    await type(tree, 'Journey name', 'Half Done');
    await press(tree, 'Continue');
    await press(tree, '60 days');
    await press(tree, 'Continue');
    await type(tree, 'Starting weight in pounds', '180');
    await press(tree, 'Back to the previous step');
    await unmountApp();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('a failed save leaves nothing behind and says so', async () => {
    const tree = await mountApp(<StartJourney />);
    await type(tree, 'Journey name', 'Unlucky');
    await press(tree, 'Continue');
    await press(tree, '30 days');
    await press(tree, 'Continue');
    await type(tree, 'Starting weight in pounds', '180');
    await press(tree, 'Continue');
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
    await press(tree, 'Begin Journey');
    expect(text(tree)).toContain("We couldn't save your Journey. Nothing was recorded");
    expect(await storedJourneys()).toEqual([]);
    expect(await storedWeights()).toEqual([]);
    expect(mockDismissTo).not.toHaveBeenCalled();
  });

  it('with a Journey already active, the start route sends you back to it', async () => {
    await seedStorage({ journeys: [ACTIVE], weights: [entry('s', at(10, 7), 180, ACTIVE.id)] });
    await mountApp(<StartJourney />);
    expect(mockRedirect).toHaveBeenCalledWith('/journey');
  });
});

/* ─── the active Journey ────────────────────────────────────────────── */

describe('an active Journey', () => {
  const own = [entry('s', at(10, 7), 186.4, ACTIVE.id), entry('m', at(4, 7), 184.0, ACTIVE.id)];
  const legacy = entry('legacy', at(2, 7), 150.0);
  const other = entry('other', at(150, 7), 199.9, DONE.id);

  async function mountActive() {
    await seedStorage({ journeys: [DONE, ACTIVE], weights: [...own, legacy, other] });
    jest.clearAllMocks();
    return mountApp(<Journey />);
  }

  it('is the subject: its name, Day X of Y, its dates, then its pillars', async () => {
    const tree = await mountActive();
    const content = text(tree);
    expect(content).toContain('Summer Transformation');
    expect(content).toContain('DAY 11 OF 90');
    expect(content).toContain(dateRange(ACTIVE.startDate, ACTIVE.plannedEndDate));
    expect(content).toContain('79 days remaining'); // days after today: 90 − 11
    expect(hasPillars(tree)).toBe(true);
    expect(hasControl(tree, 'Manage Journey')).toBe(true);
    expect(hasControl(tree, /^Summer Transformation\. Day 11 of 90\. Journey runs /)).toBe(false); // a label, not a button
    expect(tree.root.findAll((n) => typeof n.props.accessibilityLabel === 'string' && /^Summer Transformation\. Day 11 of 90\./.test(n.props.accessibilityLabel)).length).toBeGreaterThan(0);
  });

  it('Overview’s statistics come from this Journey’s weigh-ins only', async () => {
    const content = text(await mountActive());
    expect(content).toContain('186.4 lb'); // starting
    expect(content).toContain('184.0 lb'); // current
    expect(content).toContain('−2.4 lb');
    for (const foreign of ['150.0', '199.9']) expect(content).not.toContain(foreign);
  });

  it('Weight shows only this Journey’s history — never legacy entries or another Journey’s', async () => {
    const tree = await mountActive();
    await pillar(tree, 'Weight');
    const content = text(tree);
    expect(content).toContain('WEIGHT HISTORY · 2 ENTRIES');
    for (const foreign of ['150.0', '199.9']) expect(content).not.toContain(foreign);
  });

  it('a weigh-in logged here belongs to this Journey, and the others are untouched', async () => {
    const tree = await mountActive();
    await pillar(tree, 'Weight');
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '183.1');
    await press(tree, 'Log 183.1 pounds');
    const stored = await storedWeights();
    const added = stored.find((e) => Math.abs(e.weightKg - toKg(183.1, 'lb')) < 1e-9)!;
    expect(added.journeyId).toBe(ACTIVE.id);
    expect(stored.find((e) => e.id === 'legacy')).toEqual(legacy);
    expect(stored.find((e) => e.id === 'other')).toEqual(other);
  });

  it('editing a weigh-in can never move it to another Journey', async () => {
    const tree = await mountActive();
    await pillar(tree, 'Weight');
    await press(tree, /^184\.0 pounds, /);
    await type(tree, 'Weight in pounds', '183.5');
    await press(tree, 'Save 183.5 pounds');
    const edited = (await storedWeights()).find((e) => e.id === 'm')!;
    expect(edited.journeyId).toBe(ACTIVE.id);
    expect(edited.weightKg).toBe(toKg(183.5, 'lb'));
  });
});

/* ─── the planned end, extend, finish ───────────────────────────────── */

describe('the planned end date', () => {
  const ENDED = journeyFixture({ id: 'j-e', name: 'Marathon Prep', startDate: shiftLogDate(TODAY, -95), createdAt: at(95, 7) });

  it('reaching it finishes nothing — the user decides', async () => {
    await seedStorage({ journeys: [ENDED], weights: [entry('s', at(95, 7), 170, ENDED.id)] });
    const tree = await mountApp(<Journey />);
    expect(text(tree)).toContain('DAY 96 · PLANNED 90');
    expect(text(tree)).toContain('Journey end date reached');
    expect(text(tree)).toContain('This Journey stays active until you decide.');
    expect((await storedJourneys())[0].status).toBe('active');
    expect(hasControl(tree, 'Extend Journey')).toBe(true);
    expect(hasControl(tree, 'Finish Journey')).toBe(true);
  });

  it('Extend from there adds real days ahead and the day count follows', async () => {
    await seedStorage({ journeys: [ENDED], weights: [entry('s', at(95, 7), 170, ENDED.id)] });
    const tree = await mountApp(<Journey />);
    await press(tree, 'Extend Journey');
    const newEnd = shiftLogDate(TODAY, 30);
    await press(tree, `Add 30 days, ending ${calendarDay(newEnd, true)}`);
    await press(tree, `Extend Journey to ${calendarDay(newEnd, true)}`);
    const [journey] = await storedJourneys();
    expect(journey).toMatchObject({ id: 'j-e', status: 'active', plannedEndDate: newEnd, startDate: ENDED.startDate });
    expect(text(tree)).toContain('DAY 96 OF 126');
    expect(text(tree)).not.toContain('Journey end date reached');
    expect((await storedWeights())).toHaveLength(1);
  });
});

describe('Manage Journey', () => {
  async function mountActive() {
    await seedStorage({ journeys: [ACTIVE], weights: [entry('s', at(10, 7), 186.4, ACTIVE.id), entry('m', at(1, 7), 184.0, ACTIVE.id)] });
    return mountApp(<Journey />);
  }

  it('Extend moves the planned end and records the extension', async () => {
    const tree = await mountActive();
    await press(tree, 'Manage Journey');
    await press(tree, 'Extend Journey');
    await type(tree, 'New end date, year dash month dash day', ACTIVE.plannedEndDate);
    expect(control(tree, 'Extend Journey, choose a new end first').props.disabled).toBe(true);
    const newEnd = shiftLogDate(ACTIVE.plannedEndDate, 60);
    await type(tree, 'New end date, year dash month dash day', newEnd);
    await press(tree, `Extend Journey to ${calendarDay(newEnd, true)}`);
    expect(await storedJourneys()).toEqual([
      {
        ...ACTIVE,
        plannedEndDate: newEnd,
        extensions: [{ id: expect.any(String), extendedAt: expect.any(String), previousPlannedEndDate: ACTIVE.plannedEndDate, newPlannedEndDate: newEnd }],
      },
    ]);
    expect(text(tree)).toContain('DAY 11 OF 150');
  });

  it('Finish asks in factual terms, and Cancel changes nothing', async () => {
    const alert = confirmAlertWith('Cancel');
    const tree = await mountActive();
    await press(tree, 'Manage Journey');
    await press(tree, 'Finish Journey');
    expect(alert).toHaveBeenCalledWith(
      'Finish this Journey?',
      'The Journey will move to Past Journeys. Its recorded history will remain.',
      expect.anything(),
    );
    expect((await storedJourneys())[0].status).toBe('active');
  });

  it('Finish completes it, keeps its history, opens its summary, and the tab returns to Start', async () => {
    confirmAlertWith('Finish');
    const tree = await mountActive();
    await press(tree, 'Manage Journey');
    await press(tree, 'Finish Journey');
    const [journey] = await storedJourneys();
    expect(journey).toMatchObject({ id: 'j-a', status: 'completed', completedAt: expect.any(String) });
    expect((await storedWeights()).every((e) => e.journeyId === 'j-a')).toBe(true);
    expect(mockPush).toHaveBeenCalledWith('/journey/j-a');
    expect(hasPillars(tree)).toBe(false);
    expect(text(tree)).toContain('Start a New Journey');
    expect(text(tree)).toContain('Summer Transformation');
  });
});

/* ─── a finished Journey ────────────────────────────────────────────── */

describe('a finished Journey', () => {
  const doneWeights = [entry('d1', at(200, 7), 192.0, DONE.id), entry('d2', at(150, 7), 189.5, DONE.id), entry('d3', at(111, 7), 187.1, DONE.id)];

  it('its summary is factual and read-only', async () => {
    await seedStorage({ journeys: [DONE], weights: [...doneWeights, entry('x', at(1, 7), 150, 'someone-else')] });
    mockParams = { id: 'j-d' };
    const tree = await mountApp(<JourneyDetail />);
    const content = text(tree);
    for (const fact of ['COMPLETED', 'Spring Reset', 'STARTING', '192.0 lb', 'FINAL', '187.1 lb', '−4.9 lb', 'WEIGH-INS', '3', '91 days']) {
      expect(content).toContain(fact);
    }
    expect(content).not.toContain('150.0');
    for (const action of ['Log Weight', 'Manage Journey', 'Extend Journey', 'Finish Journey', 'Show weight in, kg']) {
      expect(hasControl(tree, action)).toBe(false);
    }
    expect(hasControl(tree, /^192\.0 pounds, /)).toBe(false); // rows do not open an editor
    for (const praise of ['great', 'congrat', 'well done', 'success', 'achiev']) expect(content.toLowerCase()).not.toContain(praise);
    expect(content).not.toContain('Progress photo'); // none were recorded
    expect(content).toContain('Journey completed');
    expect(content).toContain('Journey began');
  });

  it('an active Journey is never shown as a summary', async () => {
    await seedStorage({ journeys: [ACTIVE] });
    mockParams = { id: 'j-a' };
    await mountApp(<JourneyDetail />);
    expect(mockRedirect).toHaveBeenCalledWith('/journey');
  });

  it('a second Journey starts clean — it inherits nothing from the first', async () => {
    await seedStorage({ journeys: [DONE], weights: doneWeights });
    const flow = await mountApp(<StartJourney />);
    await type(flow, 'Journey name', 'Second Chapter');
    await press(flow, 'Continue');
    await press(flow, '60 days');
    await press(flow, 'Continue');
    await type(flow, 'Starting weight in pounds', '176.2');
    await press(flow, 'Continue');
    await press(flow, 'Begin Journey');
    await unmountApp();

    const tab = await mountApp(<Journey />);
    expect(text(tab)).toContain('Second Chapter');
    await pillar(tab, 'Weight');
    const content = text(tab);
    expect(content).toContain('WEIGHT HISTORY · 1 ENTRY');
    expect(content).toContain('176.2');
    for (const old of ['192.0', '189.5', '187.1']) expect(content).not.toContain(old);
    expect((await storedJourneys()).map((j) => j.status).sort()).toEqual(['active', 'completed']);
  });
});

void field;
