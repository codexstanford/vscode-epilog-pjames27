"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.epilogCmd_runScript = void 0;
const vscode = require("vscode");
const fs = require("fs");
const epilog_js = require("../../../common/out/plain-js/epilog.js");
const language_ids_js_1 = require("../../../common/out/language_ids.js");
const resolve_full_file_content_js_1 = require("../../../common/out/resolve_full_file_content.js");
function epilogCmd_runScript(client) {
    // Parse the content of the active text editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        if (document.languageId !== language_ids_js_1.EPILOG_SCRIPT_LANGUAGE_ID) {
            vscode.window.showErrorMessage('Must be an Epilog script file. (I.e. have file extension .epilogscript)');
            return;
        }
        const docText = document.getText();
        // Break the document into lines, filtering out empty lines
        const lines = docText.split('\n').filter(line => line.trim() !== '');
        // Only three lines should remain, in any order:
        // 1. dataset: <filepath> (to single file or folder)
        // 2. ruleset: <filepath> (to single file)
        // 3. query: <query>
        if (lines.length !== 3) {
            vscode.window.showErrorMessage('Should only have three lines: one specifying the ruleset filepath, one specifying the dataset filepath, and one specifying the query.');
            return;
        }
        let datasetRelFilepath = "";
        let rulesetRelFilepath = "";
        let query = "";
        // Get the filepaths and query from the lines
        for (const line of lines) {
            if (line.startsWith('dataset:')) {
                if (datasetRelFilepath !== "") {
                    vscode.window.showErrorMessage('Can only specify one dataset filepath');
                    return;
                }
                datasetRelFilepath = line.replace('dataset:', '').trim();
            }
            else if (line.startsWith('ruleset:')) {
                if (rulesetRelFilepath !== "") {
                    vscode.window.showErrorMessage('Can only specify one ruleset filepath');
                    return;
                }
                rulesetRelFilepath = line.replace('ruleset:', '').trim();
            }
            else if (line.startsWith('query:')) {
                if (query !== "") {
                    vscode.window.showErrorMessage('Can only specify one query');
                    return;
                }
                query = line.replace('query:', '').trim();
            }
        }
        // Verify that the values aren't empty
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
        const rulesetFileContent = (0, resolve_full_file_content_js_1.resolveFullFileContent)(rulesetAbsFilepath);
        // console.log("Full file content: \n" + rulesetFileContent);
        const ruleset = epilog_js.definemorerules([], epilog_js.readdata(rulesetFileContent));
        // Run the query on the dataset and the ruleset
        // If the dataset path is not a folder, run the query on the content of the dataset file
        if (!fs.lstatSync(datasetAbsFilepath).isDirectory()) {
            // Get the content of the dataset
            const datasetFileContent = (0, resolve_full_file_content_js_1.resolveFullFileContent)(datasetAbsFilepath);
            //console.log("Full file content: \n" + datasetFileContent);
            let dataset = epilog_js.definemorefacts([], epilog_js.readdata(datasetFileContent));
            const queryResult = epilog_js.compfinds(epilog_js.read(query), epilog_js.read(query), dataset, ruleset);
            // Print the query result to the output channel
            client.outputChannel.appendLine("------\nQuery results for file \'" + datasetRelFilepath + "\': \n" + epilog_js.grindem(queryResult));
            return;
        }
        // Otherwise, run the query on each of the .hdf files in the folder 
        client.outputChannel.appendLine("------\nQuery results for folder \'" + datasetRelFilepath + "\':");
        // Get each of the .hdf files in the folder
        const datasetFileList = fs.readdirSync(datasetAbsFilepath).filter(file => file.endsWith('.hdf'));
        if (datasetFileList.length === 0) {
            client.outputChannel.appendLine("Folder contains no .hdf files.");
            return;
        }
        for (const datasetFilePath of datasetFileList) {
            // Get the content of the dataset
            const datasetFileContent = (0, resolve_full_file_content_js_1.resolveFullFileContent)(datasetAbsFilepath + '\\' + datasetFilePath);
            let dataset = epilog_js.definemorefacts([], epilog_js.readdata(datasetFileContent));
            const queryResult = epilog_js.compfinds(epilog_js.read(query), epilog_js.read(query), dataset, ruleset);
            // Print the query result to the output channel
            client.outputChannel.appendLine("---\nResults for file \'" + datasetFilePath + "\': \n" + epilog_js.grindem(queryResult));
        }
    }
}
exports.epilogCmd_runScript = epilogCmd_runScript;
//# sourceMappingURL=epilog_runScript.js.map