// pages/homeChild/homeChild.js
const md5 = require('../../utils/md5.js');
import server from '../../server/getData';
import session from '../../utils/saveSession';
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabList: [],
        currentIndex: 0,
        gameListArr: [],
        game_type: 1,
        ip: 'https://xcxgv.xintiao98.com/',
        page: 1,
        count: 10,
        isShowNomore:false,
        typeId:""

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },
    //选择tab
    onChangeTab: function(e) {
        let self = this;
        self.data.gameListArr = [];
        for (let i = 0; i < self.data.tabList.length; i++) {
            if (e.currentTarget.dataset.index == i) {
                if (self.data.tabList[i]['active_tab'] == 0) {
                    self.data.tabList[i]['active_tab'] = 1;

                    this.data.page = 1;
                    this.data.typeId = this.data.tabList[i]['type_id']
                    this.selectTypeData(this.data.typeId, this.data.page)

                } else {
                    self.data.tabList[i]['active_tab'] = 0;
                }
            } else {
                self.data.tabList[i]['active_tab'] = 0;
            }
        }
        self.setData({
            active_tab: self.data.currentIndex,
            tabList: self.data.tabList,
            gameListArr: self.data.gameListArr
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
        this.typeGameData();
    },

    //游戏类型
    typeGameData() {
        server.selectGameTypeList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, (res) => {
            if (res['st'] == 1) {
                this.data.tabList = res['info'];
                for (var i = 0; i < this.data.tabList.length; i++) {
                    this.data.tabList[i]['active_tab'] = 0;
                    if (i == 0) {
                        this.data.tabList[i]['active_tab'] = 1;
                    }
                }
                this.setData({
                    tabList: this.data.tabList,
                    active_tab: 0
                });
                this.data.typeId = this.data.tabList[0]['type_id']
                this.selectTypeData(this.data.typeId, this.data.page)
            }
        })
    },
    //游戏按分类的数据
    selectTypeData(type,page) {
        server.selectGameListByType({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        }, {
            game_type: type,
            page: this.data.page,
            count: this.data.count
        }, (res) => {
            if (res['st'] == 1) {
                wx.hideLoading();
                this.data.gameListArr = res['info'];
                if(res['info'].length >= this.data.count){
                    this.data.page+=1;
                }

                for (var i = 0; i < this.data.gameListArr.length; i++) {
                    this.data.gameListArr[i]['logo_url'] = this.data.ip + this.data.gameListArr[i]['game_id'] +
                        '/' + 'logo_' + this.data.gameListArr[i]['game_id'] + '.png'
                    this.data.gameListArr[i]['code_url'] = this.data.ip + this.data.gameListArr[i]['game_id'] +
                        '/' + 'code_' + this.data.gameListArr[i]['game_id'] + '.png'
                }
                this.setData({
                    gameListArr: this.data.gameListArr,
                })
            }
        })
    },
    //去玩游戏
    toPlayGame(e) {
        let gameArr = []
        gameArr = this.data.gameListArr
        let index = e.currentTarget.dataset.index
        let game_id = gameArr[index].game_id
        let game_name = gameArr[index].game_name
        let game_appid = gameArr[index].game_appid
        let user_id = app.globalData.myUserInfo.user_id
        let trial_st = gameArr[index].trial_st;
        let path = gameArr[index]['ch_no'] || ''
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
        wx.showLoading({
            title: '玩命加载中',
        })
        this.selectTypeData(this.data.typeId, this.data.page);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    
})