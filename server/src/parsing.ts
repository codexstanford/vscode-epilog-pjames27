import { TextDocument } from "vscode-languageserver-textdocument";
import { ParserObject as AST } from "./lexers-parsers-types";
import * as epilog_lexers_parsers from '../../common/out/plain-js/epilog-lexers-parsers.js';
import { EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID } from '../../common/out/language_ids.js';
import { Token as LexedToken } from './lexers-parsers-types';
import { DocumentUri, Location } from "vscode-languageserver";

export type ASTInfo = {
    viewPredToDef: Map<string, Location[]>;
}

export function computeASTAndInfo(document: TextDocument): { ast: AST, info: ASTInfo } | null {
    const ast = _parseToAST(document);
    if (ast === null) {
        return null;
    }
    return { ast: ast, info: _computeASTInfo(ast, document.uri) };
}

function _parseToAST(document: TextDocument): AST | null {
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

function _getPredFromRule(rule: AST): string | null {
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

function _getASTLocation(ast: AST, uri: DocumentUri): Location | null {
    return {
        uri: uri,
        range: {
            start: {
                line: ast.line-1,
                character: ast.start
            },
            end: {
                line: ast.endLine === undefined ? ast.line - 1 : ast.endLine - 1,
                character: ast.end
            }
        }
    };
}

function _computeViewPredicateToDefinition(ast: AST, uri: DocumentUri): Map<string, Location[]> {
    if (ast.type !== 'RULESET') {
        console.error('Expected AST of type RULESET');
        return new Map();
    }

    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type RULESET to have children');
        return new Map();
    }

    const viewPredToDef: Map<string, Location[]> = new Map();

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
        } else {
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

function _computeASTInfo(ast: AST, uri: DocumentUri): ASTInfo {
    const viewPredToDef: Map<string, Location[]> = _computeViewPredicateToDefinition(ast, uri);

    return {
        viewPredToDef: viewPredToDef
    };
}
