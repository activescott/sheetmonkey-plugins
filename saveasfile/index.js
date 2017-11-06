/* global SheetMonkeyHost, Blob, saveAs */
'use strict'

import FileSelector from './components/FileSelector.html'
import Promise from 'bluebird'

SheetMonkeyHost.init(
  {
    commandHandler: myCommandHandler
  }
)

function myCommandHandler (cmdInfo) {
  console.assert(cmdInfo)
  switch (cmdInfo.commandId) {
    case 'saveas':
      return SheetMonkeyHost.getContainerInfo().then(container => {
        console.log('containerinfo:', container)
        let headers = null
        let data = null
        console.assert(container.containerType === 'sheet', 'unexpected container type:', container.containerType)
        const sheetID = container.containerID
        const includeFlags = 'format,discussions,attachments,filters,filterDefinitions,ownerInfo,source'
        return SheetMonkeyHost.apiRequest('GET', `sheets/${sheetID}?include=${includeFlags}&includeAll=true`, headers, data).then(response => {
          // console.log('api response:', response)
          let sheetResponse = response.response
          var blob = new Blob([JSON.stringify(sheetResponse)], {type: 'application/json'})
          saveAs(blob, `${sheetResponse.name}.smartsheet`)
        })
      })
    case 'open':
      const fs = new FileSelector({target: document.querySelector('body')})
      return fs.selectFiles().then(fileResult => {
        fs.destroy()
        // console.log('selectFiles.then:', fileResult)
        const sourceSheet = JSON.parse(fileResult)
        let cleanSheet = cleanUpSheetForCreate(sourceSheet)
        cleanSheet.name = `${cleanSheet.name} (from archive file)`

        let headers = null
        let data = JSON.stringify(cleanSheet)
        return SheetMonkeyHost.apiRequest('POST', `sheets`, headers, data).then(response => {
          console.log('post sheet api response:', response)
          if (response.response.resultCode !== 0) {
            throw new Error('Error creating sheet:' + JSON.stringify(response.response))
          }
          const destSheet = response.response.result
          const sheetID = destSheet.id
          console.log('newly created sheet id:', sheetID)
          return updateRows(sourceSheet.rows, sheetID, sourceSheet.columns, destSheet.columns)        })
      })
  }
}

function updateRows (rowsInput, destSheetID, sourceColumns, destColumns) {
  let rows = JSON.parse(JSON.stringify(rowsInput))
  console.assert(rows.length && rows.length > 0)

  // map source columnID -> dest columnID
  const colMap = mapColumnsByID(sourceColumns, destColumns)
  // progressively keep map source rowID -> dest rowID
  const rowMap = {}

  return Promise.each(rows, r => {
    removeDissalowedRowProperties(r)
    for (let cell of r.cells) {
      cell.columnId = colMap[cell.columnId]
      cell.strict = false // because some cells won't be valid (e.g. not in picklist) and this allows them to be set anyway
      if (!('value' in cell)) {
        cell.value = null // otherwise: Required object attribute(s) are missing from your request: cell.value
      }
      if ('formula' in cell) {
        // If cell.formula is specified, then value, objectValue, image, hyperlink, and linkInFromCell must not be specified.
        const notAllowed = ['value', 'objectValue', 'image', 'hyperlink', 'linkInFromCell']
        notAllowed.forEach(prop => delete cell[prop])
        if (cell.formula === '=') {
          // I have a sheet with a formula like this and it fails with the following: errorCode: 1162, message: "A formula must always start with an equal sign (=)."
          delete cell['formula']
          cell.value = null
        }
      }
    }
    if ('siblingId' in r) {
      r.siblingId = rowMap[r.siblingId]
    } else {
      r.toTop = true
    }
    if ('parentId' in r) {
      r.parentId = rowMap[r.parentId]
      // API doesn't like siblingId + parentId (eventhough it returns rows this way). parentId+toBottom should have the right effect
      delete r['siblingId']
      r.toBottom = true
      delete r['toTop']
    }
    let sourceRowID = r.id
    delete r.id
    let headers = null
    let data = JSON.stringify(r)
    return SheetMonkeyHost.apiRequest('POST', `sheets/${destSheetID}/rows?overrideValidation=true`, headers, data).then(response => {
      response = response.response // TODO: <-- %$!&#*)
      if (response.resultCode !== 0) {
        throw new Error(`Error adding row for row id ${sourceRowID}: ${JSON.stringify(response)}`)
      }
      let destRowID = response.result.id
      console.log(`added row for source rowID ${sourceRowID} -> ${destRowID}`)
      rowMap[sourceRowID] = destRowID
    })
  }).then(() => {
    console.log('all rows added:')
  }).catch(addRowError => {
    console.error('error adding rows:', addRowError)
  })
}

function mapColumnsByID (sourceColumns, destColumns) {
  sourceColumns = Array.from(sourceColumns)
  destColumns = Array.from(destColumns)
  if (sourceColumns.length !== destColumns.length) {
    throw new Error('source and dest columns must have same length')
  }
  let map = {}
  // NOTE: Assuming the order of columns is as reliable as the index
  for (let i = 0; i < sourceColumns.length; i++) {
    console.assert(sourceColumns[i].index === destColumns[i].index, 'expected indexes to be the same!, but were', sourceColumns[i].index, '&', destColumns[i].index)
    map[sourceColumns[i].id] = destColumns[i].id
  }
  return map
}

function removeDissalowedRowProperties (row) {
  const disallowedRowProperties = ['rowNumber', 'createdAt', 'modifiedAt', 'lockedForUser']
  disallowedRowProperties.forEach(prop => delete row[prop])
}

function cleanUpSheetForCreate (sheetObj) {
  const disallowedSheetProperties = ['workspace', 'dependenciesEnabled', 'permalink', 'accessLevel', 'version', 'rows', 'effectiveAttachmentOptions', 'createdAt', 'id', 'totalRowCount', 'modifiedAt', 'cellImageUploadEnabled', 'resourceManagementEnabled', 'ganttEnabled', 'userSettings', 'projectSettings']
  let clone = JSON.parse(JSON.stringify(sheetObj))
  disallowedSheetProperties.forEach(prop => delete clone[prop])
  for (let col of clone.columns) {
    cleanupColumnForCreate(col)
  }
  return clone
}

function cleanupColumnForCreate (col) {
  const disallowedColumnProperties = ['id', 'validation', 'index', 'tags']
  disallowedColumnProperties.forEach(prop => delete col[prop])
  const disallowedTypesMap = {
    'DURATION': 'TEXT_NUMBER',
    'ABSTRACT_DATETIME': 'DATETIME',
    'PREDECESSOR': 'TEXT_NUMBER'
  }
  for (let t in disallowedTypesMap) {
    if (col.type === t) {
      col.type = disallowedTypesMap[t]
    }
  }
  if ('symbol' in col) {
    // to prevent error: "Column options are not allowed when a symbol is specified."
    delete col['options']
  }
}
console.log('saveasfile plugin js loaded!')
