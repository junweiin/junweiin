/**
 * 变电站模块 - 变电站操作记录功能
 * 继承自BaseWorkLogApp，实现变电站特定功能
 */

class PowerStationApp extends BaseWorkLogApp {
    constructor() {
        super({
            pageType: 'powerstation',
            requiredElements: ['operationForm', 'submitBtn']
        });
        
        this.uploadedPhotos = [];
        
        // 绑定方法上下文
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePhotoUpload = this.handlePhotoUpload.bind(this);
    }

    /**
     * 获取页面特定的DOM元素
     */
    getPageElements() {
        return {
            operationSection: 'operationSection',
            operationForm: 'operationForm',
            submitBtn: 'submitBtn',
            imageInput: 'imageInput',
            imagePreview: 'imagePreview',
            promptLoginBtn: 'promptLoginBtn',
            closeModal: 'closeModal',
            showRegisterBtn: 'showRegisterBtn',
            showLoginBtn: 'showLoginBtn',
            loginFormContainer: 'loginFormContainer',
            registerFormContainer: 'registerFormContainer',
            realName: 'realName'
        };
    }

    /**
     * 绑定页面特定事件
     */
    bindPageEvents() {
        // 提交按钮
        if (this.elements.submitBtn) {
            this.elements.submitBtn.addEventListener('click', this.handleSubmit);
        }
        
        // 照片上传
        if (this.elements.imageInput) {
            this.elements.imageInput.addEventListener('change', this.handlePhotoUpload);
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
        
        // 切换注册/登录表单
        if (this.elements.showRegisterBtn) {
            this.elements.showRegisterBtn.addEventListener('click', () => {
                this.switchToRegister();
            });
        }
        
        if (this.elements.showLoginBtn) {
            this.elements.showLoginBtn.addEventListener('click', () => {
                this.switchToLogin();
            });
        }
    }

    /**
     * 用户登录后的回调
     */
    onUserLoggedIn() {
        this.showLoggedInState();
    }

    /**
     * 用户登出后的回调
     */
    onUserLoggedOut() {
        this.showLoggedOutState();
    }

    /**
     * 显示已登录状态
     */
    showLoggedInState() {
        if (this.elements.userInfo) {
            this.elements.userInfo.style.display = 'flex';
            this.elements.userInfo.classList.remove('hidden');
        }
        
        if (this.elements.loginBtn) {
            this.elements.loginBtn.style.display = 'none';
        }
        
        if (this.elements.loginPrompt) {
            this.elements.loginPrompt.style.display = 'none';
        }
        
        if (this.elements.operationSection) {
            this.elements.operationSection.style.display = 'block';
            this.elements.operationSection.classList.remove('hidden');
        }
        
        // 更新用户显示
        this.updateUserDisplay();
    }

    /**
     * 显示未登录状态
     */
    showLoggedOutState() {
        if (this.elements.userInfo) {
            this.elements.userInfo.style.display = 'none';
            this.elements.userInfo.classList.add('hidden');
        }
        
        if (this.elements.loginBtn) {
            this.elements.loginBtn.style.display = 'inline-block';
        }
        
        if (this.elements.loginPrompt) {
            this.elements.loginPrompt.style.display = 'block';
        }
        
        if (this.elements.operationSection) {
            this.elements.operationSection.style.display = 'none';
            this.elements.operationSection.classList.add('hidden');
        }
    }

    /**
     * 切换到注册表单
     */
    switchToRegister() {
        if (this.elements.loginFormContainer && this.elements.registerFormContainer) {
            this.elements.loginFormContainer.style.display = 'none';
            this.elements.registerFormContainer.style.display = 'block';
        }
        
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = '注册新账号';
        }
    }

