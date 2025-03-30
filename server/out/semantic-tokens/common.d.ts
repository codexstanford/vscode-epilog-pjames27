import { ParserObject as AST, RulesetParserObjectType } from "../lexers-parsers-types";
export declare const TYPES_TO_IGNORE: string[];
export declare const BUILT_IN_VALUES: string[];
export interface NarrowedAST<T extends RulesetParserObjectType> extends AST {
    type: T;
}
export declare function isASTType<T extends RulesetParserObjectType>(ast: AST, type: T): ast is NarrowedAST<T>;
declare const NON_LEAF_TERM_TYPES: RulesetParserObjectType[];
type NonLeafTermType = typeof NON_LEAF_TERM_TYPES[number];
export declare function isNonLeafTermType(ast: AST): ast is NarrowedAST<NonLeafTermType>;
export declare function isNonTerminal<T extends AST>(ast: T): ast is T & {
    children: [AST, ...AST[]];
};
export declare function consume(ast: AST, tokenTypeToUse?: string, tokenModifiersToUse?: string[]): ParsedToken[];
export type ParsedToken = {
    line: number;
    start: number;
    length: number;
    type: string;
    modifiers: string[];
};
export declare function handleBuiltinValue(ast: AST): ParsedToken[];
export declare const BASE_PRED_TOKEN_TYPE = "property";
export declare const BASE_PRED_TOKEN_MODIFIERS: never[];
export {};
