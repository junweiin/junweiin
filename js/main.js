// 初始化页面功能
document.addEventListener('DOMContentLoaded', function() {
  // 初始化倒计时
  initCountdown();
  
  // 初始化Swiper轮播
  initSwiper();
  
  // 初始化预约弹窗
  initBookingModal();
  
  // 初始化导航功能
  initNavigation();
  
  // 初始化购买按钮
  initBuyButtons();
  
  // 初始化分享提示
  initShareTip();
  
  // 检测设备类型，移动设备显示导航按钮
  checkDevice();
});

// 倒计时功能
function initCountdown() {
  // 设置目标日期：2025年4月26日
  const targetDate = new Date('2025-04-26T00:00:00').getTime();
  
  // 更新倒计时
  function updateCountdown() {
    const currentDate = new Date().getTime();
    const timeRemaining = targetDate - currentDate;
    
    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = days.toString().padStart(2, '0');
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    } else {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
    }
  }
  
  // 立即更新一次
  updateCountdown();
  
  // 每秒更新一次
  setInterval(updateCountdown, 1000);
}

// 初始化Swiper轮播
function initSwiper() {
  new Swiper('.package-swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      // 当窗口宽度大于等于768px时
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      // 当窗口宽度大于等于1024px时
      1024: {
        slidesPerView: 3,
        spaceBetween: 40,
      },
    },
  });
}

// 初始化预约弹窗
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const bookNowBtn = document.getElementById('book-now-btn');
  const closeBtn = document.querySelector('.close-btn');
  const bookingForm = document.getElementById('booking-form');
  
  // 打开弹窗
  bookNowBtn.addEventListener('click', function() {
    modal.style.display = 'flex';
  });
  
  // 关闭弹窗
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // 点击弹窗外部关闭
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // 表单提交
  bookingForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // 获取表单数据
    const formData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      date: document.getElementById('date').value,
      people: document.getElementById('people').value,
      packageType: document.getElementById('package').value
    };
  
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      alert('请输入正确的手机号码');
      return;
    }
  
    try {
      // 替换为您的vika API地址和token
      const response = await fetch('https://api.vika.cn/fusion/v1/datasheets/dst89QMv5Ca857d7Ps/records?viewId=viwXm9h9UZajP', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer uskcZUvxWXvLIPXN0hUC6DK',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              "姓名": formData.name,
              "手机号": formData.phone,
              "预约日期": formData.date,
              "用餐人数": parseInt(formData.people),
              "套餐类型": formData.packageType === 'garlic' ? '蒜泥口味套餐' : 
                         formData.packageType === 'thirteen' ? '十三香口味套餐' : '香辣口味套餐',
              "提交时间": new Date().toISOString()
            }
          }]
        })
      });
  
      if (!response.ok) throw new Error('提交失败');
      alert('预约成功！数据已保存');
      modal.style.display = 'none';
      bookingForm.reset();
    } catch (error) {
      console.error('Error:', error);
      alert('提交失败，请稍后重试');
    }
  });
}

// 初始化导航功能
function initNavigation() {
  const navigateBtn = document.getElementById('navigate-btn');
  
  navigateBtn.addEventListener('click', function() {
    // 酒店坐标
    const latitude = 33.9608;
    const longitude = 116.8035;
    const address = '安徽省淮北市新型煤化工合成材料基地北路16号相润金鹏酒店';
    
    // 检测设备类型，使用不同的导航方式
    if (/Android/i.test(navigator.userAgent)) {
      // Android设备
      window.location.href = `geo:${latitude},${longitude}?q=${encodeURIComponent(address)}`;
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS设备
      window.location.href = `maps://maps.apple.com/?q=${encodeURIComponent(address)}&ll=${latitude},${longitude}`;
    } else {
      // 其他设备，打开百度地图网页版
      window.open(`https://api.map.baidu.com/marker?location=${latitude},${longitude}&title=${encodeURIComponent(address)}&content=${encodeURIComponent(address)}&output=html`);
    }
  });
}

// 初始化购买按钮
function initBuyButtons() {
  const buyButtons = document.querySelectorAll('.buy-now-btn');
  
  buyButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      // 打开预约弹窗
      document.getElementById('booking-modal').style.display = 'flex';
      
      // 根据点击的套餐按钮自动选择对应的套餐
      const packageCard = this.closest('.package-card');
      const packageTitle = packageCard.querySelector('h3').textContent;
      
      const packageSelect = document.getElementById('package');
      
      if (packageTitle.includes('蒜泥')) {
        packageSelect.value = 'garlic';
      } else if (packageTitle.includes('十三香')) {
        packageSelect.value = 'thirteen';
      } else if (packageTitle.includes('香辣')) {
        packageSelect.value = 'spicy';
      }
    });
  });
}

// 初始化分享提示
function initShareTip() {
  const shareTip = document.getElementById('share-tip');
  
  // 检测是否在微信浏览器中
  const isWechat = /MicroMessenger/i.test(navigator.userAgent);
  
  if (isWechat) {
    // 添加分享按钮点击事件
    document.addEventListener('click', function(event) {
      if (event.target.classList.contains('share-btn') || event.target.closest('.share-btn')) {
        shareTip.style.display = 'flex';
      }
    });
    
    // 点击分享提示关闭
    shareTip.addEventListener('click', function() {
      shareTip.style.display = 'none';
    });
  }
}

// 检测设备类型
function checkDevice() {
  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 导航按钮在移动设备上显示，在桌面设备上隐藏
  const navigateBtn = document.getElementById('navigate-btn');
  if (navigateBtn) {
    navigateBtn.style.display = isMobile ? 'flex' : 'none';
  }
  
  // 根据设备类型调整其他UI元素
  if (isMobile) {
    // 移动设备特定调整
    document.querySelector('.float-btn').style.display = 'flex';
  } else {
    // 桌面设备特定调整
    document.querySelector('.float-btn').style.display = 'none';
  }
}

// 在文件底部添加时间戳（保留原有代码）
const timestamp = new Date().getTime();
document.querySelector('meta[property="og:image"]').content += `?t=${timestamp}`;