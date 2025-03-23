// 图片处理模块

import { elements, state } from './dom.js';
import { isMobile, canvasSize, imageQuality, showMessage } from './utils.js';
import { calculateLayout } from './layoutCalculator.js';
import { initCropper } from './cropper.js';
import { showImagePreview } from './ui.js';

// 处理图片上传
export function handleImageUpload(e) {
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

// 创建切片
export const createSlices = async () => {
  if (!state.selectedImage) {
    showMessage('请先选择或上传图片', 'error');
    return;
  }
  
  // 如果当前正在裁剪中但未确认，提示用户确认裁剪
  if (state.cropperActive) {
    showMessage('请先确认您的裁剪区域', 'warning');
    return;
  }
  
  // 获取当前选择的人数
  const members = parseInt(elements.members.value);
  
  // 显示加载状态
  const originalBtnText = elements.divideBtn.textContent;
  elements.divideBtn.innerHTML = '<span class="loading-spinner"></span><span style="margin-left: 8px;">正在处理...</span>';
  elements.divideBtn.disabled = true;
  
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
    
    // 检查图片是否为3:2矩形裁剪（适合5人和6人布局）
    const isRectanguleCrop = (members === 5 || members === 6) && 
                            Math.abs(img.width / img.height - 3 / 2) < 0.1;
    
    // 创建画布绘制原图
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let size, offsetX, offsetY;
    
    if (isRectanguleCrop) {
      // 对于3:2矩形图片，保持原始比例
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      size = Math.max(img.width, img.height);
      offsetX = 0;
      offsetY = 0;
    } else {
      // 确保最终输出的每个切片都是正方形
      // 使用图片宽高的最大值作为画布的尺寸
      size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      
      // 居中绘制图片
      offsetX = (size - img.width) / 2;
      offsetY = (size - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
    }
    
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
      let srcX, srcY, srcWidth, srcHeight;
      
      if (isRectanguleCrop) {
        // 对于3:2矩形图片，需要计算实际裁剪区域
        srcX = part.x * img.width;
        srcY = part.y * img.height;
        srcWidth = part.width * img.width;
        srcHeight = part.height * img.height;
      } else {
        // 常规正方形裁剪
        srcX = part.x * size;
        srcY = part.y * size;
        srcWidth = part.width * size;
        srcHeight = part.height * size;
      }
      
      sliceCtx.drawImage(
        canvas,
        srcX, srcY, srcWidth, srcHeight,
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
      
      // 根据不同人数和位置设置合适的objectFit
      if (members === 3) {
        if (i === 0) {
          resultImg.style.objectFit = 'contain';
        } else {
          resultImg.style.objectFit = 'cover';
        }
      } else if (members === 5 || members === 6) {
        // 5人和6人布局使用cover，如果是3:2矩形，会自动处理好不拉伸
        resultImg.style.objectFit = 'cover';
      } else if (members === 7) {
        if (i === 0) { // 顶部块
          resultImg.style.objectFit = 'contain';
        } else {
          resultImg.style.objectFit = 'cover';
        }
      } else if (members === 8) {
        if (i < 2) { // 顶部两块
          resultImg.style.objectFit = 'contain';
        } else {
          resultImg.style.objectFit = 'cover';
        }
      } else {
        // 4、9人布局都使用cover
        resultImg.style.objectFit = 'cover';
      }
      
      resultElement.appendChild(resultImg);
      
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
    
    // 显示结果区域与提示
    elements.resultContainer.classList.remove('hidden');
    
    // 如果是5人或6人布局，添加特殊提示
    if (members === 5 || members === 6) {
      const specialHint = document.createElement('p');
      specialHint.className = 'special-layout-hint';
      specialHint.innerHTML = '提示：<strong>3:2矩形裁剪</strong>可获得更好的效果，避免图片变形';
      
      // 添加到结果容器前面
      if (elements.resultContainer.firstChild) {
        elements.resultContainer.insertBefore(specialHint, elements.resultContainer.firstChild);
      } else {
        elements.resultContainer.appendChild(specialHint);
      }
      
      // 5秒后自动删除提示元素
      setTimeout(() => {
        specialHint.addEventListener('animationend', () => {
          specialHint.remove();
        });
      }, 5000);
    } else {
      // 移除之前可能存在的特殊提示
      const existingHint = elements.resultContainer.querySelector('.special-layout-hint');
      if (existingHint) {
        existingHint.remove();
      }
    }
    
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
export function downloadAllSlices() {
  if (!state.croppedImages.length) return;

  if (isMobile) {
    // 移动端上创建一个可见的提示
    showMessage('移动端暂不支持批量下载，请长按每张图片单独保存', 'warning', 5000);
    return;
  }

  try {
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
  } catch (error) {
    console.error('下载切片出错:', error);
    showMessage('下载切片失败，请重试', 'error');
  }
}

// 重置功能
export function resetTool() {
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

// 生成纯色块
export function generateColorBlock() {
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
  
  // 显示预览
  showImagePreview(dataUrl);
  state.selectedImage = dataUrl;
  state.cropperActive = false;
  
  // 隐藏裁剪控件
  if (elements.cropperContainer) {
    elements.cropperContainer.classList.add('hidden');
  }
  if (elements.cropperControls) {
    elements.cropperControls.classList.add('hidden');
  }
  
  // 关闭抽屉
  elements.colorDrawerContent.classList.remove('open');
  elements.colorDrawerToggle.querySelector('.drawer-icon').classList.remove('open');
  
  // 自动下载纯色块
  if (!isMobile) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `纯色块_${color.replace('#', '')}.png`;
    a.click();
  }
  
  // 显示消息
  showMessage(`已生成 ${color} 色块${isMobile ? '，可长按图片保存' : ''}`, 'success');
} 