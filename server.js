const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ─── CONEXIÓN SUPABASE ──────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ Conectado a Supabase"))
  .catch(err => console.error("❌ Error de conexión:", err.message));

// ─── SWAGGER ────────────────────────────────────────────────
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Anime Characters API",
    version: "1.0.0",
    description: "API de personajes de Chainsaw Man, Dan Da Dan y Castlevania",
  },
  tags: [
    { name: "Chainsaw Man" },
    { name: "Dan Da Dan"   },
    { name: "Castlevania"  },
    { name: "General"      },
  ],
  paths: {
    "/": {
      get: {
        tags: ["General"],
        summary: "Info general de la API",
        responses: { 200: { description: "OK" } },
      },
    },
    "/chainsawman": {
      get: {
        tags: ["Chainsaw Man"],
        summary: "Lista los 10 personajes de Chainsaw Man",
        responses: { 200: { description: "Lista de personajes" } },
      },
    },
    "/chainsawman/nombre/{nombre}": {
      get: {
        tags: ["Chainsaw Man"],
        summary: "Busca personaje de Chainsaw Man por nombre",
        parameters: [{
          name: "nombre", in: "path", required: true,
          schema: { type: "string" }, example: "denji",
        }],
        responses: {
          200: { description: "Personaje encontrado" },
          404: { description: "No encontrado" },
        },
      },
    },
    "/chainsawman/{id}": {
      put: {
        tags: ["Chainsaw Man"],
        summary: "Actualiza imágenes de un personaje de Chainsaw Man",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  imagen1: { type: "string" },
                  imagen2: { type: "string" },
                  imagen3: { type: "string" },
                  imagen4: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Actualizado" }, 404: { description: "No encontrado" } },
      },
    },
    "/dandadan": {
      get: {
        tags: ["Dan Da Dan"],
        summary: "Lista los 10 personajes de Dan Da Dan",
        responses: { 200: { description: "Lista de personajes" } },
      },
    },
    "/dandadan/nombre/{nombre}": {
      get: {
        tags: ["Dan Da Dan"],
        summary: "Busca personaje de Dan Da Dan por nombre",
        parameters: [{
          name: "nombre", in: "path", required: true,
          schema: { type: "string" }, example: "okarun",
        }],
        responses: {
          200: { description: "Personaje encontrado" },
          404: { description: "No encontrado" },
        },
      },
    },
    "/dandadan/{id}": {
      put: {
        tags: ["Dan Da Dan"],
        summary: "Actualiza imágenes de un personaje de Dan Da Dan",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  imagen1: { type: "string" },
                  imagen2: { type: "string" },
                  imagen3: { type: "string" },
                  imagen4: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Actualizado" }, 404: { description: "No encontrado" } },
      },
    },
    "/castlevania": {
      get: {
        tags: ["Castlevania"],
        summary: "Lista los 10 personajes de Castlevania",
        responses: { 200: { description: "Lista de personajes" } },
      },
    },
    "/castlevania/nombre/{nombre}": {
      get: {
        tags: ["Castlevania"],
        summary: "Busca personaje de Castlevania por nombre",
        parameters: [{
          name: "nombre", in: "path", required: true,
          schema: { type: "string" }, example: "alucard",
        }],
        responses: {
          200: { description: "Personaje encontrado" },
          404: { description: "No encontrado" },
        },
      },
    },
    "/castlevania/{id}": {
      put: {
        tags: ["Castlevania"],
        summary: "Actualiza imágenes de un personaje de Castlevania",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  imagen1: { type: "string" },
                  imagen2: { type: "string" },
                  imagen3: { type: "string" },
                  imagen4: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Actualizado" }, 404: { description: "No encontrado" } },
      },
    },
  },
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── ROOT ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    api: "Anime Characters API",
    version: "1.0.0",
    total_personajes: 30,
    animes: ["chainsawman", "dandadan", "castlevania"],
    endpoints: {
      "GET /chainsawman":                "Lista Chainsaw Man",
      "GET /chainsawman/nombre/:nombre": "Busca por nombre",
      "PUT /chainsawman/:id":            "Actualiza imágenes",
      "GET /dandadan":                   "Lista Dan Da Dan",
      "GET /dandadan/nombre/:nombre":    "Busca por nombre",
      "PUT /dandadan/:id":               "Actualiza imágenes",
      "GET /castlevania":                "Lista Castlevania",
      "GET /castlevania/nombre/:nombre": "Busca por nombre",
      "PUT /castlevania/:id":            "Actualiza imágenes",
      "GET /docs":                       "Swagger UI",
    },
  });
});

// ─── HELPER: genera rutas por anime ─────────────────────────
const crearRutas = (anime) => {

  // ✅ PRIMERO — ruta específica /nombre/:nombre
  app.get(`/${anime}/nombre/:nombre`, async (req, res) => {
    const { nombre } = req.params;
    try {
      const result = await pool.query(
        "SELECT * FROM personajes WHERE anime = $1 AND LOWER(nombre) = LOWER($2)",
        [anime, nombre]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ✅ DESPUÉS — ruta general GET todos
  app.get(`/${anime}`, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM personajes WHERE anime = $1 ORDER BY id",
        [anime]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ✅ PUT actualizar imágenes
  app.put(`/${anime}/:id`, async (req, res) => {
    const { id } = req.params;
    const { imagen1, imagen2, imagen3, imagen4 } = req.body;
    try {
      const result = await pool.query(
        `UPDATE personajes SET imagen1=$1, imagen2=$2, imagen3=$3, imagen4=$4
         WHERE id=$5 AND anime=$6 RETURNING *`,
        [imagen1 || "", imagen2 || "", imagen3 || "", imagen4 || "", id, anime]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

crearRutas("chainsawman");
crearRutas("dandadan");
crearRutas("castlevania");

// ─── START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📖 Swagger: http://localhost:${PORT}/docs`);
});