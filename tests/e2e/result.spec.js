/**
 * @jest-environment jsdom
 */

describe('结果页测试', () => {
  let page;
  
  beforeEach(() => {
    global.wx = {
      navigateBack: jest.fn(),
      reLaunch: jest.fn(),
      setClipboardData: jest.fn(),
      showToast: jest.fn()
    };
    
    global.Page = jest.fn((options) => {
      page = {
        ...options,
        data: {
          question: '测试问题',
          reply: '测试回复',
          questionId: '123',
          liked: false,
          showToast: false,
          toastText: ''
        },
        setData: jest.fn()
      };
      return page;
    });
    
    // Mock options
    global.getCurrentPages = jest.fn(() => [{ route: 'pages/index/index' }]);
  });
  
  test('页面加载时解析参数', () => {
    require('../../pages/result/result.js');
    expect(global.Page).toHaveBeenCalled();
  });
  
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
  
  test('复制按钮设置剪贴板', () => {
    require('../../pages/result/result.js');
    page.onCopyTap({ currentTarget: { dataset: { content: '复制内容' } } });
    expect(global.wx.setClipboardData).toHaveBeenCalledWith({
      data: '复制内容',
      success: expect.any(Function),
      fail: expect.any(Function)
    });
  });
  
  test('点赞切换状态', () => {
    require('../../pages/result/result.js');
    page.setData({ liked: false });
    page.onLikeTap();
    expect(page.setData).toHaveBeenCalledWith({ liked: true });
  });
  
  test('再次提问跳转首页', () => {
    require('../../pages/result/result.js');
    page.onAskAgainTap();
    expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/index/index' });
  });
  
  test('Toast 显示', () => {
    require('../../pages/result/result.js');
    page.showToast('测试提示');
    expect(page.setData).toHaveBeenCalledWith({
      toastText: '测试提示',
      showToast: true
    });
  });
});
