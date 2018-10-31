// components/play3s/index.js
const app = getApp()
import server from '../../server/getData.js'
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        index: Number
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        goPlayGame(e) {
            if (e.detail.formId =='the formId is a mock one')return;
            server.checkUserGameTiming({ //检测有没有试玩游戏
                user_id: app.globalData.myUserInfo.user_id,
                time: Math.floor(Date.now() / 1000)
            }, {
                form_id: e.detail.formId
            },(res) => {
                
            })
            // this.triggerEvent('goPlayGame');
        },
        closeTryGameAlert() {
            this.triggerEvent('closeTryGameAlert');
        }
    }
})