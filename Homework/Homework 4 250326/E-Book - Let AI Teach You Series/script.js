const books = {
    python: {
        title: "Python Fundamentals",
        icon: "🐍",
        chapters: [
            { title: "Chapter 1: Introduction", content: `<h2>Welcome to Python!</h2><p>Python is one of the most beginner-friendly programming languages. It's used in web development, data science, AI, automation, and game development.</p><h3>Why Learn with AI?</h3><ul><li>AI explains concepts in different ways</li><li>Generates practice exercises for you</li><li>Debugs your code instantly</li><li>Provides instant feedback</li></ul><h3>Your First Code</h3><pre><code class="language-python">print("Hello, World!")
name = "Learner"
print(f"Welcome, {name}!")</code></pre><blockquote><strong>Try it!</strong> Ask AI to write a script that prints your name.</blockquote>` },
            { title: "Chapter 2: Setup", content: `<h2>Setting Up</h2><h3>Online (No Install)</h3><ul><li>Replit.com - Free IDE</li><li>Google Colab - Jupyter in cloud</li><li>PythonAnywhere</li></ul><h3>Local Setup</h3><ol><li>Download Python from python.org</li><li>Install VS Code editor</li><li>Add Python extension</li><li>Create your first .py file</li></ol><blockquote><strong>AI Tip:</strong> Ask: "How do I set up Python on [your OS]?"</blockquote>` },
            { title: "Chapter 3: Variables", content: `<h2>Variables & Data Types</h2><pre><code class="language-python"># Strings
name = "Alice"
# Numbers
age = 25       # Integer
height = 5.8   # Float
# Boolean
is_student = True
# None
middle_name = None</code></pre><h3>Check Types</h3><pre><code class="language-python">print(type(name))  # &lt;class 'str'&gt;
print(type(age))   # &lt;class 'int'&gt;</code></pre><blockquote>Create variables for your favorite movie, age, rating, and favorite status.</blockquote>` },
            { title: "Chapter 4: Control Flow", content: `<h2>Conditionals & Loops</h2><h3>Conditionals</h3><pre><code class="language-python">if temperature > 30:
    print("Hot!")
elif temperature > 20:
    print("Nice!")
else:
    print("Cold!")</code></pre><h3>For Loop</h3><pre><code class="language-python">for i in range(5):
    print(f"Count: {i}")
    
fruits = ["apple", "banana"]
for fruit in fruits:
    print(f"I like {fruit}")</code></pre><h3>While Loop</h3><pre><code class="language-python">count = 0
while count < 5:
    print(count)
    count += 1</code></pre>` },
            { title: "Chapter 5: Functions", content: `<h2>Functions</h2><pre><code class="language-python">def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

message = greet("Alice", "Hi")
print(message)  # Hi, Alice!</code></pre><h3>Multiple Returns</h3><pre><code class="language-python">def calculate(a, b):
    return a + b, a - b, a * b

s, d, p = calculate(10, 5)</code></pre><h3>Practice</h3><p>Write a function that takes two numbers and returns sum, difference, and product.</p><blockquote><strong>Ask AI to review your solution!</strong></blockquote>` },
            { title: "Chapter 6: Data Structures", content: `<h2>Lists & Dictionaries</h2><h3>Lists</h3><pre><code class="language-python">numbers = [1, 2, 3, 4, 5]
numbers.append(6)
print(numbers[0])    # First
print(numbers[-1])   # Last</code></pre><h3>Dictionaries</h3><pre><code class="language-python">student = {
    "Name": "Alice",
    "Age": 20,
}
print(student["Name"])
student["Grade"] = "A"</code></pre><h3>Sets & Tuples</h3><pre><code class="language-python">unique = {1, 2, 3, 3}  # {1, 2, 3}
coords = (10, 20)      # Immutable</code></pre>` },
            { title: "Chapter 7: File Handling", content: `<h2>Working with Files</h2><h3>Write to File</h3><pre><code class="language-python">with open("notes.txt", "w") as f:
    f.write("Learning Python!\\n")
    f.write("AI makes it fun!")</code></pre><h3>Read from File</h3><pre><code class="language-python">with open("notes.txt", "r") as f:
    content = f.read()
    print(content)</code></pre><h3>Append</h3><pre><code class="language-python">with open("notes.txt", "a") as f:
    f.write("\\nNew line!")</code></pre><blockquote><strong>Project:</strong> Create a note-taking app!</blockquote>` },
            { title: "Chapter 8: Mini Projects", content: `<h2>Projects</h2><h3>Number Guessing Game</h3><pre><code class="language-python">import random
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
    print("1.Add 2.View 3.Quit")
    choice = input(": ")
    if choice == "1": tasks.append(input("Task: "))
    elif choice == "2":
        for i, t in enumerate(tasks, 1): print(f"{i}. {t}")
    elif choice == "3": break</code></pre>` },
            { title: "Chapter 9: AI Prompts", content: `<h2>AI Cheat Sheet</h2><table><tr><th>Need</th><th>Ask AI</th></tr><tr><td>Explain</td><td>"Explain Python [topic] simply"</td></tr><tr><td>Debug</td><td>"Error in my code: [code]. Fix it."</td></tr><tr><td>Practice</td><td>"Give me 5 Python exercises"</td></tr><tr><td>Simplify</td><td>"Explain that simpler"</td></tr><tr><td>Quiz</td><td>"Quiz me on Python [topic]"</td></tr></table><h3>Next Steps</h3><p>Continue to JavaScript, Web Development, Data Science, or Competitive Programming!</p>` }
        ]
    },
    javascript: {
        title: "JavaScript Essentials",
        icon: "⚡",
        chapters: [
            { title: "Chapter 1: Introduction", content: `<h2>Welcome to JavaScript!</h2><p>JavaScript is the language of the web. It powers interactive websites and runs on client & server (Node.js).</p><h3>Why Learn?</h3><ul><li>Build interactive web pages</li><li>Mobile apps (React Native)</li><li>Server-side (Node.js)</li><li>Endless job opportunities</li></ul><pre><code class="language-javascript">console.log("Hello, World!");
let name = "JS Learner";
console.log(\`Welcome, \${name}!\`);</code></pre><blockquote>Open browser console (F12) and try!</blockquote>` },
            { title: "Chapter 2: Variables", content: `<h2>Variables & Types</h2><pre><code class="language-javascript">const PI = 3.14159;  // cannot change
let count = 0;        // can change

// Types
let name = "Alice";     // string
let age = 25;          // number
let isStudent = true;  // boolean
let notDefined;        // undefined
let empty = null;      // null

console.log(typeof name);  // "string"</code></pre><blockquote>Practice: Create variables for your info.</blockquote>` },
            { title: "Chapter 3: Functions", content: `<h2>Functions</h2><pre><code class="language-javascript">// Regular function
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Arrow function
const greetArrow = (name) => \`Hello, \${name}!\`;
const greetDefault = (n = "Guest") => \`Hello, \${n}!\`;</code></pre><h3>Higher-Order</h3><pre><code class="language-javascript">function multiplier(factor) {
    return (num) => num * factor;
}
const double = multiplier(2);
double(5);  // 10</code></pre>` },
            { title: "Chapter 4: DOM Manipulation", content: `<h2>DOM Basics</h2><h3>Select Elements</h3><pre><code class="language-javascript">const title = document.getElementById('title');
const buttons = document.querySelectorAll('.btn');</code></pre><h3>Modify Elements</h3><pre><code class="language-javascript">element.textContent = 'New text';
element.innerHTML = '<strong>Bold</strong>';
element.style.color = 'blue';
element.classList.add('active');</code></pre><h3>Create Elements</h3><pre><code class="language-javascript">const div = document.createElement('div');
div.textContent = 'I am new!';
document.body.appendChild(div);</code></pre>` },
            { title: "Chapter 5: Events", content: `<h2>Event Handling</h2><pre><code class="language-javascript">button.addEventListener('click', () => {
    console.log('Clicked!');
});

button.addEventListener('click', (e) => {
    console.log('Target:', e.target);
});</code></pre><h3>Common Events</h3><table><tr><th>Event</th><th>Description</th></tr><tr><td>click</td><td>Element clicked</td></tr><tr><td>mouseover</td><td>Mouse enters</td></tr><tr><td>keydown</td><td>Key pressed</td></tr><tr><td>submit</td><td>Form submitted</td></tr></table>` },
            { title: "Chapter 6: Async JS", content: `<h2>Async JavaScript</h2><h3>Callbacks</h3><pre><code class="language-javascript">setTimeout(() => {
    console.log('After 2 seconds');
}, 2000);</code></pre><h3>Promises</h3><pre><code class="language-javascript">const fetchData = () => new Promise((resolve) => {
    setTimeout(() => resolve('Data!'), 1000);
});
fetchData().then(data => console.log(data));</code></pre><h3>Async/Await</h3><pre><code class="language-javascript">const getData = async () => {
    try {
        const res = await fetch('url');
        const data = await res.json();
    } catch (error) {
        console.error(error);
    }
};</code></pre>` }
        ]
    },
    webdev: {
        title: "Web Development",
        icon: "🌐",
        chapters: [
            { title: "Chapter 1: HTML", content: `<h2>HTML Basics</h2><pre><code class="language-html">&lt;!DOCTYPE html&gt;
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
            { title: "Chapter 2: CSS", content: `<h2>CSS Styling</h2><h3>Selectors</h3><pre><code class="language-css">p { color: blue; }
.highlight { background: yellow; }
#header { font-size: 24px; }</code></pre><h3>Box Model</h3><pre><code class="language-css">.box {
    margin: 10px;
    padding: 20px;
    border: 1px solid black;
}</code></pre><h3>Flexbox</h3><pre><code class="language-css">.container {
    display: flex;
    justify-content: space-between;
}</code></pre>` },
            { title: "Chapter 3: Responsive", content: `<h2>Responsive Design</h2><pre><code class="language-css">/* Mobile first */
.container { width: 100%; }

/* Tablet */
@media (min-width: 768px) {
    .container { width: 750px; margin: 0 auto; }
}

/* Desktop */
@media (min-width: 1024px) {
    .container { width: 1000px; }
}</code></pre><h3>Relative Units</h3><ul><li><code>rem</code> - Font relative</li><li><code>em</code> - Parent relative</li><li><code>vw/vh</code> - Viewport %</li><li><code>%</code> - Parent %</li></ul>` },
            { title: "Chapter 4: JS in Web", content: `<h2>JavaScript in Web</h2><h3>Linking JS</h3><pre><code class="language-html">&lt;script src="script.js"&gt;&lt;/script&gt;</code></pre><h3>Example</h3><pre><code class="language-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;link rel="stylesheet" href="styles.css"&gt;
&lt;/head&gt;
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
        chapters: [
            { title: "Chapter 1: Introduction", content: `<h2>Welcome to Data Science!</h2><p>Data Science combines statistics, programming, and domain expertise to extract insights from data.</p><h3>The Pipeline</h3><ol><li><strong>Collect</strong> - Gather data</li><li><strong>Clean</strong> - Handle missing values</li><li><strong>Explore</strong> - Find patterns</li><li><strong>Model</strong> - Build predictions</li><li><strong>Communicate</strong> - Present findings</li></ol><h3>Essential Tools</h3><ul><li><strong>Pandas</strong> - Data manipulation</li><li><strong>NumPy</strong> - Numerical computing</li><li><strong>Matplotlib</strong> - Visualization</li><li><strong>Scikit-learn</strong> - Machine learning</li></ul>` },
            { title: "Chapter 2: Pandas", content: `<h2>Working with Pandas</h2><pre><code class="language-python">import pandas as pd

data = {'name': ['Alice', 'Bob'], 'age': [25, 30]}
df = pd.DataFrame(data)

# Operations
print(df.head())       # First rows
print(df.describe())   # Statistics
print(df['name'])      # Select column
print(df[df['age'] > 25])  # Filter</code></pre><h3>Missing Data</h3><pre><code class="language-python">df.isnull().sum()           # Check
df['age'].fillna(mean)      # Fill
df.dropna()                 # Drop rows</code></pre>` },
            { title: "Chapter 3: Visualization", content: `<h2>Data Visualization</h2><pre><code class="language-python">import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
plt.xlabel('X')
plt.ylabel('Y')
plt.title('My Plot')
plt.show()</code></pre><h3>Bar Charts</h3><pre><code class="language-python">languages = ['Python', 'JS', 'Java']
popularity = [45, 30, 15]
plt.bar(languages, popularity)
plt.show()</code></pre><h3>Seaborn</h3><pre><code class="language-python">import seaborn as sns
sns.scatterplot(x='bill', y='tip', data=tips)
plt.show()</code></pre>` },
            { title: "Chapter 4: ML Intro", content: `<h2>Machine Learning Intro</h2><h3>Types of ML</h3><ul><li><strong>Supervised</strong> - Learn from labeled data</li><li><strong>Unsupervised</strong> - Find patterns</li><li><strong>Reinforcement</strong> - Learn from rewards</li></ul><pre><code class="language-python">from sklearn.tree import DecisionTreeClassifier
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
        chapters: [
            { title: "Chapter 1: Introduction", content: `<h2>Welcome to Competitive Programming!</h2><p>Sharpen problem-solving skills valued by top tech companies.</p><h3>Why Practice?</h3><ul><li>Improve problem-solving</li><li>Prepare for interviews</li><li>Win competitions</li><li>Build algorithmic intuition</li></ul><h3>Platforms</h3><ul><li><strong>LeetCode</strong> - Interviews</li><li><strong>Codeforces</strong> - Contests</li><li><strong>HackerRank</strong> - Skills</li></ul><h3>Time Complexity</h3><pre><code class="language-python"># O(1) - Constant
# O(n) - Linear  
# O(n²) - Quadratic</code></pre>` },
            { title: "Chapter 2: Data Structures", content: `<h2>Essential Data Structures</h2><h3>Two Pointers</h3><pre><code class="language-python">def reverse(s):
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
            { title: "Chapter 3: Sorting", content: `<h2>Sorting & Searching</h2><h3>Binary Search - O(log n)</h3><pre><code class="language-python">def binary_search(arr, target):
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
            { title: "Chapter 4: Graphs", content: `<h2>Graph Algorithms</h2><h3>BFS</h3><pre><code class="language-python">from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        print(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)</code></pre><h3>DFS</h3><pre><code class="language-python">def dfs(graph, node, visited=None):
    if visited is None: visited = set()
    visited.add(node)
    print(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)</code></pre>` }
        ]
    }
};

let currentBook = 'python';
let currentPage = 0;
let isBookOpen = false;

function buildNav() {
    const nav = document.getElementById('chapter-nav');
    nav.innerHTML = '';
    
    Object.entries(books).forEach(([key, book]) => {
        const bookBtn = document.createElement('button');
        bookBtn.className = 'nav-circle book-indicator';
        bookBtn.textContent = book.icon;
        bookBtn.onclick = () => selectBook(key);
        bookBtn.dataset.book = key;
        if (key === currentBook) bookBtn.classList.add('active');
        nav.appendChild(bookBtn);
        
        book.chapters.forEach((ch, i) => {
            const btn = document.createElement('button');
            btn.className = 'nav-circle';
            btn.textContent = i + 1;
            btn.onclick = () => goToChapter(i);
            btn.dataset.chapter = i;
            btn.dataset.book = key;
            if (key === currentBook && i === currentPage) btn.classList.add('active');
            nav.appendChild(btn);
        });
    });
}

function updateNav() {
    document.querySelectorAll('.nav-circle').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains('book-indicator')) {
            if (btn.dataset.book === currentBook) btn.classList.add('active');
        } else {
            if (btn.dataset.book === currentBook && parseInt(btn.dataset.chapter) === currentPage) {
                btn.classList.add('active');
            }
        }
    });
}

