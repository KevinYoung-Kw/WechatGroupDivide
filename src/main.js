import html2canvas from 'html2canvas';
import './style.css';

// DOM 元素
const elements = {
  members: document.getElementById('members'),
  imageUpload: document.getElementById('imageUpload'),
  defaultImages: document.getElementById('defaultImages'),
  drawerToggle: document.getElementById('drawerToggle'),
  drawerContent: document.getElementById('drawerContent'),
  previewPlaceholder: document.getElementById('previewPlaceholder'),
  previewImage: document.getElementById('previewImage'),
  divideBtn: document.getElementById('divideBtn'),
  resultContainer: document.getElementById('resultContainer'),
  resultImages: document.getElementById('resultImages'),
  downloadAll: document.getElementById('downloadAll'),
  resetBtn: document.getElementById('resetBtn'),
  donateBtn: document.getElementById('donateBtn'),
  communityBtn: document.getElementById('communityBtn'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalImage: document.getElementById('modalImage'),
  closeModalBtn: document.querySelector('.close-btn')
};

// 状态
const state = {
  selectedImage: null,
  croppedImages: []
};

// 设备检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const canvasSize = isMobile ? 300 : 500;
const imageQuality = isMobile ? 0.9 : 1.0;

// 加载默认图片
function loadDefaultImages() {
  const defaultImagesContainer = document.getElementById('defaultImages');
  defaultImagesContainer.innerHTML = '';
  
  // 默认图片列表
  const defaultImages = [
    './images/default1.jpg',
    './images/default2.jpg',
    './images/default3.jpg',
    './images/default4.jpg',
    './images/default5.jpg',
    './images/default6.jpg'
  ];
  
  // 创建默认图片元素
  defaultImages.forEach((imgSrc, index) => {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'default-image-item';
    
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `默认图片 ${index + 1}`;
    img.loading = 'lazy'; // 懒加载优化
    
    imgContainer.appendChild(img);
    defaultImagesContainer.appendChild(imgContainer);
    
    // 添加点击事件
    imgContainer.addEventListener('click', () => {
      // 移除其他图片的选中状态
      document.querySelectorAll('.default-image-item').forEach(container => {
        container.classList.remove('selected');
      });
      
      // 添加选中状态
      imgContainer.classList.add('selected');
      
      // 更新预览
      elements.previewPlaceholder.classList.add('hidden');
      elements.previewImage.classList.remove('hidden');
      elements.previewImage.src = imgSrc;
      
      // 更新状态
      state.selectedImage = imgSrc;
    });
  });
}

// 计算切片布局
const calculateLayout = (members) => {
  switch (parseInt(members)) {
    case 2:
      return [
        { x: 0, y: 0, width: 1, height: 0.5 },
        { x: 0, y: 0.5, width: 1, height: 0.5 }
      ];
    case 3:
      return [
        { x: 0.25, y: 0, width: 0.5, height: 0.5 }, // 顶部块
        { x: 0, y: 0.5, width: 0.5, height: 0.5 },  // 左下块
        { x: 0.5, y: 0.5, width: 0.5, height: 0.5 } // 右下块
      ];
    case 4:
      return [
        { x: 0, y: 0, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0, width: 0.5, height: 0.5 },
        { x: 0, y: 0.5, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }
      ];
    case 5:
      return [
        { x: 0.17, y: 0, width: 0.33, height: 0.5 },     // 上左块
        { x: 0.5, y: 0, width: 0.33, height: 0.5 },      // 上右块
        { x: 0, y: 0.5, width: 0.33, height: 0.5 },      // 下左块
        { x: 0.33, y: 0.5, width: 0.34, height: 0.5 },   // 下中块
        { x: 0.67, y: 0.5, width: 0.33, height: 0.5 }    // 下右块
      ];
    case 6:
      return [
        { x: 0, y: 0, width: 0.33, height: 0.5 },      // 上左块
        { x: 0.33, y: 0, width: 0.34, height: 0.5 },   // 上中块
        { x: 0.67, y: 0, width: 0.33, height: 0.5 },   // 上右块
        { x: 0, y: 0.5, width: 0.33, height: 0.5 },    // 下左块
        { x: 0.33, y: 0.5, width: 0.34, height: 0.5 }, // 下中块
        { x: 0.67, y: 0.5, width: 0.33, height: 0.5 }  // 下右块
      ];
    case 7:
      return [
        { x: 0.33, y: 0, width: 0.34, height: 0.33 },   // 顶部块
        { x: 0, y: 0.33, width: 0.33, height: 0.34 },   // 中左块
        { x: 0.33, y: 0.33, width: 0.34, height: 0.34 },// 中中块
        { x: 0.67, y: 0.33, width: 0.33, height: 0.34 },// 中右块
        { x: 0, y: 0.67, width: 0.33, height: 0.33 },   // 下左块
        { x: 0.33, y: 0.67, width: 0.34, height: 0.33 },// 下中块
        { x: 0.67, y: 0.67, width: 0.33, height: 0.33 } // 下右块
      ];
    case 8:
      return [
        { x: 0.17, y: 0, width: 0.33, height: 0.33 },    // 上左块
        { x: 0.5, y: 0, width: 0.33, height: 0.33 },     // 上右块
        { x: 0, y: 0.33, width: 0.33, height: 0.34 },    // 中左块
        { x: 0.33, y: 0.33, width: 0.34, height: 0.34 }, // 中中块
        { x: 0.67, y: 0.33, width: 0.33, height: 0.34 }, // 中右块
        { x: 0, y: 0.67, width: 0.33, height: 0.33 },    // 下左块
        { x: 0.33, y: 0.67, width: 0.34, height: 0.33 }, // 下中块
        { x: 0.67, y: 0.67, width: 0.33, height: 0.33 }  // 下右块
      ];
    case 9:
      return [
        { x: 0, y: 0, width: 0.33, height: 0.33 },      // 左上块
        { x: 0.33, y: 0, width: 0.34, height: 0.33 },   // 中上块
        { x: 0.67, y: 0, width: 0.33, height: 0.33 },   // 右上块
        { x: 0, y: 0.33, width: 0.33, height: 0.34 },   // 左中块
        { x: 0.33, y: 0.33, width: 0.34, height: 0.34 },// 中中块
        { x: 0.67, y: 0.33, width: 0.33, height: 0.34 },// 右中块
        { x: 0, y: 0.67, width: 0.33, height: 0.33 },   // 左下块
        { x: 0.33, y: 0.67, width: 0.34, height: 0.33 },// 中下块
        { x: 0.67, y: 0.67, width: 0.33, height: 0.33 } // 右下块
      ];
    default:
      return [];
  }
};

// 创建切片
const createSlices = async () => {
  if (!state.selectedImage) {
    showMessage('请先选择或上传图片', 'error');
    return;
  }
  
  // 显示加载状态
  const originalBtnText = elements.divideBtn.textContent;
  elements.divideBtn.innerHTML = '<span class="loading-spinner"></span><span style="margin-left: 8px;">正在处理...</span>';
  elements.divideBtn.disabled = true;
  
  const members = elements.members.value;
  const layout = calculateLayout(members);
  
  // 清空之前的结果
  elements.resultImages.innerHTML = '';
  state.croppedImages = [];
  
  try {
    // 加载图片
    const img = new Image();
    img.src = state.selectedImage;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // 创建画布绘制原图
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 确保最终输出的每个切片都是正方形
    // 使用图片宽高的最大值作为画布的尺寸
    const size = Math.max(img.width, img.height);
    canvas.width = size;
    canvas.height = size;
    
    // 居中绘制图片
    const offsetX = (size - img.width) / 2;
    const offsetY = (size - img.height) / 2;
    ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
    
    // 创建切片结果容器
    let resultGrid;
    let bottomSection, middleSection, topSection;
    
    // 根据人数选择不同的布局
    switch (parseInt(members)) {
      case 2:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-2-persons';
        elements.resultImages.appendChild(resultGrid);
        break;
        
      case 3:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-3-persons';
        elements.resultImages.appendChild(resultGrid);
        break;
        
      case 4:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-4-persons';
        elements.resultImages.appendChild(resultGrid);
        break;
        
      case 5:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-5-persons';
        
        // 创建底部容器
        bottomSection = document.createElement('div');
        bottomSection.className = 'bottom';
        
        resultGrid.appendChild(bottomSection);
        elements.resultImages.appendChild(resultGrid);
        break;
        
      case 6:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-6-persons';
        elements.resultImages.appendChild(resultGrid);
        break;
        
      case 7:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-7-persons';
        
        // 创建顶部、中间和底部容器
        topSection = document.createElement('div');
        topSection.className = 'top';
        
        middleSection = document.createElement('div');
        middleSection.className = 'middle';
        
        bottomSection = document.createElement('div');
        bottomSection.className = 'bottom';
        
        resultGrid.appendChild(topSection);
        resultGrid.appendChild(middleSection);
        resultGrid.appendChild(bottomSection);
        elements.resultImages.appendChild(resultGrid);
        break;
        
      case 8:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-8-persons';
        
        // 创建顶部、中间和底部容器
        topSection = document.createElement('div');
        topSection.className = 'top';
        
        middleSection = document.createElement('div');
        middleSection.className = 'middle';
        
        bottomSection = document.createElement('div');
        bottomSection.className = 'bottom';
        
        resultGrid.appendChild(topSection);
        resultGrid.appendChild(middleSection);
        resultGrid.appendChild(bottomSection);
        elements.resultImages.appendChild(resultGrid);
        break;
        
      case 9:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-9-persons';
        elements.resultImages.appendChild(resultGrid);
        break;
        
      default:
        resultGrid = document.createElement('div');
        resultGrid.className = 'layout-4-persons';
        elements.resultImages.appendChild(resultGrid);
    }
    
    // 根据布局生成切片
    for (let i = 0; i < layout.length; i++) {
      const part = layout[i];
      
      // 创建切片画布
      const sliceCanvas = document.createElement('canvas');
      const sliceCtx = sliceCanvas.getContext('2d');
      
      // 设置切片画布大小为正方形
      const sliceSize = canvasSize;
      sliceCanvas.width = sliceSize;
      sliceCanvas.height = sliceSize;
      
      // 从原画布裁剪并绘制到切片画布
      sliceCtx.drawImage(
        canvas,
        part.x * size, part.y * size, part.width * size, part.height * size,
        0, 0, sliceSize, sliceSize
      );
      
      // 将切片转为数据URL
      const dataUrl = sliceCanvas.toDataURL('image/jpeg', imageQuality);
      state.croppedImages.push(dataUrl);
      
      // 创建结果元素
      const resultElement = document.createElement('div');
      resultElement.className = 'result-image';
      
      const resultImg = document.createElement('img');
      resultImg.src = dataUrl;
      resultImg.alt = `切片 ${i + 1}`;
      
      // 启用图片的长按保存功能（特别是在微信浏览器中）
      resultImg.setAttribute('data-downloadable', 'true');
      resultImg.setAttribute('data-long-press-save', 'true');
      // 允许右键和长按操作
      resultImg.addEventListener('contextmenu', (e) => {
        // 不阻止默认行为，允许长按/右键菜单
        return true;
      });
      
      // 针对3人和5人的特殊处理，根据设备类型和切片位置设置合适的objectFit
      if (members == 3) {
        if (i === 0) {
          resultImg.style.objectFit = 'contain';
        } else {
          resultImg.style.objectFit = 'cover';
        }
      } else if (members == 5) {
        if (i < 2) {
          resultImg.style.objectFit = 'contain';
        } else {
          resultImg.style.objectFit = 'cover';
        }
      } else if (members == 7) {
        if (i === 0) { // 顶部块
          resultImg.style.objectFit = 'contain';
        } else {
          resultImg.style.objectFit = 'cover';
        }
      } else if (members == 8) {
        if (i < 2) { // 顶部两块
          resultImg.style.objectFit = 'contain';
        } else {
          resultImg.style.objectFit = 'cover';
        }
      } else {
        // 4、6、9人布局都使用cover
        resultImg.style.objectFit = 'cover';
      }
      
      // 移除遮罩层，让图片可以直接长按保存
      // const overlay = document.createElement('div');
      // overlay.className = 'overlay';
      // overlay.innerHTML = '<span>长按保存</span>';
      
      resultElement.appendChild(resultImg);
      // resultElement.appendChild(overlay);
      
      // 根据不同人数布局添加到不同的容器中
      switch (parseInt(members)) {
        case 3:
          if (i === 0) {
            resultElement.className += ' top';
            resultGrid.appendChild(resultElement);
          } else if (i === 1) {
            resultElement.className += ' left';
            resultGrid.appendChild(resultElement);
          } else {
            resultElement.className += ' right';
            resultGrid.appendChild(resultElement);
          }
          break;
          
        case 5:
          if (i === 0) {
            resultElement.className += ' topleft';
            resultGrid.appendChild(resultElement);
          } else if (i === 1) {
            resultElement.className += ' topright';
            resultGrid.appendChild(resultElement);
          } else {
            // 将下方三个添加到底部行
            bottomSection.appendChild(resultElement);
          }
          break;
          
        case 7:
          if (i === 0) {
            topSection.appendChild(resultElement);
          } else if (i >= 1 && i <= 3) {
            // 中间行
            middleSection.appendChild(resultElement);
          } else {
            // 底部行
            bottomSection.appendChild(resultElement);
          }
          break;
          
        case 8:
          if (i < 2) {
            // 顶部行
            topSection.appendChild(resultElement);
          } else if (i >= 2 && i <= 4) {
            // 中间行
            middleSection.appendChild(resultElement);
          } else {
            // 底部行
            bottomSection.appendChild(resultElement);
          }
          break;
          
        default:
          resultGrid.appendChild(resultElement);
      }
      
      // 添加点击下载功能
      resultElement.addEventListener('click', () => {
        // 在移动设备上，点击应该不做任何操作，让用户可以长按保存
        if (isMobile) {
          showMessage('长按图片可直接保存到相册', 'info', 2000);
          return;
        }
        
        // 在桌面设备上才触发下载
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `微信群聊头像_${members}人_${i + 1}.jpg`;
        a.click();
      });
    }
    
    // 显示结果区域
    elements.resultContainer.classList.remove('hidden');
    
    // 滚动到结果区域
    elements.resultContainer.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('生成切片出错:', error);
    showMessage('生成切片失败，请重试', 'error');
  } finally {
    // 恢复按钮状态
    elements.divideBtn.innerHTML = originalBtnText;
    elements.divideBtn.disabled = false;
  }
};

// 下载所有切片
function downloadAllSlices() {
  if (!state.croppedImages.length) return;

  if (isMobile) {
    // 移动端上创建一个可见的提示
    showMessage('移动端暂不支持批量下载，请长按每张图片单独保存', 'warning', 5000);
    return;
  }

  // 桌面端使用JSZip打包下载
  const zip = new JSZip();
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  
  state.croppedImages.forEach((dataUrl, index) => {
    const imgData = dataUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    zip.file(`slice_${index + 1}.png`, imgData, { base64: true });
  });
  
  zip.generateAsync({ type: 'blob' }).then(function(content) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `wechat_group_avatar_${now}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

// 重置功能
function resetTool() {
  // 清空已有数据
  state.selectedImage = null;
  state.croppedImages = [];
  
  // 重置UI
  elements.previewImage.classList.add('hidden');
  elements.previewPlaceholder.classList.remove('hidden');
  elements.resultContainer.classList.add('hidden');
  elements.resultImages.innerHTML = '';
  
  // 移除默认图片选中状态
  document.querySelectorAll('.default-image-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // 重置文件输入
  elements.imageUpload.value = '';
  
  // 滚动回顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 处理图片上传
function handleImageUpload(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // 移除默认图片选中状态
      document.querySelectorAll('.default-image-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // 显示预览
      elements.previewPlaceholder.classList.add('hidden');
      elements.previewImage.classList.remove('hidden');
      elements.previewImage.src = event.target.result;
      
      // 更新状态
      state.selectedImage = event.target.result;
    };
    
    reader.readAsDataURL(e.target.files[0]);
  }
}

// 显示消息提示
function showMessage(message, type = 'info', duration = 3000) {
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

// 抽屉切换功能
function toggleDrawer() {
  const drawerContent = elements.drawerContent;
  const drawerIcon = elements.drawerToggle.querySelector('.drawer-icon');
  
  if (drawerContent.classList.contains('open')) {
    drawerContent.classList.remove('open');
    drawerIcon.classList.remove('open');
  } else {
    drawerContent.classList.add('open');
    drawerIcon.classList.add('open');
  }
}

// 显示二维码弹窗
function showQRModal(title, imagePath) {
  elements.modalTitle.textContent = title;
  elements.modalImage.src = imagePath;
  elements.modalImage.alt = title;
  elements.modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭弹窗
function closeModal() {
  elements.modal.classList.remove('active');
  setTimeout(() => {
    elements.modalImage.src = '';
    document.body.style.overflow = ''; // 恢复滚动
  }, 300);
}

// 注册事件监听器
elements.divideBtn.addEventListener('click', createSlices);
elements.imageUpload.addEventListener('change', handleImageUpload);
elements.downloadAll.addEventListener('click', downloadAllSlices);
elements.resetBtn.addEventListener('click', resetTool);
elements.drawerToggle.addEventListener('click', toggleDrawer);

// 捐赠和社群按钮事件
elements.donateBtn.addEventListener('click', () => {
  showQRModal('请作者喝杯咖啡', './images/donate-qr.png');
});

elements.communityBtn.addEventListener('click', () => {
  showQRModal('扫码加入社群', './images/community-qr.png');
});

elements.closeModalBtn.addEventListener('click', closeModal);

// 点击弹窗背景关闭弹窗
elements.modal.addEventListener('click', (e) => {
  if (e.target === elements.modal) {
    closeModal();
  }
});

// 按ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
    closeModal();
  }
});

// 处理图片长按保存
document.addEventListener('contextmenu', function(e) {
  // 如果点击的是切片图片，则允许默认行为（长按保存）
  if (e.target.tagName === 'IMG' && e.target.closest('#resultImages')) {
    // 允许默认行为，不阻止
    return true;
  } else {
    // 对于其他元素，阻止默认的右键菜单
    e.preventDefault();
  }
}, false);

// 动态加载JSZip (只在桌面端需要)
if (!isMobile) {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  script.integrity = 'sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

// 添加页面加载完成后的处理
window.addEventListener('load', function() {
  // 加载默认图片
  loadDefaultImages();
  
  // 添加提示信息
  const touchInfo = document.createElement('p');
  touchInfo.className = 'results-hint';
  touchInfo.textContent = '提示：点击复制，长按保存图片到相册';
  
  // 如果结果容器存在，添加提示
  if (elements.resultContainer) {
    const existingHint = elements.resultContainer.querySelector('.results-hint');
    if (existingHint) {
      existingHint.textContent = touchInfo.textContent;
    } else {
      elements.divideBtn.parentNode.appendChild(touchInfo);
    }
  }
  
  // 禁用长按菜单的CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .result-image img {
      -webkit-touch-callout: default !important;
      -webkit-user-select: auto !important;
      user-select: auto !important;
    }
  `;
  document.head.appendChild(style);
});

// 监听窗口大小变化，以便在需要时调整布局
window.addEventListener('resize', function() {
  // 当窗口尺寸变化时，可以在这里添加处理逻辑
  // 如果有生成的切片，可以考虑重新生成以适应新的屏幕尺寸
  // 目前我们不自动重新生成，避免在调整窗口大小时的性能问题
});

// 启动应用
loadDefaultImages(); 