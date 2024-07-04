import getConfigurationServiceOverride, { IStoredWorkspace, initUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override'
import getKeybindingsServiceOverride, { initUserKeybindings } from '@codingame/monaco-vscode-keybindings-service-override'
import { RegisteredFileSystemProvider, RegisteredMemoryFile, RegisteredReadOnlyFile, registerFileSystemOverlay } from '@codingame/monaco-vscode-files-service-override'
import * as monaco from 'monaco-editor'
import { IWorkbenchConstructionOptions, LogLevel, IEditorOverrideServices } from 'vscode/services'
import * as vscode from 'vscode'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getNotificationServiceOverride from '@codingame/monaco-vscode-notifications-service-override'
import getDialogsServiceOverride from '@codingame/monaco-vscode-dialogs-service-override'
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override'
import getScmServiceOverride from '@codingame/monaco-vscode-scm-service-override'
import getBannerServiceOverride from '@codingame/monaco-vscode-view-banner-service-override'
import getStatusBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override'
import getTitleBarServiceOverride from '@codingame/monaco-vscode-view-title-bar-service-override'
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override'
import getSnippetServiceOverride from '@codingame/monaco-vscode-snippets-service-override'
import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override'
import getMarkersServiceOverride from '@codingame/monaco-vscode-markers-service-override'
import getLanguageDetectionWorkerServiceOverride from '@codingame/monaco-vscode-language-detection-worker-service-override'
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override'
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import getEnvironmentServiceOverride from '@codingame/monaco-vscode-environment-service-override'
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override'
import getWorkspaceTrustOverride from '@codingame/monaco-vscode-workspace-trust-service-override'
import getLogServiceOverride from '@codingame/monaco-vscode-log-service-override'
import getWorkingCopyServiceOverride from '@codingame/monaco-vscode-working-copy-service-override'
import getChatServiceOverride from '@codingame/monaco-vscode-chat-service-override'
import getUserDataSyncServiceOverride from '@codingame/monaco-vscode-user-data-sync-service-override'
import getUserDataProfileServiceOverride from '@codingame/monaco-vscode-user-data-profile-service-override'
import getAiServiceOverride from '@codingame/monaco-vscode-ai-service-override'
import getOutlineServiceOverride from '@codingame/monaco-vscode-outline-service-override'
import getTimelineServiceOverride from '@codingame/monaco-vscode-timeline-service-override'
import getCommentsServiceOverride from '@codingame/monaco-vscode-comments-service-override'
import getEditSessionsServiceOverride from '@codingame/monaco-vscode-edit-sessions-service-override'
import getEmmetServiceOverride from '@codingame/monaco-vscode-emmet-service-override'
import getMultiDiffEditorServiceOverride from '@codingame/monaco-vscode-multi-diff-editor-service-override'
import getPerformanceServiceOverride from '@codingame/monaco-vscode-performance-service-override'
import getRelauncherServiceOverride from '@codingame/monaco-vscode-relauncher-service-override'
import getUpdateServiceOverride from '@codingame/monaco-vscode-update-service-override'
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override'
import { EnvironmentOverride } from 'vscode/workbench'
import { Worker } from './tools/crossOriginWorker'
import defaultKeybindings from './user/keybindings.json?raw'
import defaultConfiguration from './user/configuration.json?raw'
import { workerConfig } from './tools/extHostWorker'
import 'vscode/localExtensionHost'

const url = new URL(document.location.href)
const params = url.searchParams

params.delete('resetLayout')

window.history.replaceState({}, document.title, url.href)

export const workspaceFile = monaco.Uri.file('/workspace.code-workspace')

const fileSystemProvider = new RegisteredFileSystemProvider(false)

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/workspace/test.js'), `// import anotherfile
let variable = 1
function inc () {
  variable++
}

while (variable < 5000) {
  inc()
  console.log('Hello world', variable);
}`
))

const content = new TextEncoder().encode('This is a readonly static file')
fileSystemProvider.registerFile(new RegisteredReadOnlyFile(vscode.Uri.file('/workspace/test_readonly.js'), async () => content, content.length))

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/workspace/jsconfig.json'), `{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "lib": [
      "es2021",
      "DOM"
    ]
  }
}`
))

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/workspace/index.html'), `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>monaco-vscode-api demo</title>
    <link rel="stylesheet" href="test.css">
  </head>
  <body>
    <style type="text/css">
      h1 {
        color: DeepSkyBlue;
      }
    </style>

    <h1>Hello, world!</h1>
  </body>
</html>`
))

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/workspace/test.md'), `
***Hello World***

Math block:
$$
\\displaystyle
\\left( \\sum_{k=1}^n a_k b_k \\right)^2
\\leq
\\left( \\sum_{k=1}^n a_k^2 \\right)
\\left( \\sum_{k=1}^n b_k^2 \\right)
$$

# Easy Math

2 + 2 = 4 // this test will pass
2 + 2 = 5 // this test will fail

# Harder Math

