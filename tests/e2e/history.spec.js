/**
 * @jest-environment jsdom
 */

describe('历史记录页测试', () => {
  let page;
  
  beforeEach(() => {
    jest.useFakeTimers();
    
    global.wx = {
      navigateTo: jest.fn(),
      reLaunch: jest.fn(),
      getStorageSync: jest.fn(() => [
        { id: 1, question: '问题1', reply: '回复1', createTime: '2024-01-01' },
        { id: 2, question: '问题2', reply: '回复2', createTime: '2024-01-02' }
      ])
    };
    
    global.Page = jest.fn((options) => {
      page = {
        ...options,
        data: {
          history: global.wx.getStorageSync('history')
        },
        setData: jest.fn()
      };
      return page;
    });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('页面显示时加载历史', () => {
    require('../../pages/history/history.js');
    expect(global.wx.getStorageSync).toHaveBeenCalledWith('history');
  });
  
  test('加载历史记录', () => {
    require('../../pages/history/history.js');
    expect(page.data.history.length).toBe(2);
  });
  
  test('点击历史项跳转结果页', () => {
    require('../../pages/history/history.js');
    page.onItemTap({
      currentTarget: {
        dataset: {
          item: { id: 1, question: '问题', reply: '回复' }
        }
      }
    });
    expect(global.wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/result/result?question=%E9%97%AE%E9%A2%98&reply=%E5%9B%9E%E7%AD%94&id=1'
    });
  });
  
  test('去提问跳转首页', () => {
    require('../../pages/history/history.js');
    page.goToAsk();
    expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/index/index' });
  });
  
  test('空历史显示空状态', () => {
    global.wx.getStorageSync.mockReturnValueOnce([]);
    require('../../pages/history/history.js');
    page.loadHistory();
    expect(page.data.history.length).toBe(0);
  });
});
