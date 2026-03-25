# Book 1: Python Fundamentals with AI

*A hands-on guide to learning Python programming with AI as your tutor*

---

## Table of Contents

1. [Introduction to Python](#introduction)
2. [Setting Up Your Environment](#setup)
3. [Variables and Data Types](#variables)
4. [Control Flow](#control-flow)
5. [Functions](#functions)
6. [Data Structures](#data-structures)
7. [File Handling](#file-handling)
8. [Mini Projects](#projects)
9. [AI Prompts Cheat Sheet](#ai-prompts)

---

<a name="introduction"></a>
## Chapter 1: Introduction to Python

Python is one of the most beginner-friendly programming languages. It's used in:
- Web development
- Data science & AI
- Automation & scripting
- Game development
- And much more!

### Why Learn Python with AI?

AI can:
- Explain concepts in different ways until you understand
- Generate practice exercises tailored to your level
- Debug your code and explain errors
- Provide instant feedback on your solutions

### Your First Python Code

```python
# This is a comment
print("Hello, World!")

# Variables
name = "Python Learner"
print(f"Welcome to {name}!")
```

**Try it yourself!** Ask AI: *"Write a Python script that prints your name and favorite hobby."*

---

<a name="setup"></a>
## Chapter 2: Setting Up Your Environment

### Option 1: Online (No Installation)
- Replit.com
- Google Colab
- PythonAnywhere

### Option 2: Local Setup
1. Download Python from python.org
2. Install VS Code editor
3. Install the Python extension for VS Code
4. Create your first `.py` file

### AI Tip
Ask AI: *"How do I set up Python on [your operating system]?"*

---

<a name="variables"></a>
## Chapter 3: Variables and Data Types

```python
# Strings
name = "Alice"
greeting = 'Hello'

# Numbers
age = 25
height = 5.8

# Boolean
is_student = True

# None (empty value)
middle_name = None

# Check types
print(type(name))  # <class 'str'>
```

### Practice Exercise
Create variables for:
- Your favorite movie (string)
- Your age (integer)
- Movie rating out of 10 (float)
- Whether it's your favorite (boolean)

**Ask AI to check your code!**

---

<a name="control-flow"></a>
## Chapter 4: Control Flow

### Conditionals
```python
temperature = 22

if temperature > 30:
    print("It's hot!")
elif temperature > 20:
    print("Nice weather!")
elif temperature > 10:
    print("A bit chilly")
else:
    print("It's cold!")
```

### Loops
```python
# For loop
for i in range(5):
    print(f"Count: {i}")

# While loop
count = 0
while count < 5:
    print(count)
    count += 1

# Loop through a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"I like {fruit}")
```

---

<a name="functions"></a>
## Chapter 5: Functions

```python
def greet(name, greeting="Hello"):
    """Greet a person with a custom message"""
    return f"{greeting}, {name}!"

# Call the function
message = greet("Alice", "Good morning")
print(message)

# Default parameter
message = greet("Bob")  # Uses default "Hello"
print(message)
```

### Practice
Write a function that:
1. Takes two numbers as input
2. Returns their sum, difference, and product
3. Handles division (with zero check)

**Ask AI to review your solution!**

---

<a name="data-structures"></a>
## Chapter 6: Data Structures

### Lists
```python
numbers = [1, 2, 3, 4, 5]
numbers.append(6)
print(numbers[0])  # First item
print(numbers[-1])  # Last item
```

### Dictionaries
```python
student = {
    "name": "Alice",
    "age": 20,
    "courses": ["Math", "Physics", "CS"]
}
print(student["name"])
student["grade"] = "A"
```

### Sets & Tuples
```python
# Tuple (immutable)
coordinates = (10, 20)

# Set (unique items)
unique_nums = {1, 2, 3, 3, 3}  # {1, 2, 3}
```

---

<a name="file-handling"></a>
## Chapter 7: File Handling

```python
# Write to file
with open("my_notes.txt", "w") as file:
    file.write("Learning Python is fun!\n")
    file.write("AI makes it even better!")

# Read from file
with open("my_notes.txt", "r") as file:
    content = file.read()
    print(content)
```

### Project Idea
Create a simple note-taking app that saves and loads notes!

---

<a name="projects"></a>
## Chapter 8: Mini Projects

### Project 1: Number Guessing Game
```python
import random

def guess_number():
    target = random.randint(1, 10)
    attempts = 3
    
    print("Guess a number between 1 and 10!")
    
    while attempts > 0:
        guess = int(input("Your guess: "))
        
        if guess == target:
            print("You got it!")
            return True
        elif guess < target:
            print("Too low!")
        else:
            print("Too high!")
        
        attempts -= 1
    
    print(f"Game over! The number was {target}")
    return False

guess_number()
```

### Project 2: To-Do List
```python
def todo_list():
    tasks = []
    
    while True:
        print("\n1. Add task")
        print("2. View tasks")
        print("3. Remove task")
        print("4. Quit")
        
        choice = input("Choose an option: ")
        
        if choice == "1":
            task = input("Enter task: ")
            tasks.append(task)
        elif choice == "2":
            for i, task in enumerate(tasks, 1):
                print(f"{i}. {task}")
        elif choice == "3":
            num = int(input("Task number to remove: "))
            if 0 < num <= len(tasks):
                tasks.pop(num - 1)
        elif choice == "4":
            break

todo_list()
```

---

<a name="ai-prompts"></a>
## Chapter 9: AI Prompts Cheat Sheet

Use these prompts while learning:

| What You Need | AI Prompt |
|---------------|-----------|
| Explain a concept | "Explain Python [concept] in simple terms" |
| Debug code | "There's an error in my code: [paste code]. Help me fix it." |
| Practice exercise | "Give me 5 Python exercises about [topic] with solutions" |
| Simplify | "Explain that again but simpler" |
| Real-world example | "Give me a real-world example of [concept]" |
| Quiz yourself | "Quiz me on Python [chapter/topic]" |

---

## What's Next?

Congratulations on completing Python Fundamentals! Continue to:

📖 **Book 2: JavaScript Essentials** - Learn web interactivity
📖 **Book 3: Web Development** - Build full websites
📖 **Book 4: Data Science** - Analyze data with Python

---

*Happy Coding! Remember: AI is your tutor, but you're the driver of your learning journey.*
