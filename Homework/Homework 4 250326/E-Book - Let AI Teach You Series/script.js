const books = {
    python: {
        title: "Python Fundamentals",
        icon: "🐍",
        description: "Learn Python from scratch with AI assistance. Covers variables, data types, control flow, functions, and your first projects.",
        chapters: [
            { title: "Chapter 1: Introduction to Python", content: `<p>Python is one of the most beginner-friendly programming languages.</p><h3>Used in:</h3><ul><li>Web development</li><li>Data science & AI</li><li>Automation & scripting</li><li>Game development</li></ul><h3>Your First Python Code</h3><pre><code class="language-python"># This is a comment
print("Hello, World!")

name = "Python Learner"
print(f"Welcome to {name}!")</code></pre><blockquote><strong>Try it yourself!</strong> Ask AI: "Write a Python script that prints your name."</blockquote>` },
            { title: "Chapter 2: Setting Up Your Environment", content: `<h3>Online (No Installation)</h3><ul><li>Replit.com</li><li>Google Colab</li><li>PythonAnywhere</li></ul><h3>Local Setup</h3><ol><li>Download Python from python.org</li><li>Install VS Code</li><li>Install Python extension</li><li>Create your first .py file</li></ol><blockquote><strong>AI Tip:</strong> Ask: "How do I set up Python on [your OS]?"</blockquote>` },
            { title: "Chapter 3: Variables and Data Types", content: `<pre><code class="language-python"># Strings
name = "Alice"
# Numbers
age = 25       # Integer
height = 5.8   # Float
# Boolean
is_student = True
# None
middle_name = None</code></pre><h3>Check Types</h3><pre><code class="language-python">print(type(name))  # &lt;class 'str'&gt;
print(type(age))    # &lt;class 'int'&gt;</code></pre><blockquote>Create variables for your favorite movie, age, rating, and favorite status.</blockquote>` },
            { title: "Chapter 4: Control Flow", content: `<h3>Conditionals</h3><pre><code class="language-python">temperature = 22
if temperature > 30:
    print("Hot!")
elif temperature > 20:
    print("Nice weather!")
else:
    print("Cold!")</code></pre><h3>For Loops</h3><pre><code class="language-python">for i in range(5):
    print(f"Count: {i}")

fruits = ["apple", "banana"]
for fruit in fruits:
    print(f"I like {fruit}")</code></pre><h3>While Loops</h3><pre><code class="language-python">count = 0
while count < 5:
    print(count)
    count += 1</code></pre>` },
            { title: "Chapter 5: Functions", content: `<pre><code class="language-python">def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# Call the function
message = greet("Alice", "Good morning")
print(message)  # Good morning, Alice!

# Default parameter
message = greet("Bob")  # Hello, Bob!</code></pre><h3>Multiple Returns</h3><pre><code class="language-python">def calculate(a, b):
    return a + b, a - b, a * b

sum, diff, product = calculate(10, 5)</code></pre>` },
            { title: "Chapter 6: Data Structures", content: `<h3>Lists</h3><pre><code class="language-python">numbers = [1, 2, 3, 4, 5]
numbers.append(6)
print(numbers[0])    # First
print(numbers[-1])   # Last</code></pre><h3>Dictionaries</h3><pre><code class="language-python">student = {
    "name": "Alice",
    "age": 20,
}
print(student["name"])
student["grade"] = "A"</code></pre><h3>Sets & Tuples</h3><pre><code class="language-python">unique = {1, 2, 3, 3}  # {1, 2, 3}
coords = (10, 20)      # Immutable</code></pre>` },
            { title: "Chapter 7: File Handling", content: `<h3>Write to File</h3><pre><code class="language-python">with open("notes.txt", "w") as file:
    file.write("Learning Python!\\n")
    file.write("AI makes it better!")</code></pre><h3>Read from File</h3><pre><code class="language-python">with open("notes.txt", "r") as file:
    content = file.read()
    print(content)</code></pre><h3>Append</h3><pre><code class="language-python">with open("notes.txt", "a") as file:
    file.write("\\nNew line!")</code></pre><blockquote><strong>Project:</strong> Create a note-taking app!</blockquote>` },
            { title: "Chapter 8: Mini Projects", content: `<h3>Number Guessing Game</h3><pre><code class="language-python">import random
target = random.randint(1, 10)
attempts = 3
while attempts > 0:
    guess = int(input("Guess: "))
    if guess == target:
        print("You got it!")
        break
    attempts -= 1
else:
    print(f"Game over! It was {target}")</code></pre><h3>To-Do List</h3><pre><code class="language-python">tasks = []
while True:
    print("1.Add 2.View 3.Remove 4.Quit")
    choice = input("Choice: ")
    if choice == "1": tasks.append(input("Task: "))
    elif choice == "2":
        for i, t in enumerate(tasks, 1): print(f"{i}. {t}")
    elif choice == "3": tasks.pop(int(input("Num: ")) - 1)
    elif choice == "4": break</code></pre>` },
            { title: "Chapter 9: AI Prompts Cheat Sheet", content: `<table><tr><th>What You Need</th><th>AI Prompt</th></tr><tr><td>Explain a concept</td><td>"Explain Python [topic] in simple terms"</td></tr><tr><td>Debug code</td><td>"There's an error: [code]. Fix it."</td></tr><tr><td>Practice</td><td>"Give me 5 Python exercises"</td></tr><tr><td>Simplify</td><td>"Explain that again but simpler"</td></tr><tr><td>Quiz</td><td>"Quiz me on Python [topic]"</td></tr></table><h3>Next Steps</h3><p>Continue to JavaScript, Web Development, or Data Science books!</p>` }
        ]
    },
    javascript: {
        title: "JavaScript Essentials",
        icon: "⚡",
        description: "Master JavaScript with AI guidance. Learn DOM manipulation, events, async programming, and build interactive web pages.",
        chapters: [
            { title: "Chapter 1: Introduction to JavaScript", content: `<p>JavaScript is the language of the web. It powers interactive websites and runs on client & server.</p><h3>Why Learn?</h3><ul><li>Build interactive web pages</li><li>Mobile apps (React Native)</li><li>Server-side (Node.js)</li></ul><pre><code class="language-javascript">console.log("Hello, World!");
let name = "JS Learner";
console.log(\`Welcome to \${name}!\`);</code></pre><blockquote>Open browser console (F12) and try!</blockquote>` },
            { title: "Chapter 2: Variables and Data Types", content: `<pre><code class="language-javascript">const PI = 3.14159;  // cannot change
let count = 0;        // can change

// Types
let name = "Alice";     // string
let age = 25;          // number
let isStudent = true;  // boolean
let notDefined;        // undefined
let empty = null;      // null

console.log(typeof name);  // "string"</code></pre>` },
            { title: "Chapter 3: Functions", content: `<pre><code class="language-javascript">// Regular function
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Arrow function
const greetArrow = (name) => \`Hello, \${name}!\`;
const greetDefault = (name = "Guest") => \`Hello, \${name}!\`;

greetDefault();  // Hello, Guest!</code></pre><h3>Higher-Order Functions</h3><pre><code class="language-javascript">function multiplier(factor) {
    return (num) => num * factor;
}
const double = multiplier(2);
double(5);  // 10</code></pre>` },
            { title: "Chapter 4: DOM Manipulation", content: `<h3>Selecting Elements</h3><pre><code class="language-javascript">const title = document.getElementById('title');
const buttons = document.querySelectorAll('.btn');</code></pre><h3>Modifying Elements</h3><pre><code class="language-javascript">element.textContent = 'New text';
element.innerHTML = '<strong>Bold</strong>';
element.style.color = 'blue';
element.classList.add('active');</code></pre><h3>Creating Elements</h3><pre><code class="language-javascript">const div = document.createElement('div');
div.textContent = 'I am new!';
document.body.appendChild(div);</code></pre>` },
            { title: "Chapter 5: Event Handling", content: `<pre><code class="language-javascript">button.addEventListener('click', () => {
    console.log('Clicked!');
});

button.addEventListener('click', (e) => {
    console.log('Target:', e.target);
});</code></pre><h3>Common Events</h3><table><tr><th>Event</th><th>Description</th></tr><tr><td>click</td><td>Element clicked</td></tr><tr><td>mouseover</td><td>Mouse enters</td></tr><tr><td>keydown</td><td>Key pressed</td></tr><tr><td>submit</td><td>Form submitted</td></tr></table>` },
            { title: "Chapter 6: Async JavaScript", content: `<h3>Callbacks</h3><pre><code class="language-javascript">setTimeout(() => {
    console.log('After 2 seconds');
}, 2000);</code></pre><h3>Promises</h3><pre><code class="language-javascript">const fetchData = () => new Promise((resolve) => {
    setTimeout(() => resolve('Data!'), 1000);
});
fetchData().then(data => console.log(data));</code></pre><h3>Async/Await</h3><pre><code class="language-javascript">const getData = async () => {
    try {
        const response = await fetch('url');
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
};</code></pre>` }
        ]
    },
    webdev: {
        title: "Web Development",
        icon: "🌐",
        description: "Build modern websites using HTML, CSS, and frameworks—guided by AI from design to deployment.",
        chapters: [
            { title: "Chapter 1: HTML Fundamentals", content: `<pre><code class="language-html">&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;My Page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Hello, World!&lt;/h1&gt;
    &lt;p&gt;My first webpage.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre><h3>Common Elements</h3><ul><li><code>&lt;div&gt;</code> - Container</li><li><code>&lt;p&gt;</code> - Paragraph</li><li><code>&lt;a href=""&gt;</code> - Links</li><li><code>&lt;img src=""&gt;</code> - Images</li></ul>` },
            { title: "Chapter 2: CSS Styling", content: `<h3>Selectors</h3><pre><code class="language-css">p { color: blue; }
.highlight { background: yellow; }
#header { font-size: 24px; }</code></pre><h3>Box Model</h3><pre><code class="language-css">.box {
    margin: 10px;
    padding: 20px;
    border: 1px solid black;
}</code></pre><h3>Flexbox</h3><pre><code class="language-css">.container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}</code></pre>` },
            { title: "Chapter 3: Responsive Design", content: `<pre><code class="language-css">/* Mobile first */
.container { width: 100%; }

/* Tablet */
@media (min-width: 768px) {
    .container { width: 750px; margin: 0 auto; }
}

/* Desktop */
@media (min-width: 1024px) {
    .container { width: 1000px; }
}</code></pre><h3>Relative Units</h3><ul><li><code>rem</code> - Relative to font</li><li><code>em</code> - Relative to parent</li><li><code>vw/vh</code> - Viewport %</li><li><code>%</code> - Parent %</li></ul>` },
            { title: "Chapter 4: JavaScript in Web Dev", content: `<h3>Linking JavaScript</h3><pre><code class="language-html">&lt;script src="script.js"&gt;&lt;/script&gt;</code></pre><h3>Complete Example</h3><pre><code class="language-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;&lt;link rel="stylesheet" href="styles.css"&gt;&lt;/head&gt;
&lt;body&gt;
    &lt;button id="btn"&gt;Click Me&lt;/button&gt;
    &lt;script src="script.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre><pre><code class="language-javascript">document.getElementById('btn').addEventListener('click', () => {
    alert('Clicked!');
});</code></pre>` }
        ]
    },
    datascience: {
        title: "Data Science",
        icon: "📊",
        description: "Dive into data analysis, visualization, and machine learning concepts with hands-on AI tutoring.",
        chapters: [
            { title: "Chapter 1: Introduction to Data Science", content: `<p>Data Science combines statistics, programming, and domain expertise to extract insights from data.</p><h3>The Pipeline</h3><ol><li><strong>Collect</strong> - Gather data</li><li><strong>Clean</strong> - Handle missing values</li><li><strong>Explore</strong> - Find patterns</li><li><strong>Model</strong> - Build predictions</li><li><strong>Communicate</strong> - Present findings</li></ol><h3>Essential Tools</h3><ul><li><strong>Pandas</strong> - Data manipulation</li><li><strong>NumPy</strong> - Numerical computing</li><li><strong>Matplotlib</strong> - Visualization</li><li><strong>Scikit-learn</strong> - Machine learning</li></ul>` },
            { title: "Chapter 2: Working with Pandas", content: `<pre><code class="language-python">import pandas as pd

data = {'name': ['Alice', 'Bob'], 'age': [25, 30]}
df = pd.DataFrame(data)

# Operations
print(df.head())       # First rows
print(df.describe())   # Statistics
print(df['name'])      # Select column
print(df[df['age'] > 25])  # Filter</code></pre><h3>Missing Data</h3><pre><code class="language-python">df.isnull().sum()           # Check
df['age'].fillna(mean)      # Fill
df.dropna()                 # Drop rows</code></pre>` },
            { title: "Chapter 3: Data Visualization", content: `<pre><code class="language-python">import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
plt.xlabel('X')
plt.ylabel('Y')
plt.title('My Plot')
plt.show()</code></pre><h3>Bar Charts</h3><pre><code class="language-python">languages = ['Python', 'JS', 'Java']
popularity = [45, 30, 15]
plt.bar(languages, popularity)
plt.show()</code></pre><h3>Seaborn</h3><pre><code class="language-python">import seaborn as sns
sns.scatterplot(x='total_bill', y='tip', data=tips)
plt.show()</code></pre>` },
            { title: "Chapter 4: Introduction to Machine Learning", content: `<h3>Types of ML</h3><ul><li><strong>Supervised</strong> - Learn from labeled data</li><li><strong>Unsupervised</strong> - Find patterns</li><li><strong>Reinforcement</strong> - Learn from rewards</li></ul><pre><code class="language-python">from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = DecisionTreeClassifier()
model.fit(X_train, y_train)
print(f'Accuracy: {model.score(X_test, y_test)}')</code></pre>` }
        ]
    },
    competitive: {
        title: "Competitive Programming",
        icon: "🏆",
        description: "Sharpen your problem-solving skills with AI-assisted algorithm practice and coding challenges.",
        chapters: [
            { title: "Chapter 1: Introduction to Competitive Programming", content: `<p>Sharpen problem-solving skills valued by top tech companies.</p><h3>Why Practice?</h3><ul><li>Improve problem-solving</li><li>Prepare for interviews</li><li>Win competitions</li></ul><h3>Platforms</h3><ul><li><strong>LeetCode</strong> - Interviews</li><li><strong>Codeforces</strong> - Contests</li><li><strong>HackerRank</strong> - Skills</li></ul><h3>Time Complexity</h3><pre><code class="language-python"># O(1) - Constant
# O(n) - Linear
# O(n²) - Quadratic</code></pre>` },
            { title: "Chapter 2: Essential Data Structures", content: `<h3>Two Pointers</h3><pre><code class="language-python">def reverse(s):
    left, right = 0, len(s) - 1
    s = list(s)
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return ''.join(s)</code></pre><h3>Hash Maps</h3><pre><code class="language-python">def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []</code></pre>` },
            { title: "Chapter 3: Sorting and Searching", content: `<h3>Binary Search - O(log n)</h3><pre><code class="language-python">def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1</code></pre><h3>Merge Sort - O(n log n)</h3><pre><code class="language-python">def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)</code></pre>` },
            { title: "Chapter 4: Graph Algorithms", content: `<h3>BFS - Breadth-First Search</h3><pre><code class="language-python">from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        print(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)</code></pre><h3>DFS - Depth-First Search</h3><pre><code class="language-python">def dfs(graph, node, visited=None):
    if visited is None: visited = set()
    visited.add(node)
    print(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)</code></pre>` }
        ]
    }
};

