CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY,
                       username TEXT NOT NULL UNIQUE,
                       password TEXT NOT NULL
);

CREATE TABLE groups (
                        group_id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL UNIQUE
);

CREATE TABLE group_users (
                             group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
                             user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                             PRIMARY KEY (group_id, user_id)
);

CREATE TABLE passwords (
                           password_id SERIAL PRIMARY KEY,
                           description TEXT NOT NULL,
                           group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
                           username TEXT NOT NULL,
                           password TEXT NOT NULL
);

CREATE TABLE logs (
                      log_id SERIAL PRIMARY KEY,
                      date TIMESTAMP NOT NULL,
                      user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
                      description TEXT NOT NULL
);