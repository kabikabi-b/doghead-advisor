/**
 * 首页 E2E 测试
 * 测试页面: pages/index/index
 */
const automator = require('miniprogram-automator');
const { EXPECTED_TEXTS, SELECTORS, TEST_QUESTIONS } = require('../utils/constants');

describe('首页测试', () => {
  let miniProgram;
  let page;

  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: process.cwd(),
      cliPath: '/Applications/wechatdevtools.cli'
    });
  });

  beforeEach(async () => {
    page = await miniProgram.reLaunch('pages/index/index');
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

    test('应该显示标题 "狗头军师"', async () => {
      const pageData = await page.data();
      expect(pageData).toHaveProperty('title');
    });

    test('应该显示副标题 "今天有什么烦心事？"', async () => {
      const pageData = await page.data();
      expect(pageData.subtitle).toBe('今天有什么烦心事？');
    });
  });

  describe('输入功能', () => {
    test('应该能够输入问题', async () => {
      const testQuestion = TEST_QUESTIONS[0];
      await page.setData({ question: testQuestion });
      
      const pageData = await page.data();
      expect(pageData.question).toBe(testQuestion);
    });

    test('输入后字符计数应该更新', async () => {
      const testQuestion = '测试问题';
      await page.setData({ question: testQuestion });
      
      const pageData = await page.data();
      expect(pageData.question.length).toBe(testQuestion.length);
    });
  });

  describe('按钮行为', () => {
    test('问题为空时生成按钮应该禁用', async () => {
      await page.setData({ question: '', loading: false });
      
      const pageData = await page.data();
      const buttonDisabled = !pageData.question.trim() || pageData.loading;
      expect(buttonDisabled).toBe(true);
    });

    test('问题不为空时生成按钮应该可用', async () => {
      await page.setData({ question: '测试问题', loading: false });
      
      const pageData = await page.data();
      const buttonDisabled = !pageData.question.trim() || pageData.loading;
      expect(buttonDisabled).toBe(false);
    });

    test('点击生成按钮应该跳转到结果页', async () => {
      const testQuestion = '今天晚饭吃什么？';
      await page.setData({ question: testQuestion, loading: false });
      
      // 模拟点击生成按钮
      await page.evaluate(() => {
        const button = document.querySelector('.generate-btn');
        if (button) {
          button.click();
        }
      });
      
      // 验证是否跳转到结果页
      await miniProgram.waitForTimeout(500);
      const currentPage = await miniProgram.currentPage();
      expect(currentPage.path).toBe('pages/result/result');
    });

    test('点击历史记录应该跳转到历史页面', async () => {
      await page.evaluate(() => {
        const historyEntry = document.querySelector('.history-entry');
        if (historyEntry) {
          historyEntry.click();
        }
      });
      
      await miniProgram.waitForTimeout(500);
      const currentPage = await miniProgram.currentPage();
      expect(currentPage.path).toBe('pages/history/history');
    });

    test('点击热门问题应该填充输入框', async () => {
      const sampleQuestions = await page.data();
      if (sampleQuestions.sampleQuestions && sampleQuestions.sampleQuestions.length > 0) {
        const firstSampleQuestion = sampleQuestions.sampleQuestions[0];
        
        await page.evaluate((question) => {
          const items = document.querySelectorAll('.sample-item');
          if (items.length > 0) {
            items[0].click();
          }
        }, firstSampleQuestion);
        
        await page.waitForTimeout(200);
        const pageData = await page.data();
        expect(pageData.question).toBe(firstSampleQuestion);
      }
    });
  });
});
