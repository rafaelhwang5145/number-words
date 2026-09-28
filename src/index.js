/**
 * Public entry point for number-words.
 *
 * Re-exports the converter and the supported-range constant so consumers do not need to
 * know about the internal module layout. Keeping this file thin means the module graph
 * is obvious and tree-shaking is trivial.
 */
export { toWords, MAX_VALUE } from './core.js';
