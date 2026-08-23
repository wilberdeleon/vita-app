import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Screen, ScreenHeader, TextField } from '../../../components/ui';
import { usePeptideContext } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * A peptide the catalog doesn't carry.
 *
 * Deliberately just a name. A custom entry is classified `custom` and makes
 * **no regulatory claim at all** — VITA will not let a user (or a hand-edited
 * storage file) label something as approved, because approval status is
 * asserted by the compiled catalog and nowhere else.
 *
 * The definition is saved separately from any setup, so the same custom
 * compound can back several setups and survives deleting one.
 */
export default function CustomPeptide() {
  const { createCustomDefinition } = usePeptideContext();
  const { surfaces } = useTheme();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim();

  const save = async () => {
    if (trimmed.length === 0 || saving) return;
    setSaving(true);
    const definition = await createCustomDefinition(trimmed);
    // Replace, so backing out of the setup form returns to the catalog rather
    // than to a naming screen for a peptide that already exists.
    router.replace(`/peptides/setup/new?definitionId=${encodeURIComponent(definition.id)}`);
  };

  return (
    <Screen>
      <ScreenHeader title="Custom Peptide" back />

      <TextField
        label="Name"
        placeholder="What are you tracking?"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        accessibilityLabel="Custom peptide name"
      />

      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Saved to your own list so you can reuse it. VITA doesn't classify custom entries as approved
        or research — it only records the name you chose.
      </Text>

      <Button
        label="Continue"
        color={palette.peptide}
        disabled={trimmed.length === 0 || saving}
        onPress={() => void save()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
});
