// src/lexer/_common.ts
var SINGLE_CHAR_TOKENS = {
  "(": "OPEN_PAREN",
  ")": "CLOSE_PAREN",
  "[": "OPEN_BRACKET",
  "]": "CLOSE_BRACKET",
  "!": "LIST_SEPARATOR",
  ",": "COMMA",
  ".": "PERIOD",
  "&": "AMPERSAND",
  "~": "NEGATION_SYMBOL",
  _: "VARIABLE_ANONYMOUS"
};
function isWhitespace(char) {
  return /[\s\n\r\t]/.test(char);
}
function isConstantStart(char) {
  return /[a-z0-9]/.test(char);
}
function isConstantChar(char) {
  return /[a-z0-9_.]/.test(char);
}
function isDigit(char) {
  return /[0-9]/.test(char);
}
function isVariableStart(char) {
  return /[A-Z_]/.test(char);
}
function isVariableChar(char) {
  return /[A-Za-z0-9_]/.test(char);
}
function createLexerState(input) {
  const state = {
    input,
    pos: 0,
    line: 1,
    lineBeganAtPos: 0,
    tokens: []
  };
  return state;
}
function createToken(state, type, start, errorMessage) {
  return {
    type,
    line: state.line,
    start: start - state.lineBeganAtPos,
    end: state.pos - state.lineBeganAtPos,
    content: state.input.slice(start, state.pos),
    ...errorMessage && { errorMessage }
  };
}

// src/lexer/comment.ts
function handleComment(state) {
  const start = state.pos;
  while (state.pos < state.input.length && state.input[state.pos] !== `
`) {
    state.pos++;
  }
  state.tokens.push(createToken(state, "COMMENT", start));
}

// src/lexer/constant.ts
function handleConstant(state) {
  const start = state.pos;
  while (state.pos < state.input.length && isConstantChar(state.input[state.pos])) {
    state.pos++;
  }
  if (state.input[start] === "_") {
    state.tokens.push(createToken(state, "ERROR", start, "Constants cannot start with underscore"));
    return;
  }
  state.tokens.push(createToken(state, "SYMBOL_TERM", start));
}

// src/lexer/number.ts
function handleNumber(state) {
  const start = state.pos;
  if (state.input[state.pos] === "-") {
    state.pos++;
  }
  while (state.pos < state.input.length && isDigit(state.input[state.pos])) {
    state.pos++;
  }
  if (state.input[state.pos] === "." && isDigit(state.input[state.pos + 1])) {
    state.pos++;
    while (state.pos < state.input.length && isDigit(state.input[state.pos])) {
      state.pos++;
    }
  }
  state.tokens.push(createToken(state, "NUMBER", start));
}

// src/lexer/string.ts
function handleString(state) {
  const start = state.pos;
  state.pos++;
  while (state.pos < state.input.length && state.input[state.pos] !== '"' && state.input[state.pos] !== `
`) {
    state.pos++;
  }
  if (state.pos >= state.input.length || state.input[state.pos] === `
`) {
    state.tokens.push(createToken(state, "ERROR", start, "Unterminated string"));
  } else {
    state.pos++;
    state.tokens.push(createToken(state, "STRING", start));
  }
}

// src/lexer/whitespace.ts
function handleWhitespace(state) {
  const start = state.pos;
  while (state.pos < state.input.length && isWhitespace(state.input[state.pos])) {
    if (state.input[state.pos] === `
`) {
      state.pos++;
      state.tokens.push(createToken(state, "WHITESPACE", start));
      state.line++;
      state.lineBeganAtPos = state.pos;
      return;
    }
    state.pos++;
  }
  state.tokens.push(createToken(state, "WHITESPACE", start));
}

