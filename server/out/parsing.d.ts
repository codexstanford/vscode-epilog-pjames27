import { TextDocument } from "vscode-languageserver-textdocument";
import { ParserObject as AST } from "./lexers-parsers-types";
import { Location } from "vscode-languageserver";
export type ASTInfo = {
    viewPredToDef: Map<string, Location[]>;
};
export declare function computeASTAndInfo(document: TextDocument): {
    ast: AST;
    info: ASTInfo;
} | null;
