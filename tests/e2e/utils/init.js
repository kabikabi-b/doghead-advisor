/**
 * Jest 测试初始化文件
 */

// 模拟微信小程序环境
global.wx = {
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn()
  },
  getStorageSync: jest.fn(() => []),
  setStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn()
};

// 模拟 Page 构造函数
global.Page = function(config) {
  return config;
};

// 模拟 App 构造函数
global.App = function(config) {
  return config;
};
