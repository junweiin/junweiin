/**
 * 工作日志应用认证模块
 * 包含用户登录、注册、登出等认证相关功能
 */

const WorkLogAuth = {
    /**
     * 初始化认证模块
     */
    init() {
        this.bindEvents();
    },

    /**
     * 绑定认证相关事件
     */
    bindEvents() {
        // 登录按钮 - 显示登录模态框
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }

        // 立即开始按钮 - 显示登录模态框
        const welcomeLoginBtn = document.getElementById('welcomeLoginBtn');
        if (welcomeLoginBtn) {
            welcomeLoginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }

        // 关闭模态框按钮
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }

        // 登录表单提交
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 注册表单提交
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // 登出按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // 切换登录/注册表单
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');
        
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => {
                this.showRegisterForm();
            });
        }
        
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                this.showLoginForm();
            });
        }
    },

    /**
     * 检查用户登录状态
     * @returns {Promise<boolean>} 是否已登录
     */
    async checkLoginStatus() {
        try {
            const currentUser = AV.User.current();
            if (currentUser) {
                console.log('用户已登录:', currentUser.get('username'));
                return true;
            } else {
                console.log('用户未登录');
                return false;
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            return false;
        }
    },

    /**
     * 处理用户登录
     */
    async handleLogin() {
        const username = document.getElementById('loginUsername')?.value?.trim();
        const password = document.getElementById('loginPassword')?.value;
        
        if (!username || !password) {
            WorkLogUtils.showMessage('请输入用户名和密码', 'warning');
            return;
        }
        
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalText = submitBtn?.textContent;
        
        try {
            if (submitBtn) {
                submitBtn.textContent = '登录中...';
                submitBtn.disabled = true;
            }
            
            const user = await AV.User.logIn(username, password);
            console.log('登录成功:', user.get('username'));
            
            WorkLogUtils.showMessage('登录成功！', 'success');
            this.hideLoginModal();
            
            // 触发登录成功事件
            window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
            
        } catch (error) {
            console.error('登录失败:', error);
            WorkLogUtils.showMessage('登录失败: ' + error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    },

    /**
     * 处理用户注册
     */
    async handleRegister() {
        const username = document.getElementById('registerUsername')?.value?.trim();
        const realName = document.getElementById('registerRealName')?.value?.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        if (!username || !realName || !password || !confirmPassword) {
            WorkLogUtils.showMessage('请填写完整信息', 'warning');
            return;
        }
        
        if (password !== confirmPassword) {
            WorkLogUtils.showMessage('两次输入的密码不一致', 'warning');
            return;
        }
        
        if (password.length < 6) {
            WorkLogUtils.showMessage('密码长度至少6位', 'warning');
            return;
        }
        
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        const originalText = submitBtn?.textContent;
        
        try {
            if (submitBtn) {
                submitBtn.textContent = '注册中...';
                submitBtn.disabled = true;
            }
            
            const user = new AV.User();
            user.setUsername(username);
            user.setPassword(password);
            user.set('realName', realName);
            
            await user.signUp();
            console.log('注册成功:', user.get('username'));
            
            WorkLogUtils.showMessage('注册成功！请登录', 'success');
            this.showLoginForm();
            
        } catch (error) {
            console.error('注册失败:', error);
            WorkLogUtils.showMessage('注册失败: ' + error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    },

    /**
     * 处理用户登出
     */
    async handleLogout() {
        try {
            await AV.User.logOut();
            console.log('用户已登出');
            WorkLogUtils.showMessage('已退出登录', 'info');
            
            // 触发登出事件
            window.dispatchEvent(new CustomEvent('userLoggedOut'));
            
        } catch (error) {
            console.error('登出失败:', error);
            WorkLogUtils.showMessage('登出失败: ' + error.message, 'error');
        }
    },

    /**
     * 显示登录模态框
     */
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.showLoginForm();
        }
    },

    /**
     * 隐藏登录模态框
     */
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('hidden');
            this.clearForms();
        }
    },

    /**
     * 显示登录表单
     */
    showLoginForm() {
        const loginForm = document.getElementById('loginFormContainer');
        const registerForm = document.getElementById('registerFormContainer');
        
        if (loginForm && registerForm) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
    },

    /**
     * 显示注册表单
     */
    showRegisterForm() {
        const loginForm = document.getElementById('loginFormContainer');
        const registerForm = document.getElementById('registerFormContainer');
        
        if (loginForm && registerForm) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    },

    /**
     * 清空表单
     */
    clearForms() {
        const forms = ['loginForm', 'registerForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.reset();
            }
        });
    },

    /**
     * 获取当前用户信息
     * @returns {Object|null} 当前用户对象
     */
    getCurrentUser() {
        return AV.User.current();
    },

    /**
     * 获取当前用户名
     * @returns {string|null} 当前用户名
     */
    getCurrentUsername() {
        const user = this.getCurrentUser();
        return user ? user.get('username') : null;
    }
};

// 导出认证模块（兼容全局使用）
if (typeof window !== 'undefined') {
    window.WorkLogAuth = WorkLogAuth;
}