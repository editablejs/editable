import * as React from 'react'
import { SandpackProvider } from '@codesandbox/sandpack-react'
import { SandpackLogLevel } from '@codesandbox/sandpack-client'
import { CustomPreset } from './custom-preset'
import { createFileMap } from './create-file-map'
import { CustomTheme } from './themes'

type SandpackProps = {
  children: React.ReactNode
  autorun?: boolean
  showDevTools?: boolean
  deps?: Record<string, string> | string[]
}

const sandboxStyle = `
* {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 20px;
  padding: 0;
}

h1 {
  margin-top: 0;
  font-size: 22px;
}

h2 {
  margin-top: 0;
  font-size: 20px;
}

h3 {
  margin-top: 0;
  font-size: 18px;
}

h4 {
  margin-top: 0;
  font-size: 16px;
}

h5 {
  margin-top: 0;
  font-size: 14px;
}

h6 {
  margin-top: 0;
  font-size: 12px;
}

code {
  font-size: 1.2em;
}

ul {
  padding-left: 20px;
}
`.trim()

function SandpackRoot(props: SandpackProps) {
  let { children, autorun = true, showDevTools = false, deps = [] } = props
  const [devToolsLoaded, setDevToolsLoaded] = React.useState(false)
  const codeSnippets = React.Children.toArray(children) as React.ReactElement[]
  const files = createFileMap(codeSnippets)

  files['/styles.css'] = {
    code: [sandboxStyle, files['/styles.css']?.code ?? ''].join('\n\n'),
    hidden: true,
  }

  let customDeps: Record<string, string> = {}
  if (Array.isArray(deps)) {
    deps.forEach(dep => {
      customDeps[dep] = 'latest'
    })
  } else {
    customDeps = deps
  }
  return (
    <div tw="my-8" className="sandpack sandpack--playground">
      <SandpackProvider
        template="react"
        files={files}
        theme={CustomTheme}
        options={{
          autorun,
          initMode: 'user-visible',
          initModeObserverOptions: { rootMargin: '1400px 0px' },
          logLevel: SandpackLogLevel.None,
        }}
        customSetup={{
          dependencies: {
            '@editablejs/models': 'latest',
            '@editablejs/editor': 'latest',
            react: 'latest',
            'react-dom': 'latest',
            ...customDeps,
          },
        }}
      >
        <CustomPreset
          showDevTools={showDevTools}
          onDevToolsLoad={() => setDevToolsLoaded(true)}
          devToolsLoaded={devToolsLoaded}
          providedFiles={Object.keys(files)}
        />
      </SandpackProvider>
    </div>
  )
}

export default SandpackRoot
