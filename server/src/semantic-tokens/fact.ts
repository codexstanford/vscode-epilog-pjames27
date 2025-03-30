import { BUILT_IN_VALUES, consume, handleBasePred, handleBuiltinValue, handleConstructor, isASTType, isNonLeafTermType, isNonTerminal, ParsedToken, TYPES_TO_IGNORE } from "./common";
import { ParserObject as AST } from "../lexers-parsers-types";


function _computeSemanticTokensFactCompoundTerm(ast: AST): ParsedToken[] {
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
    if (!isASTType(constructor, 'SYMBOL_TERM')) {
        console.error('Expected AST of type COMPOUND_TERM to have a SYMBOL_TERM constructor');
        return consume(ast);
    }

    let parsedTokens: ParsedToken[] = [...handleConstructor(constructor)];
    
    // Handle the arguments of the compound term
    for (const child of ast.children.slice(1)) {
        if (TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }

        parsedTokens.push(..._computeSemanticTokensFactTerm(child));
    }

    return parsedTokens;
}
function _computeSemanticTokensFactTerm(ast: AST): ParsedToken[] {
    if (!isNonLeafTermType(ast)) {
        console.error('Expected non-leaf term AST but got: ', ast);
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type TERM to be a non-terminal');
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
                parsedTokens.push(..._computeSemanticTokensFactTerm(child));
                break;
            case 'COMPOUND_TERM':
                parsedTokens.push(..._computeSemanticTokensFactCompoundTerm(child));
                break;
            case 'LIST_TERM':   
                parsedTokens.push(..._computeSemanticTokensFactTerm(child));
                break;
            case 'TERM':
                parsedTokens.push(..._computeSemanticTokensFactTerm(child));
                break;
            case 'ERROR':
                parsedTokens.push(...consume(child));
                break;
            default:
                console.error('Unhandled fact term:', child);
                parsedTokens.push(...consume(child));
        }
    }
    return parsedTokens;
}

export function computeSemanticTokensFact(ast: AST): ParsedToken[] {
    if (!isASTType(ast, 'FACT')) {
        console.error('Expected AST of type FACT');
        return consume(ast);
    }

    if (!isNonTerminal(ast)) {
        console.error('Expected AST of type FACT to be a non-terminal');
        return consume(ast);
    }

    // Handle the first child, i.e. the predicate
    const predicate = ast.children[0] as AST;
    if (!isASTType(predicate, 'SYMBOL_TERM')) {
        console.error('Expected AST of type ATOM to have a predicate but got: ', predicate);
        return consume(ast);
    }
    
    let predicateTokens: ParsedToken[] = [...handleBasePred(predicate)];

    let parsedTokens: ParsedToken[] = [...predicateTokens];

    // Handle the rest of the children, i.e. the arguments
    for (const child of ast.children.slice(1)) {
        switch (child.type) {
            case 'TERM':
                parsedTokens.push(..._computeSemanticTokensFactTerm(child));
                break;
            default:
                parsedTokens.push(...consume(child));
        }
    }

    return parsedTokens;
}
