<template>
    <el-dialog v-drag-dialog ref="edit"  :visible.sync="listShow" id="addTask" center :width="rowData.chargeBillConfigCode == 'LANQ'&&type=='edit'?'800px':'400px'" :close-on-click-modal="false" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>{{type=='add'?'新增':'编辑'}}</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-form label-position="right" :label-width="rowData.chargeBillConfigCode == 'LANQ'?'110px':'80px'" ref="listData">
            <el-form-item label="航班号">
                <el-input v-model="listData.flightNo" placeholder="航班号" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="收费项">
                <el-input v-model="listData.chargeDataSource.chargeConfig.name" placeholder="收费项" :disabled="!!listData.id"></el-input>
            </el-form-item>

            <template v-if="rowData.chargeBillConfigCode == 'LANQ'&&type=='edit'">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="接桥时间">
                            <time-picker @timePickerTime="timePickerTime" :value="listData.startTime" :objectName="'listData'" :keyName="'startTime'" />
                            <!-- <el-date-picker style="width:100%" v-model="listData.startTime" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="接桥人">
                            <el-select v-model="listData.startStaffId" filterable clearable placeholder="请选择">
                                <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="撤桥时间">
                            <time-picker @timePickerTime="timePickerTime" :value="listData.endTime" :objectName="'listData'" :keyName="'endTime'" />
                            <!-- <el-date-picker style="width:100%" v-model="listData.endTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="撤桥人">
                            <el-select v-model="listData.endStaffId" filterable clearable placeholder="请选择">
                                <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="航后开始时间">
                            <time-picker @timePickerTime="timePickerTime" :value="listData.afterStartTime" :objectName="'listData'" :keyName="'afterStartTime'" />
                            <!-- <el-date-picker style="width:100%" v-model="listData.afterStartTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="航后结束时间">
                            <time-picker @timePickerTime="timePickerTime" :value="listData.afterEndTime" :objectName="'listData'" :keyName="'afterEndTime'" />
                            <!-- <el-date-picker style="width:100%" v-model="listData.afterEndTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="设备号">
                            <el-input v-model="listData.deviceCode" placeholder="设备编号"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="来源">
                            <el-input :value="getSourceName(listData)" disabled></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
            <template v-else>
                <el-form-item label="收费数据" required v-if="!timeShow&&type=='edit'">
                    <el-input v-model="listData.chargeData" placeholder="收费数据"></el-input>
                </el-form-item>
                <el-form-item label="开始时间" v-if="timeShow&&type=='edit'">
                    <time-picker @timePickerTime="timePickerTime" :value="listData.startTime" :objectName="'listData'" :keyName="'startTime'" />
                </el-form-item>
                <el-form-item label="结束时间" v-if="timeShow&&type=='edit'">
                    <time-picker @timePickerTime="timePickerTime" :value="listData.endTime" :objectName="'listData'" :keyName="'endTime'" />
                </el-form-item>
                <el-form-item label="操作人" v-if="type=='edit'&&rowData.chargeBillConfigCode != 'QZSB'">
                    <el-select v-model="listData.operatorId" filterable clearable placeholder="请选择">
                        <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="操作人1" v-if="type=='edit'&&rowData.chargeBillConfigCode == 'QZSB'">
                    <el-select v-model="listData.operatorId" filterable clearable placeholder="请选择">
                        <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="操作人2" v-if="type=='edit'&&rowData.chargeBillConfigCode == 'QZSB'">
                    <el-select v-model="listData.startUserId" filterable clearable placeholder="请选择">
                        <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </template>
            <el-form-item label="备注">
                <el-input v-model="listData.remark" placeholder="备注"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="footer">
            <el-button @click="listShow=false">取 消</el-button>
            <el-button type="primary" @click="save">提交</el-button>
        </div>
    </el-dialog>
</template>

<script>
import TimePicker from '../../../components/time-picker'
import VerifyMix from './verifyMix'

