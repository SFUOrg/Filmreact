-- data/init.sql
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  movieId TEXT NOT NULL,  -- например: "tt0133093"
  title TEXT NOT NULL,
  content TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 🎓 Демо-данные (для студентов — можно расширять)
INSERT INTO users (name, email) VALUES
  ('Анна Петрова', 'anna@example.com'),
  ('Борис Иванов', 'boris@example.com'),
  ('Поливанов Е.Д.', 'polivanov@example.com');

INSERT INTO posts (userId, movieId, title, content) VALUES
  (1, 'tt0133093', 'Матрица — культ!', 'Фильм перестроил моё сознание в 2003 году.'),
  (2, 'tt0133093', 'Слишком философский', 'Не понял сюжет, но спецэффекты класс.'),
  (1, 'tt3896198', 'Стражи — это про любовь', 'Грут научил меня, что семья — это выбор.'),
  (3, 'tt0111161', 'Свобода внутри', 'Надежда — хорошая вещь, а, может быть, лучшая из вещей.');