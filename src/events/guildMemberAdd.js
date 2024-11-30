const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    run: async(client, member) => {
        //member.roles.add(client.config.roles.employeeRoleId).catch(e => console.error(e));  
    }
}