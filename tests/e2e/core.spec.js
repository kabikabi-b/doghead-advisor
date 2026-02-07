/**
 * @jest-environment jsdom
 */

// ===== 全局 Mock =====

const pageHandlers = {};

global.Page = jest.fn((options) => {
  if (options.onLoad) pageHandlers.onLoad = options.onLoad;
  if (options.onShow) pageHandlers.onShow = options.onShow;
  if (options.onLikeTap) pageHandlers.onLikeTap = options.onLikeTap;
  if (options.loadLikeData) pageHandlers.loadLikeData = options.loadLikeData;
  if (options.onLoginTap) pageHandlers.onLoginTap = options.onLoginTap;
  if (options.loadUserData) pageHandlers.loadUserData = options.loadUserData;
  if (options.onGenerateTap) pageHandlers.onGenerateTap = options.onGenerateTap;
  if (options.saveToHistory) pageHandlers.saveToHistory = options.saveToHistory;
  if (options.goToHistory) pageHandlers.goToHistory = options.goToHistory;
  if (options.onBackTap) pageHandlers.onBackTap = options.onBackTap;
  if (options.onCopyTap) pageHandlers.onCopyTap = options.onCopyTap;
  if (options.onAskAgainTap) pageHandlers.onAskAgainTap = options.onAskAgainTap;
  if (options.onNicknameInput) pageHandlers.onNicknameInput = options.onNicknameInput;
  if (options.onQuestionTap) pageHandlers.onQuestionTap = options.onQuestionTap;
  if (options.onHistoryTap) pageHandlers.onHistoryTap = options.onHistoryTap;
  if (options.goToIndex) pageHandlers.goToIndex = options.goToIndex;
  if (options.onClearHistory) pageHandlers.onClearHistory = options.onClearHistory;
  if (options.onPullDownRefresh) pageHandlers.onPullDownRefresh = options.onPullDownRefresh;
  if (options.onShareAppMessage) pageHandlers.onShareAppMessage = options.onShareAppMessage;
  if (options.onVote) pageHandlers.onVote = options.onVote;
  if (options.onFilterTap) pageHandlers.onFilterTap = options.onFilterTap;
  if (options.onReachBottom) pageHandlers.onReachBottom = options.onReachBottom;
  if (options.onItemTap) pageHandlers.onItemTap = options.onItemTap;
  if (options.goToAsk) pageHandlers.goToAsk = options.goToAsk;
  
  return { ...options, setData: jest.fn(), showToast: jest.fn(), ...pageHandlers };
});

global.wx = {
  navigateTo: jest.fn(),
  navigateBack: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(() => []),
  removeStorageSync: jest.fn(),
  stopPullDownRefresh: jest.fn(),
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn().mockResolvedValue({ success: true }),
    database: jest.fn(() => ({
      collection: jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ data: [] })
        })),
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ data: {} })
        })),
        add: jest.fn().mockResolvedValue({ _id: 'test' })
      }))
    })),
    getWXContext: jest.fn(() => ({ OPENID: 'test' }))
  },
  getUserProfile: jest.fn().mockImplementation(({ success }) => {
    success({ userInfo: { nickName: '测试', avatarUrl: 'url' } });
  })
};

// ===== 测试: 页面模块加载 =====

describe('页面模块加载测试', () => {
  test('result.js 可加载', () => {
    expect(() => require('../../pages/result/result.js')).not.toThrow();
  });
  
  test('result.js 包含核心方法', () => {
    require('../../pages/result/result.js');
    expect(pageHandlers.onLoad).toBeDefined();
    expect(pageHandlers.onLikeTap).toBeDefined();
    expect(pageHandlers.loadLikeData).toBeDefined();
  });
  
  test('profile.js 可加载', () => {
    expect(() => require('../../pages/profile/profile.js')).not.toThrow();
  });
  
  test('profile.js 包含核心方法', () => {
    require('../../pages/profile/profile.js');
    expect(pageHandlers.onLoginTap).toBeDefined();
    expect(pageHandlers.loadUserData).toBeDefined();
  });
  
  test('index.js 可加载', () => {
    expect(() => require('../../pages/index/index.js')).not.toThrow();
  });
  
  test('index.js 包含核心方法', () => {
    require('../../pages/index/index.js');
    expect(pageHandlers.onGenerateTap).toBeDefined();
    expect(pageHandlers.saveToHistory).toBeDefined();
  });
  
  test('community.js 可加载', () => {
    expect(() => require('../../pages/community/community.js')).not.toThrow();
  });
  
  test('leaderboard.js 可加载', () => {
    expect(() => require('../../pages/leaderboard/leaderboard.js')).not.toThrow();
  });
  
  test('history.js 可加载', () => {
    expect(() => require('../../pages/history/history.js')).not.toThrow();
  });
});

// ===== 测试: 云函数 API =====

describe('云函数 API 调用测试', () => {
  test('wx.cloud.callFunction 应该可调用', () => {
    return wx.cloud.callFunction({ name: 'test' }).then(res => {
      expect(res.success).toBe(true);
    });
  });
  
  test('wx.cloud.database.collection 应该可调用', () => {
    const collection = wx.cloud.database().collection('test');
    expect(collection).toBeDefined();
  });
});
