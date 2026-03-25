"""
Book 5: Competitive Programming
Trees and Graphs - Chapter 6
"""

print("=" * 60)
print("BINARY TREE")
print("=" * 60)

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Build sample tree:     1
#                      / \
#                     2   3
#                    / \   \
#                   4   5   6
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)
root.right.right = TreeNode(6)

print("\nTree Structure:")
print("       1")
print("      / \\")
print("     2   3")
print("    / \\   \\")
print("   4   5   6")

# DFS Traversals
def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def preorder(root):
    if not root:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def postorder(root):
    if not root:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]

print("\n1. DFS Traversals")
print(f"   Inorder:   {inorder(root)}")
print(f"   Preorder:  {preorder(root)}")
print(f"   Postorder: {postorder(root)}")

# Level Order (BFS)
from collections import deque

def level_order(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result

print("\n2. Level Order (BFS)")
print(f"   {level_order(root)}")

# Tree Depth
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

print("\n3. Max Depth")
print(f"   Depth: {max_depth(root)}")

print("\n" + "=" * 60)
print("GRAPHS")
print("=" * 60)

from collections import defaultdict, deque

class Graph:
    def __init__(self):
        self.graph = defaultdict(list)
    
    def add_edge(self, u, v):
        self.graph[u].append(v)
    
    def bfs(self, start):
        visited = set([start])
        queue = deque([start])
        result = []
        while queue:
            node = queue.popleft()
            result.append(node)
            for neighbor in self.graph[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return result

# Build graph:     0 --- 1
#                 |     |
#                 3 --- 2
#                      |
#                      4
g = Graph()
g.add_edge(0, 1)
g.add_edge(0, 3)
g.add_edge(1, 2)
g.add_edge(2, 3)
g.add_edge(2, 4)

print("\nGraph Structure:")
print("   0 --- 1")
print("   |     |")
print("   3 --- 2")
print("        |")
print("        4")

print("\n4. BFS from 0")
print(f"   {g.bfs(0)}")

# Dijkstra's Shortest Path
import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    heap = [(0, start)]
    while heap:
        curr_dist, curr_node = heapq.heappop(heap)
        if curr_dist > distances[curr_node]:
            continue
        for neighbor, weight in graph[curr_node]:
            distance = curr_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(heap, (distance, neighbor))
    return distances

print("\n5. Dijkstra's Shortest Path")
wg = defaultdict(list)
wg[0] = [(1, 4), (7, 8)]
wg[1] = [(0, 4), (2, 8), (7, 11)]
wg[2] = [(1, 8), (3, 7), (8, 2)]
wg[3] = [(2, 7), (4, 9), (5, 14)]
wg[4] = [(3, 9), (5, 10)]
wg[5] = [(3, 14), (4, 10), (6, 2)]
wg[6] = [(5, 2), (7, 1), (8, 6)]
wg[7] = [(0, 8), (1, 11), (6, 1), (8, 7)]
wg[8] = [(2, 2), (6, 6), (7, 7)]
print(f"   Distances from 0: {dijkstra(wg, 0)}")

# Number of Islands
def num_islands(grid):
    if not grid:
        return 0
    
    def dfs(i, j):
        if (i < 0 or i >= len(grid) or 
            j < 0 or j >= len(grid[0]) or
            grid[i][j] == '0'):
            return
        grid[i][j] = '0'
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)
    
    islands = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1':
                islands += 1
                dfs(i, j)
    return islands

print("\n6. Number of Islands")
grid = [
    ['1','1','0','0','0'],
    ['1','1','0','0','0'],
    ['0','0','1','0','0'],
    ['0','0','0','1','1']
]
print(f"   Grid has {num_islands(grid)} islands")

print("\n" + "=" * 60)
print("Summary: Tree traversals, BFS/DFS, Dijkstra, Islands")
print("=" * 60)
