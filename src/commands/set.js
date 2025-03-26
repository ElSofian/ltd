const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	name: "set",
	description: "Permet de modifier des informations.",
	admin: true,
	options: [{
		name: "prix-pompes",
		description: "Permet de modifier le prix d'une pompe.",
		type: ApplicationCommandOptionType.Subcommand,
		options: [
			{
				name: "pompe",
				description: "La pompe à modifier.",
				type: ApplicationCommandOptionType.String,
				choices: [
					{ name: "Little Seoul", value: "Little Seoul" },
					{ name: "Vespucci", value: "Vespucci" },
					{ name: "Marina", value: "Marina" },
					{ name: "Innocence Boulevard", value: "Innocence Boulevard" },
					{ name: "Morningwood", value: "Morningwood" },
					{ name: "Ocean Highway", value: "Ocean Highway" },
					{ name: "Rich Glen", value: "Rich Glen" },
				],
				required: true
			},
			{
				name: "nouveau-prix",
				description: "Le nouveau prix.",
				type: ApplicationCommandOptionType.Number,
				required: true
			}
		]
	}],
	run: async(client, interaction, { successEmbed, errorEmbed }) => {
		const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {

			case "prix-pompes": {

				const pump = interaction.options.getUser("pompe");
				const newPrice = interaction.options.getString("nouveau-prix");

				const pumpData = await client.db.getPump(pump);
				if (!pumpData) return errorEmbed("La pompe est introuvable.");

				await client.db.addSpeciality(pumpData.id, speciality);

				successEmbed(`La spécialité **${speciality}** a bien été ajoutée à ${employee} !`);

				break;
			}
        }
	}
}