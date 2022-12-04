import tailwindConfig from '../../../../tailwind.config'
const config = tailwindConfig as any
export const CustomTheme = {
  colors: {
    accent: 'inherit',
    base: 'inherit',
    clickable: 'inherit',
    disabled: 'inherit',
    error: 'inherit',
    errorSurface: 'inherit',
    hover: 'inherit',
    surface1: 'inherit',
    surface2: 'inherit',
    surface3: 'inherit',
    warning: 'inherit',
    warningSurface: 'inherit',
  },
  syntax: {
    plain: 'inherit',
    comment: 'inherit',
    keyword: 'inherit',
    tag: 'inherit',
    punctuation: 'inherit',
    definition: 'inherit',
    property: 'inherit',
    static: 'inherit',
    string: 'inherit',
  },
  font: {
    body: config.theme.extend.fontFamily.sans.join(', ').replace(/"/gm, ''),
    mono: config.theme.extend.fontFamily.mono.join(', ').replace(/"/gm, ''),
    size: config.theme.extend.fontSize.code,
    lineHeight: '24px',
  },
}
