import { gameUrl } from './ev';
let req = (url, data, method, cb) => {
    wx.request({
        url: gameUrl.url + url,
        method: method || "GET",
        data: data,
        success: (res) => {
            cb(res['data']);
        },
        fail: (err) => {
            cb(err)
        }
    })
}

export default req;