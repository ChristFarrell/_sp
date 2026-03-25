"""
Book 5: Competitive Programming
Arrays & Strings - Chapter 3
"""

print("=" * 60)
print("ARRAY TECHNIQUES")
print("=" * 60)

# Two Pointers - Reverse String
def reverse_string(s):
    s = list(s)
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return ''.join(s)

print("\n1. Reverse String")
print(f"   'hello' -> '{reverse_string('hello')}'")

# Valid Palindrome
def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

print("\n2. Valid Palindrome")
print(f"   'A man a plan a canal Panama' = {is_palindrome('A man a plan a canal Panama')}")

# Sliding Window - Maximum Sum Subarray
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum

print("\n3. Max Sum Subarray (k=3)")
arr = [1, 4, 2, 10, 2, 3, 1, 0, 20]
print(f"   Array: {arr}")
print(f"   Max sum: {max_sum_subarray(arr, 3)}")

# Kadane's Algorithm
def max_subarray(nums):
    max_sum = nums[0]
    current_sum = nums[0]
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    return max_sum

print("\n4. Kadane's - Maximum Subarray")
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(f"   Array: {nums}")
print(f"   Max sum: {max_subarray(nums)}")

# Longest Substring Without Repeating
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

print("\n5. Longest Substring Without Repeating")
test_s = "abcabcbb"
print(f"   '{test_s}' -> length = {length_of_longest_substring(test_s)}")

print("\n" + "=" * 60)
print("STRING PROBLEMS")
print("=" * 60)

# Valid Parentheses
def is_valid_parentheses(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0

print("\n6. Valid Parentheses")
print(f"   '()[]{{}}' = {is_valid_parentheses('()[]{}')}")
print(f"   '(]' = {is_valid_parentheses('(]')}")

# Anagram Check
def is_anagram(s1, s2):
    if len(s1) != len(s2):
        return False
    count = {}
    for c in s1:
        count[c] = count.get(c, 0) + 1
    for c in s2:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True

print("\n7. Valid Anagram")
print(f"   'anagram' vs 'nagaram' = {is_anagram('anagram', 'nagaram')}")

# Move Zeros to End
def move_zeros(nums):
    pos = 0
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[pos], nums[i] = nums[i], nums[pos]
            pos += 1
    return nums

print("\n8. Move Zeros to End")
print(f"   [0,1,0,3,12] -> {move_zeros([0,1,0,3,12])}")

# Product Except Self
def product_except_self(nums):
    n = len(nums)
    result = [1] * n
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]
    postfix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= postfix
        postfix *= nums[i]
    return result

print("\n9. Product Except Self")
print(f"   [1,2,3,4] -> {product_except_self([1,2,3,4])}")