// src/dataset-lexer.ts
function datasetLexer(input) {
  const state = createLexerState(input);
  while (state.pos < input.length) {
    const char = input[state.pos];
    const start = state.pos;
    if (isWhitespace(char)) {
      handleWhitespace(state);
    } else if (isDigit(char) || char === "-" && isDigit(input[state.pos + 1])) {
      handleNumber(state);
    } else if (isConstantStart(char)) {
      handleConstant(state);
    } else if (char === '"') {
      handleString(state);
    } else if (char === "%") {
      handleComment(state);
    } else if (char in SINGLE_CHAR_TOKENS) {
      state.pos++;
      state.tokens.push(createToken(state, SINGLE_CHAR_TOKENS[char], start));
    } else {
      state.pos++;
      state.tokens.push(createToken(state, "ERROR", start, `Unexpected character: ${char}`));
    }
  }
  return state.tokens;
}
// src/lexer/variable.ts
function handleVariable(state) {
  const start = state.pos;
  if (state.input[start] === "_" && (state.pos + 1 >= state.input.length || !isVariableChar(state.input[state.pos + 1]))) {
    state.pos++;
    state.tokens.push(createToken(state, "VARIABLE_ANONYMOUS", start));
    return;
  }
  while (state.pos < state.input.length && isVariableChar(state.input[state.pos])) {
    state.pos++;
  }
  state.tokens.push(createToken(state, "VARIABLE_NAMED", start));
}

// src/lexer/operator.ts
function handleOperator(state) {
  const start = state.pos;
  const next = state.input[state.pos + 1];
  if (state.input[start] === ":") {
    if (next === "-") {
      state.pos += 2;
      state.tokens.push(createToken(state, "RULE_SEPARATOR_NECK", start));
    } else if (next === ":") {
      state.pos += 2;
      state.tokens.push(createToken(state, "DOUBLE_COLON", start));
    } else if (next === "=") {
      state.pos += 2;
      state.tokens.push(createToken(state, "DEFINITION_SEPARATOR", start));
    } else {
      state.pos++;
      state.tokens.push(createToken(state, "ERROR", start, "Invalid operator"));
    }
    return;
  }
  if (state.input[start] === "=" && next === "=" && state.input[state.pos + 2] === ">") {
    state.pos += 3;
    state.tokens.push(createToken(state, "DOUBLE_ARROW", start));
    return;
  }
  state.pos++;
  state.tokens.push(createToken(state, "ERROR", start, "Invalid operator"));
}

// src/ruleset-lexer.ts
function rulesetLexer(input) {
  const state = createLexerState(input);
  while (state.pos < input.length) {
    const char = input[state.pos];
    const start = state.pos;
    if (isWhitespace(char)) {
      handleWhitespace(state);
    } else if (isDigit(char) || char === "-" && isDigit(input[state.pos + 1])) {
      handleNumber(state);
    } else if (isVariableStart(char)) {
      handleVariable(state);
    } else if (isConstantStart(char)) {
      handleConstant(state);
    } else if (char === '"') {
      handleString(state);
    } else if (char === "%") {
      handleComment(state);
    } else if (char === ":" || char === "=") {
      handleOperator(state);
    } else if (char in SINGLE_CHAR_TOKENS) {
      state.pos++;
      state.tokens.push(createToken(state, SINGLE_CHAR_TOKENS[char], start));
    } else {
      state.pos++;
      state.tokens.push(createToken(state, "ERROR", start, `Unexpected character: ${char}`));
    }
  }
  return state.tokens;
}
// src/parser/_control-flow.ts
function createParserState(tokens, setType) {
  return {
    setType,
    tokens,
    current: 0
  };
}
function peek(state) {
  return state.current < state.tokens.length ? state.tokens[state.current] : null;
}
function advance(state) {
  if (state.current >= state.tokens.length)
    return [null, state];
  const token = state.tokens[state.current];
  return [token, { ...state, current: state.current + 1 }];
}
function createErrorObjectAndAdvanceToNextLine(state, errorMessage) {
  let currentToken = peek(state);
  if (!currentToken)
    return [
      {
        type: "ERROR",
        start: state.tokens[state.tokens.length - 1].end,
        end: state.tokens[state.tokens.length - 1].end + 1,
        line: state.tokens[state.tokens.length - 1].line,
        content: "",
        errorMessage
      },
      state
    ];
  const children = [];
  const currentLine = currentToken.line;
  let currentState = state;
  while (currentToken && currentToken.line === currentLine) {
    children.push(currentToken);
    currentState = advance(currentState)[1];
    currentToken = peek(currentState);
  }
  return [
    {
      type: "ERROR",
      start: children[0].start,
      end: children[children.length - 1].end,
      line: children[0].line,
      content: children.map((c) => c.content).join(""),
      errorMessage,
      children
    },
    currentState
  ];
}

