require('dotenv').config();

module.exports = {
	guildId: "1292838460868005970",
	messages: {
		pumps: "1354152710676418663",
		publicPumps: "1354484128229101588",
	},
	roles: {
		manage: "1306177401847414845",
		direction: "1306177401847414845",
		dev: "1296961410886008862",

		teamChief: "1320023713940242472",

		seller: "1296942261892022352",

		pompist: "1297253886301573130",
		pompistTeamOne: "1299337004944986182",
		pompistTeamTwo: "1299337481094955049",

		ltd: "1296938803340247080",
		citizen: "1296942447687106611",
	},
	categories: {
		rh: "1296949040587603988",
		carnets: "1354105664388988938",
	},
	channels: {
		employeesNotes: "1296948102309085265",
		publicPumps: "1354472286522048583",
	},
	colors: {
		default: "Blue",
	},
	emojis: {
		promo: "<:promo:1308733348784640082>",
	},
	database: {
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
	},	
}