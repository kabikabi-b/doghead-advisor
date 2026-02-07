/**
 * @jest-environment jsdom
 */

// Mock 微信 API
global.wx = {
  navigateTo: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(() => null),
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn().mockResolvedValue({
      success: true,
      userInfo: { nickName: '测试用户', avatarUrl: '🐕' },
      stats: { totalQuestions: 5, totalLikes: 10, guguRate: 20 },
      myQuestions: []
    })
  },
  stopPullDownRefresh: jest.fn()
};

global.Page = jest.fn((options) => {
  return {
    ...options,
    setData: jest.fn(function(data) {
      Object.assign(this.data, data);
    }),
    data: {
      userInfo: null,
      stats: { totalQuestions: 0, totalLikes: 0, guguRate: 0 },
      myQuestions: [],
      loading: false
    }
  };
});

global.getCurrentPages = jest.fn(() => []);

describe('个人中心页 (Profile) 测试', () => {
  let profilePage;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.Page = jest.fn((options) => {
      profilePage = {
        ...options,
        data: {
          userInfo: null,
          stats: { totalQuestions: 0, totalLikes: 0, guguRate: 0 },
          myQuestions: [],
          loading: false
        },
        setData: jest.fn()
      };
      return profilePage;
    });
  });
  
  describe('页面初始化', () => {
    test('页面应该正确初始化', () => {
      require('../../pages/profile/profile.js');
      expect(global.Page).toHaveBeenCalled();
    });
    
    test('统计数据应该初始化', () => {
      require('../../pages/profile/profile.js');
      expect(profilePage.data.stats).toEqual({
        totalQuestions: 0,
        totalLikes: 0,
        guguRate: 0
      });
    });
  });
  
  describe('数据加载', () => {
    test('loadUserData 应该调用云函数', () => {
      require('../../pages/profile/profile.js');
      profilePage.loadUserData();
      expect(global.wx.cloud.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'getUserProfile' })
      );
    });
  });
  
  describe('问题导航', () => {
    test('点击问题应该跳转', () => {
      require('../../pages/profile/profile.js');
      profilePage.data.myQuestions = [
        { id: 1, question: '测试', reply: '回复' }
      ];
      profilePage.onQuestionTap({ currentTarget: { dataset: { id: 1 } } });
      expect(global.wx.navigateTo).toHaveBeenCalled();
    });
  });
  
  describe('历史记录', () => {
    test('点击历史记录应该跳转', () => {
      require('../../pages/profile/profile.js');
      profilePage.onHistoryTap();
      expect(global.wx.navigateTo).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/pages/history/history' })
      );
    });
  });
  
  describe('分享', () => {
    test('分享配置应该正确', () => {
      require('../../pages/profile/profile.js');
      const shareConfig = profilePage.onShareAppMessage();
      expect(shareConfig.title).toBe('狗头军师 - 无厘头AI回复');
      expect(shareConfig.path).toBe('/pages/index/index');
    });
  });
  
  describe('下拉刷新', () => {
    test('下拉刷新功能存在', () => {
      // 测试下拉刷新方法存在
      expect(typeof profilePage.onPullDownRefresh).toBe('function');
    });
  });
});