// src/parser/_common.ts
function isWhitespaceOrComment(token) {
  return token.type === "WHITESPACE" || token.type === "COMMENT";
}
function getLastNonWhitespaceOrCommentObject(tokens) {
  for (let i = tokens.length - 1;i >= 0; i--) {
    if (!isWhitespaceOrComment(tokens[i]))
      return tokens[i];
  }
  return null;
}
function consumeWhitespacesAndComments(state) {
  const children = [];
  let currentState = state;
  while (peek(currentState) && isWhitespaceOrComment(peek(currentState))) {
    const [token, newState] = advance(currentState);
    if (!token)
      throw Error("If peeked token exists, advance should also return a token");
    children.push(token);
    currentState = newState;
  }
  return [children, currentState];
}
function createParserObject(type, children, errorMsg) {
  const [firstChild] = children;
  const lastChild = children[children.length - 1];
  const endLine = lastChild ? lastChild.endLine ?? lastChild.line : undefined;
  return {
    type: errorMsg ? "ERROR" : type,
    line: children.length > 0 ? firstChild.line : 1,
    start: children.length > 0 ? firstChild.start : 0,
    end: children.length > 0 ? children[children.length - 1].end : 0,
    endLine: endLine && firstChild.line !== endLine ? endLine : undefined,
    content: children.map((c) => c.content).join(""),
    children,
    ...errorMsg && { errorMessage: errorMsg }
  };
}

// src/parser/simple-term.ts
function parseSimpleTerm(state) {
  const token = peek(state);
  if (!token || !["SYMBOL_TERM", "NUMBER", "STRING"].includes(token.type))
    return [null, state];
  const [_, newState] = advance(state);
  return [
    {
      ...token,
      type: "SIMPLE_TERM",
      children: [token]
    },
    newState
  ];
}

