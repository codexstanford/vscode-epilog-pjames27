"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.epilogCmd_gather = void 0;
const vscode = require("vscode");
const fs = require("fs");
const resolve_full_file_content_js_1 = require("../../../common/out/resolve_full_file_content.js");
const path = require("path");
async function epilogCmd_gather(client) {
    // Ask the user for a filename
    const filename = await vscode.window.showInputBox({
        prompt: 'Enter the filename where the gathered file contents will be saved.',
    });
    if (filename.length === 0) {
        vscode.window.showErrorMessage('No filename specified.');
        return;
    }
    // Get the uri of the active document
    let documentAbsFilepath = vscode.window.activeTextEditor.document.uri.fsPath;
    // Resolve the full file content of the active document
    let fullFileContent = (0, resolve_full_file_content_js_1.resolveFullFileContent)(documentAbsFilepath);
    // Get the directory of the active document
    let documentDir = path.dirname(documentAbsFilepath);
    // Save the full file content to the filename specified by the user
    fs.writeFileSync(documentDir + '/' + filename, fullFileContent);
}
exports.epilogCmd_gather = epilogCmd_gather;
//# sourceMappingURL=epilog_gather.js.map