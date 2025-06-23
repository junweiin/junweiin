/**
 * 净水器操作记录应用
 * 功能：用户认证、净水器设备状态记录、水位监测、加压泵组状态记录、图片上传
 */

// LeanCloud 配置（与主应用保持一致）
const APP_ID = 'epbCQbfBnJNaZv0O5CCLacgJ-gzGzoHsz';
const APP_KEY = '9atvXPb61ih8GXsOVHD8dRCh';
const SERVER_URL = 'https://epbcqbfb.lc-cn-n1-shared.com';

/**
 * 初始化 LeanCloud SDK
 */
function initLeanCloud() {
    if (typeof AV === 'undefined') {
        console.error('LeanCloud SDK 未加载成功');
        showMessage('LeanCloud SDK 加载失败，请检查网络连接后刷新页面', 'error');
        return false;
    }
    
    try {
        AV.init({
            appId: APP_ID,
            appKey: APP_KEY,
            serverURL: SERVER_URL
        });
        console.log('LeanCloud SDK 初始化成功');
        return true;
    } catch (error) {
        console.error('LeanCloud SDK 初始化失败:', error);
        showMessage('LeanCloud SDK 初始化失败: ' + error.message, 'error');
        return false;
    }
}

// 全局变量
let currentUser = null;

// DOM 元素
const elements = {
    // 导航和用户相关
    backBtn: document.getElementById('backBtn'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
    realName: document.getElementById('realName'),
    
    // 页面区域
    loginPrompt: document.getElementById('loginPrompt'),
    operationSection: document.getElementById('operationSection'),
    promptLoginBtn: document.getElementById('promptLoginBtn'),
    
    // 登录弹窗
    loginModal: document.getElementById('loginModal'),
    closeModal: document.getElementById('closeModal'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    showRegisterBtn: document.getElementById('showRegisterBtn'),
    showLoginBtn: document.getElementById('showLoginBtn'),
    modalTitle: document.getElementById('modalTitle'),
    
    // 净水器设备控制
    waterFilterSwitch: document.getElementById('waterFilterSwitch'),
    
    // 水位监测
    tapWaterLevel: document.getElementById('tapWaterLevel'),
    purifiedWaterLevel: document.getElementById('purifiedWaterLevel'),
    
    // 加压泵组控制
    rdBuildingPump: document.getElementById('rdBuildingPump'),
    highZonePump: document.getElementById('highZonePump'),
    lowZonePump: document.getElementById('lowZonePump'),
    
    // 图片上传
    imageInput: document.getElementById('imageInput'),
    imagePreview: document.getElementById('imagePreview'),
    
    // 提交按钮
    submitBtn: document.getElementById('submitBtn')
};

/**
 * 初始化应用
 */
function initApp() {
    checkCurrentUser();
    bindEvents();
    setupImagePreview();
}

/**
 * 检查当前用户登录状态
 * 添加延迟确保LeanCloud SDK完全初始化
 */
function checkCurrentUser() {
    // 给LeanCloud SDK一些时间来恢复用户状态
    setTimeout(() => {
        currentUser = AV.User.current();
        if (currentUser) {
            showOperationInterface();
        } else {
            showLoginPrompt();
        }
    }, 100); // 100ms延迟通常足够
}

/**
 * 显示操作界面
 */
function showOperationInterface() {
    elements.loginBtn.classList.add('hidden');
    elements.userInfo.classList.remove('hidden');
    elements.userInfo.classList.add('flex');
    elements.loginPrompt.classList.add('hidden');
    elements.operationSection.classList.remove('hidden');
    
    // 更新用户信息显示
    const authorName = currentUser.get('realName') || currentUser.get('username');
    elements.realName.textContent = authorName;
}

/**
 * 显示登录提示
 */
function showLoginPrompt() {
    elements.loginBtn.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
    elements.loginPrompt.classList.remove('hidden');
    elements.operationSection.classList.add('hidden');
}

/**
 * 显示登录弹窗
 */
function showLoginModal() {
    elements.loginModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * 隐藏登录弹窗
 */
function hideLoginModal() {
    elements.loginModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    showLoginForm();
}

/**
 * 显示注册表单
 */
function showRegisterForm() {
    elements.loginForm.classList.add('hidden');
    elements.registerForm.classList.remove('hidden');
    elements.modalTitle.textContent = '注册新账号';
}

/**
 * 显示登录表单
 */
function showLoginForm() {
    elements.registerForm.classList.add('hidden');
    elements.loginForm.classList.remove('hidden');
    elements.modalTitle.textContent = '登录';
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
    // 返回按钮
    elements.backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // 登录相关
    elements.loginBtn.addEventListener('click', showLoginModal);
    elements.promptLoginBtn.addEventListener('click', showLoginModal);
    elements.closeModal.addEventListener('click', hideLoginModal);
    elements.loginModal.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) {
            hideLoginModal();
        }
    });
    
    // 表单切换
    elements.showRegisterBtn.addEventListener('click', showRegisterForm);
    elements.showLoginBtn.addEventListener('click', showLoginForm);
    
    // 表单提交
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    
    // 退出登录
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // 提交操作记录
    elements.submitBtn.addEventListener('click', handleSubmit);
}

