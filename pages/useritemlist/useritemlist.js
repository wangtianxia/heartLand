const app = getApp()
const md5 = require('../../utils/md5.js')
import server from '../../server/getData'

Page({
    data: {
        itemlist: '',
        addInfo: true,
        myAddr: true,
        exname: '',
        exphone: '',
        exaddr: ''
    },

    onLoad(){
        wx.showLoading({
            text:"加载中"
        })
    },
    onShow: function() {
        this.selectUserOwnItemList();
    },
    //  获取用户订单信息
    selectUserOwnItemList: function() {
        server.selectUserOwnItemList({
            user_id: app.globalData.myUserInfo.user_id,
            time: Math.floor(Date.now() / 1000)
        },{
            count: 30,
            page: 1,
        },(res)=>{
            if (res.st > 0) {
                wx.hideLoading();
                this.setData({
                    itemlist: res.info
                })
            }
        })
    },
    onShareAppMessage: function(res) {
        if (res.from === 'button') {

        }
        var item_id = res.target.dataset.index;
        return {
            title: '全部都免费，再慢就没有了',
            path: '/pages/index/index?id=' + app.globalData.myUserInfo.user_id + '&item_id=' + item_id,
            imageUrl: '',
            success: res => {

                wx.showToast({
                    title: '分享成功',
                    icon: 'none',
                    duration: 2000
                })
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
    toPayItem: function(e) {
        this.buyUserItemOrder(e.target.dataset.index)
    },
    //用户分享成功后通知服务器
    shareInsertUserItem: function(item_id) {
        var time = Math.floor(Date.now() / 1000)
        var str = {
            user_id: app.globalData.myUserInfo.user_id,
            item_id: item_id,
            time: time
        }
        var sign = md5.M5B(str)
        wx.request({
            url: app.globalData.http + 'shareInsertUserItem', //浠呬负绀轰緥锛屽苟闈炵湡瀹炵殑鎺ュ彛鍦板潃
            data: {
                user_id: app.globalData.myUserInfo.user_id,
                time: time,
                item_id: item_id,
                sign: sign
            },
            method: "POST",
            header: {
                'content-type': 'application/json' // 榛樿鍊?      
            },
            success: res => {
                console.log(res.data)

                if (res.data.st > 0) {
                    this.selectUserItemShow();
                    this.selectUserItemHotShow();

                }

            }
        })
    },
    //   用户购买商品
    buyUserItemOrder: function(item_id) {
        wx.showLoading({
            title: '等待支付',

            mask: true
        })
        setTimeout(function() {
            wx.hideLoading()
        }, 3000)
        var time = Math.floor(Date.now() / 1000)
        var str = {
            user_id: app.globalData.myUserInfo.user_id,
            item_id: item_id,
            time: time
        }
        var sign = md5.M5B(str)
        wx.request({
            url: app.globalData.http + 'buyUserItemOrder', //浠呬负绀轰緥锛屽苟闈炵湡瀹炵殑鎺ュ彛鍦板潃
            data: {
                user_id: app.globalData.myUserInfo.user_id,
                time: time,
                item_id: item_id,
                sign: sign
            },
            method: "POST",
            header: {
                'content-type': 'application/json' // 榛樿鍊?      
            },
            success: res => {
                console.log(res.data)

                if (res.data.st > 0) {
                    this.payItem_id = res.data.uitem_id;
                    if (res.data.st == 3) {


                        wx.hideLoading();
                        this.setData({
                            addInfo: false
                        })
                    } else {
                        var time = Math.floor(Date.now() / 1000)
                        var nonceStr = md5.randomString(32)
                        var paySign = md5.M5BForWX({
                            appId: "wx4d156ad9951414bc",
                            nonceStr: nonceStr,
                            package: 'prepay_id=' + res.data.info,
                            signType: 'MD5',
                            timeStamp: time.toString()
                        })
                        wx.requestPayment({
                            timeStamp: time.toString(),
                            nonceStr: nonceStr,
                            package: 'prepay_id=' + res.data.info,
                            signType: 'MD5',
                            paySign: paySign,
                            success: res => {

                                wx.hideLoading();
                                wx.showToast({
                                    title: '支付成功',
                                    icon: 'none',
                                    duration: 1000
                                });

                            },
                            fail: res => {

                                wx.hideLoading()
                            }
                        })
                    }
                }

            }
        })
    },
    name: '',
    phone: '',
    add: '',
    payItem_id: '',
    getname: function(e) {
        this.name = e.detail.value;
    },
    nameinput: function(e) {
        this.name = e.detail.value;
    },
    getphone: function(e) {
        this.phone = e.detail.value;
    },
    phoneinput: function(e) {
        this.phone = e.detail.value;
    },
    getadd: function(e) {
        this.add = e.detail.value;
    },
    addinput: function(e) {
        this.add = e.detail.value;
    },
    addInfoConfirm: function() {
        if (this.payItem_id) {
            if (this.name && this.phone && this.add) {
                if (this.phone.length == 11 && this.phone.substr(0, 1) == '1') {
                    this.uploadExpressInfo(this.payItem_id, this.name, this.phone, this.add)
                } else {
                    wx.showToast({
                        title: '请填写正确的手机号码',
                        icon: 'none',
                        duration: 1000
                    });
                }
            } else {
                wx.showToast({
                    title: '请完善地址信息',
                    icon: 'none',
                    duration: 1000
                });
            }
        } else {
            wx.showToast({
                title: '订单出错',
                icon: 'none',
                duration: 1000
            });
        }
    },
    //  用户提交地址信息
    uploadExpressInfo: function(uitem_id, name, phone, add) {
        var time = Math.floor(Date.now() / 1000)
        var str = {
            user_id: app.globalData.myUserInfo.user_id,
            uitem_id: uitem_id,
            time: time
        }
        var sign = md5.M5B(str)
        wx.request({
            url: app.globalData.http + 'uploadExpressInfo', //浠呬负绀轰緥锛屽苟闈炵湡瀹炵殑鎺ュ彛鍦板潃
            data: {
                user_id: app.globalData.myUserInfo.user_id,
                time: time,
                uitem_id: uitem_id,
                sign: sign,
                express_name: name,
                express_phone: phone,
                express_addr: add,
            },
            method: "POST",
            header: {
                'content-type': 'application/json' // 榛樿鍊?      
            },
            success: res => {
                console.log(res.data)

                if (res.data.st > 0) {
                    this.setData({
                        addInfo: true
                    })
                    wx.showToast({
                        title: '提交成功',
                        icon: 'none',
                        duration: 1000
                    });
                    this.selectUserOwnItemList();

                } else {
                    this.selectUserOwnItemList();
                }

            }
        })
    },
    expressInfo: function(e) {
        var index = e.currentTarget.dataset.index;
        var exname = this.data.itemlist[index].express_name;
        var exphone = this.data.itemlist[index].express_phone;
        var exaddr = this.data.itemlist[index].express_addr;
        if (this.data.itemlist[index].express_time == 0) {
            this.payItem_id = this.data.itemlist[index].uitem_id;
            this.setData({
                addInfo: false,
                exname: exname,
                exphone: exphone,
                exaddr: exaddr
            })
        } else {

            this.setData({
                myAddr: false,
                exname: exname,
                exphone: exphone,
                exaddr: exaddr
            })
        }
    },

    addInfoCancel: function() {
        this.setData({
            myAddr: true,
            addInfo: true,
            exname: '',
            exphone: '',
            exaddr: ''
        })
        this.selectUserOwnItemList();
    },
    toItemInfo: function(e) {
        var index = e.currentTarget.dataset.index;
        var chg_time = this.data.itemlist[index].chg_time;
        if (chg_time == 0) {
            var item_id = this.data.itemlist[index].item_id;
            wx.navigateTo({
                url: '../iteminfo/iteminfo?item_id=' + item_id,
            })
        }
    }
})