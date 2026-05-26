# 校园二手商品交易系统

一个面向校园内部用户的二手商品交易平台，支持商品发布、浏览搜索、交易申请、卖家处理、留言沟通、双方互评、历史信誉展示和站内消息提醒。项目采用前后端分离架构，后端提供 RESTful API，前端使用 React + Ant Design 构建适合作业答辩和演示的交互界面。

## 项目亮点

- 完整交易闭环：发布商品、申请交易、卖家接受/拒绝、完成交易、双方评价。
- 真实业务约束：手机号必填、交易说明必填、不能购买自己的商品、交易状态按流程流转。
- 双方信誉体系：买家和卖家都可以评价对方，交易列表展示对方历史评分。
- 站内消息提醒：新交易申请、交易接受、拒绝、完成都会生成提醒，顶部显示未读角标。
- 图片支持：商品图、留言图、评价图和头像支持图片地址或压缩后的 data URL。
- 体验优化：留言发布、回复、删除只局部刷新留言区，避免整页刷新回到顶部。
- 中文友好提示：后端参数校验和业务错误返回中文提示，便于演示和普通用户理解。
- 质量观测：接口返回 `X-Response-Time`，后端日志记录方法、路径、状态码和耗时。

## 技术栈

### 前端

- React 18
- Vite 7
- Ant Design 5
- axios
- react-router-dom
- localStorage 保存登录 Token 和用户信息

### 后端

- Go
- Gin
- GORM
- SQLite / MySQL
- JWT
- bcrypt
- Viper 配置管理

## 目录结构

```text
2handschool/
├── client/                         # React 前端
│   ├── src/
│   │   ├── api/                    # 前端 API 封装
│   │   ├── components/             # 通用组件
│   │   ├── pages/                  # 页面
│   │   ├── router/                 # 前端路由
│   │   ├── utils/                  # auth/request 等工具
│   │   └── styles.css              # 全局样式
│   ├── package.json
│   └── vite.config.js
├── server/                         # Go 后端
│   ├── config/                     # 配置读取和 config.yaml
│   ├── controller/                 # Gin 控制器
│   ├── database/                   # 数据库初始化和迁移
│   ├── middleware/                 # 鉴权、CORS、耗时日志
│   ├── model/                      # GORM 模型
│   ├── request/                    # 请求参数结构和校验规则
│   ├── response/                   # 统一响应格式
│   ├── router/                     # 路由注册
│   ├── service/                    # 业务逻辑
│   ├── utils/                      # JWT、密码工具
│   ├── go.mod
│   └── main.go
├── 完整项目构建说明.md
├── 接口约束与质量检测说明.md
└── README.md
```

## 核心功能

### 用户模块

- 注册、登录、退出登录。
- JWT 登录鉴权。
- 查看和修改个人信息。
- 手机号必填，QQ、微信可选。
- 头像支持图片地址或压缩后的 data URL，后端字段为 `LONGTEXT`。

### 商品模块

- 商品发布、编辑、下架。
- 商品列表展示、关键词搜索、分类筛选、状态筛选。
- 商品详情展示商品图片、价格、分类、描述、卖家信息和卖家评分。
- 商品状态包括：
  - `available`：可交易
  - `trading`：交易中
  - `sold`：已售出
  - `off_shelf`：已下架

### 交易模块

- 买家对可交易商品发起交易申请。
- 发起交易时必须填写交易说明，建议包含面交时间、地点或补充联系方式。
- 卖家可以接受或拒绝交易。
- 交易双方可以完成交易。
- “我发起的交易”和“我收到的交易”支持状态筛选。
- 交易列表展示商品缩略图、交易状态、对方联系方式、对方历史评分。

交易状态流转：

```text
pending -> accepted -> completed
pending -> rejected
```

商品状态联动：

```text
available --卖家接受交易--> trading
trading --交易完成--> sold
available --卖家下架--> off_shelf
```

### 留言模块

- 登录后可以在商品详情页留言。
- 支持回复留言。
- 支持删除自己的留言。
- 留言支持一张图片。
- 留言发布、回复、删除后只刷新留言区，不重新加载整个详情页。

### 评价和信誉模块

- 只有已完成交易可以评价。
- 买家可以评价卖家，卖家也可以评价买家。
- 同一交易同一用户只能评价一次。
- 已评价后可以修改自己的评价。
- 评价支持评分、文字和一张图片。
- 商品详情展示商品成交评价和卖家历史评价。
- 交易列表展示对方历史评分 `ratingAvg` 和评价数量 `ratingCount`。

