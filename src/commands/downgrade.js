const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "downgrade",
    description: "Permet de rétrograder un employé.",
    admin: true,
    options: [
        {
            name: "employé",
            description: "L'employe à promouvoir",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "grade",
            description: "Le nouveau grade de l'employé",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Responsable", value: "Responsable" },
                { name: "Ressources Humaines", value: "Ressources Humaines" },
                { name: "Chef d'équipe Vendeur", value: "Chef d'équipe Vendeur" },
                { name: "Chef d'équipe Pompiste", value: "Chef d'équipe Pompiste" },
                { name: "Vendeur Expérimenté", value: "Vendeur Expérimenté" },
                { name: "Pompiste Expérimenté", value: "Pompiste Expérimenté" },
                { name: "Vendeur", value: "Vendeur" },
                { name: "Pompiste", value: "Pompiste" },
                { name: "Vendeur Novice", value: "Vendeur Novice" },
                { name: "Pompiste Novice", value: "Pompiste Novice" },
            ],
            required: false
        }
    ],
    run: async(client, interaction, { successEmbed, errorEmbed }) => {
        
        await interaction.deferReply();

        const employee = interaction.options.getUser("employé");
        const grade = interaction.options.getString("grade");

        const employeeData = await client.db.getEmployee(employee.id);
        if (!employeeData) return errorEmbed("Cet employé n'est pas présent dans la base de données de l'entreprise.", false, "editReply");

        const currentGrade = employeeData.grade;
        if (grade && currentGrade == grade) return errorEmbed(`Cet employé a déjà le grade **${currentGrade}**.`, false, "editReply");
        if (!grade && (employeeData.grade == "Vendeur Novice" || employeeData.grade == "Pompiste Novice")) return errorEmbed("Vous ne pouvez pas rétrograder un vendeur/pompiste novice.", false, "editReply");

        const roles = ["Responsable", "Ressources Humaines"];
        if (["Vendeur Novice", "Vendeur", "Vendeur Expérimenté", "Chef d'équipe Vendeur"].includes(currentGrade)) 
            roles.push("Chef d'équipe Vendeur", "Vendeur Expérimenté", "Vendeur", "Vendeur Novice");
        else if (["Pompiste Novice", "Pompiste", "Pompiste Expérimenté", "Chef d'équipe Pompiste"].includes(currentGrade))
            roles.push("Chef d'équipe Pompiste", "Pompiste Expérimenté", "Pompiste", "Pompiste Novice");

        const currentRoleIndex = roles.indexOf(currentGrade);
        const newRole = roles[currentRoleIndex + 1]

        const currentRoleId = client.functions.getGradeRoleId(currentGrade);
        const newRoleId = client.functions.getGradeRoleId(grade ?? newRole);
        if (!newRoleId) return errorEmbed(`Je n'ai pas trouvé le rôle **${newRoleId}**.`, false, "editReply");

        interaction.guild.members.cache.get(employee.id).roles.add(newRoleId).catch(e => console.error(e));
        interaction.guild.members.cache.get(employee.id).roles.remove(currentRoleId).catch(e => console.error(e));

        const data = {
            action: "downgradeEmployee",
            nom: employeeData.last_name,
            prenom: employeeData.first_name,
            grade: grade ?? newRole,
        }

        await client.db.setEmployee(employee.id, "grade", grade ?? newRole);
        await client.google.post(data);

        return successEmbed(`<@${employee.id}> a été rétrograder au grade **${grade ?? newRole}** !`, false, false, "editReply");
    }
}