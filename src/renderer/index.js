// index.js

import App from "./App.svelte"

window.process.argv.forEach(arg => {
  if (arg.startsWith('DATA_ROOT=')) {
    global.DATA_ROOT = arg.split('=')[1]
  }
})

if (global.DATA_ROOT === 'undefined')  {
  global.DATA_ROOT = '.'
} 

let app = new App({
  target: document.body,
})

export default app
