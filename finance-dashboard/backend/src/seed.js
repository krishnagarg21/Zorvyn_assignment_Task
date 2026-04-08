/**
 * Database Seed Script
 *
 * Creates sample users (1 Admin, 1 Analyst, 1 Viewer) and 30 transactions.
 * Running this script will WIPE all existing users and transactions.
 *
 * Usage: node src/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User.model');
const Transaction = require('./models/Transaction.model');

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@finance.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    name: 'Analyst User',
    email: 'analyst@finance.com',
    password: 'analyst123',
    role: 'ANALYST',
  },
  {
    name: 'Viewer User',
    email: 'viewer@finance.com',
    password: 'viewer123',
    role: 'VIEWER',
  },
];

const CATEGORIES_INCOME = ['salary', 'investment', 'other'];
const CATEGORIES_EXPENSE = ['rent', 'food', 'utilities', 'entertainment', 'healthcare', 'transport', 'education'];

/**
 * Generate a random number between min and max (inclusive).
 */
const randomBetween = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

/**
 * Pick a random element from an array.
 */
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a random date within a given year.
 */
const randomDateInYear = (year) => {
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Safe for all months
  return new Date(year, month, day);
};

/**
 * Build 30 sample transactions spread across categories, types, and months.
 */
const buildTransactions = (userIds) => {
  const transactions = [];
  const notes = [
    'Monthly payment',
    'Quarterly review',
    'One-time purchase',
    'Recurring subscription',
    'Bonus received',
    'Emergency expense',
    'Annual contribution',
    'Daily commute',
    'Weekend outing',
    '',
  ];

  for (let i = 0; i < 30; i++) {
    const type = i % 3 === 0 ? 'income' : 'expense';
    const category =
      type === 'income'
        ? randomPick(CATEGORIES_INCOME)
        : randomPick(CATEGORIES_EXPENSE);

    const amount =
      type === 'income'
        ? randomBetween(2000, 15000)
        : randomBetween(50, 5000);

    transactions.push({
      userId: randomPick(userIds),
      amount,
      type,
      category,
      date: randomDateInYear(2025),
      notes: randomPick(notes),
      isDeleted: false,
    });
  }

  return transactions;
};

const seed = async () => {
  try {
    await connectDB();

    // Wipe existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.info('Cleared existing data');

    // Create users
    const createdUsers = await User.create(SEED_USERS);
    const userIds = createdUsers.map((u) => u._id);
    console.info(`Created ${createdUsers.length} users`);

    // Create transactions
    const transactionData = buildTransactions(userIds);
    const createdTransactions = await Transaction.insertMany(transactionData);
    console.info(`Created ${createdTransactions.length} transactions`);

    console.info('\n──────────────────────────────────────');
    console.info('  Seed completed successfully!');
    console.info('──────────────────────────────────────');
    console.info('\n  Test Credentials:');
    console.info('  ─────────────────');
    SEED_USERS.forEach((u) => {
      console.info(`  ${u.role.padEnd(8)} → ${u.email} / ${u.password}`);
    });
    console.info('');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
