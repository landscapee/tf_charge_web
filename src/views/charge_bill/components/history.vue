<template>
    <div>
        <el-dialog :visible.sync="listShow" id="addTask" center width="800px" :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>{{listData.chargeDataSource&&listData.chargeDataSource.chargeConfig?listData.chargeDataSource.chargeConfig.name:''}}修改历史记录</span>
                <i class="el-icon-circle-close" @click="listShow=false"></i>
            </div>
            <el-table :data="historyLists" style="width: 100%">
                <el-table-column type="index" label="序号" width="100" align="center" class-name="indexTd">
                    <template slot-scope="scope">
                        {{(pageNo-1)*pageSize+scope.$index+1}}
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="date" label="更改后">
                <template slot-scope="scope">
                    <div v-for="ucode in scope.row.ucodes" :key="ucode">{{names[ucode]}}:{{getValue(scope.row,ucode)}}</div>
                </template>
            </el-table-column> -->
                <el-table-column prop="reviser" label="更改人"></el-table-column>
                <el-table-column prop="updateTime" label="更改时间">
                    <template slot-scope="scope">
                        <div>{{getTimeByFormat(scope.row.updateTime,'hh:mm:ss(DD)')}}</div>
                    </template>
                </el-table-column>

                <el-table-column label="操作方式">
                    <template slot-scope="scope">
                        <div>{{scope.row.method=='update'?'修改':'删除'}}</div>
                    </template>
                </el-table-column>
                <el-table-column label="备注">
                    <template slot-scope="scope">
                        <div>{{scope.row.remark}}</div>
                    </template>
                </el-table-column>
                <!--  -->
                <el-table-column label="操作" align="center" class-name="optBox" width="160">
                    <template slot-scope="scope">
                        <el-button type="text" title="详情" @click="look(scope)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="paginationBox">
                <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="pageNo" :page-sizes="[10,20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
            </div>

        </el-dialog>

        <el-dialog :visible.sync="rowShow" id="addTask" class="hisDeBox" center width="420px" :show-close="false">
            <table>
                <template v-if="rowData.chargeCode=='LANQ'">
                    <tr>
                        <td width="80">接桥时间:</td>
                        <td>{{getTimeByFormat(rowData.startTime,'YY-MM-DD hh:mm:ss')}}</td>
                    </tr>
                    <tr>
                        <td>撤桥时间:</td>
                        <td>{{getTimeByFormat(rowData.endTime,'YY-MM-DD hh:mm:ss')}}</td>
                    </tr>
                    <tr>
                        <td>设备号:</td>
                        <td>{{rowData.deviceCode}}</td>
                    </tr>
                    <tr>
                        <td>航后开始:</td>
                        <td>{{getTimeByFormat(rowData.afterStartTime,'YY-MM-DD hh:mm:ss')}}</td>
                    </tr>
                    <tr>
                        <td>航后结束:</td>
                        <td>{{getTimeByFormat(rowData.afterEndTime,'YY-MM-DD hh:mm:ss')}}</td>
                    </tr>
                </template>
                <template v-else>
                    <tr v-if="rowData.unit != '秒'">
                        <td width="80">收费数据:</td>
                        <td>{{rowData.chargeData}}</td>
                    </tr>
                    <tr v-if="rowData.unit == '秒'">
                        <td>开始时间:</td>
                        <td>{{getTimeByFormat(rowData.startTime,'YY-MM-DD hh:mm:ss')}}</td>
                    </tr>
                    <tr v-if="rowData.unit == '秒'">
                        <td>结束时间:</td>
                        <td>{{getTimeByFormat(rowData.endTime,'YY-MM-DD hh:mm:ss')}}</td>
                    </tr>
                </template>
                <tr>
                    <td>备注:</td>
                    <td>{{rowData.remark}}</td>
                </tr>
            </table>

        </el-dialog>
    </div>

</template>

<script>
export default {
    data() {
        return {
            rowShow: false,
            listShow: false,
            listData: {},
            pageSize: 10,
            pageNo: 1,
            total: 0,
            historyLists: [],
            names: {
                ustartTime: '开始时间',
                uendTime: '',
                uchargeData: '',
                udeviceCode: '设备号',
            },
            rowData: {},
        }
    },
    methods: {
        initData(data) {
            this.listShow = true
            this.listData = data
            console.log(data)
            this.options = []
            this.loadHistory()
        },
        loadHistory() {
            this.$axios
                .get('/charge-record-history/findChargeRecordHistoryByChargeRecordIdWithPage', {
                    params: {
                        chargeRecordId: this.listData.id,
                        current: this.pageNo,
                        size: this.pageSize,
                    },
                })
                .then((res) => {
                    this.total = res.data.total

                    res.data.records.map((record) => {
                        let ucodes = []
                        _.forIn(record, (value, key) => {
                            if (this.names[key] && value) {
                                ucodes.push(key)
                            }
                        })
                        record.ucodes = ucodes
                    })

                    this.historyLists = res.data.records

                    console.log(this.historyLists)
                })
        },
        pageBC(pageNo) {
            this.pageNo = pageNo
            this.loadHistory()
        },
        handleSizeChange(pageSize) {
            this.pageSize = pageSize
            this.loadHistory()
        },
        look({ row }) {
            this.rowShow = true
            this.rowData = row
            // this.$emit('look', row)
        },
    },
}
</script>
<style lang="scss">
.hisDeBox {
    table {
        tr {
            height: 30px;
        }
    }
}
</style>
