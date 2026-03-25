"""
Book 5: Competitive Programming
Linked Lists - Chapter 4
"""

print("=" * 60)
print("LINKED LIST IMPLEMENTATION")
print("=" * 60)

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, val):
        if not self.head:
            self.head = ListNode(val)
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = ListNode(val)
    
    def reverse(self):
        prev = None
        current = self.head
        while current:
            next_temp = current.next
            current.next = prev
            prev = current
            current = next_temp
        self.head = prev
    
    def find_middle(self):
        slow = fast = self.head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow.val if slow else None
    
    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append(current.val)
            current = current.next
        return result

# Test Linked List
print("\n1. Basic Linked List Operations")
ll = LinkedList()
for i in [1, 2, 3, 4, 5]:
    ll.append(i)
print(f"   Created: {ll.to_list()}")
print(f"   Middle: {ll.find_middle()}")

ll.reverse()
print(f"   After reverse: {ll.to_list()}")

print("\n" + "=" * 60)
print("LINKED LIST PROBLEMS")
print("=" * 60)

# Merge Two Sorted Lists
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

print("\n2. Merge Two Sorted Lists")
list1 = LinkedList()
for v in [1, 3, 5]: list1.append(v)
list2 = LinkedList()
for v in [2, 4, 6]: list2.append(v)

merged = merge_two_lists(list1.head, list2.head)
result = []
while merged:
    result.append(merged.val)
    merged = merged.next
print(f"   [1,3,5] + [2,4,6] -> {result}")

# Remove Nth Node from End
def remove_nth_from_end(head, n):
    dummy = ListNode(0)
    dummy.next = head
    first = second = dummy
    for _ in range(n + 1):
        first = first.next
    while first:
        first = first.next
        second = second.next
    second.next = second.next.next
    return dummy.next

print("\n3. Remove Nth Node from End")
test_ll = LinkedList()
for v in [1, 2, 3, 4, 5]: test_ll.append(v)
new_head = remove_nth_from_end(test_ll.head, 2)
result = []
while new_head:
    result.append(new_head.val)
    new_head = new_head.next
print(f"   Remove 2nd from end of [1,2,3,4,5]: {result}")

# Detect Cycle (Floyd's)
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

print("\n4. Detect Cycle")
print(f"   Has cycle: {has_cycle(test_ll.head)}")

# Add Two Numbers
def add_two_numbers(l1, l2):
    dummy = ListNode(0)
    current = dummy
    carry = 0
    while l1 or l2 or carry:
        val1 = l1.val if l1 else 0
        val2 = l2.val if l2 else 0
        total = val1 + val2 + carry
        carry = total // 10
        current.next = ListNode(total % 10)
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
        current = current.next
    return dummy.next

print("\n5. Add Two Numbers (342 + 465 = 807)")
l1 = ListNode(2); l1.next = ListNode(4); l1.next.next = ListNode(3)
l2 = ListNode(5); l2.next = ListNode(6); l2.next.next = ListNode(4)
result = add_two_numbers(l1, l2)
result_list = []
while result:
    result_list.append(result.val)
    result = result.next
print(f"   342 + 465 = {''.join(map(str, reversed(result_list)))}")

# Palindrome Linked List
def is_palindrome(head):
    if not head or not head.next:
        return True
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    current = slow
    while current:
        next_temp = current.next
        current.next = prev
        prev = current
        current = next_temp
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    return True

print("\n6. Palindrome Linked List")
pal_ll = LinkedList()
for v in [1, 2, 3, 2, 1]: pal_ll.append(v)
print(f"   [1,2,3,2,1] is palindrome: {is_palindrome(pal_ll.head)}")
