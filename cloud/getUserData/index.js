// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db_name = 'wuziqidb';
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const usrID = wxContext.OPENID
  let userRecord
  let errMsg
  let success = false
  try {
    const querResult = await db.collection(db_name).where({
      _openid: usrID
    }).get()
    userRecord = querResult.data
    if(userRecord.length > 0) {
      success = true
    }
  } catch (err) {
    errMsg = err
  }
  return {
    openid: wxContext.OPENID,
    userData: userRecord,
    success:success,
    errMsg: errMsg,
  }
}