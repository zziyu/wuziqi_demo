// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db_name = 'wuziqidb';
const db = cloud.database()
const _ = db.command

// 云函数入口函数,scores{win:1,lose:0,draw:0}
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const usrID = wxContext.OPENID
  let userRecord = []
  let success = false
  let userErrMsg
  try {
    const querResult = await db.collection(db_name).where({
      _openid: usrID
    }).get()
    userRecord = querResult.data
    if(userRecord.length <= 0) {
      userErrMsg = '未查詢到用戶数据，更新失败'
    } else {
      if (event.newScoreInt < 0) {
        userRecord[0].scores.lose += 1
      } else if(event.newScoreInt > 0){
        userRecord[0].scores.win += 1;
      } else {
        userRecord[0].scores.draw += 1;
      }
      await db.collection(db_name).where({
        _openid: usrID
      }).update({
        data:{scores:userRecord[0].scores}
      }).then(res => {
        console.log('更新数据成功', res)
        success = true
      }).catch(err => {
        userErrMsg = err
        success = false
      })
    }
  } catch (err) {
    userErrMsg = err
  }
  return {
    openid: wxContext.OPENID,
    newScores: userRecord[0].scores,
    userErrMsg: userErrMsg,
    success:success,
    nihaoma:'are you ok',
    event2:event,
  }
}