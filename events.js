const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { cats, fishcoins, shopItems } = require('./data');
const { getCatPic } = require('./utils');

function checkLevelUp(userId) {
    const cat = cats[userId];
    if (cat.xp >= cat.level * 100) {
        cat.xp -= cat.level * 100;
        cat.level++;
        cat.strength += 2;
        cat.hunger = Math.max(0, cat.hunger - 10);
        cat.happiness = Math.min(100, cat.happiness + 10);
        return true;
    }
    return false;
}

module.exports = {
    handleReady: (client) => {
        console.log(`Logged in as ${client.user.tag}!`);
        client.user.setPresence({
            activities: [{ name: 'with yarn balls', type: 0 }], 
            status: 'online'
        });
    },

    handleInteractionCreate: async (interaction) => {
        if (interaction.isAutocomplete()) {
            const focusedValue = interaction.options.getFocused();
            const commandName = interaction.commandName;
            const userId = interaction.user.id;
            const inventory = require('./data').inventory;
            const userItems = inventory[userId] || [];
            
            if (commandName === 'feed') {
                const filtered = shopItems
                    .filter(item => item.type === 'food' && userItems.includes(item.name) && item.name.includes(focusedValue))
                    .slice(0, 25);
                await interaction.respond(
                    filtered.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name }))
                );
            } else if (commandName === 'play') {
                const filtered = shopItems
                    .filter(item => item.type === 'toy' && userItems.includes(item.name) && item.name.includes(focusedValue))
                    .slice(0, 25);
                await interaction.respond(
                    filtered.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name }))
                );
            } else if (commandName === 'buy') {
                const filtered = shopItems
                    .filter(item => item.name.includes(focusedValue))
                    .slice(0, 25);
                await interaction.respond(
                    filtered.map(item => ({ name: `${item.emoji} ${item.name} (${item.price} fishcoins)`, value: item.name }))
                );
            }
            return;
        }

        if (!interaction.isCommand()) return;
        
        const catCommands = require('./commands/catCommands');
        const modCommands = require('./commands/modCommands');
        const utilityCommands = require('./commands/utilityCommands');
        
        const commandHandlers = {
            'adopt': catCommands.handleAdopt,
            'feed': catCommands.handleFeed,
            'pet': catCommands.handlePet,
            'play': catCommands.handlePlay,
            'catstats': catCommands.handleCatStats,
            'shop': catCommands.handleShop,
            'buy': catCommands.handleBuy,
            'inventory': catCommands.handleInventory,
            'daily': catCommands.handleDaily,
            'balance': catCommands.handleBalance,
            'duel': catCommands.handleDuel,
            'catpic': catCommands.handleCatPic,
            'catfact': catCommands.handleCatFact,
            'rename': catCommands.handleRename,
            'breed': catCommands.handleBreed,
            'scratch': modCommands.handleScratch,
            'hiss': modCommands.handleHiss,
            'banish': modCommands.handleBanish,
            'remove': modCommands.handleRemove,
            'purge': modCommands.handlePurge,
            'lock': modCommands.handleLock,
            'unlock': modCommands.handleUnlock,
            'purgebot': modCommands.handlePurgeBot,
            'help': utilityCommands.handleHelp
        };
        
        const handler = commandHandlers[interaction.commandName];
        if (handler) {
            try {
                await handler(interaction);
            } catch (error) {
                console.error(error);
                interaction.reply({ 
                    embeds: [new EmbedBuilder()
                        .setColor('#ED4245')
                        .setDescription('Something went wrong!')
                    ],
                    ephemeral: true
                }).catch(console.error);
            }
        }
    },

    handleButton: async (interaction) => {
        if (!interaction.isButton()) return;

        try {
            if (interaction.customId.startsWith('duel_accept')) {
                const [_, action, challengerId, opponentId, betAmount] = interaction.customId.split('_');
                const challenger = await interaction.client.users.fetch(challengerId);
                const opponent = await interaction.client.users.fetch(opponentId);
                const bet = parseInt(betAmount);
                
                if (interaction.user.id !== opponentId) return interaction.reply({ 
                    embeds: [new EmbedBuilder()
                        .setColor('#ED4245')
                        .setDescription('This duel challenge isn\'t for you!')
                    ],
                    ephemeral: true
                });
                
                fishcoins[challengerId] -= bet;
                fishcoins[opponentId] -= bet;
                
                const challengerCat = cats[challengerId];
                const opponentCat = cats[opponentId];
                
                const challengerScore = challengerCat.strength + challengerCat.level + (challengerCat.happiness / 20) + ((100 - challengerCat.hunger) / 20) + Math.random() * 5;
                const opponentScore = opponentCat.strength + opponentCat.level + (opponentCat.happiness / 20) + ((100 - opponentCat.hunger) / 20) + Math.random() * 5;
                
                const winner = challengerScore > opponentScore ? challenger : opponent;
                const loser = winner.id === challengerId ? opponent : challenger;
                
                fishcoins[winner.id] += bet * 2;
                
                const xpGain = 15 + Math.floor(Math.random() * 15);
                cats[winner.id].xp += xpGain;
                checkLevelUp(winner.id);
                
                const embed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setTitle('🏆 Duel Results 🏆')
                    .setDescription([
                        `💰 **Bet Amount:** ${bet} fishcoins`,
                        `🏆 **Winner:** ${winner.username}'s ${cats[winner.id].name}`,
                        `💸 **Winnings:** ${bet * 2} fishcoins and ${xpGain} XP`,
                        `\n😺 **${cats[challengerId].name}** (${challenger.username})`,
                        `Level: ${challengerCat.level} | Strength: ${challengerCat.strength}`,
                        `Happiness: ${challengerCat.happiness}/100 | Hunger: ${challengerCat.hunger}/100`,
                        `\n😼 **${cats[opponentId].name}** (${opponent.username})`,
                        `Level: ${opponentCat.level} | Strength: ${opponentCat.strength}`,
                        `Happiness: ${opponentCat.happiness}/100 | Hunger: ${opponentCat.hunger}/100`
                    ].join('\n'))
                    .setThumbnail(getCatPic());
                
                await interaction.update({ 
                    embeds: [embed],
                    components: []
                });
            } else if (interaction.customId === 'duel_decline') {
                await interaction.update({ 
                    embeds: [new EmbedBuilder()
                        .setColor('#ED4245')
                        .setDescription('Duel challenge declined!')
                    ],
                    components: []
                });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Something went wrong with the duel!')
                ],
                ephemeral: true
            }).catch(console.error);
        }
    }
};
