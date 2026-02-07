/**
 * @jest-environment jsdom
 */

describe('首页测试', () => {
  let page;
  
  beforeEach(() => {
    // Mock wx
    global.wx = {
      navigateTo: jest.fn(),
      switchTab: jest.fn(),
      setStorageSync: jest.fn(),
      getStorageSync: jest.fn(() => []),
      cloud: {
        init: jest.fn(),
        callFunction: jest.fn().mockResolvedValue({
          success: true,
          reply: '测试回复',
          questionId: '123'
        }),
        database: jest.fn(() => ({
          collection: jest.fn(() => ({
            add: jest.fn().mockResolvedValue({ _id: 'test-id' })
          }))
        }))
      },
      showToast: jest.fn()
    };
    
    global.getCurrentPages = jest.fn(() => []);
    
    // Mock Page
    global.Page = jest.fn((options) => {
      page = {
        ...options,
        data: {
          question: '',
          loading: false,
          sampleQuestions: ['今天运气怎么样？', '老板不给涨工资怎么办？']
        },
        setData: jest.fn()
      };
      return page;
    });
  });
  
  test('页面初始化', () => {
    require('../../pages/index/index.js');
    expect(global.Page).toHaveBeenCalled();
  });
  
  test('问题输入更新状态', () => {
    require('../../pages/index/index.js');
    page.onQuestionInput({ detail: { value: '测试' } });
    expect(page.setData).toHaveBeenCalledWith({ question: '测试' });
  });
  
  test('示例问题点击', () => {
    require('../../pages/index/index.js');
    page.onSampleTap({ currentTarget: { dataset: { question: '示例问题' } } });
    expect(page.setData).toHaveBeenCalledWith({ question: '示例问题' });
  });
  
  test('空问题显示提示', () => {
    require('../../pages/index/index.js');
    page.data.question = '';
    page.onGenerateTap();
    expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '请输入问题' }));
  });
  
  test('有效问题调用云函数', () => {
    require('../../pages/index/index.js');
    page.data.question = '测试问题';
    page.onGenerateTap();
    expect(global.wx.cloud.callFunction).toHaveBeenCalled();
  });
  
  test('保存到历史记录', () => {
    require('../../pages/index/index.js');
    page.saveToHistory('问题', '回复');
    expect(global.wx.setStorageSync).toHaveBeenCalledWith('history', expect.any(Array));
  });
});
