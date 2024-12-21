import { Diagnostic, DiagnosticSeverity, TextDocument } from "vscode-languageserver";
import * as path from 'path';
import * as fs from 'fs';
import { URI } from "vscode-uri";
import { LANGUAGE_ID_TO_FILE_EXTENSION, EPILOG_DATASET_LANGUAGE_ID, EPILOG_RULESET_LANGUAGE_ID, EPILOG_METADATA_LANGUAGE_ID } from "../../../common/out/language_ids.js";


// Parses the .epilogbuild file and returns a list of diagnostics
// Can have lines like:
// <filename>
// <filename> ==> <newfilename>
// prefix: <string>
// overwrite: <boolean>
// Generates the following diagnostics:
// - Errors if there is more than one prefix line
// - Errors if there is more than one overwrite line
// - Warning if there is no file to build specified
// - Errors if the prefix is empty
// - Errors if the overwrite value is not a boolean
// - Errors if a file to build line is not in the correct format
// - Errors if the filename of the file to build does not exist
// - Errors if the filename of the file to build does not have a valid extension
// - Errors if no new filename is specified after '==>'
// - Warnings if the new filename does not have a valid extension
// - Warnings if the new filename does not have the same extension as the old filename
// - Warnings if the new filename already exists
export function validateDocWithFiletype_EpilogBuild(
    textDocument: TextDocument,
    docText: string,
): Diagnostic[] {
    let diagnostics: Diagnostic[] = [];

    // Break the document into lines
    const allLines = docText.split('\n');

    // Get indices for lines specifying a filename and a new filename
    let filesToBuildLineIndices: number[] = [];
    let prefixLineIndices: number[] = [];
    let overwriteLineIndices: number[] = [];
    for (let i = 0; i < allLines.length; i++) {
        // Ignore empty lines
        if (allLines[i].trim() === '') {
            continue;
        }
        if (allLines[i].startsWith('prefix:')) {
            prefixLineIndices.push(i);
            continue;
        }
        if (allLines[i].startsWith('overwrite:')) {
            overwriteLineIndices.push(i);
            continue;
        }
        // Otherwise, interpret it as a filename
        filesToBuildLineIndices.push(i);
    }

    // There can be at most one prefix line
    if (prefixLineIndices.length > 1) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(0),
                end: textDocument.positionAt(docText.length - 1)
            },
            message: 'Cannot specify more than one "prefix:" line',
            source: 'epilog'
        });
    }
    // There can be at most one overwrite line
    if (overwriteLineIndices.length > 1) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(0),
                end: textDocument.positionAt(docText.length - 1)
            },
            message: 'Cannot specify more than one "overwrite:" line',
            source: 'epilog'
        });
    }

    // There should be at least one file to build
    if (filesToBuildLineIndices.length === 0) {
        diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
                start: textDocument.positionAt(0),
                end: textDocument.positionAt(docText.length - 1)
            },
            message: 'No files specified',
            source: 'epilog'
        });
    }

    // Check that the prefix isn't empty
    if (prefixLineIndices.length === 1) {
        const prefixValue = allLines[prefixLineIndices[0]].split(':')[1].trim();
        if (prefixValue === '') {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: prefixLineIndices[0], character: 0},
                    end: {line: prefixLineIndices[0], character: Number.MAX_VALUE}
                },
                message: 'No prefix specified',
                source: 'epilog'
            });
        }
    }

    // Check that overwrite is a boolean
    for (const overwriteLineIndex of overwriteLineIndices) {
        const overwriteValue = allLines[overwriteLineIndex].split(':')[1].trim().toLowerCase();
        if (overwriteValue !== 'true' && overwriteValue !== 'false') {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: overwriteLineIndex, character: allLines[overwriteLineIndex].indexOf(overwriteValue)},
                    end: {line: overwriteLineIndex, character: Number.MAX_VALUE}
                },
                message: 'overwrite must be either true or false',
                source: 'epilog'
            });
        }
    }

    // Get the absolute paths to the files
    const documentDir = path.dirname(URI.parse(textDocument.uri).fsPath);

    // Check that all files to build exist and have valid extensions
    let validExtensions = new Set([LANGUAGE_ID_TO_FILE_EXTENSION.get(EPILOG_DATASET_LANGUAGE_ID) ?? '', 
        LANGUAGE_ID_TO_FILE_EXTENSION.get(EPILOG_RULESET_LANGUAGE_ID) ?? '', 
        LANGUAGE_ID_TO_FILE_EXTENSION.get(EPILOG_METADATA_LANGUAGE_ID) ?? '']);

    for (const fileToBuildLineIndex of filesToBuildLineIndices) {
        const filenames = allLines[fileToBuildLineIndex].trim().split('==>');

        // Line is not in the correct format
        if (filenames.length > 2) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: fileToBuildLineIndex, character: 0},
                    end: {line: fileToBuildLineIndex, character: Number.MAX_VALUE}
                },
                message: 'Line should be of the form <filename> or <filename> ==> <newfilename>',
                source: 'epilog'
            });
            continue;
        }
        // Line is in the correct format
        let filenameToBuild = filenames[0].trim();
        let fileToBuildAbsPath = path.join(documentDir, filenameToBuild);

        let filenameToBuildStartIndex = allLines[fileToBuildLineIndex].indexOf(filenameToBuild);
        let filenameToBuildEndIndex = filenameToBuildStartIndex + filenameToBuild.length;
        // Check that the file to build exists
        if (!fs.existsSync(fileToBuildAbsPath)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: fileToBuildLineIndex, character: filenameToBuildStartIndex},
                    end: {line: fileToBuildLineIndex, character: filenameToBuildEndIndex}
                },
                message: 'File to build does not exist: ' + fileToBuildAbsPath,
                source: 'epilog'
            });
        }
        // Check that the file to build has a valid extension
        const fileToBuildAbsPathExt = path.extname(fileToBuildAbsPath);
        if (!validExtensions.has(fileToBuildAbsPathExt)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: fileToBuildLineIndex, character: filenameToBuildStartIndex},
                    end: {line: fileToBuildLineIndex, character: filenameToBuildEndIndex}
                },
                message: 'Can only build files with extensions ' + Array.from(validExtensions).join(', '),
                source: 'epilog'
            });
        }

        // Verify the name of the file to be created
        if (filenames.length === 2) {
            let newFilename = filenames[1].trim();
            let newFilenameAbsPath = path.join(documentDir, newFilename);

            let newFilenameStartIndex = allLines[fileToBuildLineIndex].indexOf(newFilename, filenameToBuildEndIndex);
            let newFilenameEndIndex = newFilenameStartIndex + newFilename.length;

            // Check that the new filename isn't empty
            if (newFilename === '') {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: {line: fileToBuildLineIndex, character: 0},
                        end: {line: fileToBuildLineIndex, character: Number.MAX_VALUE}
                    },
                    message: 'No new filename specified',
                    source: 'epilog'
                });
                continue;
            }

            // Check that the new filename has a valid extension
            const newFilenameAbsPathExt = path.extname(newFilenameAbsPath);
            if (!validExtensions.has(newFilenameAbsPathExt)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: {line: fileToBuildLineIndex, character: newFilenameStartIndex},
                        end: {line: fileToBuildLineIndex, character: newFilenameEndIndex}
                    },
                    message: 'Should only create new files with extensions ' + Array.from(validExtensions).join(', '),
                    source: 'epilog'
                });
            }
            // Check that the new filename has the same extension as the old filename
            if (path.extname(newFilenameAbsPath) !== fileToBuildAbsPathExt) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: {line: fileToBuildLineIndex, character: newFilenameStartIndex},
                        end: {line: fileToBuildLineIndex, character: newFilenameEndIndex}
                    },
                    message: 'New filename should have extension ' + fileToBuildAbsPathExt + ' the same extension as the file to build',
                    source: 'epilog'
                });
            }
            // Check that the new filename doesn't already exist
            if (fs.existsSync(newFilenameAbsPath)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: {line: fileToBuildLineIndex, character: newFilenameStartIndex},
                        end: {line: fileToBuildLineIndex, character: newFilenameEndIndex}
                    },
                    message: 'New filename already exists and will be overwritten: ' + newFilenameAbsPath,
                    source: 'epilog'
                });
            }   
        }
    }

    return diagnostics;
}