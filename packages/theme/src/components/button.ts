import { createComponent } from "@editablejs/dom-utils"
import tw, { css } from 'twin.macro'
import { cx } from '@emotion/css'
import { ButtonState, CreateButton } from "../interfaces/button"


const baseClassName = css`${tw`px-3.5 py-1 text-base leading-[normal] h-8 cursor-pointer select-none border inline-block rounded-md shadow border-zinc-200 hover:text-primary hover:border-primary focus:text-primary focus:border-primary active:text-primary active:border-primary focus:outline-none focus:ring-0 transition duration-150 ease-in-out`}`

const createClassName = (state: ButtonState) => {
  const classNames = [baseClassName]
  switch (state.type) {
    case 'primary':
      classNames.push(css`${tw`border-primary bg-primary text-white hover:text-white hover:bg-primary/80 hover:border-primary/80 focus:bg-primary/80 focus:border-primary/80 active:bg-primary/80 active:border-primary/80`}`)
      break
    case 'text':
      classNames.push(css`${tw`border-transparent bg-transparent shadow-none hover:text-current hover:bg-gray-100 hover:border-gray-100 focus:bg-gray-100 active:bg-gray-200`}`)
      break
  }
  if (state.disabled) {
    classNames.push(css`${tw`cursor-not-allowed shadow-none border-zinc-200 bg-black/5 text-black/25 hover:bg-black/5 hover:text-black/25 hover:border-zinc-200 focus:bg-black/5 focus:text-black/25 focus:border-zinc-200 active:bg-black/5 active:text-black/25 active:border-zinc-200`}`)
    if (state.type === 'text') {
      classNames.push(css`${tw`border-transparent bg-transparent hover:bg-transparent hover:border-transparent focus:bg-transparent focus:border-transparent active:bg-transparent active:border-transparent`}`)
    }
  }
  if (state.shape === 'circle') {
    classNames.push(css`${tw`rounded-full`}`)
  }
  if (state.icon && !state.children) {
    classNames.push(css`
    > * {
      transform: scale(1.143);
    }

    ${tw`w-8 px-0`}`)
  } else if (state.icon && state.children) {
    classNames.push(css`${tw`inline-flex justify-center gap-1 items-center`}`)
  }
  return [cx(classNames), state.className].filter(Boolean).join(' ')
}

export const createButton: CreateButton = (props, ref) => {
  const button = createComponent('button', {
    state: props,
    attributes: ["disabled", "htmlType"],
    events: ["onClick", "onMouseDown"],
    mount() {
      this.createAttributes((state) => {
        return {
          className: createClassName(state),
        }
      }, ["disabled", "type", "shape", "icon", "className"])
    },
    ref,
  })

  return button
}
