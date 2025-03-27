const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
	name: Events.InteractionCreate,
	run: async(client, interaction) => {
		if(!interaction.inGuild() || !interaction.guildId) return;

		// Functions

		function fastEmbed(description, color = client.config.colors.default) {
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
		if (!command && interaction.type !== InteractionType.MessageComponent && interaction.type !== InteractionType.ModalSubmit) {
			client.logger.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
		const hasManage = interaction.member.roles.cache.has(client.config.roles.manage);
		const hasDev = interaction.member.roles.cache.has(client.config.roles.dev);

		if (command?.admin && !(isAdmin || hasManage || hasDev))
			return errorEmbed("Vous n'avez pas la permission d'utiliser cette commande.");

		if (command?.employeeOnly && !interaction.member.roles.cache.has(client.config.roles.employeeRoleId)) return errorEmbed("Vous n'avez pas la permission d'utiliser cette commande.");

		try {
			// console.log(interaction.isMessageContextMenuCommand())
			if (interaction.type == InteractionType.ApplicationCommand || interaction.isMessageContextMenuCommand()) return command.run(client, interaction, { errorEmbed, successEmbed });			
			if (interaction.type == InteractionType.MessageComponent || interaction.type == InteractionType.ModalSubmit) {
				

				// INTERACTION WITH FUEL EMBED

				if (interaction.customId == "sm" && interaction.message.id == client.config.messages.pumps) {

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
						if (isNaN(litres)) return interaction.followUp({ embeds: [fastEmbed("Veuillez entrer un nombre valide.", "Red")], ephemeral: true });

						if (!pump) {
							m.delete().catch(() => {});
							return interaction.followUp({ embeds: [fastEmbed("Pompe non trouvée.", "Red")], ephemeral: true });
						}

						if (litres > pump.limit) {
							m.delete().catch(() => {});
							return interaction.followUp({ embeds: [fastEmbed(`La pompe **${pump.label}** ne peut pas avoir plus de **${pump.limit} litres**.`, "Red")], ephemeral: true });
						}
						pump.fuel = litres;

						embed.fields = embed.fields.map(field => {
							if (field.name.replace(" 🚨", "").trim() === pump.label) {
								const isAlert = pump.fuel < pump.alertAmount;
								field.name = `${pump.label}${isAlert ? "  🚨" : ""}`;
								field.value = `» ${pump.fuel}L / ${pump.limit}L`;
							}
							return field;
						});

						await client.db.setPumpFuel(pump.label, litres);

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

						try {
							const publicChannel = await interaction.guild.channels.fetch(client.config.channels.publicPumps);
							if (!publicChannel) throw new Error("Salon public introuvable");
						
							const publicMsg = await publicChannel.messages.fetch(client.config.messages.publicPumps);
							if (!publicMsg) throw new Error("Message public introuvable");
						
							const publicEmbed = new EmbedBuilder()
								.setColor(client.config.colors.default)
								.setTitle("Pompes")
								.setThumbnail(client.config.images.logo)
								.setImage(client.config.images.ltdOutside);
						
							for (const p of pumps) {
								publicEmbed.addFields([
									{
										name: p.label,
										value: `» ${p.fuel} litres\n» *${p.price}$*`,
										inline: true
									}
								]);
							}
						
							await publicMsg.edit({ embeds: [publicEmbed] });
						} catch (err) {
							console.error("❌ Erreur mise à jour message public :", err);
						}						

						await interaction.followUp({ 
							embeds: [fastEmbed(`Vous avez mis la pompe **${pump.label}** à **${litres} litres**.`)], 
							ephemeral: true 
						});

						firstInteraction.delete().catch(() => {});
						m.delete().catch(() => {});
						collector.stop();
					});
					return;
				}

				// -----------------------------------------


				// INTERACTION WITH ABSENCE BUTTON

				if (interaction.customId == "absence" && interaction.message.id == client.config.messages.msgAbsenceId) {
					const modal = new ModalBuilder()
						.setCustomId("m_absence")
						.setTitle("Absence")
						.addComponents(
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId("date")
									.setPlaceholder("Date de fin de votre absence (JJ/MM/AAAA)")
									.setLabel("Date de fin")
									.setStyle(TextInputStyle.Short)
							),
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId("reason")
									.setPlaceholder("Raison de votre absence")
									.setLabel("Raison")
									.setStyle(TextInputStyle.Paragraph)
							)
						)

					await interaction.showModal(modal);

					const filter = i => i.customId == "m_absence";
					const collector = await interaction.awaitModalSubmit({ filter, time: 60000 });
					if (!collector) return console.log("Collector not found.");

					const date = collector.fields.getTextInputValue("date");
					const reason = collector.fields.getTextInputValue("reason");

					const dateCheck = client.functions.checkDate(date);
					if (!dateCheck.valid) return collector.reply({ embeds: [errorEmbed(dateCheck.errorMsg, true)], ephemeral: true });
					if (!reason) return collector.reply({ embeds: [errorEmbed("Veuillez entrer une raison.", true)], ephemeral: true });

					const [prenom, nom] = await client.db.getEmployeeName(interaction.member.user.id, "array");
					if (!prenom || !nom) return console.error(`Employé ${interaction.member.user.id} non trouvé.`);

					collector.reply({ embeds: [successEmbed("Votre absence a bien été enregistrée.", true)], ephemeral: true }).catch(() => {});
				}


				// -----------------------------------------


				// INTERACTION WITH PHONE/IBAN BUTTON

				if ((interaction.customId == "phone" || interaction.customId == "iban")) {

					const customId = interaction.customId;
					
					const embed = new EmbedBuilder()
					.setColor(client.config.colors.default)
					.setTitle(customId == "phone" ? "Numéro de Téléphone" : "IBAN")
					.setDescription(`Veuillez entrer votre ${customId == "phone" ? "nouveau numéro de téléphone" : "nouvel IBAN"}.
						
						**IMPORTANT:** Répondez en me mentionnant au début ! Exemple: <@${client.user.id}> ${customId == "phone" ? "2276628" : "3P9IBH"}`);

					const message = await interaction.reply({ embeds: [embed], ephemeral: true });
					if (!message) return;

					const filter = m => m.author.id == interaction.member.user.id && (m.content.startsWith(`<@${client.user.id}>`) || m.content.startsWith(`<@!${client.user.id}>`));
					const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

					collector.on('collect', async m => {
						const value = m.content.replace(/<@!?\d+>/, '').trim();
						if (!value) return interaction.followUp({ embeds: [fastEmbed("Veuillez entrer une valeur valide.", "Red")], ephemeral: true });

						const [prenom, nom] = await client.db.getEmployeeName(interaction.member.id, "array");
						if (!prenom || !nom) return interaction.followUp({ embeds: [fastEmbed("Nom et prénom de l'employé non trouvé.", "Red")], ephemeral: true });

						await client.db.setEmployee(interaction.member.id, customId, value);

						const employeeData = await client.db.getEmployee(interaction.member.id);
						if (!employeeData) return interaction.followUp({ embeds: [fastEmbed("Employé non trouvé.", "Red")], ephemeral: true });

						const embed = interaction.message.embeds[0];
						if (!embed) return interaction.followUp({ embeds: [fastEmbed("Embed non trouvé.", "Red")], ephemeral: true });

						embed.fields = embed.fields.map(field => {
							if (field.name.includes(customId == "phone" ? "Numéro de téléphone" : "IBAN")) {
								field.value = value;
							}
							return field;
						});

						const row = new ActionRowBuilder().addComponents(
							new ButtonBuilder().setCustomId("iban").setStyle(ButtonStyle.Secondary).setLabel("Changer l'IBAN").setEmoji("💳"),
							new ButtonBuilder().setCustomId("phone").setStyle(ButtonStyle.Secondary).setLabel("Changer le Numéro de Téléphone").setEmoji("📞"),
						)
						
						const embeds = [embed, interaction.message.embeds[1], interaction.message.embeds[2]];

						await interaction.message.edit({ embeds: embeds, components: [row] });

						await interaction.followUp({
							embeds: [successEmbed(`Votre **${customId == "phone" ? "numéro de téléphone" : "IBAN"}** a bien été enregistré.`, true)],
							ephemeral: true }).catch(() => {});

						message.delete().catch(() => {});
						m.delete().catch(() => {});
						collector.stop();
					});
				}
			
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
