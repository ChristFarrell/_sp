"""
dining_philosophers.py
=======================
Simulates the classic Dining Philosophers problem with a
deadlock-free solution using the "resource hierarchy" strategy:

  • Each philosopher is assigned a unique ID (0-4).
  • The two forks around a philosopher are the fork on the left
    (same index as the philosopher) and the fork on the right
    (index + 1) % N.
  • To avoid deadlock, each philosopher always picks up the
    LOWER-numbered fork first.
  • This breaks the circular-wait condition that causes deadlock.

Run:
    python dining_philosophers.py
"""

import threading
import time
import random


# ─────────────────────────────────────────────
#  Philosopher
# ─────────────────────────────────────────────

class Philosopher(threading.Thread):
    THINK_MIN, THINK_MAX = 0.5, 1.5
    EAT_MIN,   EAT_MAX   = 0.3, 0.8

    def __init__(self, pid: int, left_fork: threading.Lock,
                 right_fork: threading.Lock, meals: int,
                 stats: dict, stats_lock: threading.Lock):
        super().__init__(name=f"Philosopher-{pid}", daemon=True)
        self.pid = pid
        self.left_fork = left_fork
        self.right_fork = right_fork
        self.meals_target = meals
        self._stats = stats
        self._stats_lock = stats_lock
        self._meals_eaten = 0

    # Resource-hierarchy solution: always acquire lower-id fork first
    def _acquire_forks(self):
        first, second = (
            (self.left_fork, self.right_fork)
            if id(self.left_fork) < id(self.right_fork)
            else (self.right_fork, self.left_fork)
        )
        first.acquire()
        second.acquire()

    def _release_forks(self):
        self.left_fork.release()
        self.right_fork.release()

    def _think(self):
        duration = random.uniform(self.THINK_MIN, self.THINK_MAX)
        self._log("thinking…")
        time.sleep(duration)

    def _eat(self):
        duration = random.uniform(self.EAT_MIN, self.EAT_MAX)
        self._log("eating  🍝")
        time.sleep(duration)
        self._meals_eaten += 1
        with self._stats_lock:
            self._stats[self.pid] = self._meals_eaten

    def _log(self, msg: str):
        print(f"  Philosopher {self.pid}  {msg}")

    def run(self):
        for _ in range(self.meals_target):
            self._think()
            self._log("hungry, waiting for forks…")
            self._acquire_forks()
            self._eat()
            self._release_forks()
        self._log(f"done! Ate {self._meals_eaten} meal(s).")


# ─────────────────────────────────────────────
#  Simulation
# ─────────────────────────────────────────────

def run_simulation(n_philosophers: int = 5, meals_each: int = 3):
    print("\n" + "━"*60)
    print("  Dining Philosophers Problem")
    print(f"  {n_philosophers} philosophers, each eats {meals_each} meal(s)")
    print("  Solution: Resource Hierarchy (pick lower-id fork first)")
    print("━"*60 + "\n")

    # One fork (Lock) between each pair of neighbours
    forks = [threading.Lock() for _ in range(n_philosophers)]

    stats: dict = {}
    stats_lock = threading.Lock()

    philosophers = []
    for i in range(n_philosophers):
        left = forks[i]
        right = forks[(i + 1) % n_philosophers]
        p = Philosopher(i, left, right, meals_each, stats, stats_lock)
        philosophers.append(p)

    start = time.perf_counter()
    for p in philosophers:
        p.start()
    for p in philosophers:
        p.join()
    elapsed = time.perf_counter() - start

    print("\n" + "━"*60)
    print("  Meal Summary")
    print("━"*60)
    total = 0
    for i, p in enumerate(philosophers):
        eaten = stats.get(i, 0)
        total += eaten
        print(f"  Philosopher {i}: {eaten} meal(s)")
    print(f"\n  Total meals served: {total}  (expected: {n_philosophers * meals_each})")
    print(f"  Time elapsed      : {elapsed:.2f}s")

    deadlock_free = total == n_philosophers * meals_each
    print(f"  Deadlock occurred : {'NO ✅' if deadlock_free else 'YES ❌'}")

    print("""
  How deadlock is prevented:
  ─────────────────────────────────────────────────────────
  Without a strategy, all philosophers could pick up their
  LEFT fork simultaneously, then wait forever for the RIGHT —
  a circular wait = deadlock.

  The Resource Hierarchy rule: always acquire the lower-ID
  fork first. At least one philosopher must pick up forks in
  a different order than his neighbour, breaking the cycle.
  This guarantees progress and prevents deadlock.
""")


# ─────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────

if __name__ == "__main__":
    random.seed(42)
    run_simulation(n_philosophers=5, meals_each=3)
