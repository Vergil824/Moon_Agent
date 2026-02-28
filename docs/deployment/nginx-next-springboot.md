# 同域名路径分流部署（Nginx + Next.js + Spring Boot）

本文档给出一套推荐的生产部署形态：**Nginx 作为唯一入口**，同域名下通过路径将请求分流到：

- **Next.js 前端**：`/`（以及 `/_next/*`）
- **Spring Boot 后端（支付模块）**：`/app-api/*`

这样做的核心收益是：**前端永远用同源相对路径访问后端**（例如 `/app-api/member/login`），避免 CORS、Cookie/Session 更简单，也更利于统一 HTTPS 与安全策略。

---

## 1. 路由约定（强烈推荐）

- **前端页面与静态资源**：`https://your-domain.com/...`
- **后端 API**：`https://your-domain.com/app-api/...`

> 如果你的 Spring Boot 实际并不是挂载在 `/app-api`，而是挂载在 `/`，请看下面 Nginx 配置里的“IMPORTANT”注释，`proxy_pass` 需要带尾部 `/` 来去掉前缀。

---

## 2. Nginx 配置文件

仓库已提供两份配置：

- `deploy/nginx/moon.conf`：适用于**宿主机直接跑进程**（默认 upstream 指向 `127.0.0.1:3824` 与 `127.0.0.1:48080`）
- `deploy/nginx/moon.docker.conf`：适用于 **docker-compose**（默认 upstream 指向 `frontend:3824` 与 `backend:48080`）

两份配置都已包含：

- 必需的反代头：`Host`、`X-Real-IP`、`X-Forwarded-For`、`X-Forwarded-Proto`
- WebSocket/Upgrade 兼容（即使你暂时不用，也建议保留）
- `/_next/static/` 的长缓存头（对 hash 文件生效）
- 基础 gzip 与超时

---

## 3. docker-compose 接入 Nginx（示例）

你当前根目录已有 `docker-compose.yml`，里面有：

- `frontend`（Next.js，容器内 `3824`）
- `backend`（Spring Boot，容器内 `48080`）
- `mysql`、`redis`

建议新增一个 `nginx` 服务作为唯一对外入口，并把 `frontend`/`backend` 的端口暴露改为仅内部访问（可选）。

示例（只展示关键片段）：

```yaml
services:
  nginx:
    image: nginx:1.25-alpine
    container_name: moon-nginx
    depends_on:
      - frontend
      - backend
    ports:
      - '80:80'
    volumes:
      # Use the docker-compose version of config
      - ./deploy/nginx/moon.docker.conf:/etc/nginx/conf.d/default.conf:ro

  frontend:
    # 生产建议不再对外暴露 3824（让 nginx 作为唯一入口）
    # ports:
    #   - "3824:3824"
    expose:
      - '3824'

  backend:
    # 生产建议不再对外暴露 48080（让 nginx 作为唯一入口）
    # ports:
    #   - "48080:48080"
    expose:
      - '48080'
```

---

## 4. Spring Boot（后端）转发头最佳实践

如果 Nginx 终止 HTTPS（TLS），后端需要正确识别 `X-Forwarded-Proto` 等头，否则容易出现：

- 生成的回调/重定向 URL 协议不对（http/https）
- 记录的客户端 IP 不正确

在 Spring Boot 2.6+ / 3.x 常见做法之一：

```properties
# application.properties
server.forward-headers-strategy=framework
```

具体还需要结合你们的 yudao/网关策略（例如是否还有一层网关），但原则是：**后端必须信任并解析 forwarded headers**。

---

## 5. Next.js（前端）与 API 地址最佳实践

推荐前端代码里使用“同源相对路径”作为 API Base：

- ✅ `fetch("/app-api/xxx")`
- ✅ `axios.create({ baseURL: "/app-api" })`

这样 Nginx 分流即可，无需在 `next.config.mjs` 里做生产 rewrites，减少一跳代理和硬编码。

> 你现在的 `moon-agent/next.config.mjs` 里有 `rewrites()` 指向内网 IP，这更适合本地开发；生产环境建议由 Nginx 负责 `/app-api/` 的反代。

---

## 6. 你需要改的地方（最少改动清单）

- 把 Nginx upstream 指向你的真实地址（宿主机模式）或 service 名（docker 模式）
- 让 `frontend` 与 `backend` 在同一个网络下可互通（docker-compose 默认即可）
- Spring Boot 开启 forwarded headers 解析
- 前端 API 统一使用 `/app-api`（同源），避免跨域与多环境 hardcode
