// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'doghead-advisor-env', // 请替换为你的云开发环境 ID
        traceUser: true,
      });
    }
    
    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      history: wx.getStorageSync('history') || []
    };
  },
  
  globalData: {
    userInfo: null,
    history: []
  }
});
