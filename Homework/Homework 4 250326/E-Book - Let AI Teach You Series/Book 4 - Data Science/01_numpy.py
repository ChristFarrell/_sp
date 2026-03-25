"""
Book 4: Data Science
Python for Data Science - Chapter 2
NumPy and List Comprehensions
"""

import numpy as np

print("=" * 50)
print("NUMPY BASICS")
print("=" * 50)

# Creating arrays
arr = np.array([1, 2, 3, 4, 5])
zeros = np.zeros(10)
ones = np.ones((3, 3))
range_arr = np.arange(0, 10, 2)
random_arr = np.random.rand(5)

print(f"Array: {arr}")
print(f"Zeros: {zeros}")
print(f"Range (0-10, step 2): {range_arr}")

# Array operations
print("\n--- Array Operations ---")
print(f"arr * 2 = {arr * 2}")
print(f"arr ** 2 = {arr ** 2}")
print(f"np.sqrt(arr) = {np.sqrt(arr)}")

# Statistics
print("\n--- Statistics ---")
print(f"Mean: {arr.mean()}")
print(f"Sum: {arr.sum()}")
print(f"Max: {arr.max()}")

# Slicing
print("\n--- Slicing ---")
matrix = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print(f"First row: {matrix[0, :]}")
print(f"Second column: {matrix[:, 1]}")

print("\n" + "=" * 50)
print("LIST COMPREHENSIONS")
print("=" * 50)

# List comprehension
squares = [i ** 2 for i in range(10)]
print(f"Squares: {squares}")

# With condition
evens = [i for i in range(20) if i % 2 == 0]
print(f"Evens: {evens}")

# Filter and transform
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens_squared = [x**2 for x in numbers if x % 2 == 0]
print(f"Even squares: {evens_squared}")

# Flatten a list of lists
nested = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [item for sublist in nested for item in sublist]
print(f"Flattened: {flattened}")

# Matrix operations
print("\n--- Matrix Operations ---")
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])
print(f"A + B:\n{a + b}")
print(f"A @ B (matrix multiply):\n{a @ b}")

# Linear algebra
print("\n--- Linear Algebra ---")
det = np.linalg.det(a)
print(f"Determinant of A: {det:.2f}")
