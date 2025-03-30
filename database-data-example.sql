INSERT INTO "user" ("username", "password") VALUES
                                                ('ales', 'Heslo123'),
                                                ('mysak', 'tykraso');

INSERT INTO "group" ("name") VALUES
                                 ('pristupy spolecne'),
                                 ('pristupy ales');

INSERT INTO "group_user" ("group_id", "user_id") VALUES
                                                     (1, 1), (1, 2),
                                                     (2, 1);

INSERT INTO "password" ("description", "group_id", "username", "password") VALUES
                                                                               ('pristup na seznam.cz', 2, 'alesau', 'Heslo123'),
                                                                               ('pristup skola', 1, 'user', 'Pass'),
                                                                               ('pristup skola2', 1, 'user2', 'Pass2'),
                                                                               ('pristup skola3', 1, 'user3', 'Pass3');

INSERT INTO "log" ("date", "group_id", "description") VALUES
                                                          ('2025-03-01 10:00:00', 1, 'Added password Id 1 to group "pristupy spolecne"'),
                                                          ('2025-03-01 10:00:01', 1, 'Added password Id 2 to group "pristupy spolecne"');