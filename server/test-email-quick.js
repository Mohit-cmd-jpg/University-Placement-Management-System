const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function test() {
    try {
        await transporter.verify();
        console.log('Credentials are valid and connection is successful.');
    } catch (error) {
        console.error('Error verifying credentials:', error);
    }
}

test();
