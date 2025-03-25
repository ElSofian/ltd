module.exports = {
    name: "Créer un carnet employé",
    type: 2,
    run: async (client, interaction) => {
        const message = await interaction.targetMessage;

        await interaction.reply({
            content: `Contenu du message sélectionné :\n\n"${message.content}"`,
            ephemeral: true
        });
    }
}
