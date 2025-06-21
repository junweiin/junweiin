/**
 * 工作日志应用主文件
 * 功能：用户认证、日志发布、无限滚动加载
 */

// LeanCloud 配置
const APP_ID = 'epbCQbfBnJNaZv0O5CCLacgJ-gzGzoHsz'; // 请替换为你的 LeanCloud App ID
const APP_KEY = '9atvXPb61ih8GXsOVHD8dRCh'; // 请替换为你的 LeanCloud App Key
const SERVER_URL = 'https://epbcqbfb.lc-cn-n1-shared.com'; // 请替换为你的 LeanCloud 服务器地址

/**
 * 初始化 LeanCloud SDK
 * 检测 SDK 是否加载成功，如果失败则显示错误信息
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
let isLoading = false;
let hasMoreData = true;
let currentPage = 0;
const PAGE_SIZE = 10;

// DOM 元素
const elements = {
    loginModal: document.getElementById('loginModal'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    closeModal: document.getElementById('closeModal'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    showRegisterBtn: document.getElementById('showRegisterBtn'),
    showLoginBtn: document.getElementById('showLoginBtn'),
    modalTitle: document.getElementById('modalTitle'),
    userInfo: document.getElementById('userInfo'),
    username: document.getElementById('username'),
    realName: document.getElementById('realName'),
    editRealNameBtn: document.getElementById('editRealNameBtn'),
    editRealNameModal: document.getElementById('editRealNameModal'),
    editRealNameForm: document.getElementById('editRealNameForm'),
    newRealName: document.getElementById('newRealName'),
    cancelEditRealName: document.getElementById('cancelEditRealName'),
    postSection: document.getElementById('postSection'),
    postForm: document.getElementById('postForm'),
    postContent: document.getElementById('postContent'),
    imageInput: document.getElementById('imageInput'),
    logsList: document.getElementById('logsList'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    noMoreContent: document.getElementById('noMoreContent')
};

/**
 * 初始化应用
 */
function initApp() {
    checkCurrentUser();
    bindEvents();
    setupInfiniteScroll();
}

/**
 * 检查当前用户登录状态
 */
function checkCurrentUser() {
    currentUser = AV.User.current();
    if (currentUser) {
        showUserInterface();
        loadLogs();
    } else {
        showLoginInterface();
    }
}

/**
 * 显示用户界面
 */
function showUserInterface() {
    elements.loginBtn.classList.add('hidden');
    elements.userInfo.classList.remove('hidden');
    elements.userInfo.classList.add('flex');
    elements.postSection.classList.remove('hidden');
    
    // 显示专业功能区域
    const specialFunctionsSection = document.getElementById('specialFunctionsSection');
    if (specialFunctionsSection) {
        specialFunctionsSection.classList.remove('hidden');
    }
    
    // 更新用户信息显示
    updateUserDisplay();
    
    // 隐藏欢迎页面
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
        welcomeSection.classList.add('hidden');
    }
}

/**
 * 显示登录界面
 */
function showLoginInterface() {
    elements.loginBtn.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
    elements.postSection.classList.add('hidden');
    
    // 隐藏专业功能区域
    const specialFunctionsSection = document.getElementById('specialFunctionsSection');
    if (specialFunctionsSection) {
        specialFunctionsSection.classList.add('hidden');
    }
    
    // 显示欢迎页面
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
        welcomeSection.classList.remove('hidden');
    }
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
    // 重置为登录表单
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
    // 登录按钮
    elements.loginBtn.addEventListener('click', showLoginModal);
    
    // 关闭弹窗
    elements.closeModal.addEventListener('click', hideLoginModal);
    
    // 点击弹窗外部关闭
    elements.loginModal.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) {
            hideLoginModal();
        }
    });
    
    // 登录表单
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // 表单切换按钮
    elements.showRegisterBtn.addEventListener('click', showRegisterForm);
    elements.showLoginBtn.addEventListener('click', showLoginForm);
    
    // 注册表单提交
    elements.registerForm.addEventListener('submit', handleRegister);
    
    // 退出登录
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // 发布表单
    elements.postForm.addEventListener('submit', handlePost);
    
    // 欢迎页面登录按钮
    const welcomeLoginBtn = document.getElementById('welcomeLoginBtn');
    if (welcomeLoginBtn) {
        welcomeLoginBtn.addEventListener('click', showLoginModal);
    }
    
    // 编辑真实姓名相关事件
    elements.editRealNameBtn.addEventListener('click', showEditRealNameModal);
    elements.realName.addEventListener('click', showEditRealNameModal);
    elements.cancelEditRealName.addEventListener('click', hideEditRealNameModal);
    elements.editRealNameForm.addEventListener('submit', handleEditRealName);
    
    // 点击编辑真实姓名弹窗外部关闭
    elements.editRealNameModal.addEventListener('click', (e) => {
        if (e.target === elements.editRealNameModal) {
            hideEditRealNameModal();
        }
    });
}

