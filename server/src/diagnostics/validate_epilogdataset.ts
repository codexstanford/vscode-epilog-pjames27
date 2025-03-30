import { Diagnostic } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { ParserObject as AST } from '../lexers-parsers-types';
import { ASTInfo } from '../parsing';
import { generateFallbackErrorDiagnostic, getAllErrorRoots, makeCustomErrorDiagnosticForAST } from './ast-errors';
import { isASTType, isNonTerminal } from "../semantic-tokens/common";

function getUnexpectedVariableNameIfExists(errorAST: AST): string | null {
    if (!isASTType(errorAST, 'ERROR')) {
        return null;
    }

    if (errorAST.errorMessage === undefined) {
        console.error('Error AST has no error message: ', errorAST);
        return null;
    }

    if (errorAST.errorMessage === "Expected term, but found VARIABLE_ANONYMOUS") {
        return '_';
    }

    // If the error message starts with "Unexpected character: " and the trimmed message starts with a capital letter or underscore, it's an unexpected variable.
    const unexpectedCharacter = (errorAST.errorMessage.replace('Unexpected character: ', ''))[0];
    if (errorAST.errorMessage.includes('Unexpected character: ') && unexpectedCharacter.match(/[A-Z_]/)) {
        return errorAST.content;
    }

    // If it's not obviously an unexpected variable, check its children, if they exist
    if (!isNonTerminal(errorAST)) {
        return null;
    }

    for (const child of errorAST.children) {
        const unexpectedVariableName = getUnexpectedVariableNameIfExists(child);
        if (unexpectedVariableName !== null) {
            return unexpectedVariableName;
        }
    }

    return null;
}

function getErrorMessageIfRecognized(errorRoot: AST): string | null {
    const errorMessage = errorRoot.errorMessage;
    if (errorMessage === undefined) {
        console.error('Error root has no error message: ', errorRoot);
        return null;
    }

    // See if there is a variable
    const unexpectedVariableName = getUnexpectedVariableNameIfExists(errorRoot);
    if (unexpectedVariableName !== null) {
        return "Variables not permitted in dataset files, but found variable: " + unexpectedVariableName;
    }

    // Not a recognized error
    return null;
}

export function validateDocWithFiletype_EpilogDataset(
    textDocument: TextDocument,
    docText: string,
    astAndInfo: {ast: AST, info: ASTInfo}
): Diagnostic[] {
    let diagnostics: Diagnostic[] = [];

    const errorRoots = getAllErrorRoots(astAndInfo.ast);

    for (const errorRoot of errorRoots) {
        const errorMessage = errorRoot.errorMessage;
        if (errorMessage === undefined) {
            console.error('Error root has no error message: ', errorRoot);
            continue;
        }

        const messageForRecognizedError: string | null = getErrorMessageIfRecognized(errorRoot);

        if (messageForRecognizedError !== null) {
            diagnostics.push(makeCustomErrorDiagnosticForAST(errorRoot, messageForRecognizedError));
            console.log('Generating error diagnostic for AST: ', errorRoot);
            continue;
        }

        console.log('Generating fallback error diagnostic for AST: ', errorRoot);
        diagnostics.push(generateFallbackErrorDiagnostic(errorRoot));
    }

    return diagnostics;
}