

import { useCallbackRef } from "@/hooks/use-callback-ref";
import { ColorInputBaseProps } from "../types";
import { useState, useCallback, useEffect, html, virtual, TargetedFocusEvent, TargetedEvent } from "rezon";
import { spread } from "rezon/directives/spread";

interface Props extends ColorInputBaseProps {
  /** Blocks typing invalid characters and limits string length */
  escape: (value: string) => string;
  /** Checks that value is valid color string */
  validate: (value: string) => boolean;
  /** Processes value before displaying it in the input */
  format?: (value: string) => string;
  /** Processes value before sending it in `onChange` */
  process?: (value: string) => string;
}
HTMLInputElement
export const ColorInput = virtual<Props>((props) => {
  const { color = "", onChange, onBlur, escape, validate, format, process, ...rest } = props;
  const [value, setValue] = useState(() => escape(color));
  const onChangeCallback = useCallbackRef(onChange);
  const onBlurCallback = useCallbackRef(onBlur);

  // Trigger `onChange` handler only if the input value is a valid color
  const handleChange = useCallback(
    (e: TargetedEvent<HTMLInputElement>) => {
      const inputValue = escape(e.target.value);
      setValue(inputValue);
      if (validate(inputValue)) onChangeCallback(process ? process(inputValue) : inputValue);
    },
    [escape, process, validate, onChangeCallback]
  );

  // Take the color from props if the last typed color (in local state) is not valid
  const handleBlur = useCallback(
    (e: TargetedFocusEvent<HTMLInputElement>) => {
      if (!validate(e.target.value)) setValue(escape(color));
      onBlurCallback(e);
    },
    [color, escape, validate, onBlurCallback]
  );

  // Update the local state when `color` property value is changed
  useEffect(() => {
    setValue(escape(color));
  }, [color, escape]);

  return html`<input ${spread(rest)} value=${format ? format(value) : value}
  spellcheck="false"
  @change=${handleChange}
  @blur=${handleBlur}
  />`
})
