/*
 * 维修登记模块 - 实现维修登记功能
 * 继承自BaseWorkLogApp，实现维修登记特定功能
 */

class RepairApp extends BaseWorkLogApp {
    constructor() {
        const config = {
            pageType: 'repair',
            requiredElements: ['repairSection', 'submitBtn']
        };
        
        super(config);
        
        // 保存配置到实例
        this.config = config;

        // 绑定方法上下文
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateUserDisplay = this.updateUserDisplay.bind(this);
    }

    /**
     * 获取页面特定的DOM元素
     */
    getPageElements() {
        return {
            // 导航和用户相关
            backBtn: 'backBtn',
            realName: 'realName',
            loginBtn: 'loginBtn',
            userInfo: 'userInfo',
            logoutBtn: 'logoutBtn',
            
            // 页面区域
            repairSection: 'repairSection',
            loginPrompt: 'loginPrompt',
            promptLoginBtn: 'promptLoginBtn',
            
            // 登录弹窗
            closeModal: 'closeModal',
            loginForm: 'loginForm',
            registerForm: 'registerForm',
            modalTitle: 'modalTitle',
            showRegisterBtn: 'showRegisterBtn',
            showLoginBtn: 'showLoginBtn',
            
            // 报修信息字段
            serialNumber: 'serialNumber',
            repairSource: 'repairSource',
            department: 'department',
            reporter: 'reporter',
            room: 'room',
            description: 'description',
            status: 'status',
            assignee: 'assignee'
        };
    }

