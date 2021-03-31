import Vue from 'vue';
import App from './src/App.vue';
import router from './src/router'
import store from './src/store'
import './src/icons';
import postal from 'postal';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './src/styles/elementReset.scss';
import axios from "axios";
import IconSvg from './src/components/Icon-svg';// svg组件
import { RTCInit,getTimeByFormat } from './src/lib/common';
import socket from './worker/lib/socket';

Vue.component('icon-svg', IconSvg);
Vue.use(ElementUI);
Vue.prototype.postal = postal
Vue.prototype.$axios = axios
Vue.prototype.getTimeByFormat = getTimeByFormat//时间转换格式

Vue.prototype.sysEdition = window.webConfig.sysEdition//系统版本
Vue.prototype.coder = window.webConfig.coder//是否加密
let interfaceType = window.webConfig.interfaceType

RTCInit();// RTC初始化，获取主机ip地址remoteAddress

let loginFlag = 0;
let origin = window.location.origin;

if(_.includes(origin,'localhost')||_.includes(origin,'127.0.0.1')||_.includes(origin,'192.168.131.131')){
    // origin = "http://173.100.1.30"
    // origin = "http://173.101.1.66"
    origin = "http://173.101.4.3:7000"
}

axios.defaults.baseURL  =  origin+"/"+interfaceType+"/charge-api/"
// axios.defaults.baseURL  =  origin

if(sessionStorage.userData){//刷新或者丢失用户信息，使用token获取用户信息
    store.commit('setUserMsg',JSON.parse(sessionStorage.userData))
}


function currDevice(){
    var u = navigator.userAgent;
    var app = navigator.appVersion;// appVersion 可返回浏览器的平台和版本信息。该属性是一个只读的字符串。
    var browserLang = (navigator.browserLanguage || navigator.language).toLowerCase();    //获取浏览器语言
    
    var deviceBrowser = function(){
        return{
            trident: u.indexOf('Trident') > -1,  //IE内核
            presto: u.indexOf('Presto') > -1,  //opera内核
            webKit: u.indexOf('AppleWebKit') > -1,  //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,  //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/),  //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.Mac OS X/),  //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,  //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1,  //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1,  //是否iPad
            webApp: u.indexOf('Safari') == -1,  //是否web应用程序，没有头部和底部
            weixin: u.indexOf('MicroMessenger') > -1,  //是否微信
            qq: u.match(/\sQQ/i) == " qq",  //是否QQ
        }
    }();
    
    console.log(deviceBrowser);
    
}
console.log(currDevice())

let hasIfm = self!=top//是否被镶嵌
let getDataSocket;
let timer = null;
router.beforeEach((to,from,next)=>{
    
    if(to.name=="login"){//登陆页清空信息
        loginFlag=0
        clearInterval(timer)
        sessionStorage.clear()
        // if(getDataSocket){
        //     getDataSocket.socket_close()
        // }
        let token = to.query.token
        
        if(token){
            axios({
                method:"post",
                url:'/sso/login/userInfo',
                dataType:"text",
                data:token,
                async:true,
                headers:{
                  'Content-Type':'application/json;charset=utf-8',
                }
            })
            .then(res=>{
                if(res&&res.responseCode=='1000'){
                    store.commit("setUserMsg",res.data)
                    sessionStorage.setItem("token",res.data.token)
                    sessionStorage.setItem("userData",JSON.stringify(_.omit(res.data,'token')))
                    next({'name': 'index'})
                }
            })
        }else{
            next()
        }
       
    } else {
         next()
        // if(hasIfm){
        //     next()
        // }else{
        //     if(sessionStorage.token){
        //         axios({
        //             method:"post",
        //             url:'/sso/login/authorizeToken',
        //             dataType:"text",
        //             data:sessionStorage.token,
        //             async:false,
        //             headers:{
        //                 'Content-Type':'application/json;charset=utf-8'
        //             }
        //         })
        //         .then(res=>{
        //             if(res&&res.responseCode=='1000'){
        //                 next()
        //             }
        //         })
        //     }else{
        //         next({'name': 'login', 'query': {'redirect': to.fullPath}})
                
        //     }
        // }
        
    }
    
})

