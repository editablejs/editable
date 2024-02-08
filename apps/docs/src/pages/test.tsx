import {
  useEffect as useReactEffect,
  useLayoutEffect as useReactLayoutEffect,
  useRef as useReactRef,
  useState as useReactState,
  createContext as createReactContext,
  useContext as useReactContext,
  memo,
} from 'react'
import {
  render,
  html,
  useState,
  flushSync,
  useRef,
  useEffect,
  c,
  HTMLAttributes,
  createContext,
  useContext,
  useLayoutEffect,
  createPortal,
  createElement
} from 'rezon'
import { spread } from 'rezon/directives/spread'
import { ref } from 'rezon/directives/ref'
import {
  Button,
  Icon,
  Avatar,
  AvatarImage,
  Slot,
  Portal,
  Popover,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent,
  Tooltip,
} from '@editablejs/theme'
import ReactDOM from 'react-dom'
import { use } from 'i18next'

interface TestProps extends HTMLAttributes<HTMLDivElement> {
  value?: string
}
const TestVirtual = c<TestProps>(props => {
  console.log('TestVirtual', props)
  if (props.value) return html`<div>value: ${props.value}</div>`
  return html`<div ${spread(props)}></div>`
})

const PortalContext = createContext<{ count: number }>({ count: 0 })

const CountContext = createContext<{ count: number; setCount: (value: number) => void }>({} as any)

const TestPortalContent = c(() => {
  const { count } = useContext(PortalContext)
  useLayoutEffect(() => {
    console.log('TestPortalContent LayoutEffect')
    return () => console.log('TestPortalContent LayoutEffect unmounted')
  })
  return html`<div>Portal${count}</div>`
})

const TestPortal = c(() => {
  useLayoutEffect(() => {
    console.log('TestPortal LayoutEffect')
    return () => console.log('TestPortal LayoutEffect unmounted')
  })
  return html`<div>
    TestPortal${Portal({
      children: TestPortalContent(),
    })}
  </div>`
})

const TestCount = c(() => {
  const { count, setCount } = useContext(CountContext)
  return html`<div @click=${() => setCount(count + 1)}>TestCount: ${count}</div>`
})

let t: any = null
const TestContainer = c(function ({ children }: { children: unknown }) {
  const el = this as any
  if (!t) {
    t = el
  }
  console.log(
    children,
    this,
    this === t,
    el['_$parent']['_$parts'].map((part: any) => part === this),
  )
  return children
})

/**
 *
${PortalContext.Provider({
  value: { count },
  children: TestPortal()
})}
 */

const _PopoverAnchor = c(props => {
  return html`<div ${spread(props)}>PopoverAnchor</div>`
})

const _PopoverContent = c(props => {
  return html`<div ${spread(props)}>PopoverContent</div>`
})

const _TestValue = c(() => {
  return 123
})

const TestChild = c(() => {
  const [count, setCount] = useState(0)

  useLayoutEffect(() => {
    console.log('TestChild LayoutEffect')
    return () => console.log('TestChild LayoutEffect unmounted')
  })
  // useEffect(() => {
  //   console.log('TestChild Effect')
  //   return () => console.log('TestChild Effect unmounted')
  // })
  return html`<div>TestChild: <button @click=${() => setCount(count + 1)}>${count}</button></div>`
})

const TestMemo = c(() => {
  const [count, setCount] = useState(0)

  useLayoutEffect(() => {
    console.log('TestMemo LayoutEffect')
    return () => console.log('TestMemo LayoutEffect unmounted')
  })
  // useEffect(() => {
  //   console.log('TestMemo Effect')
  //   return () => console.log('TestMemo Effect unmounted')
  // })
  return TestChild()
})

const TestChild1 = c(() => {
  const [count, setCount] = useState(0)

  useLayoutEffect(() => {
    console.log('TestChild1 LayoutEffect')
    return () => console.log('TestChild1 LayoutEffect unmounted')
  })
  // useEffect(() => {
  //   console.log('TestChild Effect')
  //   return () => console.log('TestChild Effect unmounted')
  // })
  return html`<div>TestChild1</div>`
})

const TestContext = c(() => {
  const { count, setCount } = useContext(CountContext)
  console.log("TestContext", count)
  useLayoutEffect(() => {
    console.log('TestContext LayoutEffect')
    return () => console.log('TestContext LayoutEffect unmounted')
  })
  return count % 2 === 0 ? createElement(TestContext1) : null
})

const TestContext1 = c(() => {
  const { count, setCount } = useContext(CountContext)
  console.log("TestContext1", count)
  useLayoutEffect(() => {
    console.log('TestContext1 LayoutEffect')
    return () => console.log('TestContext1 LayoutEffect unmounted')
  })
  return html`TestContext1: ${count}`
})

