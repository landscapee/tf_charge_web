import 'babel-polyfill';
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

Vue.component('icon-svg', IconSvg);
Vue.use(ElementUI);
Vue.prototype.postal = postal
Vue.prototype.$axios = axios
Vue.prototype.getTimeByFormat = getTimeByFormat//时间转换格式

Vue.prototype.sysEdition = window.webConfig.sysEdition//系统版本
Vue.prototype.coder = window.webConfig.coder//是否加密
var interfaceType = window.webConfig?window.webConfig.interfaceType:''

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

let hasIfm = self!=top//是否被镶嵌
let timer = null;
router.beforeEach(function(to,from,next){
    
    if(to.name=="login"){//登陆页清空信息
        clearInterval(timer)
        sessionStorage.clear()
         next()
       
    } else {
        next()
        
    }
    
})




axios.interceptors.request.use(
    function(config){
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
        
		return config;
    },
    function(err){
        return Promise.reject(err);
    }
);

axios.interceptors.response.use(
    function(response){
        console.log(response)

        let alertClassName = ""
        if (response.config.url.indexOf("/charge-bill-sign/saveAll")>=0 || response.config.url.indexOf("//flight/findFlightAndChargeRecordByFlightId")>=0) {
            alertClassName = "h5Alert"
        }




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
                        center: true,
                        customClass: alertClassName
                    }).then(function(){
                        router.replace("/")
                    })
                }else{
                    Vue.prototype.$alert(response.data.responseMessage||response.data.message||response.data.msg||response.config.url+'接口错误', '提示', {
                        type: 'error',
                        center: true,
                        customClass: alertClassName
                    })
                }
            }
        }
    }, 
    function(err){
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
    template: '<App />'
})