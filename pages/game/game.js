// pages/game/game.js

import FiveStone from '../../src/fiveStone';

/** 处理用户点击的位置，转换为相对棋盘的二位数组下标 */
function handleTouch(e) {
  const currPage = getCurrentPages()[1];
  /* console.log(currPage); */

  const stepLoc = currPage.fiveStone.getStepPosition(e);
  currPage.loc = currPage.fiveStone.getStepLocation(e);
  //console.log(currPage.loc);
  if(stepLoc == null) {
    currPage.setData({
      showStepTip:false
    })
    console.log("stepLoc is null");
    return;
  }
  currPage.setData({
    'stepLoc':stepLoc,
    showStepTip:true
  });
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showStepTip:false,
    /** 当前棋子相对棋盘的二位数组的坐标 */
    stepLoc: {
      x:0,
      y:0
    },
    enabelAI:true,
    gameover:false
  },

  onChessBoardTouchStart: function (e) {
    //console.log(e);
    handleTouch(e);
  },
  onChessBoardTouchMove: function (e) {
    //console.log(e);
    handleTouch(e);
  },
  onChessBoardTouchEnd: function (e) {
    console.log(this.loc);
    this.setData({
      showStepTip:false
    })
    const loc = this.loc;
    if (loc != null) {
      var stepRes = this.fiveStone.step(loc.x, loc.y);
      /** 下子成功再进行判赢 */
      if (!stepRes) {
        return;
      }
      this.jugeWin();
      this.refreshFiveStone();
      if(!this.enabelAI) {
        return;
      }
      var stepAIRes = this.fiveStone.stepAI(loc.x, loc.y);
      if (!stepAIRes) {
        return;
      }
      this.jugeWin();
      this.refreshFiveStone();
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fiveStone = new FiveStone(10);
    this.setData({
      'fiveStone':this.fiveStone
    });

    this.loc = null;
  },

  restart: function() {
    this.setData({
      'gameover':false
    });
    this.fiveStone.restart();
    this.refreshFiveStone();
  },

  undo: function() {
    this.fiveStone.undo();
    this.refreshFiveStone();
  },

  enabelAI:function() {
    this.setData({
      'enabelAI':true
    })
  },

  disableAI:function() {
    this.setData({
      'enabelAI':false
    })
  },

  refreshFiveStone: function () {
    this.setData({
      'fiveStone':this.fiveStone
    });
  },

  jugeWin: function() {
    const loc = this.loc;
    if(loc == null) {
      return
    }
    var winFlag = this.fiveStone.juge(loc.x, loc.y);
    if(winFlag) {
      this.setData({
        'gameover':true
      });
    }
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