/**
 * 处理登录
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('请填写完整的登录信息', 'error');
        return;
    }
    
    try {
        currentUser = await AV.User.logIn(username, password);
        hideLoginModal();
        showOperationInterface();
        showMessage('登录成功！', 'success');
    } catch (error) {
        console.error('登录失败:', error);
        showMessage('登录失败: ' + error.message, 'error');
    }
}

/**
 * 处理注册
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const realName = document.getElementById('registerRealName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !realName || !password || !confirmPassword) {
        showMessage('请填写完整的注册信息', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }
    
    try {
        const user = new AV.User();
        user.setUsername(username);
        user.setPassword(password);
        user.set('realName', realName);
        
        currentUser = await user.signUp();
        hideLoginModal();
        showOperationInterface();
        showMessage('注册成功！', 'success');
    } catch (error) {
        console.error('注册失败:', error);
        showMessage('注册失败: ' + error.message, 'error');
    }
}

/**
 * 处理退出登录
 */
async function handleLogout() {
    try {
        await AV.User.logOut();
        currentUser = null;
        showLoginPrompt();
        showMessage('已退出登录', 'info');
    } catch (error) {
        console.error('退出登录失败:', error);
        showMessage('退出登录失败: ' + error.message, 'error');
    }
}

/**
 * 设置图片预览功能
 */
function setupImagePreview() {
    elements.imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            showImagePreview(files);
        }
    });
}

/**
 * 显示图片预览
 */
