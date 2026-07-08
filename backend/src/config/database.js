const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

class Database {
    constructor() {
        this.pool = null;
    }

    async getPool() {
        if (!this.pool) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'evidence_db',
                waitForConnections: true,
                connectionLimit: 20,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });

            try {
                const connection = await this.pool.getConnection();
                console.log('✅ Database connected successfully');
                connection.release();
            } catch (error) {
                console.error('❌ Database connection failed:', error.message);
                throw error;
            }
        }
        return this.pool;
    }

    async executeQuery(sql, params = []) {
        try {
            const pool = await this.getPool();
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Query Error:', error.message);
            throw error;
        }
    }

    async getConnection() {
        const pool = await this.getPool();
        return pool.getConnection();
    }

    async beginTransaction() {
        const connection = await this.getConnection();
        await connection.beginTransaction();
        return connection;
    }
}

module.exports = new Database();