// src/parser/list-term.ts
function parseListTerm(state, checkExclamationSeparated = true) {
  const [nilResult, nilState] = parseNilConstant(state);
  if (nilResult)
    return [nilResult, nilState];
  const [bracketResult, bracketState] = parseBracketedList(state);
  if (bracketResult)
    return [bracketResult, bracketState];
  if (checkExclamationSeparated) {
    const [exclamationResult, exclamationState] = parseExclamationSeparatedList(state);
    if (exclamationResult)
      return [exclamationResult, exclamationState];
  }
  return [null, state];
}
function parseNilConstant(state) {
  const token = peek(state);
  if (!token || token.type !== "SYMBOL_TERM" || token.content !== "nil") {
    return [null, state];
  }
  const [_, currentState] = advance(state);
  return [
    createParserObject("LIST_TERM", [createParserObject("NIL", [token])]),
    currentState
  ];
}
function parseBracketedList(state) {
  const firstToken = peek(state);
  if (!firstToken || firstToken.type !== "OPEN_BRACKET") {
    return [null, state];
  }
  const children = [firstToken];
  let currentState = advance(state)[1];
  let hasError = false;
  while (true) {
    const token = peek(currentState);
    if (!token) {
      hasError = true;
      const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, "Expected closing bracket, but found end of input");
      children.push(errorObject);
      currentState = errorState;
      break;
    }
    if (isWhitespaceOrComment(token)) {
      children.push(token);
      currentState = advance(currentState)[1];
      continue;
    }
    if (token.type === "CLOSE_BRACKET") {
      const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);
      if (lastNonWhitespace?.type === "COMMA") {
        hasError = true;
        const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, "Expected term, but found closing bracket");
        children.push(errorObject);
        currentState = errorState;
        break;
      }
      children.push(token);
      currentState = advance(currentState)[1];
      break;
    }
    const [success, newState] = parseBracketedListElement(currentState, children);
    currentState = newState;
    if (!success) {
      hasError = true;
      break;
    }
  }
  return [
    createParserObject("LIST_TERM", children, hasError ? "Invalid LIST_TERM" : undefined),
    currentState
  ];
}
function parseBracketedListElement(state, children) {
  const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);
  if (!lastNonWhitespace)
    throw Error("Expected at least opening bracket");
  const isExpectingTerm = lastNonWhitespace.type === "OPEN_BRACKET" || lastNonWhitespace.type === "COMMA";
  if (isExpectingTerm) {
    return parseTermElement(state, children);
  }
  return parseCommaElement(state, children);
}
function parseTermElement(state, children, checkExclamationSeparated) {
  const [termObject, newState] = parseTerm(state, checkExclamationSeparated);
  if (!termObject) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(newState, `Expected term, but found ${peek(newState)?.type}`);
    children.push(errorObject);
    return [false, errorState];
  }
  children.push(termObject);
  return [true, newState];
}
function parseCommaElement(state, children) {
  const token = peek(state);
  if (token?.type !== "COMMA") {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(state, `Expected comma, but found ${token?.type}`);
    children.push(errorObject);
    return [false, errorState];
  }
  children.push(token);
  return [true, advance(state)[1]];
}
function parseExclamationSeparatedList(state) {
  const [firstTerm, afterFirstTerm] = parseTerm(state, false);
  if (!firstTerm)
    return [null, state];
  const children = [firstTerm];
  let currentState = afterFirstTerm;
  let hasError = false;
  let isExpectingTerm = true;
  const [whitespaceObjects, stateAfterWhitespace] = consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects);
  currentState = stateAfterWhitespace;
  const potentialListSeparator = peek(currentState);
  if (potentialListSeparator?.type !== "LIST_SEPARATOR")
    return [null, state];
  children.push(potentialListSeparator);
  currentState = advance(currentState)[1];
  while (true) {
    const token = peek(currentState);
    if (token && isWhitespaceOrComment(token)) {
      children.push(token);
      currentState = advance(currentState)[1];
      continue;
    }
    if (isExpectingTerm) {
      const [success, newState] = parseTermElement(currentState, children, false);
      currentState = newState;
      if (!success) {
        hasError = true;
        break;
      }
      isExpectingTerm = false;
      continue;
    }
    if (token?.type === "LIST_SEPARATOR") {
      children.push(token);
      currentState = advance(currentState)[1];
      isExpectingTerm = true;
      continue;
    }
    break;
  }
  return [
    createParserObject("LIST_TERM", children, hasError ? "Invalid LIST_TERM" : undefined),
    currentState
  ];
}

// src/parser/variable.ts
function parseVariable(state) {
  const token = peek(state);
  if (!token || !["VARIABLE_ANONYMOUS", "VARIABLE_NAMED"].includes(token.type))
    return [null, state];
  const [_, newState] = advance(state);
  return [createParserObject("VARIABLE", [token]), newState];
}

// src/parser/term.ts
function parseTerm(state, checkExclamationSeparated = true) {
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult) {
    return [createParserObject("TERM", [compoundResult]), compoundState];
  }
  const [listResult, listState] = parseListTerm(state, checkExclamationSeparated);
  if (listResult) {
    return [createParserObject("TERM", [listResult]), listState];
  }
  const [constantResult, constantState] = parseSimpleTerm(state);
  if (constantResult) {
    return [createParserObject("TERM", [constantResult]), constantState];
  }
  if (state.setType === "DATASET")
    return [null, state];
  const [variableResult, variableState] = parseVariable(state);
  if (variableResult) {
    return [createParserObject("TERM", [variableResult]), variableState];
  }
  return [null, state];
}

