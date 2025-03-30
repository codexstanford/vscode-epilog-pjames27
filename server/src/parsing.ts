import { TextDocument } from "vscode-languageserver-textdocument";
import { ParserObject as AST } from "./lexers-parsers-types";
import * as epilog_lexers_parsers from '../../common/out/plain-js/epilog-lexers-parsers.js';
import { EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID } from '../../common/out/language_ids.js';
import { Token as LexedToken } from './lexers-parsers-types';

export function parseToAST(document: TextDocument): AST | null {
    const serviced_languages = [EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID];

    const languageId = document.languageId;

    if (!serviced_languages.includes(languageId)) {
        console.log(`Parsing not provided for language ${languageId}`);
        return null;
    }


    let lexer: (input: string) => LexedToken[];
    let parser: (tokens: LexedToken[]) => AST;

    switch (languageId) {
        case EPILOG_RULESET_LANGUAGE_ID:
            lexer = epilog_lexers_parsers.rulesetLexer;
            parser = epilog_lexers_parsers.parseRuleset;
            break;
        case EPILOG_DATASET_LANGUAGE_ID:
            lexer = epilog_lexers_parsers.datasetLexer;
            parser = epilog_lexers_parsers.parseDataset;
            break;
        default:
            throw new Error(`Parsing not implemented for language id: ${languageId}`);
    }

    const startTime = Date.now();

    const tokens: LexedToken[] = lexer(document.getText());
    const ast: AST = parser(tokens);

    const endTime = Date.now();
    console.log('Time taken to lex and parse document ', document.uri, ': ', endTime - startTime, 'ms');

    return ast;
}