import { TextDocument } from "vscode-languageserver-textdocument";
import { ParserObject as AST } from "./lexers-parsers-types";
export declare function parseToAST(document: TextDocument): AST | null;