const MyApp = c(() => {
  const [count, setCount] = useState(0)
  // const ref = useRef<HTMLButtonElement>(null)
  // const slotRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    console.log('MyApp LayoutEffect')

    return () => console.log('MyApp LayoutEffect unmounted')
  })
  // useEffect(() => {
  //   console.log('MyApp Effect')

  //   return () => console.log('MyApp Effect unmounted')
  // })

  return html`${CountContext.Provider({
    value: { count, setCount },
    children: createElement(TestContext),
  })}<button @click=${() => setCount(count + 1)}>${count}</button>`
})
/**
 Tooltip({
    content: 'Tooltip',
    children: ({ ref: _ref }: any) => {
      return html`<button ${ref(_ref)} @click=${() => setCount(count + 1)}>${count}</button>`
    },
  })
 */
/**

 [count % 2 === 0 ? createPortal({
        container: document.body,
        children: TestChild1(),
      }) : null, html`<button @click=${() => setCount(count + 1)}>${count}</button>`]
 */
/**
 * ${Popover({
    open: true,
    children: [
      PopoverAnchor({
        children: Button({
          children: 'PopoverAnchor',
          ref,
        }),
      }),
      PopoverPortal({
        children: PopoverContent({
          children: 'PopoverContent',
        }),
      }),
    ],
})}
 */

/**
 * ${Slot({
      ref: slotRef,
      children: TestVirtual({
      children: Avatar({
        children: AvatarImage({
          width: 32,
          height: 32,
          src: 'https://avatars.githubusercontent.com/u/10251037?s=60&v=4'
        })
      })
    })})}
    <div>${Button({
      icon: Icon({
        name: 'bold'
      }),
      children: count,
      onClick: () => setCount(count + 1),
      ref
    })}</div>
    <div>
      <button @click=${() => {
        flushSync(() => setCount(2))
        setCount(1)
      }}>flushSync: ${count}</button>
    </div>
 */

export default function Test() {
  const ref = useReactRef<HTMLDivElement>(null)

  useReactEffect(() => {
    if (ref.current) {
      render(MyApp(), ref.current, {})
    }
  }, [])

  return (
    <div tw="text-center">
      <div>Vanilla JS:</div>
      <div ref={ref}></div>
      <br />
      React Component:
      <ReactTest />
    </div>
  )
}
Test.displayName = 'Test'

const ReactTestContext = createReactContext(0)

const ReactMemo1 = () => {
  const value = useReactContext(ReactTestContext)
  console.log('ReactMemo1', value)
  useReactLayoutEffect(() => {
    console.log('ReactMemo1 LayoutEffect')
    return () => console.log('ReactMemo1 LayoutEffect unmounted')
  })
  return <span>ReactMemo1 render {value}</span>
}

const ReactMemo = () => {
  const value = useReactContext(ReactTestContext)
  console.log('ReactMemo', value)
  useReactLayoutEffect(() => {
    console.log('ReactMemo LayoutEffect')
    return () => console.log('ReactMemo LayoutEffect unmounted')
  })
  return <span>ReactMemo render { value % 2 === 0 && <ReactMemo1 />}</span>
}

ReactMemo.displayName = 'ReactMemo'

const ReactButton = () => {
  const [count, setCount] = useReactState(0)
  const [count1, setCount1] = useReactState(0)

  useReactLayoutEffect(() => {
    console.log('ReactButton LayoutEffect')
    return () => console.log('ReactButton LayoutEffect unmounted')
  })

  // useReactEffect(() => {
  //   console.log('ReactButton Effect')
  //   return () => console.log('ReactButton Effect unmounted')
  // })

  return (
    <div>
      <button
        onClick={() => setCount(count + 1)}
      >
        {count}
      </button>
      <ReactTestContext.Provider value={count}>
        <ReactMemo />
      </ReactTestContext.Provider>
    </div>
  )
}
ReactButton.displayName = 'ReactButton'

const ReactButton1 = () => {
  useReactLayoutEffect(() => {
    console.log('ReactButton1 LayoutEffect')
    return () => console.log('ReactButton1 LayoutEffect unmounted')
  })

  return <div>React Button 1</div>
}
ReactButton.displayName = 'ReactButton1'

const ReactButton2 = () => {
  useReactLayoutEffect(() => {
    console.log('ReactButton2 LayoutEffect')
    return () => console.log('ReactButton2 LayoutEffect unmounted')
  })

  return <div>React Button 1</div>
}
ReactButton.displayName = 'ReactButton2'

const ReactTest = () => {
  const [count, setCount] = useReactState(0)

  useReactLayoutEffect(() => {
    console.log('ReactTest LayoutEffect')

    return () => console.log('ReactTest LayoutEffect unmounted')
  })

  // useReactEffect(() => {
  //   console.log('ReactTest Effect')
  //   return () => console.log('ReactTest Effect unmounted')
  // })
  return (
    <div>
      <div>
        <ReactButton />
        <ReactButton1 />
      </div>
      <div>
        <button onClick={() => setCount(count + 1)}>{count}</button>
      </div>
    </div>
  )
}
ReactTest.displayName = 'ReactTest'
