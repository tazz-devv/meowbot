const { EmbedBuilder } = require('discord.js');
const { lockedChannels } = require('../data');
const { parseDuration } = require('../utils');

module.exports = {
    handleScratch: async (interaction) => {
        const { options, member, user, guild } = interaction;
        
        if (!member.permissions.has('ModerateMembers')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Moderate Members" permission to use this command!')
            ],
            ephemeral: true
        });
        
        const target = options.getMember('user');
        if (!target) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('User not found!')
            ],
            ephemeral: true
        });
        
        if (target.id === user.id) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You can\'t mute yourself!')
            ],
            ephemeral: true
        });
        
        if (!target.moderatable) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('I can\'t mute this user!')
            ],
            ephemeral: true
        });
        
        const duration = options.getString('duration');
        const reason = options.getString('reason') || 'No reason provided';
        
        const time = parseDuration(duration);
        if (!time) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('Invalid duration format! Use like 1h, 30m, 2d')
            ],
            ephemeral: true
        });
        
        try {
            await target.timeout(time, reason);
            
            
            const dmEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(`You've been scratched (muted) in ${guild.name}`)
                .addFields(
                    { name: 'Duration', value: duration, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Moderator', value: user.tag, inline: true }
                )
                .setTimestamp();
            
            try {
                await target.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${target.user.tag}`);
            }
            
            
            const replyEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`😾 ${target.user.tag} has been scratched (muted) for ${duration}!`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true }
                );
            
            interaction.reply({ embeds: [replyEmbed] });
        } catch (err) {
            console.error(err);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Failed to mute user!')
                ],
                ephemeral: true
            });
        }
    },

    handleHiss: async (interaction) => {
        const { options, member, user, guild } = interaction;
        
        if (!member.permissions.has('KickMembers')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Kick Members" permission to use this command!')
            ],
            ephemeral: true
        });
        
        const target = options.getMember('user');
        if (!target) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('User not found!')
            ],
            ephemeral: true
        });
        
        if (target.id === user.id) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You can\'t warn yourself!')
            ],
            ephemeral: true
        });
        
        const reason = options.getString('reason') || 'No reason provided';
        
        
        const dmEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(`You've been hissed at (warned) in ${guild.name}`)
            .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: user.tag, inline: true }
            )
            .setTimestamp();
        
        try {
            await target.send({ embeds: [dmEmbed] });
        } catch (dmError) {
            console.log(`Could not send DM to ${target.user.tag}`);
        }
        
        
        const replyEmbed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`😾 ${target.user.tag} has been hissed at (warned)!`)
            .addFields(
                { name: 'Reason', value: reason, inline: true }
            );
        
        interaction.reply({ embeds: [replyEmbed] });
    },

    handleBanish: async (interaction) => {
        const { options, member, user, guild } = interaction;
        
        if (!member.permissions.has('BanMembers')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Ban Members" permission to use this command!')
            ],
            ephemeral: true
        });
        
        const target = options.getUser('user');
        if (!target) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('User not found!')
            ],
            ephemeral: true
        });
        
        if (target.id === user.id) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You can\'t ban yourself!')
            ],
            ephemeral: true
        });
        
        const reason = options.getString('reason') || 'No reason provided';
        const days = options.getInteger('days') || 0;
        
        
        const dmEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(`You've been banished (banned) from ${guild.name}`)
            .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: user.tag, inline: true }
            )
            .setTimestamp();
        
        try {
            await target.send({ embeds: [dmEmbed] });
        } catch (dmError) {
            console.log(`Could not send DM to ${target.tag}`);
        }
        
        try {
            await guild.members.ban(target, { reason, deleteMessageDays: days });
            
            const replyEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`😾 ${target.tag} has been banished (banned)!`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true }
                );
            
            interaction.reply({ embeds: [replyEmbed] });
        } catch (err) {
            console.error(err);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Failed to ban user!')
                ],
                ephemeral: true
            });
        }
    },

    handleRemove: async (interaction) => {
        const { options, member, user, guild } = interaction;
        
        if (!member.permissions.has('KickMembers')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Kick Members" permission to use this command!')
            ],
            ephemeral: true
        });
        
        const target = options.getMember('user');
        if (!target) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('User not found!')
            ],
            ephemeral: true
        });
        
        if (target.id === user.id) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You can\'t kick yourself!')
            ],
            ephemeral: true
        });
        
        if (!target.kickable) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('I can\'t kick this user!')
            ],
            ephemeral: true
        });
        
        const reason = options.getString('reason') || 'No reason provided';
        
        
        const dmEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(`You've been removed (kicked) from ${guild.name}`)
            .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: user.tag, inline: true }
            )
            .setTimestamp();
        
        try {
            await target.send({ embeds: [dmEmbed] });
        } catch (dmError) {
            console.log(`Could not send DM to ${target.user.tag}`);
        }
        
        try {
            await target.kick(reason);
            
            const replyEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`😾 ${target.user.tag} has been removed (kicked)!`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true }
                );
            
            interaction.reply({ embeds: [replyEmbed] });
        } catch (err) {
            console.error(err);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Failed to kick user!')
                ],
                ephemeral: true
            });
        }
    },

    handlePurge: async (interaction) => {
        const { options, member, channel } = interaction;
        
        if (!member.permissions.has('ManageMessages')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Manage Messages" permission to use this command!')
            ],
            ephemeral: true
        });
        
        const amount = options.getInteger('amount');
        if (amount < 1 || amount > 100) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('Amount must be between 1 and 100!')
            ],
            ephemeral: true
        });
        
        try {
            const messages = await channel.bulkDelete(amount, true);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#57F287')
                    .setDescription(`Deleted ${messages.size} messages!`)
                ],
                ephemeral: true
            });
        } catch (err) {
            console.error(err);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Failed to delete messages!')
                ],
                ephemeral: true
            });
        }
    },

    handleLock: async (interaction) => {
        const { options, member, user, channel } = interaction;
        
        if (!member.permissions.has('ManageChannels')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Manage Channels" permission to use this command!')
            ],
            ephemeral: true
        });
        
        const reason = options.getString('reason') || 'No reason provided';
        
        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });
            
            lockedChannels.add(channel.id);
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`🔒 Channel locked by ${user.tag}`)
                .addFields(
                    { name: 'Reason', value: reason }
                );
            
            interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Failed to lock channel!')
                ],
                ephemeral: true
            });
        }
    },

    handleUnlock: async (interaction) => {
        const { member, user, channel } = interaction;
        
        if (!member.permissions.has('ManageChannels')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Manage Channels" permission to use this command!')
            ],
            ephemeral: true
        });
        
        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });
            
            lockedChannels.delete(channel.id);
            
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`🔓 Channel unlocked by ${user.tag}`);
            
            interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Failed to unlock channel!')
                ],
                ephemeral: true
            });
        }
    },

    handlePurgeBot: async (interaction) => {
        const { options, member, channel } = interaction;
        
        if (!member.permissions.has('ManageMessages')) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('You need the "Manage Messages" permission to use this command!')
            ],
            ephemeral: true
        });
        
        const amount = options.getInteger('amount');
        if (amount < 1 || amount > 100) return interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('Amount must be between 1 and 100!')
            ],
            ephemeral: true
        });
        
        try {
            const messages = await channel.messages.fetch({ limit: amount });
            const botMessages = messages.filter(m => m.author.bot);
            
            if (botMessages.size === 0) return interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('No bot messages found to delete!')
                ],
                ephemeral: true
            });
            
            await channel.bulkDelete(botMessages);
            
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#57F287')
                    .setDescription(`Deleted ${botMessages.size} bot messages!`)
                ],
                ephemeral: true
            });
        } catch (err) {
            console.error(err);
            interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ED4245')
                    .setDescription('Failed to delete bot messages!')
                ],
                ephemeral: true
            });
        }
    }
};
