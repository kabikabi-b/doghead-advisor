/**
 * @jest-environment jsdom
 */

// Mock 微信 API - 完善版
global.wx = {
  // 路由
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
  
  // 存储
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  
  // 云开发
  cloud: {
    init: jest.fn(),
    database: jest.fn(() => ({
      collection: jest.fn((name) => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              skip: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({ data: [] })
              }))
            }))
          })),
          get: jest.fn().mockResolvedValue({ data: [] }),
          doc: jest.fn(() => ({
            update: jest.fn().mockResolvedValue({ success: true }),
            remove: jest.fn().mockResolvedValue({ success: true }),
            get: jest.fn().mockResolvedValue({ data: {} })
          })),
          add: jest.fn().mockResolvedValue({ _id: 'test-id' }),
          count: jest.fn().mockResolvedValue({ total: 0 })
        }))
      }))
    })),
    callFunction: jest.fn().mockResolvedValue({ 
      success: true, 
      reply: '测试回复',
      questionId: '123'
    })
  },
  
  // UI
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  showActionSheet: jest.fn(),
  
  // 网络
  request: jest.fn(),
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  
  // 选择
  chooseImage: jest.fn(),
  chooseVideo: jest.fn(),
  chooseMessageFile: jest.fn(),
  
  // 设备信息
  getSystemInfoSync: jest.fn(() => ({
    brand: 'iPhone',
    model: 'iPhone 14',
    system: 'iOS 16.0',
    platform: 'devtools',
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 812
  })),
  
  // 位置
  getLocation: jest.fn(),
  chooseLocation: jest.fn(),
  
  // 用户
  getUserProfile: jest.fn(),
  login: jest.fn(),
  checkSession: jest.fn(),
  
  // 设置
  getSetting: jest.fn(),
  openSetting: jest.fn(),
  
  // 分享
  onShareAppMessage: jest.fn(),
  showShareMenu: jest.fn(),
  
  // 支付
  requestPayment: jest.fn(),
  
  // 订阅
  requestSubscribeMessage: jest.fn(),
  
  // 性能
  getPerformance: jest.fn(),
  
  // 下拉刷新
  stopPullDownRefresh: jest.fn()
};

// Mock getCurrentPages
global.getCurrentPages = jest.fn(() => [
  { route: 'pages/index/index' }
]);

// Mock Page
global.Page = jest.fn((options) => {
  return {
    ...options,
    setData: jest.fn(function(data) {
      Object.assign(this.data, data);
    }),
    data: {}
  };
});

// Mock App
global.getApp = jest.fn(() => ({
  globalData: {}
}));

function mockWx() {
  // Reset mocks
  jest.clearAllMocks();
  
  // Default mock implementations
  wx.navigateTo.mockReset();
  wx.switchTab.mockReset();
  wx.showToast.mockReset();
  wx.setStorageSync.mockReset();
  wx.cloud.callFunction.mockReset();
}

function mockDatabase() {
  wx.cloud.database.mockReturnValue({
    collection: jest.fn((name) => ({
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            skip: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ data: [] })
            }))
          }))
        })),
        get: jest.fn().mockResolvedValue({ data: [] }),
        doc: jest.fn(() => ({
          update: jest.fn().mockResolvedValue({ success: true }),
          remove: jest.fn().mockResolvedValue({ success: true }),
          get: jest.fn().mockResolvedValue({ data: {} })
        })),
        add: jest.fn().mockResolvedValue({ _id: 'test-id' }),
        count: jest.fn().mockResolvedValue({ total: 0 })
      }))
    }))
  });
}

module.exports = { mockWx, mockDatabase };
