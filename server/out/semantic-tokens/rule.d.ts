import { ParsedToken } from "./common";
import { ParserObject as AST } from "../lexers-parsers-types";
export declare function computeSemanticTokensRule(ast: AST, viewPredicates: Set<string>): ParsedToken[];
