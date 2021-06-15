<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="1000px" :show-close="false">
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
            <el-table-column prop="date" label="更改后">
                <template slot-scope="scope">
                    <div v-for="ucode in scope.row.ucodes" :key="ucode">{{names[ucode]}}:{{getValue(scope.row,ucode)}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="date" label="更改前">
                <template slot-scope="scope">
                    <div v-for="ucode in scope.row.ucodes" :key="ucode">{{names[ucode]}}:{{scope.row[ucode]}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更改时间">
                <template slot-scope="scope">
                    <div>{{getTimeByFormat(scope.row.updateTime,'hh:mm:ss(DD)')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="reviser" label="更改人"></el-table-column>
        </el-table>
        <div class="paginationBox">
            <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="pageNo" :page-sizes="[10,20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
        </div>

    </el-dialog>
</template>

<script>
export default {
    data() {
        return {
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
        getValue(row, ucode) {
            let list = _.find(this.historyLists, { version: row.newVersion })
            if (!list) {
                let code = ucode.slice(1)
                return this.listData[code]
            } else {
                if (list[ucode]) {
                    return list[ucode]
                } else {
                    this.getValue(list, ucode)
                }
            }
        },
        pageBC(pageNo) {
            this.pageNo = pageNo
            this.loadHistory()
        },
        handleSizeChange(pageSize) {
            this.pageSize = pageSize
            this.loadHistory()
        },
    },
}
</script>
