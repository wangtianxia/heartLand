// pages/grab/index.js

import server from '../../server/getData'
import session from '../../utils/saveSession'
const md5 = require('../../utils/md5.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ismarket: false,
    palyDealShow: false,
    palyInfoShow: true,
    addInfo: true,
    isFristShare: false,
    marketItem: [],
    hotItem: '',
    share_con3: '全部都免费，再慢就没有了'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let playdeal = session.getData('playdeal')
    if (!playdeal || playdeal == '0') {
      this.setData({
        palyDealShow: false
      })
    }else {
      this.setData({
        palyDealShow: true
      })
    }
    this.selectUserItemShow()
    this.selectUserItemHotShow()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  getname: function (e) {
    this.name = e.detail.value;
  },
  nameinput: function (e) {
    this.name = e.detail.value;
  },
  getphone: function (e) {
    this.phone = e.detail.value;
  },
  phoneinput: function (e) {
    this.phone = e.detail.value;
  },
  getadd: function (e) {
    this.add = e.detail.value;
  },
  addinput: function (e) {
    this.add = e.detail.value;
  },


  /**
   * 商品列表
   */
  selectUserItemShow() {
    server.selectUserItemShow({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000)
    }, (res) => {
      if (res.st > 0) {
        wx.hideLoading()
        this.setData({
          marketItem: res.info,
          ismarket: true
        })
      }
    })
  },

  /**
   * 关闭弹窗
   */
  playDealConfirm: function () {
    session.saveData('playdeal', 1)
    this.setData({
      palyDealShow: true
    })
  },

  /**
   * 商城热卖商品 （置顶商品）
   */
  selectUserItemHotShow() {
    server.selectUserItemHotShow({
      user_id: app.globalData.myUserInfo.user_id,
      time: Math.floor(Date.now() / 1000)
    }, (res) => {
      this.setData({
        hotItem: res.info
      })
    })
  },

  /**
   * 商品详情
   * @param {*} e 
   */
  toItemInfo(e) {
    wx.navigateTo({
      url: '/pages/iteminfo/iteminfo?item_id=' + e.currentTarget.dataset.index
    })
  },

  /**
   * 玩法说明 (显示弹窗)
   * @param {*} e 
   */
  playInfo() {
    this.setData({
      palyInfoShow: false
    })
  },

  /**
   * 关闭弹窗2
   */
  playInfoCancel() {
    this.setData({
      palyInfoShow: true
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
      if (res.st > 0) {
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if(res.from == 'button'){
      let title = this.data.share_con3
      let imageUrl = ''
      let item_id = res.target.dataset.index
      let path = '/pages/index/index?id=' + app.globalData.myUserInfo.user_id + '&item_id=' + item_id;
      return {
        title: title,
        path: path,
        imageUrl: imageUrl,
        success: res => {
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
  }
})