// src/parser/compound-term.ts
function parseCompoundTerm(state) {
  const identifier = peek(state);
  if (!identifier || identifier.type !== "SYMBOL_TERM")
    return [null, state];
  const children = [identifier];
  let currentState = advance(state)[1];
  let hasError = false;
  const openParen = peek(currentState);
  if (!openParen || openParen.type !== "OPEN_PAREN") {
    return [null, state];
  }
  children.push(openParen);
  currentState = advance(currentState)[1];
  while (true) {
    const token = peek(currentState);
    if (!token) {
      hasError = true;
      const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, "Expected closing parenthesis, but found end of input");
      children.push(errorObject);
      currentState = errorState;
      break;
    }
    if (isWhitespaceOrComment(token)) {
      children.push(token);
      currentState = advance(currentState)[1];
      continue;
    }
    if (token.type === "CLOSE_PAREN") {
      const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);
      if (lastNonWhitespace?.type === "COMMA") {
        hasError = true;
        const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, "Expected term, but found closing parenthesis");
        children.push(errorObject);
        currentState = errorState;
        break;
      }
      children.push(token);
      currentState = advance(currentState)[1];
      break;
    }
    const [success, newState] = parseCompoundTermElement(currentState, children);
    currentState = newState;
    if (!success) {
      hasError = true;
      break;
    }
  }
  return [
    createParserObject("COMPOUND_TERM", children, hasError ? "Invalid compound term structure" : undefined),
    currentState
  ];
}
function parseCompoundTermElement(state, children) {
  const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);
  if (!lastNonWhitespace)
    throw Error("Expected at least constant and opening parenthesis");
  const isExpectingTerm = lastNonWhitespace.type === "OPEN_PAREN" || lastNonWhitespace.type === "COMMA";
  if (isExpectingTerm) {
    return parseTermElement2(state, children);
  }
  return parseCommaElement2(state, children);
}
function parseTermElement2(state, children) {
  const [termObject, newState] = parseTerm(state);
  if (!termObject) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(state, `Expected term, but found ${peek(state)?.type}`);
    children.push(errorObject);
    return [false, errorState];
  }
  children.push(termObject);
  return [true, newState];
}
function parseCommaElement2(state, children) {
  const token = peek(state);
  if (token?.type !== "COMMA") {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(state, `Expected comma, but found ${token?.type}`);
    children.push(errorObject);
    return [false, errorState];
  }
  children.push(token);
  return [true, advance(state)[1]];
}

// src/parser/fact.ts
function parseFact(state) {
  const children = [];
  let currentState = state;
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult) {
    children.push(...compoundResult.children || []);
    currentState = compoundState;
  } else {
    const nextToken2 = peek(currentState);
    if (!nextToken2) {
      return [null, currentState];
    }
    if (nextToken2.type === "SYMBOL_TERM" || nextToken2.type === "NUMBER" || nextToken2.type === "STRING") {
      children.push(nextToken2);
      currentState = advance(currentState)[1];
    }
  }
  if (children.length === 0) {
    return [null, currentState];
  }
  const nextToken = peek(currentState);
  if (nextToken?.type === "PERIOD") {
    children.push(nextToken);
    currentState = advance(currentState)[1];
  }
  return [createParserObject("FACT", children), currentState];
}

// src/parser/dataset.ts
function parseDataset(tokens) {
  let currentState = createParserState(tokens, "DATASET");
  const children = [];
  while (true) {
    const [whitespaces, afterWhitespace] = consumeWhitespacesAndComments(currentState);
    const hadWhitespace = whitespaces.length > 0;
    if (hadWhitespace) {
      children.push(...whitespaces);
      currentState = afterWhitespace;
    }
    const [fact, afterFact] = parseFact(currentState);
    if (!fact && !hadWhitespace) {
      if (peek(currentState)) {
        const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, `Expected a fact or whitespace, got ${peek(currentState)?.content} instead.`);
        children.push(errorObject);
        currentState = errorState;
        continue;
      }
      break;
    }
    if (fact) {
      children.push(fact);
      currentState = afterFact;
    }
  }
  return createParserObject("DATASET", children);
}
// src/parser/definition.ts
function parseDefinition(state) {
  const [termResult1, termState1] = parseTerm(state);
  if (!termResult1)
    return [null, state];
  const children = [termResult1];
  let currentState = termState1;
  const [whitespaceObjects1, stateAfterWhitespace1] = consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects1);
  currentState = stateAfterWhitespace1;
  const ruleNeck = peek(currentState);
  if (ruleNeck?.type !== "DEFINITION_SEPARATOR") {
    return [null, state];
  }
  children.push(ruleNeck);
  currentState = advance(currentState)[1];
  const [whitespaceObjects2, stateAfterWhitespace2] = consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects2);
  currentState = stateAfterWhitespace2;
  const [termResult2, termState2] = parseTerm(currentState);
  if (!termResult2) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, "A definition separator must be followed by a term, got instead:" + (peek(currentState)?.type || "EOF"));
    children.push(errorObject);
    currentState = errorState;
    return [
      createParserObject("ERROR", children, "Invalid operation structure"),
      currentState
    ];
  }
  children.push(termResult2);
  currentState = termState2;
  const [whitespaceObjects3, stateAfterWhitespace3] = consumeWhitespacesAndComments(currentState);
  const period = peek(stateAfterWhitespace3);
  if (period?.type === "PERIOD") {
    children.push(...whitespaceObjects3);
    currentState = stateAfterWhitespace3;
    children.push(period);
    currentState = advance(currentState)[1];
  }
  return [createParserObject("DEFINITION", children), currentState];
}

