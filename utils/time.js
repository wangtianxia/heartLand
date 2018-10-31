import server from '../server/getData'
const app = getApp()
var timers = {
  timerID: 0,
  randomKey: '1',
  game_id: '',
  timers: {},

  add: function (fn, key, game_id) {
    this.game_id = game_id
    if (key) {
      this.timers[key] = fn
      console.log(key)
    } else {
      this.randomKey += '1'
      this.timers[this.randomKey] = fn
    }
  },

  start: function () {
    if (this.timerID) return;
    (function runNext () {
      for (var i in timers.timers) {
        if (timers.timers[i]() === false) {
          delete timers.timers[i]
        }
      }
      timers.timerID = setTimeout(runNext, 1000)
    })()
  },

  del: function (key) {
    for (var i in timers.timers) {
      if (i == key) {
        delete timers.timers[i]
      }
    }
  },

  stop: function () {
    clearTimeout(this.timerID)
    this.timerID = 0
  },

  //type == 1 不同界面切换
  // type == 0 同一个界面换试玩
  // cb //到了180秒后
  checkOutTime(game_id,type,cb) {
    // 删除红包倒计时（如果倒计时存在就告诉后端）
    let alltime = timers.timers;
    let hasTime = false
    for (let i in alltime) {
      hasTime = true
    }
    if (hasTime) { // 告诉后端（旧的试玩结束）
      server.deleteGameRewardTiming({
        user_id: app.globalData.myUserInfo.user_id,
        time: Math.floor(Date.now() / 1000)
      }, {
        game_id: this.game_id
      }, (res) => {
        console.log('deleteGameRewardTiming')
      })
      this.del('cutdown');
    }

    // 不同界面切换 直接断开试玩倒计时就行
    if(type == 1){
      return;
    }
    let tempTime = 180;
    this.add(function () {
      tempTime -= 1
      if (tempTime <= 0) {
        if(cb && typeof cb === 'function'){
          cb();
        }
        return false;
      }
    }, 'cutdown',game_id);
    this.start();
  }

}

export default timers
