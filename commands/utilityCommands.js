const { EmbedBuilder } = require('discord.js');

module.exports = {
    handleHelp: async (interaction) => {
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('😻 MeowBot Commands')
            .setDescription('Here are all the commands you can use with MeowBot!')
            .addFields(
                {
                    name: '🐱 Cat Commands',
                    value: [
                        '`/adopt [breed]` - Adopt a virtual cat',
                        '`/feed [item]` - Feed your cat with items from your inventory',
                        '`/pet` - Pet your cat to increase happiness',
                        '`/play [item]` - Play with your cat using toys',
                        '`/catstats` - Check your cat\'s stats',
                        '`/shop` - View items available in the shop',
                        '`/buy [item]` - Purchase items from the shop',
                        '`/inventory` - View your inventory',
                        '`/daily` - Claim your daily fishcoins',
                        '`/balance` - Check your fishcoins balance',
                        '`/duel [user] [bet]` - Challenge another cat owner to a duel',
                        '`/catpic` - Get a random cat picture',
                        '`/catfact` - Get a random cat fact',
                        '`/rename [name]` - Rename your cat',
                        '`/breed [breed]` - Change your cat\'s breed (requires breed change item)'
                    ].join('\n')
                },
                {
                    name: '🛠️ Moderation Commands',
                    value: [
                        '`/scratch [user] [duration] [reason]` - Mute a user',
                        '`/hiss [user] [reason]` - Warn a user',
                        '`/banish [user] [reason] [days]` - Ban a user',
                        '`/remove [user] [reason]` - Kick a user',
                        '`/purge [amount]` - Delete multiple messages',
                        '`/lock [reason]` - Lock the current channel',
                        '`/unlock` - Unlock the current channel',
                        '`/purgebot [amount]` - Purge bot messages in this channel'
                    ].join('\n')
                }
            )
            .setFooter({ text: 'MeowBot - The purrfect companion!' });
        
        interaction.reply({ embeds: [embed] });
    }
};
