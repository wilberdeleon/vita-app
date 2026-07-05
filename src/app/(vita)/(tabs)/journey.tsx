import { useState } from 'react';
import { Screen, ScreenHeader, SegmentedTabs } from '../../../components/ui';
import { OverviewTab } from '../../../features/journey/components/OverviewTab';
import { PhotosTab } from '../../../features/journey/components/PhotosTab';
import { WeightTab } from '../../../features/journey/components/WeightTab';

const TABS = ['Overview', 'Weight', 'Photos'] as const;

export default function Journey() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Screen dockClearance>
      <ScreenHeader title="My Journey" settings />
      <SegmentedTabs options={TABS} selectedIndex={tabIndex} onChange={setTabIndex} />
      {tabIndex === 0 ? <OverviewTab /> : null}
      {tabIndex === 1 ? <WeightTab /> : null}
      {tabIndex === 2 ? <PhotosTab /> : null}
    </Screen>
  );
}
