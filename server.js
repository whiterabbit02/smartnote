const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const authenticateToken = require('./middleware/authenticateToken');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 5000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartnote',
  password: '123321',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.options('*', cors()); // включаем pre-flight запросы для всех маршрутов

app.get('/', (req, res) => {
  res.send('Server is running');
});


// Настройка Multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Обработчик загрузки файлов
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  const file = req.file;
  const userId = req.user.userId;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const result = await pool.query(
      'INSERT INTO images (user_id, filename, content, content_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, file.originalname, file.buffer, file.mimetype]
    );
    const imageId = result.rows[0].id;
    res.json({ url: `/api/images/${imageId}` });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

// Получение изображения
app.get('/api/images/:id', async (req, res) => {
  const imageId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM images WHERE id = $1', [imageId]);
    if (result.rows.length === 0) {
      return res.status(404).send('Image not found');
    }

    const image = result.rows[0];
    res.setHeader('Content-Type', image.content_type);
    res.send(image.content);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

// Получение профиля пользователя
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Обновление профиля пользователя
app.put('/api/user', authenticateToken, async (req, res) => {
  const { nickname, username, email } = req.body;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'UPDATE users SET nickname = $1, username = $2, email = $3 WHERE id = $4 RETURNING *',
      [nickname, username, email, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Server error');
  }
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { nickname, username, password, email } = req.body;
  try {
    logger.info('Received registration request', { nickname, username, email });
    
    if (!password) {
      throw new Error('Password is required');
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    logger.info('Password hashed', { hashedPassword });
    
    const result = await pool.query(
      'INSERT INTO users (nickname, username, password, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [nickname, username, hashedPassword, email]
    );
    
    logger.info('User inserted into database', { result: result.rows[0] });
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    logger.info('JWT token created', { token });
    
    res.json({ user, token });
  } catch (err) {
    logger.error('Error in /api/register:', err.message);
    res.status(500).send('Server error');
  }
});

// Логин пользователя
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token, user });
      } else {
        res.status(400).send('Invalid password');
      }
    } else {
      res.status(400).send('User not found');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Получение папок и заметок текущего пользователя
app.get('/api/folders', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query('SELECT * FROM folders WHERE user_id = $1', [userId]);
    const folders = result.rows;

    for (let folder of folders) {
      const notesResult = await pool.query('SELECT * FROM notes WHERE folder_id = $1', [folder.id]);
      folder.notes = notesResult.rows;
    }

    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/folders', authenticateToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  console.log('Creating folder:', { name, userId });

  try {
    const result = await pool.query('INSERT INTO folders (name, user_id) VALUES ($1, $2) RETURNING *', [name, userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).send('Server error');
  }
});

app.put('/api/folders/:id', authenticateToken, async (req, res) => {
  const { name } = req.body;
  const folderId = req.params.id;

  try {
    const result = await pool.query('UPDATE folders SET name = $1 WHERE id = $2 RETURNING *', [name, folderId]);
    if (result.rows.length === 0) {
      return res.status(404).send('Folder not found');
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating folder name:', error);
    res.status(500).send('Server error');
  }
});

// Удаление папки
app.delete('/api/folders/:id', authenticateToken, async (req, res) => {
  const folderId = req.params.id;

  try {
    await pool.query('DELETE FROM folders WHERE id = $1', [folderId]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).send('Server error');
  }
});

// Создание новой заметки в папке
app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, content, folderId } = req.body;

  try {
    const result = await pool.query('INSERT INTO notes (title, content, folder_id) VALUES ($1, $2, $3) RETURNING *', [title, content, folderId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Добавление файла(картинки) в заметку
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  const file = req.file;
  const userId = req.user.userId;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${userId}/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    res.json({ url: data.Location });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

// Обновление заметки
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const noteId = req.params.id;

  try {
    const result = await pool.query('UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, noteId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Удаление заметки
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  const noteId = req.params.id;

  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [noteId]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
