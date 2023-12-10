import { AlphaColorPicker } from "./common/alpha-color-picker";
import { ColorModel, ColorPickerBaseProps } from "./types";
import { equalColorString } from "./utils/compare";
import { rgbaStringToHsva, hsvaToRgbaString } from "./utils/convert";
import { virtual } from "rezon";

const colorModel: ColorModel<string> = {
  defaultColor: "rgba(0, 0, 0, 1)",
  toHsva: rgbaStringToHsva,
  fromHsva: hsvaToRgbaString,
  equal: equalColorString,
};

export const RgbaStringColorPicker = virtual<Partial<ColorPickerBaseProps<string>>>((
  props
) => AlphaColorPicker({ ...props, colorModel }));
