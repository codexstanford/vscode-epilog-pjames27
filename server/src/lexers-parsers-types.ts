/* From types.ts in Paul Welter's https://github.com/codexstanford/epilog-lexers-parsers/ */

/* -------------------------------------------------------------------------- */
/*                                   Common                                   */
/* -------------------------------------------------------------------------- */

export interface Base {
    type: string;
    line: number;
    endLine?: number;
    start: number;
    end: number;
    content: string;
    errorMessage?: string;
  }
  
  /* -------------------------------------------------------------------------- */
  /*                                    Lexer                                   */
  /* -------------------------------------------------------------------------- */
  
  export type DatasetTokenType =
    | "WHITESPACE"
    | "SYMBOL_TERM"
    | "STRING"
    | "NUMBER"
    | "COMMENT"
    | "OPEN_PAREN"
    | "CLOSE_PAREN"
    | "OPEN_BRACKET"
    | "CLOSE_BRACKET"
    | "LIST_SEPARATOR"
    | "COMMA"
    | "PERIOD"
    | "ERROR";
  
  export type RulesetTokenType =
    | DatasetTokenType
    | "VARIABLE_NAMED" // a string of letters, digits, and underscores beginning with an uppercase letter
    | "VARIABLE_ANONYMOUS" // a lone underscore
    | "RULE_SEPARATOR_NECK" // :-
    | "AMPERSAND" // &
    | "NEGATION_SYMBOL" // ~
    | "DOUBLE_COLON" // ::
    | "DOUBLE_ARROW" // ==>
    | "DEFINITION_SEPARATOR"; // :=
  
  export interface Token extends Base {
    type: RulesetTokenType;
  }
  
  export interface LexerState {
    input: string;
    pos: number;
    line: number;
    lineBeganAtPos: number;
    tokens: Token[];
  }
  
  /* -------------------------------------------------------------------------- */
  /*                                   Parser                                   */
  /* -------------------------------------------------------------------------- */
  
  export type DatasetParserObjectType =
    | DatasetTokenType
    | "DATASET"
    | "FACT"
    | "TERM"
    | "SIMPLE_TERM"
    | "COMPOUND_TERM"
    | "LIST_TERM"
    | "SYMBOL_TERM"
    | "NIL";
  
  export type RulesetParserObjectType =
    | DatasetParserObjectType
    | "VARIABLE"
    | "VARIABLE_NAMED"
    | "VARIABLE_ANONYMOUS"
    | "RULE_SEPARATOR_NECK"
    | "AMPERSAND"
    | "NEGATION_SYMBOL"
    | "RULE"
    | "RULE_BODY"
    | "LITERAL"
    | "ATOM"
    | "OPERATION"
    | "DOUBLE_COLON"
    | "DOUBLE_ARROW"
    | "DEFINITION_SEPARATOR"
    | "DEFINITION" // TODO Wasn't mentioned in the spec
    | "RULESET";
  
  export interface ParserObject extends Base {
    type: RulesetParserObjectType;
    children?: ParserObject[];
  }
  
  export interface ParserState {
    setType: "DATASET" | "RULESET";
    tokens: Token[];
    current: number;
  }