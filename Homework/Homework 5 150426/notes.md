# Concurrent Programming in Python: Three Classic Problems

This document provides a detailed explanation of three fundamental concurrent programming problems and their Python implementations using threading primitives.


## 1. Bank Account Simulation

### Overview
This simulation demonstrates **race conditions** and how to prevent them using **mutexes (locks)**. It simulates a person performing 100,000 deposits and 100,000 withdrawals on the same bank account using concurrent threads.

### The Problem: Race Conditions

A **race condition** occurs when two or more threads access shared data simultaneously, and the final result depends on the timing of their execution.

#### Example Scenario:
```
Initial balance: $100

Thread 1 (Deposit $50):          Thread 2 (Withdraw $30):
1. Read balance = $100           1. Read balance = $100
2. Calculate: 100 + 50 = 150     2. Calculate: 100 - 30 = 70
3. Write balance = $150          3. Write balance = $70

Final balance: $70 (WRONG! Should be $120)
```

One update is completely lost because both threads read the same initial value before either wrote their result back.

### Key Components

#### BankAccount Class
```python
class BankAccount:
    def __init__(self, owner: str, initial_balance: float = 0.0):
        self.owner = owner
        self.balance = initial_balance
        self._lock = threading.Lock()  # Mutex for thread safety
```

The class maintains:
- `owner`: Account holder's name
- `balance`: Current account balance (shared mutable state)
- `_lock`: A mutex (mutual exclusion lock) for synchronization

#### Unsafe Operations (Vulnerable to Race Conditions)

```python
def deposit_unsafe(self, amount: float):
    current = self.balance      # Step 1: Read
    current += amount           # Step 2: Compute
    self.balance = current      # Step 3: Write
```

**Why it's unsafe:**
- The operation has three distinct steps: read → compute → write
- Another thread can interrupt between any of these steps
- This creates a "race window" where data corruption can occur

#### Safe Operations (Protected by Mutex)

```python
def deposit_safe(self, amount: float):
    with self._lock:
        self.balance += amount
```

**Why it's safe:**
- The `with self._lock:` statement acquires the lock before entering the critical section
- Only one thread can hold the lock at a time; others must wait
- The lock is automatically released when exiting the `with` block
- The entire read-modify-write sequence becomes **atomic** (indivisible)

### How the Simulation Works

1. **Create two threads:**
   - Thread 1: Performs 100,000 deposits of $1 each
   - Thread 2: Performs 100,000 withdrawals of $1 each

2. **Expected result:** 
   - Initial: $0
   - After deposits: +$100,000
   - After withdrawals: -$100,000
   - Final: $0

3. **Actual results:**
   - **Without mutex:** Final balance is wrong (race condition causes lost updates)
   - **With mutex:** Final balance is exactly $0 (all updates are preserved)

### Key Concepts Demonstrated

**Mutex (Mutual Exclusion):**
- Ensures only one thread can execute a critical section at a time
- Implemented in Python as `threading.Lock()`
- Use `acquire()` to lock, `release()` to unlock (or use `with` for automatic handling)

**Critical Section:**
- Code that accesses shared mutable state
- Must be protected to prevent race conditions
- In this case: reading and writing `self.balance`

**Atomicity:**
- An atomic operation appears to happen instantaneously from other threads' perspectives
- No thread can observe a half-completed atomic operation
- Locks make non-atomic operations appear atomic

### Performance Trade-off

Locks add overhead but ensure correctness. The simulation shows:
- Unsafe version: Fast but produces wrong results
- Safe version: Slightly slower but always correct

**Golden Rule:** Correctness > Performance. Always.

---

## 2. Dining Philosophers Problem

### Overview
This is a classic synchronization problem that illustrates **deadlock** and strategies to prevent it. Five philosophers sit at a round table, alternating between thinking and eating, but they need two forks (shared resources) to eat.

### The Problem Setup

```
         Fork 0
    P0          P1
Fork 4            Fork 1
    P4          P2
         P3
    Fork 3  Fork 2
```

- 5 philosophers (P0-P4) sit around a circular table
- 5 forks placed between each pair of philosophers
- Each philosopher needs BOTH adjacent forks to eat
- After eating, they release both forks and think

### What is Deadlock?

**Deadlock** occurs when threads are waiting for each other in a circular chain, and none can proceed.

#### Deadlock Example:
```
1. All philosophers pick up their LEFT fork simultaneously
2. All philosophers now wait for their RIGHT fork
3. But every RIGHT fork is someone else's LEFT fork (already taken)
4. Nobody can proceed → DEADLOCK
```

### The Four Coffman Conditions for Deadlock

Deadlock requires ALL four conditions:

1. **Mutual Exclusion:** Resources (forks) can't be shared
2. **Hold and Wait:** Philosophers hold one fork while waiting for another
3. **No Preemption:** Can't forcibly take a fork from someone
4. **Circular Wait:** P0 waits for P1's fork, P1 waits for P2's fork, ..., P4 waits for P0's fork