export default {
    components: {
        'time-picker': TimePicker,
    },
    props: ['userDeptLists'],
    data() {
        return {
            listShow: false,
            listData: {
                chargeBill: {},
                chargeDataSource: {
                    chargeConfig: {},
                },
                startTime: '',
                endTime: '',
                remark: '',
            },
            type: '',
            timeShow: false,
            rowData: {},
        }
    },
    mixins:[VerifyMix],
    methods: {
        timePickerTime(objectName, keyName, time) {
            this[objectName][keyName] = time
        },
        getSourceName(record) {
            return record.chargeDataSource.code ? record.chargeDataSource.code.split('-')[1] : ''
        },

        initData(type, data, row) {
            let dom =this.$refs.edit.$el.querySelector('.el-dialog')
            this.resetDom(dom)
            this.timeShow = false
            this.type = type
            this.listShow = true
            this.rowData = row

            this.listData = {
                chargeBill: {},
                chargeDataSource: {
                    chargeConfig: {},
                },
                startTime: '',
                endTime: '',
                remark: '',
            }
             if (data) {
                // setTimeout(() => {
                //     this.listData = _.cloneDeep(data)
                // }, 1000)
                this.$nextTick(() => {
                    this.listData = _.cloneDeep(data)
                })

                this.timeShow = data.unit == '秒' ? true : false
            }
        },
        save() {
            if (!this.recordVerify()) {
                return
            }

            let startStaffObj = _.find(this.userDeptLists, { id: this.listData.startStaffId }) || {}
            let endStaffObj =
                _.find(this.userDeptLists, {
                    id: this.listData.endStaffId,
                }) || {}
            let operatorObj =
                _.find(this.userDeptLists, {
                    id: this.listData.operatorId,
                }) || {}

            let startUserObj =
                _.find(this.userDeptLists, {
                    id: this.listData.startUserId,
                }) || {}

            this.listData.startStaffName = startStaffObj.name || ''
            this.listData.endStaffName = endStaffObj.name || ''
            this.listData.operatorName = operatorObj.name || ''
            this.listData.startUserName = startUserObj.name || ''

            let url =
                this.listData.chargeCode == 'LANQ'
                    ? '/boarding-bridge-charge-record/save'
                    : '/charge-record/save'
            this.$axios.post(url, this.listData).then((res) => {
                this.listShow = false
                this.$alert(res.msg, '提示', {
                    type: 'success',
                    center: true,
                })
                this.$emit('update')
            })
        },
        recordVerify() {
            if (this.timeShow) {
                if (!this.listData.startTime) {
                    let msg = `${
                        this.listData.chargeCode == 'LANQ' ? '接桥' : '开始'
                    }时间不能为空！`
                    this.$alert(msg, '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
                if (!this.listData.endTime) {
                    let msg = `${
                        this.listData.chargeCode == 'LANQ' ? '撤桥' : '结束'
                    }时间不能为空！`
                    this.$alert(msg, '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
            } else {
                if (!this.listData.chargeData) {
                    this.$alert('收费数据不能为空', '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
                if (this.listData.chargeData <= 0) {
                    this.$alert('收费数据必须大于0！', '提示', {
                        type: 'error',
                        center: true,
                    })
                    this.listData.chargeData = ''
                    return false
                }
            }

            // if (!this.listData.remark) {
            //     this.$alert('修改备注必填', '提示', {
            //         type: 'error',
            //         center: true,
            //     })
            //     return false
            // }

            if (this.listData.startTime && this.listData.endTime) {
                let msg = '开始时间不能大于或者等于结束时间！'
                if (this.listData.chargeCode == 'LANQ') {
                    msg = '撤桥时间不能大于或者等于接桥时间！'
                }
                if (
                    new Date(this.listData.startTime).getTime() >=
                    new Date(this.listData.endTime).getTime()
                ) {
                    this.$alert(msg, '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
            }

            if (
                this.listData.afterStartTime &&
                this.listData.afterEndTime &&
                new Date(this.listData.afterStartTime).getTime() >
                    new Date(this.listData.afterEndTime).getTime()
            ) {
                this.$alert('航后开始时间不能超过航后结束时间！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            return true
        },
    },
}
</script>