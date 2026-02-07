/**
 * Global Jest Mocks for WeChat Mini Program
 */

// Mock Page, App, getApp, getCurrentPages
global.Page = jest.fn((options) => {
  const page = {
    ...options,
    data: {
      ...options.data,
      // 确保所有页面都有基本方法
      setData: jest.fn(),
      showToast: jest.fn(),
      navigateTo: jest.fn(),
      reLaunch: jest.fn(),
      navigateBack: jest.fn()
    }
  };
  return page;
});

global.App = jest.fn(() => ({}));

global.getApp = jest.fn(() => ({}));

global.getCurrentPages = jest.fn(() => []);

global.wx = {
  // 基础 API
  navigateTo: jest.fn(),
  navigateBack: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),
  showActionSheet: jest.fn(),
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(() => []),
  removeStorageSync: jest.fn(),
  getSystemInfoSync: jest.fn(() => ({
    brand: 'iPhone',
    model: 'iPhone 14',
    system: 'iOS 16.0',
    platform: 'devtools'
  })),
  
  // Cloud API
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn().mockResolvedValue({ success: true }),
    database: jest.fn(() => ({
      collection: jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ data: [] }),
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              skip: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({ data: [] })
              }))
            }))
          }))
        })),
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ data: {} }),
          update: jest.fn().mockResolvedValue({ success: true }),
          remove: jest.fn().mockResolvedValue({ success: true })
        })),
        add: jest.fn().mockResolvedValue({ _id: 'test-id' }),
        count: jest.fn().mockResolvedValue({ total: 0 })
      }))
    })),
    getWXContext: jest.fn(() => ({ OPENID: 'test-openid' }))
  },
  
  // User API
  getUserProfile: jest.fn().mockImplementation(({ success }) => {
    success({
      userInfo: {
        nickName: '测试用户',
        avatarUrl: 'https://test.com/avatar.png'
      }
    });
  }),
  
  // Share API
  onShareAppMessage: jest.fn(),
  
  // Pull down refresh
  stopPullDownRefresh: jest.fn()
};
