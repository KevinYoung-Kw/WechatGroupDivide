import html2canvas from 'html2canvas';
import './style.css';

// DOM 元素
const elements = {
  members: document.getElementById('members'),
  imageUpload: document.getElementById('imageUpload'),
  defaultImages: document.getElementById('defaultImages'),
  drawerToggle: document.getElementById('drawerToggle'),
  drawerContent: document.getElementById('drawerContent'),
  colorDrawerToggle: document.getElementById('colorDrawerToggle'),
  colorDrawerContent: document.getElementById('colorDrawerContent'),
  colorPicker: document.getElementById('colorPicker'),
  colorPreview: document.getElementById('colorPreview'),
  generateColorBlock: document.getElementById('generateColorBlock'),
  previewPlaceholder: document.getElementById('previewPlaceholder'),
  previewImageContainer: document.getElementById('previewImageContainer'),
  previewImage: document.getElementById('previewImage'),
  cropperContainer: document.getElementById('cropperContainer'),
  cropperBox: document.getElementById('cropperBox'),
  cropperOverlay: document.getElementById('cropperOverlay'),
  cropperControls: document.getElementById('cropperControls'),
  confirmCrop: document.getElementById('confirmCrop'),
  resetCrop: document.getElementById('resetCrop'),
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
  croppedImages: [],
  cropperInitialized: false,
  cropperActive: false,
  cropperData: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    initialX: 0,
    initialY: 0
  }
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
      
      // 更新状态
      state.selectedImage = imgSrc;
      
      // 初始化裁剪工具
      initCropper(imgSrc);
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
  
  // 如果当前正在裁剪中但未确认，提示用户确认裁剪
  if (state.cropperActive) {
    showMessage('请先确认您的裁剪区域', 'warning');
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
  state.cropperActive = false;
  
  // 重置UI
  elements.previewPlaceholder.classList.remove('hidden');
  elements.previewImageContainer.classList.add('hidden');
  elements.previewImage.classList.add('hidden');
  elements.cropperContainer.classList.add('hidden');
  elements.cropperControls.classList.add('hidden');
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

// 检查图片是否为正方形
function isSquareImage(img) {
  // 允许1像素的误差，因为有些图片在压缩时可能会有细微差异
  return Math.abs(img.width - img.height) <= 1;
}

// 初始化正方形选择工具
function initCropper(imgSrc) {
  const img = new Image();
  img.src = imgSrc;
  
  img.onload = () => {
    // 只有非正方形图片才需要裁剪
    if (isSquareImage(img)) {
      // 如果是正方形，直接显示预览
      showImagePreview(imgSrc);
      return;
    }
    
    // 显示预览图片
    elements.previewPlaceholder.classList.add('hidden');
    elements.previewImageContainer.classList.remove('hidden');
    elements.previewImage.classList.remove('hidden');
    elements.previewImage.src = imgSrc;
    
    // 显示裁剪控件
    elements.cropperContainer.classList.remove('hidden');
    elements.cropperControls.classList.remove('hidden');
    
    // 计算初始裁剪框位置
    const imgWidth = elements.previewImage.clientWidth;
    const imgHeight = elements.previewImage.clientHeight;
    const size = Math.min(imgWidth, imgHeight) * 0.8; // 初始框大小为较小边的80%
    
    // 计算居中位置
    const x = (imgWidth - size) / 2;
    const y = (imgHeight - size) / 2;
    
    // 设置裁剪框样式
    elements.cropperBox.style.width = `${size}px`;
    elements.cropperBox.style.height = `${size}px`;
    elements.cropperBox.style.left = `${x}px`;
    elements.cropperBox.style.top = `${y}px`;
    
    // 保存裁剪框数据
    state.cropperData = {
      x,
      y,
      width: size,
      height: size,
      initialX: 0,
      initialY: 0
    };
    
    state.cropperActive = true;
    state.cropperInitialized = true;
    
    // 如果之前没有添加过事件监听器，添加拖动事件
    if (!state.cropperInitialized) {
      setupCropperEvents();
    }
  };
}

// 设置裁剪框事件
function setupCropperEvents() {
  let isDragging = false;
  let isResizing = false;
  let resizeDirection = '';
  
  // 添加调整大小的角落元素
  if (!document.getElementById('cropperResizeHandleBR')) {
    const corners = [
      { id: 'cropperResizeHandleBR', position: 'bottom-right' },
      { id: 'cropperResizeHandleBL', position: 'bottom-left' },
      { id: 'cropperResizeHandleTR', position: 'top-right' },
      { id: 'cropperResizeHandleTL', position: 'top-left' }
    ];
    
    corners.forEach(corner => {
      const resizeHandle = document.createElement('div');
      resizeHandle.id = corner.id;
      resizeHandle.className = `cropper-resize-handle ${corner.position}`;
      resizeHandle.setAttribute('data-position', corner.position);
      elements.cropperBox.appendChild(resizeHandle);
    });
  }
  
  // 鼠标/触摸开始
  const handleStart = (e) => {
    if (!state.cropperActive) return;
    
    // 阻止默认行为以防止选择图片等
    e.preventDefault();
    
    const target = e.target;
    
    // 检查是否在调整大小的手柄上开始操作
    if (target.classList.contains('cropper-resize-handle')) {
      isResizing = true;
      resizeDirection = target.getAttribute('data-position');
    } else {
      isDragging = true;
    }
    
    // 记录开始位置
    state.cropperData.initialX = e.clientX || e.touches[0].clientX;
    state.cropperData.initialY = e.clientY || e.touches[0].clientY;
  };
  
  // 鼠标/触摸移动
  const handleMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    e.preventDefault();
    
    const currentX = e.clientX || e.touches[0].clientX;
    const currentY = e.clientY || e.touches[0].clientY;
    
    // 计算移动距离
    const deltaX = currentX - state.cropperData.initialX;
    const deltaY = currentY - state.cropperData.initialY;
    
    // 更新初始位置
    state.cropperData.initialX = currentX;
    state.cropperData.initialY = currentY;
    
    if (isResizing) {
      // 获取图片尺寸
      const imgRect = elements.previewImage.getBoundingClientRect();
      
      // 当前裁剪框位置和尺寸
      let { x, y, width, height } = state.cropperData;
      let newWidth = width;
      let newHeight = height;
      let newX = x;
      let newY = y;
      
      // 根据拖动的角落调整大小
      if (resizeDirection === 'bottom-right') {
        newWidth = width + deltaX;
        newHeight = width + deltaX; // 保持正方形
      } else if (resizeDirection === 'bottom-left') {
        newWidth = width - deltaX;
        newHeight = width - deltaX; // 保持正方形
        newX = x + deltaX;
      } else if (resizeDirection === 'top-right') {
        newWidth = width + deltaX;
        newHeight = width + deltaX; // 保持正方形
        newY = y - deltaX;
      } else if (resizeDirection === 'top-left') {
        newWidth = width - deltaX;
        newHeight = width - deltaX; // 保持正方形
        newX = x + deltaX;
        newY = y + deltaX;
      }
      
      // 限制最小尺寸和确保在图片范围内
      const minSize = 50;
      
      // 确保不小于最小尺寸
      if (newWidth < minSize) {
        const difference = minSize - newWidth;
        newWidth = minSize;
        newHeight = minSize;
        
        // 根据拖动的角落调整位置
        if (resizeDirection === 'bottom-left' || resizeDirection === 'top-left') {
          newX = x - difference;
        }
        if (resizeDirection === 'top-left' || resizeDirection === 'top-right') {
          newY = y - difference;
        }
      }
      
      // 确保不超出图片边界
      if (newX < 0) {
        const difference = -newX;
        newX = 0;
        newWidth = Math.max(minSize, width - difference);
        newHeight = newWidth;
      }
      if (newY < 0) {
        const difference = -newY;
        newY = 0;
        newHeight = Math.max(minSize, height - difference);
        newWidth = newHeight;
      }
      if (newX + newWidth > imgRect.width) {
        newWidth = imgRect.width - newX;
        newHeight = newWidth;
      }
      if (newY + newHeight > imgRect.height) {
        newHeight = imgRect.height - newY;
        newWidth = newHeight;
      }
      
      // 更新裁剪框尺寸和位置
      elements.cropperBox.style.width = `${newWidth}px`;
      elements.cropperBox.style.height = `${newHeight}px`;
      elements.cropperBox.style.left = `${newX}px`;
      elements.cropperBox.style.top = `${newY}px`;
      
      // 更新状态
      state.cropperData.width = newWidth;
      state.cropperData.height = newHeight;
      state.cropperData.x = newX;
      state.cropperData.y = newY;
      
    } else if (isDragging) {
      // 移动逻辑
      let newX = state.cropperData.x + deltaX;
      let newY = state.cropperData.y + deltaY;
      
      // 获取图片尺寸
      const imgRect = elements.previewImage.getBoundingClientRect();
      
      // 限制裁剪框不超出图片范围
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + state.cropperData.width > imgRect.width) {
        newX = imgRect.width - state.cropperData.width;
      }
      if (newY + state.cropperData.height > imgRect.height) {
        newY = imgRect.height - state.cropperData.height;
      }
      
      // 更新裁剪框位置
      elements.cropperBox.style.left = `${newX}px`;
      elements.cropperBox.style.top = `${newY}px`;
      
      // 更新状态
      state.cropperData.x = newX;
      state.cropperData.y = newY;
    }
  };
  
  // 鼠标/触摸结束
  const handleEnd = () => {
    isDragging = false;
    isResizing = false;
    resizeDirection = '';
  };
  
  // 添加触摸事件
  elements.cropperBox.addEventListener('touchstart', handleStart, { passive: false });
  document.addEventListener('touchmove', handleMove, { passive: false });
  document.addEventListener('touchend', handleEnd);
  
  // 添加鼠标事件
  elements.cropperBox.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  
  // 确认裁剪
  elements.confirmCrop.addEventListener('click', applyCrop);
  
  // 重置裁剪
  elements.resetCrop.addEventListener('click', () => {
    if (!state.cropperActive) return;
    
    // 重新初始化裁剪框
    initCropper(state.selectedImage);
  });
}

