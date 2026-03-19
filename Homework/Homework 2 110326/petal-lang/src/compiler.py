from enum import IntEnum
from typing import Any


class OpCode(IntEnum):
    CONSTANT = 0
    LOAD_VAR = 1
    STORE_VAR = 2
    ADD = 3
    SUB = 4
    MUL = 5
    DIV = 6
    MOD = 7
    NEG = 8
    NOT = 9
    EQ = 10
    NE = 11
    LT = 12
    GT = 13
    LE = 14
    GE = 15
    JUMP = 16
    JUMP_IF_FALSE = 17
    CALL = 18
    RETURN = 19
    HALT = 20
    AND = 21
    OR = 22


class Function:
    def __init__(self, name: str, arity: int, bytecode: list[int]):
        self.name = name
        self.arity = arity
        self.bytecode = bytecode


class Compiler:
    def __init__(self, constants: list = None):
        self.constants = constants if constants is not None else []
        self.instructions: list[int] = []
        self.functions: dict[str, Function] = {}
        self.current_func: str = None
        self.var_map: dict[str, int] = {}
    
    def emit(self, opcode: OpCode, *args: int) -> None:
        self.instructions.append(opcode)
        for arg in args:
            self.instructions.append(arg)
    
    def add_constant(self, value: any) -> int:
        self.constants.append(value)
        return len(self.constants) - 1
    
    def compile(self, ast: list) -> tuple[list[int], list[Any], dict[str, Function]]:
        for node in ast:
            self.compile_node(node)
        
        self.emit(OpCode.HALT)
        return self.instructions, self.constants, self.functions
    
    def compile_node(self, node: Any) -> None:
        from .parser import (
            IntLiteral, FloatLiteral, StringLiteral, BoolLiteral,
            BinaryOp, UnaryOp, CallExpr, VarDecl, FuncDecl,
            IfStmt, WhileStmt, ReturnStmt, ExprStmt, AssignStmt, Identifier
        )
        
        if isinstance(node, IntLiteral):
            idx = self.add_constant(node.value)
            self.emit(OpCode.CONSTANT, idx)
        
        elif isinstance(node, FloatLiteral):
            idx = self.add_constant(node.value)
            self.emit(OpCode.CONSTANT, idx)
        
        elif isinstance(node, StringLiteral):
            idx = self.add_constant(node.value)
            self.emit(OpCode.CONSTANT, idx)
        
        elif isinstance(node, BoolLiteral):
            idx = self.add_constant(node.value)
            self.emit(OpCode.CONSTANT, idx)
        
        elif isinstance(node, Identifier):
            if node.name in self.var_map:
                self.emit(OpCode.LOAD_VAR, self.var_map[node.name])
            else:
                self.emit(OpCode.LOAD_VAR, self.add_constant(node.name))
        
        elif isinstance(node, BinaryOp):
            self.compile_node(node.left)
            self.compile_node(node.right)
            
            ops = {
                '+': OpCode.ADD,
                '-': OpCode.SUB,
                '*': OpCode.MUL,
                '/': OpCode.DIV,
                '%': OpCode.MOD,
                '==': OpCode.EQ,
                '!=': OpCode.NE,
                '<': OpCode.LT,
                '>': OpCode.GT,
                '<=': OpCode.LE,
                '>=': OpCode.GE,
                'and': OpCode.AND,
                'or': OpCode.OR,
            }
            self.emit(ops[node.operator])
        
        elif isinstance(node, UnaryOp):
            self.compile_node(node.operand)
            if node.operator == '-':
                self.emit(OpCode.NEG)
            elif node.operator == 'not':
                self.emit(OpCode.NOT)
        
        elif isinstance(node, CallExpr):
            for arg in node.args:
                self.compile_node(arg)
            self.emit(OpCode.CALL, self.add_constant(node.callee), len(node.args))
        
        elif isinstance(node, VarDecl):
            self.compile_node(node.value)
            self.emit(OpCode.STORE_VAR, self.add_constant(node.name))
        
        elif isinstance(node, AssignStmt):
            self.compile_node(node.value)
            self.emit(OpCode.STORE_VAR, self.add_constant(node.name))
        
        elif isinstance(node, FuncDecl):
            func_compiler = Compiler(self.constants)
            func_compiler.var_map = {}
            for i, (name, _) in enumerate(node.params):
                arg_name = f'_arg_{i}'
                idx = func_compiler.add_constant(arg_name)
                func_compiler.var_map[name] = idx
            
            for stmt in node.body:
                func_compiler.compile_node(stmt)
            
            func_compiler.emit(OpCode.RETURN)
            self.functions[node.name] = Function(
                node.name, len(node.params), func_compiler.instructions
            )
            
            if node.name == 'main':
                self.emit(OpCode.CALL, self.add_constant('main'), 0)
        
        elif isinstance(node, IfStmt):
            self.compile_node(node.condition)
            jump_to_else = len(self.instructions)
            self.emit(OpCode.JUMP_IF_FALSE, 0)
            
            for stmt in node.then_block:
                self.compile_node(stmt)
            
            then_jump_pos = len(self.instructions)
            self.emit(OpCode.JUMP, 0)
            
            self.instructions[jump_to_else + 1] = len(self.instructions)
            
            else_if_jumps = []
            for cond, block in node.else_ifs:
                self.compile_node(cond)
                jump_to_next = len(self.instructions)
                self.emit(OpCode.JUMP_IF_FALSE, 0)
                
                for stmt in block:
                    self.compile_node(stmt)
                
                else_if_jumps.append((jump_to_next, len(self.instructions)))
                self.emit(OpCode.JUMP, 0)
                self.instructions[jump_to_next + 1] = len(self.instructions)
            
            if node.else_block:
                for stmt in node.else_block:
                    self.compile_node(stmt)
            
            end_pos = len(self.instructions)
            self.instructions[then_jump_pos + 1] = end_pos
            for _, jump_pos in else_if_jumps:
                self.instructions[jump_pos + 1] = end_pos
        
        elif isinstance(node, WhileStmt):
            loop_start = len(self.instructions)
            
            self.compile_node(node.condition)
            jump_to_end = len(self.instructions)
            self.emit(OpCode.JUMP_IF_FALSE, 0)
            
            for stmt in node.body:
                self.compile_node(stmt)
            
            self.emit(OpCode.JUMP, loop_start)
            self.instructions[jump_to_end + 1] = len(self.instructions)
        
        elif isinstance(node, ReturnStmt):
            if node.value:
                self.compile_node(node.value)
            else:
                self.emit(OpCode.CONSTANT, self.add_constant(None))
            self.emit(OpCode.RETURN)
        
        elif isinstance(node, ExprStmt):
            self.compile_node(node.expr)