230230 + 5819123 = 6049353
`
))

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/workspace/test.customeditor'), `
Custom Editor!`
))

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/workspace/test.css'), `
h1 {
  color: DeepSkyBlue;
}`
))

// Use a workspace file to be able to add another folder later (for the "Attach filesystem" button)
fileSystemProvider.registerFile(new RegisteredMemoryFile(workspaceFile, JSON.stringify(<IStoredWorkspace>{
  folders: [{
    path: '/workspace'
  }]
}, null, 2)))

fileSystemProvider.registerFile(new RegisteredMemoryFile(monaco.Uri.file('/workspace/.vscode/extensions.json'), JSON.stringify({
  recommendations: [
    'vscodevim.vim'
  ]
}, null, 2)))

registerFileSystemOverlay(1, fileSystemProvider)

// Workers
export type WorkerLoader = () => Worker
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
  editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
  textMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
  languageDetectionWorkerService: () => new Worker(new URL('@codingame/monaco-vscode-language-detection-worker-service-override/worker', import.meta.url), { type: 'module' }),
  localFileSearchWorker: () => new Worker(new URL('@codingame/monaco-vscode-search-service-override/worker', import.meta.url), { type: 'module' })

}
window.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    const workerFactory = workerLoaders[label]
    if (workerFactory != null) {
      return workerFactory()
    }
    throw new Error(`Unimplemented worker ${label} (${moduleId})`)
  }
}

// Set configuration before initializing service so it's directly available (especially for the theme, to prevent a flicker)
await Promise.all([
  initUserConfiguration(defaultConfiguration),
  initUserKeybindings(defaultKeybindings)
])

export const constructOptions: IWorkbenchConstructionOptions = {
  enableWorkspaceTrust: true,
  windowIndicator: {
    label: 'monaco-vscode-api',
    tooltip: '',
    command: ''
  },
  workspaceProvider: {
    trusted: true,
    async open () {
      return false
    },
    workspace: {
      workspaceUri: workspaceFile
    }
  },
  developmentOptions: {
    logLevel: LogLevel.Info // Default value
  },
  configurationDefaults: {
    // eslint-disable-next-line no-template-curly-in-string
    'window.title': 'Monaco-Vscode-Api${separator}${dirty}${activeEditorShort}'
  },
  defaultLayout: {
    editors: [{
      uri: monaco.Uri.file('/workspace/test.js'),
      viewColumn: 1
    }, {
      uri: monaco.Uri.file('/workspace/test.md'),
      viewColumn: 2
    }],
    layout: {
      editors: {
        orientation: 0,
        groups: [{ size: 1 }, { size: 1 }]
      }
    },
    views: [{
      id: 'custom-view'
    }]
  },
  productConfiguration: {
    nameShort: 'monaco-vscode-api',
    nameLong: 'monaco-vscode-api',
    extensionsGallery: {
      serviceUrl: 'https://open-vsx.org/vscode/gallery',
      itemUrl: 'https://open-vsx.org/vscode/item',
      resourceUrlTemplate: 'https://open-vsx.org/vscode/unpkg/{publisher}/{name}/{version}/{path}',
      controlUrl: '',
      nlsBaseUrl: '',
      publisherUrl: ''
    }
  }
}

export const envOptions: EnvironmentOverride = {
  // Otherwise, VSCode detect it as the first open workspace folder
  // which make the search result extension fail as it's not able to know what was detected by VSCode
  userHome: vscode.Uri.file('/')
}

export const commonServices: IEditorOverrideServices = {
  ...getLogServiceOverride(),
  ...getExtensionServiceOverride(workerConfig),
  ...getModelServiceOverride(),
  ...getNotificationServiceOverride(),
  ...getDialogsServiceOverride(),
  ...getConfigurationServiceOverride(),
  ...getKeybindingsServiceOverride(),
  ...getTextmateServiceOverride(),
  ...getThemeServiceOverride(),
  ...getLanguagesServiceOverride(),
  ...getPreferencesServiceOverride(),
  ...getOutlineServiceOverride(),
  ...getTimelineServiceOverride(),
  ...getBannerServiceOverride(),
  ...getStatusBarServiceOverride(),
  ...getTitleBarServiceOverride(),
  ...getSnippetServiceOverride(),
  ...getSearchServiceOverride(),
  ...getMarkersServiceOverride(),
  ...getLanguageDetectionWorkerServiceOverride(),
  ...getStorageServiceOverride({
    fallbackOverride: {
      'workbench.activity.showAccounts': false
    }
  }),
  ...getLifecycleServiceOverride(),
  ...getEnvironmentServiceOverride(),
  ...getWorkspaceTrustOverride(),
  ...getWorkingCopyServiceOverride(),
  ...getScmServiceOverride(),
  ...getChatServiceOverride(),
  ...getUserDataProfileServiceOverride(),
  ...getUserDataSyncServiceOverride(),
  ...getAiServiceOverride(),
  ...getCommentsServiceOverride(),
  ...getEditSessionsServiceOverride(),
  ...getEmmetServiceOverride(),
  ...getMultiDiffEditorServiceOverride(),
  ...getPerformanceServiceOverride(),
  ...getRelauncherServiceOverride(),
  ...getUpdateServiceOverride(),
  ...getExplorerServiceOverride()
}
