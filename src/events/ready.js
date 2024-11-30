const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	run: async(client) => {
		client.logger.info("Ready!");

		client.user.setPresence({
			activities: [{ name: `Gestionnaire du LTD`, type: ActivityType.Custom }],
		});

		// const embed = new EmbedBuilder()
        // .setColor(client.config.colors.default)
        // .setThumbnail("https://imgur.com/kRu9YaK.png")
        // .setTitle("Prix des Pompes")
        // .setImage("https://imgur.com/2BQFP3w.png")

        // const pumps = await client.db.getPumpsPrice();
        
        // for (const pump of pumps) {
        //     embed.addFields([{ name: pump.label, value: `» ${pump.price}$/L`, inline: true }]);
        // }

        // const channel = await client.channels.fetch("1310270036245610590");
		// if (channel) channel.send({ embeds: [embed] }).catch(e => console.error(e));
		// else console.log("Channel not found.");

	}
};
