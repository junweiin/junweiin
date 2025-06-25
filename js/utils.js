/**
 * 工作日志应用工具函数
 * 包含消息提示、图片处理、时间格式化等公共功能
 */

const WorkLogUtils = {
    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, info, warning)
     * @param {number} duration - 显示时长（毫秒），默认3000
     */
    showMessage(message, type = 'info', duration = 3000) {
        const messageElement = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        
        messageElement.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 fade-in ${colors[type] || colors.info}`;
        messageElement.textContent = message;
        
        // 添加样式
        messageElement.style.cssText += `
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        
        document.body.appendChild(messageElement);
        
        // 动画显示
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            messageElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(messageElement)) {
                    document.body.removeChild(messageElement);
                }
            }, 300);
        }, duration);
    },

    /**
     * 压缩图片到指定宽度
     * @param {File} file - 原始图片文件
     * @param {number} maxWidth - 最大宽度
     * @param {number} quality - 压缩质量
     * @returns {Promise<Blob>} 压缩后的图片Blob
     */
    compressImage(file, maxWidth = WORKLOG_CONFIG.APP.IMAGE_MAX_WIDTH, quality = WORKLOG_CONFIG.APP.IMAGE_QUALITY) {
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
    },

    /**
     * 批量上传图片到LeanCloud
     * @param {FileList} files - 文件列表
     * @param {string} prefix - 文件名前缀
     * @returns {Promise<Array>} 上传后的图片URL数组
     */
    async uploadImages(files, prefix = 'worklog') {
        const images = [];
        
        for (let i = 0; i < files.length; i++) {
            try {
                // 压缩图片
                const compressedBlob = await this.compressImage(files[i]);
                
                // 创建新的文件名
                const originalName = files[i].name;
                const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                const compressedFileName = `${prefix}_${nameWithoutExt}_${Date.now()}_${i}.jpg`;
                
                // 上传压缩后的图片
                const file = new AV.File(compressedFileName, compressedBlob);
                const savedFile = await file.save();
                images.push(savedFile.url());
                
                console.log(`图片 ${originalName} 压缩并上传成功`);
            } catch (error) {
                console.error('图片压缩或上传失败:', error);
                this.showMessage(`图片 ${files[i].name} 处理失败`, 'error');
            }
        }
        
        return images;
    },

    /**
     * 获取相对时间
     * @param {Date} date - 日期对象
     * @returns {string} 相对时间字符串
     */
    getTimeAgo(date) {
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
    },

    /**
     * 格式化时间
     * @param {Date} date - 日期对象
     * @returns {string} 格式化的时间字符串
     */
    formatDateTime(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 验证表单数据
     * @param {Object} data - 表单数据
     * @param {Array} requiredFields - 必填字段数组
     * @returns {Object} 验证结果 {isValid: boolean, message: string}
     */
    validateFormData(data, requiredFields = []) {
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
                return {
                    isValid: false,
                    message: `请填写${field}`
                };
            }
        }
        return {
            isValid: true,
            message: '验证通过'
        };
    }
};

// 导出工具函数（兼容全局使用）
if (typeof window !== 'undefined') {
    window.WorkLogUtils = WorkLogUtils;
}