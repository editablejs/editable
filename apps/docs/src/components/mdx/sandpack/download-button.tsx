import * as React from 'react'
import { useSandpack } from '@codesandbox/sandpack-react'
import { IconDownload } from '../../icon/download'
import { useTranslation } from 'react-i18next'
export interface DownloadButtonProps {}

let supportsImportMap: boolean | void

function useSupportsImportMap() {
  function subscribe() {
    // It never updates.
    return () => {}
  }
  function getCurrentValue() {
    if (supportsImportMap === undefined) {
      supportsImportMap =
        (HTMLScriptElement as any).supports && (HTMLScriptElement as any).supports('importmap')
    }
    return supportsImportMap
  }
  function getServerSnapshot() {
    return false
  }

  return React.useSyncExternalStore(subscribe, getCurrentValue, getServerSnapshot)
}

const SUPPORTED_FILES = ['/App.js', '/styles.css']

export function DownloadButton({ providedFiles }: { providedFiles: Array<string> }) {
  const { sandpack } = useSandpack()
  const { t } = useTranslation()
  const supported = useSupportsImportMap()
  if (!supported) {
    return null
  }
  if (providedFiles.some(file => !SUPPORTED_FILES.includes(file))) {
    return null
  }

  const downloadHTML = () => {
    const css = sandpack.files['/styles.css']?.code ?? ''
    const code = sandpack.files['/App.js']?.code ?? ''
    const blob = new Blob([
      `<!DOCTYPE html>
<html>
<body>
  <div id="root"></div>
</body>
<!-- This setup is not suitable for production. -->
<!-- Only use it in development! -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react?dev",
    "react-dom/client": "https://esm.sh/react-dom/client?dev"
  }
}
</script>
<script type="text/babel" data-type="module">
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

${code.replace('export default ', 'let App = ')}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
</script>
<style>
${css}
</style>
</html>`,
    ])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'sandbox.html'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      tw="dark:text-primary-dark hover:text-link mx-1 inline-flex items-center text-sm text-primary transition duration-100 ease-in"
      onClick={downloadHTML}
      title={t('docs.sandpack.download-sandpack') ?? ''}
      type="button"
    >
      <IconDownload tw="mr-1 inline" /> {t('docs.sandpack.download')}
    </button>
  )
}
