import { Diagnostic } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { ParserObject as AST } from '../lexers-parsers-types';
import { getAllErrorRoots, generateFallbackErrorDiagnostic } from "./ast-errors";
import { ASTInfo } from "../parsing";

export function validateDocWithFiletype_EpilogRuleset(
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

        const errorDiagnostic = generateFallbackErrorDiagnostic(errorRoot);
        diagnostics.push(errorDiagnostic);
    }

    return diagnostics;
}