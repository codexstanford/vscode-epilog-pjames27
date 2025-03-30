import { Location } from "vscode-languageserver";
import { Position } from "vscode-languageserver-textdocument";
import { ParserObject as AST } from "./lexers-parsers-types";
import { findTokenContainingPosition } from "./ast-searching";

export function getViewPredicateDefinition(ast: AST, position: Position, viewPredicateToDefinition: Map<string, Location[]>): Location[] | null {

    // Need to find the token that contains the position
    const token = findTokenContainingPosition(ast, position);

    if (token === null) {
        return null;
    }

    const definitions = viewPredicateToDefinition.get(token.content);
    
    if (definitions === undefined) {
        return null;
    }

    return definitions;
}

