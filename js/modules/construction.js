/**
 * 酒店工程部入场施工登记模块
 */
class ConstructionRegistration {
    constructor() {
        this.form = document.getElementById('constructionForm');
        
        // 初始化签名板
        this.signaturePad = new SignaturePad(
            document.getElementById('signaturePad'), 
            {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            }
        );
        
        // 绑定清除签名事件
        document.getElementById('clearSignature').addEventListener('click', () => {
            this.signaturePad.clear();
        });
        
        this.initEvents();
    }

    initEvents() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // 表单验证
        if (!this.validateForm()) {
            return;
        }

        // 检查LeanCloud初始化
        if (!window.AV || !window.AV.applicationId) {
            if (!window.WORKLOG_CONFIG?.LEANCLOUD?.APP_ID || !window.WORKLOG_CONFIG?.LEANCLOUD?.APP_KEY) {
                alert('系统配置错误，请联系管理员');
                return;
            }
            window.AV.init({
                appId: window.WORKLOG_CONFIG.LEANCLOUD.APP_ID,
                appKey: window.WORKLOG_CONFIG.LEANCLOUD.APP_KEY,
                serverURL: window.WORKLOG_CONFIG.LEANCLOUD.SERVER_URL || 
                          `https://${window.WORKLOG_CONFIG.LEANCLOUD.APP_ID.slice(0, 8).toLowerCase()}.lc-cn-n1-shared.com`
            });
        }

        // 收集表单数据
        const formData = this.collectFormData();

        try {
            // 显示加载状态
            this.setLoading(true);
            
            // 保存到LeanCloud
            const savedRecord = await this.saveToLeanCloud(formData);
            
            // 处理文件上传
            if (formData.files.length > 0) {
                await this.uploadFiles(savedRecord, formData.files);
            }
            
            // 提交成功
            alert('施工登记已提交成功！');
            this.form.reset();
            
        } catch (error) {
            console.error('施工登记提交失败:', error);
            let errorMsg = '提交失败，请重试';
            if (error.message.includes('Not initialized')) {
                errorMsg = '系统未初始化，请联系管理员';
            } else if (error.message.includes('config')) {
                errorMsg = '系统配置错误，请联系管理员';
            } else if (error.message.includes('网络')) {
                errorMsg = '网络连接失败，请检查网络后重试';
            }
            alert(errorMsg);
        } finally {
            this.setLoading(false);
        }
    }

    validateForm() {
        // 简单验证必填字段
        const requiredFields = [
            'projectName', 'companyName', 'contactPerson', 
            'contactPhone', 'startTime', 'endTime', 'constructionArea'
        ];
        
        // 验证签名
        if (this.signaturePad.isEmpty()) {
            alert('请提供施工单位负责人签名');
            return false;
        }
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                alert(`请填写${field.labels[0].textContent}`);
                field.focus();
                return false;
            }
        }
        
        // 验证时间合理性
        const startTime = new Date(document.getElementById('startTime').value);
        const endTime = new Date(document.getElementById('endTime').value);
        
        if (startTime >= endTime) {
            alert('结束时间必须晚于开始时间');
            return false;
        }
        
        return true;
    }

    collectFormData() {
        const formData = {
            projectName: document.getElementById('projectName').value.trim(),
            companyName: document.getElementById('companyName').value.trim(),
            contactPerson: document.getElementById('contactPerson').value.trim(),
            contactPhone: document.getElementById('contactPhone').value.trim(),
            workerCount: parseInt(document.getElementById('workerCount').value) || 0,
            startTime: new Date(document.getElementById('startTime').value),
            endTime: new Date(document.getElementById('endTime').value),
            constructionArea: document.getElementById('constructionArea').value,
            safetyMeasures: Array.from(document.querySelectorAll('input[name="safetyMeasures"]:checked'))
                                .map(el => el.value),
            signatureData: this.signaturePad.toDataURL(), // 将签名转为Base64
            status: 'pending', // 待审批状态
            files: []
        };

        // 收集文件
        const fileInput = document.getElementById('constructionFiles');
        if (fileInput.files.length > 0) {
            formData.files = Array.from(fileInput.files);
        }

        return formData;
    }

    async saveToLeanCloud(data) {
        // 创建ConstructionRegistration类
        const Construction = AV.Object.extend('ConstructionRegistration');
        const construction = new Construction();
        
        // 设置字段
        construction.set('projectName', data.projectName);
        construction.set('companyName', data.companyName);
        construction.set('contactPerson', data.contactPerson);
        construction.set('contactPhone', data.contactPhone);
        construction.set('workerCount', data.workerCount);
        construction.set('startTime', data.startTime);
        construction.set('endTime', data.endTime);
        construction.set('constructionArea', data.constructionArea);
        construction.set('safetyMeasures', data.safetyMeasures);
        construction.set('signatureData', data.signatureData);
        construction.set('status', data.status);
        
        // 保存到LeanCloud
        return await construction.save();
    }

    async uploadFiles(record, files) {
        const fileObjects = [];
        
        for (const file of files) {
            const avFile = new AV.File(file.name, file);
            await avFile.save();
            fileObjects.push(avFile);
        }
        
        // 将文件关联到施工记录
        record.set('attachments', fileObjects);
        await record.save();
    }

    setLoading(isLoading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? '提交中...' : '提交登记';
    }
}

// 初始化模块
document.addEventListener('DOMContentLoaded', () => {
    new ConstructionRegistration();
});