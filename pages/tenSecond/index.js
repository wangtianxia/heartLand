// pages/tenSecond/index.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.twoOutTimer();
        wx.hideShareMenu({})
    },
    //加载2s
    twoOutTimer(){
        wx.showLoading({
            title: '加载中'
        })
        setTimeout(()=>{
            wx.hideLoading()
        },1000)
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
        let temp = this.encode(escape(app.globalData.userInfo.nickName));
        this.setData({
            url: 'https://xcxgv.xintiao98.com/clapG.html?user_id=' + app.globalData.myUserInfo.user_id +
             '&user_name=' + temp+'&time='+Math.random()*10
        })
    },
    //编码
    encode(src) {
        //用一个数组来存放编码后的字符，效率比用字符串相加高很多。
        var enKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var str = [];
        var ch1, ch2, ch3;
        var pos = 0;
        //每三个字符进行编码。
        while (pos + 3 <= src.length) {
            ch1 = src.charCodeAt(pos++);
            ch2 = src.charCodeAt(pos++);
            ch3 = src.charCodeAt(pos++);
            str.push(enKey.charAt(ch1 >> 2), enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
            str.push(enKey.charAt(((ch2 << 2) + (ch3 >> 6)) & 0x3f), enKey.charAt(ch3 & 0x3f));
        }
        //给剩下的字符进行编码。
        if (pos < src.length) {
            ch1 = src.charCodeAt(pos++);
            str.push(enKey.charAt(ch1 >> 2));
            if (pos < src.length) {
                ch2 = src.charCodeAt(pos);
                str.push(enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
                str.push(enKey.charAt(ch2 << 2 & 0x3f), '=');
            } else {
                str.push(enKey.charAt(ch1 << 4 & 0x3f), '==');
            }
        }
        //组合各编码后的字符，连成一个字符串。
        return str.join('');
    },

    newload(e){
    },
    errorload(){
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

    }
})