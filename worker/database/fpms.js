/*
 * @Descripttion: 数据库操作
 * @version: 
 * @Author: xdh.ss
 * @Date: 2020-04-02 10:55:04
 * @LastEditors: xdh.ss
 * @LastEditTime: 2020-04-03 14:51:56
 */
import loki from 'lokijs';
import Promise from 'bluebird';
import {omit,forIn} from 'lodash';

const DB = new loki('fpms.db' );
// { adapter: 'memory' }


const flight_schedule_body_DB = DB.addCollection('flight_schedule_body', {
    unique: ['id','flightId']
});

const process_schedule_body_DB = DB.addCollection('process_body_schedule', {
    unique: ['id','flightId']
});

flight_schedule_body_DB.ensureUniqueIndex('id');


export const clear_DB = () => {//保存header所有数据
    flight_schedule_body_DB.clear()
    process_schedule_body_DB.clear()
}

export const save_data_schedule_body_DB = data => {//保存body所有数据
    let flight = data.flight || {}
    let process = data.process || {}
    flight_schedule_body_DB.clear()
    process_schedule_body_DB.clear()
    Promise.all([
        save_to_flight_schedule_body_DB(flight),
        save_to_process_schedule_body_DB(process)
    ]).then(()=>{
        
    })

}

export const get_data_schedule_body_DB = () => {//获取body所有数据
    return new Promise((resolve, reject) => {
        Promise.props({
            flight_body:get_flight_schedule_body_data(),
            process_body:get_process_schedule_body_data(),
        }).then(res=>{
            var data = {
                flight:res.flight_body,
                process:res.process_body[0]
            }
            if (data) {
                resolve(data);
            } else {
                reject(null);
            }
        })
    })
}

//fight_body

export const save_to_flight_schedule_body_DB = data => {//保存flightbody信息
    
    return new Promise((resolve, reject) => {
        if (data) {
            flight_schedule_body_DB.insert(data);
            resolve(data);
        } else {
            reject(null);
        }

    })
}

export const get_flight_schedule_body_data = () => {//获取flightbody数据
    return new Promise((resolve, reject) => {
        let data = flight_schedule_body_DB.chain().find().data();
        if (data) {
            resolve(data);
        } else {
            reject(null);
        }
    })
}

export const flight_schedule_body_data_is_update = (data) => {//flightbody 更新

    let item = omit(data, ['$loki', 'mate']);
    let exist_flight_schedule = flight_schedule_body_DB.by('flightId', item.flightId);
    return new Promise((resolve, reject) => {
        if (data) {
            if (!exist_flight_schedule) {
                flight_schedule_body_DB.insert(item);
            } else {
                flight_schedule_body_DB.update(_.extend(exist_flight_schedule, item))
            }
            resolve(data);
        } else {
            reject(null);
        }
    })
}

export const get_flight_schedule_body_item = data => {//获取单个item信息
    let item = omit(data, ['$loki', 'mate']);
    let result = flight_schedule_body_DB.by('flightId',item.flightId)

    let bodyData = flight_schedule_body_DB.chain().find().data()
    let successionFlight = _.find(bodyData,list=>{
        if(list.successionFlight){
            return list.successionFlight.flightId == data.flightId
        }else{
            return false
        }
    })




    return new Promise((resolve, reject) => {
        if (data) {
            resolve(result||successionFlight);
        } else {
            reject(null);
        }
    })
}

export const flight_schedule_body_data_is_del = (data) => {//flightbody 删除
    let exist_flight_schedule = flight_schedule_body_DB.by('flightId',data.flightId);
    return new Promise((resolve, reject) => {
        if (data) {
            if(exist_flight_schedule){
                flight_schedule_body_DB.remove(exist_flight_schedule)
            }
            resolve(data);
        } else {
            reject(null);
        }
    })
}



//process_body

export const save_to_process_schedule_body_DB = data => {//保存processbody信息
    
    return new Promise((resolve, reject) => {
        if (data) {
            process_schedule_body_DB.insert(data);
            resolve(data);
        } else {
            reject(null);
        }

    })
}

export const get_process_schedule_body_data = () => {//获取processbody数据
    return new Promise((resolve, reject) => {
        let data = process_schedule_body_DB.chain().find().data();
        if (data) {
            resolve(data);
        } else {
            reject(null);
        }
    })
}

export const process_schedule_body_data_is_update = async (data,type) => {//processbody更新
    let process_body =  await get_process_schedule_body_data()
    let result = null
    
    if(process_body.length==0){
        process_body = [{}]
    }
    if(type == "flight_info"){
        forIn(data.process, function(value, key) {
            process_body[0][key]=value
        });
    }else{
        if(!process_body[0][data.flightId][data.code]){
            process_body[0][data.flightId][data.code] = {}
        }
        result = process_body[0][data.flightId][data.code]
    }
    

    if(type == "deviation_info"){
        if(result&&result.deviationReportList){
            result.deviationReportList.push(data)
        }else{
            result.deviationReportList = [data]
        }
    }
    if(type == "process_info"){
        result = _.extend(result,data)
    }
    
    return new Promise((resolve, reject) => {
        if (data) {
            if(process_body[0].$loki){
                process_schedule_body_DB.update(process_body[0])
            }else{
                process_schedule_body_DB.insert(process_body[0]);
            }
            resolve(data);
        } else {
            reject(null);
        }
    })
}

export const get_process_schedule_body_item = async data => {//获取单个item信息
    let process_body =  await get_process_schedule_body_data()
    if(process_body.length==0){
        return false
    }
    let result = process_body[0][data.flightId]
    if(!result){
        return false
    }

    return new Promise((resolve, reject) => {
        if (data) {
            resolve(result);
        } else {
            reject(null);
        }
    })
}

export const process_schedule_body_data_is_del = async (data) => {//processbody删除
    let process_body =  await get_process_schedule_body_data()
    if(process_body.length==0){return false}
    delete process_body[0][data.flightId]
    return new Promise((resolve, reject) => {
        if (data) {
            process_schedule_body_DB.update(process_body[0])
            resolve(data);
        } else {
            reject(null);
        }
    })
}

















































































































