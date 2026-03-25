"""
Book 5: Competitive Programming
Time & Space Complexity - Chapter 2
"""

import time

print("=" * 60)
print("TIME & SPACE COMPLEXITY ANALYSIS")
print("=" * 60)

# O(1) - Constant Time
def get_first(arr):
    return arr[0]

# O(log n) - Logarithmic Time (Binary Search)
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# O(n) - Linear Time
def find_max(arr):
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val

# O(n^2) - Quadratic Time
def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

print("\n--- Complexity Examples ---")
n_values = [100, 1000, 10000]

print("\nO(1) - Constant:")
for n in n_values:
    start = time.time()
    get_first(list(range(n)))
    print(f"  n={n:6d}: {(time.time() - start)*1000:.6f}ms")

print("\nO(log n) - Logarithmic:")
sorted_arr = list(range(100000))
for n in [10, 100, 1000, 10000]:
    start = time.time()
    binary_search(sorted_arr[:n], n-1)
    print(f"  n={n:6d}: {(time.time() - start)*1000:.6f}ms")

print("\nO(n) - Linear:")
for n in n_values:
    start = time.time()
    find_max(list(range(n)))
    print(f"  n={n:6d}: {(time.time() - start)*1000:.6f}ms")

print("\n--- Big O Cheat Sheet ---")
print("""
O(1)       - Constant    - Hash lookup
O(log n)   - Logarithmic - Binary search
O(n)       - Linear      - Simple loop
O(n log n) - Linearithmic- Merge sort
O(n^2)     - Quadratic   - Nested loops
O(2^n)     - Exponential - Recursive fib
""")

# Analyze code examples
def find_duplicates_good(arr):
    seen = set()
    duplicates = []
    for num in arr:
        if num in seen:
            duplicates.append(num)
        seen.add(num)
    return duplicates

def find_duplicates_bad(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                duplicates.append(arr[i])
    return duplicates

test_arr = [1, 2, 3, 2, 4, 3, 5, 1]
print("\n--- Good vs Bad Implementation ---")
print(f"Good (O(n)): {find_duplicates_good(test_arr)}")
print(f"Bad (O(n^2)): {find_duplicates_bad(test_arr)}")
