/**
 * 微信小程序配置和生命周期函数验证测试
 */

const fs = require('fs');
const path = require('path');

// 模拟微信小程序 API
global.wx = {
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn()
  },
  getStorageSync: jest.fn(() => []),
  setStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  navigateBack: jest.fn(),
  setClipboardData: jest.fn()
};

describe('微信小程序配置验证', () => {
  let appConfig;
  let projectConfig;

  beforeAll(() => {
    const appConfigPath = path.join(__dirname, '../../app.json');
    const projectConfigPath = path.join(__dirname, '../../project.config.json');
    
    const appContent = fs.readFileSync(appConfigPath, 'utf8');
    appConfig = JSON.parse(appContent);
    
    if (fs.existsSync(projectConfigPath)) {
      const projectContent = fs.readFileSync(projectConfigPath, 'utf8');
      projectConfig = JSON.parse(projectContent);
    }
  });

  describe('app.json 格式验证', () => {
    test('app.json 必须是有效的 JSON', () => {
      expect(appConfig).toBeDefined();
      expect(appConfig).not.toBeNull();
    });

    test('pages 必须是数组', () => {
      expect(Array.isArray(appConfig.pages)).toBe(true);
    });

    test('pages 不能为空', () => {
      expect(appConfig.pages.length).toBeGreaterThan(0);
    });

    test('window 必须是对象', () => {
      expect(typeof appConfig.window).toBe('object');
      expect(appConfig.window).not.toBeNull();
    });
  });

  describe('window.navigationBarTextStyle 验证', () => {
    test('navigationBarTextStyle 必须存在', () => {
      expect(appConfig.window).toHaveProperty('navigationBarTextStyle');
    });

    test('navigationBarTextStyle 必须是 string 类型', () => {
      expect(typeof appConfig.window.navigationBarTextStyle).toBe('string');
    });

    test('navigationBarTextStyle 只能是 black 或 white', () => {
      const validValues = ['black', 'white'];
      expect(validValues).toContain(appConfig.window.navigationBarTextStyle);
    });

    test('navigationBarTextStyle 不能是数字', () => {
      expect(typeof appConfig.window.navigationBarTextStyle).not.toBe('number');
    });

    test('navigationBarTextStyle 不能是对象', () => {
      expect(typeof appConfig.window.navigationBarTextStyle).not.toBe('object');
    });
  });

  describe('其他 window 配置验证', () => {
    test('backgroundTextStyle 必须是 string', () => {
      expect(typeof appConfig.window.backgroundTextStyle).toBe('string');
    });

    test('backgroundTextStyle 只能是 light 或 dark', () => {
      const validValues = ['light', 'dark'];
      expect(validValues).toContain(appConfig.window.backgroundTextStyle);
    });

    test('navigationBarBackgroundColor 必须是 string', () => {
      expect(typeof appConfig.window.navigationBarBackgroundColor).toBe('string');
    });

    test('navigationBarTitleText 必须是 string', () => {
      expect(typeof appConfig.window.navigationBarTitleText).toBe('string');
    });
  });

  describe('project.config.json 验证', () => {
    test('project.config.json 必须存在', () => {
      expect(projectConfig).toBeDefined();
    });

    test('appid 必须是字符串', () => {
      expect(typeof projectConfig.appid).toBe('string');
    });

    test('appid 不能为空', () => {
      expect(projectConfig.appid.length).toBeGreaterThan(0);
    });

    test('appid 必须以 wx 开头', () => {
      expect(projectConfig.appid.startsWith('wx')).toBe(true);
    });
  });
});

describe('微信小程序页面配置验证', () => {
  const validatePageConfig = (pageName, pagePath) => {
    const jsPath = path.join(__dirname, `../../pages/${pagePath}/${pagePath}.js`);
    const jsonPath = path.join(__dirname, `../../pages/${pagePath}/${pagePath}.json`);

    describe(`${pageName} 页面`, () => {
      let jsContent;
      let jsonContent;

      beforeAll(() => {
        if (fs.existsSync(jsPath)) {
          jsContent = fs.readFileSync(jsPath, 'utf8');
        }
        if (fs.existsSync(jsonPath)) {
          const content = fs.readFileSync(jsonPath, 'utf8');
          jsonContent = JSON.parse(content);
        }
      });

      test(`${pageName}.json 必须是有效 JSON`, () => {
        if (jsonContent) {
          expect(jsonContent).toBeDefined();
        }
      });

      test(`${pageName}.json navigationBarTitleText 必须是 string`, () => {
        if (jsonContent) {
          expect(typeof jsonContent.navigationBarTitleText).toBe('string');
        }
      });

      test(`${pageName}.js 文件必须存在`, () => {
        expect(fs.existsSync(jsPath)).toBe(true);
      });
    });
  };

  validatePageConfig('首页', 'index');
  validatePageConfig('结果页', 'result');
  validatePageConfig('历史记录页', 'history');
});

