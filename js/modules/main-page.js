/**
 * 主页模块 - 工作日志列表和发布功能
 * 继承自BaseWorkLogApp，实现主页特定功能
 */

class MainPageApp extends BaseWorkLogApp {
    constructor() {
        super({
            pageType: 'main',
            requiredElements: ['postForm', 'logsList', 'loadingIndicator']
        });
        
        // 分页相关
        this.currentPage = 0;
        this.hasMoreData = true;
        this.isLoading = false;
        
        // 绑定方法上下文
        this.handlePost = this.handlePost.bind(this);
        this.handleDeleteLog = this.handleDeleteLog.bind(this);
        this.loadLogs = this.loadLogs.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    /**
     * 获取页面特定的DOM元素
     */
    getPageElements() {
        return {
            postForm: 'postForm',
            postContent: 'postContent',
            imageInput: 'imageInput',
            logsList: 'logsList',
            loadingIndicator: 'loadingIndicator',
            noMoreContent: 'noMoreContent',
            editRealNameBtn: 'editRealNameBtn',
            editRealNameModal: 'editRealNameModal',
            editRealNameForm: 'editRealNameForm',
            newRealName: 'newRealName',
            cancelEditRealName: 'cancelEditRealName',
            realName: 'realName',
            username: 'username',
            postSection: 'postSection',
            specialFunctionsSection: 'specialFunctionsSection',
            welcomeSection: 'welcomeSection'
        };
    }

    /**
     * 绑定页面特定事件
     */
    bindPageEvents() {
        // 发布表单提交
        if (this.elements.postForm) {
            this.elements.postForm.addEventListener('submit', this.handlePost);
        }

        // 编辑真实姓名相关事件
        if (this.elements.editRealNameBtn) {
            this.elements.editRealNameBtn.addEventListener('click', () => {
                this.showEditRealNameModal();
            });
        }

        if (this.elements.cancelEditRealName) {
            this.elements.cancelEditRealName.addEventListener('click', () => {
                this.hideEditRealNameModal();
            });
        }

        if (this.elements.editRealNameForm) {
            this.elements.editRealNameForm.addEventListener('submit', (e) => {
                this.handleEditRealName(e);
            });
        }

        // 设置无限滚动
        this.setupInfiniteScroll();
    }

    /**
     * 用户登录后的回调
     */
    onUserLoggedIn() {
        this.showUserInterface();
        this.loadLogs();
    }

    /**
     * 用户登出后的回调
     */
    onUserLoggedOut() {
        this.showLoginInterface();
        this.resetLogsList();
    }

    /**
     * 显示用户界面
     */
    showUserInterface() {
        super.showUserInterface();
        
        if (this.elements.postSection) {
            this.elements.postSection.classList.remove('hidden');
        }
        
        if (this.elements.specialFunctionsSection) {
            this.elements.specialFunctionsSection.classList.remove('hidden');
        }
        
        if (this.elements.welcomeSection) {
            this.elements.welcomeSection.classList.add('hidden');
        }
    }

    /**
     * 显示登录界面
     */
    showLoginInterface() {
        super.showLoginPrompt();
        
        if (this.elements.postSection) {
            this.elements.postSection.classList.add('hidden');
        }
        
        if (this.elements.specialFunctionsSection) {
            this.elements.specialFunctionsSection.classList.add('hidden');
        }
        
        if (this.elements.welcomeSection) {
            this.elements.welcomeSection.classList.remove('hidden');
        }
    }

    /**
     * 发送日志内容到企业微信群机器人（通过后端PHP中转）
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
     * 离线日志队列本地存储键
     */
    static OFFLINE_QUEUE_KEY = 'worklog_offline_queue';

    /**
     * 保存离线日志到本地
     */
    saveOfflineLog(logData) {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(MainPageApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        queue.push(logData);
        localStorage.setItem(MainPageApp.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }

    /**
     * 检查并同步离线日志
     */
    async syncOfflineLogs() {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem(MainPageApp.OFFLINE_QUEUE_KEY)) || [];
        } catch (e) {}
        if (!queue.length) return;
        const failed = [];
        for (const log of queue) {
            try {
                await this.submitWorkLog({ content: log.content }, log.images || [], log.content);
                // 推送到企业微信群
                let userName = this.currentUser?.get('realName') || this.currentUser?.get('username') || '';
                let msg = `【新工作日志-离线补发】\n用户：${userName}\n内容：${log.content}`;
                this.sendToWeComGroup(msg);
            } catch (e) {
                failed.push(log); // 失败的保留
            }
        }
        if (failed.length) {
            localStorage.setItem(MainPageApp.OFFLINE_QUEUE_KEY, JSON.stringify(failed));
        } else {
            localStorage.removeItem(MainPageApp.OFFLINE_QUEUE_KEY);
        }
        if (queue.length > failed.length) {
            WorkLogUtils.showMessage('离线日志已自动同步', 'success');
            this.resetLogsList();
            await this.loadLogs();
        }
    }

    /**
     * 处理发布日志
     */
    async handlePost(e) {
        e.preventDefault();
        const content = this.elements.postContent?.value?.trim();
        if (!content) {
            WorkLogUtils.showMessage('请输入日志内容', 'warning');
            return;
        }
        const submitBtn = this.elements.postForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        try {
            if (submitBtn) {
                submitBtn.textContent = '发布中...';
                submitBtn.disabled = true;
            }
            // 上传图片
            const images = await this.uploadImages();
            // 提交日志
            const formData = { 
                content,
                operationRecord: "常规工作记录" // 添加默认操作记录
            };
            try {
                await this.submitWorkLog(formData, images, content);
                WorkLogUtils.showMessage('日志发布成功！', 'success');
                // 推送到企业微信群
                let userName = this.currentUser?.get('realName') || this.currentUser?.get('username') || '';
                let msg = `【新工作日志】\n用户：${userName}\n内容：${content}`;
                this.sendToWeComGroup(msg);
            } catch (err) {
                // 离线或写入失败，保存到本地
                this.saveOfflineLog({ content, images });
                WorkLogUtils.showMessage('网络异常，日志已离线保存，联网后将自动同步', 'warning');
            }
            // 重置表单
            this.resetForm('postForm');
            // 重新加载日志列表
            this.resetLogsList();
            await this.loadLogs();
        } catch (error) {
            console.error('发布失败:', error);
            WorkLogUtils.showMessage('发布失败: ' + error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    /**
     * 上传图片
     */
    async uploadImages() {
        const files = this.elements.imageInput?.files;
        if (!files || files.length === 0) {
            return [];
        }
        
        return await WorkLogUtils.uploadImages(files, 'main');
    }

    /**
     * 重置日志列表
     */
    resetLogsList() {
        this.currentPage = 0;
        this.hasMoreData = true;
        this.isLoading = false;
        
        if (this.elements.logsList) {
            this.elements.logsList.innerHTML = '';
        }
        
        if (this.elements.noMoreContent) {
            this.elements.noMoreContent.classList.add('hidden');
        }
    }

    /**
     * 加载日志列表
     */
    async loadLogs() {
        if (this.isLoading || !this.hasMoreData) {
            return;
        }
        
        this.isLoading = true;
        
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.classList.remove('hidden');
        }
        
        try {
            const WorkLog = AV.Object.extend('WorkLog');
            const query = new AV.Query(WorkLog);
            
            query.include('user');
            // 改进排序逻辑：置顶日志优先，按置顶时间倒序，最后按创建时间倒序
            query.addDescending('isPinned');
            query.addDescending('pinnedAt');
            query.addDescending('createdAt');
            query.limit(WORKLOG_CONFIG.APP.PAGE_SIZE);
            query.skip(this.currentPage * WORKLOG_CONFIG.APP.PAGE_SIZE);
            
            const logs = await query.find();
            
            if (logs.length === 0) {
                this.hasMoreData = false;
                if (this.elements.noMoreContent) {
                    this.elements.noMoreContent.classList.remove('hidden');
                }
            } else {
                logs.forEach(log => this.renderLogItem(log));
                this.currentPage++;
            }
            
        } catch (error) {
            console.error('加载日志失败:', error);
            WorkLogUtils.showMessage('加载日志失败: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.classList.add('hidden');
            }
        }
    }

    /**
     * 渲染日志项
     */
    renderLogItem(log, returnElement = false) {
        const logElement = document.createElement('div');
        const isPinned = log.get('isPinned') === true;
        logElement.className = `bg-white rounded-lg shadow-md p-6 mb-4 log-item ${isPinned ? 'border-l-4 border-yellow-500 bg-yellow-50' : ''}`;
        
        // 添加置顶标签
        if (isPinned) {
            const pinLabel = document.createElement('span');
            pinLabel.className = 'inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2';
            pinLabel.textContent = '置顶';
            
            // 找到合适的位置插入标签
            const logHeader = logElement.querySelector('.log-header');
            if (logHeader) {
                logHeader.appendChild(pinLabel);
            }
        }
        logElement.dataset.logId = log.id;
        
        const user = log.get('user');
        // 处理用户名显示逻辑：
        // 1. 优先使用用户对象的信息
        // 2. 如果没有用户对象，使用存储的username字段
        // 3. 如果都没有，使用authorName字段（历史数据兼容）
        let username, realName;
        
        if (user) {
            username = user.get('username');
            realName = user.get('realName') || username;
        } else {
            // 处理历史数据
            const storedUsername = log.get('username');
            const authorName = log.get('authorName');
            
            if (storedUsername) {
                username = storedUsername;
                realName = authorName || storedUsername;
            } else if (authorName) {
                // 历史数据只有authorName的情况
                username = authorName;
                realName = authorName;
            } else {
                username = '未知用户';
                realName = '未知用户';
            }
        }
        const content = log.get('content') || '';
        const images = log.get('images') || [];
        const createdAt = log.get('createdAt');
        const pageType = log.get('pageType') || 'main';
        
        // 页面类型标签
        const pageTypeLabels = {
            'main': '工作日志',
            'powerstation': '高压配电记录',
            'waterfilter': '水处理记录',
            'aircondition': '空调记录',
        };
        
        const pageTypeLabel = pageTypeLabels[pageType] || '工作日志';
        
        let imagesHtml = '';
        if (images.length > 0) {
            imagesHtml = `
                <div class="mt-4">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        ${images.map(imageUrl => `
                            <img src="${imageUrl}" 
                                 alt="日志图片" 
                                 class="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                 onclick="openImageModal('${imageUrl}')">
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // 操作按钮（删除和置顶）
        let actionButtonsHtml = '';
        if (this.currentUser && user) {
            const isPinned = log.get('isPinned') === true;
            // 检查用户权限 - 使用roles字段判断管理员权限
            const userRoles = this.currentUser.get('roles') || [];
            const isAdmin = userRoles.includes('admin');
            
            // 删除按钮（仅对当前用户的日志显示）
            if (user.id === this.currentUser.id) {
                actionButtonsHtml += `
                    <button onclick="mainPageApp.handleDeleteLog('${log.id}', this.closest('.log-item'))" 
                            class="text-red-500 hover:text-red-700 text-sm">
                        删除
                    </button>
                `;
            }
            
            // 置顶按钮（仅管理员可见）
            if (isAdmin) {
                actionButtonsHtml += `
                    <button onclick="if(!confirm('确定要${isPinned ? '取消置顶' : '置顶'}此日志吗？')) return false; 
                                   mainPageApp.togglePinLog('${log.id}', ${isPinned}, this.closest('.log-item'))" 
                            class="ml-2 ${isPinned ? 'text-yellow-500 hover:text-yellow-700' : 'text-gray-500 hover:text-gray-700'} text-sm">
                        ${isPinned ? '取消置顶' : '置顶'}
                    </button>
                `;
            }
        }
        
        logElement.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center space-x-2">
                    <span class="font-semibold text-gray-800">${realName}</span>
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${pageTypeLabel}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-gray-500 text-sm">${WorkLogUtils.getTimeAgo(createdAt)}</span>
                    ${actionButtonsHtml}
                </div>
            </div>
            <div class="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere log-content">${content}</div>
            ${imagesHtml}
        `;
        
        if (this.elements.logsList) {
            this.elements.logsList.appendChild(logElement);
        }
    }

    /**
     * 处理删除日志
     */
    async handleDeleteLog(logId, logElement) {
        if (!confirm('确定要删除这条日志吗？')) {
            return;
        }
        
        try {
            const WorkLog = AV.Object.extend('WorkLog');
            const log = AV.Object.createWithoutData('WorkLog', logId);
            await log.destroy();
            
            // 从DOM中移除
            if (logElement && logElement.parentNode) {
                logElement.parentNode.removeChild(logElement);
            }
            
            WorkLogUtils.showMessage('日志删除成功', 'success');
            
        } catch (error) {
            console.error('删除日志失败:', error);
            WorkLogUtils.showMessage('删除失败: ' + error.message, 'error');
        }
    }

    /**
     * 切换日志置顶状态
     */
    async togglePinLog(logId, isPinned, logElement) {
        try {
            const WorkLog = AV.Object.extend('WorkLog');
            const log = AV.Object.createWithoutData('WorkLog', logId);
            const newPinnedState = !isPinned;
            log.set('isPinned', newPinnedState);
            
            // 使用自定义字段记录置顶时间，避免修改系统保留字段
            log.set('pinnedAt', new Date());
            
            await log.save();
            WorkLogUtils.showMessage(`日志已${isPinned ? '取消置顶' : '置顶'}`, 'success');
            
            // 刷新当前日志项
            if (logElement) {
                const query = new AV.Query(WorkLog);
                query.include('user');
                const updatedLog = await query.get(logId);
                this.renderLogItem(updatedLog, logElement);
            }
            
            // 强制重新加载日志列表以确保排序正确
            this.resetLogsList();
            this.currentPage = 0;
            await this.loadLogs();
            
        } catch (error) {
            console.error('置顶操作失败:', error);
            WorkLogUtils.showMessage('操作失败: ' + error.message, 'error');
        }
    }

    /**
     * 设置无限滚动
     */
    setupInfiniteScroll() {
        window.addEventListener('scroll', this.handleScroll);
    }

    /**
     * 处理滚动事件
     */
    handleScroll() {
        if (this.isLoading || !this.hasMoreData) {
            return;
        }
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollTop + windowHeight >= documentHeight - 100) {
            this.loadLogs();
        }
    }

    /**
     * 显示编辑真实姓名模态框
     */
    showEditRealNameModal() {
        if (this.elements.editRealNameModal) {
            this.elements.editRealNameModal.classList.remove('hidden');
            
            // 设置当前真实姓名
            if (this.elements.newRealName && this.currentUser) {
                this.elements.newRealName.value = this.currentUser.get('realName') || '';
            }
        }
    }

    /**
     * 隐藏编辑真实姓名模态框
     */
    hideEditRealNameModal() {
        if (this.elements.editRealNameModal) {
            this.elements.editRealNameModal.classList.add('hidden');
        }
    }

    /**
     * 处理编辑真实姓名
     */
    async handleEditRealName(e) {
        e.preventDefault();
        
        const newRealName = this.elements.newRealName?.value?.trim();
        if (!newRealName) {
            WorkLogUtils.showMessage('请输入真实姓名', 'warning');
            return;
        }
        
        try {
            this.currentUser.set('realName', newRealName);
            await this.currentUser.save();
            
            WorkLogUtils.showMessage('真实姓名更新成功', 'success');
            this.hideEditRealNameModal();
            super.updateUserDisplay();
            
        } catch (error) {
            console.error('更新真实姓名失败:', error);
            WorkLogUtils.showMessage('更新失败: ' + error.message, 'error');
        }
    }



    /**
     * 初始化时自动同步离线日志
     */
    /**
     * 初始化下拉刷新
     */
    initPullToRefresh() {
        if (!window.PullToRefresh) return;
        
        // 销毁已有的下拉刷新实例
        if (this.ptr) {
            this.ptr.destroy();
        }
        
        this.ptr = PullToRefresh.init({
            mainElement: 'body',
            triggerElement: '#logsList',
            onRefresh: async () => {
                try {
                    this.resetLogsList();
                    await this.loadLogs();
                } catch (error) {
                    console.error('下拉刷新失败:', error);
                } finally {
                    if (this.ptr && typeof this.ptr.refresh === 'function') {
                        this.ptr.refresh();
                    }
                }
            },
            iconArrow: '&nbsp;',
            iconRefreshing: '<div class="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full loading"></div>',
            instructionsPullToRefresh: '下拉刷新',
            instructionsReleaseToRefresh: '释放刷新',
            instructionsRefreshing: '刷新中...',
            distThreshold: 60,
            distMax: 80,
            distReload: 50,
        });
    }

    async init() {
        await super.init?.();
        this.syncOfflineLogs();
        this.initPullToRefresh();
    }

    /**
     * 销毁应用
     */
    destroy() {
        super.destroy();
        window.removeEventListener('scroll', this.handleScroll);
        if (this.ptr) {
            this.ptr.destroy();
        }
    }
}

// 统计当前用户发表日志次数
async function updateMyPostCount() {
    if (!window.WorkLogAuth || !WorkLogAuth.getCurrentUser) return;
    const user = WorkLogAuth.getCurrentUser();
    if (!user) return;
    try {
        const query = new AV.Query('WorkLog');
        query.equalTo('user', user);
        const count = await query.count();
        const el = document.getElementById('myPostCount');
        if (el) el.textContent = count;
    } catch (e) {
        const el = document.getElementById('myPostCount');
        if (el) el.textContent = '--';
    }
}

// 登录后统计
window.addEventListener('userLoggedIn', updateMyPostCount);

// 全局图片模态框函数（保持向后兼容）
function openImageModal(imageUrl) {
    // 检查是否已存在模态框，避免重复创建
    const existingModal = document.querySelector('.image-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 image-modal';
    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-full p-4">
            <img src="${imageUrl}" alt="放大图片" class="max-w-full max-h-full object-contain">
            <button class="absolute top-2 right-2 text-white text-2xl hover:text-gray-300" onclick="document.querySelector('.image-modal').remove()">
                ×
            </button>
        </div>
    `;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}

// 导出模块
if (typeof window !== 'undefined') {
    window.MainPageApp = MainPageApp;
    window.openImageModal = openImageModal;
}