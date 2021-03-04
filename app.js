// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env:'wxgame-6g2vy1ed5ff2f118',
    })
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})

/**
 * 定义克隆方法
 */
Object.defineProperty(
  Object.prototype, 
  'clone',
  {
    value: function () {
      var cloneSelf = {};
      for (var key in this) {
        const cloneCur = this[key];
        if (cloneCur instanceof Array ||
            typeof(cloneCur) == 'object') {
          cloneSelf[key] = cloneCur.clone();
        } else {
          cloneSelf[key] = cloneCur;
        }
      }
      return cloneSelf;
    },
    writable:false,
    enumerable:false,
    configurable:false
  });