// 应用裁剪
function applyCrop() {
  if (!state.cropperActive || !state.selectedImage) return;
  
  const img = new Image();
  img.src = state.selectedImage;
  
  img.onload = () => {
    // 创建Canvas绘制裁剪图像
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 获取原始图像比例
    const imgWidth = elements.previewImage.naturalWidth;
    const imgHeight = elements.previewImage.naturalHeight;
    const displayWidth = elements.previewImage.clientWidth;
    const displayHeight = elements.previewImage.clientHeight;
    
    // 计算缩放比例
    const scaleX = imgWidth / displayWidth;
    const scaleY = imgHeight / displayHeight;
    
    // 计算原始图像上的裁剪区域
    const cropX = state.cropperData.x * scaleX;
    const cropY = state.cropperData.y * scaleY;
    const cropWidth = state.cropperData.width * scaleX;
    const cropHeight = state.cropperData.height * scaleY;
    
    // 设置Canvas大小为裁剪大小
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    // 绘制裁剪区域
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    // 转换为数据URL
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
    
    // 更新预览图片
    showImagePreview(croppedImageUrl);
    
    // 更新选中的图片
    state.selectedImage = croppedImageUrl;
    
    // 隐藏裁剪控件
    elements.cropperContainer.classList.add('hidden');
    elements.cropperControls.classList.add('hidden');
    state.cropperActive = false;
  };
}

