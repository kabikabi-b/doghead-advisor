/**
 * 结果页 E2E 测试
 * 测试页面: pages/result/result
 */
const automator = require('miniprogram-automator');
const { EXPECTED_TEXTS, SELECTORS } = require('../utils/constants');

describe('结果页测试', () => {
  let miniProgram;
  let page;

  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: process.cwd(),
      cliPath: '/Applications/wechatdevtools.cli'
    });
  });

  beforeEach(async () => {
    // 跳转到结果页并设置测试数据
    page = await miniProgram.reLaunch('pages/result/result');
    await page.setData({
      question: '今天晚饭吃什么？',
      reply: '建议吃泡面，方便又美味！',
      liked: false,
      showToast: false,
      toastText: ''
    });
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

    test('应该显示问题和答案', async () => {
      const pageData = await page.data();
      expect(pageData.question).toBe('今天晚饭吃什么？');
      expect(pageData.reply).toBe('建议吃泡面，方便又美味！');
    });

    test('初始状态未点赞', async () => {
      const pageData = await page.data();
      expect(pageData.liked).toBe(false);
    });
  });

  describe('按钮行为', () => {
    test('点击一键复制应该显示 Toast', async () => {
      await page.evaluate(() => {
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
          copyBtn.click();
        }
      });
      
      await page.waitForTimeout(500);
      const pageData = await page.data();
      expect(pageData.showToast).toBe(true);
      expect(pageData.toastText).toContain('复制');
    });

    test('点击点赞按钮应该切换点赞状态', async () => {
      await page.evaluate(() => {
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn) {
          likeBtn.click();
        }
      });
      
      await page.waitForTimeout(300);
      const pageData = await page.data();
      expect(pageData.liked).toBe(true);
    });

    test('点赞后按钮文字应该变为 "❤️ 已赞"', async () => {
      await page.evaluate(() => {
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn) {
          likeBtn.click();
        }
      });
      
      await page.waitForTimeout(300);
      const likeBtn = await page.$('.like-btn');
      const btnText = await likeBtn.text();
      expect(btnText).toContain('已赞');
    });

    test('点击"再问一个"应该返回首页', async () => {
      await page.evaluate(() => {
        const askAgainBtn = document.querySelector('.ask-again-btn');
        if (askAgainBtn) {
          askAgainBtn.click();
        }
      });
      
      await miniProgram.waitForTimeout(500);
      const currentPage = await miniProgram.currentPage();
      expect(currentPage.path).toBe('pages/index/index');
    });

    test('点击返回按钮应该返回首页', async () => {
      await page.evaluate(() => {
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
          backBtn.click();
        }
      });
      
      await miniProgram.waitForTimeout(500);
      const currentPage = await miniProgram.currentPage();
      expect(currentPage.path).toBe('pages/index/index');
    });
  });

  describe('数据传递', () => {
    test('结果页应该正确接收问题数据', async () => {
      await page.setData({
        question: '周末去哪里玩？',
        reply: '建议去公园散步，呼吸新鲜空气！'
      });
      
      const pageData = await page.data();
      expect(pageData.question).toBe('周末去哪里玩？');
      expect(pageData.reply).toBe('建议去公园散步，呼吸新鲜空气！');
    });
  });
});
