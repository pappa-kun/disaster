const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/api/logs', async (req, res) => {
    const { username, user_id, channel } = req.query;

    if (!channel) {
        return res.json({ error: 'Channel is required' });
    }

    try {
        const client = await pool.connect();

        let query;
        let params;

        if (username) {
            // Case-insensitive search by username
            query = `
                SELECT *
                FROM messages m
                JOIN users u ON m.user_id = u.user_id
                LEFT JOIN message_tags mt ON m.message_id = mt.message_id
                WHERE LOWER(u.username) ILIKE LOWER($1)
                AND m.channel_id = (SELECT channel_id FROM channels WHERE channel_name = $2)
                ORDER BY m.timestamp DESC
            `;
            params = [username, channel];
        } else if (user_id) {
            // Search by user_id
            query = `
                SELECT *
                FROM messages m
                JOIN users u ON m.user_id = u.user_id
                LEFT JOIN message_tags mt ON m.message_id = mt.message_id
                WHERE LOWER m.user_id = $1
                AND m.channel_id = (SELECT channel_id FROM channels WHERE channel_name = $2)
                ORDER BY m.timestamp DESC
            `;
            params = [user_id, channel];
        } else {
            return res.json({ error: 'Either username or user_id is required' });
        }

        console.log('Executing query:', query);
        console.log('With parameters:', params);

        const result = await client.query(query, params);
        client.release();

        console.log('Query result:', result.rows);

        res.json({ logs: result.rows });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
