// index.js
// 获取应用实例
const app = getApp()
const md5 = require('../../utils/md5.js')
import server from '../../server/getData'
Page({
    data: {
        userInfo: {},
        hasUserInfo: true,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        item_id: '',
        invite_user: '',
        isShareNum: 0,
        form_id: 0 //form_id
    },

    onLoad: function(options) {
        console.log('index onLoad', options)
        this.data.isShareNum = options.shareType; //分享进入
        wx.showLoading({
            title: '数据加载中',
        });
        this.data.invite_user = options.id;
        app.globalData.target_userId = options.target_userId||0;
        this.item_id = options.item_id
        let self = this;
        wx.login({
            success: res => {
                app.globalData.code = res.code
                //查看是否授权
                wx.getSetting({
                    success(setting) {
                        if (setting.authSetting['scope.userInfo']) {
                            // 已经过授权，可以直接调用getUserInfo获取头像昵称
                            self.getUserInfo();
                            wx.hideLoading();
                        } else {
                            wx.hideLoading();
                            self.setData({
                                hasUserInfo: false
                            })
                        }
                    }
                })
            }
        })
    },

    getUserInfo() {
        let self = this;
        wx.getUserInfo({
            success(res) {
                app.globalData.userInfo = res.userInfo;
                app.globalData.encryptedData = res['encryptedData'];
                app.globalData.iv = res.iv;
                self.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
                self.getMyUserInfo()
            }
        })
    },


    //按钮过授权   
    getUserInfoBtn: function(e) {
        let self = this;
        if (e['detail'] && e['detail']['errMsg'] && e['detail']['errMsg'] == "getUserInfo:fail auth deny") {
            wx.openSetting({
                success(res) {
                    if (!res['authSetting']['scope.userInfo']) {
                        self.setData({
                            hasUserInfo: false
                        });
                    } else {
                        self.getUserInfo();
                        self.setData({
                            hasUserInfo: true
                        });
                    }
                },
                fail() {
                    self.setData({
                        hasUserInfo: false
                    });
                }
            })
        } else {
            this.setUserData(e);
        }
    },

    setUserData(e) {
        app.globalData.userInfo = e.detail.userInfo
        app.globalData.encryptedData = e.detail.encryptedData
        app.globalData.iv = e.detail.iv
        this.getMyUserInfo()
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    //  获取用户微信信息后提交到服务器
    getMyUserInfo: function() {
        wx.showLoading({
            title: '数据加载中',
        });
        server.registPlatUser({
            time: Math.floor(Date.now() / 1000)
        }, {
            encryptedData: app.globalData.encryptedData,
            iv: app.globalData.iv,
            code: app.globalData.code,
            invite_user: this.invite_user,
            item_id: this.item_id
        }, (res) => {
            if (res['st'] > 0) {
                wx.hideLoading();
                app.globalData.myUserInfo = res.info
                this.changeRouter()
            }
        })
    },

    // 切换路由
    changeRouter() {
        server.checkUserGameTiming({ //检测有没有试玩游戏
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, {
                form_id: this.data.form_id
            },
            (res) => {})
        if (this.data.isShareNum == 0) {
            wx.redirectTo({
                url: '/pages/shareComeIn/shareComeIn?shareid=' + this.data.invite_user
            })
        } else {
            wx.redirectTo({
                url: '/pages/sign/index'
            })
        }

    },
    //获取form_id
    submitInfo: function(e) {
        // 这样我们就可以获取到form_id了
        console.log(e.detail.formId);
        this.data.form_id = e.detail.formId
    }
})