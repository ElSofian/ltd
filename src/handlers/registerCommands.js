const { REST, Routes } = require('discord.js')
require('dotenv').config()

module.exports = async (client, commands) => {
	if(!commands || commands.length == 0) return client.logger.success("No commands to register");

	const rest = new REST().setToken(process.env.TOKEN);

	try {
		await rest.put(Routes.applicationGuildCommands(client.user.id, client.config.guildId), { body: commands });
	} catch (error) {
		console.error(error);
	}
}