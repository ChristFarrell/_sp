"""
producer_consumer.py
====================
Simulates the classic Producer-Consumer problem using:
  • threading.Condition  (wait / notify)
  • A bounded buffer (queue)

Multiple producers add items; multiple consumers take them.
The simulation runs for a fixed duration, then reports stats.

Run:
    python producer_consumer.py
"""

import threading
import time
import random
import collections


# ─────────────────────────────────────────────
#  Bounded Buffer
# ─────────────────────────────────────────────

class BoundedBuffer:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self._buffer: collections.deque = collections.deque()
        self._condition = threading.Condition()
        self._produced = 0
        self._consumed = 0

    def put(self, item, producer_id: int):
        with self._condition:
            # Wait while the buffer is full
            while len(self._buffer) >= self.capacity:
                self._condition.wait()

            self._buffer.append(item)
            self._produced += 1
            print(f"  [P{producer_id}] produced {item:>4}  │  buffer size: {len(self._buffer):>2}/{self.capacity}")
            # Wake up consumers that may be waiting
            self._condition.notify_all()

    def get(self, consumer_id: int):
        with self._condition:
            # Wait while the buffer is empty
            while len(self._buffer) == 0:
                self._condition.wait()

            item = self._buffer.popleft()
            self._consumed += 1
            print(f"  [C{consumer_id}] consumed {item:>4}  │  buffer size: {len(self._buffer):>2}/{self.capacity}")
            # Wake up producers that may be waiting
            self._condition.notify_all()
            return item

    @property
    def stats(self):
        return self._produced, self._consumed


# ─────────────────────────────────────────────
#  Producer / Consumer workers
# ─────────────────────────────────────────────

def producer(buffer: BoundedBuffer, pid: int, stop_event: threading.Event,
             min_delay: float = 0.05, max_delay: float = 0.15):
    item_id = 0
    while not stop_event.is_set():
        item = pid * 1000 + item_id
        buffer.put(item, pid)
        item_id += 1
        time.sleep(random.uniform(min_delay, max_delay))


def consumer(buffer: BoundedBuffer, cid: int, stop_event: threading.Event,
             min_delay: float = 0.08, max_delay: float = 0.20):
    while not stop_event.is_set():
        try:
            buffer.get(cid)
        except Exception:
            break
        time.sleep(random.uniform(min_delay, max_delay))


# ─────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────

def main():
    NUM_PRODUCERS = 2
    NUM_CONSUMERS = 3
    BUFFER_CAPACITY = 5
    RUN_SECONDS = 3

    print("\n" + "━"*60)
    print("  Producer-Consumer Problem Simulation")
    print(f"  {NUM_PRODUCERS} producers, {NUM_CONSUMERS} consumers, buffer capacity={BUFFER_CAPACITY}")
    print(f"  Running for {RUN_SECONDS} seconds…")
    print("━"*60 + "\n")

    buffer = BoundedBuffer(BUFFER_CAPACITY)
    stop_event = threading.Event()

    # Spawn producers
    producers = [
        threading.Thread(target=producer, args=(buffer, i + 1, stop_event), daemon=True)
        for i in range(NUM_PRODUCERS)
    ]
    # Spawn consumers
    consumers = [
        threading.Thread(target=consumer, args=(buffer, i + 1, stop_event), daemon=True)
        for i in range(NUM_CONSUMERS)
    ]

    all_threads = producers + consumers
    for t in all_threads:
        t.start()

    # Let them run for RUN_SECONDS
    time.sleep(RUN_SECONDS)
    stop_event.set()

    # Give threads a moment to notice the stop signal
    time.sleep(0.3)

    produced, consumed = buffer.stats
    remaining = len(buffer._buffer)

    print("\n" + "━"*60)
    print("  Results")
    print("━"*60)
    print(f"  Total produced : {produced}")
    print(f"  Total consumed : {consumed}")
    print(f"  Left in buffer : {remaining}")
    print()
    print("  How it works:")
    print("  • threading.Condition lets producers WAIT when buffer is full")
    print("  • Consumers WAIT when buffer is empty")
    print("  • notify_all() wakes the other side after each put/get")
    print("  • The bounded buffer prevents memory overflow\n")


if __name__ == "__main__":
    main()
