// DOM 元素和状态管理模块

// DOM 元素
export const elements = {
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
  closeModalBtn: document.querySelector('.close-btn'),
  cropperRatioToggle: document.getElementById('cropperRatioToggle'),
  modalContent: document.getElementById('modalContent'),
  qrImage: document.getElementById('qrImage'),
  currentDate: document.getElementById('currentDate'),
  usageCount: document.getElementById('usageCount')
};

// 应用状态
export const state = {
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

// 验证DOM元素是否存在
export function validateElements() {
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.error(`DOM元素 ${key} 不存在，请检查ID是否正确`);
    }
  }
} 