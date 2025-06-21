/**
 * 空调机房操作记录应用
 * 功能：用户认证、设备状态记录、温度数据记录、图片上传
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
    
    // 设备控制
    chilledWaterPump: document.getElementById('chilledWaterPump'),
    coolingWaterPump: document.getElementById('coolingWaterPump'),
    
    // 温度和压力输入
    chilledWaterInletTemp: document.getElementById('chilledWaterInletTemp'),
    chilledWaterOutletTemp: document.getElementById('chilledWaterOutletTemp'),
    highTempGeneratorTemp: document.getElementById('highTempGeneratorTemp'),
    coolingWaterInletTemp: document.getElementById('coolingWaterInletTemp'),
    coolingWaterOutletTemp: document.getElementById('coolingWaterOutletTemp'),
    vacuumPressure: document.getElementById('vacuumPressure'),
    
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
        showMessage('请输入用户名和密码', 'error');
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
        showMessage('请填写所有字段', 'error');
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
        showMessage('已退出登录', 'success');
    } catch (error) {
        console.error('退出登录失败:', error);
        showMessage('退出登录失败: ' + error.message, 'error');
    }
}

/**
 * 设置图片预览
 */
function setupImagePreview() {
    elements.imageInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            showImagePreview(files);
        } else {
            elements.imagePreview.classList.add('hidden');
        }
    });
}

/**
 * 显示图片预览
 */
function showImagePreview(files) {
    elements.imagePreview.innerHTML = '';
    elements.imagePreview.classList.remove('hidden');
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
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
 * 压缩图片到指定宽度
 */
function compressImage(file, maxWidth = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * 上传图片
 */
async function uploadImages() {
    const files = elements.imageInput.files;
    const images = [];
    
    for (let i = 0; i < files.length; i++) {
        try {
            const compressedBlob = await compressImage(files[i]);
            const originalName = files[i].name;
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const compressedFileName = `aircondition_${nameWithoutExt}_compressed.jpg`;
            
            const file = new AV.File(compressedFileName, compressedBlob);
            const savedFile = await file.save();
            images.push(savedFile.url());
            
            console.log(`图片 ${originalName} 压缩并上传成功`);
        } catch (error) {
            console.error('图片压缩或上传失败:', error);
            showMessage(`图片 ${files[i].name} 处理失败`, 'error');
        }
    }
    
    return images;
}

/**
 * 收集操作数据
 */
function collectOperationData() {
    const data = {
        deviceName: '空调机房',
        equipmentStatus: {
            chilledWaterPump: elements.chilledWaterPump.checked ? '开' : '关',
            coolingWaterPump: elements.coolingWaterPump.checked ? '开' : '关'
        },
        temperatureData: {
            chilledWaterInletTemp: elements.chilledWaterInletTemp.value || null,
            chilledWaterOutletTemp: elements.chilledWaterOutletTemp.value || null,
            highTempGeneratorTemp: elements.highTempGeneratorTemp.value || null,
            coolingWaterInletTemp: elements.coolingWaterInletTemp.value || null,
            coolingWaterOutletTemp: elements.coolingWaterOutletTemp.value || null,
            vacuumPressure: elements.vacuumPressure.value || null
        },
        timestamp: new Date().toLocaleString('zh-CN')
    };
    
    return data;
}

/**
 * 格式化操作数据为文本
 */
function formatOperationDataToText(data) {
    let text = `【${data.deviceName}操作记录】\n`;
    text += `记录时间：${data.timestamp}\n\n`;
    
    text += `设备状态：\n`;
    text += `- 冷冻水泵：${data.equipmentStatus.chilledWaterPump}\n`;
    text += `- 冷却水泵：${data.equipmentStatus.coolingWaterPump}\n\n`;
    
    text += `温度和压力数据：\n`;
    if (data.temperatureData.chilledWaterInletTemp) {
        text += `- 冷水入口温度：${data.temperatureData.chilledWaterInletTemp}°C\n`;
    }
    if (data.temperatureData.chilledWaterOutletTemp) {
        text += `- 冷水出口温度：${data.temperatureData.chilledWaterOutletTemp}°C\n`;
    }
    if (data.temperatureData.highTempGeneratorTemp) {
        text += `- 高温发生器温度：${data.temperatureData.highTempGeneratorTemp}°C\n`;
    }
    if (data.temperatureData.coolingWaterInletTemp) {
        text += `- 冷却水入口温度：${data.temperatureData.coolingWaterInletTemp}°C\n`;
    }
    if (data.temperatureData.coolingWaterOutletTemp) {
        text += `- 冷却水出口温度：${data.temperatureData.coolingWaterOutletTemp}°C\n`;
    }
    if (data.temperatureData.vacuumPressure) {
        text += `- 真空压力：${data.temperatureData.vacuumPressure}kPa\n`;
    }
    
    return text;
}

/**
 * 处理提交操作记录
 */
async function handleSubmit() {
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    // 收集数据
    const operationData = collectOperationData();
    
    // 检查是否有数据输入
    const hasEquipmentData = elements.chilledWaterPump.checked || elements.coolingWaterPump.checked;
    const hasTemperatureData = Object.values(operationData.temperatureData).some(value => value !== null);
    const hasImages = elements.imageInput.files.length > 0;
    
    if (!hasEquipmentData && !hasTemperatureData && !hasImages) {
        showMessage('请至少填写一项数据或上传图片', 'error');
        return;
    }
    
    try {
        // 显示提交中状态
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = '提交中...';
        
        // 创建WorkLog记录
        const Log = AV.Object.extend('WorkLog');
        const log = new Log();
        
        // 格式化内容
        const content = formatOperationDataToText(operationData);
        log.set('content', content);
        log.set('author', currentUser);
        
        // 优先使用真实姓名
        const authorName = currentUser.get('realName') || currentUser.get('username');
        log.set('authorName', authorName);
        
        // 处理图片上传
        const fileCount = elements.imageInput.files.length;
        if (fileCount > 0) {
            showMessage(`正在压缩并上传 ${fileCount} 张图片...`, 'info');
            const images = await uploadImages();
            if (images.length > 0) {
                log.set('images', images);
                showMessage(`${images.length} 张图片上传成功`, 'success');
            }
        }
        
        // 保存记录
        await log.save();
        
        // 重置表单
        resetForm();
        
        showMessage('操作记录提交成功！', 'success');
    } catch (error) {
        console.error('提交失败:', error);
        showMessage('提交失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮状态
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = '提交操作记录';
    }
}

/**
 * 重置表单
 */
function resetForm() {
    // 重置开关
    elements.chilledWaterPump.checked = false;
    elements.coolingWaterPump.checked = false;
    
    // 重置温度输入
    elements.chilledWaterInletTemp.value = '';
    elements.chilledWaterOutletTemp.value = '';
    elements.highTempGeneratorTemp.value = '';
    elements.coolingWaterInletTemp.value = '';
    elements.coolingWaterOutletTemp.value = '';
    elements.vacuumPressure.value = '';
    
    // 重置图片
    elements.imageInput.value = '';
    elements.imagePreview.classList.add('hidden');
    elements.imagePreview.innerHTML = '';
}

/**
 * 显示消息提示
 */
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
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
    if (!initLeanCloud()) {
        return;
    }
    
    // 等待DOM完全加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
}

// 启动应用
startApp();