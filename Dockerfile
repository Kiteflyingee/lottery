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

# 安装轻量级静态文件服务
RUN npm install -g serve

# 创建启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'node /app/server/index.js &' >> /app/start.sh && \
    echo 'serve -s /app/dist -l 3000' >> /app/start.sh && \
    chmod +x /app/start.sh

# 暴露端口
EXPOSE 3000 3001

# 启动应用
CMD ["/bin/sh", "/app/start.sh"]
