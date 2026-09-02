/**
 * The research-area selector.
 *
 * Its whole surface — the sheet, the option list, the selected state, the
 * clear action — only exists after a tap, and the simulator cannot tap. So
 * this is where it is actually verified rather than by screenshot.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { RESEARCH_AREAS, type AreaFilter } from '../../../lib/peptides';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { CategorySelector } from '../components/CategorySelector';

let selected: AreaFilter | null = null;
let mounted: ReactTestRenderer | null = null;

async function render(value: AreaFilter = 'all'): Promise<ReactTestRenderer> {
  selected = null;
  await act(async () => {
    mounted = create(
      <ThemeProvider>
        <CategorySelector value={value} onChange={(next) => (selected = next)} />
      </ThemeProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).flatMap((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children.filter((child): child is string => typeof child === 'string');
  });
}

/** A tappable node by its accessible name. */
function control(tree: ReactTestRenderer, label: string) {
  return tree.root.find(
    (node) =>
      node.props?.accessibilityRole === 'button' &&
      node.props?.accessibilityLabel === label &&
      typeof node.props?.onPress === 'function',
  );
}

function options(tree: ReactTestRenderer) {
  return tree.root.findAll(
    (node) =>
      node.props?.accessibilityRole === 'button' &&
      node.props?.accessibilityState !== undefined &&
      typeof node.props?.onPress === 'function',
  );
}

async function open(tree: ReactTestRenderer) {
  await act(async () => {
    control(tree, 'Category filter, currently All Categories. Opens a list of categories').props.onPress();
  });
}

describe('the closed control', () => {
  it('states the current selection rather than a generic label', async () => {
    const tree = await render('all');
    expect(texts(tree)).toContain('All Categories');
  });

  it('names the active category when one is chosen', async () => {
    const tree = await render('cognitive');
    expect(texts(tree)).toContain('Cognitive');
  });

  it('announces the current selection to a screen reader', async () => {
    const tree = await render('sleep');
    expect(
      control(tree, 'Category filter, currently Sleep. Opens a list of categories'),
    ).toBeDefined();
  });

  /**
   * Without this, clearing a filter means reopening the sheet and hunting for
   * "All Categories" — three interactions to undo one.
   */
  it('offers a one-tap clear only when something is filtered', async () => {
    const unfiltered = await render('all');
    expect(texts(unfiltered)).not.toContain('Clear');
    await act(async () => unfiltered.unmount());

    const filtered = await render('recovery');
    expect(texts(filtered)).toContain('Clear');
    await act(async () => {
      control(filtered, 'Clear category filter').props.onPress();
    });
    expect(selected).toBe('all');
  });
});

describe('the sheet', () => {
  it('is closed until asked for — twelve areas do not occupy the header', async () => {
    const tree = await render('all');
    // Only the control's own label is rendered; no option list yet.
    expect(texts(tree)).not.toContain('Mitochondrial');
  });

  it('lists every area plus All Categories once opened', async () => {
    const tree = await render('all');
    await open(tree);

    const rendered = texts(tree);
    expect(rendered).toContain('All Categories');
    for (const label of [
      'Weight & Metabolic',
      'Cognitive',
      'Sleep',
      'Growth Hormone',
      'Recovery',
      'Sexual Health',
      'Aesthetics',
      'Mitochondrial',
      'Longevity & Aging Research',
      'Immune & Inflammation',
      'Endocrine',
      'Other',
    ]) {
      expect(rendered).toContain(label);
    }
  });

  it('offers exactly one option per area, plus All', async () => {
    const tree = await render('all');
    await open(tree);
    expect(options(tree)).toHaveLength(RESEARCH_AREAS.length + 1);
  });

  it('has an accessible title and a close control', async () => {
    const tree = await render('all');
    await open(tree);

    expect(
      tree.root.find((node) => node.props?.accessibilityRole === 'header'),
    ).toBeDefined();
    expect(control(tree, 'Close')).toBeDefined();
    expect(control(tree, 'Close category list')).toBeDefined();
  });

  it('exposes the selected option as selected, not only by colour', async () => {
    const tree = await render('cognitive');
    await act(async () => {
      control(tree, 'Category filter, currently Cognitive. Opens a list of categories').props.onPress();
    });

    const cognitive = control(tree, 'Cognitive');
    expect(cognitive.props.accessibilityState.selected).toBe(true);
    expect(control(tree, 'Recovery').props.accessibilityState.selected).toBe(false);
  });

  it('reports a chosen area and closes', async () => {
    const tree = await render('all');
    await open(tree);

    await act(async () => {
      control(tree, 'Mitochondrial').props.onPress();
    });

    expect(selected).toBe('mitochondrial');
    // The sheet closed, so its options are gone again.
    expect(texts(tree)).not.toContain('Longevity & Aging Research');
  });

  it('reports All Categories when that option is chosen', async () => {
    const tree = await render('all');
    await open(tree);
    await act(async () => {
      control(tree, 'All Categories').props.onPress();
    });
    expect(selected).toBe('all');
  });
});
