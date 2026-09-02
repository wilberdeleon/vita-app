/**
 * `Mechanisms` — specifically its subtitle guard.
 *
 * Device QA on Tesamorelin surfaced a mechanism headed "GHRH receptor" with
 * "GHRH Receptor" printed again immediately beneath it. The content was fixed,
 * but the component should not be able to produce that at all, so the rule is
 * pinned here with inputs the catalog no longer contains.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { MechanismItem } from '../../../lib/peptides';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Mechanisms } from '../components/Mechanisms';

let mounted: ReactTestRenderer | null = null;

async function render(mechanisms: MechanismItem[]): Promise<string[]> {
  await act(async () => {
    mounted = create(
      <ThemeProvider>
        <Mechanisms mechanisms={mechanisms} />
      </ThemeProvider>,
    );
  });
  return mounted!.root.findAllByType(Text).flatMap((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children.filter((child): child is string => typeof child === 'string');
  });
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
});

it('drops a subtitle that only repeats the title', async () => {
  const texts = await render([
    { title: 'GHRH receptor', target: 'GHRH Receptor', explanation: 'Prompts the pituitary.' },
  ]);
  expect(texts.filter((text) => /ghrh/i.test(text))).toHaveLength(1);
  expect(texts).toContain('Prompts the pituitary.');
});

it('keeps a subtitle that says something the title does not', async () => {
  const texts = await render([
    { title: 'Slowing the stomach', target: 'GLP-1 receptor', explanation: 'Food leaves more slowly.' },
  ]);
  expect(texts).toContain('Slowing the stomach');
  expect(texts).toContain('GLP-1 Receptor');
});

it('renders a mechanism with no target at all', async () => {
  const texts = await render([{ title: 'Unknown pathway', explanation: 'Not well characterised.' }]);
  expect(texts).toEqual(['Unknown pathway', 'Not well characterised.']);
});
