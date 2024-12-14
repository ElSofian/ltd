const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "virer",
    description: "Permet de virer un employé.",
    options: [
        {
            name: "employé",
            description: "L'employé à virer",
            type: ApplicationCommandOptionType.User,
            required: true
        },
    ],
    admin: true,
    run: async(client, interaction, { successEmbed, errorEmbed }) => {
        
        await interaction.deferReply();
        
        const employee = interaction.options.getUser("employé");
    
        const employeeData = await client.db.getEmployee(employee.id);
        if (!employeeData) return errorEmbed("Cet employé n'est pas présent dans la base de données de l'entreprise.", false, "editReply");

        const roles = [
            "Responsable",
            "Ressources Humaines",
            "Chef d'équipe Vendeur",
            "Chef d'équipe Pompiste",
            "Vendeur Expérimenté",
            "Pompiste Expérimenté",
            "Vendeur",
            "Pompiste",
            "Vendeur Novice",
            "Pompiste Novice",
        ];

        const employeeMember = interaction.guild.members.cache.get(employee.id);

        for (const role of roles) {
            const roleId = client.functions.getGradeRoleId(role);
            if (employeeMember.roles.cache.has(roleId))
                employeeMember.roles.remove(roleId).catch(e => console.error(e));
        }

        if (["Responsable", "Ressources Humaines"].includes(employeeData.grade))
            employeeMember.roles.remove(client.config.roles.manageRole).catch(e => console.error(e));
    
        employeeMember.roles.remove([
            client.config.roles.ltd,
            client.config.roles.separationLtd,
            client.config.roles.separationSales,
            client.config.roles.separationFuel,
            client.config.roles.separationSpeciality,
        ]).catch(e => console.error(e));

        const data = {
            action: "deleteEmployee",
            nom: employeeData.last_name,
            prenom: employeeData.first_name,
        }

        try {
            
            await client.db.deleteEmployee(employee.id);
            await client.google.post(data);
            
            successEmbed(`**${employeeData.first_name} ${employeeData.last_name}** a été viré !`, false, false, "editReply");

        } catch (error) {
            console.error(error);
            interaction.editReply("Erreur lors du licenciement de l'employé.");
        }
    }
}

// https://script.google.com/macros/s/AKfycbzHoslDBsvBVLlByU4gy8WRudKEM5OJlpNptfzJ8pXw948xHL_17LRaU0qk7lj6aYH4/exec