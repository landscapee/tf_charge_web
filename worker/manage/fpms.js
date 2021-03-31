/*
 * @Descripttion: 
 * @version: 
 * @Author: xdh.ss
 * @Date: 2020-04-01 14:50:55
 * @LastEditors: xdh.ss
 * @LastEditTime: 2020-04-03 14:25:37
 */
import postal from 'postal';
import {
    get_data_schedule_body_DB,
    flight_schedule_body_data_is_update,
    save_data_schedule_body_DB,
    clear_DB
} from '../database/fpms';
import {init as send_urge_message,close_socket} from '../channel/fpms';






postal.subscribe({
    channel: 'worker.fpms',
    topic: 'flight_schedule_body_data_is_update',
    callback: async data => {
        await flight_schedule_body_data_is_update(data);
        const datas = await get_data_schedule_body_DB();
        postal.publish({
            channel: 'web.fpms',
            topic: 'flight_schedule_data_is_update',
            data: datas
        })
    }
})

postal.subscribe({//初始化socket
    channel: 'worker.fpms',
    topic: 'build_socket_connect',
    callback: () => {
        // fpmsinit(data)
    }
})

postal.subscribe({//催办消息推送
    channel: 'worker.fpms',
    topic: 'send_urge_message',
    callback: data => {
        send_urge_message(data)
    }
})

postal.subscribe({//关闭socket
    channel: 'worker.fpms',
    topic: 'socket_close',
    callback: () => {
        close_socket()
    }
})

postal.subscribe({//清空lock数据
    channel: 'worker.fpms',
    topic: 'clear_lockjs',
    callback: () => {
        clear_DB()
    }
})


postal.subscribe({
    channel: 'worker.fpms',
    topic: 'save_data_schedule_body',
    callback:data => {
        save_data_schedule_body_DB(data);
    }
})




postal.subscribe({
    channel: 'worker.fpms',
    topic: 'get_flight_schedule_data_by_db',
    callback: async () => {
        const body = await get_data_schedule_body_DB();
        postal.publish({
            channel: 'web.fpms',
            topic: 'flight_schedule_data_body',
            data: body
        });
    }
})
