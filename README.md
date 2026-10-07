# number-words

Convert integers to English words. Handles negatives, teens, and hyphenation of compound
tens ("twenty-three"). Short scale only, up to ±999,999,999,999.

## Usage

```js
import { toWords, MAX_VALUE } from 'number-words';

console.log(toWords(0));          // "zero"
console.log(toWords(42));         // "forty-two"
console.log(toWords(-1_234_567)); // "negative one million two hundred thirty-four thousand five hundred sixty-seven"
console.log(toWords(MAX_VALUE));  // "nine hundred ninety-nine billion ..."
```

`toWords(value)` takes an integer and returns its English-word form. It throws `TypeError`
for non-integers (including strings, `null`, `NaN`) and `RangeError` for magnitudes above
`MAX_VALUE` (999,999,999,999).

## Why this exists

Needed a small, dependency-free integer-to-words routine with predictable output for a
generator that embedded spelled-out quantities in prose. The trade-off: we pin one
convention per ambiguous point rather than offering options. Specifically — short scale
("billion" = 10⁹), "negative" for the sign (not "minus"), and hyphenation only below
one hundred. If you need long scale or a different sign word, fork rather than configure.

## Edge you will hit

The supported ceiling is just under one trillion. Values outside `[-MAX_VALUE, MAX_VALUE]`
throw `RangeError` rather than silently truncating or producing nonsense like "thousand
thousand". Widening the range means adding a name to the internal `SCALES` table; it is
not a parameter.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

