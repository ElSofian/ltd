const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
	name: Events.ChannelDelete,
	run: async(client, channel) => {
		const channelData = await client.db.getCarnet(channel.id);
		if (channelData)
			await client.db.deleteEmployee(channelData.user_id);

	}
};