    /**
     * 切换到登录表单
     */
    switchToLogin() {
        if (this.elements.loginFormContainer && this.elements.registerFormContainer) {
            this.elements.loginFormContainer.style.display = 'block';
            this.elements.registerFormContainer.style.display = 'none';
        }
        
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = '登录';
        }
    }

    /**
     * 处理照片上传
     */
    handlePhotoUpload(e) {
        const files = e.target.files;
        if (files.length === 0) return;
        
        // 清空之前的预览
        if (this.elements.imagePreview) {
            this.elements.imagePreview.innerHTML = '';
        }
        
        // 处理每个文件
        Array.from(files).forEach((file, index) => {
            this.compressImage(file, (compressedBlob) => {
                this.displayPhotoPreview(compressedBlob, index);
            });
        });
    }

    /**
     * 压缩图片
     */
    compressImage(file, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            const maxWidth = WORKLOG_CONFIG.APP.IMAGE_MAX_WIDTH;
            const quality = WORKLOG_CONFIG.APP.IMAGE_QUALITY;
            
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(callback, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    }

    /**
     * 显示照片预览
     */
    displayPhotoPreview(imageBlob, index) {
        if (!this.elements.imagePreview) return;
        
        const imageUrl = URL.createObjectURL(imageBlob);
        
        const previewItem = document.createElement('div');
        previewItem.className = 'relative inline-block mr-2 mb-2';
        previewItem.innerHTML = `
            <img src="${imageUrl}" alt="预览图片" class="w-20 h-20 object-cover rounded border">
            <button type="button" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    onclick="this.parentElement.remove()">
                ×
            </button>
        `;
        
        this.elements.imagePreview.appendChild(previewItem);
        
        // 存储压缩后的图片
        this.uploadedPhotos[index] = imageBlob;
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
        const formData = {};
        
        // 环境参数
        const indoorTempInput = document.getElementById('indoorTemp');
        const indoorHumidityInput = document.getElementById('indoorHumidity');
        
        formData.temperature = indoorTempInput?.value || '';
        formData.humidity = indoorHumidityInput?.value || '';
        
        // 变压器2000KV温度
        const transformer2000A = document.getElementById('transformer2000A');
        const transformer2000B = document.getElementById('transformer2000B');
        const transformer2000C = document.getElementById('transformer2000C');
        
        // 变压器1250KV温度
        const transformer1250A = document.getElementById('transformer1250A');
        const transformer1250B = document.getElementById('transformer1250B');
        const transformer1250C = document.getElementById('transformer1250C');
        
        formData.transformer2000A = transformer2000A?.value || '';
        formData.transformer2000B = transformer2000B?.value || '';
        formData.transformer2000C = transformer2000C?.value || '';
        formData.transformer1250A = transformer1250A?.value || '';
        formData.transformer1250B = transformer1250B?.value || '';
        formData.transformer1250C = transformer1250C?.value || '';
        
        // 设备状态
        const transStatusRadio = document.querySelector('input[name="transformerStatus"]:checked');
        const fireStatusRadio = document.querySelector('input[name="fireStatus"]:checked');
        
        formData.transformerStatus = transStatusRadio?.value || '';
        formData.fireSystemStatus = fireStatusRadio?.value || '';
        
        console.log('收集的表单数据:', formData);
        return formData;
    }

    /**
     * 上传照片
     */
    async uploadPhotos() {
        const photoUrls = [];
        
        for (let i = 0; i < this.uploadedPhotos.length; i++) {
            const photo = this.uploadedPhotos[i];
            if (!photo) continue;
            
            try {
                const fileName = `powerstation_${Date.now()}_${i}.jpg`;
                const file = new AV.File(fileName, photo);
                const savedFile = await file.save();
                photoUrls.push(savedFile.url());
                console.log(`照片 ${i + 1} 上传成功`);
            } catch (error) {
                console.error(`照片 ${i + 1} 上传失败:`, error);
                WorkLogUtils.showMessage(`照片 ${i + 1} 上传失败`, 'error');
            }
        }
        
        return photoUrls;
    }

    /**
     * 格式化数据为内容文本
     */
    formatDataToContent(data, photoUrls = []) {
        let content = `高压配电房操作记录\n\n`;
        content += `记录时间: ${new Date().toLocaleString()}\n\n`;
        
        // 环境参数
        content += `【环境参数】\n`;
        content += `温度: ${data.temperature || '未填写'}°C\n`;
        content += `湿度: ${data.humidity || '未填写'}%\n\n`;
        
        // 变压器2000KV温度
        content += `【变压器2000KV温度】\n`;
        content += `A相: ${data.transformer2000A || '未填写'}°C\n`;
        content += `B相: ${data.transformer2000B || '未填写'}°C\n`;
        content += `C相: ${data.transformer2000C || '未填写'}°C\n\n`;
        
        // 变压器1250KV温度
        content += `【变压器1250KV温度】\n`;
        content += `A相: ${data.transformer1250A || '未填写'}°C\n`;
        content += `B相: ${data.transformer1250B || '未填写'}°C\n`;
        content += `C相: ${data.transformer1250C || '未填写'}°C\n\n`;
        
        // 设备状态
        content += `【设备状态】\n`;
        content += `变压器: ${data.transformerStatus || '未填写'}\n`;
        content += `消防设施: ${data.fireSystemStatus || '未填写'}\n\n`;
        
        // 照片信息
        if (photoUrls.length > 0) {
            content += `【现场照片】\n共 ${photoUrls.length} 张\n`;
        }
        
        console.log('生成的内容:', content);
        return content;
    }

    /**
     * 推送内容到企业微信群机器人（通过后端PHP中转）
     */
    // async sendToWeComGroup(content) {
    //     try {
    //         await fetch('https://www.junwei.bid:89/web/20/wecom-webhook.php', {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({ content })
    //         });
    //     } catch (err) {
    //         console.error("Webhook推送异常", err);
    //     }
    // }

    /**
     * 离线日志队列的本地存储键
     */
    static OFFLINE_QUEUE_KEY = 'powerstation_offline_queue';

    /**
     * 保存离线日志
     */
    saveOfflineLog(logData) {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(PowerStationApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        queue.push(logData);
        localStorage.setItem(PowerStationApp.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }

    /**
     * 同步离线日志
     */
    async syncOfflineLogs() {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(PowerStationApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        if (!queue.length) return;
        const failed = [];
        for (const log of queue) {
            try {
                await this.submitWorkLog(log.formData, log.photoUrls || [], log.content);
                let userName = this.currentUser?.get('realName') || this.currentUser?.get('username') || '';
                let msg = `【高压配电房操作记录-离线补发】\n用户：${userName}\n${log.content}`;
                this.sendToWeComGroup(msg);
            } catch (e) {
                failed.push(log);
            }
        }
        if (failed.length) {
            localStorage.setItem(PowerStationApp.OFFLINE_QUEUE_KEY, JSON.stringify(failed));
        } else {
            localStorage.removeItem(PowerStationApp.OFFLINE_QUEUE_KEY);
        }
        if (queue.length > failed.length) {
            WorkLogUtils.showMessage('离线操作记录已自动同步', 'success');
        }
    }

    /**
     * 处理提交
     */
    async handleSubmit(e) {
        if (e) e.preventDefault();
        if (!this.currentUser) {
            WorkLogUtils.showMessage('请先登录', 'warning');
            return;
        }
        const formData = this.collectFormData();
        const originalText = this.elements.submitBtn?.textContent;
        try {
            if (this.elements.submitBtn) {
                this.elements.submitBtn.textContent = '提交中...';
                this.elements.submitBtn.disabled = true;
            }
            const photoUrls = await this.uploadPhotos();
            const content = this.formatDataToContent(formData, photoUrls);
            try {
                await this.submitWorkLog(formData, photoUrls, content);
                WorkLogUtils.showMessage('操作记录提交成功！', 'success');
                let userName = this.currentUser.get('realName') || this.currentUser.get('username') || '';
                let msg = `【高压配电房操作记录】\n用户：${userName}\n${content}`;
                this.sendToWeComGroup(msg);
            } catch (err) {
                this.saveOfflineLog({ formData, photoUrls, content });
                WorkLogUtils.showMessage('网络异常，记录已离线保存，联网后将自动同步', 'warning');
            }
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
     * 重置表单
     */
    resetForm() {
        // 重置表单字段
        const form = document.getElementById('operationForm');
        if (form) {
            form.reset();
        }
        
        // 清空照片预览
        if (this.elements.imagePreview) {
            this.elements.imagePreview.innerHTML = '';
        }
        
        // 清空上传的照片
        this.uploadedPhotos = [];
        
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
        
        const realName = this.currentUser.get('realName');
        const username = this.currentUser.get('username');
        this.elements.realName.textContent = realName || username;
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.PowerStationApp = PowerStationApp;
}