### 消息提醒模块

- 新交易申请会提醒卖家。
- 交易被接受、拒绝、完成时会提醒交易对方。
- 顶部“提醒”按钮显示未读角标。
- 提醒面板支持查看最近消息、单条标记已读、全部标记已读。
- 点击提醒可跳转到对应交易页面。
- 前端会定时查询未读数量，查询失败时静默处理，避免影响正常使用。

## 后端接口概览

所有接口统一前缀：

```text
/api
```

公开接口：

```http
GET  /api/ping
POST /api/auth/register
POST /api/auth/login
GET  /api/products
GET  /api/products/:productId
GET  /api/products/:productId/messages
GET  /api/products/:productId/reviews
GET  /api/users/:userId/reviews
```

需要登录的接口需要携带：

```http
Authorization: Bearer <token>
```

登录后接口：

```http
GET    /api/user/profile
PUT    /api/user/profile

POST   /api/products
PUT    /api/products/:productId
GET    /api/my/products
PUT    /api/products/:productId/off-shelf

POST   /api/products/:productId/transactions
GET    /api/my/buy-transactions
GET    /api/my/sell-transactions
PUT    /api/transactions/:transactionId/accept
PUT    /api/transactions/:transactionId/reject
PUT    /api/transactions/:transactionId/complete

POST   /api/products/:productId/messages
POST   /api/products/:productId/messages/:messageId/replies
DELETE /api/messages/:messageId

POST   /api/transactions/:transactionId/reviews
PUT    /api/reviews/:reviewId

GET    /api/notifications
GET    /api/notifications/unread-count
PUT    /api/notifications/:notificationId/read
PUT    /api/notifications/read-all
```

统一响应格式：

```json
{
  "code": 200,
  "message": "操作结果说明",
  "data": {}
}
```

## 数据库说明

系统当前支持 SQLite 和 MySQL。

默认 `server/config/config.yaml` 使用 SQLite：

```yaml
mysql:
  driver: sqlite
  path: campus_second_hand.db
```

首次启动后端时，GORM 会自动创建数据表，并初始化两个演示账号：

| 账号 | 密码 | 说明 |
| --- | --- | --- |
| `seller01` | `123456` | 卖家演示账号 |
| `buyer01` | `123456` | 买家演示账号 |

主要数据表：

- `users`：用户信息、联系方式、头像。
- `products`：商品信息。
- `transactions`：交易记录。
- `messages`：留言和回复。
- `reviews`：双方评价。
- `notifications`：消息提醒。

## 本地开发启动

### 环境要求

- Go：与 `server/go.mod` 一致，当前为 `1.26.0`
- Node.js：建议 `20.19.0+` 或 `22.12.0+`
- npm：随 Node.js 安装

### 1. 安装前端依赖

```bash
cd client
npm install
```

### 2. 启动后端

```bash
cd server
go run main.go
```

后端默认地址：

```text
http://localhost:8080
```

健康检查：

```text
http://localhost:8080/api/ping
```

### 3. 启动前端

```bash
cd client
npm run dev
```

前端默认地址：

```text
http://localhost:5173
```

如果 `5173` 被占用，Vite 会自动尝试下一个端口，按终端输出访问即可。

## 配置说明

后端配置文件：

```text
server/config/config.yaml
```

也可以用环境变量覆盖配置。环境变量前缀为 `CAMPUS`，点号配置会转换为下划线，例如：

```powershell
$env:CAMPUS_SERVER_PORT="18080"
$env:CAMPUS_MYSQL_DRIVER="sqlite"
$env:CAMPUS_MYSQL_PATH="campus_second_hand.db"
$env:CAMPUS_JWT_SECRET="your_secret"
go run main.go
```

常用配置：

| 配置 | 说明 |
| --- | --- |
| `server.port` | 后端服务端口 |
| `mysql.driver` | `sqlite` 或 `mysql` |
| `mysql.path` | SQLite 数据库文件路径 |
| `mysql.host` | MySQL 主机 |
| `mysql.port` | MySQL 端口 |
| `mysql.username` | MySQL 用户名 |
| `mysql.password` | MySQL 密码 |
| `mysql.database` | MySQL 数据库名 |
| `jwt.secret` | JWT 密钥，生产环境必须修改 |
| `jwt.expire_hours` | Token 过期时间 |

## 生产部署

下面给出一套常见部署方式：前端使用 Nginx 静态部署，后端编译为可执行文件运行，数据库使用 MySQL。

