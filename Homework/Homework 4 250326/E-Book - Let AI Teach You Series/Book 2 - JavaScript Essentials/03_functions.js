/**
 * Book 2: JavaScript Essentials
 * Functions and Scope - Chapter 3
 */

// Function Types
console.log("=== FUNCTION TYPES ===");

// Traditional function
function greet(name) {
    return "Hello, " + name + "!";
}
console.log(greet("Alice"));

// Arrow function (ES6)
const greetArrow = (name) => `Hello, ${name}!`;
console.log(greetArrow("Bob"));

// With default parameters
const welcome = (name = "Guest") => `Welcome, ${name}!`;
console.log(welcome());
console.log(welcome("Charlie"));

// Multiple parameters
const calculate = (a, b, operation = "add") => {
    switch(operation) {
        case "add": return a + b;
        case "subtract": return a - b;
        case "multiply": return a * b;
        case "divide": return b !== 0 ? a / b : "Error: Division by zero";
        default: return "Invalid operation";
    }
};
console.log(`10 + 5 = ${calculate(10, 5, "add")}`);
console.log(`10 * 5 = ${calculate(10, 5, "multiply")}`);

// Scope
console.log("\n=== SCOPE ===");

const globalVar = "I'm global";

function scopeDemo() {
    const localVar = "I'm local";
    console.log(globalVar);
    console.log(localVar);
    
    if (true) {
        let blockVar = "I'm in a block";
        console.log(blockVar);
    }
}

scopeDemo();

// Closures
console.log("\n=== CLOSURES ===");

function createCounter() {
    let count = 0;
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = createCounter();
console.log(`Count: ${counter.getCount()}`);
counter.increment();
counter.increment();
counter.increment();
console.log(`Count: ${counter.getCount()}`);
counter.decrement();

// Callback functions
console.log("\n=== CALLBACKS ===");

const processData = (data, callback) => {
    console.log(`Processing: ${data}`);
    const result = data.toUpperCase();
    callback(result);
};

processData("hello world", (result) => {
    console.log(`Result: ${result}`);
});
