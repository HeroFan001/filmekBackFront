const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

async function getConnection() {
    return await mysql.createConnection({
        host: "localhost",
        port: 3306,
        database: "filmek",
        user: "root",
        password: ""
    });
}

// GET "/" -> visszaadja a főoldal szöveget
app.get("/", (req, res) => {
    res.send("<h1>Filmek v1.0.0</h1>");
});

// GET "/filmek" -> ABC sorrendben visszaadja az összes filmet
app.get("/filmek", async (req, res) => {
    try {
        const con = await getConnection();
        const [json] = await con.query("SELECT * FROM filmek ORDER BY cim ASC");
        await con.end();
        res.json(json);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET "/film/:id" -> visszaadja az adott film adatait
app.get("/film/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Hibás paraméter!" });
    }
    try {
        const con = await getConnection();
        const [json] = await con.query("SELECT * FROM filmek WHERE id = ?", [id]);
        await con.end();
        if (json.length === 0) {
            return res.status(404).json({ error: "Nincs ilyen!" });
        }
        res.json(json[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET "/evek" -> visszaadja az éveket (csak egyszer)
app.get("/evek", async (req, res) => {
    try {
        const con = await getConnection();
        const [json] = await con.query("SELECT DISTINCT ev FROM filmek ORDER BY ev ASC");
        await con.end();
        res.json(json.map(r => r.ev));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET "/ev/:ev" -> visszaadja az adott évben megjelent filmeket
app.get("/ev/:ev", async (req, res) => {
    const ev = parseInt(req.params.ev);
    if (isNaN(ev)) {
        return res.status(400).json({ error: "Hibás paraméter!" });
    }
    try {
        const con = await getConnection();
        const [json] = await con.query("SELECT * FROM filmek WHERE ev = ?", [ev]);
        await con.end();
        if (json.length === 0) {
            return res.status(404).json({ error: "Nincs ilyen!" });
        }
        res.json(json);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST "/film" -> új film felvétele
app.post("/film", async (req, res) => {
    const { cim, ev, imdb, kep } = req.body;
    if (!cim || !ev || !imdb || !kep) {
        return res.status(400).json({ error: "Hibás paraméter!" });
    }
    try {
        const con = await getConnection();
        const [json] = await con.query(
            "INSERT INTO filmek (cim, ev, imdb, kep) VALUES (?, ?, ?, ?)",
            [cim, ev, imdb, kep]
        );
        await con.end();
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT "/imdb/:id" -> IMDB értékének módosítása
app.put("/imdb/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { imdb } = req.body;
    if (isNaN(id)) {
        return res.status(400).json({ error: "Hibás paraméter!" });
    }
    if (imdb === undefined || imdb === null) {
        return res.status(400).json({ error: "Hibás paraméter!" });
    }
    try {
        const con = await getConnection();
        const [check] = await con.query("SELECT * FROM filmek WHERE id = ?", [id]);
        if (check.length === 0) {
            await con.end();
            return res.status(404).json({ error: "Nincs ilyen!" });
        }
        const [json] = await con.query(
            "UPDATE filmek SET imdb = ? WHERE id = ?",
            [imdb, id]
        );
        await con.end();
        res.json(json);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE "/film/:id" -> film törlése
app.delete("/film/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Hibás paraméter!" });
    }
    try {
        const con = await getConnection();
        const [check] = await con.query("SELECT * FROM filmek WHERE id = ?", [id]);
        if (check.length === 0) {
            await con.end();
            return res.status(404).json({ error: "Nincs ilyen!" });
        }
        const [json] = await con.query("DELETE FROM filmek WHERE id = ?", [id]);
        await con.end();
        res.json(json);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(88, () => {
    console.log("A szerver fut: http://localhost:88");
});
