const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "recruter",
    description: "Permet de créer un employé sur le Google Sheets.",
    options: [
        {
            name: "employé",
            description: "L'employé à recruter",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "nom",
            description: "Le nom de famille de l'employé",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "prenom",
            description: "Le prenom de l'employé",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "date-de-naissance",
            description: "La date de naissance de l'employé",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "grade",
            description: "Le grade de l'employé",
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
            required: true
        },
        {
            name: "num-téléphone",
            description: "Le numéro de téléphone de l'employé",
            type: ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "iban",
            description: "L'iban' de l'employé",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "specialite",
            description: "Le numéro de téléphone de l'employé",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Livreur", value: "Livreur" },
                { name: "Cuisinier", value: "Cuisinier" },
                { name: "Caoutchouc", value: "Caoutchouc" },
                { name: "Logisticien", value: "Logisticien" },
                { name: "Formateur", value: "Formateur" },
                { name: "Gestion des commandes", value: "Gestion des commandes" },
                { name: "Evenementiel", value: "Evenementiel" },
                { name: "Communication", value: "Communication" },
            ],
            required: false
        },
    ],
    admin: true,
    run: async(client, interaction, { successEmbed, errorEmbed }) => {
        
        await interaction.deferReply();
        
        const employee = interaction.options.getUser("employé");
        const nom = interaction.options.getString("nom");
        const prenom = interaction.options.getString("prenom");
        const birthDate = interaction.options.getString("date-de-naissance");
        const grade = interaction.options.getString("grade");
        const specialite = interaction.options.getString("specialite");
        const phone = interaction.options.getNumber("num-téléphone");
        const iban = interaction.options.getString("iban");

        const dateCheck = client.functions.checkDate(birthDate, true);
        if (!dateCheck.valid) return errorEmbed(dateCheck.errorMsg, false, "editReply");

        const employeeData = await client.db.getEmployee(employee.id);
        if (employeeData) return errorEmbed("Cet employé est déjà présent dans la base de données de l'entreprise.", false, "editReply");

        try {

            const data = {
                action: "createEmployee",
                nom: nom,
                prenom: prenom,
                dateNaissance: birthDate,
                grade: grade,
                specialite: specialite,
                telephone: phone,
                iban: iban
            };

            await client.db.createEmployee(employee.id, prenom, nom, birthDate, grade, specialite, phone, iban);
            await client.google.post(data);
            
            const gradeRoleId = client.functions.getGradeRoleId(grade);
            const specilityRoleId = client.functions.getSpecialityRoleId(specialite);
            const configRoles = client.config.roles;

            const roles = [configRoles.ltd, configRoles.separationSales, gradeRoleId, specilityRoleId];
            if (["Responsable", "Ressources Humaines"].includes(grade)) roles.push(configRoles.manageRoleId);
            if (specilityRoleId) roles.push(configRoles.separationSpeciality);

            const employeeMember = interaction.guild.members.cache.get(employee.id)
            employeeMember.roles.add(roles).catch(e => console.error(e));

            successEmbed(`**${prenom} ${nom}** ajouté à Google Sheets !`, false, false, "editReply");

        } catch (error) {
            console.error(error);
            interaction.editReply("Erreur lors de la création de l'employé.");
        }
    }
}
