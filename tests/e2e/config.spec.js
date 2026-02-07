/**
 * 配置文件验证测试
 * 确保 app.json 和 project.config.json 配置正确
 */

const fs = require('fs');
const path = require('path');

describe('微信小程序配置验证', () => {
  let appConfig;
  let projectConfig;

  beforeAll(() => {
    const appConfigPath = path.join(__dirname, '../../app.json');
    const projectConfigPath = path.join(__dirname, '../../project.config.json');
    
    appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
    
    if (fs.existsSync(projectConfigPath)) {
      projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
    }
  });

  describe('app.json 窗口配置验证', () => {
    test('navigationBarTextStyle 必须是 string 类型', () => {
      expect(appConfig.window).toBeDefined();
      expect(typeof appConfig.window.navigationBarTextStyle).toBe('string');
    });

    test('navigationBarTextStyle 只能是 black 或 dark', () => {
      const validValues = ['black', 'dark'];
      expect(validValues).toContain(appConfig.window.navigationBarTextStyle);
    });

    test('navigationBarBackgroundColor 必须是 string', () => {
      expect(typeof appConfig.window.navigationBarBackgroundColor).toBe('string');
    });

    test('navigationBarTitleText 必须是 string', () => {
      expect(typeof appConfig.window.navigationBarTitleText).toBe('string');
    });

    test('backgroundTextStyle 必须是 string', () => {
      expect(typeof appConfig.window.backgroundTextStyle).toBe('string');
    });

    test('背景样式只能是 light 或 dark', () => {
      const validValues = ['light', 'dark'];
      expect(validValues).toContain(appConfig.window.backgroundTextStyle);
    });
  });

  describe('app.json 页面配置验证', () => {
    test('pages 必须是数组', () => {
      expect(Array.isArray(appConfig.pages)).toBe(true);
    });

    test('pages 不能为空', () => {
      expect(appConfig.pages.length).toBeGreaterThan(0);
    });

    test('首页必须存在', () => {
      const indexPage = appConfig.pages[0];
      expect(indexPage).toBe('pages/index/index');
    });
  });

  describe('project.config.json 验证', () => {
    test('project.config.json 应该存在', () => {
      expect(projectConfig).toBeDefined();
    });

    test('appid 必须是字符串', () => {
      expect(typeof projectConfig.appid).toBe('string');
    });

    test('appid 不能为空', () => {
      expect(projectConfig.appid.length).toBeGreaterThan(0);
    });

    test('projectname 必须是字符串', () => {
      expect(typeof projectConfig.projectname).toBe('string');
    });

    test('miniprogramRoot 必须存在', () => {
      expect(projectConfig.miniprogramRoot).toBeDefined();
    });
  });
});
