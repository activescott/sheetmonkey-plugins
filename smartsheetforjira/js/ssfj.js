'use strict' /* global SheetMonkeyHost */
SheetMonkeyHost.init(
  {
    commandHandler: myCommandHandler
  }
)

function myCommandHandler (cmdInfo) {
  console.assert(cmdInfo)
  console.log('ssfj commandHandler!', cmdInfo)
  switch (cmdInfo.commandId) {
    case 'launchwindow':
      window.open('https://connectors.smartsheet.com/c/jira')
      break
  }
}
console.log('ssfj plugin js loaded!')