let currentBook = null;
let currentChapter = 0;

function init() {
    const grid = document.getElementById('books-grid');
    grid.innerHTML = '';
    Object.entries(books).forEach(([key, book]) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `<h3>${book.icon} ${book.title}</h3><p>${book.description}</p><div class="chapters-count">${book.chapters.length} chapters</div>`;
        card.onclick = () => selectBook(key);
        grid.appendChild(card);
    });
    hljs.highlightAll();
}

function selectBook(bookKey) {
    currentBook = bookKey;
    currentChapter = 0;
    const book = books[bookKey];
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('chapter-view').classList.add('hidden');
    document.getElementById('book-view').classList.remove('hidden');
    document.getElementById('book-title').textContent = `${book.icon} ${book.title}`;
    document.getElementById('book-description').textContent = book.description;
    
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';
    book.chapters.forEach((ch, i) => {
        const btn = document.createElement('button');
        btn.className = 'chapter-btn';
        btn.innerHTML = `<span><span class="chapter-num">${i + 1}</span>${ch.title}</span><span>→</span>`;
        btn.onclick = () => showChapter(i);
        list.appendChild(btn);
    });
}

function showChapter(index) {
    currentChapter = index;
    const book = books[currentBook];
    const ch = book.chapters[index];
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('book-view').classList.add('hidden');
    document.getElementById('chapter-view').classList.remove('hidden');
    document.getElementById('chapter-title').textContent = ch.title;
    document.getElementById('chapter-content').innerHTML = ch.content;
    document.getElementById('prev-chapter').style.visibility = index > 0 ? 'visible' : 'hidden';
    document.getElementById('next-chapter').style.visibility = index < book.chapters.length - 1 ? 'visible' : 'hidden';
    hljs.highlightAll();
}

function showBook() { if (currentBook) selectBook(currentBook); }
function showHome() { currentBook = null; document.getElementById('chapter-view').classList.add('hidden'); document.getElementById('book-view').classList.add('hidden'); document.getElementById('home-view').classList.remove('hidden'); }

function prevChapter() { if (currentChapter > 0) showChapter(currentChapter - 1); }
function nextChapter() { if (currentBook && currentChapter < books[currentBook].chapters.length - 1) showChapter(currentChapter + 1); }

document.addEventListener('DOMContentLoaded', init);
