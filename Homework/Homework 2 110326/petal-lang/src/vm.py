from .compiler import OpCode, Function


class VMError(Exception):
    pass


class VM:
    def __init__(self, bytecode: tuple):
        self.bytecode, self.constants, self.functions = bytecode
        self.stack: list = []
        self.variables: dict = {}
        self.call_stack: list = []
        self.return_addr_stack: list = []
    
    def push(self, value) -> None:
        self.stack.append(value)
    
    def pop(self):
        if not self.stack:
            raise VMError("Stack underflow")
        return self.stack.pop()
    
    def peek(self):
        if not self.stack:
            raise VMError("Stack underflow")
        return self.stack[-1]
    
    def call_builtin(self, name: str, arg_count: int):
        args = []
        for _ in range(arg_count):
            args.append(self.pop())
        args.reverse()
        
        if name == 'print':
            print(*args)
            return None
        elif name == 'input':
            return input()
        elif name == 'len':
            return len(args[0])
        elif name == 'int':
            if isinstance(args[0], str):
                return int(args[0])
            return int(args[0])
        elif name == 'float':
            return float(args[0])
        elif name == 'str':
            return str(args[0])
        else:
            raise VMError(f"Unknown builtin function: {name}")
    
    def run(self) -> None:
        ip = 0
        
        while ip < len(self.bytecode):
            opcode = self.bytecode[ip]
            ip += 1
            
            if opcode == OpCode.CONSTANT:
                idx = self.bytecode[ip]
                ip += 1
                self.push(self.constants[idx])
            
            elif opcode == OpCode.LOAD_VAR:
                idx = self.bytecode[ip]
                ip += 1
                name = self.constants[idx]
                if name not in self.variables:
                    raise VMError(f"Undefined variable: {name}")
                self.push(self.variables[name])
            
            elif opcode == OpCode.STORE_VAR:
                idx = self.bytecode[ip]
                ip += 1
                name = self.constants[idx]
                value = self.pop()
                self.variables[name] = value
            
            elif opcode == OpCode.ADD:
                b = self.pop()
                a = self.pop()
                if isinstance(a, str) or isinstance(b, str):
                    self.push(str(a) + str(b))
                else:
                    self.push(a + b)
            
            elif opcode == OpCode.SUB:
                b = self.pop()
                a = self.pop()
                self.push(a - b)
            
            elif opcode == OpCode.MUL:
                b = self.pop()
                a = self.pop()
                self.push(a * b)
            
            elif opcode == OpCode.DIV:
                b = self.pop()
                a = self.pop()
                if b == 0:
                    raise VMError("Division by zero")
                self.push(a / b)
            
            elif opcode == OpCode.MOD:
                b = self.pop()
                a = self.pop()
                self.push(a % b)
            
            elif opcode == OpCode.NEG:
                value = self.pop()
                self.push(-value)
            
            elif opcode == OpCode.NOT:
                value = self.pop()
                self.push(not value)
            
            elif opcode == OpCode.EQ:
                b = self.pop()
                a = self.pop()
                self.push(a == b)
            
            elif opcode == OpCode.NE:
                b = self.pop()
                a = self.pop()
                self.push(a != b)
            
            elif opcode == OpCode.LT:
                b = self.pop()
                a = self.pop()
                self.push(a < b)
            
            elif opcode == OpCode.GT:
                b = self.pop()
                a = self.pop()
                self.push(a > b)
            
            elif opcode == OpCode.LE:
                b = self.pop()
                a = self.pop()
                self.push(a <= b)
            
            elif opcode == OpCode.GE:
                b = self.pop()
                a = self.pop()
                self.push(a >= b)
            
            elif opcode == OpCode.AND:
                b = self.pop()
                a = self.pop()
                self.push(a and b)
            
            elif opcode == OpCode.OR:
                b = self.pop()
                a = self.pop()
                self.push(a or b)
            
            elif opcode == OpCode.JUMP:
                addr = self.bytecode[ip]
                ip = addr
            
            elif opcode == OpCode.JUMP_IF_FALSE:
                addr = self.bytecode[ip]
                ip += 1
                condition = self.pop()
                if not condition:
                    ip = addr
            
            elif opcode == OpCode.CALL:
                func_idx = self.bytecode[ip]
                ip += 1
                arg_count = self.bytecode[ip]
                ip += 1
                
                func_name = self.constants[func_idx]
                func = self.functions.get(func_name)
                
                if func is None:
                    result = self.call_builtin(func_name, arg_count)
                    self.push(result)
                    continue
                
                args = []
                for _ in range(arg_count):
                    args.append(self.pop())
                args.reverse()
                
                inner_vm = VM((func.bytecode, self.constants, self.functions))
                inner_vm.variables = {}
                
                for i, arg in enumerate(args):
                    inner_vm.variables[f'_arg_{i}'] = arg
                
                inner_vm.run()
                
                if inner_vm.stack:
                    self.push(inner_vm.stack[-1])
            
            elif opcode == OpCode.RETURN:
                break
            
            elif opcode == OpCode.HALT:
                break
