import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toWords, MAX_VALUE } from '../src/index.js';

describe('toWords', () => {
  it('spells zero', () => {
    assert.equal(toWords(0), 'zero');
  });

  it('spells single digits', () => {
    assert.equal(toWords(1), 'one');
    assert.equal(toWords(7), 'seven');
    assert.equal(toWords(9), 'nine');
  });

  it('spells the teens as single words', () => {
    assert.equal(toWords(10), 'ten');
    assert.equal(toWords(11), 'eleven');
    assert.equal(toWords(13), 'thirteen');
    assert.equal(toWords(15), 'fifteen');
    assert.equal(toWords(18), 'eighteen');
    assert.equal(toWords(19), 'nineteen');
  });

  it('hyphenates compound tens but not round tens', () => {
    assert.equal(toWords(20), 'twenty');
    assert.equal(toWords(30), 'thirty');
    assert.equal(toWords(40), 'forty');
    assert.equal(toWords(23), 'twenty-three');
    assert.equal(toWords(99), 'ninety-nine');
  });

  it('spells exact hundreds', () => {
    assert.equal(toWords(100), 'one hundred');
    assert.equal(toWords(500), 'five hundred');
    assert.equal(toWords(900), 'nine hundred');
  });

  it('spells hundreds with a remainder, space before the compound', () => {
    assert.equal(toWords(101), 'one hundred one');
    assert.equal(toWords(115), 'one hundred fifteen');
    assert.equal(toWords(123), 'one hundred twenty-three');
    assert.equal(toWords(999), 'nine hundred ninety-nine');
  });

  it('spells thousands, including interior zero groups', () => {
    assert.equal(toWords(1000), 'one thousand');
    assert.equal(toWords(1001), 'one thousand one');
    assert.equal(toWords(1_000_000), 'one million');
    assert.equal(toWords(1_000_001), 'one million one');
    assert.equal(toWords(1_234_567), 'one million two hundred thirty-four thousand five hundred sixty-seven');
  });

  it('spells values up to the supported maximum', () => {
    assert.equal(toWords(MAX_VALUE), 'nine hundred ninety-nine billion nine hundred ninety-nine million nine hundred ninety-nine thousand nine hundred ninety-nine');
  });

  it('renders negatives with a leading "negative"', () => {
    assert.equal(toWords(-1), 'negative one');
    assert.equal(toWords(-42), 'negative forty-two');
    assert.equal(toWords(-100), 'negative one hundred');
  });

  it('rejects non-integers with TypeError', () => {
    assert.throws(() => toWords(1.5), TypeError);
    assert.throws(() => toWords('3'), TypeError);
    assert.throws(() => toWords(null), TypeError);
    assert.throws(() => toWords(undefined), TypeError);
    assert.throws(() => toWords(NaN), TypeError);
  });

  it('rejects values outside the supported range with RangeError', () => {
    assert.throws(() => toWords(MAX_VALUE + 1), RangeError);
    assert.throws(() => toWords(-(MAX_VALUE + 1)), RangeError);
  });
});
