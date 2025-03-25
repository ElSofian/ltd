const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	run: async(client, message) => {
		if (message.channelId !== client.config.channels.employeesId
			|| message.author.bot
			|| message.author.id == client.user.id) return;

        const lastMessageFetched = await message.channel.messages.fetch({ limit: 2 });
		const lastMessage = lastMessageFetched.last();

		if (lastMessage.author.id == client.user.id)
			lastMessage.delete();
		
		const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(':warning: **Tout doit être dans un seul message (les informations + photos) !**')

        message.channel.send({ embeds: [embed] });

	}
};
