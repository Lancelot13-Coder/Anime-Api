// backend/server.js
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // ← Railway requiere SSL, sin el if/else
});

// ─── INIT DB ────────────────────────────────────────────────
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS personajes (
      id      SERIAL PRIMARY KEY,
      nombre  VARCHAR(100) NOT NULL,
      edad    VARCHAR(50),
      poder   VARCHAR(300),
      anime   VARCHAR(50) NOT NULL,
      imagen1 TEXT DEFAULT '',
      imagen2 TEXT DEFAULT '',
      imagen3 TEXT DEFAULT '',
      imagen4 TEXT DEFAULT '',
      UNIQUE(nombre, anime)
    )
  `);
  console.log("✅ Tabla personajes lista");
};
initDB();

// ─── SWAGGER ────────────────────────────────────────────────
const swaggerUi   = require("swagger-ui-express");
const swaggerSpec = {
  openapi: "3.0.0",
  info: { title: "Anime API", version: "1.0.0", description: "API de personajes de Chainsaw Man, Dan Da Dan y Castlevania" },
  tags: [
    { name: "Chainsaw Man" },
    { name: "Dan Da Dan" },
    { name: "Castlevania" },
    { name: "General" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["General"], summary: "Info de la API",
        responses: { 200: { description: "Info general" } }
      }
    },
    "/seed": {
      get: {
        tags: ["General"], summary: "Insertar personajes de prueba",
        responses: { 200: { description: "Seed ejecutado" } }
      }
    },
    "/chainsawman": {
      get: {
        tags: ["Chainsaw Man"], summary: "Lista todos los personajes de Chainsaw Man",
        responses: { 200: { description: "Lista de personajes" } }
      }
    },
    "/chainsawman/nombre/{nombre}": {
      get: {
        tags: ["Chainsaw Man"], summary: "Busca personaje de Chainsaw Man por nombre",
        parameters: [{ name: "nombre", in: "path", required: true, schema: { type: "string" }, example: "denji" }],
        responses: { 200: { description: "Personaje encontrado" }, 404: { description: "No encontrado" } }
      }
    },
    "/dandadan": {
      get: {
        tags: ["Dan Da Dan"], summary: "Lista todos los personajes de Dan Da Dan",
        responses: { 200: { description: "Lista de personajes" } }
      }
    },
    "/dandadan/nombre/{nombre}": {
      get: {
        tags: ["Dan Da Dan"], summary: "Busca personaje de Dan Da Dan por nombre",
        parameters: [{ name: "nombre", in: "path", required: true, schema: { type: "string" }, example: "okarun" }],
        responses: { 200: { description: "Personaje encontrado" }, 404: { description: "No encontrado" } }
      }
    },
    "/castlevania": {
      get: {
        tags: ["Castlevania"], summary: "Lista todos los personajes de Castlevania",
        responses: { 200: { description: "Lista de personajes" } }
      }
    },
    "/castlevania/nombre/{nombre}": {
      get: {
        tags: ["Castlevania"], summary: "Busca personaje de Castlevania por nombre",
        parameters: [{ name: "nombre", in: "path", required: true, schema: { type: "string" }, example: "alucard" }],
        responses: { 200: { description: "Personaje encontrado" }, 404: { description: "No encontrado" } }
      }
    },
  }
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── ROOT INFO ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    api: "Anime Characters API",
    version: "1.0.0",
    animes: ["chainsawman", "dandadan", "castlevania"],
    endpoints: {
      "GET /chainsawman":                 "Lista Chainsaw Man",
      "GET /chainsawman/nombre/:nombre":  "Busca por nombre en Chainsaw Man",
      "GET /dandadan":                    "Lista Dan Da Dan",
      "GET /dandadan/nombre/:nombre":     "Busca por nombre en Dan Da Dan",
      "GET /castlevania":                 "Lista Castlevania",
      "GET /castlevania/nombre/:nombre":  "Busca por nombre en Castlevania",
      "GET /seed":                        "Inserta los 30 personajes (una vez)",
      "GET /docs":                        "Swagger UI",
    }
  });
});

// ─── SEED ───────────────────────────────────────────────────
app.get("/seed", async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO personajes (nombre, edad, poder, anime, imagen1, imagen2, imagen3, imagen4) VALUES

      -- CHAINSAW MAN (10)
      ('Denji',              '16-17',           'Se transforma en Chainsaw Man con motosierras corporales',      'chainsawman', '', '', '', ''),
      ('Makima',             'Aparenta ~20',  'Demonio del Control: domina personas y habilidades',           'chainsawman', '', '', '', ''),
      ('Power',              '~17 físicamente',  'Demonio de Sangre: manipula sangre como armas',                'chainsawman', '', '', '', ''),
      ('Aki Hayakawa',       '20',               'Contratos demoníacos: Fox Devil, Curse Devil y Future Devil',  'chainsawman', '', '', '', ''),
      ('Pochita',            'Desconocida',       'Demonio motosierra original',                                  'chainsawman', '', '', '', ''),
      ('Himeno',             '~20',             'Contrato con Ghost Devil',                                     'chainsawman', '', '', '', ''),
      ('Kobeni Higashiyama', '20',               'Gran agilidad y reflejos excepcionales',                      'chainsawman', '', '', '', ''),
      ('Kishibe',            '~50',              'Cazador legendario con múltiples contratos demoníacos',        'chainsawman', '', '', '', ''),
      ('Katana Man',         '~20',             'Híbrido humano-katana',                                        'chainsawman', '', '', '', ''),
      ('Reze',               '~17',              'Híbrida bomba con explosiones devastadoras',                   'chainsawman', '', '', '', ''),

      -- DAN DA DAN (10)
      ('Momo Ayase',         '16',               'Poderes psíquicos: telequinesis y manipulación espiritual',    'dandadan',    '', '', '', ''),
      ('Okarun',             '16',               'Velocidad sobrenatural y transformación por la Turbo Abuela',  'dandadan',    '', '', '', ''),
      ('Turbo Granny',       'Desconocida',       'Espíritu yokai extremadamente veloz y maldito',                'dandadan',    '', '', '', ''),
      ('Aira Shiratori',     '16',               'Percibe espíritus y usa poderes espirituales/acrobáticos',    'dandadan',    '', '', '', ''),
      ('Seiko Ayase',        '~50',              'Exorcista y médium muy poderosa',                             'dandadan',    '', '', '', ''),
      ('Jiji',               '16',               'Gran energía espiritual y posesión demoníaca',                 'dandadan',    '', '', '', ''),
      ('Evil Eye',           'Desconocida',       'Yokai destructivo con energía maldita',                        'dandadan',    '', '', '', ''),
      ('Acrobatic Silky',    'Desconocida',       'Espíritu veloz con ataques físicos y cabello manipulable',     'dandadan',    '', '', '', ''),
      ('Mr. Shrimp',         'Desconocida',       'Alienígena con fuerza y resistencia sobrehumanas',             'dandadan',    '', '', '', ''),
      ('Serpo Aliens',       'Desconocida',       'Tecnología alienígena y manipulación psíquica',                'dandadan',    '', '', '', ''),

      -- CASTLEVANIA (10)
      ('Trevor Belmont',     '~20',             'Maestro cazador con el látigo Vampire Killer',                 'castlevania', '', '', '', ''),
      ('Sypha Belnades',     '~20',              'Maga elemental: hielo, fuego, viento y rayos',                'castlevania', '', '', '', ''),
      ('Alucard',            '~20 físicamente',  'Mitad vampiro: superfuerza, magia y transformación',           'castlevania', '', '', '', ''),
      ('Dracula',            'Siglos',            'Vampiro supremo con magia oscura y teleportación',             'castlevania', '', '', '', ''),
      ('Hector',             '~20',             'Forjador demoníaco: crea criaturas infernales',               'castlevania', '', '', '', ''),
      ('Isaac',              '~20',             'Forjador demoníaco extremadamente poderoso',                   'castlevania', '', '', '', ''),
      ('Carmilla',           'Siglos',            'Vampira estratega con fuerza y velocidad sobrenaturales',      'castlevania', '', '', '', ''),
      ('Godbrand',           'Siglos',            'Vampiro guerrero brutal',                                      'castlevania', '', '', '', ''),
      ('Lenore',             'Siglos',            'Vampira manipuladora con magia diplomática',                   'castlevania', '', '', '', ''),
      ('Saint Germain',      '~40',              'Conocimiento dimensional y alquimia',                          'castlevania', '', '', '', '')

      ON CONFLICT (nombre, anime) DO NOTHING
    `);
    res.json({ ok: true, mensaje: "✅ 30 personajes insertados correctamente" });
  } catch (error) {
    console.error("Error seed:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── HELPER: rutas por anime ─────────────────────────────────
const crearRutas = (anime) => {

  // GET todos
  app.get(`/${anime}`, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM personajes WHERE anime = $1 ORDER BY id",
        [anime]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET por nombre
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT actualizar imágenes
  app.put(`/${anime}/:id`, async (req, res) => {
    const { id } = req.params;
    const { imagen1, imagen2, imagen3, imagen4 } = req.body;
    try {
      const result = await pool.query(
        `UPDATE personajes SET imagen1=$1, imagen2=$2, imagen3=$3, imagen4=$4
         WHERE id=$5 AND anime=$6 RETURNING *`,
        [imagen1 || '', imagen2 || '', imagen3 || '', imagen4 || '', id, anime]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "No encontrado" });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Registrar rutas para los 3 animes
crearRutas("chainsawman");
crearRutas("dandadan");
crearRutas("castlevania");

// ─── START ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  console.log(`📖 Swagger en http://localhost:${PORT}/docs`);
});