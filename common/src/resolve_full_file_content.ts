import * as fs from 'fs';
import * as path from 'path';

import {
    getFrontmatter,
    parseFrontmatter
} from './frontmatter';

import {
    EPILOG_DATASET_LANGUAGE_ID,
    EPILOG_RULESET_LANGUAGE_ID,
    EPILOG_METADATA_LANGUAGE_ID,
    FILE_EXTENSION_TO_LANGUAGE_ID
} from './language_ids';    



// Functions to resolve the full content of a ruleset, dataset, or metadata file, as determined by the files it links to in its frontmatter
// Note: Validates that the referenced files exist, but doesn't check their extensions. Leaves that to the Language Server's getDiagnostics.
// Note 2: Assumes the frontmatter is well-formed.
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

    // Get the file language id from the file extension for the initial file
    const initialFileLanguageId = FILE_EXTENSION_TO_LANGUAGE_ID.get(fileExtension);
    if (initialFileLanguageId === undefined) {
        console.error(`File type ${fileExtension} does not have a valid epilog language id: ${filepath}`);
        return "";
    }

    // Keep a queue of files to resolve, starting with the initial file
    let visitedFiles: string[] = [];

    let filesToResolve: string[] = [filepath];

    let fullFileContent = "";

    while (filesToResolve.length > 0) {
        const currFilepath = filesToResolve.shift();
        const currFileDir = path.dirname(currFilepath); // Need this to correctly resolve the relative filepaths in the frontmatter

        // Verify the file exists
        if (!fs.existsSync(currFilepath)) {
            console.error(`File does not exist: ${currFilepath}`);
            continue;
        }

        // If the file has already been visited, skip it. This means there's a cycle.
        if (visitedFiles.includes(currFilepath)) {
            console.warn(`Cycle detected at ${currFilepath} when resolving file contents for ${filepath}`);
            continue;
        }

        // Add the file to the visited files
        visitedFiles.push(currFilepath);

        // Get the file content
        const docText = fs.readFileSync(currFilepath, 'utf8');
        const postFrontmatterText = resolveGetPostFrontmatterFileContent(docText).trim();
        fullFileContent += postFrontmatterText + "\n";
        
        // Parse the frontmatter
        const frontmatterFieldsToVals = parseFrontmatter(getFrontmatter(docText));

        // Based on the language id, get the files to resolve from the frontmatter
        let additionalRelFilepathsToResolve: string[] = [];
        switch (initialFileLanguageId) {
            case EPILOG_DATASET_LANGUAGE_ID:
                additionalRelFilepathsToResolve = frontmatterFieldsToVals.get('data') ?? [];
                break;
            case EPILOG_RULESET_LANGUAGE_ID :
                additionalRelFilepathsToResolve = frontmatterFieldsToVals.get('rules') ?? [];
                break;
            case EPILOG_METADATA_LANGUAGE_ID :
                additionalRelFilepathsToResolve = frontmatterFieldsToVals.get('metadata') ?? [];
                break;
            default:
                console.error(`Can't resolve full file content for files with type ${initialFileLanguageId}: ${filepath}`);
                return "";
        }

        // Add the current file's directory to the front of the filepaths to make them absolute
        filesToResolve.push(...(additionalRelFilepathsToResolve.map(relFilepath => path.join(currFileDir, relFilepath))));
    }

    return fullFileContent;
}

function resolveGetPostFrontmatterFileContent(docText: string): string {
    // Get the frontmatter
    const frontmatter = getFrontmatter(docText);
    
    // Get the text after the frontmatter
    const textAfterFrontmatter = docText.slice(frontmatter.length);
    
    return textAfterFrontmatter; 
}