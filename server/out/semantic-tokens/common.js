"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBuiltinValue = exports.consume = exports.BUILT_IN_VALUES = exports.TYPES_TO_IGNORE = void 0;
exports.TYPES_TO_IGNORE = ['WHITESPACE', 'OPEN_PAREN', 'CLOSE_PAREN', 'OPEN_BRACKET', 'CLOSE_BRACKET', 'COMMA', 'PERIOD', 'LIST_SEPARATOR', 'RULE_SEPARATOR_NECK', 'AMPERSAND', 'DOUBLE_COLON', 'DOUBLE_ARROW', 'DEFINITION_SEPARATOR'];
exports.BUILT_IN_VALUES = ['nil', 'true', 'false'];
function consume(ast, tokenTypeToUse = "", tokenModifiersToUse = []) {
    const parsedTokens = [];
    if (exports.TYPES_TO_IGNORE.includes(ast.type)) {
        return parsedTokens;
    }
    // If the token has no children, it is a leaf
    if (ast.children === undefined || ast.children.length === 0) {
        parsedTokens.push({
            line: ast.line - 1,
            start: ast.start,
            length: ast.end - ast.start,
            type: tokenTypeToUse,
            modifiers: tokenModifiersToUse
        });
        return parsedTokens;
    }
    // If the token has children, we need to consume them
    for (const child of ast.children) {
        parsedTokens.push(...consume(child, tokenTypeToUse, tokenModifiersToUse));
    }
    return parsedTokens;
}
exports.consume = consume;
function handleBuiltinValue(ast) {
    if (!exports.BUILT_IN_VALUES.includes(ast.content)) {
        console.error('Expected builtin value but got: ', ast.content);
        return [];
    }
    return consume(ast, 'variable', ['readonly', 'defaultLibrary']);
}
exports.handleBuiltinValue = handleBuiltinValue;
//# sourceMappingURL=common.js.map