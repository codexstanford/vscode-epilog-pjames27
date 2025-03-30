import { BUILT_IN_VALUES, ParsedToken, consume, TYPES_TO_IGNORE, handleBuiltinValue, isASTType, isNonLeafTermType, isNonTerminal, handleBasePred, BUILT_IN_PREDS, handleBuiltinPred } from "./common";
import { ParserObject as AST } from "../lexers-parsers-types";


function _computeSemanticTokensRuleHeadCompoundTerm(ast: AST): {parsedTokens: ParsedToken[], declaredParameters: string[]} {

    if (!isASTType(ast, 'COMPOUND_TERM')) {
        console.error('Expected AST of type COMPOUND_TERM');
        return {parsedTokens: consume(ast), declaredParameters: []};
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type COMPOUND_TERM to be a non-terminal');
        return {parsedTokens: consume(ast), declaredParameters: []};
    }
    
    // Handle the constructor of the compound term
    const constructor = ast.children[0] as AST;
    if (constructor.type !== 'SYMBOL_TERM') {
        console.error('Expected AST of type COMPOUND_TERM to have a constructor');
        return {parsedTokens: consume(ast), declaredParameters: []};
    }

    let parsedTokens: ParsedToken[] = [...consume(constructor, 'struct')];
    let declaredParameters: string[] = [];

    // Handle the arguments of the compound term
    for (const child of ast.children.slice(1)) {
        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        const {parsedTokens: childParsedTokens, declaredParameters: childDeclaredParameters} = _computeSemanticTokensRuleHeadTerm(child);
        parsedTokens.push(...childParsedTokens);
        declaredParameters.push(...childDeclaredParameters);
    }

    return {parsedTokens, declaredParameters};
}

function _computeSemanticTokensRuleHeadTerm(ast: AST): {parsedTokens: ParsedToken[], declaredParameters: string[]} {
    if (!isNonLeafTermType(ast)) {
        console.error('Expected non-leaf term AST but got: ', ast);
        return {parsedTokens: consume(ast), declaredParameters: []};
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected rule head TERM to be a non-terminal');
        return {parsedTokens: consume(ast), declaredParameters: []};
    }

    let parsedTokens: ParsedToken[] = [];
    let declaredParameters: string[] = [];

    for (const child of ast.children) {
        if (BUILT_IN_VALUES.includes(child.content)) {
            parsedTokens.push(...handleBuiltinValue(child));
            continue;
        }

        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        // Recursively handle other children
        switch (child.type) {
            case 'VARIABLE':
                parsedTokens.push(...consume(child, 'parameter', ['declaration']));
                declaredParameters.push(child.content);
                break;
            case 'STRING':
                parsedTokens.push(...consume(child, 'string'));
                break;
            case 'NUMBER':
                parsedTokens.push(...consume(child, 'number'));
                break;
            case 'SYMBOL_TERM':
                parsedTokens.push(...consume(child, 'variable', ['readonly']));
                break;
            case 'SIMPLE_TERM':
                const {parsedTokens: simpleTermParsedTokens, declaredParameters: simpleTermDeclaredParameters} = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...simpleTermParsedTokens);
                declaredParameters.push(...simpleTermDeclaredParameters);
                break;
            case 'COMPOUND_TERM':
                const {parsedTokens: compoundTermParsedTokens, declaredParameters: compoundTermDeclaredParameters} = _computeSemanticTokensRuleHeadCompoundTerm(child);
                parsedTokens.push(...compoundTermParsedTokens);
                declaredParameters.push(...compoundTermDeclaredParameters);
                break;
            case 'LIST_TERM':
                const {parsedTokens: listTermParsedTokens, declaredParameters: listTermDeclaredParameters} = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...listTermParsedTokens);
                declaredParameters.push(...listTermDeclaredParameters);
                break;
            case 'TERM':
                const {parsedTokens: termParsedTokens, declaredParameters: termDeclaredParameters} = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...termParsedTokens);
                declaredParameters.push(...termDeclaredParameters);
                break;
            default:
                console.log('Unhandled rule head term: ', child);
                parsedTokens.push(...consume(child));
        }
    }

    return {parsedTokens, declaredParameters};
}

function _computeSemanticTokensRuleHead(ast: AST): {parsedTokens: ParsedToken[], declaredParameters: string[]} {

    if (!isASTType(ast, 'ATOM')) {
        console.error('Expected AST of type ATOM');
        return {parsedTokens: consume(ast), declaredParameters: []};
    }

    if (!isNonTerminal(ast)) {
        console.error('Rule head: Expected AST of type ATOM to be a non-terminal');
        return {parsedTokens: consume(ast), declaredParameters: []};
    }

    let parsedTokens: ParsedToken[] = [];
    let declaredParameters: string[] = [];

    // Now parse the rest of the children, i.e. the arguments
    for (const child of ast.children) {

        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        switch (child.type) {
            case 'SYMBOL_TERM':
                parsedTokens.push(...consume(child, 'function', ['declaration']));
                break;
            case 'TERM':
                const {parsedTokens: termParsedTokens, declaredParameters: termDeclaredParameters} = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...termParsedTokens);
                declaredParameters.push(...termDeclaredParameters);
                break;
            default:
                parsedTokens.push(...consume(child));
        }
    }
    
    return {parsedTokens, declaredParameters};
}

