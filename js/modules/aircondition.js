/**
 * 空调机房模块 - 空调设备操作记录功能
 * 继承自BaseWorkLogApp，实现空调机房特定功能
 */

class AirConditionApp extends BaseWorkLogApp {
    /**
     * 写入结构化数据到 AirConditionRecord 表
     */
    async saveToAirConditionRecord(formData, images) {
        try {
            const record = new AV.Object('AirConditionRecord');
            // 用户信息
            if (this.currentUser) {
                record.set('userId', this.currentUser.id);
                record.set('realName', this.currentUser.get('realName') || this.currentUser.get('username') || '');
            }
            // 当前机组状态
            record.set('unitStatus', formData.unitStatus || '关');
            // 设备状态
            record.set('chilledWaterPump', formData.chilledWaterPump === '开');
            record.set('coolingWaterPump', formData.coolingWaterPump === '开');
            // 温度压力
            record.set('chilledWaterInletTemp', Number(formData.chilledWaterInletTemp));
            record.set('chilledWaterOutletTemp', Number(formData.chilledWaterOutletTemp));
            record.set('highTempGeneratorTemp', Number(formData.highTempGeneratorTemp));
            record.set('coolingWaterInletTemp', Number(formData.coolingWaterInletTemp));
            record.set('coolingWaterOutletTemp', Number(formData.coolingWaterOutletTemp));
            record.set('vacuumPressure', Number(formData.vacuumPressure));
            // 高低区水温
            record.set('highZoneWaterTemp', Number(formData.highZoneWaterTemp));
            record.set('lowZoneWaterTemp', Number(formData.lowZoneWaterTemp));
            // 图片
            if (Array.isArray(images) && images.length > 0) {
                record.set('images', images);
            }
            await record.save();
        } catch (e) {
            // 新表写入失败不影响主流程，但可提示
            console.warn('写入AirConditionRecord失败', e);
        }
    }
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

            // 当前机组状态
            unitStatus: 'unitStatus',

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

        // 当前机组状态按钮事件
        if (this.elements.unitStatus) {
            this.elements.unitStatus.addEventListener('click', () => {
                const current = this.elements.unitStatus.getAttribute('data-status') === 'on';
                if (current) {
                    this.elements.unitStatus.setAttribute('data-status', 'off');
                    this.elements.unitStatus.textContent = '机组状态：关';
                    this.elements.unitStatus.classList.remove('bg-green-500');
                    this.elements.unitStatus.classList.add('bg-gray-400');
                } else {
                    this.elements.unitStatus.setAttribute('data-status', 'on');
                    this.elements.unitStatus.textContent = '机组状态：开';
                    this.elements.unitStatus.classList.remove('bg-gray-400');
                    this.elements.unitStatus.classList.add('bg-green-500');
                }
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
     * 切换到上传模式
     */
    switchToUploadMode() {
        if (!this.elements.imageInput) return;
        
        try {
            // 触发文件选择对话框
            this.elements.imageInput.click();
        } catch (error) {
            console.error('切换到上传模式失败:', error);
            WorkLogUtils.showMessage('无法访问文件系统', 'error');
        }
    }

    /**
     * 切换到相机模式
     */
    async switchToCameraMode() {
        try {
            // 检查浏览器是否支持getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('浏览器不支持相机访问');
            }

            // 请求相机权限
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            // 创建视频元素显示相机预览
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            
            // 清空预览区域并添加视频元素
            if (this.elements.imagePreview) {
                this.elements.imagePreview.innerHTML = '';
                this.elements.imagePreview.appendChild(video);
            }

            // 添加拍照按钮
            const captureBtn = document.createElement('button');
            captureBtn.textContent = '拍照';
            captureBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded mt-2';
            captureBtn.addEventListener('click', () => {
                this.captureFromCamera(video);
            });
            
            this.elements.imagePreview.appendChild(captureBtn);

        } catch (error) {
            console.error('切换到相机模式失败:', error);
            WorkLogUtils.showMessage('无法访问相机: ' + error.message, 'error');
            // 回退到上传模式
            this.switchToUploadMode();
        }
    }

    /**
     * 从相机捕获照片
     */
    captureFromCamera(video) {
        if (!this.elements.imagePreview) return;
        
        try {
            // 创建canvas元素
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // 绘制视频帧到canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 转换为Blob对象
            canvas.toBlob((blob) => {
                // 创建文件对象
                const file = new File([blob], 'camera-capture.jpg', {
                    type: 'image/jpeg'
                });
                
                // 模拟文件输入事件
                this.showImagePreview([file]);
                
                // 停止视频流
                const stream = video.srcObject;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                // 清空预览区域
                this.elements.imagePreview.innerHTML = '';
                
            }, 'image/jpeg', 0.9);
            
        } catch (error) {
            console.error('拍照失败:', error);
            WorkLogUtils.showMessage('拍照失败: ' + error.message, 'error');
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
            // 当前机组状态
            unitStatus: this.elements.unitStatus?.getAttribute('data-status') === 'on' ? '开' : '关',

            // 设备控制
            chilledWaterPump: this.elements.chilledWaterPump?.checked ? '开' : '关',
            coolingWaterPump: this.elements.coolingWaterPump?.checked ? '开' : '关',

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
        text += `记录时间: ${new Date().toLocaleString()}\n\n`;
        // 当前机组状态
        text += `当前机组状态: ${data.unitStatus || '未填写'}\n\n`;
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
        text += `真空压力: ${data.vacuumPressure || '未填写'} mmHg\n`;
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
                // 新增：写入结构化表
                await this.saveToAirConditionRecord(operationData, images);
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