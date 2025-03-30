"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCustomErrorDiagnosticForAST = exports.generateFallbackErrorDiagnostic = exports.getAllErrorRoots = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_searching_1 = require("../ast-searching");
const common_1 = require("../semantic-tokens/common");
function getAllErrorRoots(ast) {
    if ((0, common_1.isASTType)(ast, 'ERROR')) {
        return [ast];
    }
    if (!(0, common_1.isNonTerminal)(ast)) {
        return [];
    }
    let errorRoots = [];
    for (const child of ast.children) {
        errorRoots.push(...getAllErrorRoots(child));
    }
    return errorRoots;
}
exports.getAllErrorRoots = getAllErrorRoots;
function generateFallbackErrorDiagnostic(ast) {
    return {
        range: (0, ast_searching_1.rangeOfAST)(ast),
        message: ast.errorMessage === undefined ? "Unknown error" : ast.errorMessage,
        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
    };
}
exports.generateFallbackErrorDiagnostic = generateFallbackErrorDiagnostic;
function makeCustomErrorDiagnosticForAST(ast, message) {
    return {
        range: (0, ast_searching_1.rangeOfAST)(ast),
        message,
        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
    };
}
exports.makeCustomErrorDiagnosticForAST = makeCustomErrorDiagnosticForAST;
//# sourceMappingURL=ast-errors.js.map