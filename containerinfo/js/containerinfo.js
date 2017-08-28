'use strict' /* global SheetMonkeyHost, alert */
SheetMonkeyHost.init(
  {
    commandHandler: myCommandHandler
  }
)

function myCommandHandler (cmdInfo) {
  console.assert(cmdInfo)
  console.log('containerinfodemo commandHandler!', cmdInfo)
  switch (cmdInfo.commandId) {
    case 'containerinfo':
      SheetMonkeyHost.getContainerInfo().then(info => {
        console.log('containerinfodemo, containerinfo:', info)
        alert('Container Info:' + JSON.stringify(info))
      })
      break
  }
}
console.log('containerinfodemo plugin js loaded!')
