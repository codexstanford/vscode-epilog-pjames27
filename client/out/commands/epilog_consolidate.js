"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.epilogCmd_consolidate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const resolve_full_file_content_1 = require("../resolve_full_file_content");
const language_ids_js_1 = require("../../../common/out/language_ids.js");
const validLangIdsToConsolidate = [language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID, language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID, language_ids_js_1.EPILOG_METADATA_LANGUAGE_ID];
const validExtensions = new Set([
    language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID),
    language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID),
    language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_METADATA_LANGUAGE_ID)
]);
// Generates a filename that doesn't already exist in the current directory
// Filename has the form <prefix>.<extension>
// If <prefix>.<extension> already exists, it will add a number to the end of the filename until it doesn't exist
// i.e. will generate a name with the form <prefix><num>.<extension>
function generateFilenameUnusedInList(extension, existingFilenames, prefix = 'newfile') {
    let filename = prefix + extension;
    // Check if the filename already exists
    if (!existingFilenames.includes(filename)) {
        return filename;
    }
    // If the filename already exists, add a number to the end of the filename until it doesn't exist
    let i = 1;
    while (existingFilenames.includes(filename)) {
        filename = prefix + i + extension;
        i++;
    }
    return filename;
}
function getDocumentDir(document) {
    return path.dirname(document.uri.fsPath);
}
// Differs from path.dirname in that if the entire prefix value is a path to a directory, the final path segment is included
function getDirFromPrefix(prefixValue) {
    if (path.normalize(prefixValue).endsWith(path.sep)) {
        console.log("ends in path sep:", prefixValue);
        return path.normalize(prefixValue);
    }
    return path.dirname(path.normalize(prefixValue));
}
// Parses the lines of the document to do the following:
// 1. Get the overwrite value, if specified
// 2. Get the prefix value, if specified
// 3. Get the list of pairs of (filename to build, new filename)
// Only gets the values as specified - doesn't generate new filenames or create absolute paths.
function parseEpilogBuildFile(document) {
    const docText = document.getText();
    // Break the document into lines, filtering out empty lines
    const lines = docText.split('\n').filter(line => line.trim() !== '');
    let overwriteValue = true;
    let overwriteValueHasBeenExplicitlySpecified = false;
    let prefixValue = '';
    let prefixValueHasBeenExplicitlySpecified = false;
    // A list of pairs of (filename to build, new filename)
    let filenamesToBuildAndNewFilenames = [];
    for (const line of lines) {
        // Get the overwrite value
        if (line.startsWith('overwrite:')) {
            if (overwriteValueHasBeenExplicitlySpecified) {
                vscode.window.showErrorMessage('Can only specify overwrite value once');
                return [false, false, '', [], true];
            }
            let overwriteValueString = line.split(':')[1].trim().toLowerCase();
            if (overwriteValueString !== 'true' && overwriteValueString !== 'false') {
                vscode.window.showErrorMessage('Overwrite value must be either true or false');
                return [false, false, '', [], true];
            }
            overwriteValue = overwriteValueString === 'true';
            overwriteValueHasBeenExplicitlySpecified = true;
            continue;
        }
        // Get the prefix value
        if (line.startsWith('prefix:')) {
            if (prefixValueHasBeenExplicitlySpecified) {
                vscode.window.showErrorMessage('Can only specify prefix value once');
                return [false, false, '', [], true];
            }
            prefixValue = line.split(':')[1].trim();
            if (prefixValue === '') {
                vscode.window.showErrorMessage('Prefix value cannot be empty');
                return [false, false, '', [], true];
            }
            prefixValueHasBeenExplicitlySpecified = true;
            continue;
        }
        // Get the filename to build, and the new filename (if specified)
        const filenames = line.split('==>');
        if (filenames.length > 2) {
            vscode.window.showErrorMessage('Invalid line: ' + line + '\nLine should be of the form <filename> or <filename> ==> <newfilename>');
            return [false, false, '', [], true];
        }
        const filenameToBuild = filenames[0].trim();
        const newFilename = filenames.length === 2 ? filenames[1].trim() : '';
        // Check that the file to build has a valid extension
        if (!validExtensions.has(path.extname(filenameToBuild))) {
            vscode.window.showErrorMessage('Invalid file extension: \"' + path.extname(filenameToBuild) + '\"\n Can only consolidate files with extensions: ' + Array.from(validExtensions).join(', '));
            return [false, false, '', [], true];
        }
        filenamesToBuildAndNewFilenames.push([filenameToBuild, newFilename]);
    }
    return [overwriteValue, overwriteValueHasBeenExplicitlySpecified, prefixValue, filenamesToBuildAndNewFilenames, false];
}
// Validates the filenames in the file and converts them to absolute paths
// Does not generate filenames for build files without explicitly specified new filenames
// Checks whether:
// 1. All files to build exist
// 2. All new filenames are valid, i.e. are files and not directories
// 3. No file would be built or written to multiple times
function validateEpilogBuildFilenamesAndConvertToAbsolute(document, filenamesToBuildAndNewFilenames, prefixValue) {
    // Get the uri of the active document
    const documentAbsFilepath = document.uri.fsPath;
    // Get the directory of the active document
    const documentDir = path.dirname(documentAbsFilepath);
    // Sets to detect whether the same file will be read from or written to multiple times
    let absFilenamesToBuild = new Set();
    let absNewFilenames = new Set();
    let absFilenamesToBuildAndNewFilenames = [];
    // Convert the relative paths to absolute paths and check that:
    // 1. All files to build exist
    // 2. All new filenames are valid, i.e. are files and not directories
    // 3. No file would be built or written to multiple times
    for (const [relFilenameToBuild, relNewFilename] of filenamesToBuildAndNewFilenames) {
        // --- Handle the filename to build ---
        // Convert the relative path to an absolute path
        const absFilenameToBuild = path.join(documentDir, relFilenameToBuild);
        // Check that the file to build exists
        if (!fs.existsSync(absFilenameToBuild)) {
            vscode.window.showErrorMessage('File to build does not exist: ' + absFilenameToBuild);
            return [[], true];
        }
        // Check that the same file won't be built multiple times
        if (absFilenamesToBuild.has(absFilenameToBuild)) {
            vscode.window.showErrorMessage('Same file to build specified multiple times: ' + relFilenameToBuild);
            return [[], true];
        }
        absFilenamesToBuild.add(absFilenameToBuild);
        // --- Handle the new filename ---
        if (relNewFilename === '') {
            absFilenamesToBuildAndNewFilenames.push([absFilenameToBuild, '']);
            continue;
        }
        // The relative new filename can't be a directory (i.e. end in a path separator)
        if (path.normalize(relNewFilename).endsWith(path.sep)) {
            vscode.window.showErrorMessage('New filename cannot be a directory: ' + relNewFilename);
            return [[], true];
        }
        const absNewFilename = path.join(documentDir, path.dirname(relNewFilename), prefixValue + path.basename(relNewFilename));
        // Check that the new filename is a file and not a directory
        // Can't end in a path separator or be an existing directory
        if ((fs.existsSync(absNewFilename) && fs.statSync(absNewFilename).isDirectory()) ||
            absNewFilename.endsWith(path.sep)) {
            vscode.window.showErrorMessage('New filename cannot be a directory: ' + absNewFilename);
            return [[], true];
        }
        // Check that the same file won't be written to multiple times
        if (absNewFilenames.has(absNewFilename)) {
            vscode.window.showErrorMessage('Same file will be written to multiple times: ' + absNewFilename);
            return [[], true];
        }
        // If trying to write to a nonexisting directory, throw an error
        if (!fs.existsSync(path.dirname(absNewFilename))) {
            vscode.window.showErrorMessage('Cannot write to nonexisting directory: ' + path.dirname(absNewFilename));
            return [[], true];
        }
        absNewFilenames.add(absNewFilename);
        // Update the new filename to be the absolute path
        absFilenamesToBuildAndNewFilenames.push([absFilenameToBuild, absNewFilename]);
    }
    return [absFilenamesToBuildAndNewFilenames, false];
}
// Generates new filenames for the files without explicitly specified new filenames
// Returns the updated list of pairs of (filename to build, new filename)
function generateNeededNewFilenames(document, absFilenamesToBuildAndNewFilenames, relFilenamesToBuildAndNewFilenames, prefixValue) {
    // Get the absolute paths of the files that are about to be created
    let absNewFilenames = absFilenamesToBuildAndNewFilenames.filter(pair => pair[1] !== '').map(pair => pair[1]);
    const documentDir = getDocumentDir(document);
    const dirOfPrefix = getDirFromPrefix(prefixValue);
    // Don't want to normalize and then get the basename, because that will turn an empty prefixvalue into a basename of '.', 
    // and the basename is prepended rather than path.joined
    const prefixBasename = (prefixValue === '' || path.normalize(prefixValue).endsWith(path.sep)) ? '' : path.basename(path.normalize(prefixValue));
    // Should be of the form <prefix><oldfilename><opt. num>.<extension>
    for (let i = 0; i < absFilenamesToBuildAndNewFilenames.length; i++) {
        if (absFilenamesToBuildAndNewFilenames[i][1] !== '') {
            continue;
        }
        const absFilenameToBuild = absFilenamesToBuildAndNewFilenames[i][0];
        const toBuildExt = path.extname(absFilenameToBuild);
        const toBuildFileBasename = path.basename(absFilenameToBuild, toBuildExt);
        const toBuildRelPath = relFilenamesToBuildAndNewFilenames[i][0];
        const toBuildRelDirPath = path.dirname(toBuildRelPath);
        // For the sake of checking that the same file won't be written to multiple times, we need to know what files are already in the directory that the prefix specifies, relative to the document directory
        const dirForAutoGeneratedFilename = path.join(documentDir, toBuildRelDirPath, dirOfPrefix);
        if (!fs.existsSync(dirForAutoGeneratedFilename)) {
            vscode.window.showErrorMessage('Trying to write to directory that does not exist: ' + dirForAutoGeneratedFilename);
            return [[], true];
        }
        const filenamesInDir = fs.readdirSync(dirForAutoGeneratedFilename);
        const newFilenamesInDir = absNewFilenames.filter(filename => path.resolve(path.dirname(filename)) === path.resolve(dirForAutoGeneratedFilename)).map(filename => path.basename(filename));
        absFilenamesToBuildAndNewFilenames[i][1] = path.join(dirForAutoGeneratedFilename, generateFilenameUnusedInList(toBuildExt, filenamesInDir.concat(newFilenamesInDir), prefixBasename + toBuildFileBasename));
        absNewFilenames.push(absFilenamesToBuildAndNewFilenames[i][1]);
    }
    return [absFilenamesToBuildAndNewFilenames, false];
}
async function consolidate_EpilogBuild() {
    // Parse the content of the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active document.');
        return;
    }
    const document = editor.document;
    if (document.languageId !== language_ids_js_1.EPILOG_BUILD_LANGUAGE_ID) {
        vscode.window.showErrorMessage('Must be an Epilog build file. (I.e. have file extension .epilogbuild)');
        return;
    }
    // --- Parse the Epilog build file ---
    const [overwriteValue, overwriteValueHasBeenExplicitlySpecified, prefixValue, relFilenamesToBuildAndNewFilenames, PARSE_ERROR] = parseEpilogBuildFile(document);
    if (PARSE_ERROR) {
        return;
    }
    // --- Validate the filenames in the file and convert them to absolute paths ---
    let [absFilenamesToBuildAndNewFilenames, VALIDATION_ERROR] = validateEpilogBuildFilenamesAndConvertToAbsolute(document, relFilenamesToBuildAndNewFilenames, prefixValue);
    if (VALIDATION_ERROR) {
        return;
    }
    // --- Generate new filenames for the files without explicitly specified new filenames ---
    let GENERATION_ERROR = false;
    [absFilenamesToBuildAndNewFilenames, GENERATION_ERROR] = generateNeededNewFilenames(document, absFilenamesToBuildAndNewFilenames, relFilenamesToBuildAndNewFilenames, prefixValue);
    if (GENERATION_ERROR) {
        return;
    }
    // --- Save the consolidated content ---
    // Get whether the universal files should be included when consolidating
    const includeUniversalFilesWhenConsolidating = vscode.workspace.getConfiguration('epilog.consolidate').get('includeUniversalFiles');
    // For each pair, resolve the full file content of the filename to build and save the full file content to the new filename
    for (const [absFilenameToBuild, absNewFilename] of absFilenamesToBuildAndNewFilenames) {
        // Resolve the full file content of the filename to build
        let fullFileContent = (0, resolve_full_file_content_1.resolveFullFileContent)(absFilenameToBuild, includeUniversalFilesWhenConsolidating);
        const newFileAlreadyExists = fs.existsSync(absNewFilename);
        // If the new file doesn't already exist, or overwrite has been explicitly specified as true, can freely save the full file content to the new filename
        if (!newFileAlreadyExists ||
            (overwriteValueHasBeenExplicitlySpecified && overwriteValue === true)) {
            fs.writeFileSync(absNewFilename, fullFileContent);
            continue;
        }
        // If overwrite has been explicitly specified as false and the file already exists, skip this file
        if (overwriteValueHasBeenExplicitlySpecified && overwriteValue === false) {
            continue;
        }
        // Otherwise overwrite hasn't been explicitly specified and the new filename already exists, so ask the user whether they want to overwrite it
        const choice = await vscode.window.showWarningMessage(`File "${absNewFilename}" already exists. Do you want to overwrite it?`, 'Yes', 'No');
        if (choice === 'Yes') {
            // Save the full file content to the new filename
            fs.writeFileSync(absNewFilename, fullFileContent);
        }
    }
}
async function consolidate_ActiveDocument() {
    // Get the uri of the active document
    const documentAbsFilepath = vscode.window.activeTextEditor.document.uri.fsPath;
    // Get the directory of the active document
    const documentDir = path.dirname(documentAbsFilepath);
    // Suggest a filename of the form 'consolidated{num}.{extension}', where extension is the extension of the active document
    const suggestedFilename = generateFilenameUnusedInList(path.extname(documentAbsFilepath), fs.readdirSync(documentDir), 'consolidated');
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
    const newDocumentFilepath = documentDir + '/' + filename;
    // If file exists, ask user if they want to overwrite it
    if (fs.existsSync(newDocumentFilepath)) {
        const choice = await vscode.window.showWarningMessage(`File "${newDocumentFilepath}" already exists. Do you want to overwrite it?`, 'Yes', 'No');
        if (choice !== 'Yes') {
            return; // User chose not to overwrite
        }
    }
    // Resolve the full file content of the active document
    // Get whether the universal files should be included when consolidating
    const includeUniversalFilesWhenConsolidating = vscode.workspace.getConfiguration('epilog.consolidate').get('includeUniversalFiles');
    const fullFileContent = (0, resolve_full_file_content_1.resolveFullFileContent)(documentAbsFilepath, includeUniversalFilesWhenConsolidating);
    // Save the full file content to the filename specified by the user
    fs.writeFileSync(documentDir + '/' + filename, fullFileContent);
}
async function epilogCmd_consolidate(client) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('Cannot consolidate: No active document.');
        return;
    }
    // Get the active document
    const document = editor.document;
    // Run consolidate differently if the active document is a .epilogbuild file
    if (document.languageId === language_ids_js_1.EPILOG_BUILD_LANGUAGE_ID) {
        consolidate_EpilogBuild();
        return;
    }
    // Otherwise, consolidate the active document as long as it has a valid extension
    if (!validLangIdsToConsolidate.includes(document.languageId)) {
        vscode.window.showErrorMessage('Cannot consolidate: Active document is not a valid Epilog file. Must have extension: ' + validLangIdsToConsolidate.join(', '));
        return;
    }
    // Consolidate the active document
    await consolidate_ActiveDocument();
}
exports.epilogCmd_consolidate = epilogCmd_consolidate;
//# sourceMappingURL=epilog_consolidate.js.map