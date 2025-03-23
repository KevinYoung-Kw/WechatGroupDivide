// 主应用程序入口

import html2canvas from 'html2canvas';
import './style.css';
import { elements, validateElements } from './dom.js';
import { updateCurrentDate, updateUsageCount, isMobile, showMessage } from './utils.js';
import { loadDefaultImages, showImagePreview, toggleDrawer, toggleColorDrawer, updateColorPreview, setupColorPresets, showQRModal, closeModal } from './ui.js';
import { initCropper, applyCrop, resetCropper, setupCropperEvents, toggleCropperRatio } from './cropper.js';
import { handleImageUpload, createSlices, downloadAllSlices, resetTool, generateColorBlock } from './imageProcessor.js';
import { incrementUsageCount, getDefaultImages, ENV, logError } from './api.js';

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
  
  // 记录并更新使用人次
  updateUsageAndSetupEnvironment();
  
  // 加载默认图片
  loadDefaultImagesFromApi();
  
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

  // 添加环境显示标记（仅在开发环境）
  if (!ENV.isProd && window.location.hostname !== 'preview.wxgroupdiv.com' && 
      !window.location.hostname.includes('preview')) {
    const envLabel = document.createElement('div');
    envLabel.className = 'env-label';
    envLabel.textContent = '测试环境';
    envLabel.style.position = 'fixed';
    envLabel.style.bottom = '10px';
    envLabel.style.right = '10px';
    envLabel.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    envLabel.style.color = 'white';
    envLabel.style.padding = '5px 10px';
    envLabel.style.borderRadius = '4px';
    envLabel.style.fontSize = '12px';
    envLabel.style.zIndex = '9999';
    document.body.appendChild(envLabel);
  }
  
  // 添加全局错误捕获
  setupErrorHandling();
}

// 设置全局错误处理
function setupErrorHandling() {
  // 捕获未处理的Promise错误
  window.addEventListener('unhandledrejection', event => {
    console.error('未处理的Promise错误:', event.reason);
    
    // 在生产环境上报错误
    if (ENV.isProd) {
      logError({
        type: 'unhandledrejection',
        message: event.reason ? event.reason.message : 'Promise错误',
        stack: event.reason ? event.reason.stack : '',
        url: window.location.href,
        time: new Date().toISOString()
      });
    }
  });
  
  // 捕获全局JavaScript错误
  window.addEventListener('error', event => {
    console.error('JavaScript错误:', event.error);
    
    // 在生产环境上报错误
    if (ENV.isProd) {
      logError({
        type: 'error',
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : '',
        url: window.location.href,
        time: new Date().toISOString()
      });
    }
    
    return false;
  }, true);
}

// 更新使用统计并设置环境
async function updateUsageAndSetupEnvironment() {
  // 显示环境信息
  console.log(`当前环境: ${ENV.isProd ? '生产环境' : '开发环境'}`);
  console.log(`API地址: ${ENV.baseUrl}`);
  
  // 更新初始使用次数
  const usageCountElement = elements.usageCount;
  if (usageCountElement) {
    try {
      // 尝试获取本地存储的计数
      const storedCount = localStorage.getItem('usageCount');
      
      // 如果本地存储中有计数，使用它
      if (storedCount) {
        usageCountElement.textContent = storedCount;
        // 增加本地计数并保存
        const newCount = parseInt(storedCount) + 1;
        localStorage.setItem('usageCount', newCount.toString());
        console.log('使用本地存储的计数:', newCount);
        return;
      }
      
      // 如果没有本地存储的计数，尝试从API获取
      const count = await incrementUsageCount();
      if (count > 0) {
        usageCountElement.textContent = count;
        localStorage.setItem('usageCount', count.toString());
      } else {
        // API返回无效计数，使用默认值
        const defaultCount = parseInt(usageCountElement.textContent || '27');
        localStorage.setItem('usageCount', defaultCount.toString());
      }
    } catch (error) {
      // 出错时使用本地存储的数据或默认值
      console.error('获取使用统计失败:', error);
      const storedCount = localStorage.getItem('usageCount');
      const defaultCount = parseInt(usageCountElement.textContent || '27');
      
      if (!storedCount) {
        localStorage.setItem('usageCount', defaultCount.toString());
      }
      
      usageCountElement.textContent = storedCount || defaultCount;
    }
  }
}

// 从API加载默认图片
async function loadDefaultImagesFromApi() {
  try {
    // 尝试从API获取默认图片列表
    const images = await getDefaultImages();
    
    if (Array.isArray(images) && images.length > 0) {
      console.log('✅ 成功从API获取默认图片列表');
      // 使用API返回的图片数据
      loadDefaultImages(initCropper, images);
    } else {
      console.log('🔄 使用本地默认图片');
      // 使用本地默认图片列表
      loadDefaultImages(initCropper);
    }
  } catch (error) {
    // API请求失败，使用本地默认图片
    console.log('🔄 使用本地默认图片');
    loadDefaultImages(initCropper);
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