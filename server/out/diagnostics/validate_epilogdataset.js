"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDocWithFiletype_EpilogDataset = void 0;
const ast_errors_1 = require("./ast-errors");
const common_1 = require("../semantic-tokens/common");
function getUnexpectedVariableNameIfExists(errorAST) {
    if (!(0, common_1.isASTType)(errorAST, 'ERROR')) {
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
    if (!(0, common_1.isNonTerminal)(errorAST)) {
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
function getErrorMessageIfRecognized(errorRoot) {
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
function validateDocWithFiletype_EpilogDataset(textDocument, docText, astAndInfo) {
    let diagnostics = [];
    const errorRoots = (0, ast_errors_1.getAllErrorRoots)(astAndInfo.ast);
    for (const errorRoot of errorRoots) {
        const errorMessage = errorRoot.errorMessage;
        if (errorMessage === undefined) {
            console.error('Error root has no error message: ', errorRoot);
            continue;
        }
        const messageForRecognizedError = getErrorMessageIfRecognized(errorRoot);
        if (messageForRecognizedError !== null) {
            diagnostics.push((0, ast_errors_1.makeCustomErrorDiagnosticForAST)(errorRoot, messageForRecognizedError));
            console.log('Generating error diagnostic for AST: ', errorRoot);
            continue;
        }
        console.log('Generating fallback error diagnostic for AST: ', errorRoot);
        diagnostics.push((0, ast_errors_1.generateFallbackErrorDiagnostic)(errorRoot));
    }
    return diagnostics;
}
exports.validateDocWithFiletype_EpilogDataset = validateDocWithFiletype_EpilogDataset;
//# sourceMappingURL=validate_epilogdataset.js.map