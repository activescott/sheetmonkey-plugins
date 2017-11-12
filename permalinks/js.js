/* global SheetMonkeyHost */
'use strict'

SheetMonkeyHost.init(
  {
    commandHandler: myCommandHandler
  }
)

function myCommandHandler (cmdInfo) {
  console.assert(cmdInfo)
  switch (cmdInfo.commandId) {
    case 'permalink_sheet':
      SheetMonkeyHost.getContainerInfo().then(container => {
        console.log('containerinfo:', container)
        let headers = null
        let data = null
        console.assert(container.containerType === 'sheet', 'unexpected container type:', container.containerType)
        const sheetID = container.containerID
        SheetMonkeyHost.apiRequest('GET', `sheets/${sheetID}?pageSize=1`, headers, data).then(response => {
          let sheetResponse = response.response
          console.log('api response:', sheetResponse)
          // TODO: Consider this https://stackoverflow.com/a/30810322
          window.prompt('Copy to clipboard: Ctrl+C, Enter', sheetResponse.permalink)
        })
      })
      break
  }
}
console.log('permalinks plugin js loaded!')
