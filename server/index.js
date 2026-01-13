import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// 初始化数据库
const db = new Database(join(__dirname, 'lottery.db'));

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    employeeId TEXT NOT NULL,
    avatarUrl TEXT,
    registeredAt TEXT NOT NULL,
    UNIQUE(name, employeeId)
  );

  CREATE TABLE IF NOT EXISTS prizes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    count INTEGER NOT NULL,
    remaining INTEGER NOT NULL,
    roundLimit INTEGER NOT NULL,
    image TEXT,
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS draw_history (
    id TEXT PRIMARY KEY,
    prizeId TEXT NOT NULL,
    prizeName TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    isExtraDraw INTEGER DEFAULT 0,
    FOREIGN KEY (prizeId) REFERENCES prizes(id)
  );

  CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drawHistoryId TEXT NOT NULL,
    userId TEXT NOT NULL,
    FOREIGN KEY (drawHistoryId) REFERENCES draw_history(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==================== Users API ====================

// 获取所有用户
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY registeredAt DESC').all();
  res.json(users);
});

// 注册用户
app.post('/api/users', (req, res) => {
  const { name, employeeId, customAvatar } = req.body;

  if (!name || !employeeId) {
    return res.status(400).json({ error: '姓名和工号必填' });
  }

  // 检查是否已存在
  const existing = db.prepare('SELECT * FROM users WHERE name = ? AND employeeId = ?').get(name, employeeId);
  if (existing) {
    return res.json(existing);
  }

  const id = crypto.randomUUID();
  const seed = encodeURIComponent(name);
  // 如果用户上传了头像就使用，否则生成默认首字母头像
  const avatarUrl = customAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=c084fc,f472b6,60a5fa,34d399,fbbf24&backgroundType=gradientLinear&fontFamily=Arial&fontSize=40&chars=2`;
  const registeredAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, employeeId, avatarUrl, registeredAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, employeeId, avatarUrl, registeredAt);

  const user = { id, name, employeeId, avatarUrl, registeredAt };
  res.json(user);
});

// ==================== Prizes API ====================

// 获取所有奖项
app.get('/api/prizes', (req, res) => {
  const prizes = db.prepare('SELECT * FROM prizes ORDER BY sortOrder ASC').all();
  res.json(prizes);
});

// 添加奖项
app.post('/api/prizes', (req, res) => {
  const { name, count, roundLimit, image } = req.body;

  if (!name || !count) {
    return res.status(400).json({ error: '奖项名称和数量必填' });
  }

  const id = crypto.randomUUID();
  const sortOrder = db.prepare('SELECT COUNT(*) as count FROM prizes').get().count;

  db.prepare(`
    INSERT INTO prizes (id, name, count, remaining, roundLimit, image, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, count, count, roundLimit || 1, image || null, sortOrder);

  const prize = { id, name, count, remaining: count, roundLimit: roundLimit || 1, image, sortOrder };
  res.json(prize);
});

// 更新奖项
app.patch('/api/prizes/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const prize = db.prepare('SELECT * FROM prizes WHERE id = ?').get(id);
  if (!prize) {
    return res.status(404).json({ error: '奖项不存在' });
  }

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (['name', 'count', 'remaining', 'roundLimit', 'image'].includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE prizes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM prizes WHERE id = ?').get(id);
  res.json(updated);
});

// 重置所有数据
app.post('/api/reset', (req, res) => {
  db.exec(`
    DELETE FROM winners;
    DELETE FROM draw_history;
    DELETE FROM prizes;
    DELETE FROM users;
  `);
  res.json({ success: true });
});

// ==================== Draw History API ====================

// 获取抽奖历史
app.get('/api/draw-history', (req, res) => {
  const history = db.prepare('SELECT * FROM draw_history ORDER BY timestamp DESC').all();

  // 获取每条历史的中奖者
  const result = history.map(h => {
    const winners = db.prepare(`
      SELECT u.* FROM winners w
      JOIN users u ON w.userId = u.id
      WHERE w.drawHistoryId = ?
    `).all(h.id);
    return { ...h, winners, isExtraDraw: !!h.isExtraDraw };
  });

  res.json(result);
});

// 添加抽奖记录
app.post('/api/draw-history', (req, res) => {
  const { prizeId, prizeName, winners, isExtraDraw } = req.body;

  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  db.prepare(`
    INSERT INTO draw_history (id, prizeId, prizeName, timestamp, isExtraDraw)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, prizeId, prizeName, timestamp, isExtraDraw ? 1 : 0);

  // 添加中奖者
  const insertWinner = db.prepare('INSERT INTO winners (drawHistoryId, userId) VALUES (?, ?)');
  for (const winner of winners) {
    insertWinner.run(id, winner.id);
  }

  res.json({ id, prizeId, prizeName, winners, timestamp, isExtraDraw });
});

// 导出中奖名单 Excel
app.get('/api/export', (req, res) => {
  const winners = db.prepare(`
    SELECT 
      w.id,
      u.name as userName, 
      u.employeeId,
      dh.prizeName,
      dh.timestamp,
      dh.isExtraDraw
    FROM winners w
    JOIN users u ON w.userId = u.id
    JOIN draw_history dh ON w.drawHistoryId = dh.id
    ORDER BY dh.timestamp DESC
  `).all();

  // 准备 Excel 数据
  const data = [
    ['姓名', '工号', '奖项', '中奖时间', '是否补抽'],
    ...winners.map(w => [
      w.userName,
      w.employeeId,
      w.prizeName,
      new Date(w.timestamp).toLocaleString('zh-CN'),
      w.isExtraDraw ? '是' : '否'
    ])
  ];

  // 创建工作簿和工作表
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // 设置列宽
  worksheet['!cols'] = [
    { wch: 12 }, // 姓名
    { wch: 15 }, // 工号
    { wch: 12 }, // 奖项
    { wch: 20 }, // 中奖时间
    { wch: 10 }  // 是否补抽
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, '中奖名单');

  // 生成 buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.attachment('lottery-winners.xlsx');
  res.send(buffer);
});

// 获取中奖者ID列表（用于过滤）
app.get('/api/winner-ids', (req, res) => {
  const winners = db.prepare('SELECT DISTINCT userId FROM winners').all();
  res.json(winners.map(w => w.userId));
});

app.listen(PORT, () => {
  console.log(`🎲 抽奖后端服务器运行在 http://localhost:${PORT}`);
});
