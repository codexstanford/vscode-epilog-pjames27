"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewPredicateDefinition = void 0;
const ast_searching_1 = require("./ast-searching");
function getViewPredicateDefinition(ast, position, viewPredicateToDefinition) {
    // Need to find the token that contains the position
    const token = (0, ast_searching_1.findTokenContainingPosition)(ast, position);
    if (token === null) {
        return null;
    }
    const definitions = viewPredicateToDefinition.get(token.content);
    if (definitions === undefined) {
        return null;
    }
    return definitions;
}
exports.getViewPredicateDefinition = getViewPredicateDefinition;
//# sourceMappingURL=definition-provider.js.map