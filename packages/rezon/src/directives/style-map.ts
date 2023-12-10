/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { AttributePart, noChange } from 'lit-html';
import {
  directive,
  Directive,
  DirectiveParameters,
  PartInfo,
  PartType,
} from 'lit-html/directive.js';
import { formatStyle, toStyleString } from './utils/style';

/**
 * A key-value set of CSS properties and values.
 *
 * The key should be either a valid CSS property name string, like
 * `'background-color'`, or a valid JavaScript camel case property name
 * for CSSStyleDeclaration like `backgroundColor`.
 */
export interface StyleInfo {
  [name: string]: string | number | undefined | null;
}

const important = 'important';
// The leading space is important
const importantFlag = ' !' + important;
// How many characters to remove from a value, as a negative number
const flagTrim = 0 - importantFlag.length;

class StyleMapDirective extends Directive {
  private _previousStyleProperties?: Set<string>;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'style' ||
      (partInfo.strings?.length as number) > 2
    ) {
      throw new Error(
        'The `styleMap` directive must be used in the `style` attribute ' +
        'and must be the only part in the attribute.'
      );
    }
  }

  render(styleInfo: Readonly<StyleInfo>) {
    return toStyleString(styleInfo);
  }

  override update(part: AttributePart, [styleInfo]: DirectiveParameters<this>) {
    const { style } = part.element as HTMLElement;

    if (this._previousStyleProperties === undefined) {
      this._previousStyleProperties = new Set(Object.keys(styleInfo));
      return this.render(styleInfo);
    }

    // Remove old properties that no longer exist in styleInfo
    for (const name of this._previousStyleProperties) {
      // If the name isn't in styleInfo or it's null/undefined
      if (styleInfo[name] == null) {
        this._previousStyleProperties!.delete(name);
        if (name.includes('-')) {
          style.removeProperty(name);
        } else {
          (style as any)[name] = null;
        }
      }
    }

    // Add or update properties
    for (const prop in styleInfo) {
      const value = styleInfo[prop];
      if (value != null) {
        this._previousStyleProperties.add(prop);
        const arr = formatStyle(prop, value);
        if (!arr) continue
        const [name, val] = arr
        const isImportant =
          typeof val === 'string' && val.endsWith(importantFlag);
        if (name.includes('-') || isImportant) {
          style.setProperty(
            name,
            isImportant
              ? (val as string).slice(0, flagTrim)
              : (val as string),
            isImportant ? important : ''
          );
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (style as any)[name] = val;
        }
      }
    }
    return noChange;
  }
}

/**
 * A directive that applies CSS properties to an element.
 *
 * `styleMap` can only be used in the `style` attribute and must be the only
 * expression in the attribute. It takes the property names in the
 * {@link StyleInfo styleInfo} object and adds the properties to the inline
 * style of the element.
 *
 * Property names with dashes (`-`) are assumed to be valid CSS
 * property names and set on the element's style object using `setProperty()`.
 * Names without dashes are assumed to be camelCased JavaScript property names
 * and set on the element's style object using property assignment, allowing the
 * style object to translate JavaScript-style names to CSS property names.
 *
 * For example `styleMap({backgroundColor: 'red', 'border-top': '5px', '--size':
 * '0'})` sets the `background-color`, `border-top` and `--size` properties.
 *
 * @param styleInfo
 * @see {@link https://lit.dev/docs/templates/directives/#stylemap styleMap code samples on Lit.dev}
 */
export const styleMap = directive(StyleMapDirective);

/**
 * The type of the class that powers this directive. Necessary for naming the
 * directive's return type.
 */
export type { StyleMapDirective };
