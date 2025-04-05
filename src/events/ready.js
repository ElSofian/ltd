const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ActivityType, Embed } = require('discord.js');

function formatDelay(delay) {
    const seconds = Math.floor((delay / 1000) % 60);
    const minutes = Math.floor((delay / (1000 * 60)) % 60);
    const hours = Math.floor(delay / (1000 * 60 * 60));
    return `${hours}h${minutes}min${seconds}s`;
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	run: async(client) => {
		client.logger.info("Ready!");

		client.user.setPresence({
			activities: [{ name: `Gestionnaire du LTD`, type: ActivityType.Custom }],
		});

		if (process.env.NODE_ENV === 'production')
			await client.functions.updateBotStatus("online");

		// const ceoRoleId = "1296941640459620392";
		// const ceoRole = client.guilds.cache.get(client.config.guildId).roles.cache.get(ceoRoleId);
		// if (ceoRole) {
		// 	ceoRole.edit({ name: "💼| CEO" })
		// } else {
		// 	client.logger.error("gray", "[SPECIAL]", `Rôle CEO introuvable.`);
		// }

		// const sendMessage = () => {
		// 	const channel = client.channels.cache.get(client.config.channels.calendarId);
		// 	if (channel) {
		// 		const embed = new EmbedBuilder()
		// 			.setColor(client.config.colors.default)
		// 			.setTitle(`Jour ${new Date().getDate()} sur 31`)
		// 			.setDescription("Aujourd'hui, la surprise est ... !")
		// 			.setTimestamp();
		// 		channel.send({ embeds: [embed] });
		// 	} else {
		// 		console.error('Channel non trouvé.');
		// 	}
		// };
	
		// const now = new Date();
		// const targetTime = new Date();
		// targetTime.setHours(0, 30, 0, 0); // 00h30
		// if (now > targetTime) {
		// 	targetTime.setDate(targetTime.getDate() + 1);
		// }
	
		// const delay = targetTime - now;
		// client.logger.perso("gray", "[SPECIAL]", `Message quotidien programmé dans ${formatDelay(delay)}.`);
	
		// setTimeout(() => {
		// 	sendMessage();
		// 	setInterval(sendMessage, 24 * 60 * 60 * 1000);
		// }, delay);

	}
};
