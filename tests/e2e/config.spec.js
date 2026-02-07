/**
 * @jest-environment jsdom
 */
const path = require('path');
const fs = require('fs');

// 读取配置文件
const appConfig = require('../../app.json');

describe('应用配置测试', () => {
  describe('页面配置', () => {
    test('6个页面', () => {
      expect(appConfig.pages.length).toBe(6);
      expect(appConfig.pages).toContain('pages/index/index');
      expect(appConfig.pages).toContain('pages/result/result');
      expect(appConfig.pages).toContain('pages/history/history');
      expect(appConfig.pages).toContain('pages/community/community');
      expect(appConfig.pages).toContain('pages/leaderboard/leaderboard');
      expect(appConfig.pages).toContain('pages/profile/profile');
    });
  });
  
  describe('窗口配置', () => {
    test('导航栏背景米色', () => expect(appConfig.window.navigationBarBackgroundColor).toBe('#F5F5DC'));
    test('导航栏黑色文字', () => expect(appConfig.window.navigationBarTextStyle).toBe('black'));
    test('标题狗狗军师', () => expect(appConfig.window.navigationBarTitleText).toBe('狗狗军师'));
  });
  
  describe('TabBar配置', () => {
    test('4个tab', () => expect(appConfig.tabBar.list.length).toBe(4));
    test('选中巧克力色', () => expect(appConfig.tabBar.selectedColor).toBe('#D2691E'));
    test('包含首页', () => expect(appConfig.tabBar.list[0].pagePath).toBe('pages/index/index'));
    test('包含社群', () => expect(appConfig.tabBar.list[1].pagePath).toBe('pages/community/community'));
    test('包含排行榜', () => expect(appConfig.tabBar.list[2].pagePath).toBe('pages/leaderboard/leaderboard'));
    test('包含我的', () => expect(appConfig.tabBar.list[3].pagePath).toBe('pages/profile/profile'));
  });
});
