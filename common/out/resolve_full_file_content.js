"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFullFileContent = void 0;
const fs = require("fs");
const path = require("path");
const frontmatter_1 = require("./frontmatter");
const language_ids_1 = require("./language_ids");
// Functions to resolve the full content of a ruleset, dataset, or metadata file, as determined by the files it links to in its frontmatter
// NOT FULLY IMPLEMENTED
// Currently does not get the content of the files that the dataset and ruleset inherit from. Only get the content of the file after the frontmatter.
function resolveFullFileContent(filepath) {
    // Verify the file exists
    if (!fs.existsSync(filepath)) {
        console.error(`File does not exist: ${filepath}`);
        return "";
    }
    // Get the file extension
    const fileExtension = path.extname(filepath);
    // Get the file content
    const docText = fs.readFileSync(filepath, 'utf8');
    // Get the file language id from the file extension
    const fileLanguageId = language_ids_1.FILE_EXTENSIONS_TO_LANGUAGE_ID.get(fileExtension);
    if (fileLanguageId === undefined) {
        console.error(`File type ${fileExtension} does not have an epilog language id: ${filepath}`);
        return "";
    }
    // Based on the language id, resolve the full file content
    switch (fileLanguageId) {
        case language_ids_1.EPILOG_DATASET_LANGUAGE_ID:
            return resolveFullDatasetFileContent(docText);
        case language_ids_1.EPILOG_RULESET_LANGUAGE_ID:
            return resolveFullRulesetFileContent(docText);
        case language_ids_1.EPILOG_METADATA_LANGUAGE_ID:
            return resolveFullMetadataFileContent(docText);
        default:
            console.error(`Can't resolve full file content for files with type ${fileLanguageId}: ${filepath}`);
            return "";
    }
}
exports.resolveFullFileContent = resolveFullFileContent;
function resolveFullDatasetFileContent(docText) {
    return resolveGetPostFrontmatterFileContent(docText);
}
function resolveFullRulesetFileContent(docText) {
    return resolveGetPostFrontmatterFileContent(docText);
}
function resolveFullMetadataFileContent(docText) {
    return resolveGetPostFrontmatterFileContent(docText);
}
function resolveGetPostFrontmatterFileContent(docText) {
    // Get the frontmatter
    const frontmatter = (0, frontmatter_1.getFrontmatter)(docText);
    // Get the text after the frontmatter
    const textAfterFrontmatter = docText.slice(frontmatter.length);
    return textAfterFrontmatter;
}
//# sourceMappingURL=resolve_full_file_content.js.map