/**
 * 净水厂模块 - 净水器操作记录功能
 * 继承自BaseWorkLogApp，实现净水厂特定功能
 */

class WaterFilterApp extends BaseWorkLogApp {
    constructor() {
        super({
            pageType: 'waterfilter',
            requiredElements: ['operationSection', 'submitBtn']
        });
        
        // 绑定方法上下文
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setupImagePreview = this.setupImagePreview.bind(this);
        this.showImagePreview = this.showImagePreview.bind(this);
    }

    /**
     * 获取页面特定的DOM元素
     */
    getPageElements() {
        return {
            // 导航和用户相关
            backBtn: 'backBtn',
            realName: 'realName',
            
            // 页面区域
            operationSection: 'operationSection',
            promptLoginBtn: 'promptLoginBtn',
            
            // 登录弹窗
            closeModal: 'closeModal',
            loginForm: 'loginForm',
            registerForm: 'registerForm',
            showRegisterBtn: 'showRegisterBtn',
            showLoginBtn: 'showLoginBtn',
            modalTitle: 'modalTitle',
            
            // 净水器设备控制
            waterFilterSwitch: 'waterFilterSwitch',
            
            // 水位监测
            tapWaterLevel: 'tapWaterLevel',
            purifiedWaterLevel: 'purifiedWaterLevel',
            
            // 加压泵组控制
            rdBuildingPump: 'rdBuildingPump',
            highZonePump: 'highZonePump',
            lowZonePump: 'lowZonePump',
            
            // 图片上传
            imageInput: 'imageInput',
            imagePreview: 'imagePreview',
            
            // 提交按钮
            submitBtn: 'submitBtn'
        };
    }

    /**
     * 绑定页面特定事件
     */
    bindPageEvents() {
        // 返回按钮
        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
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
        
        // 表单切换
        if (this.elements.showRegisterBtn) {
            this.elements.showRegisterBtn.addEventListener('click', () => {
                this.showRegisterForm();
            });
        }
        
        if (this.elements.showLoginBtn) {
            this.elements.showLoginBtn.addEventListener('click', () => {
                this.showLoginForm();
            });
        }
        
        // 提交操作记录
        if (this.elements.submitBtn) {
            this.elements.submitBtn.addEventListener('click', this.handleSubmit);
        }
        
        // 设置图片预览
        this.setupImagePreview();
    }

    /**
     * 用户登录后的回调
     */
    onUserLoggedIn() {
        this.showOperationInterface();
    }

    /**
     * 用户登出后的回调
     */
    onUserLoggedOut() {
        this.showLoginPrompt();
    }

