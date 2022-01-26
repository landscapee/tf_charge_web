<template>
<div></div>
</template>
<script>
import {map} from 'lodash'
export default {
    name: "verifyMix",
    data() {
        return {}
    },
    computed:{
        getUserDataCOM:{
            get(){
                return  sessionStorage.getItem('userData')
            },
            set(v){

            }
        }
    },
    methods: {
        resetDom(dom){
            dom.style.setProperty("left", '50%', "important");
            dom.style.setProperty("top",    '50%', "important");
        },
        getRowFlightLoading({flight},key) {
            let obj = {
                A: {},
                D: {},
            }
            if (!flight) {
                return obj
            }
            if (flight.movement == 'A') {
                obj['A'] = flight
                obj['D'] = flight[key||'flight'] || {}
            } else {
                obj['D'] = flight
                obj['A'] = flight[key||'flight'] || {}
            }
            return obj
        },
        dealStatus(row, scope,obj={},key){
            let flight = scope.row.flight
            let startTime = row.startTime ? new Date(row.startTime).getTime() : ''
            let endTime = row.endTime ? new Date(row.endTime).getTime() : ''
            let filghtObj = this.getRowFlightLoading({flight},key)
            let atd = filghtObj['D'].actualTime ? new Date(filghtObj['D'].actualTime).getTime() : ''
            let ata = filghtObj['A'].actualTime ? new Date(filghtObj['A'].actualTime).getTime() : ''
            let minTime = 10
            let maxTime = 6 * 60
            let statusFRowObj =obj|| {conditionerBlo:null,
                QZDY:null,QZKT:null,
                QZDYC:null,QZKTC:null,
                QZDYD:null,QZKTD:null,
            }

            if (row.chargeBillConfigCode == 'QZSB') {
                minTime = 15
                if (_.includes(row.flightNo, 'CA')) {
                    maxTime = 3 * 60
                } else {
                    maxTime = 4 * 60
                }
            }

            // 空调时间是否大于电源时间范围 conditionerBlo
            if (row.chargeCode == 'QZKT') {
                let data = (scope.row.chargeRecords || []).filter(k => k.chargeCode == 'QZDY')[0] || {}
                let startTimeDY = data.startTime ? new Date(data.startTime).getTime() : 0
                let endTimeDY = data.endTime ? new Date(data.endTime).getTime() : 0
                // console.log(data,data.startTime,new Date(data.startTime),scope.row.chargeRecords);
                statusFRowObj.conditionerBlo =obj.conditionerBlo|| (startTime < startTimeDY || endTime > endTimeDY)

            }
            // let userData=this.getUserDataCOM

            // userData=userData&&JSON.parse(userData)
            // if( userData.deptCode=="MaintenanceLoadBridge"){
            //
            // }
            // 电源 空调时间是否大于航班时间时间范围 KTDYFlightBlo
            let KTDYFlightBlo = (atd && endTime && atd < endTime) || (ata && startTime && ata > startTime)
            statusFRowObj[row.chargeCode] =obj[row.chargeCode]|| KTDYFlightBlo
            statusFRowObj[row.chargeCode + 'D'] =obj[row.chargeCode+'D']|| endTime && startTime && (endTime - startTime < minTime * 60 * 1000)
            statusFRowObj[row.chargeCode + 'C'] =obj[row.chargeCode+'C']|| endTime && startTime && (endTime - startTime > maxTime * 60 * 1000)

            return statusFRowObj

        },
    },
    created() {

    }
}
</script>

<style scoped>

</style>