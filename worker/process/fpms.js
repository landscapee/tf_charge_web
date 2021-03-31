/*
 * @Descripttion: 
 * @version: 
 * @Author: xdh.ss
 * @Date: 2020-04-02 17:30:40
 * @LastEditors: xdh.ss
 * @LastEditTime: 2020-04-03 17:16:18
 */
import postal from 'postal';
import {get} from 'lodash';
import '../manage/fpms';

const channel = postal.channel('web.fpms')
channel.subscribe('#', (data, envelope) => {
    self.postMessage({
        channel: get(envelope, 'channel'),
        topic: get(envelope, 'topic'),
        data: get(envelope, 'data', [])
    });
});

self.onmessage = (event) => {
    postal.publish({
        channel: get(event, 'data.channel'),
        topic: get(event, 'data.topic'),
        data: get(event, 'data.data')
    });
};