<template>
    <div id="project" class="rightBoxContent">
        <div class="topBox">
            <ul class="navBox">
                <li>
                    <div></div>
                    <div class="mid one">{{flagNav?flagNav.name:'收费保障'}}</div>
                    <div></div>
                </li>
            </ul>
        </div>
        <div class="searchBox">
            <div class="leftBox">
                <!-- <div>
                    <el-date-picker v-model="searchTime" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" @change="handleLists" :default-time="['00:00:00', '23:59:59']"></el-date-picker>
                </div> -->

                <div>
                    <ul class="radioApproval">
                        <li :class="searchReport===0?'active':''" @click="searchReport=searchReport===0?'':0">未上报</li>
                        <li :class="searchReport===1?'active':''" @click="searchReport=searchReport===1?'':1">已上报</li>
                    </ul>
                </div>
                <div>
                    <el-input placeholder="机位查询" v-model="searchSeat" @keyup.enter.native="handleLists" style="width:100px" />
                </div>
                <div>
                    <el-input placeholder="机尾号查询" v-model="searchAircraftNo" @keyup.enter.native="handleLists" style="width:100px" />
                </div>
                <div>
                    <el-input placeholder="航班号或航司查询" v-model="searchStr" @keyup.enter.native="handleLists" />
                </div>
                <div v-show="unsendCount>0">
                    <el-button type="danger" @click="getUnSendHandle">昨日未上报{{unsendCount}}个</el-button>
                </div>
            </div>
            <div class="rightBox">
                <el-button type="primary" @click="handleLists">刷新</el-button>
            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <el-table :data="lists" border stripe style="width: 100%" :max-height="maxHeight" :highlight-current-row="true" :cell-class-name="getCellClassname">
                    <el-table-column label="序号" width="60" align="center">
                        <template slot-scope="scope">
                            {{(submitData.current-1)*submitData.size+scope.$index+1}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="flightNo" label="航班号" width="160">
                        <template slot-scope="scope">
                            {{getFlightNo(scope)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="movement" label="进/离">
                        <template slot-scope="scope">
                            {{getMovement(scope)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="aircraftNo" label="机尾号"></el-table-column>
                    <el-table-column prop="aircraftType" label="机型"></el-table-column>
                    <el-table-column prop="flightType" label="航班类型">
                        <template slot-scope="scope">
                            {{getflightTpye[scope.row.flightType]}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="seat" label="机位"></el-table-column>
                    <el-table-column prop="sta" label="计划到达" width='120'>
                        <template slot-scope="scope">
                            {{getTimeByFormat(scope.row.sta,'hh:mm(DD)')}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="ata" label="实际到达">
                        <template slot-scope="scope">
                            {{getTimeByFormat(scope.row.ata,'hh:mm(DD)')}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="std" label="计划起飞">
                        <template slot-scope="scope">
                            {{getTimeByFormat(scope.row.std,'hh:mm(DD)')}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="atd" label="实际起飞">
                        <template slot-scope="scope">
                            {{getTimeByFormat(scope.row.atd,'hh:mm(DD)')}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="approve" label="收费项审核">
                        <template slot-scope="scope">
                            <div style="height:50px;line-height:50px;">
                                {{scope.row.approveCount?scope.row.approveCount:0}}/{{scope.row.totalCount?scope.row.totalCount:0}}
                            </div>

                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" align="center" class-name="optBox">
                        <template slot-scope="scope">
                            <el-button type="text" title="详情" @click="details(scope)">详情</el-button>
                            <el-button type="text" title="上报" @click="report(scope)" :disabled="submitData.status===1||scope.row.approveMap.noSendCount === 0">上报</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="submitData.current" :page-sizes="[10,20, 30, 50, 100]" :page-size="submitData.size" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                </div>
            </div>
        </div>
        <row-details ref="ref_rowDetails" />
    </div>

</template>

<script>
import { mapGetters } from 'vuex'
import RowDetails from './components/row-details'
export default {
    props: ['power', 'flagNav'],
    components: {
        'row-details': RowDetails,
    },
    data() {
        return {
            searchTime: '',
            searchStr: '',
            searchReport: 0,
            searchSeat: '',
            searchAircraftNo: '',
            lists: [],
            submitData: {
                current: 1,
                size: 20,
            },
            total: 0,
            maxHeight: 1000,
            userData: {},
            selections: [],
            unsendCount: 0,
            dataTimer: null,
            unsendAlert: false,
        }
    },
    computed: {
        ...mapGetters(['getflightTpye']),
    },
    watch: {
        searchReport: function () {
            this.handleLists()
        },
    },
    mounted() {
        if (top != self) {
            window.addEventListener(
                'message',
                (event) => {
                    this.inIframeInit(event.data)
                },
                false
            )
        } else {
            this.handleLists()
            if (this.dataTimer) {
                clearInterval(this.dataTimer)
                this.dataTimer = null
            }
            this.getunSendCount()
            this.dataTimer = setInterval(() => {
                this.getunSendCount()
            }, 5 * 60 * 1000)
            this.userData = JSON.parse(sessionStorage.userData)
        }
        this.maxHeight = $('.tableBox').height() - 72
    },
    detroyed() {
        clearInterval(this.dataTimer)
    },
    methods: {
        inIframeInit(data) {
            if (data.token) {
                sessionStorage.setItem('token', data.token)
                this.getUserData(data.token)
                this.handleLists()
                if (this.dataTimer) {
                    clearInterval(this.dataTimer)
                    this.dataTimer = null
                }
                this.getunSendCount()
                this.dataTimer = setInterval(() => {
                    this.getunSendCount()
                }, 5 * 60 * 1000)
            }
        },
        getUserData(token) {
            this.$axios({
                method: 'post',
                url: '/sso/login/userInfo',
                dataType: 'text',
                data: token,
                async: true,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
            }).then((res) => {
                this.userData = res.data
                sessionStorage.setItem('userData', JSON.stringify(_.omit(res.data, 'token')))
            })
        },
        reportSelect() {
            if (this.selections.length == 0) {
                this.$alert('还未勾选收费单！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.approval(this.selections, 'arrs')
        },
        report({ row }) {
            if (row.approveMap.noSendCount == 0) {
                this.$alert('当前没有审核的数据不能上报！', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }

            if (!row.totalCount) {
                this.$alert('当前没有收费项，不能上报！', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            // || row.totalCount != row.approveCount
            if (row.approveCount === 0) {
                this.$alert('当前有未审核收费项，不能上报！', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            this.$confirm('确定上报?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios.post('/flightReport/report?flightId=' + row.flightId).then((res) => {
                    this.update()
                    this.$alert(res.msg, '提示', {
                        type: 'success',
                        center: true,
                    })
                })
            })
        },
        details({ row }) {
            this.$refs.ref_rowDetails.initData(row)
        },
        listSelectionChange(val) {
            this.selections = val
        },
        getFlightNo({ row }) {
            let flgihtNo_A = (row.movement == 'A' ? row.flightNo : row.relateFlightNo) || '-'
            let flgihtNo_D = (row.movement == 'D' ? row.flightNo : row.relateFlightNo) || '-'

            return `${flgihtNo_A}/${flgihtNo_D}`
        },
        getMovement({ row }) {
            let flgihtNo_A = row.movement == 'A' ? row.flightNo : row.relateFlightNo
            let flgihtNo_D = row.movement == 'D' ? row.flightNo : row.relateFlightNo

            if (flgihtNo_A && flgihtNo_D) {
                return `进/离`
            }
            return row.movement == 'A' ? '进' : '离'
        },
        handleLists() {
            this.lists = []
            let data = {
                current: 1,
                size: 20,
            }

            // if (this.searchTime) {
            //     data.beginTime = this.searchTime[0]
            //     data.endTime = this.searchTime[1]
            // }

            if (this.searchStr) {
                data.param = this.searchStr
            }
            if (this.searchSeat) {
                data.seat = this.searchSeat
            }
            if (this.searchAircraftNo) {
                data.aircraftNo = this.searchAircraftNo
            }
            data.status = this.searchReport
            data.yesterdayReport = false

            this.findAllFlightReport(data)
        },
        getunSendCount() {
            let data = {
                current: 1,
                size: 20,
                status: 0,
            }

            data.yesterdayReport = true

            this.findAllFlightReport(data, 'getCount')
        },
        getUnSendHandle() {
            let data = {
                current: 1,
                size: 20,
            }

            // if (this.searchTime) {
            //     data.beginTime = this.searchTime[0]
            //     data.endTime = this.searchTime[1]
            // }
            this.searchStr = ''
            this.searchSeat = ''
            this.searchAircraftNo = ''
            data.status = 0
            data.yesterdayReport = true
            this.findAllFlightReport(data)
        },
        getLists(data) {
            this.findAllFlightReport(data)
        },
        findAllFlightReport(data, getCount) {
            this.submitData = data
            this.$axios
                .get('/flightReport/findAllFlightReport', {
                    params: data,
                })
                .then((res) => {
                    this.lists = res.data.records
                    this.total = res.data.total
                    if (getCount) {
                        let nowTime = new Date().getTime()
                        let startTime = new Date(
                            this.getTimeByFormat(nowTime, 'YY-MM-DD') + ' 08:00:00'
                        )
                        let endTime = new Date(
                            this.getTimeByFormat(nowTime, 'YY-MM-DD') + ' 09:20:00'
                        )
                        if (this.unsendCount != res.data.total && this.unsendAlert) {
                            this.$msgbox.close()
                            this.unsendAlert = false
                        }
                        this.unsendCount = res.data.total
                        if (
                            !this.unsendAlert &&
                            this.unsendCount > 0 &&
                            nowTime >= startTime &&
                            nowTime <= endTime
                        ) {
                            this.unsendAlert = true
                            this.$msgbox.alert(
                                `昨日还有${this.unsendCount}个航班未上报，财务要求9点前完成00点之前执行的收费数据上报。`,
                                '提示',
                                {
                                    type: 'warning',
                                    center: true,
                                    callback: () => {
                                        this.unsendAlert = false
                                    },
                                }
                            )
                        }

                        return
                    }
                })
        },
        update() {
            this.getLists(this.submitData)
        },
        handleSizeChange(pageSize) {
            this.submitData.current = 1
            this.submitData.size = pageSize
            this.getLists(this.submitData)
        },
        pageBC(pageNo) {
            this.submitData.current = pageNo
            this.getLists(this.submitData)
        },
        edit(type, data) {
            this.$refs.ref_editList.initData(type, _.cloneDeep(data))
        },
        del(data) {
            this.$confirm('确定删除该数据?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios
                    .get('/charge-bill-config/deleteById', {
                        params: {
                            id: data.id,
                        },
                    })
                    .then((res) => {
                        this.update()
                        this.$alert(res.msg, '提示', {
                            type: 'success',
                            center: true,
                        })
                    })
            })
        },
        getCellClassname({ row, column, rowIndex, columnIndex }) {
            if (column.property == 'approve') {
                let approveMap = row.approveMap

                if (approveMap.noSendCount > 0) {
                    return 'passApprove'
                } else if (row.totalCount > approveMap.sendCount) {
                    return 'noApprove'
                }

                // if (
                //     row.approveCount > 0 &&
                //     row.totalCount > 0 &&
                //     row.totalCount == row.approveCount
                // ) {
                //     return 'passApprove'
                // } else {
                //     return 'noApprove'
                // }
            }
        },
        getReport({ row }) {
            return row.approveMap.noSendCount === 0
        },
    },
}
</script>