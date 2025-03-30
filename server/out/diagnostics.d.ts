import { Diagnostic } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ParserObject as AST } from './lexers-parsers-types';
import { ASTInfo } from './parsing';
export declare function getDiagnostics(textDocument: TextDocument, documentASTsAndInfo: Map<string, {
    ast: AST;
    info: ASTInfo;
}>): Diagnostic[];
