/**
 * Core conversion logic for spelling integers as English words.
 *
 * Design decisions, stated plainly:
 *
 * 1. Input range is [-999_999_999_999, 999_999_999_999] (just under one trillion).
 *    Going wider would mean inventing a scale naming convention (short vs long scale),
 *    and that ambiguity is out of scope. The bound is explicit and enforced.
 *
 * 2. Negative numbers are rendered with a leading "negative". We do not try to honour
 *    "minus" as a synonym because supporting two spellings doubles the test surface for
 *    no real gain; callers who want "minus" can string-replace.
 *
 * 3. Zero is "zero". Some libraries special-case 0 inside the chunk logic; we handle it
 *    once, up front, so the chunk machinery never has to think about an all-zero group.
 *
 * 4. We use the short scale ("billion" = 10^9). The long scale is a different library.
 *
 * 5. Hyphenation follows the usual written-English convention: compound cardinals below
 *    one hundred are hyphenated ("twenty-three"), and nothing else is. "one hundred
 *    twenty-three" has a space between "hundred" and "twenty-three".
 */

/**
 * Words for the units 0..19. Indexing into this array is the whole lookup mechanism for
 * the lowest chunk, so the order is load-bearing.
 */
const UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];

/**
 * Tens words for 20, 30, ... 90. Indexed by (tensDigit - 2), so index 0 is "twenty".
 */
const TENS = [
  'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
];

/**
 * Scale names for each group of three digits, short scale. Index 0 is the ones group
 * (no suffix), index 1 is thousands, and so on. The array length caps the supported
 * range; adding "trillion" here would widen the range without other code changes.
 */
const SCALES = ['', 'thousand', 'million', 'billion'];

/** Largest absolute value this module will spell. Derived from SCALES.length so the two
 *  cannot drift apart. */
export const MAX_VALUE = 10 ** (SCALES.length * 3) - 1; // 999_999_999_999

/**
 * Spell a value in the range [0, 999] as English words, with no scale suffix.
 *
 * This is the only place that knows about hyphenation and the teens special case.
 * Everything above 999 is built by composing this function's output with scale names.
 *
 * @param {number} n - value to spell, 0 <= n <= 999
 * @returns {string} the spelled-out form
 */
function spellHundreds(n) {
  const parts = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;

  if (hundreds > 0) {
    parts.push(`${UNITS[hundreds]} hundred`);
  }

  if (rest > 0) {
    if (rest < 20) {
      parts.push(UNITS[rest]);
    } else {
      const tensDigit = Math.floor(rest / 10);
      const unitsDigit = rest % 10;
      if (unitsDigit === 0) {
        parts.push(TENS[tensDigit - 2]);
      } else {
        // Hyphenate the sub-hundred compound only. This is the one place we use "-".
        parts.push(`${TENS[tensDigit - 2]}-${UNITS[unitsDigit]}`);
      }
    }
  }

  return parts.join(' ');
}

/**
 * Convert an integer to its English-word representation.
 *
 * @param {number} value - integer to convert; must be within [-MAX_VALUE, MAX_VALUE] and
 *   have no fractional part.
 * @returns {string} the spelled-out form, e.g. "negative forty-two", "zero", "one million".
 * @throws {TypeError} if `value` is not a number or is not an integer.
 * @throws {RangeError} if `|value|` exceeds MAX_VALUE.
 */
export function toWords(value) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new TypeError(`toWords expects an integer, got ${String(value)}`);
  }
  if (Math.abs(value) > MAX_VALUE) {
    throw new RangeError(`toWords: |value| must be <= ${MAX_VALUE}, got ${value}`);
  }
  if (value === 0) {
    return 'zero';
  }

  const negative = value < 0;
  let remaining = Math.abs(value);
  const groups = [];

  // Peel off three-digit chunks from the low end. We collect them in low-to-high order
  // and reverse before joining, which keeps the scale-index arithmetic trivial.
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const pieces = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const g = groups[i];
    if (g === 0) {
      // A zero group in the middle (e.g. the thousands group of 1_000_000) contributes
      // nothing and gets no scale word. This is the one edge case worth a comment.
      continue;
    }
    const scale = SCALES[i];
    pieces.push(scale === '' ? spellHundreds(g) : `${spellHundreds(g)} ${scale}`);
  }

  let result = pieces.join(' ');
  if (negative) {
    result = `negative ${result}`;
  }
  return result;
}
