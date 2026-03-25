"""
Book 1: Python Fundamentals
Practice Exercises and Code Examples
"""

# Chapter 1: Introduction - Your First Python Code
def hello_world():
    print("Hello, World!")
    name = "Python Learner"
    print(f"Welcome to {name}!")

# Chapter 3: Variables and Data Types
def variables_demo():
    name = "Alice"
    age = 25
    height = 5.8
    is_student = True
    middle_name = None
    print(type(name))
    return name, age, height, is_student

# Chapter 4: Control Flow - Conditionals
def check_temperature(temperature):
    if temperature > 30:
        return "It's hot!"
    elif temperature > 20:
        return "Nice weather!"
    elif temperature > 10:
        return "A bit chilly"
    else:
        return "It's cold!"

# Chapter 4: Loops
def loop_examples():
    for i in range(5):
        print(f"Count: {i}")
    
    count = 0
    while count < 5:
        print(count)
        count += 1
    
    fruits = ["apple", "banana", "cherry"]
    for fruit in fruits:
        print(f"I like {fruit}")

# Chapter 5: Functions
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

def math_operations(a, b):
    return {
        'sum': a + b,
        'difference': a - b,
        'product': a * b,
        'division': a / b if b != 0 else "Cannot divide by zero"
    }

# Chapter 6: Data Structures
def data_structures_demo():
    numbers = [1, 2, 3, 4, 5]
    numbers.append(6)
    
    student = {
        "name": "Alice",
        "age": 20,
        "courses": ["Math", "Physics", "CS"]
    }
    
    coordinates = (10, 20)
    unique_nums = {1, 2, 3, 3, 3}
    
    return numbers, student, coordinates, unique_nums

# Chapter 7: File Handling
def file_handling():
    with open("my_notes.txt", "w") as file:
        file.write("Learning Python is fun!\n")
        file.write("AI makes it even better!")
    
    with open("my_notes.txt", "r") as file:
        content = file.read()
        print(content)
    
    return content

# Run demos
if __name__ == "__main__":
    print("=== Hello World ===")
    hello_world()
    print("\n=== Temperature Check ===")
    print(check_temperature(22))
    print("\n=== Functions ===")
    print(greet("Alice", "Good morning"))
    print(greet("Bob"))
    print(math_operations(10, 5))
