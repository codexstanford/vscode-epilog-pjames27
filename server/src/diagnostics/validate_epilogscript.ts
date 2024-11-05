import { Diagnostic, DiagnosticSeverity, TextDocument } from "vscode-languageserver";
import * as path from 'path';
import * as fs from 'fs';
import { URI } from "vscode-uri";
import { LANGUAGE_ID_TO_FILE_EXTENSION, EPILOG_DATASET_LANGUAGE_ID, EPILOG_RULESET_LANGUAGE_ID } from "../../../common/out/language_ids.js";
import * as epilog_js from '../../../common/out/plain-js/epilog.js';

// Parses the .epilogscript file and returns a list of diagnostics
// Generates the following diagnostics:
// - Errors if there are not three lines
// - Errors if there is no line specifying the dataset filepath
// - Errors if there is no line specifying the ruleset filepath
// - Errors if there is no line specifying the query
// - Errors if there are multiple lines specifying any of the above
// - Errors if the dataset filepath does not point to an existing file or folder
// - Errors if the ruleset filepath does not point to an existing file
// - Warnings if the dataset filepath points to a file and does not have the correct extension
// - Warnings if the ruleset filepath does not have the correct extension
// - Errors if the query is not a valid Epilog query
export function validateDocWithFiletype_EpilogScript(
    textDocument: TextDocument,
    docText: string,
): Diagnostic[] {
    let diagnostics: Diagnostic[] = [];

    // Break the document into lines, filtering out empty lines
    const allLines = docText.split('\n');
    // Only three lines should remain
    if (allLines.filter(line => line.trim() !== '').length !== 3) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(0),
                end: textDocument.positionAt(docText.length - 1)
            },
            message: 'Should have precisely three lines: one specifying the ruleset filepath, one specifying the dataset filepath, and one specifying the query.',
            source: 'epilog'
        });
        return diagnostics;
    }

    // Gather all the indices of lines specifying each of a ruleset filepath, dataset filepath, and query
    let datasetLineIndices: number[] = [];
    let rulesetLineIndices: number[] = [];
    let queryLineIndices: number[] = [];
    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];
        if (line.startsWith('dataset:')) {
            datasetLineIndices.push(i);
            continue;
        }
        if (line.startsWith('ruleset:')) {
            rulesetLineIndices.push(i);
            continue;
        }
        if (line.startsWith('query:')) {
            queryLineIndices.push(i);
            continue;
        }
        // Error if there is a line that begins with none of these prefixes 
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: {line: i, character: 0},
                end: {line: i, character: Number.MAX_VALUE}
            },
            message: 'Line must start with \'dataset:\', \'ruleset:\', or \'query:\'',
            source: 'epilog'
        });
    }

    // Check that there is only one line specifying each of a ruleset filepath, dataset filepath, and query
    if (datasetLineIndices.length > 1) {
        for (const index of datasetLineIndices) {   
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: index, character: 0},
                    end: {line: index, character: Number.MAX_VALUE}
                },
                message: 'Should only specify one dataset filepath',
                source: 'epilog'
            });
        }
    }
    if (rulesetLineIndices.length > 1) {
        for (const index of rulesetLineIndices) {   
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: index, character: 0},
                    end: {line: index, character: Number.MAX_VALUE}
                },
                message: 'Should only specify one ruleset filepath',
                source: 'epilog'
            });
        }
    }
    if (queryLineIndices.length > 1) {
        for (const index of queryLineIndices) {   
            diagnostics.push({  
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: index, character: 0},
                    end: {line: index, character: Number.MAX_VALUE}
                },
                message: 'Should only specify one query',
                source: 'epilog'
            });
        }
    }

    // Get the absolute paths to the files
    const documentDir = path.dirname(URI.parse(textDocument.uri).fsPath);

    const datasetExt = LANGUAGE_ID_TO_FILE_EXTENSION.get(EPILOG_DATASET_LANGUAGE_ID) ?? '';
    // If the dataset extension is not defined, then log an error and return
    if (datasetExt === '') {
        console.error('Missing dataset file extension - not defined in language_ids.ts');
        return diagnostics;
    }
    // Check that the dataset filepath points to a file or folder that exists, and if it is a file, that it has the correct extension
    for (const datasetLineIndex of datasetLineIndices) {
        const datasetAbsPath = path.join(documentDir, allLines[datasetLineIndex].split(':')[1].trim());
        if (!fs.existsSync(datasetAbsPath)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: datasetLineIndex, character: 'dataset:'.length}, 
                    end: {line: datasetLineIndex, character: Number.MAX_VALUE}
                },
                message: 'Dataset file or folder doesn\'t exist: ' + datasetAbsPath,
                source: 'epilog'
            });
        }
        // Get the file extension of the dataset file
        const datasetAbsPathExt = path.extname(datasetAbsPath);
        // If it isn't obviously a folder, then check that it has the correct extension
        if (!datasetAbsPath.endsWith("\\")) {
            if (datasetAbsPathExt === "") {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: {line: datasetLineIndex, character: 'dataset:'.length}, 
                        end: {line: datasetLineIndex, character: Number.MAX_VALUE}
                    },
                    message: 'Dataset files should have the ' + datasetExt + ' extensions, folders should end with a backslash: ' + datasetAbsPath,
                    source: 'epilog'
                });
            }
            else if (datasetAbsPathExt !== datasetExt) {    
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: {line: datasetLineIndex, character: 'dataset:'.length}, 
                        end: {line: datasetLineIndex, character: Number.MAX_VALUE}
                    },
                    message: 'Dataset files should have the ' + datasetExt + ' extensions: ' + datasetAbsPath,
                    source: 'epilog'
                });
            }
        }
    }


    const rulesetExt = LANGUAGE_ID_TO_FILE_EXTENSION.get(EPILOG_RULESET_LANGUAGE_ID) ?? '';
    // If the ruleset extension is not defined, then log an error and return
    if (rulesetExt === '') {
        console.error('Missing ruleset file extension - not defined in language_ids.ts');
        return diagnostics;
    }
    // Check that the ruleset filepath has the right extension and that it points to a file that exists
    for (const rulesetLineIndex of rulesetLineIndices) {
        const rulesetAbsPath = path.join(documentDir, allLines[rulesetLineIndex].split(':')[1].trim());
        if (!rulesetAbsPath.endsWith(rulesetExt)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: {line: rulesetLineIndex, character: 'ruleset:'.length}, 
                    end: {line: rulesetLineIndex, character: Number.MAX_VALUE}
                },
                message: 'Ruleset files should have the ' + rulesetExt + ' extension: ' + rulesetAbsPath,
                source: 'epilog'
            });
        }
        if (!fs.existsSync(rulesetAbsPath)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error, 
                range: {
                    start: {line: rulesetLineIndex, character: 'ruleset:'.length}, 
                    end: {line: rulesetLineIndex, character: Number.MAX_VALUE}
                },
                message: 'Ruleset file doesn\'t exist: ' + rulesetAbsPath, 
                source: 'epilog'
            });
        }
    }

    // Check that the query is valid
    for (const queryLineIndex of queryLineIndices) {
        const queryText = allLines[queryLineIndex].split(':')[1].trim();

        if (queryText === '') {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: queryLineIndex, character: 0},    
                    end: {line: queryLineIndex, character: Number.MAX_VALUE}
                },
                message: 'Missing query',
                source: 'epilog'
            });
        }
        // Use epilog-js.read to check that the query is well-formed
        const query = epilog_js.read(queryText);
        if (query === 'error') {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: queryLineIndex, character: 'query:'.length},
                    end: {line: queryLineIndex, character: Number.MAX_VALUE}
                },
                message: 'Not a valid Epilog query',
                source: 'epilog'
            });
        }
    }
    
    
    

    return diagnostics;
}

