import { Location } from "vscode-languageserver";
import { Position } from "vscode-languageserver-textdocument";
import { ParserObject as AST } from "./lexers-parsers-types";
export declare function getViewPredicateDefinition(ast: AST, position: Position, viewPredicateToDefinition: Map<string, Location[]>): Location[] | null;
