const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, InteractionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	run: async(client, interaction) => {
		if(!interaction.inGuild() || !interaction.guildId) return;

		// Functions

		function fastEmbed(description, color = "#232959") {
			return new EmbedBuilder().setColor(color).setDescription(description);
		}
		
		function errorEmbed(description, justEmbed = false, replyType = "reply", ephemeral = true) {
			if(!justEmbed) return interaction[replyType]({ embeds: [new EmbedBuilder().setColor("Red").setDescription(description)], components: [], content: null, files: [], ephemeral: ephemeral }).catch(() => {});
			else return new EmbedBuilder().setColor("Red").setDescription(description)
		}
		
		function successEmbed(description, justEmbed = false, ephemeral = false, replyType = "reply") {
			if(!justEmbed) return interaction[replyType]({ embeds: [new EmbedBuilder().setColor("Green").setDescription(description)], components: [], content: null, files: [], ephemeral: ephemeral }).catch(() => {})
			else return new EmbedBuilder().setColor("Green").setDescription(description)
		}

		// -----------------------------------------
	
		const command = interaction.client.commands[interaction.commandName];
		if (!command && interaction.type !== InteractionType.MessageComponent) {
			client.logger.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		if (command?.admin && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return errorEmbed("Vous n'avez pas la permission d'utiliser cette commande.");
		if (command?.employeeOnly && !interaction.member.roles.cache.has(client.config.employeeRoleId)) return errorEmbed("Vous n'avez pas la permission d'utiliser cette commande.");

		try {
			if (interaction.type == InteractionType.ApplicationCommand) return command.run(client, interaction, { errorEmbed, successEmbed });
			if (interaction.type == InteractionType.MessageComponent) {
				
				if (interaction.customId != "sm" || interaction.message.id != client.config.msgPumpsId) return;


				// INTERACTION WITH FUEL EMBED

				if (interaction.customId == "sm") {

					const embed = interaction.message.embeds[0];
					if (!embed) return interaction.reply({ content: "Erreur : embed introuvable.", ephemeral: true });

					const pumps = await client.db.getPumps();
					const pump = pumps.find(p => p.label == interaction.values[0].replace(" 🚨", ""))

					const firstInteraction = await interaction.reply({ 
						embeds: [fastEmbed(`Combien de litres possède la pompe maintenant ?\n**IMPORTANT:** Répondez en me mentionnant au début ! Exemple: <@${client.user.id}> 3500`)], 
						ephemeral: true 
					});
					if (!firstInteraction) return;

					const filter = m => m.author.id == interaction.member.user.id && (m.content.startsWith(`<@${client.user.id}>`) || m.content.startsWith(`<@!${client.user.id}>`));
					const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

					collector.on('collect', async m => {
						const litres = parseInt(m.content.replace(/<@!?\d+>/, '').trim());
						if (isNaN(litres)) return await interaction.followUp({ embeds: [fastEmbed("Veuillez entrer un nombre valide.", "Red")], ephemeral: true });

						if (!pump) {
							m.delete().catch(() => {});
							return await interaction.followUp({ embeds: [fastEmbed("Pompe non trouvée.", "Red")], ephemeral: true });
						}

						if (litres > pump.pumpLimit) {
							m.delete().catch(() => {});
							return await interaction.followUp({ embeds: [fastEmbed(`La pompe **${pump.label}** ne peut pas avoir plus de **${pump.pumpLimit} litres**.`, "Red")], ephemeral: true });
						}
						pump.fuel = litres;

						embed.fields = embed.fields.map(field => {
							if (field.name.replace(" 🚨", "") === pump.label) {
								const isAlert = pump.fuel < pump.alertAmount;
								field.name = `${pump.label}${isAlert ? " 🚨" : ""}`;
								field.value = `» ${pump.fuel} litres`;
							}
							return field;
						});

						const sm = new StringSelectMenuBuilder()
							.setCustomId("sm")
							.setPlaceholder("Choisissez la pompe que vous voulez remplir");

						for (const pump of pumps) {
							sm.addOptions(
								new StringSelectMenuOptionBuilder()
									.setLabel(`${pump.label}${pump.fuel < pump.alertAmount ? " 🚨" : ""}`)
									.setValue(pump.label)
							);
						}

						const row = new ActionRowBuilder().addComponents(sm);

						await interaction.message.edit({ embeds: [embed], components: [row] });
						await interaction.followUp({ 
							embeds: [fastEmbed(`Vous avez mis la pompe **${pump.label}** à **${litres} litres**.`)], 
							ephemeral: true 
						});

						firstInteraction.delete().catch(() => {});
						m.delete().catch(() => {});
						collector.stop();
					});
				}

				// -----------------------------------------
			
			}
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while reply or deferred command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};
