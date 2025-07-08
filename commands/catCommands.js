const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { cats, fishcoins, inventory, lastDaily, breeds, shopItems, catNames, catFacts } = require('../data');
const { getCatPic } = require('../utils');

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
    handleAdopt: async (interaction) => {
        const { options, user } = interaction;
        
        if (cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#57F287')
                .setDescription('You already have a cat!')
            ],
            ephemeral: true
        });
        
        const breedName = options.getString('breed') || breeds[Math.floor(Math.random() * breeds.length)].name;
        const breed = breeds.find(b => b.name === breedName);
        const randomName = catNames[Math.floor(Math.random() * catNames.length)];
        
        cats[user.id] = {
            name: randomName,
            hunger: 50 + (breed.bonus.hunger || 0),
            happiness: 50 + (breed.bonus.happiness || 0),
            level: 1,
            xp: 0,
            strength: 1 + (breed.bonus.strength || 0),
            breed: breedName,
            lastFed: 0,
            lastPet: 0
        };
        
        fishcoins[user.id] = 100;
        inventory[user.id] = [];
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle(`🐱 Welcome ${randomName}! 🐱`)
            .setDescription(`You've adopted a beautiful ${breedName} cat!\n\nTake good care of ${randomName} by feeding, petting, and playing with them.`)
            .setThumbnail(getCatPic())
            .addFields(
                { name: 'Breed', value: breedName, inline: true },
                { name: 'Hunger', value: `${cats[user.id].hunger}/100`, inline: true },
                { name: 'Happiness', value: `${cats[user.id].happiness}/100`, inline: true },
                { name: 'Strength', value: `${cats[user.id].strength}`, inline: true },
                { name: 'Starting Fishcoins', value: '100', inline: true }
            )
            .setFooter({ text: 'Use /help to see all commands!' });
        
        interaction.reply({ embeds: [embed] });
    },

    handleFeed: async (interaction) => {
        const { options, user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const item = options.getString('item');
        const shopItem = shopItems.find(i => i.name === item);
        if (!shopItem) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('That item doesn\'t exist!')
            ],
            ephemeral: true
        });
        
        if (!inventory[user.id]?.includes(item)) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription(`You don't have ${item} in your inventory!`)
            ],
            ephemeral: true
        });
        
        if (shopItem.hunger) {
            cats[user.id].hunger = Math.max(0, cats[user.id].hunger - shopItem.hunger);
            inventory[user.id] = inventory[user.id].filter(i => i !== item);
            cats[user.id].xp += 5;
            checkLevelUp(user.id);
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`You fed ${cats[user.id].name} some ${shopItem.emoji} ${item}!`)
                .addFields(
                    { name: 'Hunger', value: `${cats[user.id].hunger}/100`, inline: true },
                    { name: 'XP Gained', value: '5', inline: true }
                )
                .setThumbnail(getCatPic());
            
            interaction.reply({ embeds: [embed] });
        } else {
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('You can\'t feed that to your cat!')
                ],
                ephemeral: true
            });
        }
    },

    handlePet: async (interaction) => {
        const { user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const happinessGain = 10 + Math.floor(Math.random() * 5);
        cats[user.id].happiness = Math.min(100, cats[user.id].happiness + happinessGain);
        cats[user.id].xp += 3;
        const leveledUp = checkLevelUp(user.id);
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`You petted ${cats[user.id].name}! They look so happy!`)
            .addFields(
                { name: 'Happiness', value: `${cats[user.id].happiness}/100 (+${happinessGain})`, inline: true },
                { name: 'XP Gained', value: '3', inline: true }
            )
            .setThumbnail(getCatPic());
        
        if (leveledUp) {
            embed.addFields({ name: 'Level Up!', value: `${cats[user.id].name} is now level ${cats[user.id].level}!` });
        }
        
        interaction.reply({ embeds: [embed] });
    },

    handlePlay: async (interaction) => {
        const { options, user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const item = options.getString('item');
        let happinessGain = 5 + Math.floor(Math.random() * 10);
        let xpGain = 5;
        let coinGain = 0;
        let description = `You played with ${cats[user.id].name}!`;
        
        if (item) {
            const shopItem = shopItems.find(i => i.name === item);
            if (!shopItem || shopItem.type !== 'toy') return interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('That\'s not a valid toy!')
                ],
                ephemeral: true
            });
            
            if (!inventory[user.id]?.includes(item)) return interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription(`You don't have ${item} in your inventory!`)
                ],
                ephemeral: true
            });
            
            happinessGain += (shopItem.happiness || 0);
            xpGain += 5;
            coinGain = 5 + Math.floor(Math.random() * 10);
            fishcoins[user.id] += coinGain;
            description = `You played with ${cats[user.id].name} using ${shopItem.emoji} ${item}!`;
        }
        
        cats[user.id].happiness = Math.min(100, cats[user.id].happiness + happinessGain);
        cats[user.id].xp += xpGain;
        const leveledUp = checkLevelUp(user.id);
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(description)
            .addFields(
                { name: 'Happiness', value: `${cats[user.id].happiness}/100 (+${happinessGain})`, inline: true },
                { name: 'XP Gained', value: xpGain.toString(), inline: true }
            );
        
        if (coinGain > 0) {
            embed.addFields({ name: 'Fishcoins Earned', value: coinGain.toString(), inline: true });
        }
        
        if (leveledUp) {
            embed.addFields({ name: 'Level Up!', value: `${cats[user.id].name} is now level ${cats[user.id].level}!` });
        }
        
        embed.setThumbnail(getCatPic());
        interaction.reply({ embeds: [embed] });
    },

    handleCatStats: async (interaction) => {
        const { user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle(`${cats[user.id].name}'s Stats`)
            .setThumbnail(getCatPic())
            .addFields(
                { name: 'Breed', value: cats[user.id].breed, inline: true },
                { name: 'Level', value: cats[user.id].level.toString(), inline: true },
                { name: 'Strength', value: cats[user.id].strength.toString(), inline: true },
                { name: 'Hunger', value: `${cats[user.id].hunger}/100`, inline: true },
                { name: 'Happiness', value: `${cats[user.id].happiness}/100`, inline: true },
                { name: 'XP', value: `${cats[user.id].xp}/${cats[user.id].level * 100}`, inline: true },
                { name: 'Fishcoins', value: `${fishcoins[user.id] || 0}`, inline: true }
            );
        
        interaction.reply({ embeds: [embed] });
    },

    handleShop: async (interaction) => {
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🐾 MeowBot Shop 🐾')
            .setDescription('Use `/buy [item]` to purchase items!\n\n**Food Items**\n' +
                shopItems.filter(i => i.type === 'food').map(i => `${i.emoji} **${i.name}** - ${i.price} fishcoins (Hunger -${i.hunger})`).join('\n') +
                '\n\n**Toys**\n' +
                shopItems.filter(i => i.type === 'toy').map(i => `${i.emoji} **${i.name}** - ${i.price} fishcoins (Happiness +${i.happiness})`).join('\n') +
                '\n\n**Furniture**\n' +
                shopItems.filter(i => i.type === 'furniture').map(i => `${i.emoji} **${i.name}** - ${i.price} fishcoins` + 
                    (i.hunger ? ` (Hunger -${i.hunger})` : '') + 
                    (i.happiness ? ` (Happiness +${i.happiness})` : '')).join('\n') +
                '\n\n**Special Items**\n' +
                shopItems.filter(i => i.type === 'special').map(i => `${i.emoji} **${i.name}** - ${i.price} fishcoins`).join('\n')
            );
        
        interaction.reply({ embeds: [embed] });
    },

    handleBuy: async (interaction) => {
        const { options, user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const item = options.getString('item');
        const shopItem = shopItems.find(i => i.name === item);
        
        if (!shopItem) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('That item doesn\'t exist!')
            ],
            ephemeral: true
        });
        
        if ((fishcoins[user.id] || 0) < shopItem.price) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription(`You need ${shopItem.price - (fishcoins[user.id] || 0)} more fishcoins to buy this!`)
            ],
            ephemeral: true
        });
        
        fishcoins[user.id] -= shopItem.price;
        if (!inventory[user.id]) inventory[user.id] = [];
        inventory[user.id].push(item);
        
        interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`You bought ${shopItem.emoji} **${item}** for ${shopItem.price} fishcoins!`)
            ]
        });
    },

    handleInventory: async (interaction) => {
        const { user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        if (!inventory[user.id]?.length) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('Your inventory is empty! Visit the shop with `/shop`')
            ],
            ephemeral: true
        });
        
        const foodItems = inventory[user.id].filter(item => shopItems.find(i => i.name === item)?.type === 'food');
        const toyItems = inventory[user.id].filter(item => shopItems.find(i => i.name === item)?.type === 'toy');
        const furnitureItems = inventory[user.id].filter(item => shopItems.find(i => i.name === item)?.type === 'furniture');
        const specialItems = inventory[user.id].filter(item => shopItems.find(i => i.name === item)?.type === 'special');
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle(`${cats[user.id].name}'s Inventory`)
            .setDescription(
                (foodItems.length ? '**Food**\n' + foodItems.map(item => {
                    const shopItem = shopItems.find(i => i.name === item);
                    return `${shopItem.emoji} ${item} (Hunger -${shopItem.hunger})`;
                }).join('\n') + '\n\n' : '') +
                (toyItems.length ? '**Toys**\n' + toyItems.map(item => {
                    const shopItem = shopItems.find(i => i.name === item);
                    return `${shopItem.emoji} ${item} (Happiness +${shopItem.happiness})`;
                }).join('\n') + '\n\n' : '') +
                (furnitureItems.length ? '**Furniture**\n' + furnitureItems.map(item => {
                    const shopItem = shopItems.find(i => i.name === item);
                    return `${shopItem.emoji} ${item}`;
                }).join('\n') + '\n\n' : '') +
                (specialItems.length ? '**Special Items**\n' + specialItems.map(item => {
                    const shopItem = shopItems.find(i => i.name === item);
                    return `${shopItem.emoji} ${item}`;
                }).join('\n') : '')
            );
        
        interaction.reply({ embeds: [embed] });
    },

    handleDaily: async (interaction) => {
        const { user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        if (lastDaily[user.id] && Date.now() - lastDaily[user.id] < 86400000) {
            const timeLeft = new Date(lastDaily[user.id] + 86400000 - Date.now());
            return interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription(`You already claimed your daily! Come back in ${timeLeft.getUTCHours()}h ${timeLeft.getUTCMinutes()}m`)
                ],
                ephemeral: true
            });
        }
        
        const amount = 50 + Math.floor(Math.random() * 30);
        fishcoins[user.id] = (fishcoins[user.id] || 0) + amount;
        lastDaily[user.id] = Date.now();
        
        interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`You claimed your daily reward of ${amount} fishcoins!`)
            ]
        });
    },

    handleBalance: async (interaction) => {
        const { user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`You have **${fishcoins[user.id] || 0} fishcoins**!`)
            ]
        });
    },

    handleDuel: async (interaction) => {
        const { options, user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const opponent = options.getUser('user');
        const betAmount = options.getInteger('bet') || 0;
        
        if (!cats[opponent.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription(`${opponent.username} doesn't have a cat to duel!`)
            ],
            ephemeral: true
        });
        
        if (betAmount > 0) {
            if (fishcoins[user.id] < betAmount) return interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription(`You don't have enough fishcoins to bet ${betAmount}!`)
                ],
                ephemeral: true
            });
            
            if (fishcoins[opponent.id] < betAmount) return interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription(`${opponent.username} doesn't have enough fishcoins to match your bet!`)
                ],
                ephemeral: true
            });
            
            
            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('🐾 Duel Challenge 🐾')
                .setDescription(`${user.username} has challenged ${opponent.username} to a duel with a bet of ${betAmount} fishcoins!\n\n${opponent}, do you accept?`)
                .addFields(
                    { name: `${cats[user.id].name} (${user.username})`, value: `Level: ${cats[user.id].level}\nStrength: ${cats[user.id].strength}`, inline: true },
                    { name: `${cats[opponent.id].name} (${opponent.username})`, value: `Level: ${cats[opponent.id].level}\nStrength: ${cats[opponent.id].strength}`, inline: true }
                );
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`duel_accept_${user.id}_${opponent.id}_${betAmount}`)
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('duel_decline')
                        .setLabel('Decline')
                        .setStyle(ButtonStyle.Danger)
                );
            
            interaction.reply({ 
                content: `${opponent}`,
                embeds: [embed],
                components: [row]
            });
        } else {
            
            const playerCat = cats[user.id];
            const opponentCat = cats[opponent.id];
            
            const playerScore = playerCat.strength + playerCat.level + (playerCat.happiness / 20) + ((100 - playerCat.hunger) / 20) + Math.random() * 5;
            const opponentScore = opponentCat.strength + opponentCat.level + (opponentCat.happiness / 20) + ((100 - opponentCat.hunger) / 20) + Math.random() * 5;
            
            const winner = playerScore > opponentScore ? user : opponent;
            const loser = winner.id === user.id ? opponent : user;
            
            const xpGain = 10 + Math.floor(Math.random() * 10);
            cats[winner.id].xp += xpGain;
            checkLevelUp(winner.id);
            
            const coinGain = 20 + Math.floor(Math.random() * 30);
            fishcoins[winner.id] = (fishcoins[winner.id] || 0) + coinGain;
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('🐾 Duel Results 🐾')
                .setDescription([
                    `🏆 ${winner.username}'s ${cats[winner.id].name} won the duel!`,
                    `💰 Winner earned ${coinGain} fishcoins and ${xpGain} XP!`,
                    `\n😺 **${cats[user.id].name}** (${user.username})`,
                    `Level: ${playerCat.level} | Strength: ${playerCat.strength}`,
                    `Happiness: ${playerCat.happiness}/100 | Hunger: ${playerCat.hunger}/100`,
                    `\n😼 **${cats[opponent.id].name}** (${opponent.username})`,
                    `Level: ${opponentCat.level} | Strength: ${opponentCat.strength}`,
                    `Happiness: ${opponentCat.happiness}/100 | Hunger: ${opponentCat.hunger}/100`
                ].join('\n'))
                .setThumbnail(getCatPic());
            
            interaction.reply({ embeds: [embed] });
        }
    },

    handleCatPic: async (interaction) => {
        interaction.reply(getCatPic());
    },

    handleCatFact: async (interaction) => {
        interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('🐱 Did You Know? 🐱')
                .setDescription(catFacts[Math.floor(Math.random() * catFacts.length)])
                .setThumbnail(getCatPic())
            ]
        });
    },

    handleRename: async (interaction) => {
        const { options, user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const name = options.getString('name');
        if (name.length > 20) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('Name too long! Max 20 characters.')
            ],
            ephemeral: true
        });
        
        const oldName = cats[user.id].name;
        cats[user.id].name = name;
        
        interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`Your cat ${oldName} is now named **${name}**!`)
            ]
        });
    },

    handleBreed: async (interaction) => {
        const { options, user } = interaction;
        
        if (!cats[user.id]) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need to adopt a cat first!')
            ],
            ephemeral: true
        });
        
        const breedName = options.getString('breed');
        const breed = breeds.find(b => b.name === breedName);
        if (!breed) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('Invalid breed!')
            ],
            ephemeral: true
        });
        
        const hasBreedChange = inventory[user.id]?.includes('breed_change');
        if (!hasBreedChange) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need a breed change item from the shop!')
            ],
            ephemeral: true
        });
        
        inventory[user.id] = inventory[user.id].filter(i => i !== 'breed_change');
        const oldBreed = cats[user.id].breed;
        cats[user.id].breed = breedName;
        cats[user.id].hunger += breed.bonus.hunger || 0;
        cats[user.id].happiness += breed.bonus.happiness || 0;
        cats[user.id].strength += breed.bonus.strength || 0;
        
        interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`Your cat has changed from a ${oldBreed} to a ${breedName}! Breed bonuses applied.`)
                .addFields(
                    { name: 'Hunger', value: `${cats[user.id].hunger}/100`, inline: true },
                    { name: 'Happiness', value: `${cats[user.id].happiness}/100`, inline: true },
                    { name: 'Strength', value: `${cats[user.id].strength}`, inline: true }
                )
            ]
        });
    }
};
