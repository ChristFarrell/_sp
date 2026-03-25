"""
Book 1: Python Fundamentals
Number Guessing Game
"""

import random

def guess_number():
    target = random.randint(1, 10)
    attempts = 3
    
    print("=" * 40)
    print("   NUMBER GUESSING GAME")
    print("=" * 40)
    print("Guess a number between 1 and 10!")
    print(f"You have {attempts} attempts.\n")
    
    while attempts > 0:
        try:
            guess = int(input("Your guess: "))
            
            if guess < 1 or guess > 10:
                print("Please guess a number between 1 and 10!")
                continue
            
            if guess == target:
                print("\n*** CORRECT! You got it! ***")
                return True
            elif guess < target:
                print("Too low! Try a higher number.")
            else:
                print("Too high! Try a lower number.")
            
            attempts -= 1
            print(f"Attempts left: {attempts}\n")
            
        except ValueError:
            print("Invalid input! Please enter a number.\n")
    
    print(f"\n*** GAME OVER ***")
    print(f"The correct number was {target}")
    return False

def play_again():
    while True:
        choice = input("\nPlay again? (yes/no): ").lower()
        if choice in ['yes', 'y', 'no', 'n']:
            return choice in ['yes', 'y']

if __name__ == "__main__":
    print("\n" + "=" * 40)
    print("   WELCOME TO NUMBER GUESS!")
    print("=" * 40 + "\n")
    
    while True:
        guess_number()
        if not play_again():
            print("\nThanks for playing! Goodbye!")
            break