// src/parser/atom.ts
function parseAtom(state) {
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult && compoundResult.children) {
    return [createParserObject("ATOM", compoundResult.children), compoundState];
  }
  const nextToken = peek(state);
  if (!nextToken || nextToken.type !== "SYMBOL_TERM") {
    return [null, state];
  }
  return [createParserObject("ATOM", [nextToken]), advance(state)[1]];
}

// src/parser/literal.ts
function parseLiteral(state) {
  const nextToken = peek(state);
  let currentState = state;
  const children = [];
  if (nextToken && nextToken.type === "NEGATION_SYMBOL") {
    children.push(nextToken);
    currentState = advance(currentState)[1];
  }
  const [atomResult, atomState] = parseAtom(currentState);
  if (!atomResult) {
    if (nextToken && nextToken.type === "NEGATION_SYMBOL") {
      return [
        createParserObject("ERROR", children, `Negaion symbol must be followed by an atom. Found instead: ${peek(currentState)?.content}`),
        currentState
      ];
    }
    return [null, state];
  }
  children.push(atomResult);
  return [createParserObject("LITERAL", children), atomState];
}

// src/parser/rule.ts
function parseRule(state) {
  const [atomResult, atomState] = parseAtom(state);
  if (!atomResult)
    return [null, state];
  const children = [atomResult];
  let currentState = atomState;
  let hasError = false;
  const [whitespaceObjects, stateAfterWhitespace] = consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects);
  currentState = stateAfterWhitespace;
  const ruleNeck = peek(currentState);
  if (ruleNeck?.type === "RULE_SEPARATOR_NECK") {
    children.push(ruleNeck);
    currentState = advance(currentState)[1];
    const [literalsResult, newState, literalsHasError] = parseOneOrMoreAmpersandSeparatedLiterals(currentState);
    children.push(...literalsResult);
    currentState = newState;
    hasError = hasError || literalsHasError;
  }
  const period = peek(currentState);
  if (period?.type === "PERIOD") {
    children.push(period);
    currentState = advance(currentState)[1];
  }
  return [
    createParserObject("RULE", children, hasError ? "Invalid rule structure" : undefined),
    currentState
  ];
}
function parseOneOrMoreAmpersandSeparatedLiterals(state) {
  const children = [];
  let currentState = state;
  let hasError = false;
  while (true) {
    const token = peek(currentState);
    if (!token || token.type === "PERIOD") {
      const lastNonWhitespaceToken = getLastNonWhitespaceOrCommentObject(children);
      if (lastNonWhitespaceToken?.type === "AMPERSAND") {
        hasError = true;
        const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, "An ampersand must be followed by a literal, got instead:" + (token ? token?.type : "EOF"));
        children.push(errorObject);
        currentState = errorState;
      }
      break;
    }
    if (isWhitespaceOrComment(token)) {
      children.push(token);
      currentState = advance(currentState)[1];
      continue;
    }
    const [shouldContinue, newState] = parseRuleBodyElement(currentState, children);
    currentState = newState;
    if (!shouldContinue) {
      hasError = children[children.length - 1].type === "ERROR";
      break;
    }
  }
  if (children.filter((child) => child.type === "LITERAL").length === 0) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, "At least one literal was expected");
    return [[errorObject], errorState, true];
  }
  return [children, currentState, hasError];
}
function parseRuleBodyElement(state, children) {
  const lastNonWhitespaceToken = getLastNonWhitespaceOrCommentObject(children);
  const isExpectingLiteral = lastNonWhitespaceToken === null || lastNonWhitespaceToken.type === "RULE_SEPARATOR_NECK" || lastNonWhitespaceToken.type === "AMPERSAND";
  if (isExpectingLiteral) {
    return parseLiteralElement(state, children);
  }
  return parseOptionalAmpersandElement(state, children);
}
function parseLiteralElement(state, children) {
  const [literalObject, newState] = parseLiteral(state);
  if (!literalObject) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(state, `Expected literal, but found ${peek(state)?.type}`);
    children.push(errorObject);
    return [false, errorState];
  }
  children.push(literalObject);
  return [true, newState];
}
function parseOptionalAmpersandElement(state, children) {
  const token = peek(state);
  if (token?.type !== "AMPERSAND") {
    return [false, state];
  }
  children.push(token);
  return [true, advance(state)[1]];
}

