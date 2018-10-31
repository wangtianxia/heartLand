let session = {
    // 保存数据
    saveData(key, value) {
        try {
            wx.setStorageSync(key, JSON.stringify(value))
        } catch (e) {
            return 'err'
        }
    },

    saveData(key,value){
        try{
           wx.setStorageSync(key,JSON.stringify(value))
        }catch(e){
            return 'err'
        }
    },

    //获取数据
    getData(key) {
        try {
            var value = wx.getStorageSync(key)
            if (value) {
                return JSON.parse(value)
            }
        } catch (e) {
            return 'err'
        }
    },

    // 删除数据
    removeData(key) {
        try {
            wx.removeStorageSync(key)
        } catch (e) {
            return err;
        }
    }
}

export default session;