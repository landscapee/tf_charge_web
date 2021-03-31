<template>
    <div id="project" class="rightBoxContent">
        <div class="topBox">
            <ul class="navBox">
                <li>
                    <div></div>
                    <div class="mid one">{{flagNav?flagNav.name:'收费记录'}}</div>
                    <div></div>
                </li>
            </ul>
            <!-- <el-button type="primary" icon="el-icon-plus" size="mini" @click="edit('add')">新增</el-button> -->
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
                <!-- <el-button type="primary">导出excel</el-button>
                <el-button type="primary">发送财务</el-button> -->
                <el-button type="primary" @click="approvalSelect">发送审批</el-button>
                <el-button type="primary" @click="handleLists">刷新</el-button>
            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <el-table :data="lists" border stripe style="width: 100%" :max-height="maxHeight" :highlight-current-row="true" @selection-change="listSelectionChange">
                    <el-table-column label="序号" width="60" align="center">
                        <template slot-scope="scope">
                            {{(submitData.current-1)*submitData.size+scope.$index+1}}
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="chargeBill.flightNo" label="航班号"></el-table-column>
                    <!-- <el-table-column prop="chargeDataSource.name" label="数据源">
                        <template slot-scope="scope">
                            {{scope.row.chargeDataSource?(scope.row.chargeDataSource.name||scope.row.chargeDataSource.code):''}}
                        </template>
                    </el-table-column> -->
                    <el-table-column label="收费项">
                        <template slot-scope="scope">
                            {{scope.row.chargeDataSource&&scope.row.chargeDataSource.chargeConfig?scope.row.chargeDataSource.chargeConfig.name:''}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="chargeData" label="收费数据"></el-table-column>
                    <el-table-column label="单位">
                        <template slot-scope="scope">
                            {{getName(scope.row.chargeDataSource&&scope.row.chargeDataSource.chargeConfig?scope.row.chargeDataSource.chargeConfig.unit:'',unitLists,'name')}}
                        </template>
                    </el-table-column>

                    <el-table-column label="航空公司" align="center">
                        <template slot-scope="scope">
                            <img class="signBox" :src="getSingSrc(scope.row.chargeBill,'hkgs')" alt="">
                        </template>
                    </el-table-column>
                    <el-table-column label="操作人员" align="center">
                        <template slot-scope="scope">
                            <img class="signBox" :src="getSingSrc(scope.row.chargeBill,'czry')" alt="">
                        </template>
                    </el-table-column>
                    <el-table-column label="机组人员" align="center">
                        <template slot-scope="scope">
                            <img class="signBox" :src="getSingSrc(scope.row.chargeBill,'jzry')" alt="">
                        </template>
                    </el-table-column>

                    <el-table-column prop="operatorName" label="操作人"></el-table-column>
                    <el-table-column label="时间" width="180">
                        <template slot-scope="scope">
                            {{getTimeByFormat(scope.row.startTime,'YY-MM-DD hh:mm:ss')}}<br />
                            {{getTimeByFormat(scope.row.endTime,'YY-MM-DD hh:mm:ss')}}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" align="center" v-if="!searchDel" class-name="optBox">
                        <template slot-scope="scope">
                            <el-button type="text" title="审批" @click="approval([scope.row])" :disabled="scope.row.approvalStatus=='PASS'">审批</el-button>
                            <el-button type="text" title="编辑" @click="edit('edit',scope.row)">编辑</el-button>
                            <el-button type="text" title="删除" @click="del(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="submitData.current" :page-sizes="[10,20, 30, 50, 100]" :page-size="submitData.size" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                </div>
            </div>
        </div>
        <edit-list ref="ref_editList" @update="update"></edit-list>
    </div>

</template>

<script>
import EditList from './components/editList'
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
            selections: [],
        }
    },
    components: {
        'edit-list': EditList,
    },
    created() {},
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
            this.getUnitLists()
        }
        this.maxHeight = $('.tableBox').height() - 72
    },
    methods: {
        inIframeInit(data) {
            sessionStorage.setItem('token', data.token)
            this.getUnitLists()
        },
        handleLists() {
            this.lists = []
            let data = {
                current: 1,
                size: 20,
                params: null,
                deleted: false,
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
                .get('/charge-record/findChargeRecordWhitPage', {
                    params: data,
                })
                .then((res) => {
                    console.log(res)
                    this.lists = res.data.records
                    this.total = res.data.total
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
        approval(data) {
            if (!data || data.length == 0) {
                this.$alert('审核内容不能为空', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.$confirm('确定审批?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios
                    .post('/charge-record/approval?approvalStatus=PASS', data)
                    .then((res) => {
                        this.update()
                        this.$alert(res.msg, '提示', {
                            type: 'success',
                            center: true,
                        })
                    })
            })
        },
        approvalSelect() {
            let arrs = this.selections.filter((list) => {
                return list.approvalStatus == 'PASS'
            })
            if (arrs.length > 0) {
                this.$alert('已审批的不能再次审批！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.approval(this.selections)
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
                    this.handleLists()
                })
        },
        getName(item, lists, key) {
            let obj = _.find(lists, { code: item })
            return obj ? obj[key] : item
        },
        listSelectionChange(val) {
            this.selections = val
        },
        getSingSrc(row, type) {
            if (row) {
                let obj = _.find(row.chargeBillSigns, { type: type })
                return obj ? obj.content : ''
            }
            return ''
        },
    },
}
</script>