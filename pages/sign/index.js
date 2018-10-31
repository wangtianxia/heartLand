// pages/sign/index.js
import server from '../../server/getData'
import session from '../../utils/saveSession'
const md5 = require('../../utils/md5.js')
import time from '../../utils/time.js'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isgift: true,
        toptext: '当前话费',
        gold: '',
        userno: '',
        goldx: '',
        bttext: '',
        showTimeText:false,
        time: '00:00:00',
        // 领奖用户排行初始数据
        userList: [{
                user_name: '暂无',
                head_img: '../../image/nouserimg.png',
                coin: '暂无'
            },
            {
                user_name: '暂无',
                head_img: '../../image/nouserimg.png',
                coin: '暂无'
            },
            {
                user_name: '暂无',
                head_img: '../../image/nouserimg.png',
                coin: '暂无'
            }
        ],
        tabList: [  //底部导航
            {
                tab_name: '游戏',
                tab_on_img: '../../image/select_play.png',
                tab_off_img: '../../image/play_tb_img.png',
                active_tab: 0
            },
            {
                tab_name: '签到',
                tab_on_img: '../../image/select_sign.png',
                tab_off_img: '../../image/sign_tb_img.png',
                active_tab: 1
            },
            {
                tab_name: '抢十秒',
                tab_on_img: '../../image/select_ten.png',
                tab_off_img: '../../image/ten_tb_img.png',
                active_tab: 0
            },
            {
                tab_name: '我的',
                tab_on_img: '../../image/select_me.png',
                tab_off_img: '../../image/me_tb_img.png',
                active_tab: 0
            },
        ],
        invitataionArr:[],
        headImgtempArr:[],  //装头像的数组
        currentIndex:0,  //下标
        getCoinTitle: '',
        getCoinNo: '',
        bt_type: 1,
        shareToF: false, // 邀请群好友一起参加签到，奖金可翻倍
        isPayOk: false, // 支付完成 添加下程序
        getGold: false, // 和好友炫耀一下
        isNeedDialog: false, // 您来晚啦，上期瓜分已结束
        isGoldOver: false, // 奖池被瓜分完啦，下次早些来签到哦
        share_con1: '',
        share_con2: '',
        share_con3: '全部都免费，再慢就没有了',
        share_img1: 'https://xcxgv.xintiao98.com/images/share1.jpg',
        share_img2: 'https://xcxgv.xintiao98.com/images/share2.jpg',
        isShowAlert: false,
        isRedActive: false, //红包动态显示
        isTryPlayGame: false,
        showInvite: false,  //已邀请人数
        signScene:'',
        isShowFinger:false,
        isShowFingerAlert:false,
        showGold:false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // 设置签到人数 和初始化一些数据
        this.selectInviteCount();
        wx.showLoading({
            title: '数据加载中'
        });
        wx.hideShareMenu({   //隐藏分享
        })      
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        // 获取签到列表
        this.selectLottUList()
        // 获取分享语
        this.selectShareContent()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function(options) {
        // 设置签到人数 和初始化一些数据
        this.selectInviteCount();
        //被邀请的人的信息
        this.invitationPerson();
        //有无未领红包
        this.setTimeOutCutTime();
         // 断开试玩
         time.checkOutTime('', 1);
         //获取场景值
         this.data.signScene = app.globalData.scene;
         if(this.data.signScene == 1089){
             this.setData({
                 isShowFinger:false
             })
         }else{
              this.setData({
                  isShowFinger:true
              })
         }
    },

    /**
     * 被邀请人的信息
     */
    invitationPerson(){
        server.selectInviteList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        },{},(res) =>{
            if(res.st > 0){
                let tempArr = [];
                this.data.invitataionArr = []
                tempArr = res.info;
                let len = res.info.length;
                if(len<5){
                    for(let i=0;i<5-len;i++){
                        this.data.invitataionArr.push({
                            head_img: '../../image/head_user_img.png'
                        })
                    }
                }
                this.data.invitataionArr = tempArr.concat(this.data.invitataionArr)
                this.setData({
                    invitataionArr: this.data.invitataionArr
                })
            }
        })
    },


    /**
     * 签到数据
     */
    selectLottUList() {
        server.selectLottUList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res.st > 0) {
                wx.hideLoading()
                this.setData({
                    userList: res.info
                })
            }
        })
    },

    /**
     * 获取分享语
     */
    selectShareContent() {
        server.selectShareContent({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res.st > 0) {
                if (res['info'] && res['info']['share_con1']) {
                    this.setData({
                        share_con1: res.info['share_con1']
                    })
                }
                if (res['info'] && res['info']['share_con2']) {
                    this.setData({
                        share_con2: res.info['share_con2']
                    })
                }
            }
        })
    },

    /**
     * 设置定时器
     */
    setTime() {
        if (this.lostTime == 0) {
            this.setData({
                time: '正在开奖'
            });

            this.selectShareContent(); //获取分享语
            this.selectLottUList(); //签到数据
            this.selectInviteCount(); //设置邀请人数 和初始化 签到状态
        } else {
            let time = this.lostTime
            let h = parseInt(time / 3600)
            let m = 0
            if (h != 0) {
                m = parseInt(time % (h * 3600) / 60)
            } else {
                m = parseInt(this.lostTime / 60)
            }
            let s = time % 60
            if (h < 10) {
                h = '0' + h
            }
            if (m < 10) {
                m = '0' + m
            }
            if (s < 10) {
                s = '0' + s
            }
            let strTime =  h + ':' + m + ':' + s
            this.lostTime = this.lostTime - 1
            this.setData({
                time: strTime
            })
        }
    },

    /**
     * 设置邀请人数 和初始化 签到状态
     */
    selectInviteCount() {
        // 设置人数
        server.selectInviteCount({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            let info = res.info
            if (res.st > 0) {
                if (info == 1) {  //0 < info && info < 5
                    this.setData({
                        goldx: '已邀请到 ' + info + ' 人，奖金+' + 2 + '0%'
                    })
                } else if (info == 2){
                    this.setData({
                        goldx: '已邀请到 ' + info + ' 人，奖金+' + 4 + '0%'
                    })
                } else if (info == 3){
                    this.setData({
                        goldx: '已邀请到 ' + info + ' 人，奖金+' + 6 + '0%'
                    })
                } else if (info == 4){
                    this.setData({
                        goldx: '已邀请到 ' + info + ' 人，奖金+' + 8 + '0%'
                    })
                } else if (info >= 5) {
                    this.setData({
                        goldx: '已邀请到 ' + info + ' 人，奖金+100%'
                    })
                }else {
                    this.setData({
                        goldx: '已邀请到 ' + info + ' 人，奖金+0%'
                    })
                }
            } else {
                this.setData({
                    goldx: ''
                })
            }
        })
        // 设置签到状态
        server.selectUserSignupInfo({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res['st'] == 1) { // 6-7点返回签到

                this.bt_type = 1
                this.setData({
                    bttext: '签到，瓜分奖池',
                    gold: res.lott_sum + '元',
                    userno: '',
                    toptext: '奖池余额',
                    goldx: this.data.goldx,
                    showInvite: false,
                    showGold:false
                })
                session.saveData('checktype', 0);
            }

            if (res['st'] == 2 || res['st'] == 5) { //已经签到了 但是还在6-7点（）
                this.bt_type = 6 // 试玩
                if (res['st'] == 5) {
                    this.setData({
                        bttext: '参与瓜分话费',
                        gold: '奖池被瓜分完啦',
                        userno: '',
                        toptext: '当前话费',
                        showInvite: false,
                        showGold:false
                    })
                } else if (res['st'] == 2) {
                    this.setData({
                        bttext: '参与瓜分话费',
                        gold: res.lott_sum + '元',
                        userno: '共参与' + res.user_sum + '人',
                        toptext: '当前话费',
                        showInvite: false,
                        showGold:false
                    })
                }
                session.saveData('checktype', 0)
            }


            if (res['st'] == 4 || res['st'] == 3) { // info:"已签到(已报名)"
                this.bt_type = 2
                this.setData({
                    bttext: '瓜分倒计时',
                    showTimeText:true,
                    gold: res.lott_sum + '元',
                    userno: '共参与' + res.user_sum + '人',
                    toptext: '当前话费',
                    showInvite: true,
                    showGold:true
                })
            }

            if (res['st'] == 6) { // info"未参与抽奖（只是给个提示,表示此时是可以试玩的）"
                this.bt_type = 6 // 试玩
                let temp = session.getData('checktype')
                if (!temp || temp == '0') {
                    this.setData({
                        isNeedDialog: true
                    })
                } else {
                    this.setData({
                        isNeedDialog: false
                    })
                }
                this.setData({
                    bttext: '参与瓜分话费',
                    gold: res.lott_sum + '元',
                    userno: '共参与' + res.user_sum + '人',
                    toptext: '当前话费',
                    showInvite: false,
                    showGold:false
                })
            }

            // 倒计时（每个人阶段都有）
            if (this.MyName) {
                clearInterval(this.MyName)
            }
            if (res.time) {
                this.lostTime = res.time
                this.setTime()
                this.MyName = setInterval(this.setTime, 1000)
            } else {
                this.setData({
                    time: '正在瓜分中'
                })
            }
        })
    },

    // 按钮上所有的动作
    allAction() {
        if (this.bt_type == 1) { // 签到
            this.processUserLott()
        }

        if (this.bt_type == 2) { // 分享
            this.setData({
                shareToF: true
            })
        }
        if (this.bt_type == 6) { // 试玩
            this.setData({
                isShowAlert: true
            })
        }
    },
    //去开红包
    getOpenRedBag(){
        wx.redirectTo({
            url: '/pages/me/index'
        })
    },

    // 6-7点时间段 签到
    processUserLott() {
        server.processUserLott({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res.st > 0) {
                let coin = res.rand_coin + res.invite_coin
                let lott_coin = res.lott_coin
                if (coin == lott_coin) {
                    if (res.invite_coin == 0.00) {
                        this.setData({
                            getCoinTitle: '恭喜你',
                            getGold: true,
                            getCoinNo: '领取' + res.rand_coin + '元'
                        })
                    } else {
                        this.setData({
                            getCoinTitle: '恭喜你',
                            getGold: true,
                            getCoinNo: '领取' + res.rand_coin + '元+' + res.invite_coin + '元'
                        })
                    }
                } else {
                    this.setData({
                        getCoinTitle: '很遗憾',
                        getGold: true,
                        getCoinNo: '奖池仅剩' + coin + '元，下次记得要早些来打卡哦！'
                    })
                }
                this.share_con2 = '刚刚签到获得' + coin + '元，快来和我一起瓜分下一期'
                this.selectInviteCount()
            } else if (res.st == -8) {
                this.setData({
                    isGoldOver: true
                })
                this.selectInviteCount()
            }
        })
    },

    goPlayGame() {
        wx.showLoading({
            title: '加载中',
        })
        server.selectTrialGameList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, {
            page: 1,
            count: 1
        }, (resInfo) => {
            if (resInfo['info'] == '') {
                wx.hideLoading();
                return;
            } else {
                let path = resInfo['info'][0]['ch_no'] || ''
                wx.navigateToMiniProgram({
                    appId: resInfo['info'][0]['game_appid'],
                    path:path,
                    success: rest => {
                        wx.hideLoading();
                        server.uploadGameData({
                            user_id: app.globalData.myUserInfo.user_id,
                            game_id: resInfo['info'][0]['game_id'],
                            time: Math.floor(Date.now() / 1000)
                        }, {
                            game_name: resInfo['info'][0]['game_name'],
                            acc_type: 1,
                            game_appid: resInfo['info'][0]['game_appid'],
                            trial_st: resInfo['info'][0]['trial_st']
                        }, (res) => {

                        })
                    },
                    fail(err) {
                        console.log('navigateToMiniProgram', err)
                    }
                })
                time.checkOutTime(resInfo['info'][0]['game_id'], 0, () => {
                    console.log('试玩结束')
                    this.processUserSignup()
                })

            }

        })
    },

    closeTryGameAlert() {
        this.setData({
            isShowAlert: false
        })
    },

    /**
     * 报名
     */
    processUserSignup() {
        server.processUserSignup({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res['st'] > 0) {
                this.selectInviteCount()
                this.bt_type == 2
                this.setData({
                    bttext: '瓜分倒计时',
                    showInvite: true,
                    showGold:true
                })
            }
        })
    },

    /**
     * 关闭弹窗
     */
    closeDialog() {
        this.setData({
            shareToF: false,
            isGoldOver: false,
            isNeedDialog: false,
            isFristShare: false,
        })
    },

    /**
     * 关闭
     */
    closeDialogAndSetType() {
        session.saveData('checktype', 1)
        this.closeDialog()
    },

    /**
     * 分享后通知服务器
     * @param {*} item_id 
     */
    shareInsertUserItem(item_id) {
        server.shareInsertUserItem({
            user_id: app.globalData.myUserInfo.user_id,
            item_id: item_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res.st > 0) {}
        })
    },

    /**
     * 关闭指示弹窗
     */
    isCloseAlert(){
        this.setData({
            isShowFingerAlert:false
        })
    },

    /**
     * 点击小手
     */
    clickFingerAlert(){
        this.setData({
            isShowFingerAlert:true
        })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        let title = ''
        let imageUrl = ''
        let item_id = 0;
        let shareType = 0;
        let path = '/pages/shareComeIn/shareComeIn?id=' + app.globalData.myUserInfo.user_id;
        if (res && res.target && res.target.dataset.index == -111) {
            title = this.data.share_con1;
            imageUrl = this.data.share_img1;
            path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id + '&shareType=' + shareType;
        } else if (res && res.target && res.target.dataset.index == -222) {
            title = this.share_con2;
            imageUrl = this.data.share_img2;
        } else if (res && res.target && res.target.dataset.index == -555) {
            title = this.data.share_con1;
            imageUrl = this.data.share_img1;
            path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id + '&shareType=' + shareType + '&target_userId=' + app.globalData.myUserInfo.user_id;
        } else {
            title = this.data.share_con1;
            imageUrl = '';
            path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id;
        }
        return {
            title: title,
            path: path,
            imageUrl: imageUrl,
            success: res => {
                this.setData({
                    getGold: false,
                    shareToF: false
                })
                wx.showToast({
                    title: '分享成功',
                    icon: 'none',
                    duration: 2000
                })

                if (item_id != 0) {
                    this.shareInsertUserItem(item_id)
                }
            },
            fail: res => {
                wx.showToast({
                    title: '分享失败',
                    icon: 'none',
                    duration: 2000
                })
            }
        }
    },
    /**
     * 红包显示
     */
    setTimeOutCutTime() {
        //有无未领红包
        setTimeout(()=>{
            server.selectUserGameRewardInfo({
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000),
            }, (res) => {
                if (res['st'] > 0) {
                    this.setData({
                        isRedActive: true
                    })
                } 
            })
        },1000)
    },
    //底部导航点击事件
    clickTab:function(e){
        let self = this;
        for(let i=0;i<self.data.tabList.length;i++){
            if(e.currentTarget.dataset.index == i){
                if (self.data.tabList[i]['active_tab'] == 0){
                    self.data.tabList[i]['active_tab'] = 1
                    if (i == 0) {
                        wx.redirectTo({
                            url: '/pages/home/index'
                        })
                    } else if (i == 2) {
                        wx.redirectTo({
                            url: '/pages/tenSecond/index'
                        })
                    } else if (i == 3) {
                        wx.redirectTo({
                            url: '/pages/me/index'
                        })
                    }
                }else{
                    self.data.tabList[i]['active_tab'] = 0
                }
            }else{
                self.data.tabList[i]['active_tab'] = 0
            }
        }
        self.setData({
            active_tab: self.data.currentIndex,
            tabList: self.data.tabList,
        })
    }

})