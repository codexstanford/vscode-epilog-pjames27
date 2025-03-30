import { ParserObject as AST, RulesetParserObjectType } from "../lexers-parsers-types";


export const TYPES_TO_IGNORE = ['WHITESPACE', 'OPEN_PAREN', 'CLOSE_PAREN', 'OPEN_BRACKET', 'CLOSE_BRACKET', 'COMMA', 'PERIOD', 'LIST_SEPARATOR', 'RULE_SEPARATOR_NECK', 'AMPERSAND', 'DOUBLE_COLON', 'DOUBLE_ARROW', 'DEFINITION_SEPARATOR'];
export const BUILT_IN_VALUES = ['nil', 'true', 'false'];
export const BUILT_IN_PREDS = new Set(['member', 'same', 'distinct', 'evaluate']);


export interface NarrowedAST<T extends RulesetParserObjectType> extends AST {
    type: T;
}

export function isASTType<T extends RulesetParserObjectType>(ast: AST, type: T): ast is NarrowedAST<T> {
    return ast.type === type;
}

const NON_LEAF_TERM_TYPES: RulesetParserObjectType[] = ['TERM', 'COMPOUND_TERM', 'LIST_TERM', 'SIMPLE_TERM'];
type NonLeafTermType = typeof NON_LEAF_TERM_TYPES[number];
export function isNonLeafTermType(ast: AST): ast is NarrowedAST<NonLeafTermType> {
    return NON_LEAF_TERM_TYPES.includes(ast.type);
}

export function isNonTerminal<T extends AST>(ast: T): ast is T & {children: [AST, ...AST[]]} {
    return ast.children !== undefined && ast.children.length > 0;
}

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

export type ParsedToken = {
    line: number;
    start: number;
    length: number;
    type: string;
    modifiers: string[];
}

export function handleBuiltinValue(ast: AST): ParsedToken[] {
    if (!BUILT_IN_VALUES.includes(ast.content)) {
        console.error('Expected builtin value but got: ', ast.content);
        return [];
    }
    return consume(ast, 'variable', ['readonly', 'defaultLibrary']);
}

export function handleBuiltinPred(ast: AST): ParsedToken[] {
    if (!BUILT_IN_PREDS.has(ast.content)) {
        console.error('Expected builtin pred but got: ', ast.content);
        return [];
    }
    return consume(ast, 'function', ['defaultLibrary']);
}

export function handleBasePred(ast: AST): ParsedToken[] {
    return consume(ast, 'variable', []);
}


export function handleConstructor(ast: AST): ParsedToken[] {
    return consume(ast, 'struct');
}
