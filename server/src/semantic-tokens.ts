import {
	SemanticTokens,
	SemanticTokensLegend
} from 'vscode-languageserver/node';


import * as vscode from 'vscode-languageserver';

import { EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID } from '../../common/out/language_ids.js';
import { ParserObject as AST } from './lexers-parsers-types.js';
import { consume, ParsedToken, isNonTerminal, isASTType } from './semantic-tokens/common.js';
import { computeSemanticTokensRule } from './semantic-tokens/rule.js';
import { ASTInfo } from './parsing.js';
import { computeSemanticTokensFact } from './semantic-tokens/fact.js';
// Define the semantic token types and modifiers that our language server supports
export const semanticTokensLegend: SemanticTokensLegend = {
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

function _computeSemanticTokensRuleset(ast: AST, info: ASTInfo): ParsedToken[] {
    if (!isASTType(ast, 'RULESET')) {
        console.error('Expected AST of type RULESET');
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type RULESET to be a non-terminal');
        return consume(ast);
    }

    const viewPredicates: Set<string> = new Set(info.viewPredToDef.keys());
    let parsedTokens: ParsedToken[] = [];

    for (const child of ast.children) {
        switch (child.type) {
            case 'RULE':
                parsedTokens.push(...computeSemanticTokensRule(child, viewPredicates));
                break;
            default:
                parsedTokens.push(...consume(child));
        }
    }

    return parsedTokens;
}

function _computeSemanticTokensDataset(ast: AST, info: ASTInfo): ParsedToken[] {
    if (!isASTType(ast, 'DATASET')) {
        console.error('Expected AST of type DATASET');
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type DATASET to be a non-terminal');
        return consume(ast);
    }

    let parsedTokens: ParsedToken[] = [];

    for (const child of ast.children) {
        switch (child.type) {
            case 'FACT':
                parsedTokens.push(...computeSemanticTokensFact(child));
                break;
            default:
                parsedTokens.push(...consume(child));
        }
    }

    return parsedTokens;
}

export function computeSemanticTokens(fullDocAST: AST, languageId: string, info: ASTInfo): SemanticTokens {
    const serviced_languages = [EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID];

    if (!serviced_languages.includes(languageId)) {
        console.log(`Semantic tokens not provided for language ${languageId}`);
        return {
            data: []
        };
    }

    let parsedTokens: ParsedToken[];

    switch (languageId) {
        case EPILOG_RULESET_LANGUAGE_ID:
            parsedTokens = _computeSemanticTokensRuleset(fullDocAST, info);
            break;
        case EPILOG_DATASET_LANGUAGE_ID:
            parsedTokens = _computeSemanticTokensDataset(fullDocAST, info);
            break;
        default:
            throw new Error(`Semantic tokens not implemented for language id: ${languageId}`);
    }
    
    function _encodeTokenType(tokenType: string): number {
        if (semanticTokensLegend.tokenTypes.includes(tokenType)) {
            return semanticTokensLegend.tokenTypes.indexOf(tokenType);
        } 
        else {
            return semanticTokensLegend.tokenTypes.length + 2;
        }
    }
    
    function _encodeTokenModifiers(strTokenModifiers: string[]): number {
        let result = 0;
        for (const tokenModifier of strTokenModifiers) {
            if (semanticTokensLegend.tokenModifiers.includes(tokenModifier)) {
                result = result | (1 << semanticTokensLegend.tokenModifiers.indexOf(tokenModifier));
            } else {
                result = result | (1 << semanticTokensLegend.tokenModifiers.length + 2);
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