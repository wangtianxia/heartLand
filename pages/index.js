// pages/sign/index.js
import server from '../../server/getData';
import session from '../../utils/saveSession';
const md5 = require('../../utils/md5.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:false,
    isgift: true,
    toptext: '当前奖池',
    gold: '',
    userno: '',
    goldx: '',
    bttext: '',
    time: '00:00:00',
    // 领奖用户排行初始数据
    userList: [
    {
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
    getCoinTitle: '',
    getCoinNo: '',
    bt_type: 1,
    shareToF: false, //邀请群好友一起参加签到，奖金可翻倍
    isPayOk: false, //支付完成 添加下程序
    getGold: false, //和好友炫耀一下
    isNeedDialog: false, //您来晚啦，上期瓜分已结束
    isGoldOver: false, //奖池被瓜分完啦，下次早些来签到哦
    share_con1: '',
    share_con2: '',
    share_con3: '全部都免费，再慢就没有了',
    share_img1: 'https://xcxgv.xintiao98.com/images/share1.jpg',
    share_img2: 'https://xcxgv.xintiao98.com/images/share2.jpg',
    isRedActive:false   //红包动画
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取签到列表
    this.selectLottUList();
    // 获取分享语
    this.selectShareContent();
    // 设置签到人数 和初始化一些数据
    this.selectInviteCount();
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
        wx.hideLoading();
        this.setData({
          userList: res.info
        })
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
      })
      this.selectInviteCount();   //设置邀请人数 和初始化 签到状态
      this.selectShareContent();  //获取分享语
      this.selectLottUList();     //签到数据
    } else {
      let time = this.lostTime;
      let h = parseInt(time / 3600);
      let m = 0;
      if (h != 0) {
        m = parseInt(time % (h * 3600) / 60);
      } else {
        m = parseInt(this.lostTime / 60);
      }
      let s = time % 60;
      if (h < 10) {
        h = '0' + h;
      }
      if (m < 10) {
        m = '0' + m;
      }
      if (s < 10) {
        s = '0' + s;
      }
      let strTime = '瓜分倒计时 ' + h + ':' + m + ':' + s;
      this.lostTime = this.lostTime - 1;
      this.setData({
        time: strTime
      })
    }
  },

  /**
   * 去签到
   */
  processUserLott() {
    server.processUserLott({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000)
    }, (res) => {
      if (res.st > 0) {
        let coin = res.rand_coin + res.invite_coin;
        let lott_coin = res.lott_coin;
        if (coin == lott_coin) {
          if (res.invite_coin == 0.00) {
            this.setData({
              getCoinTitle: '恭喜你',
              getGold: true,
              getCoinNo: '领取' + res.rand_coin + '元',
            })
          } else {
            this.setData({
              getCoinTitle: '恭喜你',
              getGold: true,
              getCoinNo: '领取' + res.rand_coin + '元+' + res.invite_coin + '元',
            })
          }
        } else {
          this.setData({
            getCoinTitle: '很遗憾',
            getGold: true,
            getCoinNo: '奖池仅剩' + coin + '元，下次记得要早些来打卡哦！',
          })
        }
        this.share_con2 = '刚刚签到获得' + coin + '元，快来和我一起瓜分下一期';
        this.selectInviteCount();
      } else if (res.st == -8) {
        this.setData({
          isGoldOver: true,
        })
        this.selectInviteCount();
      }
    })
  },

  /**
   * 设置邀请人数 和初始化 签到状态
   */
  selectInviteCount() {
    //设置人数
    server.selectInviteCount({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000)
    }, (res) => {
      let info = res.info
      if (res.st > 0) {
        // console.log(res, 'selectInviteCount')
        if (0 < info && info < 10) {
          this.setData({
            goldx: '已邀请' + info + '人，奖金+' + info + '0%'
          })
        } else if (info >= 10) {
          this.setData({
            goldx: '已邀请' + info + '人，奖金+100%'
          })
        } else {
          this.setData({
            goldx: '已邀请' + info + '人，奖金+0%'
          })
        }
      } else {
        this.setData({
          goldx: ''
        })
      }
    });

    //设置签到状态
    server.selectUserSignupInfo({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000)
    }, (res) => {
      console.log(res,'res')
      server.gameServSt({
        user_id: app.globalData.myUserInfo.user_id,
        time: Math.floor(Date.now() / 1000)
      }, (ServSt) => {
        console.log(ServSt,'-----------------')
        // 非审核
        if (ServSt['st'] == 1) {
          this.setData({
            isShow:true
          });
          if (res.st == 1) {    //签到
            this.bt_type = 1
            this.setData({
              bttext: '签到，领取奖励',
              gold: res.lott_sum + '元',
              userno: '',
              toptext: '奖池余额',
              goldx: this.data.goldx
            })
          } else if (res.st == 2) {   //可以签到，明日抽奖
            this.bt_type = 2
            this.setData({
              bttext: '支付1元，参与瓜分',
              gold: res.lott_sum + '元',
              userno: '共参与' + res.user_sum + '人',
              toptext: '当前奖池',
              goldx: ''
            })
          } else if (res.st == 3 || res.st == 4) {   //3.准备签到，不能抽奖 4.已经到
            this.bt_type = 3
            this.setData({
              bttext: '邀请好友，瓜分翻倍',
              gold: res.lott_sum + '元',
              userno: '共参与' + res.user_sum + '人',
              toptext: '当前奖池',
              goldx: this.data.goldx
            })
          } else if (res.st == 5) {   //奖池已空
            this.bt_type = 2
            this.setData({
              bttext: '支付1元，参与瓜分',
              gold: '奖池被瓜分完啦',
              userno: '               ',
              toptext: '当前奖池',
              goldx: '                '
            })
          } else if (res.st == 6) {  //已报名，但未参与抽奖
            let checktype = '0';
            let tempC = session.getData('checktype');
            if (!tempC || tempC == '0') {
              this.setData({
                isNeedDialog: true
              })
            } else {
              this.setData({
                isNeedDialog: false
              })
            }
            this.bt_type = 2
            this.setData({
              bttext: '支付1元，参与瓜分',
              gold: res.lott_sum + '元',
              userno: '共参与' + res.user_sum + '人',
              toptext: '当前奖池',
              goldx: ''
            })
          }
          // 审核
        } else {
          // 签到
          if (res['st'] == 1) {
            this.setData({
              bttext: '签到,领取奖励',
              gold: res.lott_sum + '元',
              userno: '共参与' + res.user_sum + '人'
            });
            this.bt_type = 1;
          }

          // 报名
          if (res['st'] == 2 || res['st'] == 6) {
            this.setData({
              goldx: '',
              bttext: '报名，参与签到',
              gold: res.lott_sum + '元',
              userno: '共参与' + res.user_sum + '人'
            });
            this.bt_type = 4;
            if (res['st'] == 6) { //未参与抽奖
              this.setData({
                isNeedDialog: true,
                goldx: ''
              })
            }
          }
          //分享
          if (res['st'] == 3 || res['st'] == 4 || res['st'] == 5) {
            this.setData({
              bttext: '邀请好友，奖励翻倍',
              gold: res.lott_sum + '元',
              userno: '共参与' + res.user_sum + '人',
            });
            this.bt_type = 5;
          }
        }
      })

      if (this.MyName) {
        clearInterval(this.MyName)
      }
      if (res.time) {
        this.lostTime = res.time;
        this.setTime();
        this.MyName = setInterval(this.setTime, 1000);
      } else {
        this.setData({
          time: '正在瓜分中'
        })
      }
    });
  },


  /**
   * 去支付
   */
  toPay: function () {
    if (this.bt_type == 1) {
      this.processUserLott()
    } else if (this.bt_type == 2) {
      this.goldBtCall()
    } else if (this.bt_type == 3) {
      this.setData({
        shareToF: true
      })
    } else if (this.bt_type == 4) { //审核 签到
      this.processUserSignup();
    } else if (this.bt_type == 5) {
      this.setData({
        shareToF: true
      })
    }
  },

  /**
   * 非审核报名
   */
  processUserSignup() {
    server.processUserSignup({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000)
    }, (res) => {
      if (res['st'] > 0) {
        this.selectInviteCount();
        this.setData({
          bttext: '邀请好友，奖励翻倍',
          shareToF: true
        });
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
    session.saveData('checktype', 1);
    this.closeDialog();
  },

  /**
   * 获取分享语
   */
  selectShareContent() {
    server.selectShareContent({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000)
    }, (res) => {
      console.log('1111111', res['info']['share_con2']);
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
   * 购买金币打call
   */
  goldBtCall() {
    wx.showLoading({
      title: '等待支付',
      mask: true
    })
    server.insertWXOrderNew({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000),
      gvid: '101'
    }, {
        order_name: '充值1元'
      }, (res) => {
        if (res['st'] > 0) {
          let time = Math.floor(Date.now() / 1000);
          let nonceStr = md5.randomString(32)
          let paySign = md5.M5BForWX({
            appId: "wx4d156ad9951414bc",
            nonceStr: nonceStr,
            package: 'prepay_id=' + res.info,
            signType: 'MD5',
            timeStamp: time.toString()
          })
          server.wxPay({
            timeStamp: time.toString(),
            nonceStr: nonceStr,
            package: 'prepay_id=' + res.info,
            signType: "MD5",
            paySign: paySign,
          }, (payInfo) => {
            session.saveData('checktype', 0);
            if (!payInfo) {
              wx.showToast({
                title: '支付成功',
                icon: 'none',
                duration: 1000
              }),
                this.setData({
                  isPayOk: true,
                })
            } else {
              wx.hideLoading()
            }
          })
        }
      })
  },

  /**
   * 关闭分享弹窗
   */
  concernOver() {
    this.setData({
      isPayOk: false
    })
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
      if (res.st > 0) { }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //有未领红包
    server.selectUserGameRewardInfo({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000),
    }, (res) => {
      if(res['st'] >= 1){
        this.setData({
          isRedActive: true
        })
      }
    })
   },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {   
    let title = '';
    let imageUrl = '';
    let item_id = 0;
    let shareType = 0;
    let path = '/pages/shareComeIn/shareComeIn?id=' + app.globalData.myUserInfo.user_id;
    if (res.target.dataset.index == -111) {
      title = this.data.share_con1;
      imageUrl = this.data.share_img1;
      path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id + '&shareType=' + shareType;
    } else if (res.target.dataset.index == -222) {
      title = this.share_con2;
      imageUrl = this.data.share_img2;
    } else {
      title = this.data.share_con3;
      imageUrl = '';
      item_id = res.target.dataset.index;
      path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id + '&item_id=' + item_id;
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
  }
})