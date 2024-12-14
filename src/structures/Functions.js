module.exports = class Functions {
    constructor(client) {
        this.client = client;
    }

    getGradeRoleId(grade) {
        let gradeRoleId;
        switch (grade) {
            case "Responsable": gradeRoleId = this.client.config.roles.responsable; break;
            case "Ressources Humaines": gradeRoleId = this.client.config.roles.humanRessources; break;
            case "Chef d'équipe Vendeur": gradeRoleId = this.client.config.roles.salesTeamChief; break;
            case "Chef d'équipe pompist": gradeRoleId = this.client.config.roles.pompistTeamChief; break;
            case "Vendeur Expérimenté": gradeRoleId = this.client.config.roles.salesExpert; break;
            case "Pompiste Expérimenté": gradeRoleId = this.client.config.roles.pompistExpert; break;
            case "Vendeur": gradeRoleId = this.client.config.roles.sales; break;
            case "Pompiste": gradeRoleId = this.client.config.roles.pompist; break;
            case "Vendeur Novice": gradeRoleId = this.client.config.roles.salesNovice; break;
            case "Pompiste Novice": gradeRoleId = this.client.config.roles.pompistNovice; break;
        }
        return gradeRoleId;
    }
    
    getSpecialityRoleId(speciality)  {
        let specialityRoleId;
        switch (speciality) {
            case "Livreur": specialityRoleId = this.client.config.roles.deliveryMan; break;
            case "Cuisinier": specialityRoleId = this.client.config.roles.cooker; break;
            case "Logistique": specialityRoleId = this.client.config.roles.logistics; break;
            case "Formateur": specialityRoleId = this.client.config.roles.trainer; break;
            case "Gestion des commandes": specialityRoleId = this.client.config.roles.orderManagment; break;
            case "Evenementiel": specialityRoleId = this.client.config.roles.events; break;
            case "Communication": specialityRoleId = this.client.config.roles.communication; break;
        }
        return specialityRoleId;
    }
}