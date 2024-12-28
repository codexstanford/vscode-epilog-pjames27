import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
    getFrontmatter,
    getAbsFilepathsLinkedFromFrontmatterFields
} from '../../common/out/frontmatter.js';

import {
    EPILOG_DATASET_LANGUAGE_ID,
    EPILOG_RULESET_LANGUAGE_ID,
    EPILOG_METADATA_LANGUAGE_ID,
    FILE_EXTENSION_TO_LANGUAGE_ID
} from '../../common/out/language_ids.js';    


function universalFilesExist(): boolean {
    const epilogSettings = vscode.workspace.getConfiguration('epilog.universal');
    const universalRulesPath = epilogSettings.get('rules') as string;
    const universalDataPath = epilogSettings.get('data') as string;
    const universalBerlitzPath = epilogSettings.get('berlitz') as string;
    const universalMetadataPath = epilogSettings.get('metadata') as string;

    return fs.existsSync(universalRulesPath) && fs.existsSync(universalDataPath) && fs.existsSync(universalBerlitzPath) && fs.existsSync(universalMetadataPath);
}

// Resolves the full content of a ruleset, dataset, or metadata file, as determined by the files it links to in its frontmatter
// Note: Validates that the referenced files exist, but doesn't check their extensions. Leaves that to the Language Server's getDiagnostics.
export function resolveFullFileContent(absFilePath: string, includeUniversalFiles: boolean = false): string {
    // Verify the file exists
    if (!fs.existsSync(absFilePath)) {
        console.error(`File does not exist: ${absFilePath}`);
        return "";
    }

    // Get the file extension
    const fileExtension = path.extname(absFilePath);

    // Get the file language id from the file extension for the initial file
    const initialFileLanguageId = FILE_EXTENSION_TO_LANGUAGE_ID.get(fileExtension);
    if (initialFileLanguageId === undefined) {
        console.error(`File type ${fileExtension} does not have a valid epilog language id: ${absFilePath}`);
        return "";
    }


    let frontmatterFieldToTraverse: string = "";
    switch (initialFileLanguageId) {
        case EPILOG_DATASET_LANGUAGE_ID:
            frontmatterFieldToTraverse = 'data';
            break;
        case EPILOG_RULESET_LANGUAGE_ID :
            frontmatterFieldToTraverse = 'rules';
            break;
        case EPILOG_METADATA_LANGUAGE_ID :
            frontmatterFieldToTraverse = 'metadata';
            break;
        default:
            console.error(`Can't resolve full file content for files with type ${initialFileLanguageId}: ${absFilePath}`);
            return "";
    }

    // Get the set of absolute filepaths to visit, starting with the initial file and including all the files it links to, recursively
    let linkedAbsFilepaths = getAbsFilepathsLinkedFromFrontmatterFields(absFilePath, [frontmatterFieldToTraverse], true);
    // The initial file will only be in the linkedAbsFilepaths set if there's a cycle. We remove it to avoid adding its content twice.
    // And we remove it here then construct the array, instead of adding the initial file to the set then constructing the array, to ensure the initial file's content is first in the output
    linkedAbsFilepaths.delete(absFilePath); 
    let absFilepathsToVisit: string[] = [absFilePath, ...Array.from(linkedAbsFilepaths)];

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

    return fullFileContent;
}

function resolveGetPostFrontmatterFileContent(docText: string): string {
    // Get the frontmatter
    const frontmatter = getFrontmatter(docText);
    
    // Get the text after the frontmatter
    const textAfterFrontmatter = docText.slice(frontmatter.length);
    
    return textAfterFrontmatter; 
}