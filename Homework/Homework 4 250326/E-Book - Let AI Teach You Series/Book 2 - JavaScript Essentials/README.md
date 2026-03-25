# Book 2: JavaScript Essentials with AI

*A comprehensive guide to mastering JavaScript with AI-powered learning*

---

## Table of Contents

1. [Introduction to JavaScript](#intro)
2. [Variables & Data Types](#variables)
3. [Functions & Scope](#functions)
4. [DOM Manipulation](#dom)
5. [Events](#events)
6. [Async JavaScript](#async)
7. [Working with APIs](#apis)
8. [Mini Projects](#projects)
9. [AI Prompts for JavaScript](#ai-prompts)

---

<a name="intro"></a>
## Chapter 1: Introduction to JavaScript

JavaScript brings websites to life! While HTML structures pages and CSS styles them, JavaScript adds interactivity.

### Where JavaScript Runs
- **Browser** - DOM manipulation, events, animations
- **Server** - Node.js for backend development
- **Mobile** - React Native, Ionic
- **Desktop** - Electron apps (VS Code is built with this!)

### Your First JavaScript
```html
<!DOCTYPE html>
<html>
<head>
    <title>My First JS</title>
</head>
<body>
    <h1>Hello, JavaScript!</h1>
    <button onclick="sayHello()">Click Me!</button>
    
    <script>
        function sayHello() {
            alert("Hello, World!");
        }
    </script>
</body>
</html>
```

**Try it:** Ask AI to create a simple webpage with JavaScript that changes the text when you click a button.

---

<a name="variables"></a>
## Chapter 2: Variables & Data Types

### Modern JavaScript (ES6+)
```javascript
// const - cannot be reassigned
const PI = 3.14159;
const siteName = "My Website";

// let - can be reassigned
let score = 0;
score = 10; // OK

// var - older way (avoid in new code)
var oldStyle = "deprecated";
```

### Data Types
```javascript
// Primitives
const name = "Alice";        // String
const age = 25;             // Number
const price = 19.99;        // Float
const isActive = true;      // Boolean
const nothing = null;       // Null
const notDefined = undefined; // Undefined
const id = Symbol("id");     // Symbol
const bigNum = 9007199254740991n; // BigInt

// Objects
const user = {
    name: "Alice",
    age: 25,
    isStudent: true
};

// Arrays
const fruits = ["apple", "banana", "cherry"];
const mixed = [1, "hello", true, null];
```

### Array Methods
```javascript
const nums = [1, 2, 3, 4, 5];

// Transform
const doubled = nums.map(n => n * 2);  // [2, 4, 6, 8, 10]

// Filter
const evens = nums.filter(n => n % 2 === 0);  // [2, 4]

// Reduce
const sum = nums.reduce((acc, n) => acc + n, 0);  // 15

// Find
const found = nums.find(n => n > 3);  // 4
```

---

<a name="functions"></a>
## Chapter 3: Functions & Scope

### Function Types
```javascript
// Traditional function
function greet(name) {
    return `Hello, ${name}!`;
}

// Arrow function (ES6)
const greetArrow = (name) => `Hello, ${name}!`;

// With default parameters
const welcome = (name = "Guest") => `Welcome, ${name}!`;

// Multiple parameters
const calculate = (a, b, operation = "add") => {
    switch(operation) {
        case "add": return a + b;
        case "subtract": return a - b;
        case "multiply": return a * b;
        case "divide": return b !== 0 ? a / b : "Error";
        default: return "Invalid operation";
    }
};

console.log(calculate(10, 5, "multiply"));  // 50
```

### Scope
```javascript
const globalVar = "I'm global";

function scopeDemo() {
    const localVar = "I'm local";
    console.log(globalVar);  // Works
    console.log(localVar);    // Works
    
    if (true) {
        let blockVar = "I'm in a block";
        const alsoBlock = "Me too";
        console.log(blockVar);  // Works
    }
    // console.log(blockVar);  // Error!
}

scopeDemo();
```

---

<a name="dom"></a>
## Chapter 4: DOM Manipulation

The DOM (Document Object Model) lets JavaScript interact with HTML elements.

### Selecting Elements
```javascript
// By ID
const header = document.getElementById("header");

// By class (returns collection)
const buttons = document.getElementsByClassName("btn");

// Modern selectors
const firstBtn = document.querySelector(".btn");
const allBtns = document.querySelectorAll(".btn");
const special = document.querySelector("#unique");
```

### Modifying Elements
```javascript
const element = document.querySelector("#demo");

// Text content
element.textContent = "New text!";
element.innerText = "Also new text";

// HTML content
element.innerHTML = "<strong>Bold text</strong>";

// Styles
element.style.color = "blue";
element.style.fontSize = "20px";

// Classes
element.classList.add("active");
element.classList.remove("hidden");
element.classList.toggle("highlighted");
```

### Creating Elements
```javascript
// Create new element
const newCard = document.createElement("div");
newCard.className = "card";
newCard.innerHTML = `
    <h3>New Card</h3>
    <p>This was created with JavaScript!</p>
`;

// Add to page
document.querySelector(".container").appendChild(newCard);
```

---

<a name="events"></a>
## Chapter 5: Events

### Event Listeners
```javascript
const button = document.querySelector("#myButton");

// Add event listener
button.addEventListener("click", function(event) {
    console.log("Button clicked!");
    console.log(event.target);
});

// Arrow function syntax
button.addEventListener("click", (e) => {
    console.log(`Clicked at: ${e.clientX}, ${e.clientY}`);
});

// One-time event
button.addEventListener("click", handleClick, { once: true });

function handleClick() {
    alert("This will only fire once!");
}
```

### Common Events
```javascript
// Mouse events
element.addEventListener("click", handler);
element.addEventListener("mouseenter", handler);
element.addEventListener("mouseleave", handler);

// Keyboard events
document.addEventListener("keydown", (e) => {
    console.log(`Key pressed: ${e.key}`);
});

// Form events
form.addEventListener("submit", (e) => {
    e.preventDefault();  // Stop page reload
    console.log("Form submitted!");
});

input.addEventListener("input", (e) => {
    console.log(`Input value: ${e.target.value}`);
});
```

---

<a name="async"></a>
## Chapter 6: Async JavaScript

### Promises
```javascript
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = true;
            if (success) {
                resolve({ data: "Here is your data!" });
            } else {
                reject(new Error("Something went wrong"));
            }
        }, 1000);
    });
};

fetchData()
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Done!"));
```

### Async/Await (Modern Way)
```javascript
async function getData() {
    try {
        console.log("Loading...");
        const response = await fetch("https://api.example.com/data");
        const data = await response.json();
        console.log("Data received:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
    } finally {
        console.log("Finished!");
    }
}

getData();
```

---

<a name="apis"></a>
## Chapter 7: Working with APIs

### Fetch API
```javascript
// GET request
async function getUsers() {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await response.json();
    console.log(users);
}

// POST request
async function createPost(postData) {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
    });
    return await response.json();
}
```

---

<a name="projects"></a>
## Chapter 8: Mini Projects

### Project 1: Interactive Counter
Build a counter that increments, decrements, and resets. Learn about state management and event handling.

### Project 2: Todo App with Local Storage
Build a todo app that persists data using browser localStorage.

---

<a name="ai-prompts"></a>
## Chapter 9: AI Prompts for JavaScript

| What You Need | AI Prompt |
|---------------|-----------|
| Explain concept | "Explain JavaScript [concept] in simple terms" |
| DOM help | "How do I select [element] and change [property]?" |
| Event help | "How do I detect [event type] in JavaScript?" |
| Fix error | "I get this error in my JS: [error message]. Help fix it." |
| API example | "Show me how to fetch data from [API endpoint]" |
| Practice | "Give me 3 JavaScript exercises about [topic]" |

---

*JavaScript powers the interactive web. You're now part of that world!*
