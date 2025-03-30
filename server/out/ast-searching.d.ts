import { Position } from "vscode-languageserver-textdocument";
import { Token as LexedToken, ParserObject as AST } from "./lexers-parsers-types";
export declare function findTokenContainingPosition(ast: AST, position: Position): LexedToken | null;
