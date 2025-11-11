// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

// 🔑 Ваш OMDb API-ключ
const OMDb_API_KEY = '4a10092f';
// 🖥️ Ваш локальный API (убедитесь, что сервер запущен!)
const API_BASE = 'http://localhost:5000/api';

// 🎬 Фиксированный список imdbID (надёжные фильмы)
const MOVIE_IDS = [
  'tt0133093', // The Matrix
  'tt0111161', // The Shawshank Redemption
  'tt0468569', // The Dark Knight
  'tt0109830', // Forrest Gump
  'tt0137523', // Fight Club
  'tt3896198', // Guardians Vol. 2 (ваш пример!)
];

function App() {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState({ movies: true, users: true, posts: true });

  // 🚨 Legacy: один useEffect на всё — студенты разделят
  useEffect(() => {
    // 1. Загрузка фильмов через OMDb
    const loadMovies = async () => {
      try {
        const movieData = await Promise.all(
          MOVIE_IDS.map(id =>
            fetch(`https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&i=${id}`)
              .then(r => r.json())
              .catch(() => ({ Title: 'Ошибка', imdbID: id, Poster: 'N/A' }))
          )
        );
        setMovies(movieData);
        setLoading(prev => ({ ...prev, movies: false }));
      } catch (e) {
        console.error('🎬 Ошибка загрузки фильмов:', e);
        setLoading(prev => ({ ...prev, movies: false }));
      }
    };

    // 2. Загрузка users и posts через ваш сервер
    const loadUsersAndPosts = async () => {
      try {
        const [usersRes, postsRes] = await Promise.all([
          fetch(`${API_BASE}/users`),
          fetch(`${API_BASE}/posts`)
        ]);

        if (!usersRes.ok) throw new Error('Users fetch failed');
        if (!postsRes.ok) throw new Error('Posts fetch failed');

        setUsers(await usersRes.json());
        setPosts(await postsRes.json());
        setLoading(prev => ({ ...prev, users: false, posts: false }));
      } catch (e) {
        console.error('📡 Ошибка загрузки с сервера:', e);
        setLoading(prev => ({ ...prev, users: false, posts: false }));
      }
    };

    loadMovies();
    loadUsersAndPosts();
  }, []);

  // 🔁 Перезагрузка постов при смене фильма (legacy: студенты оптимизируют кэширование)
  useEffect(() => {
    if (!selectedMovie) return;

    const loadPostsForMovie = async () => {
      try {
        const res = await fetch(`${API_BASE}/posts?movieId=${selectedMovie.imdbID}`);
        if (!res.ok) throw new Error('Posts fetch failed');
        const moviePosts = await res.json();
        // 🚨 Legacy: перезаписываем все посты — студенты сделают мемоизацию
        setPosts(moviePosts);
      } catch (e) {
        console.error('📬 Ошибка загрузки постов:', e);
      }
    };

    loadPostsForMovie();
  }, [selectedMovie]);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const getUserName = (userId) => {
    // 🚨 == вместо ===, нет проверки undefined — legacy!
    const user = users.find(u => u.id == userId);
    return user ? user.name : 'Аноним';
  };

  const getCurrentMoviePosts = () => {
    // Когда выбран фильм — posts уже отфильтрованы сервером (см. useEffect выше)
    return selectedMovie ? posts : [];
  };

  // 🕒 Показываем общий статус загрузки
  const isLoading = loading.movies || loading.users || loading.posts;

  return (
    <div className="App">
      <header>
        <h1>📽️ Фильмотека (Legacy v0.4 — Express + SQLite)</h1>
        <p>
          🌐 OMDb API: <code>4a10092f</code> | 
          🖥️ Backend: <code>{API_BASE}</code>
        </p>
        {isLoading && <div className="global-loader">Загрузка данных…</div>}
      </header>

      <div className="container">
        <section>
          <h2>Фильмы</h2>
          <div className="movies-grid">
            {movies.map((movie, i) => (
              <div
                key={i} // 🚨 legacy: index!
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
                style={{
                  cursor: 'pointer',
                  opacity: loading.movies ? 0.5 : 1,
                  border: selectedMovie?.imdbID === movie.imdbID ? '3px solid #e74c3c' : '1px solid #ddd'
                }}
              >
                <img
                  src={movie.Poster && movie.Poster !== 'N/A'
                    ? movie.Poster
                    : 'https://via.placeholder.com/200x300?text=No+Poster'}
                  alt={movie.Title}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/200x300?text=—'}
                />
                <h3>{movie.Title}</h3>
                <p>📅 {movie.Year} | ⭐ {movie.imdbRating || '—'}</p>
              </div>
            ))}
          </div>
        </section>

        {selectedMovie && (
          <section className="movie-detail">
            <h2>{selectedMovie.Title} ({selectedMovie.Year})</h2>
            <p><strong>Режиссёр:</strong> {selectedMovie.Director || '—'}</p>
            <p><strong>Жанр:</strong> {selectedMovie.Genre || '—'}</p>
            <p><strong>IMDb:</strong> {selectedMovie.imdbRating}/10</p>
            <p><strong>Сюжет:</strong> {selectedMovie.Plot || 'Нет описания'}</p>

            <h3>Отзывы ({getCurrentMoviePosts().length})</h3>
            <div className="posts-list">
              {getCurrentMoviePosts().map((post, i) => (
                <div key={i} className="post">
                  <strong>{getUserName(post.userId)}:</strong>
                  <div>{post.title}</div>
                  <p>{post.content}</p>
                  <small>
                    🕗 {post.createdAt 
                      ? new Date(post.createdAt).toLocaleString('ru-RU')
                      : '—'}
                  </small>
                </div>
              ))}
              {getCurrentMoviePosts().length === 0 && (
                <p>💬 Пока нет отзывов. (Студенты добавят форму добавления!)</p>
              )}
            </div>

            {/* 🚨 Legacy: кнопка "Добавить отзыв" — без реализации, для студентов */}
            <button
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => alert('📌 Задача для студентов: реализовать форму добавления отзыва!')}
            >
              ➕ Добавить отзыв
            </button>
          </section>
        )}
      </div>

      <footer>
        <p>🎓 Учебный legacy-проект | Поливанов Е.Д.</p>
        
      </footer>
    </div>
  );
}

export default App;