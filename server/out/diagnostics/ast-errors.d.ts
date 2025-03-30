import { Diagnostic } from "vscode-languageserver";
import { ParserObject as AST } from "../lexers-parsers-types";
export declare function getAllErrorRoots(ast: AST): AST[];
export declare function generateFallbackErrorDiagnostic(ast: AST): Diagnostic;
export declare function makeCustomErrorDiagnosticForAST(ast: AST, message: string): Diagnostic;
