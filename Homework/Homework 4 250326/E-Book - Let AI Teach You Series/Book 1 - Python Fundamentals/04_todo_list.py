"""
Book 1: Python Fundamentals
To-Do List Application
"""

class TodoList:
    def __init__(self):
        self.tasks = []
    
    def add_task(self, task):
        self.tasks.append({'task': task, 'completed': False})
        return True
    
    def view_tasks(self):
        if not self.tasks:
            print("\nNo tasks yet!")
            return
        print("\n" + "=" * 50)
        for i, item in enumerate(self.tasks, 1):
            status = "[✓]" if item['completed'] else "[ ]"
            print(f"{i}. {status} {item['task']}")
    
    def complete_task(self, num):
        if 0 < num <= len(self.tasks):
            self.tasks[num - 1]['completed'] = True
            return True
        return False
    
    def remove_task(self, num):
        if 0 < num <= len(self.tasks):
            return self.tasks.pop(num - 1)
        return None
    
    def save_to_file(self, filename="todo_data.txt"):
        with open(filename, 'w') as f:
            for item in self.tasks:
                status = "1" if item['completed'] else "0"
                f.write(f"{status}|{item['task']}\n")
        return True
    
    def load_from_file(self, filename="todo_data.txt"):
        try:
            with open(filename, 'r') as f:
                self.tasks = []
                for line in f:
                    if '|' in line:
                        status, task = line.strip().split('|', 1)
                        self.tasks.append({
                            'task': task,
                            'completed': status == "1"
                        })
            return True
        except FileNotFoundError:
            return False

def main():
    todo = TodoList()
    todo.load_from_file()
    
    while True:
        print("\n" + "=" * 40)
        print("   TO-DO LIST APP")
        print("=" * 40)
        print("1. Add task")
        print("2. View tasks")
        print("3. Complete task")
        print("4. Remove task")
        print("5. Save tasks")
        print("6. Quit")
        
        choice = input("Choose (1-6): ")
        
        if choice == "1":
            task = input("Enter task: ")
            todo.add_task(task)
            print("Task added!")
        elif choice == "2":
            todo.view_tasks()
        elif choice == "3":
            todo.view_tasks()
            try:
                num = int(input("Task number: "))
                if todo.complete_task(num):
                    print("Done!")
            except ValueError:
                print("Invalid number!")
        elif choice == "4":
            todo.view_tasks()
            try:
                num = int(input("Task number: "))
                if todo.remove_task(num):
                    print("Removed!")
            except ValueError:
                print("Invalid number!")
        elif choice == "5":
            todo.save_to_file()
            print("Saved!")
        elif choice == "6":
            todo.save_to_file()
            print("Goodbye!")
            break

if __name__ == "__main__":
    main()
