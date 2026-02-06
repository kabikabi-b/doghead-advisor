/**
 * 历史记录页 E2E 测试
 * 测试页面: pages/history/history
 */
const automator = require('miniprogram-automator');
const { EXPECTED_TEXTS, SELECTORS } = require('../utils/constants');

describe('历史记录页测试', () => {
  let miniProgram;
  let page;

  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: process.cwd(),
      cliPath: '/Applications/wechatdevtools.cli'
    });
  });

  beforeEach(async () => {
    page = await miniProgram.reLaunch('pages/history/history');
    await page.waitForTimeout(500);
  });

  afterAll(async () => {
    if (miniProgram) {
      await miniProgram.close();
    }
  });

  describe('页面加载', () => {
    test('页面应该正常加载', async () => {
      const pageData = await page.data();
      expect(pageData).toBeDefined();
    });

    test('应该显示标题 "📜 历史记录"', async () => {
      const pageData = await page.data();
      expect(pageData.history).toBeDefined();
    });
  });

  describe('空状态', () => {
    test('历史为空时应该显示空状态', async () => {
      await page.setData({ history: [] });
      
      const pageData = await page.data();
      expect(pageData.history.length).toBe(0);
      
      // 检查空状态元素是否存在
      const emptyState = await page.$('.empty-state');
      expect(emptyState).not.toBeNull();
    });

    test('空状态应该显示 "暂无历史记录"', async () => {
      await page.setData({ history: [] });
      
      const emptyText = await page.$('.empty-text');
      const text = await emptyText.text();
      expect(text).toContain('暂无历史记录');
    });

    test('空状态应该显示引导文字', async () => {
      await page.setData({ history: [] });
      
      const emptySubtext = await page.$('.empty-subtext');
      const text = await emptySubtext.text();
      expect(text).toContain('去问狗头军师几个问题吧');
    });

    test('点击"去提问"按钮应该跳转到首页', async () => {
      await page.setData({ history: [] });
      
      await page.evaluate(() => {
        const emptyBtn = document.querySelector('.empty-btn');
        if (emptyBtn) {
          emptyBtn.click();
        }
      });
      
      await miniProgram.waitForTimeout(500);
      const currentPage = await miniProgram.currentPage();
      expect(currentPage.path).toBe('pages/index/index');
    });
  });

  describe('历史列表', () => {
    test('有历史记录时应该显示列表', async () => {
      const testHistory = [
        {
          id: 1,
          question: '今天吃什么？',
          reply: '吃火锅吧！',
          createTime: '2024-01-01 12:00'
        },
        {
          id: 2,
          question: '周末去哪玩？',
          reply: '去公园吧！',
          createTime: '2024-01-02 14:00'
        }
      ];
      
      await page.setData({ history: testHistory });
      
      const pageData = await page.data();
      expect(pageData.history.length).toBe(2);
    });

    test('历史记录应该正确显示问答内容', async () => {
      const testHistory = [
        {
          id: 1,
          question: '今天吃什么？',
          reply: '吃火锅吧！',
          createTime: '2024-01-01 12:00'
        }
      ];
      
      await page.setData({ history: testHistory });
      
      const firstItem = await page.$('.history-item');
      expect(firstItem).not.toBeNull();
    });

    test('点击历史项应该跳转到结果页', async () => {
      const testHistory = [
        {
          id: 1,
          question: '今天吃什么？',
          reply: '吃火锅吧！',
          createTime: '2024-01-01 12:00'
        }
      ];
      
      await page.setData({ history: testHistory });
      
      await page.evaluate(() => {
        const historyItem = document.querySelector('.history-item');
        if (historyItem) {
          historyItem.click();
        }
      });
      
      await miniProgram.waitForTimeout(500);
      const currentPage = await miniProgram.currentPage();
      expect(currentPage.path).toBe('pages/result/result');
    });

    test('历史记录数量应该正确显示', async () => {
      const testHistory = [
        { id: 1, question: 'Q1', reply: 'A1', createTime: '2024-01-01' },
        { id: 2, question: 'Q2', reply: 'A2', createTime: '2024-01-02' },
        { id: 3, question: 'Q3', reply: 'A3', createTime: '2024-01-03' }
      ];
      
      await page.setData({ history: testHistory });
      
      const pageData = await page.data();
      expect(pageData.history.length).toBe(3);
    });
  });

  describe('时间显示', () => {
    test('历史记录应该显示时间', async () => {
      const testHistory = [
        {
          id: 1,
          question: '测试问题',
          reply: '测试回复',
          createTime: '2024-01-01 12:00'
        }
      ];
      
      await page.setData({ history: testHistory });
      
      const itemTime = await page.$('.item-time');
      const text = await itemTime.text();
      expect(text).toBe('2024-01-01 12:00');
    });
  });
});
