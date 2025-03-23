// 工具函数模块

// 设备检测
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
export const canvasSize = isMobile ? 300 : 500;
export const imageQuality = isMobile ? 0.9 : 1.0;

// 环境配置
export const ENV = {
  // 判断当前是否为生产环境
  isProd: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  
  // API基础路径
  get baseUrl() {
    return this.isProd ? 'https://wxdiv.kevinyoung0210.me/api' : 'http://localhost:3456';
  },
  
  // 获取完整API路径
  getApiUrl(endpoint) {
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }
};

// 显示消息提示
export function showMessage(message, type = 'info', duration = 3000) {
  // 创建消息元素
  const messageEl = document.createElement('div');
  messageEl.className = 'message-toast';
  messageEl.style.position = 'fixed';
  messageEl.style.top = '20px';
  messageEl.style.left = '50%';
  messageEl.style.transform = 'translateX(-50%)';
  messageEl.style.padding = '10px 20px';
  messageEl.style.borderRadius = '8px';
  messageEl.style.color = 'white';
  messageEl.style.zIndex = '1000';
  messageEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  messageEl.style.opacity = '0';
  messageEl.style.transform = 'translateX(-50%) translateY(-10px)';
  messageEl.style.textAlign = 'center';
  messageEl.style.maxWidth = '80%';
  messageEl.style.minWidth = '200px';
  
  // 设置类型样式
  switch (type) {
    case 'error':
      messageEl.style.backgroundColor = 'var(--error-color, #E88C8C)';
      break;
    case 'success':
      messageEl.style.backgroundColor = 'var(--success-color, #7B9E89)';
      break;
    case 'warning':
      messageEl.style.backgroundColor = 'var(--warning-color, #FFD166)';
      messageEl.style.color = '#333';
      break;
    default:
      messageEl.style.backgroundColor = 'var(--primary-color, #7B9E89)';
  }
  
  messageEl.textContent = message;
  document.body.appendChild(messageEl);
  
  // 显示消息
  setTimeout(() => {
    messageEl.style.opacity = '1';
    messageEl.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // 定时移除
  setTimeout(() => {
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateX(-50%) translateY(-10px)';
    
    setTimeout(() => {
      if (document.body.contains(messageEl)) {
        document.body.removeChild(messageEl);
      }
    }, 300);
  }, duration);
}

// 检查图片是否为正方形
export function isSquareImage(img) {
  // 允许1像素的误差，因为有些图片在压缩时可能会有细微差异
  return Math.abs(img.width - img.height) <= 1;
}

// 更新当前日期（东八区）
export function updateCurrentDate() {
  const now = new Date();
  
  // 调整为东八区时间
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    timeZone: 'Asia/Shanghai'
  };
  
  const dateStr = now.toLocaleDateString('zh-CN', options);
  document.getElementById('currentDate').textContent = dateStr;
}

// 更新使用人次
export async function updateUsageCount() {
  const usageCountElement = document.getElementById('usageCount');
  if (!usageCountElement) return;
  
  try {
    // 默认值，会在api.js导入后被替换为真实API调用
    let count = 0;
    
    // 尝试从本地存储获取初始值
    const storedCount = localStorage.getItem('usageCount');
    if (storedCount) {
      count = parseInt(storedCount, 10);
    } else {
      // 初始化本地存储
      localStorage.setItem('usageCount', count.toString());
    }
    
    // 显示使用次数
    usageCountElement.textContent = count;
    
    // API集成后，这里的逻辑会被替换
  } catch (error) {
    console.error('更新使用人次出错:', error);
  }
} 