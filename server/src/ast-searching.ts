import { Position } from "vscode-languageserver-textdocument";
import { Range } from "vscode-languageserver";
import { Token as LexedToken, ParserObject as AST } from "./lexers-parsers-types";

export function rangeOfAST(ast: AST): Range {
    return {
        start: {
            line: ast.line-1,
            character: ast.start
        },
        end: {
            line: ast.endLine === undefined ? ast.line - 1 : ast.endLine - 1,
            character: ast.end
        }
    }
}

function _isWithinAST(ast: AST, pos: Position): boolean {
    const range = rangeOfAST(ast);
    // Not within the lines
    if (range.start.line > pos.line || range.end.line < pos.line) {
        return false;
    }

    // Strictly between the first and last lines
    if (range.start.line < pos.line && range.end.line > pos.line) {
        return true;
    }

    // On the first line, but before the start of the range
    if (range.start.line === pos.line && pos.character < range.start.character) {
        return false;
    }

    // On the last line, but after the end of the range
    if (range.end.line === pos.line && pos.character > range.end.character) {
        return false;
    }

    return true;
}

export function findTokenContainingPosition(ast: AST, position: Position): LexedToken | null {
    if (!_isWithinAST(ast, position)) {
        return null;
    }

    if (ast.children === undefined || ast.children.length === 0) {
        return ast as LexedToken;
    }

    for (const child of ast.children) {
        const tokenContainingPosition = findTokenContainingPosition(child, position);
        if (tokenContainingPosition !== null) {
            return tokenContainingPosition;
        }
    }
    return null;
}

