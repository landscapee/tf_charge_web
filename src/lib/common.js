/**
 * @describe 去抖函数
 * @param { Function } [action] 抖动执行函数
 * @param { Number } [wait] 抖动延迟时间(毫秒)
 * @param { Boolean } [immediate] 是否立即执行
**/
import moment  from "moment";
export const debounce = function (action, wait, immediate = true) {
    var timer = null;

    return function () {
        let ctx = this, args = arguments;

        clearTimeout(timer)

        if (immediate) {
            let callNow = !timer;

            timer = setTimeout(function () {
                timer = null;
            }, wait)

            if (callNow) {action.apply(ctx, args)}
        } else {
            timer = setTimeout(function () {
                action.apply(ctx, args)
            }, wait)
        }

    }
};

/**
 * @describe 节流函数
 * @param { Function } [action] 节流执行函数
 * @param { Number } [wait] 节流延迟时间(毫秒)
**/
export const throttle = function (action, wait) {
    let previous = 0;

    return function () {
        let now = Date.now();

        if (now - previous > wait) {
            action.apply(this, arguments);
            previous = now;
        }
    }
};
/**
 * @describe 正则验证函数
 * @param { String } [type] 验证类型
 * @param { Number|String } [value] 验证值
 * @return { Boolean } [valid] 
**/


/**
 * @describe 获取时间戳
 * @param { String } [dateStr] 日期
 * @return { Number|Null }
**/
export const getTimestamp = function (dateStr) {
    if (dateStr) {
        return new Date(dateStr.replace(/-/g, "/")).getTime()
    } else {
        return null
    }
}

/**
 * @describe 获取地址栏参数
 * @param { String } [name] 参数
**/
export const getUrlParam = function (name) {
    var t = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
        n = window.location.search.substr(1).match(t);

    return null != n ? unescape(n[2]) : null
}

/**
 * @describe webRTC初始化
**/
export const RTCInit = function () {
    var RTCPeerConnection = /*window.RTCPeerConnection ||e79fa5e98193e4b893e5b19e31333365663465*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    if (!RTCPeerConnection) {return}
    var rtc = new RTCPeerConnection({ iceServers: [] });
    if (window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
        rtc.createDataChannel('', { reliable: false });
    }

    rtc.onicecandidate = function (evt) {
        if (evt.candidate){ grepSDP("a=" + evt.candidate.candidate)}
    };
    rtc.createOffer(function (offerDesc) {
        grepSDP(offerDesc.sdp);
        rtc.setLocalDescription(offerDesc);
    }, function (e) { console.warn("offer failed", e); });


    var addrs = Object.create(null);
    addrs["0.0.0.0"] = false;
    function updateDisplay (newAddr) {
        if (newAddr in addrs){ return;}
        else {addrs[newAddr] = true;}
        var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
        // document.getElementById('list').textContent = displayAddrs.join(" or perhaps ") || "n/a";
        sessionStorage.setItem("remoteAddress", displayAddrs.join(" or perhaps ") || "n/a")
    }

    function grepSDP (sdp) {
        sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
            if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
                let parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                    addr = parts[4],
                    type = parts[7];
                if (type === 'host') {updateDisplay(addr)}
            } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
                let parts = line.split(' '),
                    addr = parts[2]
                updateDisplay(addr);
            }
        });
    }
}

/**
 * 按格式转换时间
 * time时间必传
 * format格式
 */

export const getTimeByFormat = function(time,format){
    if(!time){return '--'}
    let date = new Date(time)
    let YY = date.getFullYear()
    let MM = date.getMonth()+1
    let DD = date.getDate()
    let hh = date.getHours()
    let mm = date.getMinutes()
    let ss = date.getSeconds()

    MM = MM<10?'0'+MM:MM
    DD = DD<10?'0'+DD:DD
    hh = hh<10?'0'+hh:hh
    mm = mm<10?'0'+mm:mm
    ss = ss<10?'0'+ss:ss
    
    return format.replace(/YY/,YY).replace(/MM/,MM).replace(/DD/,DD).replace(/hh/,hh).replace(/mm/,mm).replace(/ss/,ss)
}

export const timeLength = function(time){
    if (!time) { return '--' }
    let timeLength = ''
    let timeLengthObj = moment.duration(time)._data;
    if (timeLengthObj.years > 0) {
        timeLength+=`${timeLengthObj.years}年`
    }
    if (timeLengthObj.months > 0) {
        timeLength+=`${timeLengthObj.months}月`
    }
    if (timeLengthObj.days > 0) {
        timeLength+=`${timeLengthObj.days}日`
    }
    if (timeLengthObj.hours > 0) {
        timeLength+=`${timeLengthObj.hours}时`
    }
    if (timeLengthObj.minutes > 0) {
        timeLength+=`${timeLengthObj.minutes}分`
    }
    if (timeLengthObj.seconds > 0) {
        timeLength+=`${timeLengthObj.seconds}秒`
    }
    return timeLength
    
}