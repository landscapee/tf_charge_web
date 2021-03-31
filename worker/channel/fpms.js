/*
 * @Descripttion: 数据ws链接模块
 * @version: 
 * @Author: xdh.ss
 * @Date: 2020-04-02 17:30:40
 * @LastEditors: xdh.ss
 * @LastEditTime: 2020-04-03 16:31:57
 */
import postal from 'postal';
import socket from '../lib/socket';
import _ from 'lodash'

import {
    flight_schedule_body_data_is_update,
    get_flight_schedule_body_item,
    flight_schedule_body_data_is_del,
    process_schedule_body_data_is_update,
    get_process_schedule_body_item,
    process_schedule_body_data_is_del
} from '../database/fpms';
    
let token = null
let remoteAddress = null
let getDataSocket = null
let origin = null


// socket链接 channel
const ws_channel = {
    flight_info: '/flight/info', // 航班信息
    flight_remove:'/flight/remove',//移除航班
    flight_dynamic: '/flight/dynamic', // 航班动态,废弃，和变更信息合并
    flight_dynamic_message: '/flight/dynamic/message', // 航班动态变更消息
    flight_operation: '/flight/operation', // 航班操作
    process_info: '/process/info', // 进程节点信息
    process_alarm: '/process/alarm', // 节点预警阀提醒
    deviation_info: '/deviation/info', // 偏离上报信息
    flight_control: '/flight/control', // 航班管控
    reminder_message:'/reminder/message',//偏离发送催办
    three_check:'/three/check',//三项检查消息推送
    unread_message:'/unread/message',//未读数量推送
    config_update:"/config/update",//配置更新

    user_info_login: '/user/info/login', // 用户登录
    user_info:"/user/info",//推送用户信息
    user_info_logout: '/user/info/logout', // 用户登出
    flight_allocation:'/flight/allocation',//重新分配用户数据

    flight_seat_time:'/flight/seat/time',//机位变更
    
    shift_flight:"/shift/flight",//交接班推送
    

    not_time_flight:"/not/time/flight",//未分配航班
    delay_flight:"/delay/flight",//延误航班
    diversion_flight:"/diversion/flight",//备降航班
    take_off_flight:"/take/off/flight",//已飞航班
    take_off_delay:'/take/off/delay',//  推出延误推送消息
    monitor_alarm:"/monitor/alarm",//监控预警
    flight_count:"/flight/count",//航班数量

    sys_time:"/sys/time",//系统时间
    screen:"/screen",//大屏推送

}


export const send_urge_message = (data)=>{
    getDataSocket.socket_emit(data.path,_.omit(data, ['path']))
}

export const close_socket = ()=>{
    
    if(getDataSocket){
        getDataSocket.socket_close()
    }
}
    

