"""
Book 1: Python Fundamentals
Practice Exercise Solutions - Functions & Math Operations
"""

def math_operations(a, b):
    return {
        'sum': a + b,
        'difference': a - b,
        'product': a * b,
        'division': a / b if b != 0 else "Cannot divide by zero"
    }

if __name__ == "__main__":
    result = math_operations(10, 5)
    print("10 + 5, 10 - 5, 10 * 5, 10 / 5:")
    for key, value in result.items():
        print(f"  {key}: {value}")
    
    print("\nDivision by zero:")
    result_zero = math_operations(10, 0)
    print(f"  {result_zero['division']}")
