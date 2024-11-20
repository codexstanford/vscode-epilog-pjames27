import {
    Diagnostic,
    DiagnosticSeverity
} from 'vscode-languageserver/node';

import * as fs from 'fs';
import * as path from 'path';   

import {
	TextDocument,
} from 'vscode-languageserver-textdocument';

import { URI } from 'vscode-uri';

import {
    hasFrontmatter,
    getFrontmatter
} from '../../common/out/frontmatter.js';

import {
    EPILOG_LANGUAGE_ID,
    EPILOG_RULESET_LANGUAGE_ID,
    EPILOG_DATASET_LANGUAGE_ID,
    EPILOG_METADATA_LANGUAGE_ID,
    EPILOG_SCRIPT_LANGUAGE_ID
} from '../../common/out/language_ids.js';

import { validateDocWithFiletype_EpilogScript } from './diagnostics/validate_epilogscript';


type FrontMatterFieldsToValues = Map<string, string[]>;

const frontmatterFieldNamesToFileExtensions = new Map<string, string>([
    ['metadata', '.metadata'],
    ['rules', '.hrf'],
    ['data', '.hdf']
]);

// Maps a language id to the set of YAML frontmatter fields that are relevant for files with that language id
const languageIdToRelevantFields = new Map<string, {required: string[], optional: string[]}>([
    [EPILOG_LANGUAGE_ID, 
        {required: [], optional: ['metadata']}
    ],
    [EPILOG_RULESET_LANGUAGE_ID, 
        {required: [], optional: ['metadata', 'rules']}
    ],
    [EPILOG_DATASET_LANGUAGE_ID, 
        {required: [], optional: ['metadata', 'data']}
    ],
    [EPILOG_METADATA_LANGUAGE_ID, 
        {required: [], optional: ['metadata']}
    ],
    [EPILOG_SCRIPT_LANGUAGE_ID, 
        {required: [], optional: []}
    ]
]);

// Get all the diagnostics for file with an epilog-relevant language id
export function getDiagnostics(
    textDocument: TextDocument
): Diagnostic[] {
    const docText = textDocument.getText();

    // Get YAML frontmatter diagnostics
    let [yamlDiagnostics, relevantFrontmatterFieldValues] = validateDocYamlFrontmatter(textDocument, docText);

    // If the metadata field is specified for this file, get metadata diagnostics
    let metadataDiagnostics: Diagnostic[] = [];
    if (relevantFrontmatterFieldValues.has('metadata')) {
        metadataDiagnostics = validateDocAgainstMetadata(textDocument, docText, relevantFrontmatterFieldValues);
    }

    // Get filetype-specific diagnostics
    let filetypeSpecificDiagnostics: Diagnostic[] = [];
    switch (textDocument.languageId) {
        case EPILOG_SCRIPT_LANGUAGE_ID:
            filetypeSpecificDiagnostics = validateDocWithFiletype_EpilogScript(textDocument, docText);
            break;
        default:
            break;
    }

    // Return all diagnostics
    return [...yamlDiagnostics, ...metadataDiagnostics, ...filetypeSpecificDiagnostics];
}

function validateDocYamlFrontmatter(
    textDocument: TextDocument,
    docText: string,
): [Diagnostic[], FrontMatterFieldsToValues] {
    let yamlDiagnostics: Diagnostic[] = [];
    let frontmatterFieldValues = new Map<string, string[]>();

    const requiredFields = languageIdToRelevantFields.get(textDocument.languageId)?.required ?? [];

    // If there are required fields, validate whether there is frontmatter
    if (!hasFrontmatter(docText)) {
        if (requiredFields.length > 0) {
            yamlDiagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: 0, character: 0},
                    end: {line: 1, character: 0}
                },
                message: 'Missing YAML frontmatter',
                source: 'epilog',
                code: '25'
            });
        }
        return [yamlDiagnostics, frontmatterFieldValues];
    }

    // If there is frontmatter, validate its form
    const frontmatter = getFrontmatter(docText);
    const frontmatterLines = frontmatter.split('\n');
    
    const [fieldDiagnostics, fieldsToValsWithLineNums] = validateAndParseFrontmatterLines(frontmatterLines);
    yamlDiagnostics.push(...fieldDiagnostics);
    
    // Validate that all required fields are present
    let missingFields: string[] = [];
    for (const field of requiredFields) {
        if (!fieldsToValsWithLineNums.has(field)) {
            missingFields.push(field);
        }
    }
    if (missingFields.length > 0) {
        yamlDiagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: {line: 0, character: 0},
                end: {line: 1, character: 0}
            },
            message: 'Missing required fields: ' + missingFields.join(', '),
            source: 'epilog'
        });
    }
    

    // Validate the values of the fields that are present and relevant
    const optionalFields = languageIdToRelevantFields.get(textDocument.languageId)?.optional ?? [];
    const relevantFields = new Set([...requiredFields, ...optionalFields]);
    
    for (const fieldName of relevantFields) {
        // If values for the field should be files, validate them
        if (frontmatterFieldNamesToFileExtensions.has(fieldName)) {
            const [valueDiagnostics, updatedFrontmatterFieldValues] = validateFrontmatterValues_files(textDocument, frontmatterLines, fieldName, fieldsToValsWithLineNums.get(fieldName) ?? [], frontmatterFieldValues);
            yamlDiagnostics.push(...valueDiagnostics);
            frontmatterFieldValues = updatedFrontmatterFieldValues;
        }
    }

    return [yamlDiagnostics, frontmatterFieldValues];
}


