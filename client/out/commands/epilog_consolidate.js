"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.epilogCmd_consolidate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const resolve_full_file_content_js_1 = require("../../../common/out/resolve_full_file_content.js");
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
    let overwriteValue = true;
    let overwriteValueHasBeenExplicitlySpecified = false;
    let prefixValue = '';
    let prefixValueHasBeenExplicitlySpecified = false;
    // A list of pairs of (filename to build, new filename)
    let filenamesToBuildAndNewFilenames = [];
    const docText = document.getText();
    // Break the document into lines, filtering out empty lines
    const lines = docText.split('\n').filter(line => line.trim() !== '');
    // Parses the lines to do the following:
    // 1. Get the overwrite value, if specified
    // 2. Get the prefix value, if specified
    // 3. Get the list of pairs of (filename to build, new filename)
    // Only gets the values as specified - doesn't generate new filenames or create absolute paths.
    for (const line of lines) {
        // Get the overwrite value
        if (line.startsWith('overwrite:')) {
            if (overwriteValueHasBeenExplicitlySpecified) {
                vscode.window.showErrorMessage('Can only specify overwrite value once');
                return;
            }
            let overwriteValueString = line.split(':')[1].trim().toLowerCase();
            if (overwriteValueString !== 'true' && overwriteValueString !== 'false') {
                vscode.window.showErrorMessage('Overwrite value must be either true or false');
                return;
            }
            overwriteValue = overwriteValueString === 'true';
            overwriteValueHasBeenExplicitlySpecified = true;
            continue;
        }
        // Get the prefix value
        if (line.startsWith('prefix:')) {
            if (prefixValueHasBeenExplicitlySpecified) {
                vscode.window.showErrorMessage('Can only specify prefix value once');
                return;
            }
            prefixValue = line.split(':')[1].trim();
            if (prefixValue === '') {
                vscode.window.showErrorMessage('Prefix value cannot be empty');
                return;
            }
            prefixValueHasBeenExplicitlySpecified = true;
            continue;
        }
        // Get the filename to build, and the new filename (if specified)
        const filenames = line.split('==>');
        if (filenames.length > 2) {
            vscode.window.showErrorMessage('Invalid line: ' + line + '\nLine should be of the form <filename> or <filename> ==> <newfilename>');
            return;
        }
        const filenameToBuild = filenames[0].trim();
        const newFilename = filenames.length === 2 ? filenames[1].trim() : '';
        // Check that the file to build has a valid extension
        if (!validExtensions.has(path.extname(filenameToBuild))) {
            vscode.window.showErrorMessage('Invalid file extension: \"' + path.extname(filenameToBuild) + '\"\n Can only consolidate files with extensions: ' + Array.from(validExtensions).join(', '));
            return;
        }
        filenamesToBuildAndNewFilenames.push([filenameToBuild, newFilename]);
    }
    // Get the uri of the active document
    let documentAbsFilepath = document.uri.fsPath;
    // Get the directory of the active document
    let documentDir = path.dirname(documentAbsFilepath);
    // Don't want to normalize and then get the basename, because that will turn an empty prefixvalue into a basename of '.', 
    // and the basename is prepended rather than path.joined
    const prefixBasename = (prefixValue === '' || path.normalize(prefixValue).endsWith('\\')) ? '' : path.basename(path.normalize(prefixValue));
    const prefixDir = path.normalize(prefixValue).endsWith('\\') ? path.normalize(prefixValue) : path.dirname(path.normalize(prefixValue));
    // For the sake of checking that the same file won't be written to multiple times,
    // we need to know what files are already in the directory that the prefix specifies, relative to the document directory
    const dirForAutoGeneratedFilenames = path.join(documentDir, prefixDir);
    // Check that the directory that the prefix specifies exists
    if (!fs.existsSync(dirForAutoGeneratedFilenames)) {
        vscode.window.showErrorMessage('Directory that the prefix specifies does not exist: ' + dirForAutoGeneratedFilenames);
        return;
    }
    const filenamesInDir = fs.readdirSync(dirForAutoGeneratedFilenames);
    // Sets to detect whether the same file will be read from or written to multiple times
    let absFilenamesToBuild = new Set();
    let absNewFilenames = new Set();
    // Convert the relative paths to absolute paths, generate new filenames as necessary, and check that:
    // 1. All files to build exist
    // 2. All new filenames are valid, i.e. are files and not directories
    // 3. No file would be built or written to multiple times
    for (let i = 0; i < filenamesToBuildAndNewFilenames.length; i++) {
        // Handle the filename to build
        const relFilenameToBuild = filenamesToBuildAndNewFilenames[i][0];
        // Convert the relative path to an absolute path
        const absFilenameToBuild = path.join(documentDir, relFilenameToBuild);
        // Check that the file to build exists
        if (!fs.existsSync(absFilenameToBuild)) {
            vscode.window.showErrorMessage('File to build does not exist: ' + absFilenameToBuild);
            return;
        }
        // Check that the same file won't be built multiple times
        if (absFilenamesToBuild.has(absFilenameToBuild)) {
            vscode.window.showErrorMessage('Same file to build specified multiple times: ' + relFilenameToBuild);
            return;
        }
        absFilenamesToBuild.add(absFilenameToBuild);
        // Update the filename to build to be the absolute path
        filenamesToBuildAndNewFilenames[i][0] = absFilenameToBuild;
        // Handle the new filename
        let relNewFilename = '';
        // If no new filename is specified, generate the new filename
        // Should be of the form <prefix><oldfilename><opt. num>.<extension>
        if (filenamesToBuildAndNewFilenames[i][1] === '') {
            const oldExt = path.extname(relFilenameToBuild);
            const oldFilename = path.basename(relFilenameToBuild, oldExt);
            relNewFilename = generateFilenameUnusedInList(oldExt, filenamesInDir.concat(Array.from(absNewFilenames)), prefixBasename + oldFilename);
        }
        else {
            relNewFilename = prefixBasename + filenamesToBuildAndNewFilenames[i][1];
        }
        const absNewFilename = path.join(documentDir, prefixDir, relNewFilename);
        // Check that the new filename is a file and not a directory
        // Can't end in a slash or be an existing directory
        if ((fs.existsSync(absNewFilename) && fs.statSync(absNewFilename).isDirectory()) ||
            absNewFilename.endsWith('\\')) {
            vscode.window.showErrorMessage('New filename cannot be a directory: ' + absNewFilename);
            return;
        }
        // Check that the same file won't be written to multiple times
        if (absNewFilenames.has(absNewFilename)) {
            vscode.window.showErrorMessage('Same file will be written to multiple times: ' + absNewFilename);
            return;
        }
        // If trying to write to a nonexisting directory, throw an error
        if (!fs.existsSync(path.dirname(absNewFilename))) {
            vscode.window.showErrorMessage('Cannot write to nonexisting directory: ' + path.dirname(absNewFilename));
            return;
        }
        absNewFilenames.add(absNewFilename);
        // Update the new filename to be the absolute path
        filenamesToBuildAndNewFilenames[i][1] = absNewFilename;
    }
    // For each pair, resolve the full file content of the filename to build, and save the full file content to the new filename
    for (const [absFilenameToBuild, absNewFilename] of filenamesToBuildAndNewFilenames) {
        // Resolve the full file content of the filename to build
        let fullFileContent = (0, resolve_full_file_content_js_1.resolveFullFileContent)(absFilenameToBuild);
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
    let documentAbsFilepath = vscode.window.activeTextEditor.document.uri.fsPath;
    // TODO Change to use document instead of client, like epilog_runScript
    // Get the directory of the active document
    let documentDir = path.dirname(documentAbsFilepath);
    // Suggest a filename of the form 'consolidated{num}.{extension}', where extension is the extension of the active document
    let suggestedFilename = generateFilenameUnusedInList(path.extname(documentAbsFilepath), fs.readdirSync(documentDir), 'consolidated');
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
        const choice = await vscode.window.showWarningMessage(`File "${newDocumentFilepath}" already exists. Do you want to overwrite it?`, 'Yes', 'No');
        if (choice !== 'Yes') {
            return; // User chose not to overwrite
        }
    }
    // Resolve the full file content of the active document
    let fullFileContent = (0, resolve_full_file_content_js_1.resolveFullFileContent)(documentAbsFilepath);
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
    if (!validLangIdsToConsolidate.includes(document.languageId)) {
        vscode.window.showErrorMessage('Cannot consolidate: Active document is not a valid Epilog file. Must have extension: ' + validLangIdsToConsolidate.join(', '));
        return;
    }
    // Consolidate the active document
    await consolidate_ActiveDocument();
}
exports.epilogCmd_consolidate = epilogCmd_consolidate;
//# sourceMappingURL=epilog_consolidate.js.map