function openBook() {
    if (isBookOpen) return;
    isBookOpen = true;
    
    const cover = document.getElementById('book-cover');
    cover.classList.add('fade-out');
    
    setTimeout(() => {
        cover.classList.add('hidden');
        document.getElementById('openBtn').classList.add('hidden');
        document.getElementById('backBtn').classList.remove('hidden');
        document.getElementById('book-controls').classList.remove('hidden');
        renderPages();
    }, 300);
}

function closeBook() {
    isBookOpen = false;
    
    const cover = document.getElementById('book-cover');
    cover.classList.remove('hidden');
    cover.classList.remove('fade-out');
    
    document.getElementById('openBtn').classList.remove('hidden');
    document.getElementById('backBtn').classList.add('hidden');
    document.getElementById('book-controls').classList.add('hidden');
}

function renderPages() {
    const book = books[currentBook];
    const chapters = book.chapters;
    const total = chapters.length;
    
    document.getElementById('current-book-title').textContent = book.icon + ' ' + book.title;
    document.getElementById('total-pages').textContent = total;
    document.getElementById('current-page').textContent = currentPage + 1;
    
    const leftContent = document.getElementById('left-content');
    const rightContent = document.getElementById('right-content');
    
    if (currentPage === 0) {
        leftContent.innerHTML = `<h1>${book.icon} ${book.title}</h1><p style="text-align:center;color:#8b6914;margin:20px 0;font-style:italic;">Start your learning journey!</p>`;
    } else {
        leftContent.innerHTML = `<h1>${chapters[currentPage - 1].title}</h1>${chapters[currentPage - 1].content}`;
    }
    
    if (currentPage < total) {
        rightContent.innerHTML = `<h1>${chapters[currentPage].title}</h1>${chapters[currentPage].content}`;
    } else {
        leftContent.innerHTML = `<h1>${chapters[currentPage - 1].title}</h1>${chapters[currentPage - 1].content}`;
        rightContent.innerHTML = `<h1>End of Book</h1><p style="text-align:center;margin:40px 0;">Congratulations on completing ${book.title}!</p>`;
    }
    
    document.getElementById('prevBtn').disabled = currentPage === 0;
    document.getElementById('nextBtn').disabled = currentPage >= total;
    
    updateNav();
    setTimeout(() => hljs.highlightAll(), 100);
}

function goToChapter(chapterIndex) {
    if (!isBookOpen) openBook();
    setTimeout(() => {
        currentPage = chapterIndex;
        renderPages();
    }, isBookOpen ? 0 : 350);
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        renderPages();
    }
}

function nextPage() {
    const book = books[currentBook];
    if (currentPage < book.chapters.length) {
        currentPage++;
        renderPages();
    }
}

function selectBook(bookKey) {
    currentBook = bookKey;
    currentPage = 0;
    renderPages();
    buildNav();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-book-title').textContent = books[currentBook].icon + ' ' + books[currentBook].title;
    buildNav();
    hljs.highlightAll();
});
