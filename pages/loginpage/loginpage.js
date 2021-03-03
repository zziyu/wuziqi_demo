// pages/loginpage/loginpage.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoList:{
      avatarUrl:'',
      nickName:'未登陆'
    },
    hasUserInfo:false,
    scores:{
      win:0,
      lose:0,
      draw:0,
    }
  },

  addNewUserToDb(userInfoList){
    wx.cloud.callFunction({
      name:'loginfun',
      data:{
        userInfoList:userInfoList
      }
    }).then(res => {
      console.log('添加用戶', res)
    }).catch(err => {
      console.error('添加失敗', err)
    })
  },
  // win 1 lose -1 draw 0
  updateScoresToDb(score){
    // console.log('updateScoresToDb score=',score)
    wx.cloud.callFunction({
      name:'updateScore',
      data:{
        newScoreInt:score
      }
    }).then(res => {
      console.log('更新数据', res)
      if(res.success) {
        console.log('更新数据成功')
      }
    }).catch(err => {
      console.error('更新数据失败', err)
    })
  },
  getUserDataFromDb(param){
    wx.cloud.callFunction({
      name:'getUserData',
    }).then(res => {
      console.log('获取用户数据成功', res.result)
      if (res.result.success){
        this.setData({
          scores:res.result.userData[0].scores
        })
        return {
          openid:res.openid,
          usrName:res.result.usrName,
          scores:res.result.userData[0].scores,
          errMsg:res.errMsg,
        }
      } else{
        return {
          openid:res.openid,
          usrName:'',
          scores:{},
          errMsg:res.errMsg,
        }
      }
    }).catch(err => {
      console.error('获取用户数据失败', err)
      return {
        openid:'',
        usrName:'',
        scores:{},
        errMsg:err,
      }
    })
  },
  HandleGetUserInfo(res){
    console.log('点击了开始游戏',res)
    if(res.detail.userInfo){ //若允许则获取用户信息，并存入userInfTest
      this.setData({
        userInfoList:res.detail.userInfo
      })
      this.addNewUserToDb(res.detail.userInfo)
    } else {
      return
    }
    wx.navigateTo({
      url: '/pages/game/game',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 授权以后获取用户信息
    wx.getUserInfo({
      success: (res) =>{
        this.setData({
          userInfoList: res.userInfo,
          hasUserInfo: true
        })
        console.log("已授权，获取用户信息成功",res)
        this.addNewUserToDb(res.userInfo)
      },
      fail: (err) =>{"未授权，获取用户信息失败",console.log(err)},
    })
    this.updateScoresToDb(1)
    this.updateScoresToDb(-1)
    this.updateScoresToDb(0)
    this.getUserDataFromDb()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})