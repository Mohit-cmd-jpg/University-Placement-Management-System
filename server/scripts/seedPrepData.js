const mongoose = require('mongoose');
require('dotenv').config();

const DsaTopic = require('../models/DsaTopic');
const PracticeQuestion = require('../models/PracticeQuestion');

const dsaTopics = [
    {
        week: 1,
        topicName: 'Arrays & Strings',
        difficulty: 'Easy',
        description: 'Master binary and linear search, two pointers, and sliding window techniques.',
        topics: ['Array traversal', 'Two pointers', 'Sliding window', 'String manipulation', 'Prefix sums'],
        resources: ['LeetCode Easy Array problems', 'GeeksforGeeks Array section'],
        recommendedOrder: 1
    },
    {
        week: 2,
        topicName: 'Linked Lists',
        difficulty: 'Medium',
        description: 'Understanding dynamic memory and pointer manipulation.',
        topics: ['Singly linked list', 'Doubly linked list', 'Fast & slow pointers', 'Reversal', 'Merge operations'],
        resources: ['LeetCode Linked List problems', 'Visualgo animations'],
        recommendedOrder: 2
    },
    {
        week: 3,
        topicName: 'Stacks & Queues',
        difficulty: 'Medium',
        description: 'LIFO and FIFO structures and their applications.',
        topics: ['Stack implementation', 'Queue implementation', 'Monotonic stack', 'Priority queue', 'Deque'],
        resources: ['LeetCode Stack problems', 'HackerRank challenges'],
        recommendedOrder: 3
    },
    {
        week: 4,
        topicName: 'Trees & BST',
        difficulty: 'Medium',
        description: 'Exploring hierarchical data structures.',
        topics: ['Binary trees', 'BST operations', 'Tree traversals (BFS/DFS)', 'Balanced trees', 'Heap'],
        resources: ['LeetCode Tree problems', 'Tree visualizer tools'],
        recommendedOrder: 4
    },
    {
        week: 5,
        topicName: 'Graphs',
        difficulty: 'Hard',
        description: 'Modeling complex relations between entities.',
        topics: ['Graph representations', 'BFS & DFS', 'Shortest path algorithms', 'Topological sort', 'Connected components'],
        resources: ['LeetCode Graph problems', 'Graph theory course'],
        recommendedOrder: 5
    },
    {
        week: 6,
        topicName: 'Dynamic Programming',
        difficulty: 'Hard',
        description: 'Solving complex problems by breaking them into overlapping sub-problems.',
        topics: ['Memoization', 'Tabulation', '1D DP', '2D DP', 'Common patterns (knapsack, LCS, LIS)'],
        resources: ['LeetCode DP problems', 'Aditya Verma DP playlist'],
        recommendedOrder: 6
    },
    {
        week: 7,
        topicName: 'Sorting & Searching',
        difficulty: 'Medium',
        description: 'Efficient methods to organize and find data.',
        topics: ['Merge sort', 'Quick sort', 'Binary search variations', 'Counting sort', 'Search in rotated array'],
        resources: ['Sorting visualizers', 'Binary search practice'],
        recommendedOrder: 7
    },
    {
        week: 8,
        topicName: 'Advanced Topics',
        difficulty: 'Hard',
        description: 'Specialized data structures and algorithms.',
        topics: ['Trie', 'Segment tree', 'Disjoint set', 'Bit manipulation', 'Greedy algorithms'],
        resources: ['Competitive programming resources', 'Advanced problem sets'],
        recommendedOrder: 8
    }
];

const practiceQuestions = [
    {
        questionText: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
        topic: 'Arrays',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Google', 'Adobe'],
        solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`,
        explanation: 'Use a hash map to store value and its index for O(1) lookups.',
        initialCode: 'function twoSum(nums, target) {\n  // Write your code here\n}',
        testCases: JSON.stringify([
            { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { input: [[3, 2, 4], 6], expected: [1, 2] }
        ])
    },
    {
        questionText: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
        topic: 'Stacks',
        difficulty: 'Easy',
        companyTags: ['Microsoft', 'Facebook'],
        solution: `function isValid(s) {
  const stack = [];
  const Map = { ")": "(", "}": "{", "]": "[" };
  for (let char of s) {
    if (char in Map) {
      if (stack.pop() !== Map[char]) return false;
    } else stack.push(char);
  }
  return stack.length === 0;
}`,
        explanation: 'Use a stack to keep track of opening brackets and match them with closing ones.',
        initialCode: 'function isValid(s) {\n  // Write your code here\n}',
        testCases: JSON.stringify([
            { input: ["()"], expected: true },
            { input: ["()[]{}"], expected: true },
            { input: ["(]"], expected: false }
        ])
    },
    {
        questionText: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        topic: 'Linked Lists',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Uber'],
        solution: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
        explanation: 'Use three pointers: prev, current, and next to reverse connections.',
        initialCode: 'function reverseList(head) {\n  // Write your code here\n}',
        testCases: "{}" // Placeholder for complex object testing
    },
    {
        questionText: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        companyTags: ['LinkedIn', 'Microsoft'],
        solution: `function maxSubArray(nums) {
  let currSum = nums[0], maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  return maxSum;
}`,
        explanation: "Kadane's algorithm: track current sum and update max sum found so far.",
        initialCode: 'function maxSubArray(nums) {\n  // Write your code here\n}',
        testCases: JSON.stringify([
            { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
            { input: [[1]], expected: 1 }
        ])
    },
    {
        questionText: 'Given the root of a binary tree, return the level order traversal of its nodes values.',
        topic: 'Trees',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Goldman Sachs'],
        solution: `function levelOrder(root) {
  if (!root) return [];
  const res = [], queue = [root];
  while (queue.length) {
    const levelSize = queue.length, currLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(currLevel);
  }
  return res;
}`,
        explanation: 'Use Breadth-First Search (BFS) with a queue to traverse level by level.',
        initialCode: 'function levelOrder(root) {\n  // Write your code here\n}',
        testCases: "{}"
    },
    {
        questionText: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
        topic: 'Arrays',
        difficulty: 'Medium',
        companyTags: ['JPMorgan', 'Salesforce'],
        solution: `function merge(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);
    else res.push(intervals[i]);
  }
  return res;
}`,
        explanation: 'Sort by start time and merge if current interval overlaps with the last merged one.',
        initialCode: 'function merge(intervals) {\n  // Write your code here\n}',
        testCases: JSON.stringify([
            { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] }
        ])
    }
];

const seedPrepData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await DsaTopic.deleteMany({});
        // Map the static fields to match the model
        const topicDocs = dsaTopics.map(t => ({
            topicName: t.topicName,
            difficulty: t.difficulty,
            description: t.description,
            week: t.week,
            recommendedOrder: t.recommendedOrder,
            resources: t.resources
        }));
        await DsaTopic.insertMany(topicDocs);
        console.log(`✅ Seeded ${topicDocs.length} DSA Topics`);

        await PracticeQuestion.deleteMany({});
        await PracticeQuestion.insertMany(practiceQuestions);
        console.log(`✅ Seeded ${practiceQuestions.length} Practice Questions`);

        console.log('✅ Preparation portal seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding prep data:', err.message);
        process.exit(1);
    }
};

seedPrepData();
