import { Dict } from '../../types';

export const keyCodes: Dict<number> = {
  0: 0x00,
  1: 0x01,
  2: 0x02,
  3: 0x03,
  4: 0x04,
  5: 0x05,
  6: 0x06,
  7: 0x07,
  8: 0x08,
  9: 0x09,
  A: 0x0a,
  B: 0x0b,
  C: 0x0c,
  D: 0x0d,
  E: 0x0e,
  F: 0x0f,
  Space: 0x13,
  Tab: 0x13,
  Enter: 0x12,
  Minus: 0x11,
  Plus: 0x10,
  ArrowDown: 0x11,
  ArrowUp: 0x10,
};

export const keyTranslation: Dict<string> = {
  '@': 'Tab',
  G: 'Enter',
};

export const layouts: Dict<string> = {
  CLASSIC: '@37BFG26AE-159D+048C',
  MODERN: '@CDEFG89AB-4567+0123',
  JELIC: '@789AG456B-123C+0FED',
};
