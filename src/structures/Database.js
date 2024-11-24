const { createPool } = require("mysql");
const { EmbedBuilder, WebhookClient, InteractionType, codeBlock } = require("discord.js");

module.exports = class Database {
    constructor(client) {
        this.client = client;
        this.pool = createPool({ ...client.config.database, supportBigNumbers: true, bigNumberStrings: false });

        this._queryOne("SELECT 1+1;")
            .then(() => this.client.logger.db("Database connected"))
            .catch((error) => this.client.logger.error("Database connect error"));
    }

    async _queryOne(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (error, results) => {
                if (error) {
                    this.client.logger.error(sql)
                    this.client.logger.error(`> ${error.sqlMessage}\n──────── 📛 FULL ERROR 📛 ────────`, "DATABASE QUERYONE ERROR");
                    return reject(error);
                }
                resolve(results[0]);
            });
        });
    }

    async _query(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (error, results) => {
                if (error) {
                    this.client.logger.error(sql)
                    this.client.logger.error(`> ${error.sqlMessage}\n──────── 📛 FULL ERROR 📛 ────────`, "DATABASE QUERY ERROR");
                    return reject(error);
                }
                resolve(results);
            });
        });
    }

    async getPumps() {
        const rows = await this._query("SELECT * FROM pumps");
        return rows;
    }

    async getPumpsFuel() {
        const rows = await this._query("SELECT label, fuel FROM pumps");
        return rows;
    }

    async getPumpsPrice() {
        const rows = await this._query("SELECT label, price FROM pumps");
        return rows;
    }

    async setPumpFuel(label, fuel) {
        await this._query("UPDATE pumps SET fuel = ? WHERE label = ?", [fuel, label]);
    }

    async setPumpPrice(label, price) {
        await this._query("UPDATE pumps SET price = ? WHERE label = ?", [price, label]);
    }
}