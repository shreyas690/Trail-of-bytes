import dotenv from "dotenv";
import connectDB from "../src/config/db.js";
import Question from "../src/models/Question.js";
dotenv.config();
const defaults = [
  {
    text:"One byte contains 8 bits.How many bits contain 780 bytes ?",
    answer:"6240 bits",
    difficulty: "common",
    treasureCellIndex: 17
  },
  {
    text:"A stack follows",
    answer:"lifo",
    difficulty:"common",
    treasureCellIndex: 11
  },
  {
    text:"The Java virtual machine executes",
    answer:"bytecode",
    difficulty:"rare",
    treasureCellIndex: 9
  },
  {
    text:"A graph with no cycles is called a",
    answer:"tree",
    difficulty: "rare",
    treasureCellIndex: 21
  },
  {
    text: "A programmer wrote a function that called itself again and again until a condition was met.Which concept was he using?",
    answer: "recursion",
    difficulty: "legendary",
    treasureCellIndex: 23
  },
  {
    text: "A clock gains 8 minutes every 24 hours. How many days will it take to gain 1 hour",
    answer: "7.5 days",
    difficulty: "legendary",
    treasureCellIndex: 18
  },
  {
    text: "The OS memory technique that allows programs larger than RAM to run.",
    answer: "virtual memory",
    difficulty: "common",
    treasureCellIndex: 26
  },
  {
    text: "I am a three-digit number. My tens digit is five more than my ones digit. My hundreds digit is eight less than my tens digit what am I?",
    answer: "194",
    difficulty: "rare",
    treasureCellIndex: 28
  },
  {
    text:"I can be cracked, made, told, and played. What am I?",
    answer:"jokes",
    difficulty: "common",
    treasureCellIndex: 5
  },
  {
    text: "What is 74174855+986748588-1245878+854796321-963258741?",
    answer: "951215145",
    difficulty: "legendary",
    treasureCellIndex: 35
  }
];
const run = async () => {
  await connectDB();
  const count = Number(process.argv[2] || defaults.length);
  await Question.deleteMany({});
  await Question.insertMany(defaults.slice(0, count));
  console.log(`Seeded ${count} questions`);
  process.exit(0);
};
run().catch((err) => {
  console.error(err);
  process.exit(1);
});