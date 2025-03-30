"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDocWithFiletype_EpilogRuleset = void 0;
const ast_errors_1 = require("./ast-errors");
function validateDocWithFiletype_EpilogRuleset(textDocument, docText, astAndInfo) {
    let diagnostics = [];
    const errorRoots = (0, ast_errors_1.getAllErrorRoots)(astAndInfo.ast);
    for (const errorRoot of errorRoots) {
        const errorMessage = errorRoot.errorMessage;
        if (errorMessage === undefined) {
            console.error('Error root has no error message: ', errorRoot);
            continue;
        }
        const errorDiagnostic = (0, ast_errors_1.generateFallbackErrorDiagnostic)(errorRoot);
        diagnostics.push(errorDiagnostic);
    }
    return diagnostics;
}
exports.validateDocWithFiletype_EpilogRuleset = validateDocWithFiletype_EpilogRuleset;
//# sourceMappingURL=validate_epilogruleset.js.map