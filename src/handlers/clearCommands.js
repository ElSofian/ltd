const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// 🧼 Choisis ce que tu veux nettoyer :
const CLEAR_GLOBAL = true;
const CLEAR_GUILD = true;

(async () => {
	try {
		if (CLEAR_GLOBAL) {
			console.log("🚮 Suppression des commandes globales...");
			await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
			console.log("✅ Commandes globales supprimées !");
		}

		if (CLEAR_GUILD) {
			console.log("🚮 Suppression des commandes de guilde...");
			await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
			console.log("✅ Commandes de guilde supprimées !");
		}
	} catch (err) {
		console.error("❌ Erreur pendant la suppression :", err);
	}
})();
