"""
Book 5: Competitive Programming
Dynamic Programming - Chapter 7
"""

print("=" * 60)
print("DYNAMIC PROGRAMMING")
print("=" * 60)

# Fibonacci - Memoization
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

# Fibonacci - Tabulation
def fib_tab(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

# Fibonacci - Space Optimized
def fib_optimized(n):
    if n <= 1:
        return n
    prev1, prev2 = 1, 0
    for _ in range(2, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    return prev1

print("\n1. Fibonacci Numbers")
print(f"   fib_memo(10) = {fib_memo(10)}")
print(f"   fib_tab(10) = {fib_tab(10)}")
print(f"   fib_optimized(10) = {fib_optimized(10)}")

# Coin Change
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

print("\n2. Coin Change")
coins = [1, 2, 5]
for amt in [11, 3, 0]:
    result = coin_change(coins, amt)
    print(f"   Amount {amt}: {result} coins")

# Longest Common Subsequence
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]

print("\n3. Longest Common Subsequence")
print(f"   'abcde' vs 'ace' -> LCS = {lcs('abcde', 'ace')}")

# 0/1 Knapsack
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]
    return dp[n][capacity]

print("\n4. 0/1 Knapsack")
weights = [2, 3, 4, 5]
values = [3, 4, 5, 6]
capacity = 5
print(f"   Max value with capacity {capacity}: {knapsack(weights, values, capacity)}")

print("\n" + "=" * 60)
print("DP PATTERNS")
print("=" * 60)

# House Robber
def rob(nums):
    if not nums:
        return 0
    if len(nums) <= 2:
        return max(nums)
    prev1 = nums[0]
    prev2 = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        current = max(prev2, prev1 + nums[i])
        prev1 = prev2
        prev2 = current
    return prev2

print("\n5. House Robber")
print(f"   [1,2,3,1] -> {rob([1,2,3,1])}")
print(f"   [2,7,9,3,1] -> {rob([2,7,9,3,1])}")

# Climb Stairs
def climb_stairs(n):
    if n <= 2:
        return n
    prev1, prev2 = 2, 1
    for _ in range(3, n + 1):
        prev1, prev2 = prev1 + prev2, prev1
    return prev1

print("\n6. Climbing Stairs")
print(f"   4 steps -> {climb_stairs(4)} ways")
print(f"   5 steps -> {climb_stairs(5)} ways")

# Edit Distance
def edit_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]

print("\n7. Edit Distance")
print(f"   'horse' vs 'ros' -> {edit_distance('horse', 'ros')}")

# Unique Paths
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]

print("\n8. Unique Paths")
print(f"   3x7 grid -> {unique_paths(3, 7)} paths")

print("\n" + "=" * 60)
print("DP Summary: Fibonacci, Coin Change, LCS, Knapsack, House Robber")
print("=" * 60)
