"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTokenContainingPosition = exports.rangeOfAST = void 0;
function rangeOfAST(ast) {
    return {
        start: {
            line: ast.line - 1,
            character: ast.start
        },
        end: {
            line: ast.endLine === undefined ? ast.line - 1 : ast.endLine - 1,
            character: ast.end
        }
    };
}
exports.rangeOfAST = rangeOfAST;
function _isWithinAST(ast, pos) {
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
function findTokenContainingPosition(ast, position) {
    if (!_isWithinAST(ast, position)) {
        return null;
    }
    if (ast.children === undefined || ast.children.length === 0) {
        return ast;
    }
    for (const child of ast.children) {
        const tokenContainingPosition = findTokenContainingPosition(child, position);
        if (tokenContainingPosition !== null) {
            return tokenContainingPosition;
        }
    }
    return null;
}
exports.findTokenContainingPosition = findTokenContainingPosition;
//# sourceMappingURL=ast-searching.js.map