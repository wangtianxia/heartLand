//logs.js
const app = getApp()
const md5 = require('../../utils/md5.js')

Page({
  data: {
    userCoin: 0,
    // inputcoin: '请输入提现金额',
    inputname: '真实姓名',
    // tenPic: '../../image/iv_ten_off.png',
    // thirtyPic: '../../image/iv_thirty_off.png',
    // fiftyPic: '../../image/iv_fifty_off.png',
    selectMoneyNum: [{
        "no_select_src": '../../image/no_20.png',
        "select_src": '../../image/select_20.png',
        "select": true,
         "id": "20"
      },
      {
          "no_select_src": '../../image/no_50.png',
          "select_src": '../../image/select_50.png',
          "id": "49",
          "select": false
      },
      {
        "no_select_src": '../../image/no_100.png',
        "select_src": '../../image/select_100.png',
        "id": "95",
        "select": false
      }
    ],
    coinNum:20,
    countTime:0,   //次数
    preClickTime:0,    //上次点击的时间
    currentClickTime:0  //当前点击的时间

  },

  coin: '',
  userc: '',
  onLoad: function() {
      wx.hideShareMenu({})
  },
  onShow:function(){
      this.setData({
          selectMoneyNum: this.data.selectMoneyNum
      })
      this.selectUserInfoNew()  //用户信息
  },
  //  获取用户信息
  selectUserInfoNew: function() {
    var time = Math.floor(Date.now() / 1000)
    var str = {
      user_id: app.globalData.myUserInfo.user_id,
      time: time
    }
    var sign = md5.M5B(str)
    wx.request({
        url: 'https://xcxgv.xintiao98.com/' + 'selectUserInfoNew', //浠呬负绀轰緥锛屽苟闈炵湡瀹炵殑鎺ュ彛鍦板潃
      data: {
        user_id: app.globalData.myUserInfo.user_id,
        time: time,
        sign: sign
      },
      method: "POST",
      header: {
        'content-type': 'application/json' // 榛樿鍊?      
      },
      success: res => {
          console.log(res,'++=')
        if (res.data.st > 0) {
          app.globalData.myUserInfo = res.data.info
          this.userc = res.data.info.coin / 100
          this.setData({
            userCoin: app.globalData.myUserInfo.coin / 100
          })

        }

      }
    })
  },

  //  用户提现
  insertWXWithdrawOrder: function() {
    var time = Math.floor(Date.now() / 1000);
    var str = {
      user_id: app.globalData.myUserInfo.user_id,
      time: time
    }
    var sign = md5.M5B(str)
    wx.request({
        url: 'https://xcxgv.xintiao98.com/' + 'insertWXWithdrawOrder', //浠呬负绀轰緥锛屽苟闈炵湡瀹炵殑鎺ュ彛鍦板潃
      data: {
        user_id: app.globalData.myUserInfo.user_id,
        amount: this.data.coinNum * 100,   //this.data.coinNum
        time: time,
        sign: sign
      },
      method: "POST",
      header: {
        'content-type': 'application/json' // 榛樿鍊?      
      },
      success: res => {
        if (res.data.st > 0) {
          app.globalData.myUserInfo.coin = res.data.info
          this.setData({
            userCoin: res.data.info / 100
          })
          this.userc = res.data.info / 100

          wx.showToast({
            title: '申请已提交，请稍后查看您的微信余额',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '提交申请失败,' + res.data.info,
            icon: 'none',
            duration: 2000
          })
        }
        this.setData({
          inputcoin: '请输入提现金额',
        })
        this.coin = 0;
      }
    })
  },
  // 验证用户输入内容
  onGetCoin: function() {
    if(this.data.countTime == 0){
        this.data.preClickTime = new Date().getTime();  //首次点击的时间
        this.insertWXWithdrawOrder();
        this.data.countTime++;
        //   wx.showToast({
        //       title: "当前点击次数:" + this.data.countTime,
        //       icon: 'none',
        //       duration: 2000
        //   })
        return;
    }
      this.data.currentClickTime = new Date().getTime();
      if ((this.data.currentClickTime - this.data.preClickTime) < 2000 ){
       //如果是3秒内重复点击
          wx.showToast({
              title: "亲，您的点击速度过快...",
              icon: 'none',
              duration: 2000
          })
          this.data.preClickTime = this.data.currentClickTime;
          return;
     }
      this.data.countTime++;
      this.data.preClickTime = this.data.currentClickTime;
      this.insertWXWithdrawOrder();
  },

  setAllCoin: function() {
    this.setData({
      inputcoin: this.userc,
    })
    this.coin = this.userc
  },

  inputon: function(e) {
    this.coin = e.detail.value;
  },
  inputok: function(e) {
    this.coin = e.detail.value;
  },
  //选择提现金额
  clickSelectMoney(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      selectMoneyNum: this.data.selectMoneyNum,
      index:0
    })
    for (var i = 0; i < this.data.selectMoneyNum.length; i++) {
      this.data.coinNum = e.currentTarget.dataset.id;
      if (id == this.data.selectMoneyNum[i]['id']) {
          this.data.selectMoneyNum[i]['select'] = true
      } else {
          this.data.selectMoneyNum[i]['select'] = false
      }
    }
    this.setData({
      selectMoneyNum: this.data.selectMoneyNum
    })
  }
})