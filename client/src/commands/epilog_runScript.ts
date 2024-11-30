import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as fs from 'fs';
import * as epilog_js from '../../../common/out/plain-js/epilog.js';

import {
    EPILOG_SCRIPT_LANGUAGE_ID
} from '../../../common/out/language_ids.js';
import { resolveFullFileContent } from '../../../common/out/resolve_full_file_content.js';

export function epilogCmd_runScript(client: LanguageClient) {
    // Parse the content of the active text editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        if (document.languageId !== EPILOG_SCRIPT_LANGUAGE_ID) {
            vscode.window.showErrorMessage('Must be an Epilog script file. (I.e. have file extension .epilogscript)');
            return;
        }

        const docText = document.getText();
        // Break the document into lines, filtering out empty lines
        const lines = docText.split('\n').filter(line => line.trim() !== '');
        // Only 3-4 lines should remain, in any order:
            // 1. dataset: <filepath> (to single file or folder)
            // 2. ruleset: <filepath> (to single file)
            // 3. query: <query>
            // 4. (optional) doTrace: <boolean>
        if (lines.length !== 3 && lines.length !== 4) {
            vscode.window.showErrorMessage('Should only have three or four lines: one specifying the ruleset filepath, one specifying the dataset filepath, one specifying the query, and optionally one specifying whether to print a trace of the query execution.');
            return;
        }

        let datasetRelFilepath = "";
        let rulesetRelFilepath = "";
        let query = "";
        let doTraceHasBeenExplicitlySpecified = false;
        let doTrace = false;

        // Get the filepaths and query from the lines
        for (const line of lines) {
            if (line.startsWith('dataset:')) {
                if (datasetRelFilepath !== "") {
                    vscode.window.showErrorMessage('Can only specify one dataset filepath');
                    return;
                }
                datasetRelFilepath = line.replace('dataset:', '').trim();
            } else if (line.startsWith('ruleset:')) {
                if (rulesetRelFilepath !== "") {
                    vscode.window.showErrorMessage('Can only specify one ruleset filepath');
                    return;
                }
                rulesetRelFilepath = line.replace('ruleset:', '').trim();
            } else if (line.startsWith('query:')) {
                if (query !== "") {
                    vscode.window.showErrorMessage('Can only specify one query');
                    return;
                }
                query = line.replace('query:', '').trim();
            } else if (line.startsWith('dotrace:')) {
                if (doTraceHasBeenExplicitlySpecified) {
                    vscode.window.showErrorMessage('Can only specify trace option once');
                    return;
                }
                let doTraceString = line.replace('dotrace:', '').trim().toLowerCase();  
                if (doTraceString !== 'true' && doTraceString !== 'false') {
                    vscode.window.showErrorMessage('dotrace must be either true or false');
                    return;
                }
                doTrace = doTraceString === 'true';
                doTraceHasBeenExplicitlySpecified = true;
            }
        }

        // Verify that the required values aren't empty
        if (datasetRelFilepath === "") {
            vscode.window.showErrorMessage('No dataset filepath specified');
            return;
        }
        if (rulesetRelFilepath === "") {
            vscode.window.showErrorMessage('No ruleset filepath specified');
            return;
        }
        if (query === "") {
            vscode.window.showErrorMessage('No query specified');
            return;
        }

        // Make the filepaths absolute
        const documentDir = document.uri.fsPath.substring(0, document.uri.fsPath.lastIndexOf('\\'));
        let datasetAbsFilepath = documentDir + '\\' + datasetRelFilepath;
        let rulesetAbsFilepath = documentDir + '\\' + rulesetRelFilepath;

        // Verify that the dataset file or folder exists
        if (!fs.existsSync(datasetAbsFilepath)) {
            vscode.window.showErrorMessage('Dataset file or folder does not exist: ' + datasetAbsFilepath);
            return;
        }

        // Verify that the ruleset file exists
        if (!fs.existsSync(rulesetAbsFilepath)) {
            vscode.window.showErrorMessage('Ruleset file does not exist: ' + rulesetAbsFilepath);
            return;
        }

        // Verify that the query is a valid epilog query
        if (epilog_js.read(query) === "error") {
            vscode.window.showErrorMessage('Query is not a valid epilog query: ' + query);
            return;
        }
        
        // Get the content of the ruleset
        const rulesetFileContent = resolveFullFileContent(rulesetAbsFilepath);
        // console.log("Full file content: \n" + rulesetFileContent);
        
        const ruleset = epilog_js.definemorerules([], epilog_js.readdata(rulesetFileContent));
        
        let queryFunction = doTrace ? epilog_js.debugfinds : epilog_js.compfinds;

        let datasetAbsFilepaths = [];

        // If the dataset path is not a folder, we will run the query on the content of the dataset file
        if (!fs.lstatSync(datasetAbsFilepath).isDirectory()) {
            datasetAbsFilepaths.push(datasetAbsFilepath);
        } 
        // Otherwise, we will run it on each of the .hdf files in the folder
        else {
            const datasetFilePaths = fs.readdirSync(datasetAbsFilepath).filter(file => file.endsWith('.hdf'));
            // Make the filepaths absolute
            datasetAbsFilepaths = [...datasetAbsFilepaths, ...datasetFilePaths.map(file => datasetAbsFilepath + '\\' + file) ];
            client.outputChannel.appendLine("------------\nQuery \'" + query + "\' results for folder \'" + datasetRelFilepath +"\':");
            if (datasetFilePaths.length === 0) {
                client.outputChannel.appendLine("Folder contains no .hdf files.");
                return;
            }
        }
        
        // Run the query on the ruleset and each dataset
        for (const datasetAbsFilepath of datasetAbsFilepaths) {
            // Get the content of the dataset
            const datasetFileContent = resolveFullFileContent(datasetAbsFilepath);
            let dataset = epilog_js.definemorefacts([], epilog_js.readdata(datasetFileContent));

            let currDatasetRelFilepath = datasetAbsFilepath.substring(datasetAbsFilepath.lastIndexOf('\\') + 1);

            if (doTrace) {
                client.outputChannel.appendLine("------\nTrace for file \'" + currDatasetRelFilepath + "\':");
            }
            const queryResults = queryFunction(epilog_js.read(query), epilog_js.read(query), dataset, ruleset);
            
            // Print the query result to the output channel
            if (queryResults.length === 0) {
                client.outputChannel.appendLine("------\nQuery \'" + query + "\' results for file \'" + currDatasetRelFilepath + "\': None.");
            } else {
                client.outputChannel.appendLine("------\nQuery \'" + query + "\' results for file \'" + currDatasetRelFilepath + "\':");
                // Remove final newline
                client.outputChannel.appendLine(epilog_js.grindem(queryResults).slice(0, -1));
            }
        }
    }
}