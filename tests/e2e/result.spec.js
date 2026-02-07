/**
 * @jest-environment jsdom
 */

// Mock wx.cloud
const mockCallFunction = jest.fn();
const mockCloudInit = jest.fn();
const mockGetWXContext = jest.fn();

// 使用 jest.mock 创建 mock
jest.mock('../../../node_modules/wx-cloud', () => ({
  init: mockCloudInit,
  getWXContext: mockGetWXContext
}), { virtual: true });

global.wx = {
  cloud: {
    callFunction: mockCallFunction,
    init: mockCloudInit,
    getWXContext: mockGetWXContext
  },
  navigateBack: jest.fn(),
  reLaunch: jest.fn(),
  setClipboardData: jest.fn(),
  showToast: jest.fn()
};

describe('结果页测试', () => {
  let page;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetWXContext.mockReturnValue({ OPENID: 'test-openid' });
    
    global.Page = jest.fn((options) => {
      page = {
        ...options,
        data: {
          question: '测试问题',
          reply: '测试回复',
          questionId: '123',
          liked: false,
          likeCount: 0,
          showToast: false,
          toastText: ''
        },
        setData: jest.fn()
      };
      return page;
    });
    
    global.getCurrentPages = jest.fn(() => [{ route: 'pages/index/index' }]);
  });
  
  afterEach(() => {
    jest.resetModules();
  });
  
  describe('页面加载', () => {
    test('页面加载时解析参数', () => {
      require('../../pages/result/result.js');
      expect(global.Page).toHaveBeenCalled();
    });
    
    test('onLoad 有参数时设置数据', () => {
      require('../../pages/result/result.js');
      const pageInstance = global.Page.mock.calls[0][0];
      
      const mockPage = {
        data: {},
        setData: jest.fn()
      };
      
      pageInstance.onLoad.call(mockPage, {
        question: '%E6%B5%8B%E8%AF%95%E9%97%AE%E9%A2%98',
        reply: '%E6%B5%8B%E8%AF%95%E5%9B%9E%E5%A4%8D',
        questionId: '456'
      });
      
      expect(mockPage.setData).toHaveBeenCalledWith({
        question: '测试问题',
        reply: '测试回复',
        questionId: '456'
      });
    });
  });
  
  describe('点赞状态加载', () => {
    test('loadLikeData 调用 getLikeStatus 云函数', () => {
      require('../../pages/result/result.js');
      
      const mockPage = {
        data: { questionId: '123' },
        setData: jest.fn()
      };
      
      // 模拟云函数返回已点赞
      mockCallFunction.mockImplementationOnce(({ success }) => {
        success({
          result: {
            success: true,
            liked: true,
            likeCount: 5
          }
        });
      });
      
      page.loadLikeData.call(mockPage);
      
      expect(mockCallFunction).toHaveBeenCalledWith({
        name: 'getLikeStatus',
        data: { questionId: '123' }
      });
      
      expect(mockPage.setData).toHaveBeenCalledWith({
        liked: true,
        likeCount: 5
      });
    });
    
    test('loadLikeData 未点赞状态', () => {
      require('../../pages/result/result.js');
      
      const mockPage = {
        data: { questionId: '123' },
        setData: jest.fn()
      };
      
      mockCallFunction.mockImplementationOnce(({ success }) => {
        success({
          result: {
            success: true,
            liked: false,
            likeCount: 10
          }
        });
      });
      
      page.loadLikeData.call(mockPage);
      
      expect(mockPage.setData).toHaveBeenCalledWith({
        liked: false,
        likeCount: 10
      });
    });
    
    test('loadLikeData 无 questionId 时不调用', () => {
      require('../../pages/result/result.js');
      
      const mockPage = {
        data: { questionId: '' },
        setData: jest.fn()
      };
      
      page.loadLikeData.call(mockPage);
      
      expect(mockCallFunction).not.toHaveBeenCalled();
    });
  });
  
  describe('点赞操作', () => {
    test('点赞成功 - liked:false -> true', () => {
      require('../../pages/result/result.js');
      
      const mockPage = {
        data: { questionId: '123', liked: false, likeCount: 0 },
        setData: jest.fn()
      };
      
      // 模拟 vote 云函数返回
      mockCallFunction.mockImplementationOnce(({ success }) => {
        success({
          result: { success: true, action: 'like' }
        });
      });
      
      page.onLikeTap.call(mockPage);
      
      // 先乐观更新 UI
      expect(mockPage.setData).toHaveBeenCalledWith({
        liked: true,
        likeCount: 1
      });
      
      // 调用云函数
      expect(mockCallFunction).toHaveBeenCalledWith({
        name: 'vote',
        data: { type: 'answer', id: '123' }
      });
    });
    
    test('取消点赞成功 - liked:true -> false', () => {
      require('../../pages/result/result.js');
      
      const mockPage = {
        data: { questionId: '123', liked: true, likeCount: 5 },
        setData: jest.fn()
      };
      
      mockCallFunction.mockImplementationOnce(({ success }) => {
        success({
          result: { success: true, action: 'unlike' }
        });
      });
      
      page.onLikeTap.call(mockPage);
      
      expect(mockPage.setData).toHaveBeenCalledWith({
        liked: false,
        likeCount: 4
      });
    });
    
    test('点赞失败时恢复原状态', () => {
      require('../../pages/result/result.js');
      
      const mockPage = {
        data: { questionId: '123', liked: false, likeCount: 0 },
        setData: jest.fn()
      };
      
      // 模拟云函数返回失败
      mockCallFunction.mockImplementationOnce(({ success }) => {
        success({
          result: { success: false, error: '点赞失败' }
        });
      });
      
      page.onLikeTap.call(mockPage);
      
      // 乐观更新后失败，恢复原状
      expect(mockPage.setData).toHaveBeenCalledWith({
        liked: false,
        likeCount: 0
      });
    });
    
    test('无 questionId 时无法点赞', () => {
      require('../../pages/result/result.js');
      
      const mockPage = {
        data: { questionId: '', liked: false },
        setData: jest.fn()
      };
      
      page.onLikeTap.call(mockPage);
      
      expect(mockCallFunction).not.toHaveBeenCalled();
      expect(mockPage.setData).not.toHaveBeenCalled();
    });
  });
  
  describe('返回导航', () => {
    test('返回按钮导航', () => {
      require('../../pages/result/result.js');
      page.onBackTap();
      expect(global.wx.navigateBack).toHaveBeenCalled();
    });
    
    test('返回失败时跳转首页', () => {
      global.wx.navigateBack.mockImplementationOnce((opt) => opt.fail && opt.fail());
      require('../../pages/result/result.js');
      page.onBackTap();
      expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/index/index' });
    });
  });
  
  describe('复制功能', () => {
    test('复制按钮设置剪贴板', () => {
      require('../../pages/result/result.js');
      page.onCopyTap({ currentTarget: { dataset: { content: '复制内容' } } });
      expect(global.wx.setClipboardData).toHaveBeenCalledWith({
        data: '复制内容',
        success: expect.any(Function),
        fail: expect.any(Function)
      });
    });
  });
  
  describe('再次提问', () => {
    test('再问一个跳转首页', () => {
      require('../../pages/result/result.js');
      page.onAskAgainTap();
      expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/index/index' });
    });
  });
  
  describe('Toast 提示', () => {
    test('Toast 显示', () => {
      require('../../pages/result/result.js');
      page.showToast('测试提示');
      expect(page.setData).toHaveBeenCalledWith({
        toastText: '测试提示',
        showToast: true
      });
    });
    
    test('Toast 2秒后自动消失', () => {
      jest.useFakeTimers();
      require('../../pages/result/result.js');
      
      const mockSetData = jest.fn();
      const mockPage = { setData: mockSetData };
      
      page.showToast.call(mockPage, '测试提示');
      
      expect(mockSetData).toHaveBeenCalledWith({
        toastText: '测试提示',
        showToast: true
      });
      
      jest.advanceTimersByTime(2000);
      
      expect(mockSetData).toHaveBeenCalledWith({
        showToast: false
      });
      
      jest.useRealTimers();
    });
  });
});
