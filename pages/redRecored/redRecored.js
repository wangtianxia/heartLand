// pages/redRecored/redRecored.js
const app = getApp()
const md5 = require('../../utils/md5.js')
import server from '../../server/getData';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        redRoredList: [],
        isShowRedBag: false,
        isShowOpenRedBag: false,
        isAnimationShow: 0,  
        redNumber: 0, //红包
        playName: '',
        shareTitle: '',
        shareDesc: '',
        sharePath: '',
        shareIcon: 'https://xcxgv.xintiao98.com/images/share3.jpg',
        isShowBag: false,
        game_id: '',
        num: '',
        doub: 0, //是否是双倍, 默认单倍
        fontRedBag: false, //无记录
        currentIndex: 0,
        redCurrentArr: [], //红包标签列表
        get_time:'',
        isShowItem:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.data.num = options['num'];
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        wx.hideShareMenu({})  //禁止右上角分享（即转发）
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function(options) {
        wx.showShareMenu({
            // 要求小程序返回分享目标信息
            withShareTicket: true
        });
        this.redNumData() //红包的初始化数据
        this.GameRewardData() //红包领取记录
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function(options) {

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

    //开红包
    openRedBag(e) {
        let self = this;
        server.getGameReward({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, {
            game_id: self.data.game_id,
            get_time:self.data.get_time
        }, (res) => {
            if (res['st'] == 1) {
                self.data.redNumber = res['info'] / 100;
                self.setData({
                    redNumber: self.data.redNumber
                })
                self.setData({
                    isShowOpenRedBag: true
                })
                setTimeout(self.oneMinLater, 1000);
            }
        })
        ///  
    },

    //1秒以后执行
    oneMinLater: function() {
        // console.log('1秒以后执行');
        this.setData({
            isAnimationShow: 1
        })
    },
    //关闭分享弹窗
    closeShareAlert() {

    },

    //只能分享到群（不能分享给好友）；
    onShareAppMessage: function(options) {
        let title = '';
        let path = '';
        let imageUrl = '';
        let self = this;
        let doubNum = self.data.redNumber
        if (options.target.dataset.index == -333) {
            title = '刚领到' + doubNum + '元，快来和我一起试玩领红包吧。'
            imageUrl = self.data.shareIcon
            path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id
        }else{
            title = ''
            imageUrl = ''
            path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id
        } 
        return {
            title: title,
            path: path,
            imageUrl: imageUrl,
            success(res) {
                console.log(res['shareTickets'],'分享到群里才有哦')
                if (!res['shareTickets']) {
                    wx.showToast({
                        title: '失败,' + '分享到群里才生效',
                        icon: 'none',
                        duration: 2000
                    })
                } else {
                    wx.getShareInfo({
                        shareTicket: res.shareTickets,
                        success(shareInfo) {
                            console.log('shareInfo', shareInfo)
                            let iv = shareInfo.iv
                            let encryptedData = shareInfo.encryptedData;
                            //这里写你分享到群之后要做的事情，比如增加次数什么的
                            server.getGameDoubReward({
                                user_id: app.globalData.myUserInfo.user_id,
                                time: Math.floor(Date.now() / 1000)
                            }, {
                                game_id: self.data.game_id,
                                get_time:self.data.get_time
                            }, (res) => {
                                console.log('getGameDoubReward', res);
                                if (res['st'] == 1) {
                                    self.data.redNumber = res['info'] / 100;
                                    self.setData({
                                        redNumber: self.data.redNumber
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
                console.log('err', err);
            }
        }
    },
    //领取奖励
    getReward(e) {
        let self = this;
        self.data.num--;
        self.GameRewardData() //红包领取记录
        // self.data.game_id = '';
        self.redNumData() //红包的初始化数据  
        if (self.data.num > 0) {
            console.log()
            self.setData({
                isShowOpenRedBag: false
            })
            self.setData({
                isShowRedBag: true
            })
            self.setData({
                isAnimationShow: 0
            })
        } else {
            self.setData({
                isShowRedBag: false
            })
        }
        wx.showToast({
            title: '成功,' + '红包领取成功',
            icon: 'none',
            duration: 2000
        })
    },
    //红包数据
    redNumData() {
        let self = this;
        server.selectUserGameRewardInfo({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res['st'] > 0) {
                if (res['info']['game_appid'] == '1' || res['info']['game_appid'] == '2' || res['info']['game_appid'] == '3'){
                    this.setData({
                        isShowItem:false
                    })
                }else{
                    this.setData({
                        isShowItem: true
                    })
                }
                self.setData({
                    isShowRedBag: true
                })
                self.data.playName = res['info']['game_name'];
                self.data.game_id = res['info']['game_id']
                self.data.get_time = res['info']['get_time']
                self.setData({
                    playName: self.data.playName
                })
            }
        })
    },
    //红包领取记录
    GameRewardData() {
 
        server.selectUserGameRewardList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(new Date().getTime() / 1000)
        }, {
            page: 1,
            count: 10
        }, (res) => {
            if (res['st'] == 1) {
                if (res['info'] == []) {
                    this.data.fontRedBag = true
                }
                this.data.redRoredList = res['info'];
                for (var i = 0; i < this.data.redRoredList.length; i++) { ////////判断是双倍的显示两个红包
                    this.data.redRoredList[i]['doub'] = 0;
                    if (this.data.redRoredList[i]['doub_rew_time']) {
                        this.data.redRoredList[i]['doub'] = 1
                    } else {
                        this.data.redRoredList[i]['doub'] = 0
                    }
                    if (this.data.redRoredList[i]['doub'] == 1){
                        this.data.doub = 1
                    }else{
                        this.data.doub = 0
                    }
                    //判断是game_appid微信appid
                    // 1：分享红包 2：排名红包 3：客服红包
                    if (this.data.redRoredList[i]['game_appid'] == 1){
                        this.data.redRoredList[i]['game_name'] = '分享红包';
                    } else if (this.data.redRoredList[i]['game_appid'] == 2){
                        this.data.redRoredList[i]['game_name'] = '排名红包';
                    } else if (this.data.redRoredList[i]['game_appid'] == 3){
                        this.data.redRoredList[i]['game_name'] = '客服红包';
                    }
                }
                this.setData({
                    redRoredList: this.data.redRoredList
                })
            }
        })
    }
})