    /**
     * 显示操作界面
     */
    showOperationInterface() {
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
        
        if (this.elements.operationSection) {
            this.elements.operationSection.classList.remove('hidden');
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
        
        if (this.elements.operationSection) {
            this.elements.operationSection.classList.add('hidden');
        }
    }

    /**
     * 显示注册表单
     */
    showRegisterForm() {
        if (this.elements.loginForm && this.elements.registerForm) {
            this.elements.loginForm.classList.add('hidden');
            this.elements.registerForm.classList.remove('hidden');
        }
        
        if (this.elements.modalTitle) {
            this.elements.modalTitle.textContent = '注册新账号';
        }
    }

    /**
     * 显示登录表单
     */
    showLoginForm() {
        if (this.elements.registerForm && this.elements.loginForm) {
            this.elements.registerForm.classList.add('hidden');
            this.elements.loginForm.classList.remove('hidden');
        }
        
        if (this.elements.modalTitle) {
            this.elements.modalTitle.textContent = '登录';
        }
    }

    /**
     * 设置图片预览
     */
    setupImagePreview() {
        if (this.elements.imageInput) {
            this.elements.imageInput.addEventListener('change', (e) => {
                this.showImagePreview(e.target.files);
            });
        }
    }

    /**
     * 显示图片预览
     */
    showImagePreview(files) {
        if (!this.elements.imagePreview || !files.length) return;
        
        this.elements.imagePreview.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-20 h-20 object-cover rounded border mr-2 mb-2';
                img.alt = `预览图片 ${index + 1}`;
                this.elements.imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * 上传图片
     */
    async uploadImages() {
        const files = this.elements.imageInput?.files;
        if (!files || files.length === 0) {
            return [];
        }
        
        return await WorkLogUtils.uploadImages(files, 'waterfilter');
    }

    /**
     * 收集操作数据
     */
    collectOperationData() {
        return {
            // 净水器设备状态
            waterFilterSwitch: this.elements.waterFilterSwitch?.value || '',
            
            // 水位监测
            tapWaterLevel: this.elements.tapWaterLevel?.value || '',
            purifiedWaterLevel: this.elements.purifiedWaterLevel?.value || '',
            
            // 加压泵组状态
            rdBuildingPump: this.elements.rdBuildingPump?.value || '',
            highZonePump: this.elements.highZonePump?.value || '',
            lowZonePump: this.elements.lowZonePump?.value || ''
        };
    }

    /**
     * 格式化操作数据为文本
     */
    formatOperationDataToText(data) {
        let text = '=== 净水厂操作记录 ===\n\n';
        
        // 净水器设备状态
        text += '【净水器设备状态】\n';
        if (data.waterFilterSwitch) {
            text += `净水器开关: ${data.waterFilterSwitch}\n`;
        }
        text += '\n';
        
        // 水位监测
        text += '【水位监测】\n';
        if (data.tapWaterLevel) {
            text += `自来水水位: ${data.tapWaterLevel}\n`;
        }
        if (data.purifiedWaterLevel) {
            text += `净化水水位: ${data.purifiedWaterLevel}\n`;
        }
        text += '\n';
        
        // 加压泵组状态
        text += '【加压泵组状态】\n';
        if (data.rdBuildingPump) {
            text += `研发楼加压泵: ${data.rdBuildingPump}\n`;
        }
        if (data.highZonePump) {
            text += `高区加压泵: ${data.highZonePump}\n`;
        }
        if (data.lowZonePump) {
            text += `低区加压泵: ${data.lowZonePump}\n`;
        }
        
        return text;
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
     * 离线日志相关
     */
    static OFFLINE_QUEUE_KEY = 'waterfilter_offline_queue';

    saveOfflineLog(logData) {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(WaterFilterApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        queue.push(logData);
        localStorage.setItem(WaterFilterApp.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }

    async syncOfflineLogs() {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(WaterFilterApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        if (!queue.length) return;
        const failed = [];
        for (const log of queue) {
            try {
                await this.submitWorkLog(log.operationData, log.images || [], log.content);
                let userName = this.currentUser?.get('realName') || this.currentUser?.get('username') || '';
                let msg = `【净水器操作记录-离线补发】\n用户：${userName}\n${log.content}`;
                this.sendToWeComGroup(msg);
            } catch (e) {
                failed.push(log);
            }
        }
        if (failed.length) {
            localStorage.setItem(WaterFilterApp.OFFLINE_QUEUE_KEY, JSON.stringify(failed));
        } else {
            localStorage.removeItem(WaterFilterApp.OFFLINE_QUEUE_KEY);
        }
        if (queue.length > failed.length) {
            WorkLogUtils.showMessage('离线操作记录已自动同步', 'success');
        }
    }

    /**
     * 处理提交
     */
    async handleSubmit() {
        if (!this.currentUser) {
            WorkLogUtils.showMessage('请先登录', 'warning');
            return;
        }
        
        // 收集操作数据
        const operationData = this.collectOperationData();
        
        // 验证数据
        const hasData = Object.values(operationData).some(value => value.trim() !== '');
        if (!hasData) {
            WorkLogUtils.showMessage('请至少填写一项操作数据', 'warning');
            return;
        }
        
        const originalText = this.elements.submitBtn?.textContent;
        
        try {
            if (this.elements.submitBtn) {
                this.elements.submitBtn.textContent = '提交中...';
                this.elements.submitBtn.disabled = true;
            }
            
            // 上传图片
            const images = await this.uploadImages();
            
            // 格式化内容
            const content = this.formatOperationDataToText(operationData);
            
            try {
                // 提交工作日志
                await this.submitWorkLog(operationData, images, content);
                WorkLogUtils.showMessage('操作记录提交成功！', 'success');
                
                // === 新增：推送到企业微信群 ===
                let userName = this.currentUser.get('realName') || this.currentUser.get('username') || '';
                let msg = `【净水厂操作记录】\n用户：${userName}\n${content}`;
                this.sendToWeComGroup(msg);
                // ===
                
            } catch (err) {
                // 网络异常，保存离线日志
                this.saveOfflineLog({ operationData, images, content });
                WorkLogUtils.showMessage('网络异常，记录已离线保存，联网后将自动同步', 'warning');
            }
            
            // 重置表单
            this.resetForm();
            
        } catch (error) {
            console.error('提交失败:', error);
            WorkLogUtils.showMessage('提交失败: ' + error.message, 'error');
        } finally {
            if (this.elements.submitBtn) {
                this.elements.submitBtn.textContent = originalText || '提交操作记录';
                this.elements.submitBtn.disabled = false;
            }
        }
    }

    /**
     * 初始化
     */
    async init() {
        await super.init?.();
        this.syncOfflineLogs();
    }

    /**
     * 重置表单
     */
    resetForm() {
        // 重置所有选择框
        const selects = [
            this.elements.waterFilterSwitch,
            this.elements.tapWaterLevel,
            this.elements.purifiedWaterLevel,
            this.elements.rdBuildingPump,
            this.elements.highZonePump,
            this.elements.lowZonePump
        ];
        
        selects.forEach(select => {
            if (select) {
                select.selectedIndex = 0;
            }
        });
        
        // 清空图片预览
        if (this.elements.imagePreview) {
            this.elements.imagePreview.innerHTML = '';
        }
        
        // 重置文件输入
        if (this.elements.imageInput) {
            this.elements.imageInput.value = '';
        }
        
        console.log('表单已重置');
    }

    /**
     * 更新用户显示
     */
    updateUserDisplay() {
        if (!this.currentUser || !this.elements.realName) return;
        
        const authorName = this.currentUser.get('realName') || this.currentUser.get('username');
        this.elements.realName.textContent = authorName;
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.WaterFilterApp = WaterFilterApp;
}