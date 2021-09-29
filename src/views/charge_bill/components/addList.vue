<template>
    <div>
        <el-dialog :visible.sync="listShow" id="addTask" center :width="listData.chargeBillConfigCode=='LANQ'?'1200px':'800px'" :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>新增</span>
                <i class="el-icon-circle-close" @click="listShow=false"></i>
            </div>
            <el-form label-position="right" label-width="80px" ref="listData">
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="航班号" required>
                            <el-input v-model="activeFlight.flightNo" placeholder="航班号" @focus="flightNoHandle" ref="ref_flightNo" :disabled="flightDisable"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="机位" required>
                            <el-input v-model="activeFlight.seat" placeholder="机位"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="机号" required>
                            <el-input v-model="activeFlight.aircraftNo" placeholder="机号"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="收费单" required>
                    <el-select v-model="listData.chargeBillConfigCode" filterable clearable placeholder="请选择" @change="chargeBillChange" :disabled="flightDisable">
                        <el-option v-for="item in chargeBillArr" :key="item.id" :label="item.name" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="收费项" v-if="listData.chargeBillConfigCode!='QZSB'">
                    <el-table :data="chargeRecords" style="width: 100%" :key="tableKey">
                        <el-table-column prop="chargeName" label="收费项"></el-table-column>
                        <template v-if="listData.chargeBillConfigCode=='LANQ'">
                            <el-table-column prop="deviceCode" label="设备号"></el-table-column>
                            <el-table-column prop="afterStartTime" label="航后开始时间">
                                <template slot-scope="scope">
                                    {{getTimeByFormat(scope.row.afterStartTime,'hh:mm:ss(DD)')}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="afterEndTime" label="航后结束时间">
                                <template slot-scope="scope">
                                    {{getTimeByFormat(scope.row.afterEndTime,'hh:mm:ss(DD)')}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="startTime" label="接桥时间">
                                <template slot-scope="scope">
                                    {{getTimeByFormat(scope.row.startTime,'hh:mm:ss(DD)')}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="endTime" label="撤桥时间">
                                <template slot-scope="scope">
                                    {{getTimeByFormat(scope.row.endTime,'hh:mm:ss(DD)')}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="startStaffName" label="接桥人员"></el-table-column>
                            <el-table-column prop="endStaffName" label="撤桥人员"> </el-table-column>
                        </template>
                        <template v-else>
                            <el-table-column prop="chargeData" label="收费数据"></el-table-column>
                            <el-table-column prop="startTime" label="开始时间">
                                <template slot-scope="scope">
                                    {{getTimeByFormat(scope.row.startTime,'hh:mm:ss(DD)')}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="endTime" label="结束时间">
                                <template slot-scope="scope">
                                    {{getTimeByFormat(scope.row.endTime,'hh:mm:ss(DD)')}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="deviceCode" label="设备编号"></el-table-column>

                            <el-table-column prop="operatorName" label="操作人"></el-table-column>
                        </template>
                        <el-table-column label="操作" width="80" align='center' class-name="optBox">
                            <template slot-scope="scope">
                                <el-button type="text" title="编辑" @click="editChargeRecord(scope)">
                                    <i class="el-icon-edit"></i>
                                </el-button>
                                <el-button type="text" title="删除" @click="delChargeRecord(scope)">
                                    <i class="el-icon-delete"></i>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="addRowBoxBox" style="margin-top:15px;">
                        <el-button class="addRowBox" type="primary" icon="el-icon-plus" @click="addChargeRecord" style="width:100%">增加</el-button>
                    </div>
                </el-form-item>
                <el-form-item label="桥载空调" v-if="listData.chargeBillConfigCode=='QZSB'">
                    <el-form label-position="right" ref="listData" label-width="80px">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="开始时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="QZSBrecords2.startTime" :objectName="'QZSBrecords2'" :keyName="'startTime'" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="结束时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="QZSBrecords2.endTime" :objectName="'QZSBrecords2'" :keyName="'endTime'" />
                                </el-form-item>

                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="设备编号">
                                    <el-input v-model="QZSBrecords2.deviceCode" placeholder="设备编号"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="使用时长">
                                    <el-input v-model="QZSBrecords2Time" placeholder="使用时长"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="操作人1">
                                    <el-select v-model="QZSBrecords2.operatorId" filterable clearable placeholder="请选择">
                                        <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="操作人2">
                                    <el-select v-model="QZSBrecords2.startUserId" filterable clearable placeholder="请选择">
                                        <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                    </el-form>
                </el-form-item>
                <el-form-item label="桥载电源" v-if="listData.chargeBillConfigCode=='QZSB'">
                    <el-form label-position="right" ref="listData" label-width="80px">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="开始时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="QZSBrecords1.startTime" :objectName="'QZSBrecords1'" :keyName="'startTime'" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">

                                <el-form-item label="结束时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="QZSBrecords1.endTime" :objectName="'QZSBrecords1'" :keyName="'endTime'" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="设备编号">
                                    <el-input v-model="QZSBrecords1.deviceCode" placeholder="设备编号"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="使用时长">
                                    <el-input v-model="QZSBrecords1Time" placeholder="使用时长"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="操作人1">
                                    <el-select v-model="QZSBrecords1.operatorId" filterable clearable placeholder="请选择">
                                        <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="操作人2">
                                    <el-select v-model="QZSBrecords1.startUserId" filterable clearable placeholder="请选择">
                                        <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                    </el-form>
                </el-form-item>

                <el-form-item label="补充信息" v-if="supplementArr.length>0&&!this.rowData">
                    <el-form label-width="80px" style="width:500px">
                        <el-form-item :label="item.name+':'" v-for="(item,idx) in supplementArr" :key="idx">
                            <el-input v-model="item.valueTitle" v-if="item.params.type===0||item.params.type===1" :type="item.params.type===0?'number':'text'" @change="saveSupplement(item)"></el-input>
                            <el-select v-model="item.valueCode" v-else placeholder="请选择" filterable :multiple="item.params.type===2?false:true" @change="saveSupplement(item)">
                                <el-option v-for="select in item.params.selects" :key="select.code" :label="select.describe" :value="select.code"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-form-item>
            </el-form>
            <div slot="footer" class="footer">
                <el-button @click="listShow=false">取 消</el-button>
                <el-button type="primary" @click="save">提交</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="flightNoShow" id="addTask" center :show-close="false" width="">
            <div slot="title" class="head">
                <div></div>
                <span>航班号选择</span>
                <i class="el-icon-circle-close" @click="flightNoShow=false"></i>
            </div>
            <div class="flightNoBox">
                <el-form label-position="right" label-width="80px" ref="listData">
                    <el-form-item label="时间范围">
                        <el-date-picker v-model="flight_time" format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable></el-date-picker>
                    </el-form-item>
                    <el-form-item label="航班号">
                        <el-input v-model="flight_no" placeholder="航班号" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="机位">
                        <el-input v-model="flight_seat" placeholder="机位" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="机号">
                        <el-input v-model="flightNo_aircraftNo" placeholder="机号" clearable></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="flighNoSearch">搜 索</el-button>
                    </el-form-item>

                </el-form>
                <div class="flightNo-check">
                    <p>航班选择列表-双击确定</p>
                    <ul>
                        <li v-for="(item,idx) in flightArr" :key="idx" @dblclick="flightNoDbHandle(item)">
                            {{item.flightNo}}&nbsp;&nbsp;
                            {{item.movement=='A'?'进':'离'}}&nbsp;&nbsp;
                            实际:{{getTimeByFormat(item.actualTime,'hh:mm(DD)')}}&nbsp;&nbsp;
                            机位:{{item.seat}}&nbsp;&nbsp;
                            机号:{{item.aircraftNo}}&nbsp;&nbsp;
                        </li>
                    </ul>
                </div>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="chargeRecordShow" id="addTask" center :show-close="false" :width="chargeRecordPageType=='boarding-bridge'?'800px':'400px'">
            <div slot="title" class="head">
                <div></div>
                <span>收费项选择</span>
                <i class="el-icon-circle-close" @click="chargeRecordShow=false"></i>
            </div>
            <el-form label-position="right" :label-width="chargeRecordPageType=='boarding-bridge'?'110px':'80px'" ref="listData">
                <el-form-item label="收费项">
                    <el-select v-model="activeChargeRecord.chargeCode" filterable clearable placeholder="请选择">
                        <el-option v-for="item in chargeArr" :key="item.id" :label="item.code+'-'+item.name+'('+item.unit+')'" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
                <template v-if="activeChargeRecord.chargeCode">
                    <template v-if="chargeRecordPageType=='boarding-bridge'">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="接桥时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="activeChargeRecord.startTime" :objectName="'activeChargeRecord'" :keyName="'startTime'" />
                                    <!-- <el-date-picker style="width:100%" v-model="activeChargeRecord.startTime" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="接桥人">
                                    <el-select v-model="activeChargeRecord.startStaffId" filterable clearable placeholder="请选择">
                                        <el-option v-for="item in userDeptLists" :key="'0'+item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="撤桥时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="activeChargeRecord.endTime" :objectName="'activeChargeRecord'" :keyName="'endTime'" />
                                    <!-- <el-date-picker style="width:100%" v-model="activeChargeRecord.endTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="撤侨人">
                                    <el-select v-model="activeChargeRecord.endStaffId" filterable clearable placeholder="请选择">
                                        <el-option v-for="item in userDeptLists" :key="'1'+item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="航后开始时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="activeChargeRecord.afterStartTime" :objectName="'activeChargeRecord'" :keyName="'afterStartTime'" />
                                    <!-- <el-date-picker style="width:100%" v-model="activeChargeRecord.afterStartTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="航后结束时间">
                                    <time-picker @timePickerTime="timePickerTime" :value="activeChargeRecord.afterEndTime" :objectName="'activeChargeRecord'" :keyName="'afterEndTime'" />
                                    <!-- <el-date-picker style="width:100%" v-model="activeChargeRecord.afterEndTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="设备号">
                                    <el-input v-model="activeChargeRecord.deviceCode" placeholder="设备编号"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </template>
                    <template v-else>
                        <el-form-item label="收费数据" v-if="!getActiveChargeRecordTimeShow">
                            <el-input type="number" v-model="activeChargeRecord.chargeData" placeholder="收费数据"></el-input>
                        </el-form-item>
                        <el-form-item label="开始时间" v-if="getActiveChargeRecordTimeShow">
                            <time-picker @timePickerTime="timePickerTime" :value="activeChargeRecord.startTime" :objectName="'activeChargeRecord'" :keyName="'startTime'" />
                            <!-- <el-date-picker style="width:100%" v-model="activeChargeRecord.startTime" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                        </el-form-item>
                        <el-form-item label="结束时间" v-if="getActiveChargeRecordTimeShow">
                            <time-picker @timePickerTime="timePickerTime" :value="activeChargeRecord.endTime" :objectName="'activeChargeRecord'" :keyName="'endTime'" />
                            <!-- <el-date-picker style="width:100%" v-model="activeChargeRecord.endTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                        </el-form-item>
                        <el-form-item label="设备编号" v-if="getActiveChargeRecordTimeShow">
                            <el-input v-model="activeChargeRecord.deviceCode" placeholder="设备编号"></el-input>
                        </el-form-item>
                        <el-form-item label="操作人">
                            <el-select v-model="activeChargeRecord.operatorId" filterable clearable placeholder="请选择">
                                <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </template>
                </template>

            </el-form>

            <div slot="footer" class="footer">
                <el-button @click="chargeRecordSave(activeChargeRecord)" type="primary">确 定</el-button>
                <el-button @click="chargeRecordShow=false">取 消</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
import TimePicker from '../../../components/time-picker'
export default {
    components: {
        'time-picker': TimePicker,
    },
    props: ['userDeptLists'],
    data() {
        return {
            listShow: false,
            activeFlight: {},
            listData: {},
            flightArr: [],
            chargeArr: [],
            chargeRecords: [],
            supplementArr: [],
            chargeBillArr: [],
            flightNoShow: false,
            flight_time: [],
            flight_no: '',
            flight_seat: '',
            flightNo_aircraftNo: '',
            timeShow: false,
            rowData: {},
            pageType: '',
            flightDisable: false,
            chargeRecordShow: false,
            activeChargeRecord: {},
            activeSupplement: {},
            getActiveChargeRecordTimeShow: false,
            chargeRecordPageType: '',
            activeChargeRecordType: '',
            tableKey: 0,
            QZSBrecords1: {},
            QZSBrecords2: {},
            QZSBrecords1Time: '',
            QZSBrecords2Time: '',
        }
    },
    mounted() {},
    watch: {
        'listData.chargeBillConfigCode': function (val) {
            this.chargeRecords = []
            if (val == 'LANQ') {
                this.pageType = 'boarding-bridge'
            } else {
                this.pageType = ''
            }
            if (val == 'QZSB') {
                this.getActiveChargeRecordTimeShow = true
                if (this.activeFlight.seat) {
                    this.QZSBrecords1.deviceCode = this.activeFlight.seat + '-QZDY'
                    this.QZSBrecords2.deviceCode = this.activeFlight.seat + '-QZKT'
                }
            }
        },
        'activeChargeRecord.chargeCode': function (val) {
            if (!val) {
                return
            }
            this.activeChargeRecord = {
                chargeCode: val,
            }
            let charge = _.find(this.chargeArr, { code: val })
            this.getActiveChargeRecordTimeShow = charge.unit == '秒' ? true : false
            if (val == 'LANQ') {
                this.chargeRecordPageType = 'boarding-bridge'
            } else {
                this.chargeRecordPageType = ''
            }

            if (this.listData.chargeBillConfigCode == 'QZSB' && this.activeFlight.flightNo) {
                this.activeChargeRecord.deviceCode = this.activeFlight.seat + '-' + val
            }
        },
        activeFlight: function (val) {
            if (this.listData.chargeBillConfigCode == 'QZSB' && this.activeFlight.seat) {
                this.QZSBrecords1.deviceCode = val.seat + '-QZDY'
                this.QZSBrecords2.deviceCode = val.seat + '-QZKT'
            }
        },
    },
    methods: {
        getUseTime(obj) {
            let time = ''

            if (this[obj] && this[obj].startTime && this[obj].endTime) {
                let endtimer = new Date(this[obj].endTime).getTime()
                let starttimer = new Date(this[obj].startTime).getTime()
                if (endtimer >= starttimer) {
                    time = this.timeLength(endtimer - starttimer)
                }
            }
            return time
        },
        timePickerTime(objectName, keyName, time) {
            this[objectName][keyName] = time
            if (objectName == 'QZSBrecords1') {
                this.QZSBrecords1Time = this.getUseTime(objectName)
            }
            if (objectName == 'QZSBrecords2') {
                this.QZSBrecords2Time = this.getUseTime(objectName)
            }
        },
        getChargeBillArr(val) {
            let userData = JSON.parse(sessionStorage.userData)
            let arrs = []
            userData.roles.map((role) => {
                let charge = _.find(val, { code: role.code })
                if (charge && role.menus && role.menus.length > 0) {
                    let menuadd = _.find(role.menus, { code: 'charge_add' })
                    if (menuadd) {
                        arrs.push(charge)
                    }
                }
            })
            this.chargeBillArr = arrs
        },
        initData(row, chargeBillArrs) {
            this.getChargeBillArr(chargeBillArrs)
            this.chargeRecords = []
            this.supplementArr = []
            this.listShow = true
            this.rowData = row
            this.flightArr = []
            this.activeFlight = {}
            this.QZSBrecords1 = {}
            this.QZSBrecords2 = {}
            this.listData = {
                chargeBillConfigCode: '',
            }

            if (this.chargeBillArr.length == 1) {
                this.listData.chargeBillConfigCode = this.chargeBillArr[0].code
                this.chargeBillChange('new')
            }

            if (this.rowData) {
                this.flightDisable = true
                this.activeFlight = this.rowData.flight
                this.listData.chargeBillConfigCode = this.rowData.chargeBillConfigCode
                this.chargeBillChange('new')
            } else {
                this.flightDisable = false
            }
        },
        addChargeRecord() {
            if (this.chargeArr.length == 0) {
                this.$alert('未选择收费单', '提示', {
                    type: 'error',
                    center: true,
                })
                return
            }
            this.activeChargeRecordType = 'add'
            this.activeChargeRecord = {}

            if (this.chargeArr.length == 1) {
                this.activeChargeRecord.chargeCode = this.chargeArr[0].code
            }
            this.chargeRecordShow = true
        },
        recordVerify(activeChargeRecord) {
            if (this.getActiveChargeRecordTimeShow) {
                if (!activeChargeRecord.startTime) {
                    let msg = `${
                        activeChargeRecord.chargeCode == 'LANQ' ? '接桥' : '开始'
                    }时间不能为空！`
                    this.$alert(msg, '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
                if (!activeChargeRecord.endTime) {
                    let msg = `${
                        activeChargeRecord.chargeCode == 'LANQ' ? '撤桥' : '结束'
                    }时间不能为空！`
                    this.$alert(msg, '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
            } else {
                if (!activeChargeRecord.chargeData) {
                    this.$alert('收费数据不能为空', '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
                if (activeChargeRecord.chargeData <= 0) {
                    this.$alert('收费数据必须大于0！', '提示', {
                        type: 'error',
                        center: true,
                    })
                    activeChargeRecord.chargeData = ''
                    return false
                }
            }

            if (activeChargeRecord.startTime && activeChargeRecord.endTime) {
                let msg = '开始时间不能大于或者等于结束时间！'
                if (activeChargeRecord.chargeCode == 'LANQ') {
                    msg = '接桥时间不能大于或者等于撤桥时间！'
                }
                if (
                    new Date(activeChargeRecord.startTime).getTime() >=
                    new Date(activeChargeRecord.endTime).getTime()
                ) {
                    this.$alert(msg, '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
            }

            if (
                activeChargeRecord.afterStartTime &&
                activeChargeRecord.afterEndTime &&
                new Date(activeChargeRecord.afterStartTime).getTime() >
                    new Date(activeChargeRecord.afterEndTime).getTime()
            ) {
                this.$alert('航后开始时间不能超过航后结束时间！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            return true
        },
        chargeRecordSave(activeChargeRecord) {
            if (!this.recordVerify(activeChargeRecord)) {
                return false
            }

            if (activeChargeRecord.chargeCode) {
                let charge = _.find(this.chargeArr, { code: activeChargeRecord.chargeCode })
                this.chargeRecordShow = false

                activeChargeRecord.chargeCode = charge.code
                activeChargeRecord.chargeName = charge.name
                activeChargeRecord.unit = charge.unit

                let startStaffObj =
                    _.find(this.userDeptLists, { id: activeChargeRecord.startStaffId }) || {}
                let endStaffObj =
                    _.find(this.userDeptLists, {
                        id: activeChargeRecord.endStaffId,
                    }) || {}
                let operatorObj =
                    _.find(this.userDeptLists, {
                        id: activeChargeRecord.operatorId,
                    }) || {}
                let startUserObj =
                    _.find(this.userDeptLists, {
                        id: activeChargeRecord.startUserId,
                    }) || {}

                activeChargeRecord.startStaffName = startStaffObj.name || ''
                activeChargeRecord.endStaffName = endStaffObj.name || ''
                activeChargeRecord.operatorName = operatorObj.name || ''
                activeChargeRecord.startUserName = startUserObj.name || ''

                if (this.activeChargeRecordType == 'edit') {
                    this.chargeRecords[this.activeChargeRecordIndex] = activeChargeRecord
                    this.tableKey++
                    return
                }
                this.chargeRecords.push(activeChargeRecord)
                return true
            } else {
                this.$alert('收费项不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
        },
        editChargeRecord({ row, $index }) {
            this.activeChargeRecordType = 'edit'
            this.activeChargeRecordIndex = $index
            this.chargeRecordShow = true
            this.activeChargeRecord = _.cloneDeep(row)
        },
        delChargeRecord({ row, $index }) {
            this.chargeRecords.splice($index, 1)
        },
        save() {
            if (!this.dataVerify()) {
                return
            }

            if (this.listData.chargeBillConfigCode == 'QZSB') {
                this.chargeRecords = []
                if (
                    this.QZSBrecords1.startTime ||
                    this.QZSBrecords1.endTime ||
                    this.QZSBrecords1.operatorId
                ) {
                    this.QZSBrecords1.chargeCode = 'QZDY'
                    if (!this.chargeRecordSave(this.QZSBrecords1)) {
                        return
                    }
                }
                if (
                    this.QZSBrecords2.startTime ||
                    this.QZSBrecords2.endTime ||
                    this.QZSBrecords2.operatorId
                ) {
                    this.QZSBrecords2.chargeCode = 'QZKT'
                    if (!this.chargeRecordSave(this.QZSBrecords2)) {
                        return
                    }
                }
            }

            let activeChargeBill = _.find(this.chargeBillArr, {
                code: this.listData.chargeBillConfigCode,
            })
            let url =
                this.pageType == 'boarding-bridge'
                    ? `/boarding-bridge-charge-record/saveChargeRecordAndChargeBillIsExists?flightId=${this.activeFlight.flightId}&chargeBillConfigCode=${activeChargeBill.code}`
                    : `/charge-record/saveChargeAndChargeBillIsExists?flightId=${this.activeFlight.flightId}&chargeBillConfigCode=${activeChargeBill.code}`

            if (this.rowData.id) {
                url += `&chargeBillId=${this.rowData.id}`
            }

            let supplementRecords = []
            if (!this.rowData) {
                this.supplementArr.map((list) => {
                    supplementRecords.push({
                        flightId: this.activeFlight.flightId,
                        type: list.params.type,
                        supplementCode: list.code,
                        supplementTitle: list.name,
                        valueTitle: list.valueTitle,
                        valueCode: list.valueCode,
                        chargeBillId: this.rowData.id,
                    })
                })
            }

            let charge = {
                chargeRecordList: this.chargeRecords,
                flightSupplementInfoList: supplementRecords,
                aircraftNo: this.activeFlight.aircraftNo,
                seat: this.activeFlight.seat,
            }
            this.$axios.post(url, charge).then((res) => {
                this.listShow = false
                this.$alert(res.msg, '提示', {
                    type: 'success',
                    center: true,
                })
                this.$emit('update')
            })
        },
        dataVerify() {
            if (!this.activeFlight.flightId) {
                this.$alert('航班号不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.chargeBillConfigCode) {
                this.$alert('收费单不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            // if (this.chargeRecords.length == 0) {
            //     this.$alert('收费项不能为空！', '提示', {
            //         type: 'error',
            //         center: true,
            //     })
            //     return false
            // }
            return true
        },
        chargeBillChange(type) {
            let charge = _.cloneDeep(
                _.find(this.chargeBillArr, { code: this.listData.chargeBillConfigCode })
            )
            if (!charge) {
                if (type == 'new') {
                    this.$alert('当前的收费单没有新增权限！', '提示', {
                        type: 'error',
                        center: true,
                    })
                    this.listShow = false
                    return
                }
                this.chargeArr = []
                return
            }

            this.chargeArr = charge.chargeRecordConfigs || []
            charge.supplementInfoConfigs.map((list) => {
                list.params = JSON.parse(list.params)
            })

            this.supplementArr = _.cloneDeep(_.sortBy(charge.supplementInfoConfigs || [], 'sort'))

            // this.supplementArr = _.cloneDeep(charge.supplementInfoConfigs || [])
        },
        flightNoHandle(e) {
            this.$refs.ref_flightNo.blur()
            let time = this.getTimeByFormat(new Date(), 'YY-MM-DD')
            this.flight_time = [time + ' 00:00:00', time + ' 23:59:59']
            this.flight_no = ''
            this.flight_seat = ''
            this.flightNo_aircraftNo = ''
            this.flightArr = []
            this.flightNoShow = true
        },
        flighNoSearch() {
            if (!this.flight_time) {
                this.$alert('时间段选择不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.$axios
                .get('/flight/findAllByScheduleTimeAndFlightNoLike', {
                    params: {
                        startTime: this.flight_time[0],
                        endTime: this.flight_time[1],
                        params: this.flight_no,
                        seat: this.flight_seat,
                        aircraftNo: this.flightNo_aircraftNo,
                    },
                })
                .then((res) => {
                    this.flightArr = res.data
                })
        },
        flightNoDbHandle(item) {
            this.activeFlight = item
            this.flightNoShow = false
        },
        saveSupplement(item) {
            if (item.params.type == 2) {
                let option = _.find(item.params.selects, { code: item.valueCode })
                item.valueTitle = option.describe
            }
            if (item.params.type == 3) {
                let title = []
                let code = []
                item.valueCode.map((list) => {
                    let option = _.find(item.params.selects, { code: list })
                    title.push(option.describe)
                    code.push(option.code)
                })
                item.valueCode = code.join(',')
                item.valueTitle = title.join(',')
            }
        },
    },
}
</script>