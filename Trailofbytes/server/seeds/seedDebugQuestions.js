import dotenv from "dotenv";
import connectDB from "../src/config/db.js";
import DebugQuestion from "../src/models/DebugQuestion.js";

dotenv.config();

const debugQuestions = [
    {
        questionNumber: 1,
        codeSnippet: `function sum(a, b) {
  return a + b;
}
console.log(sum(5, "10"));`,
        expectedBehavior: "Should return the sum of two numbers",
        brokenLogic: "String concatenation instead of addition",
        correctOutput: "510",
        hint: "JavaScript performs type coercion. When adding a number and a string, the number is converted to a string.",
        difficulty: "medium",
        points: 200
    },
    {
        questionNumber: 2,
        codeSnippet: `const arr = [1, 2, 3, 4, 5];
for (var i = 0; i < arr.length; i++) {
  setTimeout(() => console.log(arr[i]), 100);
}`,
        expectedBehavior: "Should print array elements after 100ms",
        brokenLogic: "var creates function-scoped variable, closure captures final value",
        correctOutput: "undefined defined defined defined defined",
        hint: "The variable 'i' is shared across all iterations. By the time setTimeout executes, the loop has finished.",
        difficulty: "hard",
        points: 200
    },
    {
        questionNumber: 3,
        codeSnippet: `const obj = { value: 10 };
function modify(o) {
  o = { value: 20 };
}
modify(obj);
console.log(obj.value);`,
        expectedBehavior: "Should modify object property",
        brokenLogic: "Reassignment creates new reference, doesn't modify original",
        correctOutput: "10",
        hint: "Objects are passed by reference, but reassigning the parameter creates a new reference.",
        difficulty: "medium",
        points: 200
    },
    {
        questionNumber: 4,
        codeSnippet: `console.log(typeof null);
console.log(typeof undefined);
console.log(null == undefined);
console.log(null === undefined);`,
        expectedBehavior: "Check types and equality of null and undefined",
        brokenLogic: "typeof null returns 'object' due to legacy bug",
        correctOutput: "object defined true false",
        hint: "This is a well-known JavaScript quirk. Also, == performs type coercion but === doesn't.",
        difficulty: "medium",
        points: 200
    },
    {
        questionNumber: 5,
        codeSnippet: `const arr = [10, 5, 40, 25, 1000, 1];
arr.sort();
console.log(arr.join(","));`,
        expectedBehavior: "Should sort array numerically",
        brokenLogic: "Default sort converts to strings and compares lexicographically",
        correctOutput: "1,10,1000,25,40,5",
        hint: "Array.sort() converts elements to strings by default. '1000' comes before '25' alphabetically.",
        difficulty: "hard",
        points: 200
    },
    {
        questionNumber: 6,
        codeSnippet: `function test() {
  console.log(a);
  var a = 5;
  console.log(a);
}
test();`,
        expectedBehavior: "Should print undefined then 5",
        brokenLogic: "Variable hoisting moves declaration to top",
        correctOutput: "undefined 5",
        hint: "Variable declarations are hoisted to the top of their scope, but not their assignments.",
        difficulty: "medium",
        points: 200
    },
    {
        questionNumber: 7,
        codeSnippet: `const nums = [1, 2, 3];
const result = nums.map(parseInt);
console.log(result.join(","));`,
        expectedBehavior: "Should convert strings to integers",
        brokenLogic: "map passes index as second argument to parseInt (radix)",
        correctOutput: "1,NaN,NaN",
        hint: "map() passes three arguments: element, index, and array. parseInt takes a second parameter: radix.",
        difficulty: "hard",
        points: 200
    },
    {
        questionNumber: 8,
        codeSnippet: `console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);`,
        expectedBehavior: "Should equal 0.3",
        brokenLogic: "Floating-point precision errors",
        correctOutput: "0.30000000000000004 false",
        hint: "Computers represent decimal numbers in binary, which can't precisely represent some fractions.",
        difficulty: "medium",
        points: 200
    },
    {
        questionNumber: 9,
        codeSnippet: `const x = [1, 2, 3];
const y = [1, 2, 3];
console.log(x == y);
console.log(x === y);`,
        expectedBehavior: "Should compare arrays",
        brokenLogic: "Arrays are compared by reference, not value",
        correctOutput: "false false",
        hint: "Arrays are objects. Two objects are equal only if they reference the same memory location.",
        difficulty: "medium",
        points: 200
    },
    {
        questionNumber: 10,
        codeSnippet: `function foo() {
  return
  {
    value: 42
  };
}
console.log(foo());`,
        expectedBehavior: "Should return object with value 42",
        brokenLogic: "Automatic semicolon insertion after return statement",
        correctOutput: "undefined",
        hint: "JavaScript automatically inserts a semicolon after 'return' when followed by a newline.",
        difficulty: "hard",
        points: 200
    }
];

async function seedDebugQuestions() {
    try {
        await connectDB();
        console.log("Connected to MongoDB");

        // Clear existing debug questions
        await DebugQuestion.deleteMany({});
        console.log("Cleared existing debug questions");

        // Insert new questions
        await DebugQuestion.insertMany(debugQuestions);
        console.log(`Inserted ${debugQuestions.length} debug questions`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding debug questions:", error);
        process.exit(1);
    }
}

seedDebugQuestions();
