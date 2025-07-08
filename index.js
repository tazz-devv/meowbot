const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const events = require('./events');
const { cats, fishcoins, inventory, lastDaily, lockedChannels } = require('./data');

const client = new Client({ 
    intents: config.intents.map(intent => GatewayIntentBits[intent])
});

client.on('ready', () => events.handleReady(client));
client.on('interactionCreate', interaction => events.handleInteractionCreate(interaction));
client.on('interactionCreate', interaction => events.handleButton(interaction));

global.cats = cats;
global.fishcoins = fishcoins;
global.inventory = inventory;
global.lastDaily = lastDaily;
global.lockedChannels = lockedChannels;

// Hidden cs this is read only
client.login('my_bot_token_would_go_here_ty_shi_tazzy_on_top');
