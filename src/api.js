// API模块

import { ENV, showMessage } from './utils.js';

/**
 * 通用请求函数
 * @param {string} endpoint - API端点
 * @param {Object} options - 请求选项
 * @param {boolean} silentFail - 是否静默处理失败（不显示错误）
 * @returns {Promise} - 响应结果
 */
async function request(endpoint, options = {}, silentFail = false) {
  const url = ENV.getApiUrl(endpoint);
  
  // 默认选项
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // 合并选项
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    // 设置请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
    
    fetchOptions.signal = controller.signal;
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    // 如果响应状态码不是2xx，抛出错误
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 解析响应JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // 静默处理连接错误，不在控制台显示错误
    if (silentFail || error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('ECONNREFUSED')) {
      if (endpoint.includes('images/default')) {
        console.log('🌳 API服务不可用，使用本地默认图片');
      } else if (endpoint.includes('stats')) {
        console.log('🔢 使用本地访问计数');
      } else {
        console.log(`⚠️ ${endpoint} 服务不可用，使用备用方案`);
      }
    } else {
      // 非连接错误正常显示
      console.error('API请求错误:', error);
      if (!silentFail) {
        showMessage(error.message || '网络请求失败，请稍后重试', 'error');
      }
    }
    throw error;
  }
}

/**
 * 统计使用次数
 * @returns {Promise<number>} - 当前使用次数
 */
export async function incrementUsageCount() {
  try {
    // 使用静默失败模式
    const data = await request('/stats/increment', { method: 'POST' }, true);
    return data.count;
  } catch (error) {
    // 失败时返回默认值0，不影响用户体验
    return 0;
  }
}

/**
 * 获取使用统计
 * @returns {Promise<Object>} - 使用统计数据
 */
export async function getStats() {
  try {
    return await request('/stats');
  } catch (error) {
    // 失败时返回默认对象
    return { count: 0 };
  }
}

/**
 * 获取默认图片列表
 * @returns {Promise<Array>} - 默认图片列表
 */
export async function getDefaultImages() {
  try {
    // 使用静默失败模式，不显示错误
    return await request('/images/default', {}, true);
  } catch (error) {
    // 静默失败，返回空数组
    return [];
  }
}

/**
 * 上报错误日志
 * @param {Object} errorData - 错误数据
 * @returns {Promise<void>}
 */
export async function logError(errorData) {
  try {
    await request('/logs/error', {
      method: 'POST',
      body: JSON.stringify(errorData)
    });
  } catch (error) {
    // 记录日志失败不需要向用户显示
    console.error('记录错误日志失败:', error);
  }
}

// 导出ENV配置，方便其他模块直接使用
export { ENV }; 