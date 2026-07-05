import { router } from 'expo-router';
import { ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { PEPTIDE_EXAMPLES } from '../../../features/peptides/mock';
import { palette } from '../../../theme/tokens';

export default function PeptideExamples() {
  return (
    <Screen>
      <ScreenHeader title="Peptide Examples" back />
      <SectionHeader title="Common peptides" />
      {PEPTIDE_EXAMPLES.map((name) => (
        <ListRow
          key={name}
          icon="medical-outline"
          iconColor={palette.peptide}
          title={name}
          chevron
          onPress={() => router.back()}
        />
      ))}
    </Screen>
  );
}
