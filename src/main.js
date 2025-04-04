const { Client, Partials, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const loadCommands = require('./handlers/loadCommands.js');
const loadEvents = require ('./handlers/loadEvents.js');
const registerCommands = require('./handlers/registerCommands.js');

const client = new Client({
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
	]
});

client.config = require('./config.js');
client.functions = new (require('./structures/Functions.js'))(client);
client.db = new (require('./structures/Database.js'))(client);
client.google = new (require('./structures/GoogleSheet.js'))(client);
client.logger = new (require('./structures/Logger.js'))();

const commands = loadCommands(client);
loadEvents(client);

client.login(process.env.TOKEN);

client.once(Events.ClientReady, (cient) => {
	registerCommands(client, commands);
});

if (process.env.NODE_ENV === 'production') {
	process.on('unhandledRejection', async (error) => {
		await client.functions.updateBotStatus("offline");
		console.error('Unhandled promise rejection:', error);
	});

	process.on('uncaughtException', async (error) => {
		await client.functions.updateBotStatus("offline");
		console.error('Unhandled promise rejection:', error);
	});

	process.on('SIGINT', async () => {
		await client.functions.updateBotStatus("offline");
		process.exit(0);
	});
}

// process.on("exit", () => {
// 	if (client.interval)
// 		clearInterval(client.interval);
// })
