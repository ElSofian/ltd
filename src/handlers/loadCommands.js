const fs = require('node:fs');
const path = require('node:path');
const { ApplicationCommandType } = require('discord.js');

const commands_path = path.resolve(__dirname, '..', 'commands');

module.exports = (client) => {
	const commandFiles = fs.readdirSync(commands_path).filter(file => file.endsWith('.js'));

	const stack = [];
	client.commands = {};

	for (const file of commandFiles) {
		const filePath = path.join(commands_path, file);
		const command = require(filePath);

		if (!command.name || !command.run) {
			client.logger.error(`❌ La commande ${file} est invalide (name ou run manquant).`);
			continue;
		}

		client.commands[command.name] = command;

		// 1 = Slash command, 2 = User context menu, 3 = Message context menu
		const type = command.type ?? 1;

		const data = {
			name: command.name,
			type,
		};

		if (type === ApplicationCommandType.ChatInput) {
			data.description = command.description ?? "Aucune description";
			data.options = command.options ?? [];
		}

		stack.push(data);
	}

	client.logger.success(`${stack.length} commandes chargées (slash & context menu).`);
	return stack;
};
