# 🎉 年会抽奖系统

一个现代化的年会抽奖应用，支持员工自助报名、奖项管理、实时抽奖和中奖名单导出。

## ✨ 功能特性

### 📝 员工报名
- 员工通过手机扫码访问报名页面
- 输入姓名和工号即可完成注册
- 支持自定义头像上传（可选）
- 自动生成基于姓名的首字母渐变头像
- 同一设备只能报名一次，防止重复注册

### ⚙️ 奖项管理
- 支持设置最多 5 个奖项等级
- 每个奖项可配置：名称、数量、单轮抽取人数、奖品图片
- **支持随时修改已配置的奖项**（名称、数量、单轮抽取数）
- 实时显示每个奖项的剩余数量
- 预设奖项模板：特别大奖、特等奖、一等奖、二等奖、三等奖
- 支持重置所有数据

### 🎲 抽奖功能
- 炫酷的抽奖动画效果
- 实时显示当前奖池人数
- 抽奖结束即时展示中奖者信息
- 支持**补抽功能**：可选择补抽人数
- 奖品图片在右上角展示
- 一键刷新报名数据

### 📊 数据导出
- 导出完整中奖名单为 Excel 格式
- 包含姓名、工号、奖项、中奖时间等信息
- Excel 可直接打开，中文显示正常

## 🛠️ 技术栈

- **前端**：React 19 + Vite
- **后端**：Node.js + Express
- **数据库**：SQLite (better-sqlite3)
- **图标**：Lucide React
- **样式**：原生 CSS（渐变、动画、毛玻璃效果）

## 📦 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端服务器

```bash
npm run server
```

后端 API 运行在 `http://localhost:3001`

### 3. 启动前端开发服务器

```bash
npm run dev
```

前端运行在 `http://localhost:5173`（端口可能因占用而变化）

## 🔗 访问地址

| 页面 | 地址 | 说明 |
|------|------|------|
| 报名页面 | `http://localhost:5173/` | 员工扫码报名入口 |
| 管理后台 | `http://localhost:5173/admin.html` | 设置奖项、进行抽奖 |

## 📖 使用流程

### 管理员操作

1. **打开管理后台** (`/admin.html`)
2. **设置奖项**：添加奖项名称、数量、单轮抽取数、奖品图片
3. **分享报名链接**：将根地址 `/` 生成二维码供员工扫码
4. **开始抽奖**：点击"开始抽奖"按钮，选择奖项后点击"开始"
5. **补抽**：如有需要，可使用补抽功能指定人数再次抽取
6. **导出名单**：抽奖结束后点击"导出名单"下载 CSV 文件

### 员工操作

1. **扫码访问** 报名页面
2. **填写信息**：输入姓名和工号
3. **上传头像**（可选）：点击头像区域上传照片
4. **提交注册**：等待抽奖，祝您好运！

## 📁 项目结构

```
lottery-app/
├── server/
│   └── index.js          # 后端 API 服务器
├── src/
│   ├── components/
│   │   ├── Lottery.jsx   # 抽奖页面组件
│   │   ├── Registration.jsx # 报名页面组件
│   │   └── Settings.jsx  # 设置页面组件
│   ├── contexts/
│   │   ├── UserContext.jsx   # 用户状态管理
│   │   └── PrizeContext.jsx  # 奖项状态管理
│   ├── utils/
│   │   ├── api.js        # API 请求封装
│   │   └── imageUtils.js # 图片处理工具
│   ├── App.jsx           # 主应用（报名入口）
│   ├── admin-main.jsx    # 管理后台入口
│   └── index.css         # 全局样式
├── index.html            # 报名页面 HTML
├── admin.html            # 管理后台 HTML
└── package.json
```

## 🔧 配置说明

### 端口配置

- **前端端口**：Vite 默认 5173，可在 `vite.config.js` 中修改
- **后端端口**：默认 3001，可在 `server/index.js` 中修改

### 数据库

- 数据库文件自动创建在 `server/lottery.db`
- 使用"重置数据"按钮可清空所有数据

## 📝 注意事项

1. **必须同时运行前端和后端**才能正常使用
2. **数据库文件**会在 `server/` 目录下自动生成
3. **Excel 导出**生成标准 .xlsx 格式，兼容所有 Excel 版本
4. **报名限制**基于 localStorage，清除浏览器数据可重新报名

## 🚀 生产部署

### Docker 部署（推荐）

确保服务器已安装 Docker 和 Docker Compose，然后执行：

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

部署后访问：
- **报名页面**：`http://服务器IP:3000/`
- **管理后台**：`http://服务器IP:3000/admin.html`

### 手动部署

```bash
# 1. 安装依赖
npm install

# 2. 构建前端
npm run build

# 3. 启动后端（推荐使用 PM2）
npm install -g pm2
pm2 start server/index.js --name lottery-api

# 4. 使用 Nginx 代理前端静态文件
# 将 dist 目录配置为 Nginx 的根目录
```

## 📄 开源协议

MIT License
