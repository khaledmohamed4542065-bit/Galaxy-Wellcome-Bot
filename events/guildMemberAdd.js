import config from '../config/config.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { generateWelcomeGif } from '../utils/welcomeGif.js';

export default async (member) => {
    const allowedServers = config.allowedServers;
    if (allowedServers.length > 0 && !allowedServers.includes(member.guild.id)) return;

    const channel = member.guild.channels.cache.get(config.welcomeChannel);
    if (!channel) {
        console.log(`Welcome channel ${config.welcomeChannel} not found`);
        return;
    }

    try {
        const mentionStrings = [
            '<:emoji:1522952824344809482> <#1505842025289879572>',
            '<:emoji:1522248227921989864> <#1505841950358634566>',
            ':tickets: <#1505841944092348486>'
        ];
        const serverIcon = member.guild.iconURL({ dynamic: true, size: 4096 });
        const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
        
        console.log(`🎨 Generating welcome GIF for ${member.user.tag}...`);
        const gifBuffer = await generateWelcomeGif(member.user.username, avatarUrl);
        const attachment = new AttachmentBuilder(gifBuffer, { name: 'welcome.gif' });

        const embed = new EmbedBuilder()
            .setDescription(`
                ✧･ﾟ: *✧･ﾟ:* 　　 *:･ﾟ✧*:･ﾟ✧
            
                ︵‿︵‿୨♡୧‿︵‿︵
                𝓖𝓐𝓛𝓐𝓧𝓨 𝓢𝓔𝓡𝓥𝓔𝓡
                ︶‿︶‿୨♡୧‿︶‿︶
            
                ˚ ༘♡ ⋆｡˚˱ 𓈒 𓈊 ┈ 𓈒 ˲ˏˋ°
            
                𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐆𝐚𝐥𝐚𝐱𝐲 𝐒𝐞𝐫𝐯𝐞𝐫 ${member} 💜
            
                .𖥔 ݁ ˖ ✦ 𝐓𝐚𝐤𝐞 𝐲𝐨𝐮𝐫 𝐭𝐢𝐦𝐞, 𝐬𝐭𝐚𝐫𝐭 𝐬𝐦𝐚𝐥𝐥, 𝐤𝐞𝐞𝐩 𝐠𝐨𝐢𝐧 ✦ ˖ 𖥔.
            
                ${mentionStrings.join('\n            ')}
            
                ‧₊˚ 𝐘𝐨𝐮’𝐫𝐞 𝐡𝐞𝐫𝐞 𝐭𝐨 𝐠𝐫𝐨𝐰, 𝐧𝐨𝐭 𝐭𝐨 𝐫𝐮𝐬𝐡 — 𝐣𝐮𝐬𝐭 𝐞𝐧𝐣𝐨𝐲 𝐭𝐡𝐞 𝐯𝐢𝐛𝐞 ˚₊‧ 
            
                ✧･ﾟ: *✧･ﾟ:* 　　 *:･ﾟ✧*:･ﾟ✧
            `)
            .setColor('#8b5cf6')
            .setThumbnail(serverIcon)
            .setImage('attachment://welcome.gif');

        await channel.send({ content: member.toString(), embeds: [embed], files: [attachment] });
        console.log(`✅ Welcome message with GIF sent for ${member.user.tag}`);
    } catch (error) {
        console.error(`❌ Error in guildMemberAdd handler for ${member.user.tag}:`, error);
    }
};
