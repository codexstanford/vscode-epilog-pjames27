import { Position } from "vscode-languageserver-textdocument";
import { Range } from "vscode-languageserver";
import { Token as LexedToken, ParserObject as AST } from "./lexers-parsers-types";
export declare function rangeOfAST(ast: AST): Range;
export declare function findTokenContainingPosition(ast: AST, position: Position): LexedToken | null;