/**
 * 处理登录
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
    try {
        currentUser = await AV.User.logIn(username, password);
        hideLoginModal();
        showUserInterface();
        resetLogsList();
        loadLogs();
        
        const realName = currentUser.get('realName');
        const welcomeName = realName || currentUser.get('username');
        showMessage('登录成功！欢迎回来，' + welcomeName, 'success');
        
        // 清空登录表单
        elements.loginForm.reset();
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
    
    // 验证输入
    if (!username || !realName || !password || !confirmPassword) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('密码长度至少为6位', 'error');
        return;
    }
    
    try {
        const user = new AV.User();
        user.setUsername(username);
        user.setPassword(password);
        user.set('realName', realName);
        
        currentUser = await user.signUp();
        hideLoginModal();
        showUserInterface();
        resetLogsList();
        loadLogs();
        showMessage('注册成功！欢迎 ' + realName, 'success');
        
        // 清空表单
        elements.registerForm.reset();
    } catch (error) {
        console.error('注册失败:', error);
        let errorMessage = '注册失败';
        if (error.code === 202) {
            errorMessage = '用户名已存在，请选择其他用户名';
        } else if (error.message) {
            errorMessage = '注册失败: ' + error.message;
        }
        showMessage(errorMessage, 'error');
    }
}

/**
 * 处理退出登录
 */
async function handleLogout() {
    try {
        await AV.User.logOut();
        currentUser = null;
        showLoginInterface();
        resetLogsList();
        showMessage('已退出登录', 'info');
    } catch (error) {
        console.error('退出登录失败:', error);
        showMessage('退出登录失败', 'error');
    }
}

/**
 * 处理发布日志
 */
async function handlePost(e) {
    e.preventDefault();
    
    const content = elements.postContent.value.trim();
    if (!content) {
        alert('请输入日志内容');
        return;
    }
    
    try {
        const Log = AV.Object.extend('WorkLog');
        const log = new Log();
        
        log.set('content', content);
        log.set('author', currentUser);
        // 优先使用真实姓名，如果没有则使用用户名
        const authorName = currentUser.get('realName') || currentUser.get('username');
        log.set('authorName', authorName);
        
        // 处理图片上传
        const fileCount = elements.imageInput.files.length;
        if (fileCount > 0) {
            showMessage(`正在压缩并上传 ${fileCount} 张图片...`, 'info');
        }
        
        const images = await uploadImages();
        if (images.length > 0) {
            log.set('images', images);
            showMessage(`${images.length} 张图片上传成功`, 'success');
        }
        
        await log.save();
        
        // 清空表单
        elements.postContent.value = '';
        elements.imageInput.value = '';
        
        // 重新加载日志列表
        resetLogsList();
        loadLogs();
        
        showMessage('发布成功！', 'success');
    } catch (error) {
        console.error('发布失败:', error);
        showMessage('发布失败: ' + error.message, 'error');
    }
}

/**
 * 压缩图片到指定宽度
 * @param {File} file - 原始图片文件
 * @param {number} maxWidth - 最大宽度，默认1080
 * @param {number} quality - 压缩质量，默认0.8
 * @returns {Promise<Blob>} 压缩后的图片Blob
 */
