import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import config from './config/config.js';
import guildMemberAdd from './events/guildMemberAdd.js';
import { ensureFonts } from './utils/fontLoader.js';

console.log('🚀 Initializing Galaxy Welcome Bot...');

// Pre-load fonts asynchronously
ensureFonts().catch(err => console.error('Failed to pre-load fonts:', err));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ],
    rest: {
        timeout: 60000
    }
});

// Register guildMemberAdd Event
client.on('guildMemberAdd', guildMemberAdd);

// Handle newly added servers (leave if unauthorized)
client.on('guildCreate', async (guild) => {
    console.log(`📥 Added to a new server: "${guild.name}" (ID: ${guild.id})`);
    if (config.allowedServers.length > 0 && !config.allowedServers.includes(guild.id)) {
        console.warn(`⚠️ New server "${guild.name}" (${guild.id}) is not allowed! Leaving immediately...`);
        await guild.leave()
            .then(() => console.log(`✅ Left unauthorized new server: "${guild.name}" (${guild.id})`))
            .catch(err => console.error(`❌ Failed to leave unauthorized new server "${guild.name}":`, err.message));
    }
});

client.once('clientReady', async () => {
    console.log(`====================================================`);
    console.log(`✅ Galaxy Welcome Bot is READY as ${client.user.tag}`);
    console.log(`🌐 Allowed Servers: ${config.allowedServers.join(', ') || 'ALL SERVERS'}`);
    console.log(`💬 Welcome Channel ID: ${config.welcomeChannel}`);
    console.log(`====================================================`);

    // Verify existing servers
    const guilds = client.guilds.cache;
    console.log(`📡 Bot is currently in ${guilds.size} server(s):`);
    guilds.forEach(guild => {
        console.log(`   - Name: "${guild.name}" | ID: ${guild.id}`);
    });
    console.log(`====================================================`);

    // Leave unauthorized servers
    if (config.allowedServers.length > 0) {
        for (const [id, guild] of guilds) {
            if (!config.allowedServers.includes(id)) {
                console.warn(`⚠️ Leaving unauthorized server: "${guild.name}" (ID: ${id})`);
                await guild.leave()
                    .then(() => console.log(`✅ Successfully left: "${guild.name}" (${id})`))
                    .catch(err => console.error(`❌ Failed to leave "${guild.name}" (${id}):`, err.message));
            }
        }
        console.log(`====================================================`);
    }
});

client.on('error', (err) => console.error('❌ Discord Client Error:', err));
process.on('unhandledRejection', (error) => console.error('⚠️ Unhandled Promise Rejection:', error));

if (!config.token || config.token.trim() === '') {
    console.error('❌ Error: BOT_TOKEN is missing or not configured in .env file!');
    process.exit(1);
}

client.login(config.token);
