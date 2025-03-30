"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeASTAndInfo = void 0;
const epilog_lexers_parsers = require("../../common/out/plain-js/epilog-lexers-parsers.js");
const language_ids_js_1 = require("../../common/out/language_ids.js");
function computeASTAndInfo(document) {
    const ast = _parseToAST(document);
    if (ast === null) {
        return null;
    }
    return { ast: ast, info: _computeASTInfo(ast, document.uri) };
}
exports.computeASTAndInfo = computeASTAndInfo;
function _parseToAST(document) {
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
function _getPredFromRule(rule) {
    // Validate the form of the rule
    if (rule.type !== 'RULE') {
        console.error('Expected AST of type RULE');
        return null;
    }
    if (rule.children === undefined || rule.children.length === 0) {
        console.error('Expected AST of type RULE to have children');
        return null;
    }
    // Validate the form of the rule head
    const rule_head = rule.children[0];
    if (rule_head.type !== 'ATOM') {
        console.error('Expected AST of type RULE to have a rule head of type ATOM');
        return null;
    }
    if (rule_head.children === undefined || rule_head.children.length === 0) {
        console.error('Get pred from rule: Expected AST of type ATOM to have children');
        return null;
    }
    // Validate the form of the predicate
    const predicate = rule_head.children[0];
    if (predicate.type !== 'SYMBOL_TERM') {
        console.error('Expected AST of predicate to be of type SYMBOL_TERM');
        return null;
    }
    return predicate.content;
}
function _getASTLocation(ast, uri) {
    return {
        uri: uri,
        range: {
            start: {
                line: ast.line - 1,
                character: ast.start
            },
            end: {
                line: ast.endLine === undefined ? ast.line - 1 : ast.endLine - 1,
                character: ast.end
            }
        }
    };
}
function _computeViewPredicateToDefinition(ast, uri) {
    if (ast.type !== 'RULESET') {
        console.error('Expected AST of type RULESET');
        return new Map();
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type RULESET to have children');
        return new Map();
    }
    const viewPredToDef = new Map();
    for (const child of ast.children) {
        if (child.type !== 'RULE') {
            continue;
        }
        const pred = _getPredFromRule(child);
        if (pred === null) {
            console.error('Issue getting predicate from rule head');
            continue;
        }
        const def = _getASTLocation(child, uri);
        if (def === null) {
            console.error('Issue getting definition location from rule');
            continue;
        }
        if (!viewPredToDef.has(pred)) {
            viewPredToDef.set(pred, [def]);
        }
        else {
            const existingDefs = viewPredToDef.get(pred);
            if (existingDefs === undefined) {
                console.error('Issue getting existing definitions for predicate');
                continue;
            }
            viewPredToDef.set(pred, [...existingDefs, def]);
        }
    }
    return viewPredToDef;
}
function _computeASTInfo(ast, uri) {
    const viewPredToDef = _computeViewPredicateToDefinition(ast, uri);
    return {
        viewPredToDef: viewPredToDef
    };
}
//# sourceMappingURL=parsing.js.map