# 构建阶段 - 前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# 配置国内 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段 - 使用 Nginx
FROM nginx:alpine AS production

# 安装 Node.js 运行后端
RUN apk add --no-cache nodejs npm

WORKDIR /app

# 配置国内 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制后端依赖
COPY package*.json ./
RUN npm ci --omit=dev

# 复制后端代码
COPY server ./server

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建好的前端文件
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# 创建启动脚本
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'node /app/server/index.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# 只暴露一个端口
EXPOSE 3000

CMD ["/start.sh"]
