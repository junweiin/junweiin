# 相润金鹏酒店啤酒龙虾烧烤美食节H5项目

## 一、项目概述
本项目是为相润金鹏酒店啤酒龙虾烧烤美食节设计的移动端H5页面，旨在通过朋友圈传播，吸引用户参与活动。页面突出美食节主题，展示套餐优惠，并提供预约、导航等功能。

## 二、核心需求
朋友圈传播的移动端H5页面，突出「相润金鹏酒店啤酒龙虾烧烤美食节」主题，包含以下要素：
- 倒计时抢鲜功能
- 套餐优惠展示（蒜泥、十三香、香辣任选，共计4斤，送精美凉菜两份（指定）指定啤酒惊爆价1元/瓶
- 定位导航按钮
- 立即预约悬浮按钮
- 社交分享功能（朋友圈专属优惠）

## 三、视觉风格
1. **主色调**：火焰红（#FF4500）+ 鎏金（#FFD700）+ 深海蓝（#000080）
2. **字体**：标题用方正粗宋，正文用思源黑体
3. **动效**： 
   - 首屏烧烤烟雾飘动效果
   - 虾蟹食材入场弹跳动画
   - 啤酒杯碰杯粒子效果

## 四、页面结构
### 1. 首屏（折叠区）
![](.assets/header-bg.jpg) <!-- 需准备烧烤派对背景图 -->
- 大字标题：盛夏味蕾狂欢节
- 副标题：啤酒1元/瓶 × 龙虾4斤 × 凉菜2份
- 倒计时组件：开幕2025年4月26日-2025年6月30日

### 2. 套餐展示（横向滑动）
采用卡片式设计，每张卡片包含：
- 套餐价格（原价划掉显示优惠价98元）
- 包含菜品图文列表
- "立即抢购"按钮（点击跳转预约）

### 3. 优惠信息
- 兑换券98元
- 有效期显示

### 4. 导航地址
- 安徽省淮北市新型煤化工合成材料基地北路16号相润金鹏酒店
- 联系电话：0561-3086666
- 导航按钮（点击可跳转到地图应用）

### 5. 电子兑换券
- 线上预约兑换券
- 二维码（可扫描兑换）
- 兑换码（可手动输入）：XRJP2025

### 6. 预约功能
- 悬浮预约按钮
- 预约表单（姓名、手机号、日期、人数、套餐选择）

### 7. 分享功能
- 分享提示浮层
- 朋友圈专属优惠提示

## 五、技术实现

### 1. 技术栈
- HTML5 + CSS3 + JavaScript
- Swiper 8.0 轮播组件
- 响应式设计，适配各种移动设备

### 2. 关键组件实现

#### 倒计时组件
```html
<!-- 倒计时组件 -->
<div class="countdown-container">
  <p class="countdown-title">美食节倒计时</p>
  <div class="countdown">
    <div class="countdown-item">
      <span id="days">00</span>
      <span class="countdown-label">天</span>
    </div>
    <div class="countdown-item">
      <span id="hours">00</span>
      <span class="countdown-label">时</span>
    </div>
    <div class="countdown-item">
      <span id="minutes">00</span>
      <span class="countdown-label">分</span>
    </div>
    <div class="countdown-item">
      <span id="seconds">00</span>
      <span class="countdown-label">秒</span>
    </div>
  </div>
  <p class="event-date">开幕：2025年4月26日-2025年6月30日</p>
</div>
```

#### 套餐轮播
```html
<!-- 套餐展示区域 -->
<section class="package-section">
  <h2 class="section-title">精选套餐</h2>
  <div class="swiper package-swiper">
    <div class="swiper-wrapper">
      <!-- 套餐卡片内容 -->
    </div>
    <div class="swiper-pagination"></div>
  </div>
</section>
```

#### 预约按钮与弹窗
```html
<!-- 悬浮预约按钮 -->
<div class="float-btn">
  <img src="./images/beer-icon.svg" alt="啤酒图标">
  <button id="book-now-btn">立即预约</button>
</div>

<!-- 预约弹窗 -->
<div class="modal" id="booking-modal">
  <!-- 预约表单内容 -->
</div>
```

### 3. JavaScript功能
- 倒计时计算与显示
- Swiper轮播初始化与配置
- 预约表单验证与提交
- 导航功能（调用地图应用）
- 分享提示显示控制

## 六、项目文件结构
```
/
├── index.html          # 主页面
├── css/                # 样式文件目录
│   └── style.css       # 主样式文件
├── js/                 # JavaScript文件目录
│   └── main.js         # 主脚本文件
├── images/             # 图片资源目录
│   ├── garlic-flavor.jpg       # 蒜泥口味图片
│   ├── thirteen-spices.jpg     # 十三香口味图片
│   ├── spicy-flavor.jpg        # 香辣口味图片
│   ├── beer-icon.svg           # 啤酒图标
│   ├── location-icon.svg       # 位置图标
│   ├── qr-code.svg             # 二维码
│   └── share-arrow.svg         # 分享箭头
└── readme.md           # 项目说明文档
```

## 七、使用说明

### 开发环境
1. 使用现代浏览器打开index.html文件即可预览
2. 推荐使用Chrome开发者工具的移动设备模拟功能进行调试

### 部署说明
1. 将所有文件上传至Web服务器
2. 确保文件结构保持不变
3. 通过域名或IP地址访问index.html

### 注意事项
- 确保服务器支持HTTPS（微信分享需要）
- 图片资源需要提前准备并放入images目录
- 实际上线前需要完善JS交互功能

## 八、后续优化方向
1. 添加用户预约数据的后端存储
2. 优化页面加载速度，压缩资源文件
3. 增加更多动效，提升用户体验
4. 添加数据统计功能，跟踪转化率
5. 完善微信分享功能，支持自定义分享标题和图片


## git
### 添加所有文件到暂存区
git add .
### 推送到GitHub（强制使用main分支）
git push -f origin HEAD:main