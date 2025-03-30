"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSemanticTokens = exports.semanticTokensLegend = void 0;
const vscode = require("vscode-languageserver");
const language_ids_js_1 = require("../../common/out/language_ids.js");
const common_js_1 = require("./semantic-tokens/common.js");
const rule_js_1 = require("./semantic-tokens/rule.js");
// Define the semantic token types and modifiers that our language server supports
exports.semanticTokensLegend = {
    tokenTypes: [
        'namespace',
        'class',
        'enum',
        'interface',
        'struct',
        'typeParameter',
        'type',
        'parameter',
        'variable',
        'property',
        'enumMember',
        'decorator',
        'event',
        'function',
        'method',
        'macro',
        'label',
        'comment',
        'string',
        'keyword',
        'number',
        'regexp',
        'operator'
    ],
    tokenModifiers: [
        'declaration',
        'definition',
        'readonly',
        'static',
        'deprecated',
        'abstract',
        'async',
        'modification',
        'documentation',
        'defaultLibrary'
    ]
};
function _computeViewPredicates(ast) {
    if (ast.type !== 'RULESET') {
        console.error('Expected AST of type RULESET');
        return new Set();
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type RULESET to have children');
        return new Set();
    }
    const viewPredicates = new Set();
    for (const child of ast.children) {
        if (child.type === 'RULE') {
            const rule_head = child.children?.[0];
            if (rule_head === undefined) {
                console.error('Expected AST of type RULE to have a rule head');
                continue;
            }
            if (rule_head.type !== 'ATOM') {
                console.error('Expected AST of type RULE to have a rule head of type ATOM');
                continue;
            }
            const predicate = rule_head.children?.[0];
            if (predicate === undefined) {
                console.error('Expected AST of type ATOM to have a predicate');
                continue;
            }
            if (predicate.type !== 'SYMBOL_TERM') {
                console.error('Expected AST of type ATOM to have a predicate of type SYMBOL_TERM');
                continue;
            }
            viewPredicates.add(predicate.content);
        }
    }
    return viewPredicates;
}
function _computeSemanticTokensRuleset(ast) {
    if (ast.type !== 'RULESET') {
        console.error('Expected AST of type RULESET');
        return (0, common_js_1.consume)(ast);
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type RULESET to have children');
        return (0, common_js_1.consume)(ast);
    }
    // Compute all of the view predicates
    const viewPredicates = _computeViewPredicates(ast);
    let parsedTokens = [];
    for (const child of ast.children) {
        switch (child.type) {
            case 'RULE':
                parsedTokens.push(...(0, rule_js_1.computeSemanticTokensRule)(child, viewPredicates));
                break;
            default:
                parsedTokens.push(...(0, common_js_1.consume)(child));
        }
    }
    return parsedTokens;
}
function _computeSemanticTokensForDataset(ast) {
    console.error('computeSemanticTokensForDataset not implemented');
    return [];
}
function computeSemanticTokens(fullDocAST, languageId) {
    const serviced_languages = [language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID, language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID];
    if (!serviced_languages.includes(languageId)) {
        console.log(`Semantic tokens not provided for language ${languageId}`);
        return {
            data: []
        };
    }
    let semanticTokenComputer;
    switch (languageId) {
        case language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID:
            semanticTokenComputer = _computeSemanticTokensRuleset;
            break;
        case language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID:
            semanticTokenComputer = _computeSemanticTokensForDataset;
            break;
        default:
            throw new Error(`Semantic tokens not implemented for language id: ${languageId}`);
    }
    const parsedTokens = semanticTokenComputer(fullDocAST);
    function _encodeTokenType(tokenType) {
        if (exports.semanticTokensLegend.tokenTypes.includes(tokenType)) {
            return exports.semanticTokensLegend.tokenTypes.indexOf(tokenType);
        }
        else {
            return exports.semanticTokensLegend.tokenTypes.length + 2;
        }
    }
    function _encodeTokenModifiers(strTokenModifiers) {
        let result = 0;
        for (const tokenModifier of strTokenModifiers) {
            if (exports.semanticTokensLegend.tokenModifiers.includes(tokenModifier)) {
                result = result | (1 << exports.semanticTokensLegend.tokenModifiers.indexOf(tokenModifier));
            }
            else {
                result = result | (1 << exports.semanticTokensLegend.tokenModifiers.length + 2);
            }
        }
        return result;
    }
    const builder = new vscode.SemanticTokensBuilder();
    // Add tokens to the builder
    //console.log('encodedTokens');
    parsedTokens.forEach(token => {
        const tokenType = _encodeTokenType(token.type);
        const tokenModifiers = _encodeTokenModifiers(token.modifiers);
        //console.log('line: ', token.line, 'start: ', token.start, 'length: ', token.length, 'tokenType: ', tokenType, 'tokenModifiers: ', tokenModifiers);
        builder.push(token.line, token.start, token.length, tokenType, tokenModifiers);
    });
    return builder.build();
}
exports.computeSemanticTokens = computeSemanticTokens;
//# sourceMappingURL=semantic-tokens.js.map