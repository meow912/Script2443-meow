const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json({
    limit: "1mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "1mb"
}));

app.use((req, res, next) => {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

function loadDatabase() {

    try {

        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify({}, null, 2)
            );
        }

        return JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );

    } catch {

        return {};
    }
}

function saveDatabase(database) {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(database, null, 2)
    );
}

function createId() {

    return crypto
        .randomBytes(12)
        .toString("hex");
}

app.get("/", (req, res) => {

    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>@script2443</title>

            <style>
                body {
                    background:#0b0b0f;
                    color:white;
                    font-family:Arial;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    min-height:100vh;
                    margin:0;
                    text-align:center;
                }

                .box {
                    padding:30px;
                }

                h1 {
                    color:#ff277f;
                }

                p {
                    color:#aaa;
                }
            </style>
        </head>

        <body>
            <div class="box">
                <h1>@script2443</h1>
                <p>Backend đang hoạt động.</p>
            </div>
        </body>
        </html>
    `);
});

app.post("/api/create", (req, res) => {

    try {

        const name =
            typeof req.body.name === "string"
                ? req.body.name.trim()
                : "";

        const code =
            typeof req.body.code === "string"
                ? req.body.code
                : "";

        if (!name) {
            return res.status(400).json({
                error: "Tên script không được để trống."
            });
        }

        if (!code.trim()) {
            return res.status(400).json({
                error: "Code không được để trống."
            });
        }

        if (name.length > 80) {
            return res.status(400).json({
                error: "Tên script quá dài."
            });
        }

        if (code.length > 1000000) {
            return res.status(400).json({
                error: "Code quá lớn."
            });
        }

        const id = createId();

        const database = loadDatabase();

        database[id] = {
            name: name,
            code: code,
            createdAt: new Date().toISOString()
        };

        saveDatabase(database);

        const baseUrl =
            `${req.protocol}://${req.get("host")}`;

        const rawUrl =
            `${baseUrl}/raw/${id}`;

        res.json({
            success: true,
            id: id,
            name: name,
            rawUrl: rawUrl
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Lỗi máy chủ."
        });
    }
});

app.get("/raw/:id", (req, res) => {

    const database = loadDatabase();

    const item = database[req.params.id];

    if (!item) {

        return res.status(404).send(
            "Script không tồn tại."
        );
    }

    const userAgent =
        String(req.headers["user-agent"] || "")
            .toLowerCase();

    const isRoblox =
        userAgent.includes("roblox") ||
        userAgent.includes("robloxplayer");

    if (isRoblox) {

        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        return res.send(item.code);
    }

    res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>Protected Link</title>

            <style>

                * {
                    box-sizing:border-box;
                }

                body {
                    margin:0;
                    min-height:100vh;
                    background:#0b0b0f;
                    color:white;
                    font-family:Arial;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    padding:20px;
                }

                .box {
                    width:100%;
                    max-width:600px;
                    background:#15151c;
                    border:1px solid #292936;
                    border-radius:18px;
                    padding:30px;
                    text-align:center;
                }

                .logo {
                    font-size:24px;
                    font-weight:bold;
                    color:#ff277f;
                    margin-bottom:20px;
                }

                .message {
                    color:#ddd;
                    font-size:17px;
                    line-height:1.6;
                }

                .name {
                    margin-top:20px;
                    padding:12px;
                    background:#0d0d12;
                    border-radius:10px;
                    color:#aaa;
                }

            </style>
        </head>

        <body>

            <div class="box">

                <div class="logo">
                    @script2443
                </div>

                <div class="message">
                    link đã bảo vệ người tạo web
                    <br>
                    @script2443
                    <br>
                    tên giả Meow
                </div>

                <div class="name">
                    ${escapeHtml(item.name)}
                </div>

            </div>

        </body>
        </html>
    `);
});

function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});
