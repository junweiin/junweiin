/**
 * 工作日志应用配置文件
 * 包含LeanCloud配置和其他全局配置
 */

// LeanCloud 配置
const WORKLOG_CONFIG = {
    // LeanCloud配置
    LEANCLOUD: {
        APP_ID: 'epbCQbfBnJNaZv0O5CCLacgJ-gzGzoHsz',
        APP_KEY: '9atvXPb61ih8GXsOVHD8dRCh',
        SERVER_URL: 'https://epbcqbfb.lc-cn-n1-shared.com'
    },
    
    // 应用配置
    APP: {
        PAGE_SIZE: 10,
        IMAGE_MAX_WIDTH: 1080,
        IMAGE_QUALITY: 0.8,
        SAVE_TIMEOUT: 10000
    },
    
    // 消息类型配置
    MESSAGE_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        INFO: 'info',
        WARNING: 'warning'
    }
};

// 导出配置（兼容全局使用）
if (typeof window !== 'undefined') {
    window.WORKLOG_CONFIG = WORKLOG_CONFIG;
}