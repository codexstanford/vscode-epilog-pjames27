"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiagnostics = void 0;
const node_1 = require("vscode-languageserver/node");
const fs = require("fs");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const frontmatter_js_1 = require("../../common/out/frontmatter.js");
const language_ids_js_1 = require("../../common/out/language_ids.js");
// Maps a language id to the set of YAML frontmatter fields that are relevant for files with that language id
const languageIdToRelevantFields = new Map([
    [language_ids_js_1.EPILOG_LANGUAGE_ID,
        { required: ['metadata'], optional: ['epilog-file-type'] }
    ],
    [language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID,
        { required: ['metadata'], optional: ['epilog-file-type'] }
    ],
    [language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID,
        { required: ['metadata'], optional: ['epilog-file-type'] }
    ],
    [language_ids_js_1.EPILOG_METADATA_LANGUAGE_ID,
        { required: [], optional: ['metadata', 'epilog-file-type'] }
    ],
    [language_ids_js_1.EPILOG_SCRIPT_LANGUAGE_ID,
        { required: [], optional: [] }
    ]
]);
// Get all the diagnostics for file with an epilog-relevant language id
function getDiagnostics(textDocument) {
    const docText = textDocument.getText();
    // Get YAML frontmatter diagnostics
    let [yamlDiagnostics, relevantFrontmatterFieldValues] = validateDocYamlFrontmatter(textDocument, docText);
    // If the metadata field is specified for this file, get metadata diagnostics
    let metadataDiagnostics = [];
    if (relevantFrontmatterFieldValues.has('metadata')) {
        metadataDiagnostics = validateDocAgainstMetadata(textDocument, docText, relevantFrontmatterFieldValues);
    }
    // Return all diagnostics
    return [...yamlDiagnostics, ...metadataDiagnostics];
}
exports.getDiagnostics = getDiagnostics;
function validateDocYamlFrontmatter(textDocument, docText) {
    let yamlDiagnostics = [];
    let frontmatterFieldValues = new Map();
    const requiredFields = languageIdToRelevantFields.get(textDocument.languageId)?.required ?? [];
    // Validate whether there is frontmatter if there are required fields
    if (!(0, frontmatter_js_1.hasFrontmatter)(docText)) {
        if (requiredFields.length > 0) {
            yamlDiagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 1, character: 0 }
                },
                message: 'Missing YAML frontmatter',
                source: 'epilog',
                code: '25'
            });
        }
        return [yamlDiagnostics, frontmatterFieldValues];
    }
    // If there is frontmatter, validate its form
    const frontmatter = (0, frontmatter_js_1.getFrontmatter)(docText);
    const frontmatterLines = frontmatter.split('\n');
    const [fieldDiagnostics, fieldsToValsWithLineNums] = validateFrontmatterLines(frontmatterLines);
    yamlDiagnostics.push(...fieldDiagnostics);
    // Validate that all required fields are present
    let missingFields = [];
    for (const field of requiredFields) {
        if (!fieldsToValsWithLineNums.has(field)) {
            missingFields.push(field);
        }
    }
    if (missingFields.length > 0) {
        yamlDiagnostics.push({
            severity: node_1.DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 1, character: 0 }
            },
            message: 'Missing required fields: ' + missingFields.join(', '),
            source: 'epilog'
        });
    }
    // Validate the values of the fields that are present and relevant
    const optionalFields = languageIdToRelevantFields.get(textDocument.languageId)?.optional ?? [];
    const relevantFields = new Set([...requiredFields, ...optionalFields]);
    if (relevantFields.has('metadata') && fieldsToValsWithLineNums.has('metadata')) {
        const [metadataValueDiagnostics, updatedFrontmatterFieldValues] = validateFrontmatterValues_metadata(textDocument, frontmatterLines, fieldsToValsWithLineNums.get('metadata') ?? [], frontmatterFieldValues);
        yamlDiagnostics.push(...metadataValueDiagnostics);
        frontmatterFieldValues = updatedFrontmatterFieldValues;
    }
    return [yamlDiagnostics, frontmatterFieldValues];
}
// Parses the frontmatter and returns a list of diagnostics and a map of the fields to a tuple containing (their values, and the line numbers of those values)
// The map is of the form {fieldName: [value, line number]}
// Generates the following diagnostics:
// - Warnings for duplicate fields
// - Warnings for invalid lines in the frontmatter (i.e. neither a field nor a value)
// - Warnings for values preceding fields
function validateFrontmatterLines(frontmatterLines) {
    let fieldDiagnostics = [];
    let fieldsToValsWithLineNums = new Map();
    let currentField = null;
    // Ignore the first and last lines, since they are the frontmatter delimiters
    for (let i = 1; i < frontmatterLines.length - 1; i++) {
        const line = frontmatterLines[i];
        // Check if the line is a field
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
                    severity: node_1.DiagnosticSeverity.Warning,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: Number.MAX_VALUE }
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
                    severity: node_1.DiagnosticSeverity.Warning,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: Number.MAX_VALUE }
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
            severity: node_1.DiagnosticSeverity.Warning,
            range: {
                start: { line: i, character: 0 },
                end: { line: i, character: Number.MAX_VALUE }
            },
            message: 'Duplicate field "' + fieldName + '" in the frontmatter',
            source: 'epilog'
        });
    }
    return [fieldDiagnostics, fieldsToValsWithLineNums];
}
function validateFrontmatterValues_metadata(textDocument, frontmatterLines, metadataValsWithLineNums, frontmatterFieldValues) {
    let metadataValueDiagnostics = [];
    // Add the metadata field values to the frontmatter field values
    frontmatterFieldValues.set('metadata', []);
    // Convert the textDocument uri to a filepath
    const documentDir = path.dirname(vscode_uri_1.URI.parse(textDocument.uri).fsPath);
    // Validate the metadata field values
    for (const [filepath, lineNumber] of metadataValsWithLineNums) {
        // Check that the value is a valid metadata file
        // Does it end in .metadata
        if (!filepath.endsWith('.metadata')) {
            let startIndex = frontmatterLines[lineNumber].indexOf(filepath);
            metadataValueDiagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: lineNumber, character: startIndex },
                    end: { line: lineNumber, character: startIndex + filepath.length }
                },
                message: 'Filepath doesn\'t point to a .metadata file',
                source: 'epilog'
            });
            continue;
        }
        // Check that the file exists in the workspace
        let absPath = path.join(documentDir, filepath);
        if (!fs.existsSync(absPath)) {
            let startIndex = frontmatterLines[lineNumber].indexOf(filepath);
            metadataValueDiagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: lineNumber, character: startIndex },
                    end: { line: lineNumber, character: startIndex + filepath.length }
                },
                message: "The file " + absPath + " doesn't exist",
                source: 'epilog'
            });
            continue;
        }
        // It exists and is a valid metadata file, so add it to the frontmatter field values
        frontmatterFieldValues.get('metadata')?.push(absPath);
    }
    return [metadataValueDiagnostics, frontmatterFieldValues];
}
// Validates the file against all specified metadata files
function validateDocAgainstMetadata(textDocument, docText, frontmatterFieldsToValues) {
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
    let metadataDiagnostics = [];
    return metadataDiagnostics;
}
//# sourceMappingURL=diagnostics.js.map