const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors({
    "origin": "*"
}));

// Data
let groups = [];
groups.push({id: 1, name: "pristupy spolecne", userIdList: [1, 2]});
groups.push({id: 2, name: "pristupy ales", userIdList: [1]});
let groupCount = groups.length + 1;

let users = [];
users.push({id: 1, username: "ales", password: "Heslo123"});
users.push({id: 2, username: "mysak", password: "tykraso"});
let userCount = users.length + 1;

let passwords = [];
passwords.push({id: 1, description: "pristup na seznam.cz", groupId: 2, username: "alesau", password: "Heslo123"});
passwords.push({id: 2, description: "pristup skola", groupId: 1, username: "user", password: "Pass"});
passwords.push({id: 3, description: "pristup skola2", groupId: 1, username: "user2", password: "Pass2"});
passwords.push({id: 4, description: "pristup skola3", groupId: 1, username: "user3", password: "Pass3"});
let passwordsCount = passwords.length + 1;

let logs = [];
logs.push({date: '2025-03-01 10:00:00', userId: 1, description: "Added password Id 1"});
logs.push({date: '2025-03-01 10:00:01', userId: 1, description: "Added password Id 2"});

function authentication(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader("WWW-Authenticate", "Basic");
        return res.status(401).send("You are not authenticated!");
    }

    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");

    const user = users.find(l => l.username == username && l.password == password);
    if (user) {
        req.userId = user.id;
        next();
    } else {
        res.setHeader("WWW-Authenticate", "Basic");
        return res.status(401).send("You are not authenticated!");
    }
}

app.use(authentication)
app.use("/", express.static("./client"))


// Endpoint GET /users
app.get("/users", (req, res) => {
    res.json(users);
});

// Endpoint GET /passwords (without showing actual passwords)
app.get("/passwords", (req, res) => {
    const groupsList = groups.filter(o => o.userIdList.includes(req.userId));
    let passwordsList = [];
    for (const groupsListElement of groupsList) {
        for (const passElement of passwords.filter(o => o.groupId == groupsListElement.id)) {
            passwordsList.push({
                id: passElement.id,
                description: passElement.description,
                groupId: passElement.groupId,
                username: passElement.username
            });
        }
    }
    res.json(passwordsList);
});

// Endpoint GET /passwords/:id (showing only password)
app.get("/passwords/:id", (req, res) => {
    const id = req.params.id;
    const groupsList = groups.filter(o => o.userIdList.includes(req.userId));
    let groupListArray = []
    for (const groupsListElement of groupsList) {
        groupListArray.push(groupsListElement.id)
    }
    const passwordEntry = passwords.find(p => (p.id == id) && (groupListArray.includes(p.groupId)));
    if (!passwordEntry) {
        res.status(404);
        res.send();
        return;
    }
    res.json(passwordEntry);
});

// Endpoint POST /passwords (create a new password)
app.post("/passwords", (req, res) => {
    const {description, username, password, groupId} = req.body;

    // Check if the groupId exists and user has access to that group
    const group = groups.find(g => g.id == groupId && g.userIdList.includes(req.userId));
    if (!group) {
        return res.status(403).json({error: "User does not have access to this group."});
    }

    // Create a new password entry
    const newPassword = {
        id: passwordsCount++,
        description,
        username,
        password,
        groupId
    };

    passwords.push(newPassword);

    logs.push({
        date: new Date().toISOString(),
        userId: req.userId,
        description: `Added password Id ${newPassword.id}`
    });

    res.status(201).json(newPassword);
});

// Endpoint GET /groups
app.get("/groups", (req, res) => {
    res.json(groups);
});

// Endpoint GET /logs
app.get("/logs", (req, res) => {
    res.json(logs);
});

app.listen(3000);