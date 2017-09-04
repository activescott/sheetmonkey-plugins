'use strict'
/* global SheetMonkeyHost, alert */
SheetMonkeyHost.init(
  {
    commandHandler: myCommandHandler
  }
)

function myCommandHandler (cmdInfo) {
  console.assert(cmdInfo)
  console.log('selectioninfo commandHandler!', cmdInfo)
  switch (cmdInfo.commandId) {
    case 'launchauthflow':
      SheetMonkeyHost.launchAuthFlow().then(authInfo => {
        console.log('authInfo:', authInfo)
        alert('authInfo:' + JSON.stringify(authInfo))
      })
      break
  }
}
console.log('launchauthflow plugin js loaded!')
