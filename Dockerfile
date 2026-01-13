# 构建阶段 - 前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# 配置国内 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 配置国内 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 只复制后端需要的文件
COPY package*.json ./
RUN npm ci --omit=dev

# 复制后端代码
COPY server ./server

# 复制构建好的前端文件
COPY --from=frontend-builder /app/dist ./dist

# 复制 serve 配置文件
COPY serve.json ./dist/serve.json

# 安装轻量级静态文件服务和进程管理
RUN npm install -g serve concurrently

# 暴露端口
EXPOSE 3000 3001

# 使用 concurrently 同时启动前后端
CMD ["npx", "concurrently", "--kill-others", "node /app/server/index.js", "serve /app/dist -l 3000 -c /app/dist/serve.json"]