**Solution Strategy:** Break the circular wait condition!

### The Solution: Resource Hierarchy

The code implements the **resource hierarchy** (or resource ordering) solution:

```python
def _acquire_forks(self):
    first, second = (
        (self.left_fork, self.right_fork)
        if id(self.left_fork) < id(self.right_fork)
        else (self.right_fork, self.left_fork)
    )
    first.acquire()
    second.acquire()
```

**Key Insight:**
- Always acquire the fork with the LOWER ID first
- This creates a global ordering of resources
- At least one philosopher (P4) will pick up forks in opposite order from their neighbor
- This breaks the circular wait chain

#### Visual Example:

```
Normal philosophers (P0-P3):
- Pick up LEFT fork first, then RIGHT fork

Philosopher 4:
- Would normally pick up Fork 4 (left), then Fork 0 (right)
- But Fork 0 has lower ID than Fork 4
- So P4 picks up Fork 0 first, then Fork 4
- This breaks the circular wait!
```

### How the Code Works

#### Philosopher Class (Thread)

Each philosopher is a separate thread:

```python
class Philosopher(threading.Thread):
    def __init__(self, pid: int, left_fork: Lock, 
                 right_fork: Lock, meals: int, ...):
        self.pid = pid
        self.left_fork = left_fork
        self.right_fork = right_fork
        self.meals_target = meals
```

#### Philosopher Lifecycle

```python
def run(self):
    for _ in range(self.meals_target):
        self._think()                    # Think (no resources needed)
        self._log("hungry, waiting...")  
        self._acquire_forks()            # Acquire BOTH forks
        self._eat()                      # Eat (use resources)
        self._release_forks()            # Release BOTH forks
```

Each philosopher:
1. **Thinks** for a random duration (0.5-1.5s)
2. Gets **hungry** and requests forks
3. **Waits** if forks aren't available
4. **Eats** when both forks are acquired (0.3-0.8s)
5. **Releases** forks and repeats

### Why This Solution Works

**Without ordering:**
- All 5 philosophers could deadlock simultaneously
- Probability of deadlock increases with more philosophers

**With resource hierarchy:**
- The ordering constraint prevents circular wait
- At least one philosopher will always be able to proceed
- **Deadlock is impossible**

---

## 3. Producer-Consumer Problem

### Overview
This demonstrates how to coordinate threads that produce data (producers) and threads that consume data (consumers) using a **bounded buffer** and **condition variables**.

### The Problem Setup

```
Producers → [Bounded Buffer] → Consumers
  P1, P2        (Queue)         C1, C2, C3
```

- **Producers** generate items and add them to a shared buffer
- **Consumers** remove items from the buffer and process them
- **Buffer** has limited capacity (bounded)

### Synchronization Challenges

1. **Buffer overflow:** Producers must wait when buffer is FULL
2. **Buffer underflow:** Consumers must wait when buffer is EMPTY
3. **Thread safety:** Multiple threads accessing the buffer must not corrupt data

### Key Components

#### Bounded Buffer Class

```python
class BoundedBuffer:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self._buffer = collections.deque()
        self._condition = threading.Condition()
```

**Components:**
- `_buffer`: Double-ended queue to store items
- `capacity`: Maximum buffer size
- `_condition`: Condition variable for signaling between threads
- Counters: `_produced` and `_consumed` for statistics

#### Condition Variable Explained

A `threading.Condition` combines:
- **A lock** (mutex) to protect shared data
- **A waiting queue** for threads to sleep
- **Notification mechanism** to wake sleeping threads

**Operations:**
- `wait()`: Release lock, sleep until notified, then re-acquire lock
- `notify()`: Wake one waiting thread
- `notify_all()`: Wake all waiting threads

### Producer Logic

```python
def put(self, item, producer_id: int):
    with self._condition:
        # Wait while the buffer is full
        while len(self._buffer) >= self.capacity:
            self._condition.wait()
        
        # Add item to buffer
        self._buffer.append(item)
        self._produced += 1
        
        # Wake up waiting consumers
        self._condition.notify_all()
```

**Step-by-step:**
1. **Acquire lock** (via `with self._condition`)
2. **Check if buffer is full** using `while` loop (not `if`!)
3. If full, **wait** (releases lock, sleeps, re-acquires lock when notified)
4. When space available, **add item** to buffer
5. **Notify all** waiting consumers
6. **Release lock** (automatic when exiting `with` block)

### Consumer Logic

```python
def get(self, consumer_id: int):
    with self._condition:
        # Wait while the buffer is empty
        while len(self._buffer) == 0:
            self._condition.wait()
        
        # Remove item from buffer
        item = self._buffer.popleft()
        self._consumed += 1
        
        # Wake up waiting producers
        self._condition.notify_all()
        return item
```

**Step-by-step:**
1. **Acquire lock**
2. **Check if buffer is empty** using `while` loop
3. If empty, **wait** for producers to add items
4. When item available, **remove it** from buffer
5. **Notify all** waiting producers
6. **Release lock and return item**

