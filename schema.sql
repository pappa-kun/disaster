CREATE TABLE channels (
    channel_id INT PRIMARY KEY,
    channel_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE messages (
    message_content VARCHAR(500),
    display_name VARCHAR(255) UNIQUE REFERENCES users(username),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    message_id UUID PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id),
    channel_id INT REFERENCES channels(channel_id)
);
