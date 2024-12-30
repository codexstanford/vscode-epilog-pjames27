"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDocWithFiletype_EpilogBuild = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const path = require("path");
const fs = require("fs");
const vscode_uri_1 = require("vscode-uri");
const language_ids_js_1 = require("../../../common/out/language_ids.js");
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
// - Errors if the same file to build is specified multiple times
// - Errors if no new filename is specified after '==>'
// - Warnings if the new filename does not have a valid extension
// - Warnings if the new filename does not have the same extension as the old filename
// - Warnings if the new filename already exists
// - Errors if the same new filename is specified multiple times
function validateDocWithFiletype_EpilogBuild(textDocument, docText) {
    let diagnostics = [];
    let prefixValue = '';
    let prefixValueIncorrectlySpecified = false;
    // Break the document into lines
    const allLines = docText.split('\n');
    // Get indices for lines specifying a filename and a new filename
    let filesToBuildLineIndices = [];
    let prefixLineIndices = [];
    let overwriteLineIndices = [];
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
        prefixValueIncorrectlySpecified = true;
        diagnostics.push({
            severity: vscode_languageserver_1.DiagnosticSeverity.Error,
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
            severity: vscode_languageserver_1.DiagnosticSeverity.Error,
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
            severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
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
        prefixValue = allLines[prefixLineIndices[0]].split(':')[1].trim();
        if (prefixValue === '') {
            prefixValueIncorrectlySpecified = true;
            diagnostics.push({
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: prefixLineIndices[0], character: 0 },
                    end: { line: prefixLineIndices[0], character: Number.MAX_VALUE }
                },
                message: 'No prefix specified',
                source: 'epilog'
            });
        }
    }
    // Check that overwrite is a boolean
    let overwriteValue = false;
    let overwriteValueExplicitlySpecified = false;
    for (const overwriteLineIndex of overwriteLineIndices) {
        const overwriteValueString = allLines[overwriteLineIndex].split(':')[1].trim().toLowerCase();
        if (overwriteValueString !== 'true' && overwriteValueString !== 'false') {
            diagnostics.push({
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: overwriteLineIndex, character: allLines[overwriteLineIndex].indexOf(overwriteValueString) },
                    end: { line: overwriteLineIndex, character: Number.MAX_VALUE }
                },
                message: 'overwrite must be either true or false',
                source: 'epilog'
            });
        }
        else {
            overwriteValue = overwriteValueString === 'true';
            overwriteValueExplicitlySpecified = true;
        }
    }
    const ignoreOverwriteWarning = overwriteValue && overwriteValueExplicitlySpecified && overwriteLineIndices.length === 1;
    // Get the absolute paths to the files
    const documentDir = path.dirname(vscode_uri_1.URI.parse(textDocument.uri).fsPath);
    let validExtensions = new Set([language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID) ?? '',
        language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID) ?? '',
        language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_METADATA_LANGUAGE_ID) ?? '']);
    let fileToBuildPaths = new Set();
    let newFilePaths = new Set();
    // Validate the file to build lines. Check that 
    // all files to build exist and have valid extensions
    // all files to build are specified only once
    // all new filenames are specified only once
    // all new filenames have valid extensions
    // all new filenames have the same extension as the old filename
    // all new filenames don't already exist
    for (const fileToBuildLineIndex of filesToBuildLineIndices) {
        const filenames = allLines[fileToBuildLineIndex].trim().split('==>');
        // Line is not in the correct format
        if (filenames.length > 2) {
            diagnostics.push({
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: fileToBuildLineIndex, character: 0 },
                    end: { line: fileToBuildLineIndex, character: Number.MAX_VALUE }
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
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: fileToBuildLineIndex, character: filenameToBuildStartIndex },
                    end: { line: fileToBuildLineIndex, character: filenameToBuildEndIndex }
                },
                message: 'File to build does not exist: ' + fileToBuildAbsPath,
                source: 'epilog'
            });
        }
        // Check that the file to build has a valid extension
        const fileToBuildAbsPathExt = path.extname(fileToBuildAbsPath);
        if (!validExtensions.has(fileToBuildAbsPathExt)) {
            diagnostics.push({
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: fileToBuildLineIndex, character: filenameToBuildStartIndex },
                    end: { line: fileToBuildLineIndex, character: filenameToBuildEndIndex }
                },
                message: 'Can only build files with extensions ' + Array.from(validExtensions).join(', '),
                source: 'epilog'
            });
        }
        // Check that the file to build isn't the same as another file to build
        if (fileToBuildPaths.has(fileToBuildAbsPath)) {
            diagnostics.push({
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: fileToBuildLineIndex, character: filenameToBuildStartIndex },
                    end: { line: fileToBuildLineIndex, character: filenameToBuildEndIndex }
                },
                message: 'Same file to build specified multiple times - will be consolidated multiple times.',
                source: 'epilog'
            });
        }
        else {
            // Add the file to build path to the list
            fileToBuildPaths.add(fileToBuildAbsPath);
        }
        // Verify the name of the file to be created
        if (filenames.length === 2) {
            const newFilenameRelPath = filenames[1].trim();
            if (prefixValueIncorrectlySpecified) {
                prefixValue = '';
            }
            const newFilenameAbsPath = path.join(documentDir, path.dirname(newFilenameRelPath), prefixValue + path.basename(newFilenameRelPath));
            const newFilenameStartIndex = allLines[fileToBuildLineIndex].indexOf(newFilenameRelPath, filenameToBuildEndIndex);
            const newFilenameEndIndex = newFilenameStartIndex + newFilenameRelPath.length;
            // Check that the new filename isn't empty
            if (newFilenameRelPath === '') {
                diagnostics.push({
                    severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                    range: {
                        start: { line: fileToBuildLineIndex, character: 0 },
                        end: { line: fileToBuildLineIndex, character: Number.MAX_VALUE }
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
                    severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
                    range: {
                        start: { line: fileToBuildLineIndex, character: newFilenameStartIndex },
                        end: { line: fileToBuildLineIndex, character: newFilenameEndIndex }
                    },
                    message: 'Should only create new files with extensions ' + Array.from(validExtensions).join(', '),
                    source: 'epilog'
                });
            }
            // Check that the new filename has the same extension as the old filename
            if (path.extname(newFilenameAbsPath) !== fileToBuildAbsPathExt) {
                diagnostics.push({
                    severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
                    range: {
                        start: { line: fileToBuildLineIndex, character: newFilenameStartIndex },
                        end: { line: fileToBuildLineIndex, character: newFilenameEndIndex }
                    },
                    message: 'New filename should have extension ' + fileToBuildAbsPathExt + ' - the same extension as the file to build',
                    source: 'epilog'
                });
            }
            // Check that the new filename doesn't already exist
            if (!ignoreOverwriteWarning && fs.existsSync(newFilenameAbsPath)) {
                diagnostics.push({
                    severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
                    range: {
                        start: { line: fileToBuildLineIndex, character: newFilenameStartIndex },
                        end: { line: fileToBuildLineIndex, character: newFilenameEndIndex }
                    },
                    message: 'New filename already exists and will be overwritten: ' + newFilenameAbsPath,
                    source: 'epilog'
                });
            }
            // Check that the new filename isn't the same as another new filename
            if (newFilePaths.has(newFilenameAbsPath)) {
                diagnostics.push({
                    severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                    range: {
                        start: { line: fileToBuildLineIndex, character: newFilenameStartIndex },
                        end: { line: fileToBuildLineIndex, character: newFilenameEndIndex }
                    },
                    message: 'Same new filename specified multiple times - will be written to multiple times on consolidate.',
                    source: 'epilog'
                });
            }
            else {
                // Add the new filename path to the list
                newFilePaths.add(newFilenameAbsPath);
            }
        }
        if (filenames.length === 1) {
            const filenameToBuildRelPath = path.dirname(filenames[0].trim());
            const dirOfGeneratedFile = path.join(documentDir, filenameToBuildRelPath, getDirFromPrefix(prefixValue));
            if (!fs.existsSync(dirOfGeneratedFile)) {
                diagnostics.push({
                    severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                    range: {
                        start: { line: fileToBuildLineIndex, character: 0 },
                        end: { line: fileToBuildLineIndex, character: Number.MAX_VALUE }
                    },
                    message: 'Will try to write to directory that does not exist: ' + dirOfGeneratedFile,
                    source: 'epilog'
                });
            }
        }
    }
    return diagnostics;
}
exports.validateDocWithFiletype_EpilogBuild = validateDocWithFiletype_EpilogBuild;
// Differs from path.dirname in that if the entire prefix value is a path to a directory, the final path segment is included
function getDirFromPrefix(prefixValue) {
    if (path.normalize(prefixValue).endsWith('\\')) {
        return path.normalize(prefixValue);
    }
    return path.dirname(path.normalize(prefixValue));
}
//# sourceMappingURL=validate_epilogbuild.js.map