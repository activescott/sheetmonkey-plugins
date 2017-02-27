SheetMonkeyHost.init(
    {
        pluginId: "smartsheetforsalesforce",
        commandHandler: myCommandHandler
    }
);

function myCommandHandler(cmdInfo) {
    console.assert(cmdInfo);
    switch(cmdInfo.commandId) {
        case 'sf_open':
            window.open('https://connectors.smartsheet.com/c/salesforce');
        break;
    }
}
console.log('ssfsf plugin js loaded!');
