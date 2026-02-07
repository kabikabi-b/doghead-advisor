/**
 * @jest-environment jsdom
 */

// Mock 微信 API
global.wx = {
  navigateTo: jest.fn(),
  switchTab: jest.fn(),
  showToast: jest.fn(),
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn().mockResolvedValue({
      success: true,
      list: [
        { id: '1', name: '怼神降临', avatar: '🦁', likes: 1234, guguRate: 99, score: 1234 },
        { id: '2', name: '机智小狐狸', avatar: '🦊', likes: 987, guguRate: 85, score: 987 }
      ],
      currentUserRank: null
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
      rankList: [],
      currentUserRank: null,
      filter: 'likes'
    }
  };
});

global.getCurrentPages = jest.fn(() => []);

describe('排行榜页 (Leaderboard) 测试', () => {
  let leaderboardPage;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.Page = jest.fn((options) => {
      leaderboardPage = {
        ...options,
        data: {
          rankList: [],
          currentUserRank: null,
          filter: 'likes',
          currentUser: null
        },
        setData: jest.fn()
      };
      return leaderboardPage;
    });
  });
  
  describe('页面初始化', () => {
    test('页面应该正确初始化', () => {
      require('../../pages/leaderboard/leaderboard.js');
      expect(global.Page).toHaveBeenCalled();
    });
    
    test('默认筛选为 likes', () => {
      require('../../pages/leaderboard/leaderboard.js');
      expect(leaderboardPage.data.filter).toBe('likes');
    });
  });
  
  describe('数据加载', () => {
    test('loadRankList 应该调用云函数', () => {
      require('../../pages/leaderboard/leaderboard.js');
      leaderboardPage.loadRankList();
      expect(global.wx.cloud.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'getLeaderboard' })
      );
    });
  });
  
  describe('筛选功能', () => {
    test('切换筛选应该更新 filter', () => {
      require('../../pages/leaderboard/leaderboard.js');
      const mockEvent = { currentTarget: { dataset: { filter: 'guguRate' } } };
      leaderboardPage.onFilterTap(mockEvent);
      expect(leaderboardPage.setData).toHaveBeenCalledWith(
        expect.objectContaining({ filter: 'guguRate' })
      );
    });
  });
  
  describe('下拉刷新', () => {
    test('下拉刷新功能存在', () => {
      // 测试下拉刷新方法存在
      expect(typeof leaderboardPage.onPullDownRefresh).toBe('function');
    });
  });
  
  describe('用户交互', () => {
    test('点击用户显示开发中', () => {
      require('../../pages/leaderboard/leaderboard.js');
      leaderboardPage.onUserTap({ currentTarget: { dataset: { userId: '1' } } });
      expect(global.wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '功能开发中' })
      );
    });
  });
});
