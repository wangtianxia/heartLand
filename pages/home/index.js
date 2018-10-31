// pages/home/index.js
const md5 = require('../../utils/md5.js')
const app = getApp()
import server from '../../server/getData'
// const time = require('../../utils/time.js')
import time from '../../utils/time.js'

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // banner  属性
        isShowNoMore: false,
        isRedActive: false,
        tryPlayArr: [], //试玩列表
        recommendArr: [], // 推荐列表
        tempTime: 180, // 试玩时间
        autoplay: true,
        dotsBoll: true,
        interval: 3000,
        duration: 1000,
        current: 0,
        ismain: true,
        bannerList: [],
        gameList: [],
        canChangeBtn: '试玩游戏', // 打开游戏的按钮
        isShowAlert: false,
        currentIndex: 0, // 默认下标（新写的）
        currentType: 1, // 默认类型（新写的）
        index: 30, // 试玩3分钟 下标（新写的）
        isShowThreeMinute: false,
        ip: 'https://xcxgv.xintiao98.com/',
        logo_url: '',
        code_url: '',
        gameIndex: 0,
        alertIndex: 0,
        recomdIndex: 0,
        formId: 0,
        page: 1,
        count: 9,
        candrop: true,
        tabList: [       //底部导航
            {
                tab_name: '游戏',
                tab_on_img: '../../image/select_play.png',
                tab_off_img: '../../image/play_tb_img.png',
                active_tab: 1
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
                active_tab: 0
            },
        ],
        currentIndex: 0,  //下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '数据加载中'
        })
        wx.hideShareMenu({
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        // banner数据
        server.selectGameBannerOrd({
            user_id: '0',
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res['st'] == 1) {
                this.setData({
                    bannerList: res['info']
                })
                wx.hideLoading()
            }
        })
        // 列表数据
        let count = 9;
        let page = 1;
        server.selectGameList({
            user_id: '0',
            time: Math.floor(Date.now() / 1000)
        }, {
            page: page,
            count: count
        }, (res) => {
            if (res['st'] == 1) {
                this.setData({
                    gameList: res['info']
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.recommendData() //推荐
        this.tryPlayGameInfo() //初始化试玩数据
        this.setTimeOutCutTime() //红包显示 
        // 断开试玩
        time.checkOutTime('', 1);
    },
    /**
     * swiper 点击
     */
    bindchange() {},

    //去开红包
    getOpenRedBag() {
        wx.redirectTo({
            url: '/pages/me/index'
        })
    },
    /**
     * 红包显示
     */
    setTimeOutCutTime() {
        //有无未领红包
        setTimeout(() => {
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
        }, 1000)
    },

    /**
     * 列表选项点击
     */
    onGameBtCall(e) {
        this.data.currentType = e.currentTarget.dataset.type
        this.data.currentIndex = e.currentTarget.dataset.index
        let useArr = []
        if (e.currentTarget.dataset.type == 1) {
            useArr = this.data.bannerList
        }
        // } else if (e.currentTarget.dataset.type == 2) {
        //   useArr = this.data.gameList
        // }
        let index = e.currentTarget.dataset.index
        let game_id = useArr[index].game_id
        let game_name = useArr[index].game_name
        let game_appid = useArr[index].game_appid
        let user_id = app.globalData.myUserInfo.user_id;
        let trial_st = useArr[index].trial_st;
        let path = useArr[index]['ch_no'] || ''
        if (game_appid) {
            wx.navigateToMiniProgram({
                appId: game_appid,
                path: path,
                success: res => {
                    server.uploadGameData({
                        user_id: app.globalData.myUserInfo.user_id,
                        game_id: game_id,
                        time: Math.floor(Date.now() / 1000)
                    }, {
                        game_name: game_name,
                        acc_type: 1,
                        game_appid: game_appid,
                        trial_st: trial_st
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
                trial_st: trial_st
            }, (res) => {})
            wx.getImageInfo({
                src: gameArr[index].code_url,
                success(res2) {
                    wx.previewImage({
                        current: res2['path'], // 当前显示图片的http链接
                        urls: [res2['path']] // 需要预览的图片http链接列表
                    })
                }
            })
        }
    },

    // 试玩的数据
    tryPlayGameInfo() {
        server.selectTrialGameList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, {
            page: 1,
            count: 3
        }, (res) => {
            if (res['st'] == 1) {
                this.data.tryPlayArr = [];
                this.data.tryPlayArr = res['info']
                for (var i = 0; i < this.data.tryPlayArr.length; i++) {
                    this.data.tryPlayArr[i]['logo_url'] = this.data.ip + this.data.tryPlayArr[i]['game_id'] +
                        '/' + 'logo_' + this.data.tryPlayArr[i]['game_id'] + '.png'
                    this.data.tryPlayArr[i]['code_url'] = this.data.ip + this.data.tryPlayArr[i]['game_id'] +
                        '/' + 'code_' + this.data.tryPlayArr[i]['game_id'] + '.png'
                }
                if (res['info'] == '') {
                    this.setData({
                        ismain: false
                    })
                }
                this.setData({
                    tryPlayArr: this.data.tryPlayArr
                })
            }
        })
    },
    // end
    // 试玩弹窗
    closeGame: function() {
        if (this.data.isShowAlert) {
            this.setData({
                isShowAlert: false
            })
        }
    },
    // 更多
    moreThen: function() {
        server.checkUserGameTiming({ //检测有没有试玩游戏
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, {
                form_id: this.data.form_id
            },
            (res) => {

            })
        wx.navigateTo({
            url: '../homeChild/homeChild'
        })
    },

    // 开启试玩弹窗
    showTryPlayAlert: function(e) {
        this.data.alertIndex = e.currentTarget.dataset.index
        this.setData({
            isShowAlert: true
        })
    },
    // 关闭试玩弹窗
    closeTryGameAlert() {
        if (this.data.isShowAlert) {
            this.setData({
                isShowAlert: false
            })
        }
    },
    // 立即试玩
    goPlayGame(e) {
        let gameArr = this.data.tryPlayArr
        this.data.currentIndex = this.data.alertIndex;
        let index = this.data.currentIndex
        let game_id = gameArr[index].game_id
        let game_name = gameArr[index].game_name
        let game_appid = gameArr[index].game_appid
        let user_id = app.globalData.myUserInfo.user_id
        let trial_st = gameArr[index].trial_st
        let path = gameArr[index]['ch_no'] || ''
        this.setLastTime(game_id) // 倒计时开始
        if (game_appid) {
            wx.navigateToMiniProgram({
                appId: game_appid,
                path: path || '',
                success: res => {
                    server.uploadGameData({
                        user_id: app.globalData.myUserInfo.user_id,
                        game_id: game_id,
                        time: Math.floor(Date.now() / 1000)
                    }, {
                        game_name: game_name,
                        acc_type: 1,
                        game_appid: game_appid,
                        trial_st: trial_st
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
                trial_st: trial_st
            }, (res) => {})
            wx.getImageInfo({
                src: gameArr[index].code_url,
                success(res2) {
                    wx.previewImage({
                        current: res2['path'], // 当前显示图片的http链接
                        urls: [res2['path']] // 需要预览的图片http链接列表
                    })
                }
            })
        }
    },

    // 倒计时 start
    setLastTime(game_id) {
        time.checkOutTime(game_id, 0);
    },
    //推荐数据
    recommendData() {
        server.selectGameList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, {
            page: this.data.page,
            count: 9
        }, (res) => {
            if (res['st'] == 1) {
                let tempArr = [];
                this.data.recommendArr = [];
                this.data.recommendArr = tempArr = res['info'];
                for (var i = 0; i < this.data.recommendArr.length; i++) {
                    this.data.recommendArr[i]['logo_url'] = this.data.ip + this.data.recommendArr[i]['game_id'] +
                        '/' + 'logo_' + this.data.recommendArr[i]['game_id'] + '.png'
                    this.data.recommendArr[i]['code_url'] = this.data.ip + this.data.recommendArr[i]['game_id'] +
                        '/' + 'code_' + this.data.recommendArr[i]['game_id'] + '.png'
                }
                this.setData({
                    recommendArr: this.data.recommendArr
                })
                if (tempArr.length >= 10) {
                    this.data.page += 1;
                } else {
                    this.data.candrop = false
                    this.setData({
                        isShowNoMore:true
                    })
                }
            }
        })
    },
    //推荐游戏点击
    recommedTap(e) {
        // console.log(e,this.data.recommendArr.length)
        let recomdArr = this.data.recommendArr; //游戏推荐
        this.data.recomdIndex = e.currentTarget.dataset.index;
        let index = this.data.recomdIndex;
        let game_id = recomdArr[index].game_id
        let game_name = recomdArr[index].game_name
        let game_appid = recomdArr[index].game_appid
        let user_id = app.globalData.myUserInfo.user_id
        let trial_st = recomdArr[index].trial_st;
        let path = recomdArr[index]['ch_no'] || '';
        this.setLastTime(game_id) // 倒计时开始
        if (game_appid) {
            wx.navigateToMiniProgram({
                appId: game_appid,
                path: path,
                success: res => {
                    server.uploadGameData({
                        user_id: app.globalData.myUserInfo.user_id,
                        game_id: game_id,
                        time: Math.floor(Date.now() / 1000)
                    }, {
                        game_name: game_name,
                        acc_type: 1,
                        game_appid: game_appid,
                        trial_st: trial_st
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
                trial_st: trial_st
            }, (res) => {})
            wx.getImageInfo({
                src: recomdArr[index].code_url,
                success(res2) {
                    wx.previewImage({
                        current: res2['path'], // 当前显示图片的http链接
                        urls: [res2['path']] // 需要预览的图片http链接列表
                    })
                }
            })
        }
    },
    //获取form_id
    submitInfo: function(e) {
        // 这样我们就可以获取到form_id了
        this.data.form_id = e.detail.formId;
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
    onReachBottom: function() {
        var self = this;
        if (!this.data.candrop) return;
        // 显示加载图标
        wx.showLoading({
            title: '玩命加载中',
        })
        // 页数+1
        // self.data.page = self.data.page + 1;
        server.selectGameList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, {
            page: self.data.page,
            count: 9
        }, (res) => {
            wx.hideLoading();
            if (res['st'] == 1) {
                
                let tempArr = res['info'];
                if (tempArr.length >= 9) {
                    self.data.page += 1;
                } else {
                    this.data.candrop = false;
                    this.setData({
                        isShowNoMore:true
                    })
                }

                for (var i = 0; i < tempArr.length; i++) {
                    tempArr[i]['logo_url'] = this.data.ip + tempArr[i]['game_id'] +
                        '/' + 'logo_' + tempArr[i]['game_id'] + '.png'
                    tempArr[i]['code_url'] = this.data.ip + tempArr[i]['game_id'] +
                        '/' + 'code_' + tempArr[i]['game_id'] + '.png'
                }
                this.setData({
                    recommendArr: this.data.recommendArr.concat(tempArr)
                })
            }else{
                this.data.candrop = false;
                this.setData({
                    isShowNoMore:true
                })
            }
        })
    },
    //底部导航点击事件
    clickTab: function (e) {
        let self = this;
        for (let i = 0; i < self.data.tabList.length; i++) {
            if (e.currentTarget.dataset.index == i) {
                if (self.data.tabList[i]['active_tab'] == 0) {
                    self.data.tabList[i]['active_tab'] = 1
                    if (i == 1) {
                        wx.redirectTo({
                            url: '/pages/sign/index'
                        })
                    } else if (i == 2) {
                        wx.redirectTo({
                            url: '/pages/tenSecond/index'
                        })
                    }else if (i == 3) {
                        wx.redirectTo({
                            url: '/pages/me/index'
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

})