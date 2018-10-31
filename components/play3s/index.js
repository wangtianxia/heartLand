// components/play3s/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      index:Number
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
      goPlayGame(){
          this.triggerEvent('goPlayGame');
      },
      closeTryGameAlert(){
          this.triggerEvent('closeTryGameAlert');
      }
  }
})
