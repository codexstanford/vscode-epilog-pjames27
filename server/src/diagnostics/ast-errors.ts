
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { ParserObject as AST } from "../lexers-parsers-types";
import { rangeOfAST } from "../ast-searching";
import { isNonTerminal, isASTType } from "../semantic-tokens/common";

export function getAllErrorRoots(ast: AST): AST[] {
    if (isASTType(ast, 'ERROR')) {
        return [ast];
    }

    if (!isNonTerminal(ast)) {
        return [];
    }

    let errorRoots: AST[] = [];

    for (const child of ast.children) {
        errorRoots.push(...getAllErrorRoots(child));
    }

    return errorRoots;
}


export function generateFallbackErrorDiagnostic(ast: AST): Diagnostic {
    return {
        range: rangeOfAST(ast),
        message: ast.errorMessage === undefined ? "Unknown error" : ast.errorMessage,
        severity: DiagnosticSeverity.Error,
    };
}

export function makeCustomErrorDiagnosticForAST(ast: AST, message: string): Diagnostic {
    return {
        range: rangeOfAST(ast),
        message,
        severity: DiagnosticSeverity.Error,
    };
}