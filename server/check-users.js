const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB: ' + process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected to MongoDB');
        const users = await User.find({}, 'name email role isVerified isApprovedByAdmin');
        console.log(`Found ${users.length} users:`);
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Error:', err.message);
        process.exit(1);
    }
}

checkUsers();