function _computeSemanticTokensRuleSubgoalCompoundTerm(ast: AST, declaredParameters: string[]): ParsedToken[] {
    if (!isASTType(ast, 'COMPOUND_TERM')) {
        console.error('Expected AST of type COMPOUND_TERM but got: ', ast);
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type COMPOUND_TERM to be a non-terminal');
        return consume(ast);
    }

    // Handle the constructor of the compound term
    const constructor = ast.children[0] as AST;
    if (constructor.type !== 'SYMBOL_TERM') {
        console.error('Expected AST of type COMPOUND_TERM to have a constructor');
        return consume(ast);
    }

    let parsedTokens: ParsedToken[] = [...consume(constructor, 'struct')];

    for (const child of ast.children.slice(1)) {
        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        parsedTokens.push(..._computeSemanticTokensRuleSubgoalTerm(child, declaredParameters));
    }
    
    return parsedTokens;
}

function _computeSemanticTokensRuleSubgoalTerm(ast: AST, declaredParameters: string[]): ParsedToken[] {
    if (!isNonLeafTermType(ast)) {
        console.error('Expected non-leaf term AST but got: ', ast);
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected rule head TERM to be a non-terminal');
        return consume(ast);
    }

    let parsedTokens: ParsedToken[] = [];

    for (const child of ast.children) {

        if (BUILT_IN_VALUES.includes(child.content)) {
            parsedTokens.push(...handleBuiltinValue(child));
            continue;
        }

        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        switch (child.type) {
            case 'VARIABLE':
                if (declaredParameters.includes(child.content)) {
                    parsedTokens.push(...consume(child, 'parameter'));
                } else {
                    parsedTokens.push(...consume(child, 'variable', ['declaration']));
                }
                break;
            case 'STRING':
                parsedTokens.push(...consume(child, 'string'));
                break;
            case 'NUMBER':
                parsedTokens.push(...consume(child, 'number'));
                break;
            case 'SYMBOL_TERM':
                parsedTokens.push(...consume(child, 'variable', ['readonly']));
                break;
            case 'SIMPLE_TERM':
                parsedTokens.push(..._computeSemanticTokensRuleSubgoalTerm(child, declaredParameters));
                break;
            case 'COMPOUND_TERM':
                parsedTokens.push(..._computeSemanticTokensRuleSubgoalCompoundTerm(child, declaredParameters));
                break;
            case 'LIST_TERM':   
                parsedTokens.push(..._computeSemanticTokensRuleSubgoalTerm(child, declaredParameters));
                break;
            case 'TERM':
                parsedTokens.push(..._computeSemanticTokensRuleSubgoalTerm(child, declaredParameters));
                break;
            default:
                parsedTokens.push(...consume(child));

        }

    }

    return parsedTokens;
    
}

function _computeSemanticTokensRuleSubgoalAtom(ast: AST, declaredParameters: string[], viewPredicates: Set<string>): ParsedToken[] {
    if (!isASTType(ast, 'ATOM')) {
        console.error('Expected AST of type ATOM but got: ', ast);
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type ATOM to be a non-terminal');
        return consume(ast);
    }

    // Handle the first child, i.e. the predicate
    const predicate = ast.children[0] as AST;
    if (predicate.type !== 'SYMBOL_TERM') {
        console.error('Expected AST of type ATOM to have a predicate but got: ', predicate);
        return consume(ast);
    }
    
    let predicateTokens: ParsedToken[] = [];
    const predName = predicate.content;
    if (BUILT_IN_PREDS.has(predName)) {
        predicateTokens = [...handleBuiltinPred(predicate)];
    } else if (viewPredicates.has(predName)) {
        predicateTokens = [...consume(predicate, 'function')];
    } else {
        predicateTokens = [...handleBasePred(predicate)];
    }

    let parsedTokens: ParsedToken[] = [...predicateTokens];

    // Handle the rest of the children, i.e. the arguments
    for (const child of ast.children.slice(1)) {
        if (BUILT_IN_VALUES.includes(child.content)) {
            parsedTokens.push(...handleBuiltinValue(child));
            continue;
        }
        
        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        if (child.type === 'TERM') {
            parsedTokens.push(..._computeSemanticTokensRuleSubgoalTerm(child, declaredParameters));
            continue;
        }

        // Unhandled case
        console.log('Subgoal atom had unhandled child: ', child);
        parsedTokens.push(...consume(child));
    }
    return parsedTokens;
}

function _computeSemanticTokensRuleSubgoal(ast: AST, declaredParameters: string[], viewPredicates: Set<string>): ParsedToken[] {
    if (!isASTType(ast, 'LITERAL')) {
        console.error('Expected AST of type LITERAL but got: ', ast);
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type LITERAL to be a non-terminal');
        return consume(ast);
    }

    let parsedTokens: ParsedToken[] = [];
    
    for (const child of ast.children) {
        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        switch (child.type) {
            case 'ATOM':
                parsedTokens.push(..._computeSemanticTokensRuleSubgoalAtom(child, declaredParameters, viewPredicates));
                break;
            case 'NEGATION_SYMBOL':
                parsedTokens.push(...consume(child, 'operator'));
                break;
            default:
                parsedTokens.push(...consume(child));
        }
    }

    return parsedTokens;
}

export function computeSemanticTokensRule(ast: AST, viewPredicates: Set<string>): ParsedToken[] {
    if (!isASTType(ast, 'RULE')) {
        console.error('Expected AST of type RULE');
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type RULE to be a non-terminal');
        return consume(ast);
    }

    let parsedTokens: ParsedToken[] = [];
    let declaredParameters: string[] = [];

    for (const child of ast.children) {
        switch (child.type) {
            case 'ATOM': // Rule head
                const {parsedTokens: headParsedTokens, declaredParameters: headDeclaredParameters} = _computeSemanticTokensRuleHead(child);
                parsedTokens.push(...headParsedTokens);
                declaredParameters = headDeclaredParameters;
                break;
            case 'LITERAL': // Rule body
                parsedTokens.push(..._computeSemanticTokensRuleSubgoal(child, declaredParameters, viewPredicates));
                break;
            default:
                parsedTokens.push(...consume(child));
        }
    }
    
    return parsedTokens;
}