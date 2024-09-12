"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiagnostics = void 0;
const node_1 = require("vscode-languageserver/node");
const fs = require("fs");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const constants_1 = require("./constants");
const yamlFrontmatterRegex = /^---\s*\n(?:(?!---)[^\n]*\n)*---/;
const languageIdToRelevantFields = new Map([
    [constants_1.EPILOG_LANGUAGE_ID,
        { required: ['metadata', 'epilog-file-type'], optional: [] }
    ],
    [constants_1.EPILOG_RULESET_LANGUAGE_ID,
        { required: ['metadata', 'epilog-file-type'], optional: [] }
    ],
    [constants_1.EPILOG_DATASET_LANGUAGE_ID,
        { required: ['metadata', 'epilog-file-type'], optional: [] }
    ],
    [constants_1.EPILOG_METADATA_LANGUAGE_ID,
        { required: ['epilog-file-type'], optional: ['metadata'] }
    ]
]);
function hasFrontmatter(docText) {
    return yamlFrontmatterRegex.test(docText);
}
function getFrontmatter(docText) {
    let frontmatter = docText.match(yamlFrontmatterRegex);
    if (frontmatter === null) {
        return "";
    }
    return frontmatter[0];
}
// Parses the frontmatter and returns list of diagnostics and a map of the fields to (their values and the line numbers of those values)
// The map is of the form {fieldName: [value, line number]}
// Generates the following diagnostics:
// - Warnings for duplicate fields
// - Warnings for invalid lines in the frontmatter (i.e. neither a field nor a value)
// - Warnings for values preceding fields
function parseFrontmatterFields(frontmatter) {
    let frontmatterLines = frontmatter.split('\n');
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
function validateMetadataValues(textDocument, frontmatterLines, metadataValsWithLineNums, frontmatterFieldValues) {
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
function validateYamlFrontmatter(textDocument, docText) {
    let yamlDiagnostics = [];
    let frontmatterFieldValues = new Map();
    const requiredFields = languageIdToRelevantFields.get(textDocument.languageId)?.required;
    // Validate whether there is frontmatter if there are required fields
    if (!hasFrontmatter(docText)) {
        if (requiredFields !== undefined && requiredFields.length > 0) {
            yamlDiagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 1, character: 0 }
                },
                message: 'No YAML frontmatter detected',
                source: 'epilog',
            });
        }
        return [yamlDiagnostics, frontmatterFieldValues];
    }
    const frontmatter = getFrontmatter(docText);
    const frontmatterLines = frontmatter.split('\n');
    const [fieldDiagnostics, fieldsToValsWithLineNums] = parseFrontmatterFields(frontmatter);
    yamlDiagnostics.push(...fieldDiagnostics);
    // Validate that all required fields are present
    for (const field of requiredFields ?? []) {
        if (!fieldsToValsWithLineNums.has(field)) {
            yamlDiagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 1, character: 0 }
                },
                message: 'Missing \'' + field + '\' field',
                source: 'epilog'
            });
        }
    }
    // Validate the values of the fields that are present and relevant
    const relevantFields = new Set([...(languageIdToRelevantFields.get(textDocument.languageId)?.required ?? []), ...(languageIdToRelevantFields.get(textDocument.languageId)?.optional ?? [])]);
    if (relevantFields.has('metadata') && fieldsToValsWithLineNums.has('metadata')) {
        const [metadataValueDiagnostics, updatedFrontmatterFieldValues] = validateMetadataValues(textDocument, frontmatterLines, fieldsToValsWithLineNums.get('metadata') ?? [], frontmatterFieldValues);
        yamlDiagnostics.push(...metadataValueDiagnostics);
        frontmatterFieldValues = updatedFrontmatterFieldValues;
    }
    return [yamlDiagnostics, frontmatterFieldValues];
}
// Validates the file against each specified metadata file
function getMetadataDiagnostics(textDocument, docText, frontmatterFieldsToValues) {
    // Must have metadata field
    if (frontmatterFieldsToValues.has('metadata') === undefined) {
        return [];
    }
    // Compute the union of the metadata files
    // Ensure that the metadata files are valid
    // Ensure they are compatible with one another
    // Validate against each metadata file
    for (const metadataFilepath of frontmatterFieldsToValues.get('metadata') ?? []) {
        const metadataFileText = fs.readFileSync(metadataFilepath, 'utf8');
        //console.log(metadataFileText);
    }
    let metadataDiagnostics = [];
    // Implement your metadata diagnostic logic here
    // This is a placeholder function, you'll need to add the actual implementation
    return metadataDiagnostics;
}
function getDiagnostics(textDocument, docText) {
    // Get YAML frontmatter diagnostics
    let [yamlDiagnostics, relevantFrontmatterFieldValues] = validateYamlFrontmatter(textDocument, docText);
    // If the metadata field is specified for this file, get metadata diagnostics
    let metadataDiagnostics = [];
    if (relevantFrontmatterFieldValues.has('metadata')) {
        metadataDiagnostics = getMetadataDiagnostics(textDocument, docText, relevantFrontmatterFieldValues);
    }
    // Return all diagnostics
    return [...yamlDiagnostics, ...metadataDiagnostics];
}
exports.getDiagnostics = getDiagnostics;
//# sourceMappingURL=diagnostics.js.map