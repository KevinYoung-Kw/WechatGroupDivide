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
export function loadDefaultImages(onImageClick, apiImages = null) {
  const defaultImagesContainer = document.getElementById('defaultImages');
  if (!defaultImagesContainer) return;
  
  // 使用API返回的图片列表或默认图片列表
  const defaultImages = apiImages || [
    { url: './images/default1.jpg', title: '沙滩日落' },
    { url: './images/default2.jpg', title: '蓝天白云' },
    { url: './images/default3.jpg', title: '山川河流' },
    { url: './images/default4.jpg', title: '粉色花朵' },
    { url: './images/default5.jpg', title: '绿色植物' },
    { url: './images/default6.jpg', title: '海洋风景' }
  ];
  
  // 清空容器
  defaultImagesContainer.innerHTML = '';
  
  // 添加默认图片
  defaultImages.forEach((image, index) => {
    const imageItem = document.createElement('div');
    imageItem.className = 'default-image-item';
    imageItem.setAttribute('data-index', index);
    
    const imgElement = document.createElement('img');
    imgElement.src = image.url;
    imgElement.alt = image.title || `默认图片 ${index + 1}`;
    imgElement.loading = 'lazy';
    
    const titleElement = document.createElement('span');
    titleElement.className = 'default-image-title';
    titleElement.textContent = image.title || `图片 ${index + 1}`;
    
    imageItem.appendChild(imgElement);
    imageItem.appendChild(titleElement);
    defaultImagesContainer.appendChild(imageItem);
    
    // 添加点击事件
    imageItem.addEventListener('click', () => {
      // 移除其他图片的选中状态
      document.querySelectorAll('.default-image-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // 添加选中状态
      imageItem.classList.add('selected');
      
      // 如果提供了回调函数，调用它
      if (typeof onImageClick === 'function') {
        onImageClick(image.url);
      }
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