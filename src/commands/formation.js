const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "formation",
    description: "Envoie le lien des différentes formations",
    employeeOnly: true,
    options: [{
        name: "formation",
        description: "La formation à envoyer",
        type: ApplicationCommandOptionType.String,
        choices: [
            { name: "Pompiste", value: "pompiste" }
        ],
        required: true
    }],
    run: async(client, interaction, { errorEmbed }) => {
        const formation = interaction.options.getString("formation");
        
        const embed = new EmbedBuilder()
        .setColor("#232959")
        .setThumbnail("https://imgur.com/tofyuIy.png")
        .setTitle(`Formation ${formation}`)
        
        let roleId;
        switch (formation) {
            case "pompiste": {
                roleId = "1297253886301573130";
                embed
                .setDescription("Voici le lien de la formation pour devenir pompiste : [Cliquez ici](https://www.canva.com/design/DAGWSAQHTSI/-tpyOvn0bRHDFl9LUlODBg/view).");
                break;
            }
        }
        
        if (!interaction.member.roles.cache.has(roleId)) return errorEmbed("Vous n'avez pas la permission d'utiliser cette commande.");
        
        return interaction.reply({ embeds: [embed] });
                    
    }
}