function showImagePreview(files) {
    elements.imagePreview.innerHTML = '';
    elements.imagePreview.classList.remove('hidden');
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'w-full h-24 object-cover rounded-lg';
            img.alt = `预览图片 ${index + 1}`;
            elements.imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 压缩图片
 */
function compressImage(file, maxWidth = 1080, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

/**
 * 上传图片到 LeanCloud
 */
async function uploadImages() {
    const files = Array.from(elements.imageInput.files);
    if (files.length === 0) return [];
    
    const uploadPromises = files.map(async (file) => {
        try {
            const compressedFile = await compressImage(file);
            const avFile = new AV.File(`waterfilter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`, compressedFile);
            const savedFile = await avFile.save();
            return savedFile.url();
        } catch (error) {
            console.error('图片上传失败:', error);
            throw error;
        }
    });
    
    return Promise.all(uploadPromises);
}

/**
 * 收集操作数据
 */
function collectOperationData() {
    return {
        // 净水器设备状态
        waterFilterSwitch: elements.waterFilterSwitch.checked,
        
        // 水位监测数据
        tapWaterLevel: parseFloat(elements.tapWaterLevel.value) || null,
        purifiedWaterLevel: parseFloat(elements.purifiedWaterLevel.value) || null,
        
        // 加压泵组状态
        rdBuildingPump: elements.rdBuildingPump.checked,
        highZonePump: elements.highZonePump.checked,
        lowZonePump: elements.lowZonePump.checked,
        
        // 时间戳
        timestamp: new Date().toISOString()
    };
}

/**
 * 将操作数据格式化为文本
 */
function formatOperationDataToText(data) {
    const formatTime = new Date(data.timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let content = `净水器操作记录 - ${formatTime}\n\n`;
    
    // 设备状态
    content += '=== 净水器设备状态 ===\n';
    content += `净水器开关: ${data.waterFilterSwitch ? '开启' : '关闭'}\n\n`;
    
    // 水位监测
    content += '=== 水位监测 ===\n';
    content += `自来水箱水位: ${data.tapWaterLevel !== null ? data.tapWaterLevel + '%' : '未记录'}\n`;
    content += `纯净水箱水位: ${data.purifiedWaterLevel !== null ? data.purifiedWaterLevel + '%' : '未记录'}\n\n`;
    
    // 加压泵组状态
    content += '=== 加压泵组状态 ===\n';
    content += `研发楼加压泵: ${data.rdBuildingPump ? '运行' : '停止'}\n`;
    content += `高区加压泵: ${data.highZonePump ? '运行' : '停止'}\n`;
    content += `低区加压泵: ${data.lowZonePump ? '运行' : '停止'}\n\n`;
    
    return content;
}

/**
 * 处理提交操作记录
 */
async function handleSubmit() {
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    // 禁用提交按钮，防止重复提交
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = '提交中...';
    
    try {
        // 收集操作数据
        const operationData = collectOperationData();
        
        // 上传图片
        let imageUrls = [];
        if (elements.imageInput.files.length > 0) {
            showMessage('正在上传图片...', 'info');
            imageUrls = await uploadImages();
        }
        
        // 格式化数据为文本
        let content = formatOperationDataToText(operationData);
        
        // 添加图片信息
        if (imageUrls.length > 0) {
            content += '=== 现场照片 ===\n';
            imageUrls.forEach((url, index) => {
                content += `图片${index + 1}: ${url}\n`;
            });
        }
        
        // 保存到 LeanCloud WorkLog 表
        const WorkLog = AV.Object.extend('WorkLog');
        const workLog = new WorkLog();
        
        workLog.set('content', content);
        workLog.set('author', currentUser.get('realName') || currentUser.get('username'));
        workLog.set('type', '净水器操作记录');
        workLog.set('images', imageUrls);
        workLog.set('operationData', operationData);
        
        await workLog.save();
        
        showMessage('净水器操作记录提交成功！', 'success');
        resetForm();
        
    } catch (error) {
        console.error('提交失败:', error);
        showMessage('提交失败: ' + error.message, 'error');
    } finally {
        // 恢复提交按钮
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = '提交操作记录';
    }
}

/**
 * 重置表单
 */
function resetForm() {
    // 重置设备开关
    elements.waterFilterSwitch.checked = false;
    
    // 重置水位输入
    elements.tapWaterLevel.value = '';
    elements.purifiedWaterLevel.value = '';
    
    // 重置加压泵组开关
    elements.rdBuildingPump.checked = false;
    elements.highZonePump.checked = false;
    elements.lowZonePump.checked = false;
    
    // 重置图片上传
    elements.imageInput.value = '';
    elements.imagePreview.innerHTML = '';
    elements.imagePreview.classList.add('hidden');
}

/**
 * 显示消息提示
 */
function showMessage(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

/**
 * 启动应用
 */
function startApp() {
    if (initLeanCloud()) {
        // 等待 DOM 完全加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }
    }
}

// 启动应用
startApp();