// Parses the frontmatter and returns a list of diagnostics and a map of the fields to lists of tuples, where the tuples contain (the field values, the line numbers of those values)
// The map is of the form {fieldName: [value, line number][]}
// Generates the following diagnostics:
// - Warnings for duplicate fields
// - Warnings for invalid lines in the frontmatter (i.e. neither a field nor a value)
// - Warnings for values preceding fields
// Fields and values are formatted like:
// field name:
//    - value1
//    - value2
//    - ...
// "
function validateAndParseFrontmatterLines(frontmatterLines: string[]): [Diagnostic[], Map<string, [string, number][]>] {
    let fieldDiagnostics: Diagnostic[] = [];
    let fieldsToValsWithLineNums = new Map<string, [string, number][]>();
    let currentField: string | null = null;

    // Ignore the first and last lines, since they are the frontmatter delimiters
    for (let i = 1; i < frontmatterLines.length - 1; i++) {
        const line = frontmatterLines[i];
        // Check if the line is a field, i.e. a whitespace-free string ending with a colon, then any whitespace
        const field = line.match(/^[^\s:]+:\s*$/);
        if (field === null) {
            // If not, must be either an empty line or a value
            // Check if the line is entirely whitespace
            if (line.trim() === '') {
                continue;
            }
            // Otherwise, it must be a value, which is any string starting with a tab, a dash and a space
            const valueLine = line.match(/^(?:\t|    )- \S.*/);
            if (valueLine === null) {
                // Warn that there is an invalid line in the frontmatter
                fieldDiagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: {line: i, character: 0},
                        end: {line: i, character: Number.MAX_VALUE}
                    },
                    message: 'Invalid frontmatter line',
                    source: 'epilog'
                });
                continue;
            }
                // If it is a value, then it must come after a field
            if (currentField === null) {
                // Warn that there is a value without a field
                fieldDiagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: {line: i, character: 0},
                        end: {line: i, character: Number.MAX_VALUE}
                    },
                    message: 'Value specified before any fields',
                    source: 'epilog'
                });
                continue;
            }

            // Follows a field, so add the value to the current field
            const value = valueLine[0].trim().slice(2);
            fieldsToValsWithLineNums.get(currentField)?.push([value, i]);
            continue;
        }
        // Remove the colon from the field
        let fieldName = field[0].slice(0, -2);
        // If is a field and not already in the map, add it and update the current field
        if (!fieldsToValsWithLineNums.has(fieldName)) {
            fieldsToValsWithLineNums.set(fieldName, []);
            currentField = fieldName;
            continue;
        }
        // If is a duplicate field, report it
        fieldDiagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
                start: {line: i, character: 0},
                end: {line: i, character: Number.MAX_VALUE}
            },
            message: 'Duplicate field "' + fieldName + '" in the frontmatter', 
            source: 'epilog'
        });
    }

    return [fieldDiagnostics, fieldsToValsWithLineNums];
}

// Validate that the frontmatter field values point to real files, and that they have the proper file extension
function validateFrontmatterValues_files(
    textDocument: TextDocument,
    frontmatterLines: string[],
    fieldName: string,
    fieldValuesWithLineNums: [string, number][],
    frontmatterFieldValues: FrontMatterFieldsToValues,
): [Diagnostic[], FrontMatterFieldsToValues] {

    let valueDiagnostics: Diagnostic[] = [];
    // Add the fieldname field values to the frontmatter field values
    frontmatterFieldValues.set(fieldName, []);

    // Convert the textDocument uri to a filepath
    const documentDir = path.dirname(URI.parse(textDocument.uri).fsPath);

    const expectedExtension = frontmatterFieldNamesToFileExtensions.get(fieldName);

    if (expectedExtension === undefined) {
        console.error("Values for frontmatter field " + fieldName + " should not be files.");
        return [valueDiagnostics, frontmatterFieldValues];
    }

    // Validate the fieldname field values
    for (const [filepath, lineNumber] of fieldValuesWithLineNums) {
        // Check that the value is a valid file of its type
        
        // Check its extension
        if (!filepath.endsWith(expectedExtension)) {
            let startIndex = frontmatterLines[lineNumber].indexOf(filepath);
            valueDiagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: lineNumber, character: startIndex},
                    end: {line: lineNumber, character: startIndex + filepath.length}
                },
                message: 'Filepath doesn\'t point to a ' + expectedExtension + ' file',
                source: 'epilog'
            });
            continue;
        }
        // Check that the file exists in the workspace
        let absPath = path.join(documentDir, filepath);
        if (!fs.existsSync(absPath)) {
            let startIndex = frontmatterLines[lineNumber].indexOf(filepath);
            valueDiagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: {line: lineNumber, character: startIndex},
                    end: {line: lineNumber, character: startIndex + filepath.length}
                },
                message: "The file " + absPath + " doesn't exist",
                source: 'epilog'
            });
            continue;
        }
        // The file exists and is a valid file of the expected type, so add it to the frontmatter field values
        frontmatterFieldValues.get(fieldName)?.push(absPath);
    }
    return [valueDiagnostics, frontmatterFieldValues];
}

// Validates the file against all specified metadata files (TODO)
function validateDocAgainstMetadata(
    textDocument: TextDocument,
    docText: string,
    frontmatterFieldsToValues: FrontMatterFieldsToValues,
): Diagnostic[] {
    // Must have metadata field
    if (frontmatterFieldsToValues.has('metadata') === undefined) {
        return [];
    }

    const metadataFiles = frontmatterFieldsToValues.get('metadata') ?? [];

    // Compute the union of the metadata files

        // Ensure that the metadata files are valid
        // Ensure they are compatible with one another

    // Validate against each metadata file
    for (const metadataFilepath of metadataFiles) {
        const metadataFileText = fs.readFileSync(metadataFilepath, 'utf8');

        //console.log(metadataFileText);
    }


    let metadataDiagnostics: Diagnostic[] = [];
    

    return metadataDiagnostics;
}
