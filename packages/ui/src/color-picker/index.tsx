import { forwardRef, ReactNode, useEffect, useMemo, useState } from 'react'
import { HexColorInput, RgbaStringColorPicker } from 'react-colorful'
import { colord } from 'colord'
import tw, { css } from 'twin.macro'
import { Button } from '../button'
import { Icon, IconCustom } from '../icon'
import { Popover, PopoverContent, PopoverContentProps, PopoverTrigger } from '../popover'
import { ColorPickerGroup } from './group'
import { ColorPickerItem } from './item'
import { Colors, createPalette, Palette } from './palette'
import { useLocalStore } from './use-local-store'

type ColorPickerSize = 'small' | 'default' | 'large'

export interface ColorPickerLocale {
  recent: {
    title: string
    empty: string
  }

  custom: {
    title: string
  }
}

export interface ColorPickerProps {
  colors?: Colors
  size?: ColorPickerSize
  value?: string
  defaultValue?: string
  defaultColor?: {
    color: string
    title: ReactNode
  }
  disabled?: boolean
  onSelect?: (value: string) => void
  enableRecent?: boolean
  enableCustom?: boolean
  locale?: ColorPickerLocale
  renderButton?: (props: { type: 'button' | 'arrow'; children: ReactNode }) => ReactNode
  side?: PopoverContentProps['side']
  children?: ReactNode
}

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps & { className?: string }>(
  (
    {
      size,
      colors = Palette.colors,
      value: valueProp = '',
      defaultValue = '',
      disabled,
      onSelect,
      defaultColor,
      className,
      children,
      enableRecent = true,
      enableCustom = true,
      locale = {
        recent: {
          title: 'Recent',
          empty: 'No recent colors',
        },
        custom: {
          title: 'Custom',
        },
      },
      renderButton,
      side,
    },
    ref,
  ) => {
    const palette = useMemo(() => createPalette(colors), [colors])
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(defaultValue)

    const [localColors, addLocalColors] = useLocalStore()

    const handleSelect = (color: string, isClose = true) => {
      setValue(color)
      onSelect?.(color)
      if (isClose) setOpen(false)
    }

    useEffect(() => {
      if (!open && value) addLocalColors([value])
    }, [value, open])

    const renderColorButton = () => {
      return (
        <Button
          tw="px-1.5 inline-flex flex-col"
          disabled={disabled}
          className={className}
          type="text"
          onClick={() => handleSelect(value)}
        >
          <span tw="inline-block">{children}</span>
          <span tw="inline-block -mt-[1px]">
            <svg width="14px" height="2px" viewBox="0 0 14 2">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <rect
                  stroke={palette.getStroke(value)}
                  strokeWidth="0.5"
                  fill={value}
                  x="0"
                  y="0"
                  width="100%"
                  height="2"
                  rx="0.125"
                />
              </g>
            </svg>
          </span>
        </Button>
      )
    }

    const renderArrowButton = () => {
      return (
        <Button
          disabled={disabled}
          type="text"
          icon={
            <Icon
              name="arrowCaretDown"
              css={[
                tw`text-xxs text-gray-400 align-[unset] transform-none transition-all`,
                open && tw`rotate-180`,
              ]}
            />
          }
          tw="w-5 rounded -ml-1"
          className={className}
        />
      )
    }

    return (
      <Popover
        open={open}
        onOpenChange={value => setOpen(disabled ? false : value)}
        trigger="click"
      >
        <PopoverTrigger asChild>
          <div
            data-open={open || undefined}
            css={[
              tw`flex rounded-md`,
              css`
                &[data-open='true'] {
                  ${tw`bg-gray-100`}
                }
              `,
            ]}
            ref={ref}
          >
            {renderButton
              ? renderButton({ type: 'button', children: renderColorButton() })
              : renderColorButton()}
            {renderButton
              ? renderButton({ type: 'arrow', children: renderArrowButton() })
              : renderArrowButton()}
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" side={side} sideOffset={1}>
          <div
            css={[
              tw`bg-white shadow-outer rounded-md text-base pt-1`,
              size === 'large' && tw`text-lg`,
            ]}
          >
            {defaultColor && (
              <div
                tw="flex items-center gap-2 p-2 mb-2 cursor-pointer hover:bg-black/5"
                onClick={() => handleSelect(defaultColor.color)}
              >
                <ColorPickerItem palette={palette} color={defaultColor.color} activeColors={[]} />
                <span>{defaultColor.title}</span>
              </div>
            )}
            <div tw="px-2">
              {colors.map((group, index) => (
                <ColorPickerGroup
                  key={index}
                  activeColors={[value]}
                  colors={group.map(color => (typeof color === 'string' ? color : color.color))}
                  palette={palette}
                  onSelect={value => handleSelect(value)}
                />
              ))}
              {enableRecent && (
                <div tw="mt-2">
                  <div tw="text-base">{locale.recent.title}</div>
                  <div tw="flex items-center">
                    {localColors.length === 0 && (
                      <div tw="text-black/10 text-base">{locale.recent.empty}</div>
                    )}
                    {localColors.map(localColor => {
                      return (
                        <ColorPickerItem
                          key={localColor}
                          palette={palette}
                          color={localColor}
                          activeColors={[value]}
                          onSelect={value => handleSelect(value)}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            {enableCustom && (
              <Popover trigger="click">
                <PopoverTrigger asChild>
                  <div tw="flex justify-between items-center border-t border-black/10 p-2 mt-2 cursor-pointer hover:bg-black/5">
                    <div tw="flex gap-1 justify-center items-center">
                      <IconCustom>
                        <svg viewBox="0 0 1600 924" width="24px" height="24px">
                          <path
                            d="M416.568493 418.317025c122.439139-70.688063 278.994912-28.756164 349.682975 93.682975 0-141.376125-114.623875-256-256-256s-256 114.623875-256 256c0 46.641096 12.474364 90.376517 34.266927 128 0.050098-88.372603 45.989824-174.340509 128.050098-221.682975z"
                            fill="#0FFCE4"
                            p-id="51680"
                          ></path>
                          <path
                            d="M416.568493 605.682975c70.688063-122.439139 227.243836-164.371037 349.682975-93.682975-70.688063-122.439139-227.243836-164.371037-349.682975-93.682975s-164.371037 227.243836-93.682974 349.682975c23.295499 40.378865 55.959295 71.990607 93.682974 93.733072-44.186301-76.599609-47.392564-173.989824 0-256.050097z"
                            fill="#0FFCE4"
                            p-id="51681"
                          ></path>
                          <path
                            d="M510.251468 768c0-141.376125 114.623875-256 256-256-122.439139-70.688063-278.994912-28.756164-349.682975 93.682975s-28.756164 278.994912 93.682975 349.682974c40.378865 23.295499 84.464971 34.367123 128 34.317026-76.499413-44.186301-128-126.947945-128-221.682975z"
                            fill="#FFCB01"
                            p-id="51682"
                          ></path>
                          <path
                            d="M672.568493 861.682975c-70.688063-122.439139-28.756164-278.994912 93.682975-349.682975-141.376125 0-256 114.623875-256 256s114.623875 256 256 256c46.641096 0 90.376517-12.474364 128-34.266928-88.372603-0.050098-174.340509-45.989824-221.682975-128.050097z"
                            fill="#FFCB01"
                            p-id="51683"
                          ></path>
                          <path
                            d="M859.934442 861.682975c-122.439139-70.688063-164.371037-227.243836-93.682974-349.682975-122.439139 70.688063-164.371037 227.243836-93.682975 349.682975s227.243836 164.371037 349.682975 93.682974c40.378865-23.295499 71.990607-55.959295 93.733072-93.682974-76.599609 44.186301-173.989824 47.392564-256.050098 0z"
                            fill="#FF8D01"
                            p-id="51684"
                          ></path>
                          <path
                            d="M1022.251468 768c-141.376125 0-256-114.623875-256-256-70.688063 122.439139-28.756164 278.994912 93.682974 349.682975s278.994912 28.756164 349.682975-93.682975c23.295499-40.378865 34.367123-84.464971 34.317025-128-44.186301 76.549511-126.947945 128-221.682974 128z"
                            fill="#FF8D01"
                            p-id="51685"
                          ></path>
                          <path
                            d="M1115.934442 605.682975c-122.439139 70.688063-278.994912 28.756164-349.682974-93.682975 0 141.376125 114.623875 256 256 256s256-114.623875 256-256c0-46.641096-12.474364-90.376517-34.266928-128-0.050098 88.372603-45.989824 174.340509-128.050098 221.682975z"
                            fill="#F44742"
                            p-id="51686"
                          ></path>
                          <path
                            d="M1115.934442 418.317025c-70.688063 122.439139-227.243836 164.371037-349.682974 93.682975 70.688063 122.439139 227.243836 164.371037 349.682974 93.682975s164.371037-227.243836 93.682975-349.682975c-23.295499-40.378865-55.959295-71.990607-93.682975-93.733072 44.186301 76.599609 47.392564 173.989824 0 256.050097z"
                            fill="#F44742"
                            p-id="51687"
                          ></path>
                          <path
                            d="M1022.251468 256c0 141.376125-114.623875 256-256 256 122.439139 70.688063 278.994912 28.756164 349.682974-93.682975s28.756164-278.994912-93.682974-349.682974c-40.378865-23.295499-84.464971-34.367123-128-34.317026C970.750881 78.503327 1022.251468 161.264971 1022.251468 256z"
                            fill="#019FFF"
                            p-id="51688"
                          ></path>
                          <path
                            d="M859.934442 162.317025c70.688063 122.439139 28.756164 278.994912-93.682974 349.682975 141.376125 0 256-114.623875 256-256s-114.623875-256-256-256c-46.641096 0-90.376517 12.474364-128 34.266928 88.372603 0.050098 174.340509 45.989824 221.682974 128.050097z"
                            fill="#019FFF"
                            p-id="51689"
                          ></path>
                          <path
                            d="M672.568493 162.317025c122.439139 70.688063 164.371037 227.243836 93.682975 349.682975 122.439139-70.688063 164.371037-227.243836 93.682974-349.682975s-227.243836-164.371037-349.682974-93.682974c-40.378865 23.295499-71.990607 55.959295-93.733073 93.682974 76.599609-44.186301 173.989824-47.392564 256.050098 0z"
                            fill="#00C4B2"
                            p-id="51690"
                          ></path>
                          <path
                            d="M510.251468 256c141.376125 0 256 114.623875 256 256 70.688063-122.439139 28.756164-278.994912-93.682975-349.682975s-278.994912-28.756164-349.682974 93.682975C299.59002 296.378865 288.518395 340.464971 288.568493 384 332.754795 307.500587 415.516438 256 510.251468 256z"
                            fill="#00C4B2"
                            p-id="51691"
                          ></path>
                        </svg>
                      </IconCustom>
                      {locale.custom.title}
                    </div>
                    <Icon tw="text-black/20" name="arrowRight" />
                  </div>
                </PopoverTrigger>
                <PopoverContent side="right" sideOffset={6} align="end">
                  <div
                    css={[
                      tw`shadow-outer border-none rounded-md p-2.5 flex flex-col gap-2.5`,
                      css`
                        .react-colorful__saturation {
                          ${tw`rounded-t`}
                        }
                        .react-colorful__last-control {
                          ${tw`rounded-b`}
                        }
                        .react-colorful__pointer {
                          ${tw`w-4 h-4`}
                        }
                      `,
                    ]}
                  >
                    <RgbaStringColorPicker
                      color={value}
                      onChange={color => handleSelect(color, false)}
                    />
                    <HexColorInput
                      tw="outline-none border border-gray-200 rounded bg-gray-100 text-base uppercase px-2 py-0.5 text-center"
                      prefixed={true}
                      alpha={true}
                      color={colord(value).toRgbString()}
                      onChange={color => handleSelect(colord(color).toRgbString(), false)}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)

ColorPicker.displayName = 'ColorPicker'