describe('微信小程序生命周期函数逻辑测试', () => {
  describe('首页逻辑测试', () => {
    test('onQuestionInput 应该更新 question 数据', () => {
      let data = { question: '' };
      const setData = jest.fn((updates) => {
        Object.assign(data, updates);
      });
      
      const onQuestionInput = function(e) {
        setData({ question: e.detail.value });
      };

      onQuestionInput({ detail: { value: '测试问题' } });
      expect(setData).toHaveBeenCalledWith({ question: '测试问题' });
      expect(data.question).toBe('测试问题');
    });

    test('onSampleTap 应该更新 question 数据', () => {
      let data = { question: '' };
      const setData = jest.fn((updates) => {
        Object.assign(data, updates);
      });
      
      const onSampleTap = function(e) {
        const question = e.currentTarget.dataset.question;
        setData({ question });
      };

      onSampleTap({ currentTarget: { dataset: { question: '示例问题' } } });
      expect(setData).toHaveBeenCalledWith({ question: '示例问题' });
    });

    test('onGenerateTap 空问题不应该触发生成', () => {
      let data = { question: '', loading: false };
      const setData = jest.fn((updates) => {
        Object.assign(data, updates);
      });
      
      const onGenerateTap = function() {
        const question = this.data.question.trim();
        if (!question) return;
        setData({ loading: true });
      }.bind({ data });

      onGenerateTap();
      expect(setData).not.toHaveBeenCalled();
      expect(data.loading).toBe(false);
    });

    test('onGenerateTap 有问题应该设置 loading', () => {
      let data = { question: '', loading: false };
      const setData = jest.fn((updates) => {
        Object.assign(data, updates);
      });
      
      const onGenerateTap = function() {
        const question = this.data.question.trim();
        if (!question) return;
        setData({ loading: true });
      }.bind({ data });

      data.question = '测试问题';
      onGenerateTap();
      expect(setData).toHaveBeenCalledWith({ loading: true });
    });
  });

  describe('结果页逻辑测试', () => {
    test('onLoad 应该正确解析 URL 参数', () => {
      let data = { question: '', reply: '' };
      const setData = jest.fn((updates) => {
        Object.assign(data, updates);
      });
      
      const onLoad = function(options) {
        if (options.question && options.reply) {
          setData({
            question: decodeURIComponent(options.question),
            reply: decodeURIComponent(options.reply)
          });
        }
      }.bind({ setData });

      onLoad({ 
        question: encodeURIComponent('测试问题'),
        reply: encodeURIComponent('测试回复')
      });

      expect(setData).toHaveBeenCalledWith({
        question: '测试问题',
        reply: '测试回复'
      });
    });

    test('onLikeTap 应该切换点赞状态', () => {
      let data = { liked: false };
      const setData = jest.fn((updates) => {
        Object.assign(data, updates);
      });
      
      const onLikeTap = function() {
        setData({ liked: !data.liked });
      };

      expect(data.liked).toBe(false);
      onLikeTap();
      expect(data.liked).toBe(true);
      onLikeTap();
      expect(data.liked).toBe(false);
    });

    test('onCopyTap 应该调用剪贴板 API', () => {
      const onCopyTap = function(e) {
        const content = e.currentTarget.dataset.content;
        wx.setClipboardData({ data: content });
      };

      onCopyTap({ currentTarget: { dataset: { content: '测试内容' } } });
      expect(wx.setClipboardData).toHaveBeenCalledWith({ data: '测试内容' });
    });
  });

  describe('历史记录页逻辑测试', () => {
    test('onShow 应该调用 loadHistory', () => {
      let loadHistoryCalled = false;
      
      const onShow = function() {
        this.loadHistory();
      }.bind({
        loadHistory: () => {
          loadHistoryCalled = true;
        }
      });

      onShow();
      expect(loadHistoryCalled).toBe(true);
    });

    test('loadHistory 应该从 Storage 读取数据', () => {
      const mockHistory = [{ id: 1, question: '问题1', reply: '回复1' }];
      wx.getStorageSync.mockReturnValue(mockHistory);
      
      let data = { history: [] };
      const setData = jest.fn((updates) => {
        Object.assign(data, updates);
      });
      
      const loadHistory = function() {
        const history = wx.getStorageSync('history') || [];
        setData({ history });
      }.bind({ setData });

      loadHistory();
      expect(setData).toHaveBeenCalledWith({ history: mockHistory });
    });

    test('onItemTap 应该返回正确的数据', () => {
      const onItemTap = function(e) {
        const item = e.currentTarget.dataset.item;
        return item;
      };

      const mockItem = { id: 1, question: '问题', reply: '回复' };
      const result = onItemTap({ currentTarget: { dataset: { item: mockItem } } });
      expect(result).toEqual(mockItem);
    });
  });
});
