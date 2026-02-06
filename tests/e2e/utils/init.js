/**
 * 测试工具函数
 */
const automator = require('miniprogram-automator');
const { PAGES } = require('./constants');

let miniProgram = null;

/**
 * 启动小程序
 * @param {Object} options - 启动选项
 * @returns {Promise<miniProgram>} 小程序实例
 */
async function launchApp(options = {}) {
  if (miniProgram) {
    return miniProgram;
  }

  miniProgram = await automator.launch({
    projectPath: options.projectPath || process.cwd(),
    cliPath: options.cliPath || '/Applications/wechatdevtools.cli',
    timeout: options.timeout || 30000
  });

  return miniProgram;
}

/**
 * 跳转到指定页面
 * @param {string} pagePath - 页面路径
 * @returns {Promise<void>}
 */
async function navigateTo(pagePath) {
  if (!miniProgram) {
    await launchApp();
  }
  await miniProgram.reLaunch(pagePath);
  await miniProgram.waitForTimeout(500);
}

/**
 * 获取当前页面
 * @returns {Promise<Page>} 当前页面实例
 */
async function getCurrentPage() {
  if (!miniProgram) {
    await launchApp();
  }
  return miniProgram.currentPage();
}

/**
 * 点击元素
 * @param {string} selector - CSS 选择器
 * @returns {Promise<void>}
 */
async function tap(selector) {
  const page = await getCurrentPage();
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  await element.tap();
  await miniProgram.waitForTimeout(300);
}

/**
 * 点击多个元素中的一个（按索引）
 * @param {string} selector - CSS 选择器
 * @param {number} index - 元素索引
 * @returns {Promise<void>}
 */
async function tapByIndex(selector, index = 0) {
  const page = await getCurrentPage();
  const elements = await page.$$(selector);
  if (!elements || elements.length === 0) {
    throw new Error(`Elements not found: ${selector}`);
  }
  await elements[index].tap();
  await miniProgram.waitForTimeout(300);
}

/**
 * 输入文本
 * @param {string} selector - CSS 选择器
 * @param {string} text - 要输入的文本
 * @returns {Promise<void>}
 */
async function input(selector, text) {
  const page = await getCurrentPage();
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  await element.input(text);
}

/**
 * 断言文本存在
 * @param {string} text - 要查找的文本
 * @returns {Promise<void>}
 */
async function expectText(text) {
  const page = await getCurrentPage();
  const pageData = await page.data();
  const pageContent = JSON.stringify(pageData);
  
  if (!pageContent.includes(text)) {
    throw new Error(`Text not found: ${text}`);
  }
}

/**
 * 断言当前页面 URL
 * @param {string} url - 预期页面路径
 * @returns {Promise<void>}
 */
async function expectUrl(url) {
  const page = await getCurrentPage();
  const currentUrl = page.path;
  
  if (currentUrl !== url) {
    throw new Error(`Expected URL: ${url}, but got: ${currentUrl}`);
  }
}

/**
 * 等待页面加载
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<void>}
 */
async function waitForPageLoad(timeout = 5000) {
  await miniProgram.waitForTimeout(timeout);
}

/**
 * 获取元素文本
 * @param {string} selector - CSS 选择器
 * @returns {Promise<string>} 元素文本
 */
async function getText(selector) {
  const page = await getCurrentPage();
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element.text();
}

/**
 * 检查元素是否存在
 * @param {string} selector - CSS 选择器
 * @returns {Promise<boolean>} 元素是否存在
 */
async function elementExists(selector) {
  const page = await getCurrentPage();
  const element = await page.$(selector);
  return element !== null;
}

/**
 * 关闭小程序
 * @returns {Promise<void>}
 */
async function closeApp() {
  if (miniProgram) {
    await miniProgram.close();
    miniProgram = null;
  }
}

module.exports = {
  launchApp,
  navigateTo,
  getCurrentPage,
  tap,
  tapByIndex,
  input,
  expectText,
  expectUrl,
  waitForPageLoad,
  getText,
  elementExists,
  closeApp
};
