import * as fs from 'fs';
import * as path from 'path';

const yamlFrontmatterRegex = /^---\s*\n(?:(?!---)[^\n]*\n)*---/;

export function hasFrontmatter(text: string): boolean {
    return yamlFrontmatterRegex.test(text);
}

export function getFrontmatter(text: string): string {
    let frontmatter = text.match(yamlFrontmatterRegex);

    if (frontmatter === null) {
        return "";
    }

    return frontmatter[0];
}

export function frontmatterToMap(frontmatter: string): Map<string, string> {
    const frontmatterLines = frontmatter.split('\n');
    return new Map(frontmatterLines.map(line => {
        const [key, value] = line.split(':');
        return [key.trim(), value.trim()];
    }));
}

// Parses the frontmatter and returns a map of the fields to lists of strings, where the lists contain field values
// The map is of the form {fieldName: [value1, value2, ...]}
// Fields and values are formatted like:
// field name:
//    - value1
//    - value2
//    - ...
// "
export function parseFrontmatter(frontmatter: string): Map<string, string[]> {
    const frontmatterLines = frontmatter.split('\n');
    let fieldsToVals = new Map<string, string[]>();
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

// Returns a set of the absolute filepaths linked from the "frontmatterFieldsToTraverse" frontmatter fields of the initial file
// Doesn't include the initial file in the returned set
// If recursive == true, then the function will recursively traverse the filepaths linked from the frontmatter fields of the linked files
export function getAbsFilepathsLinkedFromFrontmatterFields(initialAbsFilePath: string, frontmatterFieldsToTraverse: string[], recursive: boolean = false): Set<string> {
    
    let visitedAbsFilepaths: Set<string> = new Set();

    let absFilepathsToVisit: string[] = [initialAbsFilePath];
    let absFilepathsLinked: Set<string> = new Set();
    
    while (absFilepathsToVisit.length > 0) {
        const currAbsFilepath = absFilepathsToVisit.shift();
        const currFileDir = path.dirname(currAbsFilepath); // Need this to correctly resolve the relative filepaths in the frontmatter
        
        // Verify the file exists
        if (!fs.existsSync(currAbsFilepath)) {
            console.error(`File does not exist: ${currAbsFilepath}`);
            continue;
        }

        // If the file has already been visited, skip it. This means there's a cycle.
        if (visitedAbsFilepaths.has(currAbsFilepath)) {
            console.warn(`Cycle detected at ${currAbsFilepath} when resolving file contents for ${initialAbsFilePath}`);
            continue;
        }

        visitedAbsFilepaths.add(currAbsFilepath);

        // Get the frontmatter fields and their values
        const fileText = fs.readFileSync(currAbsFilepath, 'utf8');
        const frontmatterFieldsToVals = parseFrontmatter(getFrontmatter(fileText));

        // Get the relative filepaths from the specified frontmatter fields
        for (const field of frontmatterFieldsToTraverse) {
            const fieldValues = frontmatterFieldsToVals.get(field);
            if (fieldValues === undefined) {
                continue;
            }
            // Add the absolute filepaths to the linked filepaths, and if recursive == true, add the filepaths to the set of filepaths to visit
            for (const relFilepath of fieldValues) {
                const absFilepath = path.join(currFileDir, relFilepath);
                absFilepathsLinked.add(absFilepath);
                if (recursive) {
                    absFilepathsToVisit.push(absFilepath);
                }
            }
        }
    }

    return absFilepathsLinked;
}
