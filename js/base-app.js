/**
 * 工作日志应用基础类
 * 包含所有页面的公共功能和生命周期管理
 */

class BaseWorkLogApp {
    constructor(options = {}) {
        this.options = {
            pageType: 'default',
            requiredElements: [],
            ...options
        };
        
        this.elements = {};
        this.isInitialized = false;
        this.currentUser = null;
        
        // 绑定方法上下文
        this.init = this.init.bind(this);
        this.checkLoginAndStart = this.checkLoginAndStart.bind(this);
        this.handleUserLogin = this.handleUserLogin.bind(this);
        this.handleUserLogout = this.handleUserLogout.bind(this);
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log(`初始化${this.options.pageType}页面...`);
            
            // 初始化LeanCloud
            this.initLeanCloud();
            
            // 初始化DOM元素
            this.initElements();
            
            // 初始化认证模块
            WorkLogAuth.init();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 检查登录状态并启动应用
            await this.checkLoginAndStart();
            
            this.isInitialized = true;
            console.log(`${this.options.pageType}页面初始化完成`);
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            WorkLogUtils.showMessage('应用初始化失败: ' + error.message, 'error');
        }
    }

    /**
     * 初始化LeanCloud
     */
    initLeanCloud() {
        const config = WORKLOG_CONFIG.LEANCLOUD;
        AV.init({
            appId: config.APP_ID,
            appKey: config.APP_KEY,
            serverURL: config.SERVER_URL
        });
        console.log('LeanCloud初始化完成');
    }

    /**
     * 初始化DOM元素
     */
    initElements() {
        // 基础元素
        const baseElements = {
            loginModal: 'loginModal',
            loginBtn: 'loginBtn',
            logoutBtn: 'logoutBtn',
            userInfo: 'userInfo',
            appInterface: 'appInterface',
            loginPrompt: 'loginPrompt'
        };
        
        // 合并页面特定元素
        const allElements = { ...baseElements, ...this.getPageElements() };
        
        // 获取DOM元素
        for (const [key, id] of Object.entries(allElements)) {
            this.elements[key] = document.getElementById(id);
            if (!this.elements[key] && this.options.requiredElements.includes(key)) {
                console.warn(`必需的DOM元素未找到: ${id}`);
            }
        }
        
        console.log('DOM元素初始化完成');
    }

    /**
     * 获取页面特定的DOM元素（子类重写）
     * @returns {Object} 元素映射对象
     */
    getPageElements() {
        return {};
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 用户登录事件
        window.addEventListener('userLoggedIn', this.handleUserLogin);
        
        // 用户登出事件
        window.addEventListener('userLoggedOut', this.handleUserLogout);
        
        // 点击模态框外部关闭
        if (this.elements.loginModal) {
            this.elements.loginModal.addEventListener('click', (e) => {
                if (e.target === this.elements.loginModal) {
                    WorkLogAuth.hideLoginModal();
                }
            });
        }
        
        // 绑定页面特定事件
        this.bindPageEvents();
        
        console.log('事件绑定完成');
    }

    /**
     * 绑定页面特定事件（子类重写）
     */
    bindPageEvents() {
        // 子类实现
    }

    /**
     * 检查登录状态并启动应用
     */
    async checkLoginAndStart() {
        const isLoggedIn = await WorkLogAuth.checkLoginStatus();
        
        if (isLoggedIn) {
            this.currentUser = WorkLogAuth.getCurrentUser();
            this.showUserInterface();
            this.onUserLoggedIn();
        } else {
            this.showLoginPrompt();
        }
    }

    /**
     * 处理用户登录事件
     */
    handleUserLogin(event) {
        this.currentUser = event.detail;
        this.showUserInterface();
        this.onUserLoggedIn();
    }

    /**
     * 处理用户登出事件
     */
    handleUserLogout() {
        this.currentUser = null;
        this.showLoginPrompt();
        this.onUserLoggedOut();
    }

    /**
     * 用户登录后的回调（子类重写）
     */
    onUserLoggedIn() {
        // 子类实现
    }

    /**
     * 用户登出后的回调（子类重写）
     */
    onUserLoggedOut() {
        // 子类实现
    }

    /**
     * 显示用户界面
     */
    showUserInterface() {
        // 显示用户信息
        if (this.elements.userInfo) {
            this.elements.userInfo.classList.remove('hidden');
        }
        
        // 隐藏登录按钮
        if (this.elements.loginBtn) {
            this.elements.loginBtn.classList.add('hidden');
        }
        
        // 更新用户显示信息
        this.updateUserDisplay();
    }
    
    /**
     * 更新用户显示信息
     */
    updateUserDisplay() {
        const currentUser = WorkLogAuth.getCurrentUser();
        if (!currentUser) return;
        
        const username = currentUser.get('username');
        const realName = currentUser.get('realName') || username;
        
        // 更新用户名显示
        if (this.elements.username) {
            this.elements.username.textContent = username;
        }
        
        // 更新真实姓名显示
        if (this.elements.realName) {
            this.elements.realName.textContent = realName;
        }
    }

    /**
     * 显示登录提示
     */
    showLoginPrompt() {
        // 隐藏用户信息
        if (this.elements.userInfo) {
            this.elements.userInfo.classList.add('hidden');
        }
        
        // 显示登录按钮
        if (this.elements.loginBtn) {
            this.elements.loginBtn.classList.remove('hidden');
        }
    }

    /**
     * 提交工作日志的通用方法
     * @param {Object} formData - 表单数据
     * @param {Array} images - 图片URL数组
     * @param {string} content - 格式化的内容
     * @returns {Promise<Object>} 保存结果
     */
    async submitWorkLog(formData, images = [], content = '') {
        try {
            const WorkLog = AV.Object.extend('WorkLog');
            const workLog = new WorkLog();
            
            // 设置基础信息
            workLog.set('user', this.currentUser);
            workLog.set('username', this.currentUser.get('username'));
            workLog.set('pageType', this.options.pageType);
            // createdAt 是 LeanCloud 的保留字段，会自动设置，不需要手动设置
            
            // 设置数据
            workLog.set('operationData', formData);
            workLog.set('images', images);
            workLog.set('content', content);
            
            // 保存到LeanCloud
            const result = await workLog.save(null, {
                timeout: WORKLOG_CONFIG.APP.SAVE_TIMEOUT
            });
            
            console.log('工作日志保存成功:', result);
            return result;
            
        } catch (error) {
            console.error('工作日志保存失败:', error);
            throw error;
        }
    }

    /**
     * 重置表单的通用方法
     * @param {string} formId - 表单ID
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            
            // 清除图片预览
            const previewContainer = form.querySelector('.photo-preview');
            if (previewContainer) {
                previewContainer.innerHTML = '';
            }
            
            // 重置文件输入
            const fileInputs = form.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                input.value = '';
            });
            
            console.log('表单已重置');
        }
    }

    /**
     * 获取当前用户
     * @returns {Object|null} 当前用户对象
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 销毁应用（清理事件监听器等）
     */
    destroy() {
        window.removeEventListener('userLoggedIn', this.handleUserLogin);
        window.removeEventListener('userLoggedOut', this.handleUserLogout);
        console.log('应用已销毁');
    }
}

// 导出基础应用类（兼容全局使用）
if (typeof window !== 'undefined') {
    window.BaseWorkLogApp = BaseWorkLogApp;
}