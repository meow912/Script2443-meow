const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const scripts = new Map();

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>@script2443</title>
            <style>
                body {
                    margin:0;
                    min-height:100vh;
                    background:#0b0b0f;
                    color:white;
                    font-family:Arial;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
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
            <div>
                <h1>@script2443</h1>
                <p>Backend đang hoạt động.</p>
            </div>
        </body>
        </html>
    `);
});

app.post("/api/create", (req, res) => {
    try {
        const name = typeof req.body.name === "string"
            ? req.body.name.trim()
            : "";

        const code = typeof req.body.code === "string"
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

        const id = crypto.randomBytes(16).toString("hex");

        scripts.set(id, {
            name: name,
            code: code,
            createdAt: Date.now()
        });

        const rawUrl =
            `${req.protocol}://${req.get("host")}/raw/${id}`;

        res.json({
            success: true,
            name: name,
            id: id,
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
    const script = scripts.get(req.params.id);

    if (!script) {
        return res.status(404).send("Script không tồn tại.");
    }

    const userAgent =
        String(req.headers["user-agent"] || "").toLowerCase();

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

        return res.send(script.code);
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
            <meta name="viewport" content="width=device-width,initial-scale=1">

            <title>Protected Link</title>

            <style>
                body {
                    margin:0;
                    min-height:100vh;
                    background:#0b0b0f;
                    color:white;
                    font-family:Arial;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                }

                .box {
                    width:100%;
                    max-width:500px;
                    background:#15151c;
                    border:1px solid #292936;
                    border-radius:18px;
                    padding:30px;
                    text-align:center;
                }

                h1 {
                    color:#ff277f;
                }

                p {
                    color:#ddd;
                    line-height:1.7;
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
                <h1>@script2443</h1>

                <p>
                    link đã bảo vệ người tạo web<br>
                    @script2443<br>
                    tên giả Meow
                </p>

                <div class="name">
                    ${escapeHtml(script.name)}
                </div>
            </div>
        </body>
        </html>
    `);
});

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
