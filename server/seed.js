import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

const sampleUsers = [
  {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'password123',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    password: 'password123',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
  },
];

const samplePosts = [
  {
    title: 'Getting Started with the MERN Stack in 2026',
    category: 'Technology',
    userIndex: 0,
    content: `The MERN stack (MongoDB, Express, React, Node.js) remains one of the most versatile and in-demand tech stacks for web development. Whether you're building a personal portfolio or an enterprise application, mastering JavaScript across both the frontend and backend brings tremendous synergy.

When starting out, focus on building clean REST APIs with Express and Mongoose. Keep your controllers lean and separate validation, database logic, and middleware. On the frontend, modern React with hooks and custom services makes state management straightforward without over-complicating your architecture.

Happy coding, and enjoy the journey of becoming a full-stack engineer!`,
    comments: [
      { userIndex: 1, content: 'Great breakdown! The tip about keeping controllers lean really helped clarify how to structure my routes.' },
      { userIndex: 2, content: 'Very beginner friendly. Looking forward to more posts on API authentication!' },
    ],
  },
  {
    title: '10 Essential Productivity Tips for Remote Developers',
    category: 'Lifestyle',
    userIndex: 1,
    content: `Working remotely offers incredible flexibility, but it also comes with its fair share of distractions. Over the past three years of working from home, I have tested dozens of workflows and habits.

Here are the top three that had the highest impact:
1. Define a strict shutdown routine. When 6 PM hits, close your laptop and step away.
2. The 2-minute rule: if a task takes less than two minutes (like replying to an urgent slack ping or committing a quick patch), do it immediately.
3. Protect your deep-work blocks. Block 2-3 hours on your calendar every morning with zero meetings.

Cultivating healthy work-life boundaries is the key to longevity in tech.`,
    comments: [
      { userIndex: 0, content: 'The strict shutdown routine is a game changer. I used to let work bleed into late evenings.' },
    ],
  },
  {
    title: 'A Weekend Guide to Exploring the Himalayas',
    category: 'Travel',
    userIndex: 2,
    content: `The Himalayas have a way of putting everyday problems into perspective. Last weekend, I took an impromptu trek through the trails surrounding Manali and Dharamshala.

The crisp mountain air, the sound of flowing glacial streams, and the warmth of local homestays made it an unforgettable journey. If you are planning a trip, pack light, carry hydration tablets, respect local traditions, and always check weather forecasts ahead of time.

Sometimes unplugging from screens and reconnecting with nature is the best debugging tool you could ask for.`,
    comments: [
      { userIndex: 1, content: 'Stunning! The Himalayas are definitely at the top of my bucket list this year.' },
    ],
  },
  {
    title: 'Understanding React 18: Hooks, Concurrency, and Best Practices',
    category: 'Technology',
    userIndex: 0,
    content: `React 18 brought automatic batching, concurrent rendering features, and transitions. Understanding these additions helps developers build responsive, snappy user interfaces.

Hooks like useState and useEffect form the foundation, but custom hooks allow you to package and reuse stateful logic cleanly across components. When combined with modern bundlers like Vite, development feedback loops are instantaneous.

Always remember: premature optimization is the root of all evil. Build clearly first, profile with React DevTools, and optimize only where performance actually bottlenecks.`,
    comments: [
      { userIndex: 2, content: 'Awesome explanation of why custom hooks make code cleaner and more testable.' },
      { userIndex: 1, content: 'Vite + React 18 is indeed such a blazing fast developer experience!' },
    ],
  },
  {
    title: 'The Art of Mindful Living in a Hyper-Connected World',
    category: 'Health',
    userIndex: 1,
    content: `We check our phones an average of 96 times a day. Constant notifications fragment our attention span and elevate cortisol levels.

Mindfulness doesn't mean sitting on a mountain in silence for hours. It starts with simple choices: enjoying your morning tea without scrolling through social feeds, taking short screen-free walks, and practicing single-tasking instead of juggling ten browser tabs.

Take a deep breath, slow down, and give your mind the quiet space it needs to recharge.`,
    comments: [
      { userIndex: 0, content: 'Needed this reminder today. Turning off notifications for an hour right now!' },
    ],
  },
  {
    title: 'Why Every Developer Should Learn Database Indexing',
    category: 'Technology',
    userIndex: 2,
    content: `When your application only has 100 records, every query feels instantaneous. But as your dataset scales to hundreds of thousands of documents, unindexed queries turn into full table scans that choke your database.

In MongoDB, creating indexes on fields frequently used in query filters, sorting, and foreign key references (such as author and post IDs) reduces query times from seconds to single-digit milliseconds.

Take 15 minutes today to inspect your database queries with explain() and ensure your essential lookup paths are properly indexed!`,
    comments: [
      { userIndex: 0, content: 'Indexes are indeed a superpower. Great explanation of why explain() is so important.' },
    ],
  },
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Clearing existing data (optional)...');
    // Delete existing comments and posts created by demo users
    const existingEmails = sampleUsers.map((u) => u.email);
    const existingUsers = await User.find({ email: { $in: existingEmails } });
    const userIds = existingUsers.map((u) => u._id);

    await Comment.deleteMany({ author: { $in: userIds } });
    await Post.deleteMany({ author: { $in: userIds } });
    await User.deleteMany({ email: { $in: existingEmails } });

    console.log('Creating demo users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(` Created user: ${user.name} (${user.email})`);
    }

    console.log('Creating demo blog posts and comments...');
    let postCount = 0;
    let commentCount = 0;

    for (const postData of samplePosts) {
      const author = createdUsers[postData.userIndex];
      const post = await Post.create({
        title: postData.title,
        content: postData.content,
        category: postData.category,
        author: author._id,
      });
      postCount++;

      if (postData.comments && postData.comments.length > 0) {
        for (const comm of postData.comments) {
          const commentAuthor = createdUsers[comm.userIndex];
          await Comment.create({
            post: post._id,
            author: commentAuthor._id,
            content: comm.content,
          });
          commentCount++;
        }
      }
    }

    console.log(`\n Successfully seeded:`);
    console.log(`- ${createdUsers.length} Users`);
    console.log(`- ${postCount} Blog Posts`);
    console.log(`- ${commentCount} Comments`);
    console.log('\nDemo login credentials:');
    sampleUsers.forEach((u) => {
      console.log(`  Email: ${u.email} | Password: ${u.password}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
