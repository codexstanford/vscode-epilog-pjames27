"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSemanticTokensFact = void 0;
const common_1 = require("./common");
function _computeSemanticTokensFactCompoundTerm(ast) {
    if (!(0, common_1.isASTType)(ast, 'COMPOUND_TERM')) {
        console.error('Expected AST of type COMPOUND_TERM but got: ', ast);
        return (0, common_1.consume)(ast);
    }
    if (!(0, common_1.isNonTerminal)(ast)) {
        console.error('Expected AST of type COMPOUND_TERM to be a non-terminal');
        return (0, common_1.consume)(ast);
    }
    // Handle the constructor of the compound term
    const constructor = ast.children[0];
    if (!(0, common_1.isASTType)(constructor, 'SYMBOL_TERM')) {
        console.error('Expected AST of type COMPOUND_TERM to have a SYMBOL_TERM constructor');
        return (0, common_1.consume)(ast);
    }
    let parsedTokens = [...(0, common_1.handleConstructor)(constructor)];
    // Handle the arguments of the compound term
    for (const child of ast.children.slice(1)) {
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        parsedTokens.push(..._computeSemanticTokensFactTerm(child));
    }
    return parsedTokens;
}
function _computeSemanticTokensFactTerm(ast) {
    if (!(0, common_1.isNonLeafTermType)(ast)) {
        console.error('Expected non-leaf term AST but got: ', ast);
        return (0, common_1.consume)(ast);
    }
    if (!(0, common_1.isNonTerminal)(ast)) {
        console.error('Expected AST of type TERM to be a non-terminal');
        return (0, common_1.consume)(ast);
    }
    let parsedTokens = [];
    for (const child of ast.children) {
        if (common_1.BUILT_IN_VALUES.includes(child.content)) {
            parsedTokens.push(...(0, common_1.handleBuiltinValue)(child));
            continue;
        }
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        switch (child.type) {
            case 'STRING':
                parsedTokens.push(...(0, common_1.consume)(child, 'string'));
                break;
            case 'NUMBER':
                parsedTokens.push(...(0, common_1.consume)(child, 'number'));
                break;
            case 'SYMBOL_TERM':
                parsedTokens.push(...(0, common_1.consume)(child, 'variable', ['readonly']));
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
                parsedTokens.push(...(0, common_1.consume)(child));
                break;
            default:
                console.error('Unhandled fact term:', child);
                parsedTokens.push(...(0, common_1.consume)(child));
        }
    }
    return parsedTokens;
}
function computeSemanticTokensFact(ast) {
    if (!(0, common_1.isASTType)(ast, 'FACT')) {
        console.error('Expected AST of type FACT');
        return (0, common_1.consume)(ast);
    }
    if (!(0, common_1.isNonTerminal)(ast)) {
        console.error('Expected AST of type FACT to be a non-terminal');
        return (0, common_1.consume)(ast);
    }
    // Handle the first child, i.e. the predicate
    const predicate = ast.children[0];
    if (!(0, common_1.isASTType)(predicate, 'SYMBOL_TERM')) {
        console.error('Expected AST of type ATOM to have a predicate but got: ', predicate);
        return (0, common_1.consume)(ast);
    }
    let predicateTokens = [...(0, common_1.handleBasePred)(predicate)];
    let parsedTokens = [...predicateTokens];
    // Handle the rest of the children, i.e. the arguments
    for (const child of ast.children.slice(1)) {
        switch (child.type) {
            case 'TERM':
                parsedTokens.push(..._computeSemanticTokensFactTerm(child));
                break;
            default:
                parsedTokens.push(...(0, common_1.consume)(child));
        }
    }
    return parsedTokens;
}
exports.computeSemanticTokensFact = computeSemanticTokensFact;
//# sourceMappingURL=fact.js.map