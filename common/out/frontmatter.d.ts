export declare function hasFrontmatter(text: string): boolean;
export declare function getFrontmatter(text: string): string;
export declare function frontmatterToMap(frontmatter: string): Map<string, string>;
export declare function parseFrontmatter(frontmatter: string): Map<string, string[]>;
export declare function getAbsFilepathsLinkedFromFrontmatterFields(initialAbsFilePath: string, frontmatterFieldsToTraverse: string[], recursive?: boolean): Set<string>;
