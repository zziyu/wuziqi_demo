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
  let userName = event.userInfoList.nickName
  // usrID openid userName userInfo{} score{} lastLoginTime
  let userRecord
  let hadUser = false
  let errMsg
  let success = false
  try {
    const querResult = await db.collection(db_name).where({
      _openid: usrID
    }).get()
    userRecord = querResult.data
    if (userRecord.length > 0) {
      hadUser = true
    }
  } catch (err) {
    errMsg = err
  }
  if (!hadUser) {
    // 新用户，需添加
    await db.collection(db_name).add({
      data: {
        // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
        _openid: usrID,
        userName:userName,
        userInfo:event.userInfoList,
        // 分数历史
        scores: {win:0, lose:0, draw:0},
        // 缓存最大值
        lastLoginTime: '',
      }
    }).then(res =>{
      success = true
    }).catch(err => {
      errMsg = err
      success = false
    })
  }
  return {
    // event,
    openid: wxContext.OPENID,
    usrInfo: userRecord,
    hadUser: hadUser,
    success: success,
    errMsg: errMsg,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
  }
}