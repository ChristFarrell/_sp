from .tokenizer import Tokenizer
from .parser import Parser
from .compiler import Compiler
from .vm import VM

__version__ = "1.0.0"
__all__ = ["Tokenizer", "Parser", "Compiler", "VM", "run", "run_file"]


def run(source: str) -> None:
    """Run Petal source code."""
    tokenizer = Tokenizer(source)
    tokens = tokenizer.tokenize()
    
    parser = Parser(tokens)
    ast = parser.parse()
    
    compiler = Compiler()
    bytecode = compiler.compile(ast)
    
    vm = VM(bytecode)
    vm.run()


def run_file(filepath: str) -> None:
    """Run a Petal source file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        source = f.read()
    run(source)