// router.afterEach(()=>{
//     if(sessionStorage.token&&loginFlag==0){
//         loginFlag = 1
        
        
    
//         // socketInit_bvc({ //bvc长链接，统计人员在线
//         //     token:sessionStorage.token,
//         //     remoteAddress:sessionStorage.remoteAddress,
//         //     origin
//         // })

//         // timer = setInterval(() => {//每小时更新一次token
//         //     axios({
//         //         method:"post",
//         //         url:'/sso/login/renew',
//         //         dataType:"text",
//         //         data:sessionStorage.token,
//         //         async:false,
//         //         headers:{
//         //             'Content-Type':'application/json;charset=utf-8'
//         //         }
//         //     })
//         //     .then(res=>{
//         //         let newToken = 'Bearer '+res.data
//         //         sessionStorage.setItem("token",newToken)
//         //     })
//         // }, 1000*60*60);
//     }
// })




axios.interceptors.request.use(
    config => {
        let token = sessionStorage.token
        
        let noToken = false
        
        if(config.url.indexOf("/sso/login/")>-1){//认证系统，不需要token
            noToken = true
            config.url = origin+"/"+interfaceType+ config.url
        }

        if( config.url.indexOf("/user/changeUserPwd")>-1
            ||config.url.indexOf("/department/getAllDepartmentByDeptIdWithTree")>-1
            ||config.url.indexOf("/user/getUsersByDeptId")>-1
        ){
            config.url = origin+"/"+interfaceType+ config.url
        }else{
            config.headers['remoteAddress'] = sessionStorage.remoteAddress;
        }
        if(!noToken){
            config.headers['Authorization'] = token;
        }
        
        
        config.headers['Accept'] = 'application/json';
        // if(!token&&!noToken){
        //     config['cancelToken'] = new axios.CancelToken((c) => {
        //         Vue.prototype.$alert('用户已过期，请重新登录！', '提示', {
        //             type: 'warning',
        //             center: true
        //         }).then(() => {
        //             router.replace("/")
        //         })
        //         c()
        //     });
        // }
        
		return config;
    },
    err => {
        return Promise.reject(err);
    }
);

axios.interceptors.response.use(
    response=>{
        
        if (response.data.date||response.data.time) {
            
            store.commit('setServerTime',new Date(response.data.date||response.data.time))
        }
        
        if(response.data.code==200
            ||response.data.responseCode==1000
            ||response.data.responseCode==30002
            ||response.data.responseCode==30003
            ||response.data.responseCode==30010
        ){
            return response.data?response.data:{};
        } else{
            if(!hasIfm){
                if(response.data.responseCode==10003||response.data.responseCode==30008){//token过期
                    Vue.prototype.$alert('用户已过期，请重新登录！', '提示', {
                        type: 'warning',
                        center: true
                    }).then(() => {
                        router.replace("/")
                    })
                }else{
                    Vue.prototype.$alert(response.data.responseMessage||response.data.message||response.data.msg||response.config.url+'接口错误', '提示', {
                        type: 'error',
                        center: true
                    })
                }
            }
        }
    }, 
    err => {
        if(hasIfm){
            return false
        }
        if(_.includes(err.message,"code 500")||_.includes(err.message,"code 404")||_.includes(err.message,"code 400")||_.includes(err.message,"Network")){
            Vue.prototype.$alert('服务端错误，请联系管理员处理！', '提示', {
                type: 'error',
                center: true
            })
        }
        return Promise.reject(err);
    }
);

new Vue({
    el: '#app',
    components: {App},
    router,
    store,
    template: '<App />',
    created () {
        
    }
})