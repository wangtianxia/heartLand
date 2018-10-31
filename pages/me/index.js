// pages/me/index.js
import server from '../../server/getData'
import session from '../../utils/saveSession'
const md5 = require('../../utils/md5.js')
const app = getApp();
import time from '../../utils/time.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isme: false,
        concernus: false,
        userCoin: '',
        user_id: '',
        userGameList: [],
        userInfo: {},
        num: 0,
        form_id: 0, //form_id
        customerName: '',
        tabList: [ //底部导航
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
                active_tab: 0
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
                active_tab: 1
            },
        ],
        currentIndex: 0, //下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '数据加载中'
        });
       wx.hideShareMenu({
       })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        // 断开试玩
        time.checkOutTime('', 1);
        this.setTimeoutTime() //显示红包的个数
        //红包相关数据
        server.selectUserInfoNew({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res.st > 0) {
                wx.hideLoading();
                app.globalData.myUserInfo = res.info;
                this.setData({
                    userCoin: app.globalData.myUserInfo.coin / 100,
                    user_id: res.info.user_id,
                    isme: true,
                    userInfo: res.info
                });
            }
        });
        //获取客服微信号
        server.servWX({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        },(res)=>{
            if(res['st'] > 0){
                this.data.customerName = res['info'];
            }
            this.setData({
                customerName:this.data.customerName
            })
        })
    },

   
    /**
     * 提现
     */
    toGetm: function() {
        server.checkUserGameTiming({ //检测有没有试玩游戏
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, {
                form_id: this.data.form_id
            },
            (res) => {})
        wx.navigateTo({
            url: '../withdraw/index'
        })
    },

    /**
     * 红包个数
     */
    setTimeoutTime() {
        setTimeout(() => {
            server.selectUserGameRewardCount({
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, (res) => {
                if (res['st'] == 1) {
                    this.data.num = res['info'];
                    this.setData({
                        num: this.data.num
                    })
                }
            })
            //玩过的游戏列表
            server.selectUserGameList({
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, (res) => {
                if (res.st > 0) {
                    this.setData({
                        userGameList: res.info
                    })
                }
            })
        }, 1000)
    },

    /**
     * 我的订单
     */
    toUserItemList: function() {
        wx.navigateTo({
            url: '../useritemlist/useritemlist'
        })
    },

    /**
     * 公众号点击
     */
    onTextC() {
        this.setData({
            concernus: true
        })
    },

    /**
     * 玩过的游戏
     */
    onGameImageCall(e) {
        let index = e.currentTarget.dataset.index;
        let game_id = this.data.userGameList[index].game_id;
        let game_name = this.data.userGameList[index].game_name;
        let game_appid = this.data.userGameList[index].game_appid;
        let user_id = app.globalData.myUserInfo.user_id;
        let path = this.data.userGameList[index]['ch_no'] || ''
        if (game_appid) {
            wx.navigateToMiniProgram({
                appId: game_appid,
                path: path,
                success: res => {
                    // 打开成功
                    server.uploadGameData({
                        user_id: app.globalData.myUserInfo.user_id,
                        game_id: game_id,
                        time: Math.floor(Date.now() / 1000)
                    }, {
                        game_name: game_name,
                        acc_type: 1,
                        game_appid: game_appid,
                        trial_st: 0
                    }, (res) => {

                    })
                }
            })
        } else {
            server.uploadGameData({
                user_id: app.globalData.myUserInfo.user_id,
                game_id: game_id,
                time: Math.floor(Date.now() / 1000)
            }, {
                game_name: game_name,
                acc_type: 2,
                game_appid: game_appid,
                trial_st: 0
            }, (res) => {

            })
            wx.previewImage({
                current: this.data.userGameList[index].code_url, // 当前显示图片的http链接
                urls: [this.data.userGameList[index].code_url] // 需要预览的图片http链接列表
            })
        }
    },


    concernOver() {
        this.setData({
            concernus: false
        })
    },

    /**
     * 复制客服微信号
     */
    copyActive(e) {
        var self = this;
        wx.setClipboardData({
            data: self.data.customerName,
            success: function (res) {
                wx.hideToast();
                wx.showToast({
                    title: '微信号码复制成功，去添加好友吧。',
                    icon: 'none',
                    duration: 2000
                })
            }
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    //我的试玩
    toRedBagItemList(e) {
        server.checkUserGameTiming({ //检测有没有试玩游戏
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, {
                form_id: this.data.form_id
            },
            (res) => {})
        let num = this.data.num
        wx.navigateTo({
            url: '../redRecored/redRecored?num=' + num
        })
    },
    //获取form_id
    submitInfo: function(e) {
        // 这样我们就可以获取到form_id了
        console.log(e.detail.formId);
        this.data.form_id = e.detail.formId;
    },
    //底部导航点击事件
    clickTab: function(e) {
        let self = this;
        for (let i = 0; i < self.data.tabList.length; i++) {
            if (e.currentTarget.dataset.index == i) {
                if (self.data.tabList[i]['active_tab'] == 0) {
                    self.data.tabList[i]['active_tab'] = 1
                    if (i == 0) {
                        wx.redirectTo({
                            url: '/pages/home/index'
                        })
                    } else if (i == 1) {
                        wx.redirectTo({
                            url: '/pages/sign/index'
                        })
                    } else if (i == 2) {
                        wx.redirectTo({
                            url: '/pages/tenSecond/index'
                        })
                    }
                } else {
                    self.data.tabList[i]['active_tab'] = 0
                }
            } else {
                self.data.tabList[i]['active_tab'] = 0
            }
        }
        self.setData({
            active_tab: self.data.currentIndex,
            tabList: self.data.tabList,
        })

    },
    //滚动到顶部/左边，会触发 scrolltoupper 事件
    upper: function (e) {
        console.log(e)
    },
    //滚动到底部/右边，会触发 scrolltolower 事件
    lower: function (e) {
        console.log(e)
    },
    //滚动时触发，event.detail = {scrollLeft, scrollTop, scrollHeight, scrollWidth, deltaX, deltaY}
    scroll: function (e) {
        console.log(e)
    }
})