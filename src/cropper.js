// 裁剪工具模块

import { elements, state } from './dom.js';
import { isSquareImage, showMessage } from './utils.js';
import { showImagePreview } from './ui.js';

// 裁剪比例设置
export const CROP_RATIO = {
  SQUARE: { width: 1, height: 1, name: '1:1 正方形', description: '正方形模式' },
  RECTANGLE: { width: 3, height: 2, name: '3:2 矩形', description: '矩形模式（推荐5/6人布局）' }
};

// 默认使用正方形比例
state.cropperRatio = CROP_RATIO.SQUARE;

// 切换裁剪比例
export function toggleCropperRatio() {
  // 切换裁剪比例
  state.cropperRatio = state.cropperRatio === CROP_RATIO.SQUARE ? 
                        CROP_RATIO.RECTANGLE : 
                        CROP_RATIO.SQUARE;
  
  // 更新比例按钮显示
  updateCropperRatioButton();
  
  // 更新当前裁剪框为新比例
  updateCropperBoxRatio();
  
  // 显示消息提示
  showMessage(`已切换为${state.cropperRatio.name}比例裁剪`, 'info');
}

// 更新裁剪比例按钮显示
function updateCropperRatioButton() {
  const ratioBtn = elements.cropperRatioToggle;
  if (ratioBtn) {
    ratioBtn.textContent = `切换为${state.cropperRatio === CROP_RATIO.SQUARE ? 
                            CROP_RATIO.RECTANGLE.name : 
                            CROP_RATIO.SQUARE.name}`;
    
    // 更新按钮下方的说明文字
    const ratioDescription = document.getElementById('ratio-description');
    if (ratioDescription) {
      ratioDescription.textContent = `当前: ${state.cropperRatio.description}`;
    }
  }
}

// 更新裁剪框比例
function updateCropperBoxRatio() {
  if (!state.cropperActive) return;
  
  // 获取当前裁剪框位置和大小
  const { x, y, width } = state.cropperData;
  
  // 计算新高度，保持当前比例
  const ratio = state.cropperRatio.height / state.cropperRatio.width;
  const newHeight = width * ratio;
  
  // 更新裁剪框样式
  elements.cropperBox.style.height = `${newHeight}px`;
  
  // 更新状态
  state.cropperData.height = newHeight;
}

// 初始化正方形选择工具
export function initCropper(imgSrc) {
  const img = new Image();
  img.src = imgSrc;
  
  img.onload = () => {
    // 即使图片是正方形，也显示裁剪界面，让用户自己决定是否需要裁剪
    // 这样对于5切或6切的场景，用户可以选择更合适的区域
    
    // 显示预览图片
    elements.previewPlaceholder.classList.add('hidden');
    elements.previewImageContainer.classList.remove('hidden');
    elements.previewImage.classList.remove('hidden');
    elements.previewImage.src = imgSrc;
    
    // 显示裁剪控件
    elements.cropperContainer.classList.remove('hidden');
    elements.cropperControls.classList.remove('hidden');
    
    // 根据成员数量检查是否为5人或6人布局
    const members = parseInt(elements.members.value);
    if (members === 5 || members === 6) {
      // 显示比例切换按钮
      if (elements.cropperRatioToggle) {
        elements.cropperRatioToggle.classList.remove('hidden');
        updateCropperRatioButton();
      }
      
      // 显示比例描述
      if (document.getElementById('ratio-description')) {
        document.getElementById('ratio-description').classList.remove('hidden');
      }
    } else {
      // 对于其他布局，使用默认正方形并隐藏切换按钮
      state.cropperRatio = CROP_RATIO.SQUARE;
      
      if (elements.cropperRatioToggle) {
        elements.cropperRatioToggle.classList.add('hidden');
      }
      
      if (document.getElementById('ratio-description')) {
        document.getElementById('ratio-description').classList.add('hidden');
      }
    }
    
    // 计算初始裁剪框位置
    const imgWidth = elements.previewImage.clientWidth;
    const imgHeight = elements.previewImage.clientHeight;
    
    // 获取当前裁剪比例
    const ratio = state.cropperRatio.height / state.cropperRatio.width;
    
    // 计算初始尺寸，保持比例
    let boxWidth = Math.min(imgWidth, imgHeight / ratio) * 0.8;
    let boxHeight = boxWidth * ratio;
    
    // 计算居中位置
    const x = (imgWidth - boxWidth) / 2;
    const y = (imgHeight - boxHeight) / 2;
    
    // 设置裁剪框样式
    elements.cropperBox.style.width = `${boxWidth}px`;
    elements.cropperBox.style.height = `${boxHeight}px`;
    elements.cropperBox.style.left = `${x}px`;
    elements.cropperBox.style.top = `${y}px`;
    
    // 保存裁剪框数据
    state.cropperData = {
      x,
      y,
      width: boxWidth,
      height: boxHeight,
      initialX: 0,
      initialY: 0
    };
    
    state.cropperActive = true;
    
    // 如果之前没有添加过事件监听器，添加拖动事件
    if (!state.cropperInitialized) {
      setupCropperEvents();
      state.cropperInitialized = true;
    }
    
    // 更新状态
    state.selectedImage = imgSrc;
    
    // 如果是正方形图片，显示提示消息
    if (isSquareImage(img)) {
      const members = parseInt(elements.members.value);
      if (members === 5 || members === 6) {
        showMessage('图片为正方形，已自动切换为3:2矩形模式', 'info', 4000);
        
        // 自动切换到矩形裁剪模式
        if (state.cropperRatio === CROP_RATIO.SQUARE) {
          // 短暂延迟后切换，让用户能看到界面先加载完
          setTimeout(() => {
            toggleCropperRatio();
          }, 300);
        }
      } else {
        showMessage('图片为正方形，您可以直接确认或调整裁剪区域', 'info', 3000);
      }
    } else if (members === 5 || members === 6) {
      // 对于非正方形图片，如果宽高比接近3:2，提示用户已经是理想比例
      const aspectRatio = img.width / img.height;
      if (Math.abs(aspectRatio - 1.5) < 0.1) {
        showMessage('图片比例接近3:2，非常适合当前布局', 'success', 3000);
      }
    }
  };
}

