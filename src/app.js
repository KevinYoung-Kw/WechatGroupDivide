// 主应用程序入口

import html2canvas from 'html2canvas';
import './style.css';
import { elements, validateElements } from './dom.js';
import { updateCurrentDate, updateUsageCount, isMobile, showMessage } from './utils.js';
import { loadDefaultImages, showImagePreview, toggleDrawer, toggleColorDrawer, updateColorPreview, setupColorPresets, showQRModal, closeModal } from './ui.js';
import { initCropper, applyCrop, resetCropper, setupCropperEvents, toggleCropperRatio } from './cropper.js';
import { handleImageUpload, createSlices, downloadAllSlices, resetTool, generateColorBlock } from './imageProcessor.js';

// 动态加载JSZip (只在桌面端需要)
if (!isMobile) {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  script.integrity = 'sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

// 初始化函数
function init() {
  // 验证DOM元素是否存在
  validateElements();
  
  // 更新当前日期
  updateCurrentDate();
  
  // 更新使用人次
  updateUsageCount();
  
  // 加载默认图片
  loadDefaultImages(initCropper);
  
  // 设置色块预设
  setupColorPresets();
  
  // 添加自定义裁剪提示
  const cropHint = document.createElement('p');
  cropHint.className = 'crop-hint';
  cropHint.textContent = '广告位招租';
  
  // 将提示添加到成员选择下方
  if (elements.members && elements.members.parentNode) {
    elements.members.parentNode.insertBefore(cropHint, elements.members.nextSibling);
  }
  
  // 成员选择变化事件，只对5人和6人显示提示，更新裁剪提示
  elements.members.addEventListener('change', function(e) {
    const members = parseInt(e.target.value);
    // 显示或隐藏裁剪比例提示和按钮
    if (members === 5 || members === 6) {
      cropHint.textContent = '推荐使用3:2矩形裁剪以获得更好的显示效果';
      cropHint.style.fontWeight = 'bold';
      cropHint.style.opacity = '1';
      cropHint.style.visibility = 'visible';
      
      // 5秒后自动隐藏提示
      setTimeout(() => {
        cropHint.style.opacity = '0';
        cropHint.style.visibility = 'hidden';
      }, 5000);
      
      // 如果当前正在裁剪中，显示比例切换按钮
      if (elements.cropperRatioToggle && elements.cropperControls.classList.contains('hidden') === false) {
        elements.cropperRatioToggle.classList.remove('hidden');
        if (document.getElementById('ratio-description')) {
          document.getElementById('ratio-description').classList.remove('hidden');
        }
      }
    } else {
      cropHint.textContent = '拖动选择合适的区域';
      cropHint.style.fontWeight = 'normal';
      cropHint.style.opacity = '1';
      cropHint.style.visibility = 'visible';
      
      // 3秒后自动隐藏提示
      setTimeout(() => {
        cropHint.style.opacity = '0';
        cropHint.style.visibility = 'hidden';
      }, 3000);
      
      // 隐藏比例切换按钮
      if (elements.cropperRatioToggle) {
        elements.cropperRatioToggle.classList.add('hidden');
        if (document.getElementById('ratio-description')) {
          document.getElementById('ratio-description').classList.add('hidden');
        }
      }
    }
  });
  
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
  
  // 添加裁剪比例切换按钮事件
  if (elements.cropperRatioToggle) {
    elements.cropperRatioToggle.addEventListener('click', toggleCropperRatio);
  }
  
  // 捐赠和社群按钮事件
  elements.donateBtn.addEventListener('click', () => {
    showQRModal('请作者喝杯咖啡', './images/donate-qr.png');
  });
  
  elements.communityBtn.addEventListener('click', () => {
    showQRModal('扫码加入社群', './images/community-qr.png');
  });
  
  // 设置裁剪事件
  setupCropperEvents();
  
  // 初始化颜色预览
  updateColorPreview();
  
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

  // 更新cropper-hint标签
  const cropperHint = document.querySelector('.cropper-hint');
  if (cropperHint) {
    cropperHint.textContent = '拖动裁剪框或调整边角手柄';
  }
}

// 页面加载完成后处理
window.addEventListener('load', function() {
  // 加载默认图片
  loadDefaultImages(initCropper);
  
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
document.addEventListener('DOMContentLoaded', init); 