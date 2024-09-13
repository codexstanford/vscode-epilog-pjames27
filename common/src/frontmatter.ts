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