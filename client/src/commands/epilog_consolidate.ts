import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as fs from 'fs';

import { resolveFullFileContent } from '../../../common/out/resolve_full_file_content.js';
import path = require('path');

function generateUnusedFilename(extension: string, currentDirectory: string, prefix?: string) {
    let filename = (prefix ?? 'newfile') + extension;
    if (!fs.existsSync(currentDirectory + '/' + filename)) {
        return filename;
    }
    
    // If the filename already exists, add a number to the end of the filename until it doesn't exist
    let i = 1;
    while (fs.existsSync(currentDirectory + '/' + filename)) {
        filename = prefix + i + extension;
        i++;
    }
    return filename;
}

export async function epilogCmd_consolidate(client: LanguageClient) {   

    // Get the uri of the active document
    let documentAbsFilepath = vscode.window.activeTextEditor!.document.uri.fsPath;
    // Get the directory of the active document
    let documentDir = path.dirname(documentAbsFilepath);


    // Suggest a filename of the form 'consolidated{num}.{extension}', where extension is the extension of the active document
    let suggestedFilename = generateUnusedFilename(path.extname(documentAbsFilepath), documentDir, 'consolidated');
    
    // Ask the user for a filename
    const filename = await vscode.window.showInputBox({
        prompt: 'Enter the filename where the consolidated file contents will be saved.',
        value: suggestedFilename
    });

    if (filename === undefined) {
        return;
    }

    if (filename.length === 0) {
        vscode.window.showErrorMessage('No filename specified.');
        return;
    }

    let newDocumentFilepath = documentDir + '/' + filename;

    // If file exists, ask user if they want to overwrite it
    if (fs.existsSync(newDocumentFilepath)) {
        const choice = await vscode.window.showWarningMessage(
            `File "${newDocumentFilepath}" already exists. Do you want to overwrite it?`,
            'Yes',
            'No'
        );

        if (choice !== 'Yes') {
            return; // User chose not to overwrite
        }
    }

    
    // Resolve the full file content of the active document
    let fullFileContent = resolveFullFileContent(documentAbsFilepath);

    // Save the full file content to the filename specified by the user
    fs.writeFileSync(documentDir + '/' + filename, fullFileContent);

}