from dataclasses import dataclass
from typing import Optional
from .tokenizer import Token, TokenType


@dataclass
class ASTNode:
    pass


@dataclass
class IntLiteral(ASTNode):
    value: int


@dataclass
class FloatLiteral(ASTNode):
    value: float


@dataclass
class StringLiteral(ASTNode):
    value: str


@dataclass
class BoolLiteral(ASTNode):
    value: bool


@dataclass
class Identifier(ASTNode):
    name: str


@dataclass
class BinaryOp(ASTNode):
    left: ASTNode
    operator: str
    right: ASTNode


@dataclass
class UnaryOp(ASTNode):
    operator: str
    operand: ASTNode


@dataclass
class CallExpr(ASTNode):
    callee: str
    args: list[ASTNode]


@dataclass
class VarDecl(ASTNode):
    name: str
    var_type: str
    value: ASTNode


@dataclass
class FuncDecl(ASTNode):
    name: str
    params: list[tuple[str, str]]
    return_type: str
    body: list[ASTNode]


@dataclass
class IfStmt(ASTNode):
    condition: ASTNode
    then_block: list[ASTNode]
    else_ifs: list[tuple[ASTNode, list[ASTNode]]]
    else_block: Optional[list[ASTNode]]


@dataclass
class WhileStmt(ASTNode):
    condition: ASTNode
    body: list[ASTNode]


@dataclass
class ReturnStmt(ASTNode):
    value: Optional[ASTNode]


@dataclass
class ExprStmt(ASTNode):
    expr: ASTNode


@dataclass
class AssignStmt(ASTNode):
    name: str
    value: ASTNode


