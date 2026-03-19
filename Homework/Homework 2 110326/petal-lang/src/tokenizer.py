from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional


class TokenType(Enum):
    INT = auto()
    FLOAT = auto()
    STRING = auto()
    IDENT = auto()
    TRUE = auto()
    FALSE = auto()
    
    LET = auto()
    FN = auto()
    IF = auto()
    ELSE = auto()
    WHILE = auto()
    RETURN = auto()
    AND = auto()
    OR = auto()
    NOT = auto()
    
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    PERCENT = auto()
    
    EQ = auto()
    NE = auto()
    LT = auto()
    GT = auto()
    LE = auto()
    GE = auto()
    
    LPAREN = auto()
    RPAREN = auto()
    LBRACE = auto()
    RBRACE = auto()
    COMMA = auto()
    COLON = auto()
    SEMICOLON = auto()
    ASSIGN = auto()
    ARROW = auto()
    
    EOF = auto()


@dataclass
class Token:
    type: TokenType
    value: any
    line: int
    column: int


KEYWORDS = {
    'let': TokenType.LET,
    'fn': TokenType.FN,
    'if': TokenType.IF,
    'else': TokenType.ELSE,
    'while': TokenType.WHILE,
    'return': TokenType.RETURN,
    'and': TokenType.AND,
    'or': TokenType.OR,
    'not': TokenType.NOT,
    'true': TokenType.TRUE,
    'false': TokenType.FALSE,
}


class Tokenizer:
    def __init__(self, source: str):
        self.source = source
        self.pos = 0
        self.line = 1
        self.column = 1
        self.tokens = []
    
    def current(self) -> Optional[str]:
        if self.pos < len(self.source):
            return self.source[self.pos]
        return None
    
    def peek(self, offset: int = 1) -> Optional[str]:
        if self.pos + offset < len(self.source):
            return self.source[self.pos + offset]
        return None
    
    def advance(self) -> str:
        char = self.source[self.pos]
        self.pos += 1
        if char == '\n':
            self.line += 1
            self.column = 1
        else:
            self.column += 1
        return char
    
    def skip_whitespace(self) -> None:
        while True:
            c = self.current()
            if c and c in ' \t\r\n':
                self.advance()
            else:
                break
    
    def skip_comment(self) -> None:
        if self.current() == '/' and self.peek() == '/':
            while self.current() and self.current() != '\n':
                self.advance()
    
    def read_number(self) -> Token:
        start_col = self.column
        num_str = ''
        is_float = False
        
        while self.current() and (self.current().isdigit() or self.current() == '.'):
            if self.current() == '.':
                if is_float:
                    raise SyntaxError(f"Unexpected second decimal point at line {self.line}")
                is_float = True
            num_str += self.advance()
        
        if is_float:
            return Token(TokenType.FLOAT, float(num_str), self.line, start_col)
        return Token(TokenType.INT, int(num_str), self.line, start_col)
    
    def read_string(self) -> Token:
        start_col = self.column
        self.advance()
        result = ''
        
        while self.current() and self.current() != '"':
            if self.current() == '\\':
                self.advance()
                if self.current() == 'n':
                    result += '\n'
                elif self.current() == 't':
                    result += '\t'
                elif self.current() == '"':
                    result += '"'
                elif self.current() == '\\':
                    result += '\\'
                else:
                    raise SyntaxError(f"Invalid escape sequence at line {self.line}")
            else:
                result += self.advance()
        
        if not self.current():
            raise SyntaxError(f"Unterminated string at line {self.line}")
        
        self.advance()
        return Token(TokenType.STRING, result, self.line, start_col)
    
    def read_ident(self) -> Token:
        start_col = self.column
        result = ''
        
        while self.current() and (self.current().isalnum() or self.current() == '_'):
            result += self.advance()
        
        if result in KEYWORDS:
            return Token(KEYWORDS[result], result, self.line, start_col)
        return Token(TokenType.IDENT, result, self.line, start_col)
    
    def tokenize(self) -> list[Token]:
        while self.pos < len(self.source):
            self.skip_whitespace()
            
            if not self.current():
                break
            
            if self.current() == '/' and self.peek() == '/':
                self.skip_comment()
                continue
            
            start_col = self.column
            char = self.advance()
            
            if char.isdigit():
                old_pos = self.pos
                old_col = self.column
                self.pos -= 1
                self.column -= 1
                num_token = self.read_number()
                self.tokens.append(num_token)
                continue
            
            if char == '"':
                self.pos -= 1
                self.column -= 1
                self.tokens.append(self.read_string())
                continue
            
            if char.isalpha() or char == '_':
                self.pos -= 1
                self.column -= 1
                self.tokens.append(self.read_ident())
                continue
            
            if char == '-':
                if self.current() == '>':
                    self.advance()
                    self.tokens.append(Token(TokenType.ARROW, '->', self.line, start_col))
                else:
                    self.tokens.append(Token(TokenType.MINUS, '-', self.line, start_col))
            elif char == '=':
                if self.current() == '=':
                    self.advance()
                    self.tokens.append(Token(TokenType.EQ, '==', self.line, start_col))
                else:
                    self.tokens.append(Token(TokenType.ASSIGN, '=', self.line, start_col))
            elif char == '!':
                if self.current() == '=':
                    self.advance()
                    self.tokens.append(Token(TokenType.NE, '!=', self.line, start_col))
                else:
                    raise SyntaxError(f"Expected '=' after '!' at line {self.line}")
            elif char == '<':
                if self.current() == '=':
                    self.advance()
                    self.tokens.append(Token(TokenType.LE, '<=', self.line, start_col))
                else:
                    self.tokens.append(Token(TokenType.LT, '<', self.line, start_col))
            elif char == '>':
                if self.current() == '=':
                    self.advance()
                    self.tokens.append(Token(TokenType.GE, '>=', self.line, start_col))
                else:
                    self.tokens.append(Token(TokenType.GT, '>', self.line, start_col))
            else:
                token_map = {
                    '+': TokenType.PLUS,
                    '-': TokenType.MINUS,
                    '*': TokenType.STAR,
                    '/': TokenType.SLASH,
                    '%': TokenType.PERCENT,
                    '(': TokenType.LPAREN,
                    ')': TokenType.RPAREN,
                    '{': TokenType.LBRACE,
                    '}': TokenType.RBRACE,
                    ',': TokenType.COMMA,
                    ':': TokenType.COLON,
                    ';': TokenType.SEMICOLON,
                }
                if char in token_map:
                    self.tokens.append(Token(token_map[char], char, self.line, start_col))
                else:
                    raise SyntaxError(f"Unexpected character '{char}' at line {self.line}")
        
        self.tokens.append(Token(TokenType.EOF, None, self.line, self.column))
        return self.tokens
