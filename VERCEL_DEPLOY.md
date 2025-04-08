# 将项目部署到Vercel的步骤

## 准备工作

1. **创建Git仓库**
   - 在GitHub或GitLab上创建一个新的仓库
   - 将项目代码推送到该仓库

```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "初始提交：啤酒龙虾烧烤美食节H5项目"

# 添加远程仓库（替换为你的GitHub仓库URL）
git remote add origin https://github.com/你的用户名/xiangrun-beer-crayfish-festival.git

# 推送到远程仓库
git push -u origin main
```

## 部署到Vercel

1. **注册Vercel账号**
   - 访问 [Vercel官网](https://vercel.com/)
   - 使用GitHub、GitLab或邮箱注册账号

2. **导入项目**
   - 登录Vercel后，点击"New Project"按钮
   - 选择你刚刚创建的Git仓库
   - 如果没有看到你的仓库，可能需要先导入或授权Vercel访问

3. **配置项目**
   - **项目名称**: 可以使用默认名称或自定义
   - **框架预设**: 选择"Other"（因为这是一个静态HTML项目）
   - **构建设置**:
     - 构建命令: 留空（或使用`npm run build`）
     - 输出目录: 留空（默认为根目录）
     - 安装命令: `npm install`（如果需要）

4. **环境变量**
   - 本项目不需要设置环境变量

5. **点击部署**
   - 点击"Deploy"按钮开始部署
   - Vercel会自动构建并部署你的项目

6. **查看部署结果**
   - 部署完成后，Vercel会提供一个可访问的URL（例如：https://xiangrun-beer-crayfish-festival.vercel.app）
   - 点击该URL查看你的网站

## 自定义域名（可选）

1. **添加自定义域名**
   - 在Vercel项目控制台中，点击"Settings" > "Domains"
   - 输入你的域名并点击"Add"
   - 按照Vercel提供的说明配置DNS记录

## 持续部署

- 每次你向Git仓库推送更改时，Vercel会自动重新构建并部署你的项目
- 你可以在Vercel控制台中查看所有的部署历史

## 注意事项

- 本项目已经包含了`package.json`和`vercel.json`文件，这些文件会帮助Vercel正确识别和部署项目
- 静态资源（如图片、CSS和JavaScript文件）会自动部署
- Vercel免费计划对个人项目足够使用，但有一定的限制，如需更多功能可以升级到付费计划