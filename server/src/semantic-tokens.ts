import {
	SemanticTokens,
	SemanticTokensLegend
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

import * as vscode from 'vscode-languageserver';

import { EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID } from '../../common/out/language_ids.js';
import * as epilog_lexers_parsers from '../../common/out/plain-js/epilog-lexers-parsers.js';
import { Token as LexedToken, ParserObject as AST } from './lexers-parsers-types.js';
import { consume, ParsedToken } from './semantic-tokens/common.js';
import { computeSemanticTokensRule } from './semantic-tokens/rule.js';

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

function _computeViewPredicates(ast: AST): Set<string> {
    if (ast.type !== 'RULESET') {
        console.error('Expected AST of type RULESET');
        return new Set();
    }

    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type RULESET to have children');
        return new Set();
    }
    
    const viewPredicates: Set<string> = new Set();
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

function _computeSemanticTokensRuleset(ast: AST): ParsedToken[] {
    if (ast.type !== 'RULESET') {
        console.error('Expected AST of type RULESET');
        return consume(ast);
    }

    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type RULESET to have children');
        return consume(ast);
    }

    // Compute all of the view predicates
    const viewPredicates: Set<string> = _computeViewPredicates(ast);

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

function _computeSemanticTokensForDataset(ast: AST): ParsedToken[] {
    console.error('computeSemanticTokensForDataset not implemented');
    return [];
}

export function computeSemanticTokens(fullDocAST: AST, languageId: string): SemanticTokens {
    const serviced_languages = [EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID];

    if (!serviced_languages.includes(languageId)) {
        console.log(`Semantic tokens not provided for language ${languageId}`);
        return {
            data: []
        };
    }

    let semanticTokenComputer: (ast: AST) => ParsedToken[];

    switch (languageId) {
        case EPILOG_RULESET_LANGUAGE_ID:
            semanticTokenComputer = _computeSemanticTokensRuleset;
            break;
        case EPILOG_DATASET_LANGUAGE_ID:
            semanticTokenComputer = _computeSemanticTokensForDataset;
            break;
        default:
            throw new Error(`Semantic tokens not implemented for language id: ${languageId}`);
    }

    const parsedTokens: ParsedToken[] = semanticTokenComputer(fullDocAST);
    
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