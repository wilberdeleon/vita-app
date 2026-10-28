/**
 * Journey persistence and the 6.5 weight migration, against the AsyncStorage
 * mock.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorageJourneyRepository as journeysRepo, parseJourney } from '../data/asyncStorageJourneyRepository';
import { asyncStorageWeightRepository as weightRepo } from '../data/asyncStorageRepository';
import { JourneyKeys } from '../data/keys';
import type { Journey } from '../model/journeys';
import type { WeightEntry } from '../model/types';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const active: Journey = {
  id: 'j-a',
  name: 'Summer Transformation',
  startDate: '2026-10-28',
  plannedEndDate: '2027-01-25',
  status: 'active',
  createdAt: '2026-10-28T16:30:00.000Z',
};
const done: Journey = {
  id: 'j-d',
  name: 'Spring Reset',
  startDate: '2026-03-01',
  plannedEndDate: '2026-05-29',
  status: 'completed',
  createdAt: '2026-03-01T15:00:00.000Z',
  completedAt: '2026-05-29T23:00:00.000Z',
};

describe('the key', () => {
  it('is new, versioned and Journey-owned', () => {
    expect(JourneyKeys.journeys).toBe('vita:v1:journey:journeys');
  });
});

describe('first run and round trips', () => {
  it('has no Journey — nothing is created for the user', async () => {
    expect(await journeysRepo.getJourneys()).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('saves and loads active and completed Journeys exactly', async () => {
    await journeysRepo.saveJourneys([done, active]);
    expect(await journeysRepo.getJourneys()).toEqual([done, active]);
  });

  it('an empty list removes the key', async () => {
    await journeysRepo.saveJourneys([active]);
    await journeysRepo.saveJourneys([]);
    expect(await AsyncStorage.getItem(JourneyKeys.journeys)).toBeNull();
  });
});

describe('malformed storage — dropped, never repaired, never invented', () => {
  it('reads corrupt JSON and non-arrays as no Journey', async () => {
    await AsyncStorage.setItem(JourneyKeys.journeys, '{not json');
    expect(await journeysRepo.getJourneys()).toEqual([]);
    await AsyncStorage.setItem(JourneyKeys.journeys, JSON.stringify({ active }));
    expect(await journeysRepo.getJourneys()).toEqual([]);
  });

  it.each([
    ['no name', { ...active, name: '' }],
    ['untrimmed name', { ...active, name: ' Padded ' }],
    ['bad start', { ...active, startDate: '2026-13-40' }],
    ['end before start', { ...active, plannedEndDate: '2026-10-01' }],
    ['unknown status', { ...active, status: 'paused' }],
    ['active with completedAt', { ...active, completedAt: '2026-11-01T00:00:00Z' }],
    ['completed without completedAt', { ...done, completedAt: undefined }],
    ['bad createdAt', { ...active, createdAt: 'yesterday' }],
  ])('drops a Journey with %s', (_label, value) => {
    expect(parseJourney(value)).toBeNull();
  });

  it('keeps the valid Journeys around a broken one, and never rewrites on read', async () => {
    const raw = JSON.stringify([active, { id: 'broken' }, done, null]);
    await AsyncStorage.setItem(JourneyKeys.journeys, raw);
    expect((await journeysRepo.getJourneys()).map((j) => j.id)).toEqual(['j-a', 'j-d']);
    expect(await AsyncStorage.getItem(JourneyKeys.journeys)).toBe(raw);
  });

  it('two active Journeys on disk: only the most recently created is active', async () => {
    const older = { ...active, id: 'j-old', createdAt: '2026-01-01T00:00:00.000Z' };
    await AsyncStorage.setItem(JourneyKeys.journeys, JSON.stringify([older, active, done]));
    const read = await journeysRepo.getJourneys();
    expect(read.filter((j) => j.status === 'active').map((j) => j.id)).toEqual(['j-a']);
    expect(read.map((j) => j.id)).toContain('j-d');
  });
});

describe('the 6.5 weight migration — additive, nothing adopted', () => {
  const legacy: WeightEntry = { id: 'legacy', loggedAt: '2026-10-27T15:00:00.000Z', weightKg: 81.6, enteredUnit: 'lb' };
  const owned: WeightEntry = { id: 'owned', loggedAt: '2026-10-28T15:00:00.000Z', weightKg: 81.2, enteredUnit: 'lb', journeyId: 'j-a' };

  it('a 6.4 weigh-in with no journeyId reads back exactly as stored — preserved, unowned', async () => {
    await AsyncStorage.setItem(JourneyKeys.weight, JSON.stringify([legacy]));
    const [read] = await weightRepo.getEntries();
    expect(read).toEqual(legacy);
    expect('journeyId' in read).toBe(false);
  });

  it('legacy and Journey-owned weigh-ins live side by side and survive a save', async () => {
    await weightRepo.saveEntries([owned, legacy]);
    expect(await weightRepo.getEntries()).toEqual([owned, legacy]);
  });

  it('a journeyId that is present but unusable is a shape VITA never wrote, and is dropped', async () => {
    await AsyncStorage.setItem(
      JourneyKeys.weight,
      JSON.stringify([legacy, { ...owned, id: 'bad1', journeyId: '' }, { ...owned, id: 'bad2', journeyId: 7 }]),
    );
    expect((await weightRepo.getEntries()).map((e) => e.id)).toEqual(['legacy']);
  });

  it('upgrading changes no stored byte and creates no Journey', async () => {
    const raw = JSON.stringify([legacy]);
    await AsyncStorage.setItem(JourneyKeys.weight, raw);
    await weightRepo.getEntries();
    expect(await journeysRepo.getJourneys()).toEqual([]);
    expect(await AsyncStorage.getItem(JourneyKeys.weight)).toBe(raw);
    expect(await AsyncStorage.getItem(JourneyKeys.journeys)).toBeNull();
  });
});