// src/parser/operation.ts
function parseOperation(state) {
  const [atomResult, atomState] = parseAtom(state);
  if (!atomResult)
    return [null, state];
  const children = [atomResult];
  let currentState = atomState;
  let hasError = false;
  const [whitespaceObjects1, stateAfterWhitespace1] = consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects1);
  currentState = stateAfterWhitespace1;
  const doubleColon = peek(currentState);
  if (doubleColon?.type !== "DOUBLE_COLON") {
    return [null, state];
  }
  children.push(doubleColon);
  currentState = advance(currentState)[1];
  const [whitespaceObjects2, stateAfterWhitespace2] = consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects2);
  currentState = stateAfterWhitespace2;
  const [literalsResult, newState, literalsHasError] = parseOneOrMoreAmpersandSeparatedLiterals(currentState);
  children.push(...literalsResult);
  currentState = newState;
  hasError = hasError || literalsHasError;
  const possibleDoubleArrow = peek(currentState);
  if (possibleDoubleArrow?.type === "DOUBLE_ARROW") {
    children.push(possibleDoubleArrow);
    currentState = advance(currentState)[1];
    const [literalsResult2, newState2, literalsHasError2] = parseOneOrMoreAmpersandSeparatedLiterals(currentState);
    children.push(...literalsResult2);
    currentState = newState2;
    hasError = hasError || literalsHasError2;
  }
  const period = peek(currentState);
  if (period?.type === "PERIOD") {
    children.push(period);
    currentState = advance(currentState)[1];
  }
  return [
    createParserObject("OPERATION", children, hasError ? "Invalid operation structure" : undefined),
    currentState
  ];
}

// src/parser/ruleset.ts
function parseRuleset(tokens) {
  let currentState = createParserState(tokens, "RULESET");
  const children = [];
  while (true) {
    const [whitespaces, afterWhitespace] = consumeWhitespacesAndComments(currentState);
    const hadWhitespace = whitespaces.length > 0;
    if (hadWhitespace) {
      children.push(...whitespaces);
      currentState = afterWhitespace;
    }
    const [operation, afterOperation] = parseOperation(currentState);
    if (operation) {
      children.push(operation);
      currentState = afterOperation;
      continue;
    }
    const [definition, afterDefinition] = parseDefinition(currentState);
    if (definition) {
      children.push(definition);
      currentState = afterDefinition;
      continue;
    }
    const [rule, afterRule] = parseRule(currentState);
    if (rule) {
      children.push(rule);
      currentState = afterRule;
      continue;
    }
    const nextToken = peek(currentState);
    if (!nextToken)
      break;
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(currentState, `Expected a rule, an operation, a definition, whitespace, or a comment, got ${nextToken.type} instead.`);
    children.push(errorObject);
    currentState = errorState;
  }
  return createParserObject("RULESET", children);
}
export {
  rulesetLexer,
  parseRuleset,
  parseDataset,
  datasetLexer
};