class Parser:
    def __init__(self, tokens: list[Token]):
        self.tokens = tokens
        self.pos = 0
    
    def current(self) -> Token:
        return self.tokens[self.pos]
    
    def peek(self, offset: int = 1) -> Token:
        if self.pos + offset < len(self.tokens):
            return self.tokens[self.pos + offset]
        return self.tokens[-1]
    
    def advance(self) -> Token:
        token = self.tokens[self.pos]
        self.pos += 1
        return token
    
    def expect(self, token_type: TokenType) -> Token:
        if self.current().type != token_type:
            raise SyntaxError(
                f"Expected {token_type} at line {self.current().line}, "
                f"got {self.current().type}"
            )
        return self.advance()
    
    def parse(self) -> list[ASTNode]:
        statements = []
        while self.current().type != TokenType.EOF:
            statements.append(self.parse_statement())
        return statements
    
    def parse_statement(self) -> ASTNode:
        token = self.current()
        
        if token.type == TokenType.LET:
            return self.parse_var_decl()
        elif token.type == TokenType.FN:
            return self.parse_func_decl()
        elif token.type == TokenType.IF:
            return self.parse_if()
        elif token.type == TokenType.WHILE:
            return self.parse_while()
        elif token.type == TokenType.RETURN:
            return self.parse_return()
        elif token.type == TokenType.IDENT:
            if self.peek().type == TokenType.ASSIGN:
                return self.parse_assign()
            return self.parse_expr_statement()
        else:
            return self.parse_expr_statement()
    
    def parse_var_decl(self) -> VarDecl:
        self.advance()
        name = self.expect(TokenType.IDENT).value
        self.expect(TokenType.COLON)
        var_type = self.expect(TokenType.IDENT).value
        self.expect(TokenType.ASSIGN)
        value = self.parse_expr()
        self.expect(TokenType.SEMICOLON)
        return VarDecl(name, var_type, value)
    
    def parse_func_decl(self) -> FuncDecl:
        self.advance()
        name = self.expect(TokenType.IDENT).value
        self.expect(TokenType.LPAREN)
        
        params = []
        while self.current().type != TokenType.RPAREN:
            param_name = self.expect(TokenType.IDENT).value
            self.expect(TokenType.COLON)
            param_type = self.expect(TokenType.IDENT).value
            params.append((param_name, param_type))
            if self.current().type == TokenType.COMMA:
                self.advance()
        
        self.expect(TokenType.RPAREN)
        self.expect(TokenType.ARROW)
        return_type = self.expect(TokenType.IDENT).value
        body = self.parse_block()
        
        return FuncDecl(name, params, return_type, body)
    
    def parse_if(self) -> IfStmt:
        self.advance()
        condition = self.parse_expr()
        then_block = self.parse_block()
        
        else_ifs = []
        else_block = None
        
        while self.current().type == TokenType.ELSE:
            self.advance()
            if self.current().type == TokenType.IF:
                self.advance()
                elif_cond = self.parse_expr()
                elif_block = self.parse_block()
                else_ifs.append((elif_cond, elif_block))
            else:
                else_block = self.parse_block()
                break
        
        return IfStmt(condition, then_block, else_ifs, else_block)
    
    def parse_while(self) -> WhileStmt:
        self.advance()
        condition = self.parse_expr()
        body = self.parse_block()
        return WhileStmt(condition, body)
    
    def parse_return(self) -> ReturnStmt:
        self.advance()
        if self.current().type == TokenType.SEMICOLON:
            self.advance()
            return ReturnStmt(None)
        value = self.parse_expr()
        self.expect(TokenType.SEMICOLON)
        return ReturnStmt(value)
    
    def parse_assign(self) -> AssignStmt:
        name = self.expect(TokenType.IDENT).value
        self.expect(TokenType.ASSIGN)
        value = self.parse_expr()
        self.expect(TokenType.SEMICOLON)
        return AssignStmt(name, value)
    
    def parse_expr_statement(self) -> ExprStmt:
        expr = self.parse_expr()
        self.expect(TokenType.SEMICOLON)
        return ExprStmt(expr)
    
    def parse_block(self) -> list[ASTNode]:
        self.expect(TokenType.LBRACE)
        statements = []
        while self.current().type != TokenType.RBRACE:
            statements.append(self.parse_statement())
        self.expect(TokenType.RBRACE)
        return statements
    
    def parse_expr(self) -> ASTNode:
        return self.parse_or()
    
    def parse_or(self) -> ASTNode:
        left = self.parse_and()
        while self.current().type == TokenType.OR:
            self.advance()
            right = self.parse_and()
            left = BinaryOp(left, 'or', right)
        return left
    
    def parse_and(self) -> ASTNode:
        left = self.parse_equality()
        while self.current().type == TokenType.AND:
            self.advance()
            right = self.parse_equality()
            left = BinaryOp(left, 'and', right)
        return left
    
    def parse_equality(self) -> ASTNode:
        left = self.parse_comparison()
        while self.current().type in (TokenType.EQ, TokenType.NE):
            op = self.advance().value
            right = self.parse_comparison()
            left = BinaryOp(left, op, right)
        return left
    
    def parse_comparison(self) -> ASTNode:
        left = self.parse_term()
        while self.current().type in (TokenType.LT, TokenType.GT, TokenType.LE, TokenType.GE):
            op = self.advance().value
            right = self.parse_term()
            left = BinaryOp(left, op, right)
        return left
    
    def parse_term(self) -> ASTNode:
        left = self.parse_factor()
        while self.current().type in (TokenType.PLUS, TokenType.MINUS):
            op = self.advance().value
            right = self.parse_factor()
            left = BinaryOp(left, op, right)
        return left
    
    def parse_factor(self) -> ASTNode:
        left = self.parse_unary()
        while self.current().type in (TokenType.STAR, TokenType.SLASH, TokenType.PERCENT):
            op = self.advance().value
            right = self.parse_unary()
            left = BinaryOp(left, op, right)
        return left
    
    def parse_unary(self) -> ASTNode:
        if self.current().type == TokenType.MINUS:
            self.advance()
            return UnaryOp('-', self.parse_unary())
        if self.current().type == TokenType.NOT:
            self.advance()
            return UnaryOp('not', self.parse_unary())
        return self.parse_call()
    
    def parse_call(self) -> ASTNode:
        expr = self.parse_primary()
        
        while self.current().type == TokenType.LPAREN:
            self.advance()
            args = []
            while self.current().type != TokenType.RPAREN:
                args.append(self.parse_expr())
                if self.current().type == TokenType.COMMA:
                    self.advance()
            self.expect(TokenType.RPAREN)
            expr = CallExpr(expr.name if isinstance(expr, Identifier) else '', args)
        
        return expr
    
    def parse_primary(self) -> ASTNode:
        token = self.current()
        
        if token.type == TokenType.INT:
            self.advance()
            return IntLiteral(token.value)
        
        if token.type == TokenType.FLOAT:
            self.advance()
            return FloatLiteral(token.value)
        
        if token.type == TokenType.STRING:
            self.advance()
            return StringLiteral(token.value)
        
        if token.type == TokenType.TRUE:
            self.advance()
            return BoolLiteral(True)
        
        if token.type == TokenType.FALSE:
            self.advance()
            return BoolLiteral(False)
        
        if token.type == TokenType.IDENT:
            self.advance()
            return Identifier(token.value)
        
        if token.type == TokenType.LPAREN:
            self.advance()
            expr = self.parse_expr()
            self.expect(TokenType.RPAREN)
            return expr
        
        raise SyntaxError(f"Unexpected token {token.type} at line {token.line}")
