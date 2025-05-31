INSERT INTO "user" ("username", "password") VALUES
                                                ('Ales', 'Password123'),
                                                ('Pepa', 'passwords');

INSERT INTO "group" ("name") VALUES
                                 ('Team Vault'),
                                 ('Ales''s Vault');

INSERT INTO "group_user" ("group_id", "user_id") VALUES
                                                     (1, 1), (1, 2),
                                                     (2, 1);

INSERT INTO "password" ("description", "group_id", "username", "password") VALUES
                                                                               ('Access to seznam.cz', 2, 'alesau', 'Password123'),
                                                                               ('School Access', 1, 'users', 'Pass'),
                                                                               ('School Access 2', 1, 'user2', 'Pass2'),
                                                                               ('School Access 3', 1, 'user3', 'Pass3');

INSERT INTO "log" ("date", "group_id", "description") VALUES
                                                          ('2025-03-01 10:00:00', 1, 'Added passwords Id 1 to groups "Team Vault"'),
                                                          ('2025-03-01 10:00:01', 1, 'Added passwords Id 2 to groups "Team Vault"');
