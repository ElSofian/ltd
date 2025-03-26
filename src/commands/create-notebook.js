const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function toFullWidthBold(str) {
	const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
	const bold = [
		"𝗔","𝗕","𝗖","𝗗","𝗘","𝗙","𝗚","𝗛","𝗜","𝗝","𝗞","𝗟","𝗠","𝗡","𝗢","𝗣","𝗤","𝗥","𝗦","𝗧","𝗨","𝗩","𝗪","𝗫","𝗬","𝗭",
		"𝗮","𝗯","𝗰","𝗱","𝗲","𝗳","𝗴","𝗵","𝗶","𝗷","𝗸","𝗹","𝗺","𝗻","𝗼","𝗽","𝗾","𝗿","𝘀","𝘁","𝘂","𝘃","𝘄","𝘅","𝘆","𝘇",
		"𝟬","𝟭","𝟮","𝟯","𝟰","𝟱","𝟲","𝟳","𝟴","𝟵",
		"－"
	];

	return str.split('').map(c => {
		const index = normal.indexOf(c);
		return index !== -1 ? bold[index] : c;
	}).join('');
}

module.exports = {
	name: "Créer un carnet employé",
	type: 3,
	admin: true,
	run: async (client, interaction, { errorEmbed, successEmbed }) => {
		const message = await interaction.targetMessage;

		if (interaction.channelId !== client.config.channels.employeesNotes)
			return errorEmbed(`❌ Cette commande ne peut être utilisée que dans le salon <#${client.config.channels.employeesNotes}>.`);

		const existingEmployee = await client.db.getEmployee(message.author.id);
		if (existingEmployee) return errorEmbed("❌ Cet utilisateur a déjà un carnet employé existant.");

		const lines = message.content.split("\n");

		const phoneLine = lines.find(l => l.toLowerCase().includes("numéro"));
		const ibanLine = lines.find(l => l.toLowerCase().includes("iban"));
		const lastNameLine = lines.find(l => l.toLowerCase().includes("nom"));
		const firstNameLine = lines.find(l => l.toLowerCase().includes("prénom"));
		const characterIdLine = lines.find(l => l.toLowerCase().includes("id personnage"));
		const gradeLine = lines.find(l => l.toLowerCase().includes("grade"));

		const lastName = lastNameLine?.split(":")[1]?.trim().replace("** ", "");
		const firstName = firstNameLine?.split(":")[1]?.trim().replace("** ", "");

		if (!firstName || !lastName) return errorEmbed("❌ Impossible de récupérer le prénom ou le nom.");

		const fullName = `${firstName} ${lastName}`;

		const characterId = characterIdLine?.split(":")[1]?.trim().replace("** ", "") ?? "Non renseigné";
		if (isNaN(parseInt(characterId))) return errorEmbed("❌ L'ID personnage doit être un nombre.");

		const phone = phoneLine?.split(":")[1]?.trim().replace("** ", "") ?? "Non renseigné";
		const iban = ibanLine?.split(":")[1]?.trim().replace("** ", "") ?? "Non renseigné";
		const grade = gradeLine?.split(":")[3]?.trim().replace("** ", "") ?? "Non renseigné";

		const channelName = `${firstName}-${lastName}`
			.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
			.replace(/\s+/g, "-")

		const files = message.attachments.map(att => att.url);
		if (files.length < 2) return errorEmbed("❌ **2** photos sont demandés, votre carte d'identité et votre permis de conduire.");

		const validGrades = ["responsable", "manager", "ressources humaines", "chef d'équipe", "chef d'équipe vendeur", "chef d'équipe pompiste", "pompiste", "vendeur"];
		if (!validGrades.includes(grade.toLowerCase())) return errorEmbed("❌ Grade invalide.\n**Voici la liste des grades valides:** `Responsable`, `Manager`, `Ressources Humaines`, `Chef d'équipe`, `Chef d'équipe vendeur`, `Chef d'équipe pompiste`, `Pompiste`, `Vendeur`");

		let emoji = "📝";
		switch (grade.toLowerCase()) {
			case "ceo":
				emoji = "🌸";
				break;
			case "coo":
				emoji = "🐉";
				break;
			case "responsable":
				emoji = "👔";
				break;
			case "ressources humaines":
				emoji = "🖥️";
			case "manager":
			case "manager vendeurs":
			case "manager pompistes":
			case "manager vendeur":
			case "manager pompiste":
				emoji = "🧠";
				break;
			case "chef d'équipe":
			case "chef d'équipe vendeur":
			case "chef d'équipe pompiste":
				emoji = "🎯";
				break;
			case "pompiste":
				emoji = "⛽";
				break;
			case "vendeur":
				emoji = "🛍️";
				break;
		}

		const channel = await interaction.guild.channels.create({
			name: `${emoji}』${toFullWidthBold(channelName)}`,
			type: ChannelType.GuildText,
			parent: client.config.categories.carnets,
			permissionOverwrites: [
				{
					id: message.author.id,
					allow: [
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.SendMessages,
						PermissionsBitField.Flags.ReadMessageHistory
					],
				},
				{
					id: client.user.id,
					allow: [
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.SendMessages,
						PermissionsBitField.Flags.ReadMessageHistory
					],
				},
				{
					id: "683269450086219777",
					allow: [
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.SendMessages,
						PermissionsBitField.Flags.ReadMessageHistory
					],
				},
				{
					id: client.config.roles.manage,
					allow: [
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.SendMessages,
						PermissionsBitField.Flags.ReadMessageHistory
					],
				},
				{
					id: client.config.roles.direction,
					allow: [
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.SendMessages,
						PermissionsBitField.Flags.ReadMessageHistory
					],
				},
				{
					id: interaction.guild.roles.everyone.id,
					deny: [PermissionsBitField.Flags.ViewChannel],
				}
			]
		});

		let notebookName = `Fiche ${['a', 'e', 'o', 'u', 'i', 'y'].includes(fullName[0].toLowerCase()) ? "d'" : "de "}${fullName}`;

		const embed = new EmbedBuilder()
			.setColor(client.config.colors.default ?? "Blue")
			.setAuthor({ name: notebookName, iconURL: message.author.displayAvatarURL() })
			.addFields(
				{ name: "👤 Nom", value: fullName, inline: true },
				{ name: "📱 Numéro de téléphone", value: phone },
				{ name: "💳 IBAN", value: iban },
				{ name: "🧬 ID Personnage", value: characterId },
				{ name: client.config.emojis.promo + " Grade", value: grade },
			)
			.setFooter({ text: `Créé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
			.setTimestamp();
		
		const embedImage1 = new EmbedBuilder().setURL(files[0]).setImage(files[0]);
		const embedImage2 = new EmbedBuilder().setURL(files[1]).setImage(files[1]);

		const rows = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("iban").setLabel("Changer l'IBAN").setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId("phone").setLabel("Changer le numéro de téléphone").setStyle(ButtonStyle.Secondary),
		)

		await channel.send({
			embeds: [embed, embedImage1, embedImage2],
			components: [rows]
		});

		await channel.send({ embeds: [successEmbed(`✅ <@!${message.author.id}> voici ton carnet !`, true)] });
		channel.send({ content: `<@!${message.author.id}>` }).then(m => m.delete());

		try {
			await client.db.createEmployee(
				channel.id,
				message.author.id,
				firstName,
				lastName,
				null,        // birthDate
				grade,
				null,        // speciality
				phone,
				iban
			);
		} catch (err) {
			console.error("Erreur lors de l'ajout en DB :", err);
			await channel.send(errorEmbed("⚠️ Une erreur est survenue lors de l'enregistrement en base de données.", true));
		}

		successEmbed(`✅ Salon <#${channel.id}> créé et fiche enregistrée.`, false, true)

	}
};
