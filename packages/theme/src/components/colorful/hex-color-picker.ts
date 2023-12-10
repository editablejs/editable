
import { virtual } from "rezon";
import { ColorPicker } from "./common/color-picker";
import { ColorModel, ColorPickerBaseProps } from "./types";
import { equalHex } from "./utils/compare";
import { hexToHsva, hsvaToHex } from "./utils/convert";

const colorModel: ColorModel<string> = {
  defaultColor: "000",
  toHsva: hexToHsva,
  fromHsva: ({ h, s, v }) => hsvaToHex({ h, s, v, a: 1 }),
  equal: equalHex,
};

export const HexColorPicker = virtual<Partial<ColorPickerBaseProps<string>>>((props) => (
  ColorPicker({ ...props, colorModel })
));
