// 检测是否在微信浏览器中
function isWechatBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
}

// 检测是否可以打开页面内容
function canAccessContent() {
  // 这里可以添加更多具体的检测逻辑
  return true;
}

// 控制微信提示浮层的显示
function initWechatTip() {
  const wechatTip = document.querySelector('.wechat-tip');
  if (!wechatTip) return;

  if (isWechatBrowser() && !canAccessContent()) {
    wechatTip.style.display = 'block';
  } else {
    wechatTip.style.display = 'none';
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initWechatTip);