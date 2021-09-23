import { label } from './iiif';

test('Test output of IIIF presentation label by internationalized language code.', () => {
  const englishLabel = label({ en: ['Sample label'] }, 'en');
  expect(englishLabel).toBe('Sample label');
  const noLangLabel = label({ none: ['!*(@#'] }, 'none');
  expect(noLangLabel).toBe('!*(@#');
  const nonMatchingLabel = label({ es: ['Etiqueta de muestra'] }, 'en');
  expect(nonMatchingLabel).toBe(undefined);
});
