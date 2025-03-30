import { SemanticTokens, SemanticTokensLegend } from 'vscode-languageserver/node';
import { ParserObject as AST } from './lexers-parsers-types';
import { ASTInfo } from './parsing.js';
export declare const semanticTokensLegend: SemanticTokensLegend;
export declare function computeSemanticTokens(fullDocAST: AST, languageId: string, info: ASTInfo): SemanticTokens;
