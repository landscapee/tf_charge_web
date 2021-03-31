import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
　　return originalPush.call(this, location).catch(err => err)
}

// 登录
const login = () => import(/*webpackChunkName:"login"*/ '../views/login/login')
const index = () => import(/*webpackChunkName:"index"*/ '../views/index')

//收费项配置
const charge_config = () => import(/*webpackChunkName:"charge_config"*/ '../views/charge_config/charge_config')
//签名项配置
// const sign_config = () => import(/*webpackChunkName:"sign_config"*/ '../views/sign_config/sign_config')
//收费项数据源配置
const charge_data_source = () => import(/*webpackChunkName:"charge_data_source"*/ '../views/charge_data_source/charge_data_source')
//服务记录单配置
const service_config = () => import(/*webpackChunkName:"service_config"*/ '../views/service_config/service_config')
//收费单配置
const charge_bill_config = () => import(/*webpackChunkName:"charge_bill_config"*/ '../views/charge_bill_config/charge_bill_config')
//收费记录
const charge_record = () => import(/*webpackChunkName:"charge_record"*/ '../views/charge_record/charge_record')
//收费单
const charge_bill = () => import(/*webpackChunkName:"charge_bill"*/ '../views/charge_bill/charge_bill')
//H5详情
const charge_h5 = () => import(/*webpackChunkName:"charge_h5"*/ '../views/charge_h5/charge_h5')
//收费数据审批
const examine = () => import(/*webpackChunkName:"examine"*/ '../views/examine/examine')
//收费单据
// const bill = () => import(/*webpackChunkName:"bill"*/ '../views/bill/bill')
//补充信息配置
const supplement_info_config = () => import(/*webpackChunkName:"supplement_info_config"*/ '../views/supplement_info_config/supplement_info_config')
//数据字典
const data_dictionary = () => import(/*webpackChunkName:"data_dictionary"*/ '../views/data_dictionary/data_dictionary')


supplement_info_config
var routes = [
  { path: '/', name: 'login', component:login},
  // { path: '/examine-temp', name: 'examine-temp', component:examine},
  // { path: '/bill-temp', name: 'bill-temp', component:bill},
  { path: '/charge_h5', name: 'charge_h5', component: charge_h5 },
  { path: '/charge_record_iframe', name: 'charge_record_iframe', component:charge_record},
  { path: '/index', name: 'index', component:index,children:[
    { path: '/charge_config', name: 'charge_config', component:charge_config},
    // { path: '/sign_config', name: 'sign_config', component:sign_config},
    { path: '/charge_data_source', name: 'charge_data_source', component:charge_data_source},
    { path: '/service_config', name: 'service_config', component:service_config},
    { path: '/charge_bill_config', name: 'charge_bill_config', component:charge_bill_config},
    { path: '/examine', name: 'examine', component:examine},
    // { path: '/bill', name: 'bill', component:bill},
    { path: '/charge_record', name: 'charge_record', component:charge_record},
    { path: '/charge_bill', name: 'charge_bill', component:charge_bill},
    { path: '/supplement_info_config', name: 'supplement_info_config', component:supplement_info_config},
    { path: '/data_dictionary', name: 'data_dictionary', component:data_dictionary},

  ]},
]

export default new Router({
	fallback:false,
	routes:routes
})
