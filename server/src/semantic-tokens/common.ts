import { ParserObject as AST } from "../lexers-parsers-types";

export type ParsedToken = {
    line: number;
    start: number;
    length: number;
    type: string;
    modifiers: string[];
}

export const TYPES_TO_IGNORE = ['WHITESPACE', 'OPEN_PAREN', 'CLOSE_PAREN', 'OPEN_BRACKET', 'CLOSE_BRACKET', 'COMMA', 'PERIOD', 'LIST_SEPARATOR', 'RULE_SEPARATOR_NECK', 'AMPERSAND', 'DOUBLE_COLON', 'DOUBLE_ARROW', 'DEFINITION_SEPARATOR'];

export const BUILT_IN_VALUES = ['nil', 'true', 'false'];

export function consume(ast: AST, tokenTypeToUse: string = "", tokenModifiersToUse: string[] = []): ParsedToken[] {
    const parsedTokens: ParsedToken[] = [];

    if (TYPES_TO_IGNORE.includes(ast.type)) {
        return parsedTokens;
    }

    // If the token has no children, it is a leaf
    if (ast.children === undefined || ast.children.length === 0) {
        parsedTokens.push({
            line: ast.line - 1, // Line numbers are 1-indexed in the AST, but 0-indexed in LSP
            start: ast.start,
            length: ast.end - ast.start,
            type: tokenTypeToUse,
            modifiers: tokenModifiersToUse
        });
        return parsedTokens;
    }

    // If the token has children, we need to consume them
    for (const child of ast.children) {
        parsedTokens.push(...consume(child, tokenTypeToUse, tokenModifiersToUse));
    }
    
    return parsedTokens;
}

export function handleBuiltinValue(ast: AST): ParsedToken[] {
    if (!BUILT_IN_VALUES.includes(ast.content)) {
        console.error('Expected builtin value but got: ', ast.content);
        return [];
    }
    return consume(ast, 'variable', ['readonly', 'defaultLibrary']);
}

