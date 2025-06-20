# 工作日志系统

一个基于 LeanCloud 的工作日志记录系统，支持用户注册登录、发布日志、图片上传和无限滚动加载。

## 功能特性

- 🔐 用户注册和登录系统
- 📝 发布工作日志（支持文本和图片）
- 🖼️ 图片上传和预览
- 🗜️ 智能图片压缩（自动压缩到1080px宽度）
- 🗑️ 日志删除功能（权限控制）
- 📱 响应式设计，支持移动端
- ♾️ 无限滚动加载
- ⏰ 智能时间显示（相对时间）
- 🎨 现代化 UI 设计

## 技术栈

- **前端**: HTML5, TailwindCSS, Vanilla JavaScript
- **后端**: LeanCloud (BaaS)
- **存储**: LeanCloud 数据存储
- **文件上传**: LeanCloud 文件服务

## 快速开始

### 1. LeanCloud 账号注册
1. 访问 [LeanCloud 官网](https://www.leancloud.cn/)
2. 注册账号并创建新应用
3. 在应用设置中获取以下信息：
   - App ID
   - App Key  
   - 服务器地址（Server URL）

### 2. 配置应用
1. 复制 `config.example.js` 为 `config.js`
2. 在 `app.js` 文件中修改以下配置：
```javascript
const APP_ID = 'your_app_id_here';
const APP_KEY = 'your_app_key_here';
const SERVER_URL = 'your_server_url_here';
```

### 3. 设置数据表
在 LeanCloud 控制台创建以下数据表：
- `WorkLog`：存储工作日志
  - content (String): 日志内容
  - images (Array): 图片URL数组
  - author (Pointer to _User): 发布者
  - createdAt (Date): 创建时间

### 4. 配置安全域名
在 LeanCloud 控制台的「设置 > 安全中心 > Web 安全域名」中添加：
- `localhost:8000`
- `127.0.0.1:8000`
- `file://`（用于本地文件访问）
- 你的域名（如果部署到服务器）

### 5. 网络优化说明
本项目已优化 CDN 加载：
- 使用多个 CDN 源确保 LeanCloud SDK 稳定加载
- 自动检测 SDK 加载状态并提供备用方案
- 如遇网络问题，系统会自动尝试备用 CDN 源

### 4. 部署应用

#### 本地运行

1. 将项目文件放在 Web 服务器目录中
2. 使用任意 HTTP 服务器运行，例如：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 使用 Node.js (需要安装 http-server)
   npx http-server
   
   # 使用 PHP
   php -S localhost:8000
   ```
3. 在浏览器中访问 `http://localhost:8000`

#### 在线部署

可以部署到以下平台：
- GitHub Pages
- Netlify
- Vercel
- 任意支持静态文件的服务器

## 使用说明

### 用户操作流程

1. **首次访问**: 页面会自动弹出登录框
2. **注册账号**: 点击"注册"按钮创建新账号
3. **登录**: 输入用户名和密码登录
4. **发布日志**: 登录后可以发布包含文本和图片的工作日志
   - 支持多张图片上传
   - 图片会自动压缩到1080px宽度以节省存储空间
   - 压缩过程中会显示进度提示
5. **删除日志**: 只能删除自己发布的日志，带确认提示
6. **浏览日志**: 支持无限滚动查看所有用户的日志
7. **查看图片**: 点击图片可以全屏预览

### 时间显示规则

- 1分钟内: "刚刚"
- 1-59分钟: "X分钟前"
- 1-2小时: "X小时前"
- 超过2小时: 显示具体日期时间

## 项目结构

```
工作日志/
├── index.html          # 主页面
├── app.js             # 应用逻辑
├── README.md          # 项目说明
└── config.example.js  # 配置示例文件
```

## 安全配置

### LeanCloud 安全设置

1. **域名白名单**: 在 LeanCloud 控制台设置允许的域名
2. **API 访问权限**: 配置合适的读写权限
3. **文件上传限制**: 设置文件大小和类型限制

### 推荐安全配置

```javascript
// 在 LeanCloud 控制台的云引擎中设置
AV.Cloud.beforeSave('WorkLog', (request) => {
  // 确保只有登录用户可以创建日志
  if (!request.user) {
    throw new AV.Cloud.Error('未登录用户不能发布日志');
  }
  
  // 设置作者信息
  request.object.set('author', request.user);
  request.object.set('authorName', request.user.get('username'));
});
```

## 自定义配置

### 修改页面标题和样式

编辑 `index.html` 文件中的相关内容：

```html
<title>工作日志</title> <!-- 修改页面标题 -->
<h1 class="text-xl font-semibold text-gray-800">工作日志</h1> <!-- 修改导航标题 -->
```

### 调整分页大小

在 `app.js` 中修改：

```javascript
const PAGE_SIZE = 10; // 每页显示的日志数量
```

### 自定义样式

项目使用 TailwindCSS，可以直接修改 HTML 中的 class 来调整样式。

## 常见问题

### Q: 登录时提示"应用不存在"
A: 检查 `app.js` 中的 APP_ID 是否正确配置。

### Q: 图片上传失败
A: 检查 LeanCloud 文件服务是否开启，以及文件大小是否超出限制。

### Q: 无法加载日志列表
A: 检查网络连接和 LeanCloud 服务状态，确认 SERVER_URL 配置正确。

### Q: 页面样式显示异常
A: 确认 TailwindCSS CDN 链接可以正常访问。

## 开发计划

- [x] 添加日志删除功能（权限控制，只能删除自己的日志）
- [ ] 添加日志编辑功能
- [ ] 支持日志分类和标签
- [ ] 添加搜索功能
- [ ] 支持 Markdown 格式
- [ ] 添加评论功能
- [ ] 支持导出功能

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License

## 联系方式

如有问题，请通过 GitHub Issues 联系。
