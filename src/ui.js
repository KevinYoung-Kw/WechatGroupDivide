// 用户界面工具模块

import { elements } from './dom.js';
import { showMessage } from './utils.js';

// 抽屉切换功能
export function toggleDrawer() {
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

// 切换色块抽屉
export function toggleColorDrawer() {
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
export function updateColorPreview() {
  const color = elements.colorPicker.value;
  elements.colorPreview.style.backgroundColor = color;
}

// 添加色块预设点击功能
export function setupColorPresets() {
  document.querySelectorAll('.color-preset').forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.dataset.color;
      
      // 更新颜色选择器和预览
      elements.colorPicker.value = color;
      elements.colorPreview.style.backgroundColor = color;
      
      // 添加选中效果
      document.querySelectorAll('.color-preset').forEach(p => {
        p.classList.remove('selected');
      });
      preset.classList.add('selected');
    });
  });
}

// 显示二维码弹窗
export function showQRModal(title, imagePath) {
  elements.modalTitle.textContent = title;
  elements.modalImage.src = imagePath;
  elements.modalImage.alt = title;
  elements.modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭弹窗
export function closeModal() {
  elements.modal.classList.remove('active');
  setTimeout(() => {
    elements.modalImage.src = '';
    document.body.style.overflow = ''; // 恢复滚动
  }, 300);
}

// 加载默认图片
export function loadDefaultImages(initCropperCallback) {
  const defaultImagesContainer = elements.defaultImages;
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
      
      // 初始化裁剪工具
      initCropperCallback(imgSrc);
    });
  });
}

// 显示预览图片
export function showImagePreview(imgSrc) {
  elements.previewPlaceholder.classList.add('hidden');
  elements.previewImageContainer.classList.remove('hidden');
  elements.previewImage.classList.remove('hidden');
  elements.previewImage.src = imgSrc;
} 