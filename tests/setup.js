// 测试环境初始化
beforeAll(() => {
  // Mock global wx object
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
    
  global.getCurrentPages = jest.fn(() => [
    { route: 'pages/home/home' }
  ]);
  
  // 云开发
  cloud: {
    init: jest.fn(),
    database: jest.fn(() => ({
      collection: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              skip: jest.fn(() => ({
                get: jest.fn()
              }))
            }))
          }))
        })),
        add: jest.fn(),
        doc: jest.fn(() => ({
          update: jest.fn(),
          remove: jest.fn(),
          get: jest.fn()
        })),
        count: jest.fn()
      }))
    })),
    callFunction: jest.fn()
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
  
  // 媒体
  getBackgroundAudioManager: jest.fn(),
  getRecorderManager: jest.fn(),
  getCamera: jest.fn(),
  
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
  
  // 设备
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
  
  // 性能
  getPerformance: jest.fn(),
  
  // 调试
  setEnableDebug: jest.fn(),
  getLogManager: jest.fn()
  };
});

// 清理
afterAll(() => {
  jest.clearAllMocks();
});
