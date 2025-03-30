"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSemanticTokensRule = void 0;
const common_1 = require("./common");
function _computeSemanticTokensRuleHeadCompoundTerm(ast) {
    if (ast.type !== 'COMPOUND_TERM') {
        console.error('Expected AST of type COMPOUND_TERM');
        return { parsedTokens: (0, common_1.consume)(ast), declaredParameters: [] };
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type COMPOUND_TERM to have children');
        return { parsedTokens: (0, common_1.consume)(ast), declaredParameters: [] };
    }
    // Handle the constructor of the compound term
    const constructor = ast.children.shift();
    if (constructor.type !== 'SYMBOL_TERM') {
        console.error('Expected AST of type COMPOUND_TERM to have a constructor');
        return { parsedTokens: (0, common_1.consume)(ast), declaredParameters: [] };
    }
    let parsedTokens = [...(0, common_1.consume)(constructor, 'struct')];
    let declaredParameters = [];
    // Handle the arguments of the compound term
    for (const child of ast.children) {
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        const { parsedTokens: childParsedTokens, declaredParameters: childDeclaredParameters } = _computeSemanticTokensRuleHeadTerm(child);
        parsedTokens.push(...childParsedTokens);
        declaredParameters.push(...childDeclaredParameters);
    }
    return { parsedTokens, declaredParameters };
}
function _computeSemanticTokensRuleHeadTerm(ast) {
    const COMPLEX_TERM_TYPES = ['TERM', 'COMPOUND_TERM', 'LIST_TERM', 'SIMPLE_TERM'];
    if (!COMPLEX_TERM_TYPES.includes(ast.type)) {
        console.error('Expected AST of type TERM, COMPOUND_TERM, LIST_TERM, or SIMPLE_TERM but got: ', ast);
        return { parsedTokens: (0, common_1.consume)(ast), declaredParameters: [] };
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected rule head TERM to have children');
        return { parsedTokens: (0, common_1.consume)(ast), declaredParameters: [] };
    }
    let parsedTokens = [];
    let declaredParameters = [];
    for (const child of ast.children) {
        if (common_1.BUILT_IN_VALUES.includes(child.content)) {
            parsedTokens.push(...(0, common_1.handleBuiltinValue)(child));
            continue;
        }
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        // Recursively handle other children
        switch (child.type) {
            case 'VARIABLE':
                parsedTokens.push(...(0, common_1.consume)(child, 'parameter', ['declaration']));
                declaredParameters.push(child.content);
                break;
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
                const { parsedTokens: simpleTermParsedTokens, declaredParameters: simpleTermDeclaredParameters } = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...simpleTermParsedTokens);
                declaredParameters.push(...simpleTermDeclaredParameters);
                break;
            case 'COMPOUND_TERM':
                const { parsedTokens: compoundTermParsedTokens, declaredParameters: compoundTermDeclaredParameters } = _computeSemanticTokensRuleHeadCompoundTerm(child);
                parsedTokens.push(...compoundTermParsedTokens);
                declaredParameters.push(...compoundTermDeclaredParameters);
                break;
            case 'LIST_TERM':
                const { parsedTokens: listTermParsedTokens, declaredParameters: listTermDeclaredParameters } = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...listTermParsedTokens);
                declaredParameters.push(...listTermDeclaredParameters);
                break;
            case 'TERM':
                const { parsedTokens: termParsedTokens, declaredParameters: termDeclaredParameters } = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...termParsedTokens);
                declaredParameters.push(...termDeclaredParameters);
                break;
            default:
                console.log('Unhandled rule head term: ', child);
                parsedTokens.push(...(0, common_1.consume)(child));
        }
    }
    return { parsedTokens, declaredParameters };
}
function _computeSemanticTokensRuleHead(ast) {
    if (ast.type !== 'ATOM') {
        console.error('Expected AST of type ATOM');
        return { parsedTokens: (0, common_1.consume)(ast), declaredParameters: [] };
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type ATOM to have children');
        return { parsedTokens: (0, common_1.consume)(ast), declaredParameters: [] };
    }
    let parsedTokens = [];
    let declaredParameters = [];
    // Now parse the rest of the children, i.e. the arguments
    for (const child of ast.children) {
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        switch (child.type) {
            case 'SYMBOL_TERM':
                parsedTokens.push(...(0, common_1.consume)(child, 'function', ['declaration']));
                break;
            case 'TERM':
                const { parsedTokens: termParsedTokens, declaredParameters: termDeclaredParameters } = _computeSemanticTokensRuleHeadTerm(child);
                parsedTokens.push(...termParsedTokens);
                declaredParameters.push(...termDeclaredParameters);
                break;
            default:
                parsedTokens.push(...(0, common_1.consume)(child));
        }
    }
    return { parsedTokens, declaredParameters };
}
function _computeSemanticTokensRuleSubgoalCompoundTerm(ast, declaredParameters) {
    if (ast.type !== 'COMPOUND_TERM') {
        console.error('Expected AST of type COMPOUND_TERM but got: ', ast);
        return (0, common_1.consume)(ast);
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type COMPOUND_TERM to have children');
        return (0, common_1.consume)(ast);
    }
    // Handle the constructor of the compound term
    const constructor = ast.children.shift();
    if (constructor.type !== 'SYMBOL_TERM') {
        console.error('Expected AST of type COMPOUND_TERM to have a constructor');
        return (0, common_1.consume)(ast);
    }
    let parsedTokens = [...(0, common_1.consume)(constructor, 'struct')];
    for (const child of ast.children) {
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        parsedTokens.push(..._computeSemanticTokensRuleSubgoalTerm(child, declaredParameters));
    }
    return parsedTokens;
}
function _computeSemanticTokensRuleSubgoalTerm(ast, declaredParameters) {
    const COMPLEX_TERM_TYPES = ['TERM', 'COMPOUND_TERM', 'LIST_TERM', 'SIMPLE_TERM'];
    if (!COMPLEX_TERM_TYPES.includes(ast.type)) {
        console.error('Expected AST of type TERM, COMPOUND_TERM, LIST_TERM, or SIMPLE_TERM but got: ', ast);
        return (0, common_1.consume)(ast);
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected rule head TERM to have children');
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
            case 'VARIABLE':
                if (declaredParameters.includes(child.content)) {
                    parsedTokens.push(...(0, common_1.consume)(child, 'parameter'));
                }
                else {
                    parsedTokens.push(...(0, common_1.consume)(child, 'variable', ['declaration']));
                }
                break;
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
                parsedTokens.push(...(0, common_1.consume)(child));
        }
    }
    return parsedTokens;
}
function _computeSemanticTokensRuleSubgoalAtom(ast, declaredParameters, viewPredicates) {
    if (ast.type !== 'ATOM') {
        console.error('Expected AST of type ATOM but got: ', ast);
        return (0, common_1.consume)(ast);
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type ATOM to have children');
        return (0, common_1.consume)(ast);
    }
    // Handle the first child, i.e. the predicate
    const predicate = ast.children.shift();
    if (predicate.type !== 'SYMBOL_TERM') {
        console.error('Expected AST of type ATOM to have a predicate but got: ', predicate);
        return (0, common_1.consume)(ast);
    }
    let predicateTokens = [];
    if (viewPredicates.has(predicate.content)) {
        predicateTokens = [...(0, common_1.consume)(predicate, 'function')];
    }
    else {
        predicateTokens = [...(0, common_1.consume)(predicate, 'property')];
    }
    let parsedTokens = [...predicateTokens];
    // Handle the rest of the children, i.e. the arguments
    for (const child of ast.children) {
        if (common_1.BUILT_IN_VALUES.includes(child.content)) {
            parsedTokens.push(...(0, common_1.handleBuiltinValue)(child));
            continue;
        }
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        if (child.type === 'TERM') {
            parsedTokens.push(..._computeSemanticTokensRuleSubgoalTerm(child, declaredParameters));
            continue;
        }
        // Unhandled case
        console.log('Subgoal atom had unhandled child: ', child);
        parsedTokens.push(...(0, common_1.consume)(child));
    }
    return parsedTokens;
}
function _computeSemanticTokensRuleSubgoal(ast, declaredParameters, viewPredicates) {
    if (ast.type !== 'LITERAL') {
        console.error('Expected AST of type LITERAL but got: ', ast);
        return (0, common_1.consume)(ast);
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type LITERAL to have children');
        return (0, common_1.consume)(ast);
    }
    let parsedTokens = [];
    for (const child of ast.children) {
        if (common_1.TYPES_TO_IGNORE.includes(child.type)) {
            continue;
        }
        switch (child.type) {
            case 'ATOM':
                parsedTokens.push(..._computeSemanticTokensRuleSubgoalAtom(child, declaredParameters, viewPredicates));
                break;
            case 'NEGATION_SYMBOL':
                parsedTokens.push(...(0, common_1.consume)(child, 'operator'));
                break;
            default:
                parsedTokens.push(...(0, common_1.consume)(child));
        }
    }
    return parsedTokens;
}
function computeSemanticTokensRule(ast, viewPredicates) {
    if (ast.type !== 'RULE') {
        console.error('Expected AST of type RULE');
        return (0, common_1.consume)(ast);
    }
    if (ast.children === undefined || ast.children.length === 0) {
        console.error('Expected AST of type RULE to have children');
        return (0, common_1.consume)(ast);
    }
    let parsedTokens = [];
    let declaredParameters = [];
    for (const child of ast.children) {
        switch (child.type) {
            case 'ATOM': // Rule head
                const { parsedTokens: headParsedTokens, declaredParameters: headDeclaredParameters } = _computeSemanticTokensRuleHead(child);
                parsedTokens.push(...headParsedTokens);
                declaredParameters = headDeclaredParameters;
                break;
            case 'LITERAL': // Rule body
                parsedTokens.push(..._computeSemanticTokensRuleSubgoal(child, declaredParameters, viewPredicates));
                break;
            default:
                parsedTokens.push(...(0, common_1.consume)(child));
        }
    }
    return parsedTokens;
}
exports.computeSemanticTokensRule = computeSemanticTokensRule;
//# sourceMappingURL=rule.js.map