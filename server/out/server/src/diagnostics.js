"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiagnostics = void 0;
const node_1 = require("vscode-languageserver/node");
const fs = require("fs");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const yamlFrontmatterRegex = /^---\s*\n(?:(?!---)[^\n]*\n)*---/;
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
            // Comes after a field, so add the value to the current field 
            const value = valueLine[0].trim().slice(2);
            // Add the value to the current field
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
function getYamlFrontmatterDiagnostics(textDocument, docText) {
    let yamlDiagnostics = [];
    let frontmatterFieldValues = new Map();
    // Alert if no frontmatter is detected
    if (!hasFrontmatter(docText)) {
        yamlDiagnostics.push({
            severity: node_1.DiagnosticSeverity.Warning,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 1, character: 0 }
            },
            message: 'YAML frontmatter not detected on the first line of the document',
            source: 'epilog',
        });
        return [yamlDiagnostics, frontmatterFieldValues];
    }
    // Check for required fields in the frontmatter
    const frontmatter = getFrontmatter(docText);
    const [fieldDiagnostics, fieldsToValsWithLineNums] = parseFrontmatterFields(frontmatter);
    yamlDiagnostics.push(...fieldDiagnostics);
    // Metadata field checks
    // Check for the presence of the metadata field
    if (!fieldsToValsWithLineNums.has('metadata')) {
        yamlDiagnostics.push({
            severity: node_1.DiagnosticSeverity.Warning,
            range: {
                start: { line: 0, character: 0 },
                end: { line: frontmatter.split('\n').length - 1, character: 0 }
            },
            message: 'Missing metadata field',
            source: 'epilog'
        });
    }
    else {
        // Add the metadata field values to the frontmatter field values
        frontmatterFieldValues.set('metadata', []);
        // Check that the metadata field values are valid metadata files
        const metadataFieldValues = fieldsToValsWithLineNums.get('metadata');
        if (metadataFieldValues === undefined) {
            // Should never happen
            console.error('Metadata field isn\'t present');
            return [yamlDiagnostics, frontmatterFieldValues];
        }
        // Convert the textDocument uri to a filepath
        const documentDir = path.dirname(vscode_uri_1.URI.parse(textDocument.uri).fsPath);
        // Check that the metadata field values are valid, real metadata files
        for (const [filepath, lineNumber] of metadataFieldValues) {
            // Check that the value is a valid metadata file
            // Does it end in .metadata
            if (!filepath.endsWith('.metadata')) {
                yamlDiagnostics.push({
                    severity: node_1.DiagnosticSeverity.Warning,
                    range: {
                        start: { line: lineNumber, character: 0 },
                        end: { line: lineNumber, character: Number.MAX_VALUE }
                    },
                    message: 'Filepath doesn\'t point to a .metadata file',
                    source: 'epilog'
                });
                continue;
            }
            // Check that the file exists in the workspace
            let absPath = path.join(documentDir, filepath);
            if (!fs.existsSync(absPath)) {
                yamlDiagnostics.push({
                    severity: node_1.DiagnosticSeverity.Warning,
                    range: {
                        start: { line: lineNumber, character: 0 },
                        end: { line: lineNumber, character: Number.MAX_VALUE }
                    },
                    message: "The file " + absPath + " doesn't exist",
                    source: 'epilog'
                });
                continue;
            }
            // It exists and is a valid metadata file, so add it to the frontmatter field values
            frontmatterFieldValues.get('metadata')?.push(absPath);
        }
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
        console.log(metadataFileText);
    }
    let metadataDiagnostics = [];
    // Implement your metadata diagnostic logic here
    // This is a placeholder function, you'll need to add the actual implementation
    return metadataDiagnostics;
}
function getDiagnostics(textDocument, docText) {
    // Get YAML frontmatter diagnostics
    let [yamlDiagnostics, frontmatterFieldValues] = getYamlFrontmatterDiagnostics(textDocument, docText);
    // Get metadata diagnostics
    let metadataDiagnostics = getMetadataDiagnostics(textDocument, docText, frontmatterFieldValues);
    // Return all diagnostics
    return [...yamlDiagnostics, ...metadataDiagnostics];
}
exports.getDiagnostics = getDiagnostics;
//# sourceMappingURL=diagnostics.js.map