// 显示预览图片
function showImagePreview(imgSrc) {
  elements.previewPlaceholder.classList.add('hidden');
  elements.previewImageContainer.classList.remove('hidden');
  elements.previewImage.classList.remove('hidden');
  elements.previewImage.src = imgSrc;
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
      
      // 保存图片URL
      state.selectedImage = event.target.result;
      
      // 初始化裁剪工具
      initCropper(state.selectedImage);
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

// 切换色块抽屉
function toggleColorDrawer() {
  const drawerContent = elements.colorDrawerContent;
  const drawerIcon = elements.colorDrawerToggle.querySelector('.drawer-icon');
  
  if (drawerContent.classList.contains('open')) {
    drawerContent.classList.remove('open');
    drawerIcon.classList.remove('open');
  } else {
    drawerContent.classList.add('open');
    drawerIcon.classList.add('open');
  }
}

// 更新颜色预览
function updateColorPreview() {
  const color = elements.colorPicker.value;
  elements.colorPreview.style.backgroundColor = color;
}

// 生成纯色块
function generateColorBlock() {
  const color = elements.colorPicker.value;
  
  // 创建一个临时Canvas
  const canvas = document.createElement('canvas');
  const size = canvasSize;
  canvas.width = size;
  canvas.height = size;
  
  // 填充颜色
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // 转换为DataURL
  const dataUrl = canvas.toDataURL('image/png');
  
  // 初始化裁剪工具
  initCropper(dataUrl);
  
  // 关闭抽屉
  elements.colorDrawerContent.classList.remove('open');
  elements.colorDrawerToggle.querySelector('.drawer-icon').classList.remove('open');
  
  // 显示消息
  showMessage(`已生成 ${color} 色块`, 'success');
}

// 更新当前日期（东八区）
function updateCurrentDate() {
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
function updateUsageCount() {
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

// 初始化函数
function init() {
  // 验证DOM元素是否存在
  const checkElements = () => {
    for (const [key, element] of Object.entries(elements)) {
      if (!element) {
        console.error(`DOM元素 ${key} 不存在，请检查ID是否正确`);
      }
    }
  };
  
  // 检查元素
  checkElements();
  
  // 更新当前日期
  updateCurrentDate();
  
  // 更新使用人次
  updateUsageCount();
  
  // 加载默认图片
  loadDefaultImages();
  
  // 添加事件监听器
  elements.imageUpload.addEventListener('change', handleImageUpload);
  elements.divideBtn.addEventListener('click', createSlices);
  elements.downloadAll.addEventListener('click', downloadAllSlices);
  elements.resetBtn.addEventListener('click', resetTool);
  elements.confirmCrop.addEventListener('click', applyCrop);
  elements.resetCrop.addEventListener('click', resetCropper);
  elements.drawerToggle.addEventListener('click', toggleDrawer);
  elements.colorDrawerToggle.addEventListener('click', toggleColorDrawer);
  elements.colorPicker.addEventListener('input', updateColorPreview);
  elements.generateColorBlock.addEventListener('click', generateColorBlock);
  elements.closeModalBtn.addEventListener('click', closeModal);
  
  // 捐赠和社群按钮事件
  elements.donateBtn.addEventListener('click', () => {
    showQRModal('请作者喝杯咖啡', './images/donate-qr.png');
  });
  
  elements.communityBtn.addEventListener('click', () => {
    showQRModal('扫码加入社群', './images/community-qr.png');
  });
  
  // 添加色块预设点击事件
  document.querySelectorAll('.color-preset').forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.getAttribute('data-color');
      elements.colorPicker.value = color;
      updateColorPreview();
      
      // 移除其他预设的选中状态
      document.querySelectorAll('.color-preset').forEach(p => {
        p.classList.remove('selected');
      });
      
      // 添加当前预设的选中状态
      preset.classList.add('selected');
    });
  });
  
  // 设置裁剪事件
  setupCropperEvents();
  
  // 初始化颜色预览
  updateColorPreview();
}

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
  
  // 初始化裁剪工具事件
  setupCropperEvents();
  
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
document.addEventListener('DOMContentLoaded', init);

// 重置裁剪工具
function resetCropper() {
  // 重置裁剪框位置和大小
  const container = elements.cropperContainer;
  const box = elements.cropperBox;
  
  // 获取容器尺寸
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  
  // 计算初始裁剪框大小（容器的70%）
  const initialSize = Math.min(containerWidth, containerHeight) * 0.7;
  
  // 计算裁剪框的起始位置，居中显示
  const initialX = (containerWidth - initialSize) / 2;
  const initialY = (containerHeight - initialSize) / 2;
  
  // 设置裁剪框的位置和大小
  box.style.left = `${initialX}px`;
  box.style.top = `${initialY}px`;
  box.style.width = `${initialSize}px`;
  box.style.height = `${initialSize}px`;
  
  // 更新裁剪数据
  state.cropperData = {
    x: initialX,
    y: initialY,
    width: initialSize,
    height: initialSize,
    initialX: 0,
    initialY: 0
  };
  
  // 显示消息
  showMessage('已重置裁剪区域', 'info');
} 