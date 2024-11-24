const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    run: async(client, member) => {
        //member.roles.add(client.config.employeeRoleId).catch(e => console.error(e));  
    }
}