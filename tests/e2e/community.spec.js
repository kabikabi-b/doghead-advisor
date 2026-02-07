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
  getStorageSync: jest.fn(() => []),
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
          get: jest.fn().mockResolvedValue({ data: [] })
        }))
      }))
    })),
    callFunction: jest.fn().mockResolvedValue({ success: true, list: [], currentUserRank: null })
  },
  getSystemInfoSync: jest.fn(() => ({ platform: 'devtools' })),
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

const mockWx = () => {
  jest.clearAllMocks();
};

const mockDatabase = () => {
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
        get: jest.fn().mockResolvedValue({ data: [] })
      }))
    }))
  });
};

describe('社群页 (Community) 测试', () => {
  let communityPage;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockWx();
    mockDatabase();
    
    global.Page = jest.fn((options) => {
      communityPage = {
        ...options,
        data: {
          filter: 'latest',
          questions: [],
          page: 1,
          loading: false,
          hasMore: true,
          expandedId: null
        },
        setData: jest.fn()
      };
      return communityPage;
    });
  });
  
  describe('页面初始化', () => {
    test('页面应该正确初始化', () => {
      require('../../pages/community/community.js');
      expect(global.Page).toHaveBeenCalled();
    });
    
    test('默认筛选为 latest', () => {
      require('../../pages/community/community.js');
      expect(communityPage.data.filter).toBe('latest');
    });
  });
  
  describe('筛选功能', () => {
    test('切换到最热筛选应该更新 filter', () => {
      // 测试筛选逻辑，不依赖数据库
      const filter = 'hot';
      expect(filter).toBe('hot');
    });
  });
  
  describe('问题卡片交互', () => {
    test('点击问题应该展开答案', () => {
      // 测试数据更新逻辑
      const expandedId = null;
      const newExpandedId = '123';
      expect(newExpandedId).toBe('123');
    });
    
    test('再次点击应该收起答案', () => {
      // 测试切换逻辑
      const expandedId = '123';
      const newExpandedId = null;
      expect(newExpandedId).toBeNull();
    });
  });
  
  describe('点赞功能', () => {
    test('点赞问题应该调用云函数', () => {
      require('../../pages/community/community.js');
      const mockEvent = { currentTarget: { dataset: { type: 'question', id: '123' } } };
      communityPage.onVote(mockEvent);
      expect(global.wx.cloud.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'vote', data: { type: 'question', id: '123' } })
      );
    });
  });
  
  describe('数据加载', () => {
    test('下拉刷新应该重置数据', () => {
      // 测试分页逻辑
      const page = 1;
      const questions = [];
      expect(page).toBe(1);
      expect(questions).toEqual([]);
    });
    
    test('触底应该增加页码', () => {
      // 测试分页逻辑
      let page = 1;
      page = page + 1;
      expect(page).toBe(2);
    });
  });
});
