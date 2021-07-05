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
//数据源配置
const charge_data_source = () => import(/*webpackChunkName:"charge_data_source"*/ '../views/charge_data_source/charge_data_source')
//服务项配置
const service_config = () => import(/*webpackChunkName:"service_config"*/ '../views/service_config/service_config')
//收费单配置
const charge_bill_config = () => import(/*webpackChunkName:"charge_bill_config"*/ '../views/charge_bill_config/charge_bill_config')
//H5详情
const charge_h5 = () => import(/*webpackChunkName:"charge_h5"*/ '../views/charge_h5/charge_h5')
//航后签字
const afterSign = () => import(/*webpackChunkName:"afterSign"*/ '../views/charge_h5/afterSign')
//补充信息配置
const supplement_info_config = () => import(/*webpackChunkName:"supplement_info_config"*/ '../views/supplement_info_config/supplement_info_config')
//数据字典
const data_dictionary = () => import(/*webpackChunkName:"data_dictionary"*/ '../views/data_dictionary/data_dictionary')

//收费记录
const charge_record = () => import(/*webpackChunkName:"charge_record"*/ '../views/charge_record/charge_record')
//收费单
const charge_bill = () => import(/*webpackChunkName:"charge_bill"*/ '../views/charge_bill/charge_bill')
//登机桥收费单
const boarding_bridge_charge_bill = () => import(/*webpackChunkName:"boarding_bridge_charge_bill"*/ '../views/boarding_bridge_charge_bill/boarding_bridge_charge_bill')
//航控上报
const flight_control_report = () => import(/*webpackChunkName:"flight_control_report"*/ '../views/flight_control_report/flight_control_report')


// 收费项配置: charge_config
// 数据源配置:charge_data_source
// 服务项配置：service_config
// 收费单配置：charge_bill_config
// 补充信息配置：supplement_info_config
// 数据字典：data_dictionary
// 收费记录：charge_record
// 收费单：charge_bill

var routes = [
  { path: '/', name: 'login', component:login},
  { path: '/charge_h5', name: 'charge_h5', component: charge_h5 },
  { path: '/afterSign', name: 'afterSign', component: afterSign },
  { path: '/charge_bill_iframe', name: 'charge_bill_iframe', component:charge_bill},
  { path: '/flight_control_report_iframe', name: 'flight_control_report_iframe', component:flight_control_report},
  { path: '/index', name: 'index', component:index,children:[
    { path: '/charge_config', name: 'charge_config', component:charge_config},
    { path: '/charge_data_source', name: 'charge_data_source', component:charge_data_source},
    { path: '/service_config', name: 'service_config', component:service_config},
    { path: '/charge_bill_config', name: 'charge_bill_config', component:charge_bill_config},
    { path: '/charge_record', name: 'charge_record', component:charge_record},
    { path: '/charge_bill', name: 'charge_bill', component:charge_bill},
    { path: '/supplement_info_config', name: 'supplement_info_config', component:supplement_info_config},
    { path: '/data_dictionary', name: 'data_dictionary', component:data_dictionary},
    { path: '/boarding_bridge_charge_bill', name: 'boarding_bridge_charge_bill', component:boarding_bridge_charge_bill},
    { path: '/flight_control_report', name: 'flight_control_report', component:flight_control_report},

  ]},
]

export default new Router({
	fallback:false,
	routes:routes
})
