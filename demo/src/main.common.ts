import './style.css'
import * as monaco from 'monaco-editor'
import { ExtensionHostKind, registerExtension } from 'vscode/extensions'
import './features/search'
import './features/intellisense'
import './features/notifications'
import './features/scm'
import './features/ai'
import '@codingame/monaco-vscode-csharp-default-extension'
import '@codingame/monaco-vscode-css-default-extension'
import '@codingame/monaco-vscode-diff-default-extension'
import '@codingame/monaco-vscode-html-default-extension'
import '@codingame/monaco-vscode-javascript-default-extension'
import '@codingame/monaco-vscode-json-default-extension'
import '@codingame/monaco-vscode-markdown-basics-default-extension'
import '@codingame/monaco-vscode-scss-default-extension'
import '@codingame/monaco-vscode-sql-default-extension'
import '@codingame/monaco-vscode-typescript-basics-default-extension'
import '@codingame/monaco-vscode-xml-default-extension'
import '@codingame/monaco-vscode-yaml-default-extension'
import '@codingame/monaco-vscode-theme-defaults-default-extension'
import '@codingame/monaco-vscode-theme-seti-default-extension'
import '@codingame/monaco-vscode-references-view-default-extension'
import '@codingame/monaco-vscode-search-result-default-extension'
import '@codingame/monaco-vscode-configuration-editing-default-extension'

const { getApi } = registerExtension({
  name: 'demo-main',
  publisher: 'codingame',
  version: '1.0.0',
  engines: {
    vscode: '*'
  }
}, ExtensionHostKind.LocalProcess)

void getApi().then(async vscode => {
  const mainModelUri = vscode.Uri.file('/workspace/test.js')
  await Promise.all([
    vscode.workspace.openTextDocument(mainModelUri),
    vscode.workspace.openTextDocument(monaco.Uri.file('/workspace/test_readonly.js')) // open the file so vscode sees it's locked
  ])

  const diagnostics = vscode.languages.createDiagnosticCollection('demo')
  diagnostics.set(mainModelUri, [{
    range: new vscode.Range(2, 9, 2, 12),
    severity: vscode.DiagnosticSeverity.Error,
    message: 'This is not a real error, just a demo, don\'t worry',
    source: 'Demo',
    code: 42
  }])

  document.querySelector('#toggleFullWorkbench')!.addEventListener('click', async () => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('mode') === 'full-workbench') {
      url.searchParams.delete('mode')
    } else {
      url.searchParams.set('mode', 'full-workbench')
    }
    window.location.href = url.toString()
  })

  document.querySelector('#resetLayout')!.addEventListener('click', async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('resetLayout', 'true')
    window.location.href = url.toString()
  })

  document.querySelector('#toggleHTMLFileSystemProvider')!.addEventListener('click', async () => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('htmlFileSystemProvider')) {
      url.searchParams.delete('htmlFileSystemProvider')
    } else {
      url.searchParams.set('htmlFileSystemProvider', 'true')
    }
    window.location.href = url.toString()
  })
})
