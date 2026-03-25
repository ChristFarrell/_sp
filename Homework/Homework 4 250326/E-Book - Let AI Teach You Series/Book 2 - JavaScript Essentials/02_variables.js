/**
 * Book 2: JavaScript Essentials
 * Variables and Data Types - Chapter 2
 */

// Modern JavaScript Variables (ES6+)
const PI = 3.14159;
const siteName = "My JavaScript Site";

let score = 0;
score = 10;

var oldStyle = "This is deprecated";

// Data Types
console.log("=== DATA TYPES ===");

// Strings
const name = "Alice";
const greeting = 'Hello';
const template = `Welcome, ${name}!`;
console.log(template);

// Numbers
const age = 25;
const price = 19.99;
console.log(`Age: ${age}, Price: ${price}`);

// Boolean
const isActive = true;
const isStudent = false;

// Null and Undefined
const nothing = null;
let notDefined;
console.log(`nothing: ${nothing}, notDefined: ${notDefined}`);

// Arrays
const fruits = ["apple", "banana", "cherry"];
const mixed = [1, "hello", true, null];

// Objects
const user = {
    name: "Alice",
    age: 20,
    courses: ["Math", "Physics", "CS"]
};
console.log(`User: ${user.name}, Age: ${user.age}`);

// Array Methods
console.log("\n=== ARRAY METHODS ===");

const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2);
console.log(`Doubled: ${doubled.join(", ")}`);

const evens = numbers.filter(n => n % 2 === 0);
console.log(`Evens: ${evens.join(", ")}`);

const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(`Sum: ${sum}`);

const found = numbers.find(n => n > 3);
console.log(`First > 3: ${found}`);

// Practice: Student grades
const students = [
    { name: "Alice", grade: 85 },
    { name: "Bob", grade: 92 },
    { name: "Charlie", grade: 78 },
    { name: "Diana", grade: 95 }
];

const highAchievers = students
    .filter(s => s.grade >= 90)
    .map(s => s.name);
console.log(`High achievers: ${highAchievers.join(", ")}`);