function compressImage(file, maxWidth = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // 计算压缩后的尺寸
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // 设置canvas尺寸
            canvas.width = width;
            canvas.height = height;
            
            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为Blob
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * 上传图片（带压缩功能）
 */
async function uploadImages() {
    const files = elements.imageInput.files;
    const images = [];
    
    for (let i = 0; i < files.length; i++) {
        try {
            // 压缩图片
            const compressedBlob = await compressImage(files[i]);
            
            // 创建新的文件名（保持原扩展名或使用.jpg）
            const originalName = files[i].name;
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const compressedFileName = `${nameWithoutExt}_compressed.jpg`;
            
            // 上传压缩后的图片
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
 * 重置日志列表
 */
function resetLogsList() {
    elements.logsList.innerHTML = '';
    currentPage = 0;
    hasMoreData = true;
    elements.noMoreContent.classList.add('hidden');
}

/**
 * 加载日志列表
 */
async function loadLogs() {
    if (isLoading || !hasMoreData) return;
    
    isLoading = true;
    elements.loadingIndicator.classList.remove('hidden');
    
    try {
        const query = new AV.Query('WorkLog');
        query.include('author');
        query.descending('createdAt');
        query.limit(PAGE_SIZE);
        query.skip(currentPage * PAGE_SIZE);
        
        const logs = await query.find();
        
        if (logs.length === 0) {
            hasMoreData = false;
            if (currentPage === 0) {
                elements.logsList.innerHTML = '<div class="text-center py-8 text-gray-500">暂无日志记录</div>';
            } else {
                elements.noMoreContent.classList.remove('hidden');
            }
        } else {
            logs.forEach(log => {
                renderLogItem(log);
            });
            currentPage++;
        }
    } catch (error) {
        console.error('加载日志失败:', error);
        
        // 检查是否是数据表不存在的错误
        if (error.code === 101 || error.message.includes('does not exist') || error.message.includes('404')) {
            console.log('WorkLog 数据表不存在，这是正常的（首次使用）');
            elements.logsList.innerHTML = '<div class="text-center py-8 text-gray-500">暂无日志记录，发布第一条日志吧！</div>';
            hasMoreData = false;
        } else {
            showMessage('加载日志失败: ' + error.message, 'error');
        }
    } finally {
        isLoading = false;
        elements.loadingIndicator.classList.add('hidden');
    }
}

/**
 * 渲染日志项目
 */
function renderLogItem(log) {
    const logElement = document.createElement('div');
    logElement.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4';
    
    const createdAt = log.get('createdAt');
    const timeAgo = getTimeAgo(createdAt);
    const authorName = log.get('authorName') || '匿名用户';
    const content = log.get('content');
    const images = log.get('images') || [];
    const author = log.get('author');
    
    // 检查是否为当前用户的日志
    const isCurrentUserLog = currentUser && author && currentUser.id === author.id;
    
    let imagesHtml = '';
    if (images.length > 0) {
        imagesHtml = `
            <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                ${images.map(url => `
                    <img src="${url}" alt="日志图片" class="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onclick="openImageModal('${url}')">
                `).join('')}
            </div>
        `;
    }
    
    // 删除按钮HTML（只有当前用户的日志才显示）
    const deleteButtonHtml = isCurrentUserLog ? `
        <button class="delete-log-btn text-gray-400 hover:text-red-500 transition-colors ml-2" 
                data-log-id="${log.id}" 
                title="删除日志">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        </button>
    ` : '';
    
    logElement.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                ${authorName.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-800 text-sm">${authorName}</span>
                        <span class="text-xs text-gray-500">${timeAgo}</span>
                    </div>
                    ${deleteButtonHtml}
                </div>
                <div class="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">${content}</div>
                ${imagesHtml}
            </div>
        </div>
    `;
    
    // 为删除按钮添加事件监听器
    if (isCurrentUserLog) {
        const deleteBtn = logElement.querySelector('.delete-log-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => handleDeleteLog(log.id, logElement));
        }
    }
    
    elements.logsList.appendChild(logElement);
}

/**
 * 获取相对时间
 */
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) {
        return '刚刚';
    } else if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours <= 2) {
        return `${hours}小时前`;
    } else {
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * 设置无限滚动
 */
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            loadLogs();
        }
    });
}

/**
 * 显示消息提示
 */
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 fade-in ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    }`;
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

/**
 * 处理删除日志
 */
async function handleDeleteLog(logId, logElement) {
    // 显示确认对话框
    const confirmed = confirm('确定要删除这条日志吗？删除后无法恢复。');
    
    if (!confirmed) {
        return;
    }
    
    try {
        // 显示删除中状态
        const deleteBtn = logElement.querySelector('.delete-log-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = `
                <div class="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
            `;
            deleteBtn.disabled = true;
        }
        
        // 从LeanCloud删除日志
        const logToDelete = AV.Object.createWithoutData('WorkLog', logId);
        await logToDelete.destroy();
        
        // 从DOM中移除日志元素
        logElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        logElement.style.opacity = '0';
        logElement.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            logElement.remove();
        }, 300);
        
        showMessage('日志删除成功', 'success');
        
    } catch (error) {
        console.error('删除日志失败:', error);
        showMessage('删除日志失败: ' + error.message, 'error');
        
        // 恢复删除按钮状态
        const deleteBtn = logElement.querySelector('.delete-log-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            `;
            deleteBtn.disabled = false;
        }
    }
}

/**
 * 打开图片模态框
 */
function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="max-w-4xl max-h-full p-4">
            <img src="${imageUrl}" alt="图片" class="max-w-full max-h-full object-contain">
        </div>
    `;
    
    modal.addEventListener('click', () => {
        modal.remove();
    });
    
    document.body.appendChild(modal);
}

/**
 * 显示编辑真实姓名弹窗
 */
function showEditRealNameModal() {
    const currentRealName = currentUser.get('realName') || '';
    elements.newRealName.value = currentRealName;
    elements.editRealNameModal.classList.remove('hidden');
    elements.newRealName.focus();
}

/**
 * 隐藏编辑真实姓名弹窗
 */
function hideEditRealNameModal() {
    elements.editRealNameModal.classList.add('hidden');
    elements.editRealNameForm.reset();
}

/**
 * 处理编辑真实姓名
 */
async function handleEditRealName(e) {
    e.preventDefault();
    
    const newRealName = elements.newRealName.value.trim();
    
    if (!newRealName) {
        showMessage('请输入真实姓名', 'error');
        return;
    }
    
    try {
        // 更新用户的真实姓名
        currentUser.set('realName', newRealName);
        await currentUser.save();
        
        // 更新界面显示
        updateUserDisplay();
        
        // 隐藏弹窗
        hideEditRealNameModal();
        
        showMessage('真实姓名更新成功', 'success');
    } catch (error) {
        console.error('更新真实姓名失败:', error);
        showMessage('更新失败: ' + error.message, 'error');
    }
}

/**
 * 更新用户信息显示
 */
function updateUserDisplay() {
    const realName = currentUser.get('realName');
    const username = currentUser.get('username');
    
    if (realName) {
        elements.realName.textContent = realName;
        elements.username.textContent = `(@${username})`;
    } else {
        elements.realName.textContent = username;
        elements.username.textContent = '';
    }
}

/**
 * 应用启动函数
 * 等待 DOM 和 LeanCloud SDK 都加载完成后再初始化
 */
function startApp() {
    // 检查 LeanCloud SDK 是否加载
    if (typeof AV === 'undefined') {
        console.log('等待 LeanCloud SDK 加载...');
        // 如果 SDK 未加载，等待一段时间后重试
        setTimeout(startApp, 100);
        return;
    }
    
    // 初始化 LeanCloud
    if (initLeanCloud()) {
        // SDK 初始化成功，启动应用
        initApp();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', startApp);

// 导出函数供HTML使用
window.openImageModal = openImageModal;