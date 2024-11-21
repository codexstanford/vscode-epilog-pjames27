"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFrontmatter = exports.frontmatterToMap = exports.getFrontmatter = exports.hasFrontmatter = void 0;
const yamlFrontmatterRegex = /^---\s*\n(?:(?!---)[^\n]*\n)*---/;
function hasFrontmatter(text) {
    return yamlFrontmatterRegex.test(text);
}
exports.hasFrontmatter = hasFrontmatter;
function getFrontmatter(text) {
    let frontmatter = text.match(yamlFrontmatterRegex);
    if (frontmatter === null) {
        return "";
    }
    return frontmatter[0];
}
exports.getFrontmatter = getFrontmatter;
function frontmatterToMap(frontmatter) {
    const frontmatterLines = frontmatter.split('\n');
    return new Map(frontmatterLines.map(line => {
        const [key, value] = line.split(':');
        return [key.trim(), value.trim()];
    }));
}
exports.frontmatterToMap = frontmatterToMap;
// Parses the frontmatter and returns a map of the fields to lists of strings, where the lists contain field values
// The map is of the form {fieldName: [value1, value2, ...]}
// Fields and values are formatted like:
// field name:
//    - value1
//    - value2
//    - ...
// "
function parseFrontmatter(frontmatter) {
    const frontmatterLines = frontmatter.split('\n');
    let fieldsToVals = new Map();
    let currentField = null;
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
            // Invalid line
            if (valueLine === null) {
                continue;
            }
            // Line is a value, but comes before any field
            if (currentField === null) {
                continue;
            }
            // Line is a value that follows a field, so add the value to the current field
            const value = valueLine[0].trim().slice(2);
            fieldsToVals.get(currentField)?.push(value);
            continue;
        }
        // Line is a field, so remove the colon from the field
        let fieldName = field[0].slice(0, -2);
        // If the field is already in the map, ignore it
        if (fieldsToVals.has(fieldName)) {
            continue;
        }
        // If the field is not already in the map, add it and update the current field
        fieldsToVals.set(fieldName, []);
        currentField = fieldName;
    }
    return fieldsToVals;
}
exports.parseFrontmatter = parseFrontmatter;
//# sourceMappingURL=frontmatter.js.map