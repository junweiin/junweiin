/**
 * 空调机房模块 - 空调设备操作记录功能
 * 继承自BaseWorkLogApp，实现空调机房特定功能
 */

class AirConditionApp extends BaseWorkLogApp {
    constructor() {
        super({
            pageType: 'aircondition',
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
            
            // 设备控制
            chilledWaterPump: 'chilledWaterPump',
            coolingWaterPump: 'coolingWaterPump',
            
            // 温度和压力输入
            chilledWaterInletTemp: 'chilledWaterInletTemp',
            chilledWaterOutletTemp: 'chilledWaterOutletTemp',
            highTempGeneratorTemp: 'highTempGeneratorTemp',
            coolingWaterInletTemp: 'coolingWaterInletTemp',
            coolingWaterOutletTemp: 'coolingWaterOutletTemp',
            vacuumPressure: 'vacuumPressure',
            
            // 水温
            highZoneWaterTemp: 'highZoneWaterTemp',
            lowZoneWaterTemp: 'lowZoneWaterTemp',
            
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
        
        return await WorkLogUtils.uploadImages(files, 'aircondition');
    }

    /**
     * 收集操作数据
     */
    collectOperationData() {
        return {
            // 设备控制
            chilledWaterPump: this.elements.chilledWaterPump?.value || '',
            coolingWaterPump: this.elements.coolingWaterPump?.value || '',
            
            // 温度和压力数据
            chilledWaterInletTemp: this.elements.chilledWaterInletTemp?.value || '',
            chilledWaterOutletTemp: this.elements.chilledWaterOutletTemp?.value || '',
            highTempGeneratorTemp: this.elements.highTempGeneratorTemp?.value || '',
            coolingWaterInletTemp: this.elements.coolingWaterInletTemp?.value || '',
            coolingWaterOutletTemp: this.elements.coolingWaterOutletTemp?.value || '',
            vacuumPressure: this.elements.vacuumPressure?.value || '',
            
            // 水温数据
            highZoneWaterTemp: this.elements.highZoneWaterTemp?.value || '',
            lowZoneWaterTemp: this.elements.lowZoneWaterTemp?.value || ''
        };
    }

    /**
     * 格式化操作数据为文本
     */
    formatOperationDataToText(data) {
        let text = '空调机房操作记录\n\n';
        content += `记录时间: ${new Date().toLocaleString()}\n\n`;
        
        // 设备控制状态
        text += '【设备控制状态】\n';
        text += `冷冻水泵: ${data.chilledWaterPump || '未填写'}\n`;
        text += `冷却水泵: ${data.coolingWaterPump || '未填写'}\n`;
        text += '\n';
        
        // 温度监测数据
        text += '【温度监测数据】\n';
        text += `冷冻水进水温度: ${data.chilledWaterInletTemp || '未填写'}°C\n`;
        text += `冷冻水出水温度: ${data.chilledWaterOutletTemp || '未填写'}°C\n`;
        text += `高温发生器温度: ${data.highTempGeneratorTemp || '未填写'}°C\n`;
        text += `冷却水进水温度: ${data.coolingWaterInletTemp || '未填写'}°C\n`;
        text += `冷却水出水温度: ${data.coolingWaterOutletTemp || '未填写'}°C\n`;
        text += `高区水温: ${data.highZoneWaterTemp || '未填写'}°C\n`;
        text += `低区水温: ${data.lowZoneWaterTemp || '未填写'}°C\n`;
        text += '\n';
        
        // 压力数据
        text += '【压力监测数据】\n';
        text += `真空压力: ${data.vacuumPressure || '未填写'}MPa\n`;
        
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
    static OFFLINE_QUEUE_KEY = 'aircondition_offline_queue';

    saveOfflineLog(logData) {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(AirConditionApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        queue.push(logData);
        localStorage.setItem(AirConditionApp.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }

    async syncOfflineLogs() {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(AirConditionApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        if (!queue.length) return;
        const failed = [];
        for (const log of queue) {
            try {
                await this.submitWorkLog(log.operationData, log.images || [], log.content);
                let userName = this.currentUser?.get('realName') || this.currentUser?.get('username') || '';
                let msg = `【空调机房操作记录-离线补发】\n用户：${userName}\n${log.content}`;
                this.sendToWeComGroup(msg);
            } catch (e) {
                failed.push(log);
            }
        }
        if (failed.length) {
            localStorage.setItem(AirConditionApp.OFFLINE_QUEUE_KEY, JSON.stringify(failed));
        } else {
            localStorage.removeItem(AirConditionApp.OFFLINE_QUEUE_KEY);
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
                let msg = `【空调机房操作记录】\n用户：${userName}\n${content}`;
                this.sendToWeComGroup(msg);
                // ===
                
            } catch (err) {
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
            this.elements.chilledWaterPump,
            this.elements.coolingWaterPump
        ];
        
        selects.forEach(select => {
            if (select) {
                select.selectedIndex = 0;
            }
        });
        
        // 重置所有输入框
        const inputs = [
            this.elements.chilledWaterInletTemp,
            this.elements.chilledWaterOutletTemp,
            this.elements.highTempGeneratorTemp,
            this.elements.coolingWaterInletTemp,
            this.elements.coolingWaterOutletTemp,
            this.elements.vacuumPressure,
            this.elements.highZoneWaterTemp,
            this.elements.lowZoneWaterTemp
        ];
        
        inputs.forEach(input => {
            if (input) {
                input.value = '';
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
    window.AirConditionApp = AirConditionApp;
}