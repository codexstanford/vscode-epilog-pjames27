"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSemanticTokens = exports.semanticTokensLegend = void 0;
const vscode = require("vscode-languageserver");
const language_ids_js_1 = require("../../common/out/language_ids.js");
const common_js_1 = require("./semantic-tokens/common.js");
const rule_js_1 = require("./semantic-tokens/rule.js");
const fact_js_1 = require("./semantic-tokens/fact.js");
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
function _computeSemanticTokensRuleset(ast, info) {
    if (!(0, common_js_1.isASTType)(ast, 'RULESET')) {
        console.error('Expected AST of type RULESET');
        return (0, common_js_1.consume)(ast);
    }
    if (!(0, common_js_1.isNonTerminal)(ast)) {
        console.error('Expected AST of type RULESET to be a non-terminal');
        return (0, common_js_1.consume)(ast);
    }
    const viewPredicates = new Set(info.viewPredToDef.keys());
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
function _computeSemanticTokensDataset(ast, info) {
    if (!(0, common_js_1.isASTType)(ast, 'DATASET')) {
        console.error('Expected AST of type DATASET');
        return (0, common_js_1.consume)(ast);
    }
    if (!(0, common_js_1.isNonTerminal)(ast)) {
        console.error('Expected AST of type DATASET to be a non-terminal');
        return (0, common_js_1.consume)(ast);
    }
    let parsedTokens = [];
    for (const child of ast.children) {
        switch (child.type) {
            case 'FACT':
                parsedTokens.push(...(0, fact_js_1.computeSemanticTokensFact)(child));
                break;
            default:
                parsedTokens.push(...(0, common_js_1.consume)(child));
        }
    }
    return parsedTokens;
}
function computeSemanticTokens(fullDocAST, languageId, info) {
    const serviced_languages = [language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID, language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID];
    if (!serviced_languages.includes(languageId)) {
        console.log(`Semantic tokens not provided for language ${languageId}`);
        return {
            data: []
        };
    }
    let parsedTokens;
    switch (languageId) {
        case language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID:
            parsedTokens = _computeSemanticTokensRuleset(fullDocAST, info);
            break;
        case language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID:
            parsedTokens = _computeSemanticTokensDataset(fullDocAST, info);
            break;
        default:
            throw new Error(`Semantic tokens not implemented for language id: ${languageId}`);
    }
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