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
    case 'selectioninfo':
      SheetMonkeyHost.getSelectionInfo().then(info => {
        console.log('selectioninfo, selectioninfo:', info)
        alert('Selection Info:' + JSON.stringify({rowID: info.rowID, columnName: info.columnName}))
      })
      break
  }
}
console.log('selectioninfo plugin js loaded!')