export const socket_on_fun = ()=>{
    getDataSocket.socket_on(ws_channel.flight_info, async data => {//航班信息
        if(data.option=="update"){
            let item = await get_flight_schedule_body_item(data.data)
            if(!item){return false}//航班存在在更新
            await flight_schedule_body_data_is_update(data.data,'flight_info');//更新DB
            postal.publish({
                channel: 'web.fpms',
                topic: 'update_flight_body',
                data: data.data
            });
        }else{
            // console.log(_.cloneDeep(data))
            await flight_schedule_body_data_is_update(data.data.flight[0],'flight_info');
            await process_schedule_body_data_is_update(data.data,'flight_info');
            postal.publish({
                channel: 'web.fpms',
                topic: 'add_flight_body',
                data: data.data
            });
        }
    });
    getDataSocket.socket_on(ws_channel.flight_remove, async data => {//移除航班
        // let item = await get_flight_schedule_body_item(data.data)
        // if(!item)return false//航班存在在更新
        await flight_schedule_body_data_is_del(data.data,'flight_remove');
        await process_schedule_body_data_is_del(data.data,'flight_remove');
        postal.publish({
            channel: 'web.fpms',
            topic: 'flight_data_delete',
            data: data.data
        });
    });
    getDataSocket.socket_on(ws_channel.flight_dynamic_message, async data => {//航班动态变更消息
        if(!data.data){return false}
        
        await flight_schedule_body_data_is_update(data.data.flight,'flight_dynamic');//更新DB
        
        postal.publish({
            channel: 'web.fpms',
            topic: 'flight_dynamic_message_update',
            data: data.data
        });
        
    });
    getDataSocket.socket_on(ws_channel.flight_operation, async data => {//航班操作
        if(data.option=="delete"){
            await flight_schedule_body_data_is_del(data.data,'flight_operation');
        }
        if(data.option=="update"){
            await flight_schedule_body_data_is_update(data.data,'flight_operation');
        }

        postal.publish({
            channel: 'web.fpms',
            topic: 'update_flight_operation',
            data: data
        });
    });
    getDataSocket.socket_on(ws_channel.process_info, async data => {//进程节点信息
        if(!data.data||!_.isArray(data.data)||data.data.length==0){return false}
        data.data.map(async list=>{
            let item = await get_process_schedule_body_item(list)
            if(!item){return false}//进程存在在更新
            setTimeout(() => {
                process_schedule_body_data_is_update(list,'process_info')
                postal.publish({
                    channel: 'web.fpms',
                    topic: 'process_info_update',
                    data: list
                });
            }, 0);
            
        })
        
        
    });
    getDataSocket.socket_on(ws_channel.deviation_info, async data => {//偏离上报信息
        if(!data.data){return false}
        let item = await get_process_schedule_body_item(data.data)
        if(!item){return false}//进程存在在更新
        await process_schedule_body_data_is_update(data.data,'deviation_info')
        postal.publish({
            channel: 'web.fpms',
            topic: 'deviation_info',
            data: data.data
        });

    });
    getDataSocket.socket_on(ws_channel.flight_control, async data => {//航班管控
        await flight_schedule_body_data_is_update(data.data.flight[0],'flight_control');
        postal.publish({
            channel: 'web.fpms',
            topic: 'update_flight_control',
            data: data.data
        });
    }); 
    getDataSocket.socket_on(ws_channel.three_check, async data => {//三项检查消息推送
        postal.publish({
            channel: 'web.fpms',
            topic: 'three_check',
            data: data.data
        });
    }); 
    getDataSocket.socket_on(ws_channel.unread_message, async data => {//未读数量推送
        postal.publish({
            channel: 'web.fpms',
            topic: 'unread_message',
            data: data.data
        });
    }); 
    getDataSocket.socket_on(ws_channel.config_update, async data => {//配置更新
        
        postal.publish({
            channel: 'web.fpms',
            topic: 'config_update',
            data: data.data
        });
    }); 



    getDataSocket.socket_on(ws_channel.user_info_login, data => {// 用户登录
        
        postal.publish({
            channel: 'web.fpms',
            topic: 'online_users_data_is_update',
            data: {
                list: [data.data],
                type: 'add'
            }
        });
    });
    getDataSocket.socket_on(ws_channel.user_info_logout, data => {// 用户登出
        postal.publish({
            channel: 'web.fpms',
            topic: 'online_users_data_is_update',
            data: {
                list: [data.data],
                type: 'delete'
            }
        });
    });
    
    getDataSocket.socket_on(ws_channel.process_alarm, data => {// 进程节点预警阀提醒
        data.data.type = data.type
        postal.publish({
            channel: 'web.fpms',
            topic: 'process_alarm_update',
            data: data.data
        });
    });
    

    getDataSocket.socket_on(ws_channel.flight_allocation, () => {// 重新分配用户数据
        postal.publish({
            channel: 'web.fpms',
            topic: 'user_flight_reset',
        });
    });

    getDataSocket.socket_on(ws_channel.flight_seat_time, data => {// 机位变更
        postal.publish({
            channel: 'web.fpms',
            topic: 'flight_seat_time',
            data:data.data
        });
    });

    
    getDataSocket.socket_on(ws_channel.shift_flight, data => {// 推出延误推送消息
        postal.publish({
            channel: 'web.fpms',
            topic: 'shift_flight',
            data:data
        });
    });
    getDataSocket.socket_on(ws_channel.user_info, data => {// 用户信息
        postal.publish({
            channel: 'web.fpms',
            topic: 'user_info',
            data:data.data
        });
    });
    
    getDataSocket.socket_on(ws_channel.not_time_flight, data => {// 未分配航班
        postal.publish({
            channel: 'web.fpms',
            topic: 'not_time_flight',
            data:data
        });
    });
    getDataSocket.socket_on(ws_channel.delay_flight, data => {// 延误航班
        postal.publish({
            channel: 'web.fpms',
            topic: 'delay_flight',
            data:data
        });
    });
    getDataSocket.socket_on(ws_channel.diversion_flight, data => {// 备降航班
        postal.publish({
            channel: 'web.fpms',
            topic: 'diversion_flight',
            data:data
        });
    });
    getDataSocket.socket_on(ws_channel.take_off_flight, data => {// 已飞航班
        postal.publish({
            channel: 'web.fpms',
            topic: 'take_off_flight',
            data:data
        });
    });
    getDataSocket.socket_on(ws_channel.take_off_delay, data => {// 推出延误推送消息
        postal.publish({
            channel: 'web.fpms',
            topic: 'take_off_delay',
            data:data
        });
    });
    getDataSocket.socket_on(ws_channel.monitor_alarm, data => {// 监控预警
        postal.publish({
            channel: 'web.fpms',
            topic: 'monitor_alarm',
            data:data.data
        });
    });
    
    getDataSocket.socket_on(ws_channel.flight_count, data => {// 监控预警
        postal.publish({
            channel: 'web.fpms',
            topic: 'flight_count',
            data:data.data
        });
    });


    getDataSocket.socket_on(ws_channel.sys_time, data => {// 系统时间
        postal.publish({
            channel: 'web.fpms',
            topic: 'sys_time',
            data:data.data
        });
    });

    getDataSocket.socket_on(ws_channel.screen, data => {// 大屏推送
        postal.publish({
            channel: 'web.fpms',
            topic: 'screen',
            data:data.data
        });
    });
    

    
}



export const init = (data) => {
    token = data.token
    remoteAddress = data.remoteAddress
    origin = data.origin
    console.log(data)
    getDataSocket = new socket(origin,{
        forceNew: true,
        path: '/websocket/socket.io',
        query:{
            Authorization:token,
            remoteAddress:remoteAddress
        },
        transports: ['websocket']
    });

    getDataSocket.socket_start()
    socket_on_fun()
};

