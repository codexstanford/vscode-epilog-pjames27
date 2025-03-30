"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToAST = void 0;
const epilog_lexers_parsers = require("../../common/out/plain-js/epilog-lexers-parsers.js");
const language_ids_js_1 = require("../../common/out/language_ids.js");
function parseToAST(document) {
    const serviced_languages = [language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID, language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID];
    const languageId = document.languageId;
    if (!serviced_languages.includes(languageId)) {
        console.log(`Parsing not provided for language ${languageId}`);
        return null;
    }
    let lexer;
    let parser;
    switch (languageId) {
        case language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID:
            lexer = epilog_lexers_parsers.rulesetLexer;
            parser = epilog_lexers_parsers.parseRuleset;
            break;
        case language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID:
            lexer = epilog_lexers_parsers.datasetLexer;
            parser = epilog_lexers_parsers.parseDataset;
            break;
        default:
            throw new Error(`Parsing not implemented for language id: ${languageId}`);
    }
    const startTime = Date.now();
    const tokens = lexer(document.getText());
    const ast = parser(tokens);
    const endTime = Date.now();
    console.log('Time taken to lex and parse document ', document.uri, ': ', endTime - startTime, 'ms');
    return ast;
}
exports.parseToAST = parseToAST;
//# sourceMappingURL=parsing.js.map