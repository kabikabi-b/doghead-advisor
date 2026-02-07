/**
 * @jest-environment jsdom
 */

// ===== 全局 Mock 设置 =====

// 存储所有注册的事件处理函数
const pageHandlers = {};

global.Page = jest.fn((options) => {
  // 保存所有事件处理函数
  if (options.onLoad) pageHandlers.onLoad = options.onLoad;
  if (options.onShow) pageHandlers.onShow = options.onShow;
  if (options.onLikeTap) pageHandlers.onLikeTap = options.onLikeTap;
  if (options.onLoginTap) pageHandlers.onLoginTap = options.onLoginTap;
  if (options.loadUserData) pageHandlers.loadUserData = options.loadUserData;
  if (options.onGenerateTap) pageHandlers.onGenerateTap = options.onGenerateTap;
  if (options.onQuestionInput) pageHandlers.onQuestionInput = options.onQuestionInput;
  if (options.saveToHistory) pageHandlers.saveToHistory = options.saveToHistory;
  if (options.goToHistory) pageHandlers.goToHistory = options.goToHistory;
  if (options.onBackTap) pageHandlers.onBackTap = options.onBackTap;
  if (options.onCopyTap) pageHandlers.onCopyTap = options.onCopyTap;
  if (options.onAskAgainTap) pageHandlers.onAskAgainTap = options.onAskAgainTap;
  if (options.onSampleTap) pageHandlers.onSampleTap = options.onSampleTap;
  if (options.loadLikeData) pageHandlers.loadLikeData = options.loadLikeData;
  if (options.showToast) pageHandlers.showToast = options.showToast;
  if (options.onNicknameInput) pageHandlers.onNicknameInput = options.onNicknameInput;
  if (options.onQuestionTap) pageHandlers.onQuestionTap = options.onQuestionTap;
  if (options.onHistoryTap) pageHandlers.onHistoryTap = options.onHistoryTap;
  if (options.goToIndex) pageHandlers.goToIndex = options.goToIndex;
  if (options.onClearHistory) pageHandlers.onClearHistory = options.onClearHistory;
  if (options.onPullDownRefresh) pageHandlers.onPullDownRefresh = options.onPullDownRefresh;
  if (options.onShareAppMessage) pageHandlers.onShareAppMessage = options.onShareAppMessage;
  if (options.onVote) pageHandlers.onVote = options.onVote;
  if (options.onFilterTap) pageHandlers.onFilterTap = options.onFilterTap;
  if (options.loadRankList) pageHandlers.loadRankList = options.loadRankList;
  if (options.onUserTap) pageHandlers.onUserTap = options.onUserTap;
  if (options.onItemTap) pageHandlers.onItemTap = options.onItemTap;
  if (options.loadQuestions) pageHandlers.loadQuestions = options.loadQuestions;
  if (options.onTap) pageHandlers.onTap = options.onTap;
  if (options.onReachBottom) pageHandlers.onReachBottom = options.onReachBottom;
  if (options.goToAsk) pageHandlers.goToAsk = options.goToAsk;
  
  return {
    ...options,
    data: { ...options.data },
    setData: jest.fn(),
    showToast: jest.fn(),
    ...pageHandlers
  };
});

global.App = jest.fn(() => ({}));
global.getApp = jest.fn(() => ({}));
global.getCurrentPages = jest.fn(() => []);

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

// ===== 测试 =====

describe('结果页测试', () => {
  test('页面模块可加载', () => {
    expect(() => require('../../pages/result/result.js')).not.toThrow();
  });
  
  test('onLoad 方法存在', () => {
    require('../../pages/result/result.js');
    expect(pageHandlers.onLoad).toBeDefined();
  });
  
  test('onLikeTap 方法存在', () => {
    require('../../pages/result/result.js');
    expect(pageHandlers.onLikeTap).toBeDefined();
  });
  
  test('loadLikeData 方法存在', () => {
    require('../../pages/result/result.js');
    expect(pageHandlers.loadLikeData).toBeDefined();
  });
});

describe('个人中心测试', () => {
  test('页面模块可加载', () => {
    expect(() => require('../../pages/profile/profile.js')).not.toThrow();
  });
  
  test('onLoad 方法存在', () => {
    require('../../pages/profile/profile.js');
    expect(pageHandlers.onLoad).toBeDefined();
  });
  
  test('onLoginTap 方法存在', () => {
    require('../../pages/profile/profile.js');
    expect(pageHandlers.onLoginTap).toBeDefined();
  });
  
  test('loadUserData 方法存在', () => {
    require('../../pages/profile/profile.js');
    expect(pageHandlers.loadUserData).toBeDefined();
  });
});

describe('首页测试', () => {
  test('页面模块可加载', () => {
    expect(() => require('../../pages/index/index.js')).not.toThrow();
  });
  
  test('onGenerateTap 方法存在', () => {
    require('../../pages/index/index.js');
    expect(pageHandlers.onGenerateTap).toBeDefined();
  });
  
  test('onQuestionInput 方法存在', () => {
    require('../../pages/index/index.js');
    expect(pageHandlers.onQuestionInput).toBeDefined();
  });
  
  test('saveToHistory 方法存在', () => {
    require('../../pages/index/index.js');
    expect(pageHandlers.saveToHistory).toBeDefined();
  });
});

describe('社群页测试', () => {
  test('页面模块可加载', () => {
    expect(() => require('../../pages/community/community.js')).not.toThrow();
  });
  
  test('onVote 方法存在', () => {
    require('../../pages/community/community.js');
    expect(pageHandlers.onVote).toBeDefined();
  });
  
  test('loadQuestions 方法存在', () => {
    require('../../pages/community/community.js');
    expect(pageHandlers.loadQuestions).toBeDefined();
  });
});

describe('排行榜页测试', () => {
  test('页面模块可加载', () => {
    expect(() => require('../../pages/leaderboard/leaderboard.js')).not.toThrow();
  });
  
  test('onFilterTap 方法存在', () => {
    require('../../pages/leaderboard/leaderboard.js');
    expect(pageHandlers.onFilterTap).toBeDefined();
  });
  
  test('onPullDownRefresh 方法存在', () => {
    require('../../pages/leaderboard/leaderboard.js');
    expect(pageHandlers.onPullDownRefresh).toBeDefined();
  });
  
  test('onReachBottom 方法存在', () => {
    require('../../pages/leaderboard/leaderboard.js');
    expect(pageHandlers.onReachBottom).toBeDefined();
  });
});

describe('历史记录页测试', () => {
  test('页面模块可加载', () => {
    expect(() => require('../../pages/history/history.js')).not.toThrow();
  });
  
  test('onItemTap 方法存在', () => {
    require('../../pages/history/history.js');
    expect(pageHandlers.onItemTap).toBeDefined();
  });
  
  test('goToAsk 方法存在', () => {
    require('../../pages/history/history.js');
    expect(pageHandlers.goToAsk).toBeDefined();
  });
});
