/**
 * @jest-environment jsdom
 */

// Mock 微信 API
const mockCallFunction = jest.fn();
const mockNavigateTo = jest.fn();
const mockShowToast = jest.fn();
const mockShowModal = jest.fn();
const mockSetStorageSync = jest.fn();
const mockGetStorageSync = jest.fn(() => null);
const mockSwitchTab = jest.fn();
const mockGetUserProfile = jest.fn();
const mockShowLoading = jest.fn();
const mockHideLoading = jest.fn();

global.wx = {
  navigateTo: mockNavigateTo,
  showToast: mockShowToast,
  showModal: mockShowModal,
  setStorageSync: mockSetStorageSync,
  getStorageSync: mockGetStorageSync,
  switchTab: mockSwitchTab,
  getUserProfile: mockGetUserProfile,
  showLoading: mockShowLoading,
  hideLoading: mockHideLoading,
  cloud: {
    init: jest.fn(),
    callFunction: mockCallFunction.mockResolvedValue({
      success: true,
      userInfo: { _id: 'user123', nickName: '测试用户', avatarUrl: '🐕' },
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
      hasUserInfo: false,
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
    mockGetStorageSync.mockReturnValue(null);
    
    global.Page = jest.fn((options) => {
      profilePage = {
        ...options,
        data: {
          userInfo: null,
          hasUserInfo: false,
          stats: { totalQuestions: 0, totalLikes: 0, guguRate: 0 },
          myQuestions: [],
          loading: false
        },
        setData: jest.fn()
      };
      return profilePage;
    });
  });
  
  afterEach(() => {
    jest.resetModules();
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
  
  describe('微信登录功能', () => {
    test('onLoginTap 应该调用 getUserProfile', () => {
      require('../../pages/profile/profile.js');
      
      mockGetUserProfile.mockImplementationOnce(({ success }) => {
        success({
          userInfo: {
            nickName: '微信用户',
            avatarUrl: 'https://test.com/avatar.png'
          }
        });
      });
      
      const mockPage = { setData: jest.fn() };
      profilePage.onLoginTap.call(mockPage);
      
      expect(mockGetUserProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          desc: '用于完善用户资料'
        })
      );
    });
    
    test('登录成功后设置 hasUserInfo 为 true', () => {
      require('../../pages/profile/profile.js');
      
      mockGetUserProfile.mockImplementationOnce(({ success }) => {
        success({
          userInfo: { nickName: '新用户', avatarUrl: 'url' }
        });
      });
      
      mockCallFunction.mockResolvedValue({
        result: { userInfo: { _id: '123' } }
      });
      
      const mockPage = {
        setData: jest.fn(),
        data: { userInfo: null, hasUserInfo: false }
      };
      
      profilePage.onLoginTap.call(mockPage);
      
      expect(mockSetStorageSync).toHaveBeenCalledWith('userInfo', expect.any(Object));
    });
    
    test('昵称输入应该更新本地存储', () => {
      require('../../pages/profile/profile.js');
      
      const mockPage = {
        setData: jest.fn(),
        data: {
          userInfo: { nickName: '原昵称', avatarUrl: 'url' }
        }
      };
      
      profilePage.onNicknameInput.call(mockPage, { detail: { value: '新昵称' } });
      
      expect(mockSetStorageSync).toHaveBeenCalledWith('userInfo', {
        nickName: '新昵称',
        avatarUrl: 'url'
      });
    });
  });
  
  describe('数据加载', () => {
    test('loadUserData 应该调用 getUserProfile 云函数', () => {
      require('../../pages/profile/profile.js');
      profilePage.loadUserData();
      expect(mockCallFunction).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'getUserProfile' })
      );
    });
    
    test('loadUserData 应该更新用户信息', () => {
      require('../../pages/profile/profile.js');
      profilePage.loadUserData();
      
      expect(profilePage.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          userInfo: expect.objectContaining({ nickName: '测试用户' })
        })
      );
    });
    
    test('loadUserData 应该更新统计数据', () => {
      require('../../pages/profile/profile.js');
      profilePage.loadUserData();
      
      expect(profilePage.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({ totalQuestions: 5 })
        })
      );
    });
  });
  
  describe('问题导航', () => {
    test('点击问题应该跳转', () => {
      require('../../pages/profile/profile.js');
      profilePage.data.myQuestions = [
        { id: '123', question: '测试', reply: '回复' }
      ];
      profilePage.onQuestionTap({ currentTarget: { dataset: { id: '123' } } });
      expect(mockNavigateTo).toHaveBeenCalled();
    });
  });
  
  describe('历史记录', () => {
    test('点击历史记录应该跳转', () => {
      require('../../pages/profile/profile.js');
      profilePage.onHistoryTap();
      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/pages/history/history' })
      );
    });
  });
  
  describe('首页导航', () => {
    test('goToIndex 应该跳转首页', () => {
      require('../../pages/profile/profile.js');
      profilePage.goToIndex();
      expect(mockSwitchTab).toHaveBeenCalledWith({ url: '/pages/index/index' });
    });
  });
  
  describe('分享', () => {
    test('分享配置应该正确', () => {
      require('../../pages/profile/profile.js');
      const shareConfig = profilePage.onShareAppMessage();
      expect(shareConfig.title).toBe('狗狗军师 - 无厘头AI回复');
      expect(shareConfig.path).toBe('/pages/index/index');
    });
  });
  
  describe('清除历史', () => {
    test('onClearHistory 应该确认后清除', () => {
      require('../../pages/profile/profile.js');
      
      global.wx.showModal = mockShowModal.mockImplementationOnce(({ success }) => {
        success({ confirm: true });
      });
      
      profilePage.onClearHistory();
      
      expect(mockShowModal).toHaveBeenCalled();
    });
    
    test('确认清除后重置统计', () => {
      require('../../pages/profile/profile.js');
      
      let modalSuccess;
      global.wx.showModal = ({ success }) => {
        modalSuccess = success;
      };
      
      profilePage.setData({
        stats: { totalQuestions: 5, totalLikes: 10 },
        myQuestions: [{ id: '1' }]
      });
      
      profilePage.onClearHistory();
      
      // 模拟用户确认
      modalSuccess({ confirm: true });
      
      expect(profilePage.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: { totalQuestions: 0, totalLikes: 0 },
          myQuestions: []
        })
      );
    });
  });
});