    /**
     * 绑定页面特定事件
     */
    bindPageEvents() {
        // 基础元素事件绑定（从父类继承）
        
        // 返回按钮
        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        // 登录相关事件
        if (this.elements.loginBtn) {
            this.elements.loginBtn.addEventListener('click', () => {
                WorkLogAuth.showLoginModal();
            });
        }
        
        // 登录提示按钮
        if (this.elements.promptLoginBtn) {
            this.elements.promptLoginBtn.addEventListener('click', () => {
                WorkLogAuth.showLoginModal();
            });
        }
        
        // 关闭模态框
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => {
                WorkLogAuth.hideLoginModal();
            });
        }
        
        // 登录表单提交
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                WorkLogAuth.handleLogin();
            });
        }
        
        // 注册表单提交
        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                WorkLogAuth.handleRegister();
            });
        }
        
        // 登出按钮
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => {
                WorkLogAuth.handleLogout();
            });
        }
        
        // 切换登录/注册表单
        if (this.elements.showRegisterBtn) {
            this.elements.showRegisterBtn.addEventListener('click', () => {
                WorkLogAuth.showRegisterForm();
            });
        }
        
        if (this.elements.showLoginBtn) {
            this.elements.showLoginBtn.addEventListener('click', () => {
                WorkLogAuth.showLoginForm();
            });
        }
        
        // 提交维修记录
        if (this.elements.submitBtn) {
            this.elements.submitBtn.addEventListener('click', this.handleSubmit);
        }
    }

    /**
     * 用户登录后的回调
     */
    onUserLoggedIn() {
        this.showRepairInterface();
    }

    /**
     * 用户登出后的回调
     */
    onUserLoggedOut() {
        this.showLoginPrompt();
        
        // 清除用户信息显示
        if (this.elements.username) {
            this.elements.username.textContent = '用户名';
        }
        
        if (this.elements.realName) {
            this.elements.realName.textContent = '加载中...';
        }
    }

    /**
     * 显示维修登记界面
     */
    showRepairInterface() {
        if (this.elements.loginBtn) {
            this.elements.loginBtn.classList.add('hidden');
        }
        
        if (this.elements.userInfo) {
            this.elements.userInfo.classList.remove('hidden');
            this.elements.userInfo.classList.add('flex');
        }
        
        if (this.elements.loginPrompt) {
            this.elements.loginPrompt.classList.add('hidden');
        }
        
        if (this.elements.repairSection) {
            this.elements.repairSection.classList.remove('hidden');
        }
        
        // 更新用户信息显示
        this.updateUserDisplay();
    }

    /**
     * 显示登录提示
     */
    showLoginPrompt() {
        if (this.elements.loginBtn) {
            this.elements.loginBtn.classList.remove('hidden');
        }
        
        if (this.elements.userInfo) {
            this.elements.userInfo.classList.add('hidden');
        }
        
        if (this.elements.loginPrompt) {
            this.elements.loginPrompt.classList.remove('hidden');
        }
        
        if (this.elements.repairSection) {
            this.elements.repairSection.classList.add('hidden');
        }
    }

    /**
     * 更新用户显示
     */
    updateUserDisplay() {
        if (!this.currentUser) return;
        
        const username = this.currentUser.get('username');
        const realName = this.currentUser.get('realName') || username;
        
        // 更新用户名显示
        if (this.elements.username) {
            this.elements.username.textContent = username;
        }
        
        // 更新真实姓名显示
        if (this.elements.realName) {
            this.elements.realName.textContent = realName;
        }
        
        // 绑定退出按钮事件（如果尚未绑定）
        if (this.elements.logoutBtn && !this.logoutBound) {
            this.elements.logoutBtn.addEventListener('click', () => {
                WorkLogAuth.handleLogout();
            });
            this.logoutBound = true;
        }
    }

    /**
     * 收集维修数据
     */
    collectRepairData() {
        return {
            // 报修信息
            serialNumber: this.elements.serialNumber?.value.trim() || '',
            repairSource: this.elements.repairSource?.value.trim() || '',
            department: this.elements.department?.value.trim() || '',
            reporter: this.elements.reporter?.value.trim() || '',
            room: this.elements.room?.value.trim() || '',
            description: this.elements.description?.value.trim() || '',
            status: this.elements.status?.value.trim() || '',
            assignee: this.currentUser ? AV.Object.createWithoutData('_User', this.currentUser.id) : null,
            createdAt: this.elements.createdAt?.value ? new Date(this.elements.createdAt.value) : new Date(),
            updatedAt: new Date()
        };
    }

    /**
     * 格式化维修数据为文本
     */
    formatRepairDataToText(data) {
        let text = '维修登记信息\n\n';
        text += `记录时间: ${new Date().toLocaleString()}\n\n`;
        
        // 基本信息
        text += '【报修基本信息】\n';
        text += `流水号: ${data.serialNumber || '未填写'}\n`;
        text += `报修来源: ${data.repairSource || '未填写'}\n`;
        text += `报修部门: ${data.department || '未填写'}\n`;
        text += `报修人: ${data.reporter || '未填写'}\n`;
        text += `涉及房间: ${data.room || '未填写'}\n\n`;
        
        // 详细信息
        text += '【报修详细信息】\n';
        text += `报修内容: ${data.description || '未填写'}\n\n`;
        
        // 处理状态
        text += '【处理状态】\n';
        text += `处置结果: ${data.status || '未填写'}\n`;
        
        return text;
    }

    /**
     * 离线队列相关
     */
    static OFFLINE_QUEUE_KEY = 'repair_offline_queue';

    saveOfflineLog(logData) {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(RepairApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        queue.push(logData);
        localStorage.setItem(RepairApp.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }

    async syncOfflineLogs() {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(RepairApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        if (!queue.length) return;
        
        const failed = [];
        for (const log of queue) {
            try {
                await this.submitRepairLog(log.data);
                this.sendToWeComGroup(log.content);
            } catch (e) {
                failed.push(log);
            }
        }
        
        if (failed.length) {
            localStorage.setItem(RepairApp.OFFLINE_QUEUE_KEY, JSON.stringify(failed));
        } else {
            localStorage.removeItem(RepairApp.OFFLINE_QUEUE_KEY);
        }
        
        if (queue.length > failed.length) {
            WorkLogUtils.showMessage('离线维修记录已自动同步', 'success');
        }
    }

    /**
     * 提交维修记录到LeanCloud
     */
    async submitRepairLog(data) {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }
        
        const Repair = AV.Object.extend('Repair');
        const repair = new Repair();
        
        // 设置基础属性
        repair.set('user', this.currentUser);
        repair.set('content', data.description);
        repair.set('type', 'repair');
        repair.set('status', data.status);
        
        // 设置报修相关信息
        repair.set('serialNumber', data.serialNumber);
        repair.set('repairSource', data.repairSource);
        repair.set('department', data.department);
        repair.set('reporter', data.reporter);
        repair.set('room', data.room);
        repair.set('assignee', data.assignee);
        
        // 时间戳
        if (data.createdAt) {
            repair.set('createdAt', data.createdAt);
        }
        repair.set('updatedAt', data.updatedAt);
        
        // 提交数据
        await repair.save();
        return repair;
    }

    /**
     * 推送内容到企业微信群机器人（通过后端PHP中转）
     */
    async sendToWeComGroup(content) {
        try {
            await fetch('https://www.junwei.bid:89/web/20/wecom-webhook.php', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content })
            });
        } catch (err) {
            console.error("Webhook推送异常", err);
        }
    }

    /**
     * 处理提交
     */
    async handleSubmit(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (!this.currentUser) {
            WorkLogUtils.showMessage('请先登录', 'warning');
            return;
        }
        
        // 收集维修数据
        const repairData = this.collectRepairData();
        
        // 验证必填字段
        if (!repairData.serialNumber || 
            !repairData.repairSource || 
            !repairData.department || 
            !repairData.reporter || 
            !repairData.room || 
            !repairData.description || 
            !repairData.status) {
            WorkLogUtils.showMessage('请填写所有必填字段', 'warning');
            return;
        }
        
        const originalText = this.elements.submitBtn?.textContent;
        
        try {
            if (this.elements.submitBtn) {
                this.elements.submitBtn.textContent = '提交中...';
                this.elements.submitBtn.disabled = true;
            }
            
            // 提交维修记录
            const repair = await this.submitRepairLog(repairData);
            WorkLogUtils.showMessage('维修登记提交成功！', 'success');
            
            // === 新增：推送到企业微信群 ===
            let userName = this.currentUser.get('realName') || this.currentUser.get('username') || '';
            let msg = `【维修登记】\n用户：${userName}\n${this.formatRepairDataToText(repairData)}`;
            this.sendToWeComGroup(msg);
            // ===
            
            // 重置表单
            this.resetForm();
            
        } catch (error) {
            // 保存到离线队列
            this.saveOfflineLog({
                data: repairData,
                content: this.formatRepairDataToText(repairData)
            });
            WorkLogUtils.showMessage('网络异常，记录已离线保存，联网后将自动同步', 'warning');
        } finally {
            if (this.elements.submitBtn) {
                this.elements.submitBtn.textContent = originalText || '提交维修登记';
                this.elements.submitBtn.disabled = false;
            }
        }
    }

    /**
     * 重置表单
     */
    resetForm() {
        // 重置所有输入框
        const inputs = [
            this.elements.serialNumber,
            this.elements.department,
            this.elements.reporter,
            this.elements.room
        ];
        
        inputs.forEach(input => {
            if (input) {
                input.value = '';
            }
        });
        
        // 重置下拉框
        const selects = [
            this.elements.repairSource,
            this.elements.status
        ];
        
        selects.forEach(select => {
            if (select) {
                select.selectedIndex = 0;
            }
        });
        
        // 重置文本域
        if (this.elements.description) {
            this.elements.description.value = '';
        }
        
        // 重置时间输入
        if (this.elements.createdAt) {
            this.elements.createdAt.value = '';
        }
        
        // 清空更新时间
        if (this.elements.updatedAt) {
            this.elements.updatedAt.value = '';
        }
        
        // 清空图片预览
        // if (this.elements.imagePreview) {
        //     this.elements.imagePreview.innerHTML = '';
        // }
        
        console.log('表单已重置');
    }

    /**
     * 初始化
     */
    async init() {
        await super.init?.call(this);
        
        // 检查登录状态
        await this.checkAuthStatus();
        
        // 同步离线记录
        await this.syncOfflineLogs();
    }
    
    /**
     * 检查登录状态并更新界面
     */
    async checkAuthStatus() {
        const isLoggedIn = await WorkLogAuth.checkLoginStatus();
        
        if (isLoggedIn) {
            this.currentUser = WorkLogAuth.getCurrentUser();
            this.showRepairInterface();
        } else {
            this.currentUser = null;
            this.showLoginPrompt();
        }
        
        // 更新用户信息显示
        this.updateUserDisplay();
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.RepairApp = RepairApp;
}