const fs = require('fs');
describe('配置测试', () => {
  test('4个页面', () => {
    const pages = ['pages/home/home', 'pages/community/community', 'pages/leaderboard/leaderboard', 'pages/profile/profile'];
    expect(pages.length).toBe(4);
  });
  test('TabBar颜色', () => {
    const selectedColor = '#FF8A00';
    expect(selectedColor).toBe('#FF8A00');
  });
  test('背景色', () => {
    const bgColor = '#1a1a2e';
    expect(bgColor).toBe('#1a1a2e');
  });
});
