// 工具函数模块

// 设备检测
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
export const canvasSize = isMobile ? 300 : 500;
export const imageQuality = isMobile ? 0.9 : 1.0;

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

// 更新使用人次计数
export function updateUsageCount() {
  // 获取计数服务器地址 - 生产环境地址
  const countApiUrl = 'http://wxdiv.kevinyoung0210.me/api/count';
  // 本地开发环境可以使用 'http://localhost:3456/api/count' 
  
  // 首先从API获取当前计数
  fetch(countApiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('获取计数失败');
      }
      return response.json();
    })
    .then(data => {
      // 更新显示的计数
      document.getElementById('usageCount').textContent = data.count;
      
      // 检查本地存储中是否已经记录了此用户的访问
      const hasVisited = localStorage.getItem('wechatDivideHasVisited');
      
      // 如果是新用户（未访问过），增加计数
      if (!hasVisited) {
        // 请求增加计数API
        fetch(`${countApiUrl}/increment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('增加计数失败');
            }
            return response.json();
          })
          .then(data => {
            // 更新显示的计数
            document.getElementById('usageCount').textContent = data.count;
            
            // 将访问标记存储到本地
            localStorage.setItem('wechatDivideHasVisited', 'true');
          })
          .catch(error => {
            console.error('增加计数错误:', error);
          });
      }
    })
    .catch(error => {
      console.error('获取计数错误:', error);
      
      // 出错时回退到使用本地存储的静态数字
      const fallbackCount = document.getElementById('usageCount').textContent || '27';
      document.getElementById('usageCount').textContent = fallbackCount;
    });
} 