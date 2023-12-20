/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Returns an iterable containing the result of calling `f(value)` on each
 * value in `items`.
 *
 * @example
 *
 * ```ts
 * render() {
 *   return html`
 *     <ul>
 *       ${map(items, (i) => html`<li>${i}</li>`)}
 *     </ul>
 *   `;
 * }
 * ```
 */
export function* map<T>(items: Iterable<T> | undefined, f: (value: T, index: number) => unknown) {
  if (items !== undefined) {
    let i = 0
    for (const value of items) {
      yield f(value, i++)
    }
  }
}
