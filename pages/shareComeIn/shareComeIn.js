// pages/shareComeIn/shareComeIn.js
import server from '../../server/getData'
import time from '../../utils/time.js'
import session from '../../utils/saveSession'
const md5 = require('../../utils/md5.js')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        countDownTime: '00:00:00',
        isShowRewards: false,
        user_id: '',
        share_id: '', //分享者的id
        lott_sum: '', //当前钱数
        isShowAlert: false,
        isTryPlayGame: false, //是否还有试玩游戏
        isShowRedBag: false, //显示有红包
        isShowOpenRedBag: false, //开完红包
        isAnimationShow: 0,
        redNumber: 0, //红包
        shareIcon: 'https://xcxgv.xintiao98.com/images/share3.jpg', //分享的图片
        getRedBagTime: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // console.log(options, 'options');
        this.data.share_id = options.shareid;
        console.log(this.data.share_id);
        wx.showShareMenu({    //第一次分享拿不到shareTickets
            withShareTicket: true
        })
        // wx.hideShareMenu({})
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
        this.selectUserSignupInfo() //查看是否签到
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

    //只能分享到群（不能分享给好友）；
    onShareAppMessage: function(options) {
        let title = '';
        let path = '';
        let imageUrl = '';
        let self = this;
        let doubNum = self.data.redNumber
        if (options.target.dataset.index == -333) {
            title = '刚领到' + doubNum + '元，快来和我一起领红包吧。'
            imageUrl = self.data.shareIcon
            path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id
        } else {
            title = ''
            imageUrl = ''
            path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id
        }
        return {
            title: title,
            path: path,
            imageUrl: imageUrl,
            success(res) {
                if (!res['shareTickets']) {
                    wx.showToast({
                        title: '失败,' + '分享到群里才生效',
                        icon: 'none',
                        duration: 2000
                    })
                } else {
                    wx.getShareInfo({
                        shareTicket: res.shareTickets,
                        success: function(shareInfo) {
                            let iv = shareInfo.iv
                            let encryptedData = shareInfo.encryptedData;
                            //这里写你分享到群之后要做的事情，这里是分享到群红包翻倍
                            server.getGameDoubReward({
                                user_id: app.globalData.myUserInfo.user_id,
                                time: Math.floor(Date.now() / 1000)
                            }, {
                                game_id: self.data.share_id,
                                get_time: self.data.getRedBagTime
                            }, (res) => {
                                if (res['st'] == 1) {
                                    self.data.redNumber = res['info'] / 100;
                                    self.setData({
                                        redNumber: self.data.redNumber
                                    })
                                    wx.redirectTo({
                                        url: '/pages/sign/index'
                                    })
                                }
                            })
                        }
                    })
                    wx.showToast({
                        title: '成功,' + '成功分享到群里',
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail(err) {
                console.log('err', err,'失败');
            }
        }
    },

    //1秒以后执行
    oneMinLater: function() {
        // console.log('1秒以后执行');
        this.setData({
            isAnimationShow: 1
        })
    },
    // 点击领奖
    toGiveReward() {
        // console.log('点击领奖', this.data.share_id);
        this.data.user_id = app.globalData.myUserInfo.user_id;
        if (this.data.user_id == this.data.share_id) {
            wx.showModal({
                title: '不能领取自己发出的红包',
                content: '',
                success: function(res) {
                    if (res.confirm) {
                        wx.redirectTo({
                            url: '/pages/sign/index'
                        })
                    } else if (res.cancel) {
                    }
                }
            })
        } else {
            server.makeInviteReward({
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, {
                game_id: this.data.share_id,
                invite_user: app.globalData.target_userId||0
            }, (res) => {
                if (res['st'] > 0) {
                    this.data.getRedBagTime = res['info']['get_time'];
                    //显示红包图案
                    this.setData({
                        isShowRedBag: true, //有红包
                        isShowOpenRedBag: false,
                    })
                    // wx.showToast({
                    //     title: '成功',
                    //     icon: 'succes',
                    //     duration: 1000,
                    //     mask: true
                    // })
                    // setTimeout(function () {
                    //     wx.hideToast()
                    // }, 2000)    
                } else if (res['st'] == '-3') {
                    wx.showModal({
                        title: '你已经领过该红包',
                        content: '',
                        success: function(res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                                wx.redirectTo({
                                    url: '/pages/sign/index'
                                })
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                } else if (res['st'] == '-2' || res['st'] == '-4' || res['st'] == '-5') {
                    console.log(res, '红包不存在');
                    wx.showModal({
                        title: '没有可领取的红包',
                        content: '',
                        success: function(res) {
                            if (res.confirm) {
                                console.log('用户点击确定');
                                wx.redirectTo({
                                    url: '/pages/sign/index'
                                })
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }
            })
        }
    },
    //开红包
    openRedBag1(e) {
        let self = this;
        server.getGameReward({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, {
            game_id: self.data.share_id,
            get_time: self.data.getRedBagTime
        }, (res) => {
            if (res['st'] > 0) {
                self.data.redNumber = res['info'] / 100;
                self.setData({
                    redNumber: self.data.redNumber
                })
                self.setData({
                    isShowOpenRedBag: true,
                    isShowRedBag: true,
                })
                setTimeout(self.oneMinLater, 1000);
            }
        })
    },

    //领取奖励
    getReward() {
        let self = this;
        self.setData({
            isShowOpenRedBag: false
        })
        self.setData({
            isShowRedBag: false
        })
        self.setData({
            isAnimationShow: 0
        })
        wx.redirectTo({
            url: '/pages/sign/index'
        })
    },

    //签到数据
    selectUserSignupInfo() {
        //现在改成：进来点击领取话费按钮，如果是有红包，
        server.selectSignupRewardInfo({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res['st'] > 0) {

            } else {}
            this.data.countDownTime = res['time'];
            this.data.lott_sum = res['lott_sum'];
            this.setData({
                countDownTime: this.data.countDownTime,
                lott_sum: this.data.lott_sum
            })
            if (this.MyName) {
                clearInterval(this.MyName)
            }
            if (res['time'] > 0) {
                this.lostTime = res['time'];
                this.setTime();
                this.MyName = setInterval(this.setTime, 1000)
            }

        })
    },
    //跳游戏
    redirectToGame() {
        wx.redirectTo({
            url: '../index/index'
        })
    },

    //倒计时
    setTime() {
        if (this.lostTime == 0) {
            this.setData({
                countDownTime: '正在开奖'
            });
            this.selectUserSignupInfo();
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
            let strTime = '瓜分倒计时 ' + h + ':' + m + ':' + s
            this.lostTime = this.lostTime - 1
            this.setData({
                countDownTime: strTime
            })
        }
    }
})