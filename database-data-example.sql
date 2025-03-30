-- Insert Users
INSERT INTO "user" ("user_id", "username", "password") VALUES
                                                           (1, 'ales', 'Heslo123'),
                                                           (2, 'pepa', 'heslicko');

-- Insert Groups
INSERT INTO "group" ("group_id", "name") VALUES
                                             (1, 'pristupy spolecne'),
                                             (2, 'pristupy ales');

-- Insert Group-User Relations
INSERT INTO "group_user" ("group_id", "user_id") VALUES
                                                     (1, 1), (1, 2), -- 'pristupy spolecne' contains users 1 and 2
                                                     (2, 1);         -- 'pristupy ales' contains user 1

-- Insert Passwords
INSERT INTO "password" ("password_id", "description", "group_id", "username", "password") VALUES
                                                                                              (1, 'pristup na seznam.cz', 2, 'alesau', 'Heslo123'),
                                                                                              (2, 'pristup skola', 1, 'user', 'Pass'),
                                                                                              (3, 'pristup skola2', 1, 'user2', 'Pass2'),
                                                                                              (4, 'pristup skola3', 1, 'user3', 'Pass3');

-- Insert Logs
INSERT INTO "log" ("log_id", "date", "user_id", "description") VALUES
                                                                   (1, '2025-03-01 10:00:00', 1, 'Added password Id 1'),
                                                                   (2, '2025-03-01 10:00:01', 1, 'Added password Id 2');