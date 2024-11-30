import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as fs from 'fs';

import { resolveFullFileContent } from '../../../common/out/resolve_full_file_content.js';
import path = require('path');

export async function epilogCmd_compile(client: LanguageClient) {   

    // Get the uri of the active document
    let documentAbsFilepath = vscode.window.activeTextEditor!.document.uri.fsPath;

    // Ask the user for a filename
    const filename = await vscode.window.showInputBox({
        prompt: 'Enter the filename where the compiled file contents will be saved.',
        value: 'compiled' + path.extname(documentAbsFilepath)
    });

    if (filename === undefined) {
        return;
    }

    if (filename.length === 0) {
        vscode.window.showErrorMessage('No filename specified.');
        return;
    }

    
    // Resolve the full file content of the active document
    let fullFileContent = resolveFullFileContent(documentAbsFilepath);


    // Get the directory of the active document
    let documentDir = path.dirname(documentAbsFilepath);

    // Save the full file content to the filename specified by the user
    fs.writeFileSync(documentDir + '/' + filename, fullFileContent);

}