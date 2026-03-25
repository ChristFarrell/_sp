# Book 5: Competitive Programming with AI

*Master algorithms and data structures with AI as your practice partner*

---

## Table of Contents

1. [Introduction to Competitive Programming](#intro)
2. [Time & Space Complexity](#complexity)
3. [Arrays & Strings](#arrays)
4. [Linked Lists](#lists)
5. [Stacks & Queues](#stacks)
6. [Trees & Graphs](#trees)
7. [Dynamic Programming](#dp)
8. [Problem-Solving Strategies](#strategies)
9. [AI for Practice](#ai-prompts)

---

<a name="intro"></a>
## Chapter 1: Introduction to Competitive Programming

### What is Competitive Programming?
Competitive programming involves solving well-defined algorithmic problems under time constraints.

### Popular Platforms
| Platform | Focus | URL |
|----------|-------|-----|
| LeetCode | Interview prep | leetcode.com |
| Codeforces | Contests | codeforces.com |
| AtCoder | Japanese contests | atcoder.jp |
| HackerRank | Skills & learning | hackerrank.com |

### Your First Problem: Two Sum
```python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test
print(twoSum([2, 7, 11, 15], 9))   # [0, 1]
```

**AI Tip:** Ask "Solve this LeetCode problem: [paste problem]"

---

<a name="complexity"></a>
## Chapter 2: Time & Space Complexity

### Big O Notation
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
```

### Common Complexities
```python
# O(1) - Constant
def get_first(arr):
    return arr[0]

# O(log n) - Logarithmic (binary search)
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

# O(n) - Linear
def find_max(arr):
    return max(arr)

# O(n²) - Quadratic
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
```

---

<a name="arrays"></a>
## Chapter 3: Arrays & Strings

### Two Pointers
```python
def reverse_string(s):
    s = list(s)
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return ''.join(s)
```

### Sliding Window
```python
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum
```

### Common Problems
```python
# Longest substring without repeating
def length_of_longest_substring(s):
    char_set = set()
    left = max_length = 0
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    return max_length

# Valid palindrome
def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]
```

---

<a name="lists"></a>
## Chapter 4: Linked Lists

### Implementation
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse(head):
    prev = None
    current = head
    while current:
        next_temp = current.next
        current.next = prev
        prev = current
        current = next_temp
    return prev
```

### Common Problems
```python
# Merge two sorted lists
def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    current = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            current.next = l1
            l1 = l1.next
        else:
            current.next = l2
            l2 = l2.next
        current = current.next
    current.next = l1 or l2
    return dummy.next

# Detect cycle (Floyd's algorithm)
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

---

<a name="stacks"></a>
## Chapter 5: Stacks & Queues

### Stack Implementation
```python
class Stack:
    def __init__(self):
        self.stack = []
    
    def push(self, val):
        self.stack.append(val)
    
    def pop(self):
        return self.stack.pop() if self.stack else None
    
    def peek(self):
        return self.stack[-1] if self.stack else None

# Valid parentheses
def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0
```

---

<a name="trees"></a>
## Chapter 6: Trees & Graphs

### Binary Tree Traversals
```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder(root):
    return inorder(root.left) + [root.val] + inorder(root.right) if root else []

def level_order(root):
    if not root: return []
    result, queue = [], [root]
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.pop(0)
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result
```

### Graph BFS/DFS
```python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result
```

---

<a name="dp"></a>
## Chapter 7: Dynamic Programming

### DP Framework
```
1. Define subproblem
2. Guess part of solution
3. Relate subproblems
4. Compute & reuse
5. Solve original problem
```

### Classic Problems
```python
# Fibonacci
def fib(n):
    if n <= 1: return n
    prev1, prev2 = 1, 0
    for _ in range(2, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    return prev1

# Coin change
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

# Longest common subsequence
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```

### DP Patterns
```python
# House robber
def rob(nums):
    if not nums: return 0
    if len(nums) <= 2: return max(nums)
    prev1, prev2 = nums[0], max(nums[0], nums[1])
    for i in range(2, len(nums)):
        current = max(prev2, prev1 + nums[i])
        prev1, prev2 = prev2, current
    return prev2

# Climb stairs
def climb_stairs(n):
    if n <= 2: return n
    prev1, prev2 = 2, 1
    for _ in range(3, n + 1):
        prev1, prev2 = prev1 + prev2, prev1
    return prev1
```

---

<a name="strategies"></a>
## Chapter 8: Problem-Solving Strategies

### The Process
```
1. READ the problem twice
2. CLARIFY constraints
3. CREATE examples
4. CHOOSE approach
5. WRITE pseudocode
6. IMPLEMENT
7. TEST
8. OPTIMIZE
```

### Pattern Recognition
| Pattern | When to Use |
|---------|-------------|
| Two Pointers | Pairs, palindromes |
| Sliding Window | Subarrays |
| Hashing | Lookups, duplicates |
| BFS/DFS | Graphs, trees |
| Recursion + Memo | Overlapping subproblems |
| Binary Search | Sorted data |
| DP | Optimization |

---

<a name="ai-prompts"></a>
## Chapter 9: AI for Practice

| What You Need | AI Prompt |
|---------------|-----------|
| Explain solution | "Explain: [paste code]" |
| Better approach | "More efficient solution for [problem]?" |
| Debug | "Why wrong? [paste code]" |
| Generate tests | "Test cases for [problem]" |
| Similar problems | "5 similar to [problem]" |
| Mock interview | "Give me a coding problem" |

---

*Competitive programming sharpens your mind. You've got this!*