// 设置裁剪框事件
export function setupCropperEvents() {
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
      
      // 获取当前裁剪比例
      const ratio = state.cropperRatio.height / state.cropperRatio.width;
      
      // 根据拖动的角落调整大小，保持比例
      if (resizeDirection === 'bottom-right') {
        newWidth = width + deltaX;
        newHeight = newWidth * ratio;
      } else if (resizeDirection === 'bottom-left') {
        newWidth = width - deltaX;
        newHeight = newWidth * ratio;
        newX = x + deltaX;
      } else if (resizeDirection === 'top-right') {
        newWidth = width + deltaX;
        newHeight = newWidth * ratio;
        newY = y - (newHeight - height);
      } else if (resizeDirection === 'top-left') {
        newWidth = width - deltaX;
        newHeight = newWidth * ratio;
        newX = x + deltaX;
        newY = y + (height - newHeight);
      }
      
      // 限制最小尺寸和确保在图片范围内
      const minSize = 50;
      
      // 确保不小于最小尺寸
      if (newWidth < minSize) {
        const difference = minSize - newWidth;
        newWidth = minSize;
        newHeight = newWidth * ratio;
        
        // 根据拖动的角落调整位置
        if (resizeDirection === 'bottom-left' || resizeDirection === 'top-left') {
          newX = x - difference;
        }
        if (resizeDirection === 'top-left' || resizeDirection === 'top-right') {
          newY = y - difference * ratio;
        }
      }
      
      // 确保不超出图片边界
      if (newX < 0) {
        const difference = -newX;
        newX = 0;
        newWidth = Math.max(minSize, width - difference);
        newHeight = newWidth * ratio;
      }
      if (newY < 0) {
        const difference = -newY;
        newY = 0;
        newHeight = Math.max(minSize, height - difference);
        newWidth = newHeight / ratio;
      }
      if (newX + newWidth > imgRect.width) {
        newWidth = imgRect.width - newX;
        newHeight = newWidth * ratio;
      }
      if (newY + newHeight > imgRect.height) {
        newHeight = imgRect.height - newY;
        newWidth = newHeight / ratio;
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
}

// 应用裁剪
export function applyCrop() {
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
    
    // 重置裁剪比例为默认正方形
    state.cropperRatio = CROP_RATIO.SQUARE;
  };
}

// 重置裁剪工具
export function resetCropper() {
  // 重置裁剪框位置和大小
  const container = elements.cropperContainer;
  const box = elements.cropperBox;
  
  // 获取容器尺寸
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  
  // 获取当前裁剪比例
  const ratio = state.cropperRatio.height / state.cropperRatio.width;
  
  // 计算初始尺寸，保持比例
  let boxWidth = Math.min(containerWidth, containerHeight / ratio) * 0.7;
  let boxHeight = boxWidth * ratio;
  
  // 计算裁剪框的起始位置，居中显示
  const initialX = (containerWidth - boxWidth) / 2;
  const initialY = (containerHeight - boxHeight) / 2;
  
  // 设置裁剪框的位置和大小
  box.style.left = `${initialX}px`;
  box.style.top = `${initialY}px`;
  box.style.width = `${boxWidth}px`;
  box.style.height = `${boxHeight}px`;
  
  // 更新裁剪数据
  state.cropperData = {
    x: initialX,
    y: initialY,
    width: boxWidth,
    height: boxHeight,
    initialX: 0,
    initialY: 0
  };
  
  // 显示消息
  showMessage('已重置裁剪区域', 'info');
} 