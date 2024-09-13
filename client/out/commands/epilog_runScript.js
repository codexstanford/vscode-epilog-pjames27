"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.epilogCmd_runScript = void 0;
const vscode = require("vscode");
const fs = require("fs");
const epilog_js = require("../../../common/out/plain-js/epilog.js");
const frontmatter_js_1 = require("../../../common/out/frontmatter.js");
const language_ids_js_1 = require("../../../common/out/language_ids.js");
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
        // Only three lines should remain
        if (lines.length !== 3) {
            vscode.window.showErrorMessage('Should only have three lines: one specifying the ruleset file, one specifying the dataset file, and one specifying the query.');
            return;
        }
        let datasetFilepath = "";
        let rulesetFilepath = "";
        let query = "";
        // Get the filepaths and query from the lines
        for (const line of lines) {
            if (line.startsWith('dataset:')) {
                if (datasetFilepath !== "") {
                    vscode.window.showErrorMessage('Can only specify one dataset filepath');
                    return;
                }
                datasetFilepath = line.replace('dataset:', '').trim();
            }
            else if (line.startsWith('ruleset:')) {
                if (rulesetFilepath !== "") {
                    vscode.window.showErrorMessage('Can only specify one ruleset filepath');
                    return;
                }
                rulesetFilepath = line.replace('ruleset:', '').trim();
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
        if (datasetFilepath === "") {
            vscode.window.showErrorMessage('No dataset filepath specified');
            return;
        }
        if (rulesetFilepath === "") {
            vscode.window.showErrorMessage('No ruleset filepath specified');
            return;
        }
        if (query === "") {
            vscode.window.showErrorMessage('No query specified');
            return;
        }
        // Make the filepaths absolute
        const documentDir = document.uri.fsPath.substring(0, document.uri.fsPath.lastIndexOf('\\'));
        datasetFilepath = documentDir + '\\' + datasetFilepath;
        rulesetFilepath = documentDir + '\\' + rulesetFilepath;
        // Verify that the files exist
        if (!fs.existsSync(datasetFilepath)) {
            vscode.window.showErrorMessage('Dataset file does not exist: ' + datasetFilepath);
            return;
        }
        if (!fs.existsSync(rulesetFilepath)) {
            vscode.window.showErrorMessage('Ruleset file does not exist: ' + rulesetFilepath);
            return;
        }
        // Verify that the query is a valid epilog query
        if (epilog_js.readdata(query).length === 0) {
            vscode.window.showErrorMessage('Query is not a valid epilog query: ' + query);
            return;
        }
        // Get the dataset file text
        const datasetFileText = fs.readFileSync(datasetFilepath, 'utf8');
        //output its frontmatter
        const frontmatter = (0, frontmatter_js_1.getFrontmatter)(datasetFileText);
        // Get the ruleset file text
        //const rulesetFileText = fs.readFileSync(rulesetFilepath, 'utf8');
        return;
        // For testing
        client.outputChannel.appendLine(datasetFilepath);
        client.outputChannel.appendLine(rulesetFilepath);
        client.outputChannel.appendLine(query);
    }
}
exports.epilogCmd_runScript = epilogCmd_runScript;
//# sourceMappingURL=epilog_runScript.js.map