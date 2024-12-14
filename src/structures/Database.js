const { createPool } = require("mysql");

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


    // Employees

    async getEmployee(userId) {
        return this._queryOne("SELECT * FROM employees WHERE user_id = ?", [userId]);
    }

    async getEmployeeName(userId, returnType = "string") {
        const row = await this._queryOne("SELECT first_name, last_name FROM employees WHERE user_id = ?", [userId]);
        if (!row) return null;

        switch(returnType) {
            case "object": return row;
            case "array": return [row.first_name, row.last_name];
            default: return `${row.first_name} ${row.last_name}`;
        }
    }

    async createEmployee(userId, firstName, lastName, grade, speciality, phone, iban) {
        if (!speciality) speciality = "nothing";
        return this._query("INSERT INTO employees (user_id, first_name, last_name, grade, speciality, phone, iban) VALUES (?, ?, ?, ?, ?, ?, ?)", [userId, firstName, lastName, grade, speciality, phone, iban]);
    }

    async setEmployee(userId, key, value) {
        return this._query(`UPDATE employees SET \`${key}\` = ? WHERE user_id = ?`, [value, userId]);
    }

    async deleteEmployee(userId) {
        return this._query("DELETE FROM employees WHERE user_id = ?", [userId]);
    }


    // Pumps

    async getPumps() {
        return this._query("SELECT * FROM pumps");
    }

    async getPumpsFuel() {
        return this._query("SELECT label, fuel FROM pumps");
    }

    async getPumpsPrice() {
        return this._query("SELECT label, price FROM pumps");
    }

    async setPumpFuel(label, fuel) {
        return this._query("UPDATE pumps SET fuel = ? WHERE label = ?", [fuel, label]);
    }

    async setPumpPrice(label, price) {
        return this._query("UPDATE pumps SET price = ? WHERE label = ?", [price, label]);
    }
}