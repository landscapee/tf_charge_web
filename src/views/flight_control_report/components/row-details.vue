<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>{{title}}</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-table :data="lists" border stripe style="width: 100%" :highlight-current-row="true" :span-method="objectSpanMethod" :cell-class-name="getCellClassname">
            <el-table-column prop="chargeBillConfigName" label="收费单"></el-table-column>
            <el-table-column prop="name" label="收费项"></el-table-column>
            <el-table-column prop="chargeData" label="收费数据">
                <template slot-scope="scope">
                    {{getChargeData(scope.row)}}
                </template>
            </el-table-column>
            <el-table-column prop="approvalStatus" label="审核状态">
                <template slot-scope="scope">
                    {{scope.row.approvalStatus=='PASS'?'已审核':'待审核'}}
                </template>
            </el-table-column>
        </el-table>
        <div style="height:25px"></div>
    </el-dialog>
</template>
<script>
export default {
    data() {
        return {
            listShow: false,
            lists: [],
            rowData: {},
            title: '',
        }
    },
    methods: {
        initData(row) {
            this.rowData = row
            this.listShow = true
            this.title = this.getFlightNo({ row }) + '详情'
            this.getData()
        },
        getData() {
            this.$axios
                .get('/charge-bill/findChargeBillWhitPageAndPc', {
                    params: {
                        flightId: this.rowData.flightId,
                        current: 1,
                        size: 20,
                        deleted: false,
                        linkedData: true,
                        orderBy: {},
                    },
                })
                .then((res) => {
                    let data = res.data.records || []
                    let arrs = []
                    data.map((list) => {
                        let chargeRecords = list.chargeRecords || []
                        chargeRecords.map((record) => {
                            record.chargeBillConfigName = list.chargeBillConfigName
                            record.name = record.chargeDataSource.chargeConfig.name
                        })
                        arrs = _.concat(arrs, chargeRecords)
                    })
                    this.lists = arrs
                })
        },
        getFlightNo({ row }) {
            let flgihtNo_A = (row.movement == 'A' ? row.flightNo : row.relateFlightNo) || '-'
            let flgihtNo_D = (row.movement == 'D' ? row.flightNo : row.relateFlightNo) || '-'
            return `${flgihtNo_A}/${flgihtNo_D}`
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                let arrs = _.filter(this.lists, { chargeBillId: row.chargeBillId })
                let index = _.findIndex(arrs, { id: row.id })
                console.log(row, index, arrs)
                if (arrs.length > 0 && index === 0) {
                    return {
                        rowspan: arrs.length,
                        colspan: 1,
                    }
                } else {
                    return {
                        rowspan: 0,
                        colspan: 0,
                    }
                }
            }
        },
        getChargeData(row) {
            if (row.unit == '秒') {
                return `${this.timeLength(parseInt(row.chargeData) * 1000)}`
            } else {
                return `${row.chargeData}${row.unit}`
            }
        },
        getCellClassname({ row, column, rowIndex, columnIndex }) {
            if (column.property == 'approvalStatus') {
                if (row.approvalStatus == 'PASS') {
                    return 'passApprove'
                } else {
                    return 'noApprove'
                }
            }
        },
    },
}
</script>
<style lang="scss" scoped>
</style>