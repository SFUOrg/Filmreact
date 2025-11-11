// server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 🚨 Legacy: глобальная БД (нет пулов, нет закрытия)
let db;

// 🧱 Подключаемся к SQLite (файл создаётся автоматически)
const DB_PATH = path.resolve(__dirname, 'db.sqlite');
db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Не удалось открыть БД:', err.message);
  } else {
    console.log('✅ Подключено к SQLite:', DB_PATH);
    // 🚨 Legacy: инициализация при старте сервера — в отдельный скрипт
    initDatabase();
  }
});

// 🚨 Legacy: парсим JSON без ограничений
app.use(express.json({ limit: '10mb' }));
app.use(cors()); // ← разрешаем запросы с React (localhost:3000)

// 🚨 Legacy: всё в одном файле, никаких контроллеров/роутеров

// ──── USERS ───────────────────────────────────────────────────
app.get('/api/users', (req, res) => {
  // 🛑 Нет валидации, нет пагинации
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'DB error' }); // 🚫 нет деталей
      return;
    }
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  // 🛑 Нет валидации email, нет проверки дублей
  db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Insert failed' });
        return;
      }
      res.status(201).json({ id: this.lastID, name, email });
    }
  );
});

// ──── POSTS ───────────────────────────────────────────────────
app.get('/api/posts', (req, res) => {
  const { movieId } = req.query;
  let sql = 'SELECT * FROM posts';
  let params = [];

  // 🛑 SQL-инъекция через конкатенацию? Нет — но можно улучшить
  if (movieId) {
    sql += ' WHERE movieId = ?';
    params.push(movieId);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'DB error' });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/posts', (req, res) => {
  const { userId, movieId, title, content } = req.body;
  // 🛑 Нет проверки существования userId / movieId
  db.run(
    'INSERT INTO posts (userId, movieId, title, content) VALUES (?, ?, ?, ?)',
    [userId, movieId, title, content],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Insert failed' });
        return;
      }
      res.status(201).json({ id: this.lastID, userId, movieId, title, content });
    }
  );
});

// ──── ИНИЦИАЛИЗАЦИЯ БД ───────────────────────────────────────
function initDatabase() {
  const initSql = fs.readFileSync(path.join(__dirname, 'data', 'init.sql'), 'utf8');
  db.exec(initSql, (err) => {
    if (err) {
      console.warn('⚠️ Ошибка инициализации БД (возможно, уже создана):', err.message);
    } else {
      console.log('✅ БД инициализирована: созданы таблицы и демо-данные');
    }
  });
}

// ──── ЗАПУСК ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Legacy API запущен на http://localhost:${PORT}`);
  console.log(`   GET  /api/users`);
  console.log(`   POST /api/users { name, email }`);
  console.log(`   GET  /api/posts?movieId=tt0133093`);
  console.log(`   POST /api/posts { userId, movieId, title, content }`);
  console.log(`   📁 БД: ${DB_PATH}`);
});