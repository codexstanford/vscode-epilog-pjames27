import { Diagnostic } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
export declare function getDiagnostics(textDocument: TextDocument): Diagnostic[];
