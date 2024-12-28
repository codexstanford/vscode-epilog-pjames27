"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFullFileContent = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const frontmatter_js_1 = require("../../common/out/frontmatter.js");
const language_ids_js_1 = require("../../common/out/language_ids.js");
// Resolves the full content of a ruleset, dataset, or metadata file, as determined by the files it links to in its frontmatter
// Note: Validates that the referenced files exist, but doesn't check their extensions. Leaves that to the Language Server's getDiagnostics.
function resolveFullFileContent(absFilePath, includeUniversalFiles) {
    // Verify the file exists
    if (!fs.existsSync(absFilePath)) {
        console.error(`File does not exist: ${absFilePath}`);
        return "";
    }
    // Get the file extension
    const fileExtension = path.extname(absFilePath);
    // Get the file language id from the file extension for the initial file
    const initialFileLanguageId = language_ids_js_1.FILE_EXTENSION_TO_LANGUAGE_ID.get(fileExtension);
    if (initialFileLanguageId === undefined) {
        console.error(`File type ${fileExtension} does not have a valid epilog language id: ${absFilePath}`);
        return "";
    }
    let frontmatterFieldToTraverse = "";
    switch (initialFileLanguageId) {
        case language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID:
            frontmatterFieldToTraverse = 'data';
            break;
        case language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID:
            frontmatterFieldToTraverse = 'rules';
            break;
        case language_ids_js_1.EPILOG_METADATA_LANGUAGE_ID:
            frontmatterFieldToTraverse = 'metadata';
            break;
        default:
            console.error(`Can't resolve full file content for files with type ${initialFileLanguageId}: ${absFilePath}`);
            return "";
    }
    // Get the set of absolute filepaths to visit, starting with the initial file and including all the files it links to, recursively
    let linkedAbsFilepaths = (0, frontmatter_js_1.getAbsFilepathsLinkedFromFrontmatterFields)(absFilePath, [frontmatterFieldToTraverse], true);
    // The initial file will only be in the linkedAbsFilepaths set if there's a cycle. We remove it to avoid adding its content twice.
    // And we remove it here then construct the array, instead of adding the initial file to the set then constructing the array, to ensure the initial file's content is first in the output
    linkedAbsFilepaths.delete(absFilePath);
    let absFilepathsToVisit = [absFilePath, ...Array.from(linkedAbsFilepaths)];
    let fullFileContent = "";
    for (const currAbsFilepath of absFilepathsToVisit) {
        // Verify the file exists
        if (!fs.existsSync(currAbsFilepath)) {
            console.error(`File does not exist: ${currAbsFilepath}`);
            continue;
        }
        // Get the file content and add to the full file content
        const fileText = fs.readFileSync(currAbsFilepath, 'utf8');
        const postFrontmatterText = resolveGetPostFrontmatterFileContent(fileText).trim();
        fullFileContent += postFrontmatterText + "\n";
    }
    // Add the universal file content if requested
    if (includeUniversalFiles) {
        const universalFileContent = getUniversalFileContent(fileExtension);
        fullFileContent += universalFileContent;
    }
    return fullFileContent;
}
exports.resolveFullFileContent = resolveFullFileContent;
function resolveGetPostFrontmatterFileContent(docText) {
    // Get the frontmatter
    const frontmatter = (0, frontmatter_js_1.getFrontmatter)(docText);
    // Get the text after the frontmatter
    const textAfterFrontmatter = docText.slice(frontmatter.length);
    return textAfterFrontmatter;
}
function getUniversalFileContent(fileExtension) {
    const epilogSettings = vscode.workspace.getConfiguration('epilog.universal');
    let typeOfFile = "";
    switch (fileExtension) {
        case language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID):
            typeOfFile = "data";
            break;
        case language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID):
            typeOfFile = "rules";
            break;
        case language_ids_js_1.LANGUAGE_ID_TO_FILE_EXTENSION.get(language_ids_js_1.EPILOG_METADATA_LANGUAGE_ID):
            typeOfFile = "metadata";
            break;
        default:
            console.error(`Can't get universal file content for file with extension ${fileExtension}`);
            return "";
    }
    const universalFilePath = epilogSettings.get(typeOfFile);
    // Verify the file exists and has the correct extension
    if (!fs.existsSync(universalFilePath) ||
        path.extname(universalFilePath) !== fileExtension) {
        return "";
    }
    console.log("Universal file content: " + fs.readFileSync(universalFilePath, 'utf8'));
    return fs.readFileSync(universalFilePath, 'utf8');
}
//# sourceMappingURL=resolve_full_file_content.js.map