import dotenv from 'dotenv';
dotenv.config();

const config = {
    token: process.env.BOT_TOKEN,
    allowedServers: (process.env.ALLOW_SERVER || '').split(',').map(id => id.replace(/"/g, '').trim()).filter(id => id.length > 0),
    welcomeChannel: (process.env.WELCOME_CHANNEL_ID || '1494164521038905397').replace(/"/g, '').trim()
};

export default config;
