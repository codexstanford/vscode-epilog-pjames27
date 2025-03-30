import { ParserObject as AST } from "../lexers-parsers-types";
export type ParsedToken = {
    line: number;
    start: number;
    length: number;
    type: string;
    modifiers: string[];
};
export declare const TYPES_TO_IGNORE: string[];
export declare const BUILT_IN_VALUES: string[];
export declare function consume(ast: AST, tokenTypeToUse?: string, tokenModifiersToUse?: string[]): ParsedToken[];
export declare function handleBuiltinValue(ast: AST): ParsedToken[];