### Why Use `while` Instead of `if`?

**Critical:** Always use `while` loop, not `if` statement!

```python
# WRONG - vulnerable to spurious wakeups
if len(self._buffer) == 0:
    self._condition.wait()

# CORRECT - handles spurious wakeups
while len(self._buffer) == 0:
    self._condition.wait()
```

**Reasons:**
1. **Spurious wakeups:** Thread may wake up without being notified
2. **Multiple consumers:** Another consumer may take the item before this thread runs
3. **Re-checking:** The `while` loop rechecks the condition after waking up

### Simulation Flow

```
Time  | Producers          | Buffer [capacity=5]  | Consumers
------|-------------------|---------------------|---------------
0.0s  | P1 adds item 1000 | [1000]              |
0.1s  | P2 adds item 2000 | [1000, 2000]        |
0.2s  |                   | [1000, 2000]        | C1 takes 1000
0.3s  | P1 adds item 1001 | [2000, 1001]        |
...   | ...               | ...                 | ...
```

The simulation:
1. Spawns 2 producer threads
2. Spawns 3 consumer threads
3. Runs for 3 seconds
4. Stops all threads
5. Reports statistics

### Key Concepts Demonstrated

**Bounded Buffer:**
- Prevents unlimited memory growth
- Naturally throttles producers when consumers are slow

**Condition Variables:**
- More efficient than busy-waiting (checking repeatedly)
- Threads sleep while waiting, saving CPU
- Woken only when state changes

**Wait-Notify Pattern:**
- Producers notify consumers after adding items
- Consumers notify producers after removing items
- Both sides can make progress

**Flow Control:**
- Fast producers don't overwhelm slow consumers
- System reaches natural equilibrium

### Real-World Applications

This pattern is used everywhere:
- **Message queues:** RabbitMQ, Kafka
- **Thread pools:** Tasks submitted to worker threads
- **I/O buffering:** Network packets, file reads
- **Event processing:** GUI events, game engines

---

## Comparison of Synchronization Primitives

| Primitive | Use Case | Example |
|-----------|----------|---------|
| **Lock (Mutex)** | Protect shared data from concurrent access | Bank account balance |
| **Condition Variable** | Wait for a condition to become true | Buffer full/empty |
| **Semaphore** | Limit number of concurrent accesses | Connection pool |
| **Event** | Signal one-time occurrence | Shutdown signal |

---

## Common Threading Pitfalls

### 1. Race Conditions
**Problem:** Unsynchronized access to shared mutable state  
**Solution:** Use locks to protect critical sections

### 2. Deadlock
**Problem:** Circular waiting for resources  
**Solution:** Resource ordering, timeouts, or avoid holding multiple locks

### 3. Starvation
**Problem:** Thread never gets access to resources  
**Solution:** Fair scheduling, priority queues

### 4. Livelock
**Problem:** Threads keep changing state in response to each other but make no progress  
**Solution:** Randomized backoff, proper algorithms

### 5. Priority Inversion
**Problem:** High-priority thread blocked by low-priority thread  
**Solution:** Priority inheritance protocols

---

## Best Practices

1. **Minimize critical sections:** Hold locks for the shortest time possible
2. **Use `with` statements:** Ensures locks are always released, even on exceptions
3. **Avoid nested locks:** Reduces deadlock risk
4. **Use thread-safe data structures:** `queue.Queue`, `collections.deque` with locks
5. **Prefer higher-level primitives:** Use `queue.Queue` instead of raw locks when possible
6. **Use `while` for condition waits:** Never use `if` (handles spurious wakeups)
7. **Document locking order:** If you must use multiple locks, establish and document the order
8. **Test with high contention:** Race conditions appear under stress

---

## Running the Simulations

### Bank Account
```bash
python bank_simulation.py
```
**Expected output:** Unsafe version shows wrong balance, safe version shows correct $0.00

### Dining Philosophers
```bash
python dining_philosophers.py
```
**Expected output:** All 5 philosophers eat 3 meals each (15 total), no deadlock

### Producer-Consumer
```bash
python producer_consumer.py
```
**Expected output:** Items produced and consumed, with bounded buffer preventing overflow

---

## Conclusion

These three classic problems illustrate fundamental concurrency concepts:

1. **Bank Account:** Race conditions and mutual exclusion (locks)
2. **Dining Philosophers:** Deadlock and prevention strategies
3. **Producer-Consumer:** Thread coordination with condition variables

Understanding these patterns is essential for writing correct concurrent programs. Modern applications use these primitives extensively, often wrapped in higher-level abstractions like:
- Thread pools (`concurrent.futures.ThreadPoolExecutor`)
- Async/await (`asyncio`)
- Process pools (`multiprocessing`)
- Actor models (Akka, Erlang)

But underneath, they all rely on these fundamental synchronization mechanisms.

