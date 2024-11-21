"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrontmatter = exports.hasFrontmatter = void 0;
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
//# sourceMappingURL=frontmatter.js.map