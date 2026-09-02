/**
 * Display casing.
 *
 * The rule under test is inverted from an ordinary title-caser: **a token that
 * already contains a capital is left alone**, because it is scientifically
 * cased on purpose. A generic `toTitleCase()` would produce "Glp-1 Receptor",
 * "Mots-C", "Ghk-Cu" and "Hcg", and would keep doing so for every future
 * compound nobody remembered to add to an exception list.
 */

import { formatLabel, formatLabels } from '../model/format';

describe('ordinary phrases', () => {
  it('title-cases plain content', () => {
    expect(formatLabel('type 2 diabetes')).toBe('Type 2 Diabetes');
    expect(formatLabel('obesity & weight management')).toBe('Obesity & Weight Management');
    expect(formatLabel('other cardiometabolic conditions')).toBe('Other Cardiometabolic Conditions');
    expect(formatLabel('growth hormone secretagogue')).toBe('Growth Hormone Secretagogue');
  });

  it('keeps minor words lowercase inside a phrase', () => {
    expect(formatLabel('diagnostic assessment of growth hormone secretion')).toBe(
      'Diagnostic Assessment of Growth Hormone Secretion',
    );
    expect(formatLabel('tissue repair in animal models')).toBe('Tissue Repair in Animal Models');
  });

  it('capitalizes a minor word at either end', () => {
    expect(formatLabel('of note')).toBe('Of Note');
  });

  it('capitalizes both halves of a hyphenated word', () => {
    expect(formatLabel('metabolic dysfunction-associated steatohepatitis')).toBe(
      'Metabolic Dysfunction-Associated Steatohepatitis',
    );
  });
});

describe('scientific casing is never touched', () => {
  it('preserves receptor and pathway names', () => {
    expect(formatLabel('GLP-1 receptor')).toBe('GLP-1 Receptor');
    expect(formatLabel('GIP receptor')).toBe('GIP Receptor');
    expect(formatLabel('glucagon receptor')).toBe('Glucagon Receptor');
    expect(formatLabel('MC1 receptor')).toBe('MC1 Receptor');
    expect(formatLabel('ghrelin / GHS-R1a receptor')).toBe('Ghrelin / GHS-R1a Receptor');
    expect(formatLabel('HGF / c-Met signalling')).toBe('HGF / c-Met Signalling');
  });

  it('preserves compound names a generic title-caser would mangle', () => {
    for (const name of ['GHK-Cu', 'MOTS-c', 'CJC-1295', 'BPC-157', '5-Amino-1MQ', 'NAD+', 'hCG']) {
      expect(formatLabel(name)).toBe(name);
    }
  });

  it('preserves mixed phrases containing a technical token', () => {
    expect(formatLabel('nicotinamide N-methyltransferase (NNMT)')).toBe(
      'Nicotinamide N-methyltransferase (NNMT)',
    );
    expect(formatLabel('AMPK pathway')).toBe('AMPK Pathway');
  });
});

describe('formatLabels', () => {
  it('formats a list', () => {
    expect(formatLabels(['type 2 diabetes', 'GLP-1 receptor'])).toEqual([
      'Type 2 Diabetes',
      'GLP-1 Receptor',
    ]);
  });

  it('is stable — formatting an already-formatted value changes nothing', () => {
    const once = formatLabel('obesity & weight management');
    expect(formatLabel(once)).toBe(once);
  });

  it('handles empty and whitespace input without throwing', () => {
    expect(formatLabel('')).toBe('');
    expect(formatLabel('   ')).toBe('');
  });
});
