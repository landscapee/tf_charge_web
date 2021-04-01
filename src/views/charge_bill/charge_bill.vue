<template>
    <div id="project" class="rightBoxContent">
        <div class="topBox">
            <ul class="navBox">
                <li>
                    <div></div>
                    <div class="mid one">{{flagNav.name}}</div>
                    <div></div>
                </li>
            </ul>
        </div>
        <div class="searchBox">
            <div class="leftBox">
                <!-- <div>
                    <el-date-picker v-model="searchTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']"></el-date-picker>
                </div> -->
                <el-select v-model="searchDel" placeholder="请选择" @change="handleLists">
                    <el-option label="正常" :value="false"></el-option>
                    <el-option label="已删除" :value="true"></el-option>
                </el-select>
                <div>
                    <el-input placeholder="请输入内容" v-model="searchStr" clearable @blur="handleLists" @keyup.enter.native="handleLists">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
            </div>
            <div class="rightBox">
                <el-button type="primary" @click="handleLists">刷新</el-button>
            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <!-- :span-method="arraySpanMethod" -->
                <el-table :data="lists" border stripe style="width: 100%" :max-height="maxHeight" :highlight-current-row="true">
                    <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod"></el-table-column>
                    <el-table-column prop="flightNo" label="航班号"></el-table-column>
                    <el-table-column prop="chargeBillConfigName" label="名称"></el-table-column>
                    <el-table-column label="航空公司" align="center">
                        <template slot-scope="scope">
                            <img class="signBox" :src="getSingSrc(scope.row,'hkgs')" alt="">
                        </template>
                    </el-table-column>
                    <el-table-column label="操作人员" align="center">
                        <template slot-scope="scope">
                            <img class="signBox" :src="getSingSrc(scope.row,'czry')" alt="">
                        </template>
                    </el-table-column>
                    <el-table-column label="机组人员" align="center">
                        <template slot-scope="scope">
                            <img class="signBox" :src="getSingSrc(scope.row,'jzry')" alt="">
                        </template>
                    </el-table-column>
                    <el-table-column label="收费记录" width="120" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="right" width="400" trigger="hover" popper-class="rightBox">
                                <el-table :data="scope.row.chargeRecords" border stripe>
                                    <el-table-column label="收费项">
                                        <template slot-scope="scope1">
                                            {{scope1.row.chargeDataSource&&scope1.row.chargeDataSource.chargeConfig?scope1.row.chargeDataSource.chargeConfig.name:''}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="chargeData" label="收费数据"></el-table-column>
                                    <el-table-column label="单位">
                                        <template slot-scope="scope1">
                                            {{getName(scope1.row.chargeDataSource&&scope1.row.chargeDataSource.chargeConfig?scope1.row.chargeDataSource.chargeConfig.unit:'',unitLists,'name')}}
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-button slot="reference" type="primary" size="mini" v-show="scope.row.chargeRecords&&scope.row.chargeRecords.length>0">查看</el-button>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="补充记录" width="120" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="right" width="400" trigger="hover" popper-class="rightBox">
                                <el-table :data="scope.row.flightSupplementInfos" border stripe>
                                    <el-table-column prop="supplementTitle" label="名称"></el-table-column>
                                    <el-table-column prop="valueCode" label="数据"></el-table-column>
                                    <el-table-column prop="supplementUnit" label="单位"></el-table-column>
                                    <el-table-column prop="valueTitle" label="描述"></el-table-column>
                                </el-table>
                                <el-button slot="reference" type="primary" size="mini" v-show="scope.row.flightSupplementInfos&&scope.row.flightSupplementInfos.length>0">查看</el-button>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="submitData.current" :page-sizes="[10,20, 30, 50, 100]" :page-size="submitData.size" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    props: ['power', 'flagNav'],
    data() {
        return {
            searchTime: '',
            searchStr: '',
            searchDel: false,
            lists: [],
            submitData: {
                current: 1,
                size: 20,
                params: null,
                deleted: false,
            },
            total: 0,
            maxHeight: 1000,
            unitLists: [],
        }
    },
    created() {
        this.handleLists()
    },
    mounted() {
        this.maxHeight = $('.tableBox').height() - 72
    },
    methods: {
        handleLists() {
            this.lists = []
            let data = {
                current: 1,
                size: 20,
                params: null,
                deleted: false,
                linkedData: true,
            }
            if (this.searchTime) {
                data.beginTime = this.searchTime[0]
                data.endTime = this.searchTime[1]
            }
            if (this.searchDel) {
                data.deleted = this.searchDel
            }
            if (this.searchStr) {
                data.params = this.searchStr
            }

            this.getLists(data)
        },
        getLists(data) {
            this.submitData = data
            this.$axios
                .get('/charge-bill/findChargeBillWhitPageAndPc', {
                    params: data,
                })
                .then((res) => {
                    this.lists = res.data.records
                    this.total = res.data.total
                    console.log(this.lists)
                    // this.loadData(res.data.records)
                })
        },
        loadData(data) {
            let records = []
            data.map((list) => {
                let chargeRecords = list.chargeRecords || []
                if (chargeRecords.length == 0) {
                    records.push({ data: list })
                } else {
                    chargeRecords.map((record) => {
                        let newData = _.omit(list, 'chargeRecords')
                        record.data = newData
                        record.rowspan = list.chargeRecords.length
                        records.push(record)
                    })
                }
            })
            this.lists = records
            console.log(this.lists)
        },
        arraySpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0 || columnIndex === 1 || columnIndex == 2) {
                if (rowIndex === 0) {
                    return {
                        rowspan: row.rowspan,
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
        indexMethod(index) {
            return (this.submitData.current - 1) * this.submitData.size + index + 1
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
                    .get('/charge-record/deleteById', {
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
        getUnitLists() {
            this.$axios
                .get('/data-dictionary/findDataDictionaryByCode', {
                    params: {
                        code: 'unit',
                    },
                })
                .then((res) => {
                    this.unitLists = res.data
                })
        },
        getName(item, lists, key) {
            let obj = _.find(lists, { code: item })
            return obj ? obj[key] : item
        },
        getSingSrc(row, type) {
            let obj = _.find(row.chargeBillSigns, { type: type })
            return obj ? obj.content : ''
        },
    },
}
</script>