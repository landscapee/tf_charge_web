<template>
    <div>

        <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>新增</span>
                <i class="el-icon-circle-close" @click="listShow=false"></i>
            </div>
            <el-form label-position="right" label-width="90px" ref="listData">
                <el-form-item label="航班号" required>
                    <el-input v-model="activeFlight.flightNo" placeholder="航班号" @focus="flightNoHandle" ref="ref_flightNo"></el-input>
                </el-form-item>
                <el-form-item label="收费单" required>
                    <el-select v-model="listData.chargeBillConfigCode" filterable clearable placeholder="请选择" @change="chargeBillChange">
                        <el-option v-for="item in chargeBillArr" :key="item.id" :label="item.name" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="收费项" required>
                    <el-select v-model="listData.chargeCode" filterable clearable placeholder="请选择">
                        <el-option v-for="item in chargeArr" :key="item.id" :label="item.code+'-'+item.name+'('+item.unit+')'" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="收费数据" required v-if="!timeShow">
                    <el-input v-model="listData.chargeData" placeholder="收费数据"></el-input>
                </el-form-item>
                <el-form-item label="开始时间" required v-if="timeShow">
                    <el-date-picker v-model="listData.startTime" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>

                </el-form-item>
                <el-form-item label="结束时间" required v-if="timeShow">
                    <el-date-picker v-model="listData.endTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="footer">
                <el-button @click="listShow=false">取 消</el-button>
                <el-button type="primary" @click="save">提交</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="flightNoShow" id="addTask" center :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>航班号选择</span>
                <i class="el-icon-circle-close" @click="flightNoShow=false"></i>
            </div>
            <div class="flightNoBox">
                <el-form label-position="right" label-width="90px" ref="listData">
                    <el-form-item label="时间范围">
                        <el-date-picker v-model="flightNo_time" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="航班号">
                        <el-input v-model="flightNo_no" placeholder="航班号"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="flighNoSearch">搜 索</el-button>
                    </el-form-item>

                </el-form>
                <div class="flightNo-check">
                    <p>航班选择列表-双击确定</p>
                    <ul>
                        <li v-for="(item,idx) in flightArr" :key="idx" @dblclick="flightNoDbHandle(item)">
                            {{item.flightNo}}/{{item.successionFlightNo}}&nbsp;&nbsp;
                            计:{{getTimeByFormat(item.scheduleTime,'hh:mm(DD)')}}&nbsp;&nbsp;
                            实:{{getTimeByFormat(item.actualTime,'hh:mm(DD)')}}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- <div slot="footer" class="footer">
                <el-button @click="flightNoShow=false">取 消</el-button>
            </div> -->
        </el-dialog>
    </div>

</template>

<script>
export default {
    data() {
        return {
            listShow: false,
            activeFlight: {},
            listData: {},
            flightArr: [],
            chargeBillArr: [],
            chargeArr: [],

            flightNoShow: false,
            flightNo_time: [],
            flightNo_no: '',
            timeShow: false,
        }
    },
    mounted() {
        this.getChargeBillArr()
    },
    watch: {
        'listData.chargeCode': function (val) {
            this.listData.chargeData = ''
            this.timeShow = val == 'LANQ' || val == 'QZDY' || val == 'QZKT' ? true : false
        },
    },
    methods: {
        initData() {
            this.listShow = true
            this.listData = {
                chargeBillConfigCode: '',
                chargeCode: '',
                chargeData: '',
                startTime: '',
                endTime: '',
            }
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }
            let charge = _.find(this.chargeArr, { code: this.listData.chargeCode })
            let data = {
                flightId: this.activeFlight.flightId,
                flightNo: this.activeFlight.flightNo,
                unit: charge.unit,
                ...this.listData,
            }
            this.$axios
                .post('/charge-record/saveChargeRecordAndChargeBillIsExists', data)
                .then((res) => {
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
            if (!this.listData.chargeCode) {
                this.$alert('收费项不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.chargeData) {
                this.$alert('收费数据不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            return true
        },
        getChargeBillArr() {
            this.$axios.get('/charge-bill-config/findChargeBillConfig').then((res) => {
                this.chargeBillArr = res.data
            })
        },
        chargeBillChange() {
            this.listData.chargeCode = ''
            this.listData.chargeData = ''

            this.$axios
                .get(
                    '/charge-config/findAllByChargeBillConfigCode?chargeBillConfigCode=' +
                        this.listData.chargeBillConfigCode
                )
                .then((res) => {
                    this.chargeArr = res.data
                })
        },
        flightNoHandle(e) {
            this.$refs.ref_flightNo.blur()

            let time = this.getTimeByFormat(new Date(), 'YY-MM-DD')
            this.flightNo_time = [time + ' 00:00:00', time + ' 23:59:59']
            this.flightNo_no = ''
            this.flightNoShow = true
        },
        flighNoSearch() {
            if (!this.flightNo_time) {
                this.$alert('时间段选择不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.$axios
                .get('/flight/findAllByScheduleTimeAndFlightNoLike', {
                    params: {
                        startTime: this.flightNo_time[0],
                        endTime: this.flightNo_time[1],
                        params: this.flightNo_no,
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
    },
}
</script>