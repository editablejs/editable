import { Hue } from "./hue";
import { Saturation } from "./saturation";

import { ColorModel, ColorPickerBaseProps, AnyColor } from "../types";
import { useColorManipulation } from "../hooks/use-color-manipulation";
import { html, virtual } from "rezon";
import { spread } from "rezon/directives/spread";
import { colorfulClassName, colorfulLastControlClassName } from "../styles";

interface Props<T extends AnyColor> extends Partial<ColorPickerBaseProps<T>> {
  colorModel: ColorModel<T>;
}

export const ColorPicker = <T extends AnyColor>(props: Props<T>) => virtual<Props<T>>(({
  className,
  colorModel,
  color = colorModel.defaultColor,
  onChange,
  ...rest
}) => {


  const [hsva, updateHsva] = useColorManipulation<T>(colorModel, color, onChange);

  return html`<div ${spread(rest)} class=${colorfulClassName}>
  ${Saturation({
    hsva,
    onChange: updateHsva
  })
    }
  ${Hue({
      hue: hsva.h,
      onChange: updateHsva,
      className: colorfulLastControlClassName
    })
    }
  </div>`;
})(props)
