// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-8ge51kis0d4af40b',
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
