import { Diagnostic } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { ParserObject as AST } from '../lexers-parsers-types';
import { ASTInfo } from '../parsing';
export declare function validateDocWithFiletype_EpilogDataset(textDocument: TextDocument, docText: string, astAndInfo: {
    ast: AST;
    info: ASTInfo;
}): Diagnostic[];
