
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function getBannerPic(game_id)
{
  return "banner_"+game_id+".png";
}
function getLogoPic(game_id) {
  return "logo_" + game_id + ".png";
}
function getCodePic(game_id) {
  return "code_" + game_id + ".png";
}

module.exports = {
  formatTime: formatTime,
  getBannerPic: getBannerPic,
  getLogoPic: getLogoPic,
  getCodePic: getCodePic,
  
}
