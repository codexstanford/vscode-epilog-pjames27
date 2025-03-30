import { Diagnostic } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { Token as LexedToken, ParserObject as AST } from '../lexers-parsers-types.js';
import * as epilog_lexers_parsers from '../../../common/out/plain-js/epilog-lexers-parsers.js';

export function validateDocWithFiletype_EpilogRuleset(
    textDocument: TextDocument,
    docText: string,
): Diagnostic[] {
    let diagnostics: Diagnostic[] = [];

    // TODO

    /*
    // Convert to AST
    const lexedTokens: LexedToken[] = epilog_lexers_parsers.rulesetLexer(docText);
    const ast: AST = epilog_lexers_parsers.parseRuleset(lexedTokens);
    */
    return diagnostics;
}