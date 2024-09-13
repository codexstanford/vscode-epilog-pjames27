import * as fs from 'fs';
import * as path from 'path';

import {
    getFrontmatter
} from './frontmatter';

import {
    EPILOG_DATASET_LANGUAGE_ID,
    EPILOG_RULESET_LANGUAGE_ID,
    EPILOG_METADATA_LANGUAGE_ID,
    FILE_EXTENSION_TO_LANGUAGE_ID
} from './language_ids';    



// Functions to resolve the full content of a ruleset, dataset, or metadata file, as determined by the files it links to in its frontmatter
// NOT FULLY IMPLEMENTED
    // Currently does not get the content of the files that the dataset and ruleset inherit from. Only get the content of the file after the frontmatter.
export function resolveFullFileContent(filepath: string): string {
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
    const fileLanguageId = FILE_EXTENSION_TO_LANGUAGE_ID.get(fileExtension);
    if (fileLanguageId === undefined) {
        console.error(`File type ${fileExtension} does not have an epilog language id: ${filepath}`);
        return "";
    }

    // Based on the language id, resolve the full file content
    switch (fileLanguageId) {
        case EPILOG_DATASET_LANGUAGE_ID:
            return resolveFullDatasetFileContent(docText);
        case EPILOG_RULESET_LANGUAGE_ID :
            return resolveFullRulesetFileContent(docText);
        case EPILOG_METADATA_LANGUAGE_ID :
            return resolveFullMetadataFileContent(docText);
        default:
            console.error(`Can't resolve full file content for files with type ${fileLanguageId}: ${filepath}`);
            return "";
    }
}

function resolveFullDatasetFileContent(docText: string): string {
    return resolveGetPostFrontmatterFileContent(docText);
}

function resolveFullRulesetFileContent(docText: string): string {
    return resolveGetPostFrontmatterFileContent(docText);
}

function resolveFullMetadataFileContent(docText: string): string {
    return resolveGetPostFrontmatterFileContent(docText);
}

function resolveGetPostFrontmatterFileContent(docText: string): string {
    // Get the frontmatter
    const frontmatter = getFrontmatter(docText);
    
    // Get the text after the frontmatter
    const textAfterFrontmatter = docText.slice(frontmatter.length);
    
    return textAfterFrontmatter; 
}