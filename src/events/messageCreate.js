const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	run: async(client, message) => {
		
		if (message.channelId !== client.config.channels.employeesNotes
			|| message.author.bot
			|| message.author.id == client.user.id) return;

        const lastMessageFetched = await message.channel.messages.fetch({ limit: 2 });
		const lastMessage = lastMessageFetched.last();

		if (lastMessage.author.id == client.user.id)
			lastMessage.delete();
		
		const embed = new EmbedBuilder()
            .setColor(client.config.colors.default)
            .setDescription(`:warning: **Rappel:** Tout doit être dans un seul message (les informations + photos) et **__dans le bon format__**, voir ${client.config.messages.formExample} !`)

        message.channel.send({ embeds: [embed] });

	}
};
