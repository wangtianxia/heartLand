import req from './req.js';
import MD5 from '../utils/md5.js';

let serverReq = {

    /**
     * 提交用户到服务器
     * @param {*} data 
     * @param {*} cb 
     */
    registPlatUser(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, data, obj);
        req('registPlatUser', data, 'POST', cb);
    },

    /**
     * 获取banner数据
     * @param {*} data 
     * @param {*} cb 
     */
    selectGameBannerOrd(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectGameBannerOrd', data, 'POST', cb);
    },

    /**
     * 获取首页列表数据
     * @param {*} data 
     * @param {*} cb 
     */
    selectGameList(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, data, obj);
        req('selectGameList', data, 'POST', cb);
    },

    /**
     *获取用户签到情况（初始化） 
     * @param {*} data 
     * @param {*} cb 
     */
    selectUserSignupInfo(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserSignupInfo', data, 'POST', cb);
    },




    /**
     * 用户签到
     * @param {*} data 
     * @param {*} cb 
     */
    processUserLott(data, cb) {
        data.sign = MD5.M5B(data);
        req('processUserLott', data, 'POST', cb);
    },

    /**
     * 创建支付订单
     * @param {*} data 
     * @param {*} cb 
     */
    insertWXOrderNew(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data.order_name = obj['order_name'];
        req('insertWXOrderNew', data, 'POST', cb);
    },

    /**
     * 设置邀请人数
     * @param {*} data 
     * @param {*} cb 
     */
    selectInviteCount(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectInviteCount', data, 'POST', cb);
    },

    /**
     * 签到用户排行
     * @param {*} data 
     * @param {*} cb 
     */
    selectLottUList(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectLottUList', data, 'POST', cb);
    },

    /**
     * 获取分享语
     * @param {*} data 
     * @param {*} cb 
     */
    selectShareContent(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectShareContent', data, 'POST', cb);
    },

    /**
     * 分享后告知服务器
     * @param {*} data 
     * @param {*} cb 
     */
    shareInsertUserItem(data, cb) {
        data.sign = MD5.M5B(data);
        req('shareInsertUserItem', data, 'POST', cb);
    },


    /**
     * 商城 -- 商城热卖
     * @param {*} data 
     * @param {*} cb 
     */
    selectUserItemHotShow(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserItemHotShow', data, 'POST', cb);
    },

    /**
     * 商城 -- 提交地址
     * @param {*} data 
     * @param {*} cb 
     */
    uploadExpressInfo(data, cb) {
        data.sign = MD5.M5B(data);
        req('uploadExpressInfo', data, 'POST', cb);
    },

    /**
     * 商城 -- 购买
     * @param {*} data 
     * @param {*} cb 
     */
    buyUserItemOrder(data, cb) {
        data.sign = MD5.M5B(data);
        req('buyUserItemOrder', data, 'POST', cb);
    },

    /**
     * 商城 -- 商城列表
     * @param {*} data 
     * @param {*} cb 
     */
    selectUserItemShow(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserItemShow', data, 'POST', cb);
    },

    /**
     * 商品详情 -- 商品详情
     * @param {*} data 
     * @param {*} cb 
     */
    selectUserItemInfo(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserItemInfo', data, 'POST', cb);
    },

    /**
     * 我 -- 获取用户信息
     * @param {*} data 
     * @param {*} cb 
     */
    selectUserInfoNew(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserInfoNew', data, 'POST', cb);
    },

    /**
     * 我 -- 获取游戏列表
     * @param {*} data 
     * @param {*} cb 
     */
    selectUserGameList(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserGameList', data, 'POST', cb);
    },

    /**
     * 我的抢购订单
     * @param {*} data 
     * @param {*} cb 
     */
    selectUserOwnItemList(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj)
        req('selectUserOwnItemList', data, 'POST', cb);
    },

    /**
     * 上传视频
     * @param {*} data
     * @param {*} cb
     */
    upload_video(data, cb) {
        let obj = {
            uid: data.uid,
            content: data.content
        }
        obj.sign = MD5(obj);
        let loadVideo = wx.uploadFile({
            url: ev.url + 'upload_video',
            filePath: data['video'],
            name: 'video',
            formData: obj,
            success(res) {
                cb(null, res)
            },
            fail(err) {
                cb(err)
            }
        })
        return loadVideo
    },

    /**
     * 微信支付
     * @param {*} data
     * @param {*} cb
     */
    wxPay(data, cb) {
        wx.requestPayment({
            timeStamp: data['timeStamp'],
            nonceStr: data['nonceStr'],
            package: data['package'],
            signType: data['signType'],
            paySign: data['paySign'],
            success(res) {
                cb(null, res)
            },
            fail(err) {
                cb(err)
            }
        })
    },

    /**
     * 判断是否是审核(新的)
     * gameServSt
     * 参数user_id,time,sign(user_id,time组成)
        返回{st:2}审核状态，{st:1}非审核状态
     */
    gameServSt(data, cb) {
        data.sign = MD5.M5B(data);
        req('gameServSt', data, 'POST', cb);
    },

    /**
     * 签到（新的）
     * processUserSignup
     */
    processUserSignup(data, cb) {
        data.sign = MD5.M5B(data);
        req('processUserSignup', data, 'POST', cb);
    },

    /**
 * 试玩游戏列表
 *参数:user_id,time,page(页码，填1),count(每页个数，填3),sign(user_id, time)
  返回：{st:1, info:[], count:3}
 */

    selectTrialGameList(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('selectTrialGameList', data, 'POST', cb);
    },

    /**
     * 按类型取游戏列表
     * 参数：user_id,time,page,count,sign(user_id,time)
      返回：{st:1, info:[]}
     */
    selectGameListByType(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('selectGameListByType', data, 'POST', cb);
    },

    /**
     * 向后台提交游戏数据
     */
    uploadGameData(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('uploadGameData', data, 'POST', cb);
    },

    /**
     * 删除游戏红包倒计时
     * deleteGameRewardTiming
     * 参数：user_id,time,game_id,sign(user_id,time)
       返回：{st:1, info:'删除成功'}

     */
    deleteGameRewardTiming(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('deleteGameRewardTiming', data, 'POST', cb);
    },

    /**
     * 未领红包数额
     *  selectUserGameRewardCount
        参数：user_id,time,sign
        返回：{st:1,info:3}
     */
    selectUserGameRewardCount(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserGameRewardCount', data, 'POST', cb)
    },

    /**
     * 未领红包信息
       参数：user_id, time,sign
       返回：{st:1, info:{红包信息}}
     */
    selectUserGameRewardInfo(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectUserGameRewardInfo', data, 'POST', cb)
    },

    /**检测试玩状态
     * checkUserGameTiming
       参数：user_id,time,sign
       返回：{st:1, info:''}
     */
    checkUserGameTiming(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('checkUserGameTiming', data, 'POST', cb)
    },

    /**领红包
     * getGameReward
       参数：user_id,game_id,time,sign(user_id,time)
       返回：{st:1, info:23} 奖励金额单位分
     */
    getGameReward(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('getGameReward', data, 'POST', cb)
    },


    /**
     * 分享领双倍红包
     * 接口：getGameDoubReward
       参数：user_id,game_id,time,sign(user_id,time)
       返回：{st:1, info:23} 奖励金额单位分
     */
    getGameDoubReward(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('getGameDoubReward', data, 'POST', cb)
    },

    /**
     * 红包记录列表
     * 接口：selectUserGameRewardList
     * 参数：user_id,page,count,time,sign(user_id,time)
     * 返回：{st:1, info:[]}
     */
    selectUserGameRewardList(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('selectUserGameRewardList', data, 'POST', cb)
    },

    /**
     * 插入邀请关系
       接口：insertInviteInfo
       参数：user_id(被邀请者),time,invite_user(邀请者),sign(user_id,time)
       返回：{st:1, info:'邀请成功'}
     */
    insertInviteInfo(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('insertInviteInfo', data, 'POST', cb)
    },

    //游戏分类
    selectGameTypeList(data, cb) {
        data.sign = MD5.M5B(data);
        req('selectGameTypeList', data, 'POST', cb)
    },

    //客服微信号servWX
    servWX(data, cb) {
        data.sign = MD5.M5B(data);
        req('servWX', data, 'POST', cb)
    },

    /**
     * 被邀请人信息
     * user_id,time,sign
     */
    selectInviteList(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('selectInviteList', data, 'POST', cb)
    },

    /**
     * 获取分享进入页的信息
     * selectSignupRewardInfo
     */
    selectSignupRewardInfo(data,cb) {
        data.sign = MD5.M5B(data);
        req('selectSignupRewardInfo', data, 'POST', cb)
    },

    /**
     * 生成邀请红包
     * user_id,game_id(传邀请者user_id)，time，sign(user_id,time)
     */
    makeInviteReward(data, obj, cb) {
        data.sign = MD5.M5B(data);
        data = Object.assign(data, obj);
        req('makeInviteReward', data, 'POST', cb)
    }
    
}


export default serverReq;