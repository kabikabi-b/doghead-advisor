/**
 * @jest-environment jsdom
 */

// Mock 微信 API
global.wx = {
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  getSystemInfoSync: jest.fn(() => ({
    brand: 'iPhone',
    model: 'iPhone 14',
    system: 'iOS 16.0',
    platform: 'devtools',
    screenWidth: 375,
    screenHeight: 812
  })),
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
    callFunction: jest.fn().mockResolvedValue({ success: true })
  },
  stopPullDownRefresh: jest.fn()
};

global.Page = jest.fn((options) => {
  return {
    ...options,
    setData: jest.fn(function(data) {
      Object.assign(this.data, data);
    }),
    data: {}
  };
});

global.getCurrentPages = jest.fn(() => []);

const { mockWx } = require('./utils/mock-wx');

describe('首页 (Index) 测试', () => {
  let indexPage;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockWx();
    global.wx.cloud.callFunction.mockResolvedValue({
      success: true,
      reply: '测试回复',
      questionId: '123'
    });
    global.wx.getStorageSync.mockReturnValue([]);
    
    // 重置 Page
    global.Page = jest.fn((options) => {
      indexPage = {
        ...options,
        data: {
          question: '',
          loading: false,
          sampleQuestions: [
            '今天运气怎么样？',
            '老板不给涨工资怎么办？',
            '如何追到女神？',
            '女朋友生气了怎么办？',
            '今天吃什么比较好？'
          ]
        },
        setData: jest.fn()
      };
      return indexPage;
    });
  });
  
  describe('页面初始化', () => {
    test('页面应该正确初始化', () => {
      require('../../pages/index/index.js');
      expect(global.Page).toHaveBeenCalled();
    });
    
    test('初始化时问题为空', () => {
      require('../../pages/index/index.js');
      expect(indexPage.data.question).toBe('');
    });
    
    test('初始化时 loading 为 false', () => {
      require('../../pages/index/index.js');
      expect(indexPage.data.loading).toBe(false);
    });
    
    test('应该有示例问题列表', () => {
      require('../../pages/index/index.js');
      expect(indexPage.data.sampleQuestions.length).toBe(5);
    });
  });
  
  describe('输入处理', () => {
    test('onQuestionInput 应该更新问题', () => {
      require('../../pages/index/index.js');
      const mockEvent = { detail: { value: '测试问题' } };
      indexPage.onQuestionInput(mockEvent);
      expect(indexPage.setData).toHaveBeenCalledWith({ question: '测试问题' });
    });
  });
  
  describe('示例问题点击', () => {
    test('onSampleTap 应该设置问题', () => {
      require('../../pages/index/index.js');
      const mockEvent = { currentTarget: { dataset: { question: '示例问题' } } };
      indexPage.onSampleTap(mockEvent);
      expect(indexPage.setData).toHaveBeenCalledWith({ question: '示例问题' });
    });
  });
  
  describe('生成回复', () => {
    test('空问题不应该生成回复', () => {
      require('../../pages/index/index.js');
      indexPage.data.question = '';
      indexPage.onGenerateTap();
      expect(global.wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '请输入问题' })
      );
    });
    
    test('有效问题应该调用云函数', () => {
      require('../../pages/index/index.js');
      indexPage.data.question = '测试问题';
      indexPage.onGenerateTap();
      expect(global.wx.cloud.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'generateReply',
          data: { question: '测试问题' }
        })
      );
    });
    
    test('生成中应该显示 loading', () => {
      require('../../pages/index/index.js');
      indexPage.data.question = '测试问题';
      indexPage.onGenerateTap();
      expect(indexPage.setData).toHaveBeenCalledWith({ loading: true });
    });
  });
  
  describe('历史记录', () => {
    test('saveToHistory 应该保存到本地存储', () => {
      require('../../pages/index/index.js');
      indexPage.saveToHistory('问题', '回复');
      expect(global.wx.setStorageSync).toHaveBeenCalledWith(
        'history',
        expect.any(Array)
      );
    });
  });
  
  describe('导航', () => {
    test('goToHistory 应该跳转到历史页面', () => {
      require('../../pages/index/index.js');
      indexPage.goToHistory();
      expect(global.wx.navigateTo).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/pages/history/history' })
      );
    });
  });
});