### 1. 准备 MySQL

创建数据库：

```sql
CREATE DATABASE campus_second_hand DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

修改后端配置：

```yaml
mysql:
  driver: mysql
  host: 127.0.0.1
  port: 3306
  username: root
  password: your_password
  database: campus_second_hand
  charset: utf8mb4
```

生产环境请同步修改：

```yaml
jwt:
  secret: your_production_secret
```

### 2. 构建后端

在服务器或构建机执行：

```bash
cd server
go build -o campus-server .
```

运行：

```bash
./campus-server
```

Windows 可生成并运行：

```powershell
cd server
go build -o campus-server.exe .
.\campus-server.exe
```

### 3. 构建前端

```bash
cd client
npm install
npm run build
```

构建结果在：

```text
client/dist/
```

### 4. Nginx 部署前端

将 `client/dist` 上传到服务器，例如：

```text
/var/www/campus-market
```

Nginx 示例配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/campus-market;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

当前前端 axios 默认请求地址是：

```js
http://localhost:8080/api
```

如果要部署到真实域名，建议把 `client/src/utils/request.js` 的 `baseURL` 改成：

```js
baseURL: "/api"
```

然后重新执行：

```bash
npm run build
```

### 5. 后台运行后端

Linux 可以用 `systemd` 管理后端服务。示例：

```ini
[Unit]
Description=Campus Second Hand Server
After=network.target

[Service]
WorkingDirectory=/opt/campus-second-hand/server
ExecStart=/opt/campus-second-hand/server/campus-server
Restart=always
Environment=CAMPUS_MYSQL_DRIVER=mysql
Environment=CAMPUS_JWT_SECRET=your_production_secret

[Install]
WantedBy=multi-user.target
```

常用命令：

```bash
sudo systemctl daemon-reload
sudo systemctl enable campus-second-hand
sudo systemctl start campus-second-hand
sudo systemctl status campus-second-hand
```

## 构建与质量检查

后端编译：

```bash
cd server
go build ./...
```

前端构建：

```bash
cd client
npm run build
```

说明：前端构建时可能出现 Vite 的 chunk size 提示，主要原因是 Ant Design 等依赖体积较大，不影响系统功能运行。

## 常见问题

### 1. `vite` 不是内部或外部命令

通常是前端依赖没有安装。进入 `client` 后执行：

```bash
npm install
npm run dev
```

### 2. 端口 8080 被占用

后端默认使用 `8080`。可以关闭占用进程，或临时换端口：

```powershell
$env:CAMPUS_SERVER_PORT="18080"
go run main.go
```

### 3. 前端页面空白

建议按顺序检查：

1. 是否执行过 `npm install`。
2. `npm run build` 是否通过。
3. 浏览器控制台是否有报错。
4. 后端是否已启动。
5. `client/src/utils/request.js` 的 `baseURL` 是否指向正确后端地址。

### 4. 登录后接口 401

可能原因：

- Token 过期。
- 后端 `jwt.secret` 修改后，旧 Token 失效。
- 请求头没有带 `Authorization: Bearer <token>`。

处理方式：退出登录后重新登录。

### 5. 图片太长保存失败

当前商品图、头像图、留言图、评价图支持最长 `500000` 字符，数据库字段使用 `LONGTEXT`。如果图片仍然过大，建议压缩后再上传，后续也可以接入对象存储。

### 6. MySQL 部署后字段长度不对

本项目启动时会自动迁移表结构。对于头像、QQ、微信等字段，后端已在 MySQL 下执行字段类型调整。若旧数据库仍异常，可以备份数据后重新迁移，或手动检查字段类型。

## 演示账号

首次启动空数据库时，系统会自动创建：

```text
卖家账号：seller01 / 123456
买家账号：buyer01 / 123456
```

可以用这两个账号演示：

1. 卖家发布商品。
2. 买家发起交易申请。
3. 卖家收到消息提醒并接受交易。
4. 买家看到交易状态变化提醒。
5. 完成交易后双方互评。
6. 再查看交易列表中的历史评分。

## 相关文档

- [完整项目构建说明.md](./完整项目构建说明.md)
- [接口约束与质量检测说明.md](./接口约束与质量检测说明.md)

## 后续优化方向

- 接入对象存储，替代 data URL 存储图片。
- 对交易列表、通知列表等接口增加分页。
- 引入 WebSocket 或 SSE，实现实时消息推送。
- 增加管理员审核、商品举报、违规处理等管理功能。
- 前端按路由拆包，优化生产包体积。
