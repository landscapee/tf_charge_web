<template>
    <div id="project" class="rightBoxContent">
        <div class="topBox">
            <ul class="navBox">
                <li>
                    <div></div>
                    <div class="mid one">{{flagNav?flagNav.name:'收费单'}}</div>
                    <div></div>
                </li>
            </ul>
        </div>
        <div class="searchBox">
            <div class="leftBox">
                <el-date-picker v-model="searchTime" type="date" placeholder="选择日期" @change="handleLists">
                </el-date-picker>
                <el-select v-model="searchDel" placeholder="请选择" @change="handleLists">
                    <el-option label="正常" :value="false"></el-option>
                    <el-option label="已删除" :value="true"></el-option>
                </el-select>
                <div>
                    <el-input placeholder="请输入内容" v-model="searchStr" clearable @keyup.enter.native="handleLists">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
            </div>
            <div class="rightBox">
                <el-button type="primary" @click="add">新增收费</el-button>
                <el-button type="primary" @click="send">发送</el-button>
                <el-button type="primary" @click="approvalSelect" v-show="powerData.charge_approval">批量审批</el-button>
                <el-button type="primary" @click="handleLists">刷新</el-button>
            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <!-- :span-method="arraySpanMethod" -->
                <el-table :data="lists" border stripe style="width: 100%" :max-height="maxHeight" :highlight-current-row="true" :row-class-name="getRowClass" @selection-change="listSelectionChange" :expand-row-keys="expends" row-key="id">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <div class="bill_expand">
                                <div class="bill_expand_Box" v-show="scope.row.chargeRecords&&scope.row.chargeRecords.length>0">
                                    <div class="title">收费数据</div>
                                    <el-table class="outtable" :data="scope.row.chargeRecords" border stripe style="width: 100%" cell-class-name="el-table__expanded-cell" :row-class-name="getRowName">
                                        <el-table-column label="收费项" align="center">
                                            <template slot-scope="scope1">
                                                {{scope1.row.chargeDataSource&&scope1.row.chargeDataSource.chargeConfig?scope1.row.chargeDataSource.chargeConfig.name:''}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="收费项编码" align="center">
                                            <template slot-scope="scope1">
                                                {{scope1.row.chargeDataSource&&scope1.row.chargeDataSource.chargeConfig?scope1.row.chargeDataSource.chargeConfig.code:''}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="deviceCode" label="设备号" align="center"></el-table-column>
                                        <el-table-column prop="chargeData" label="收费数据" align="center"></el-table-column>
                                        <el-table-column label="单位" align="center">
                                            <template slot-scope="scope1">
                                                {{getName(scope1.row.chargeDataSource&&scope1.row.chargeDataSource.chargeConfig?scope1.row.chargeDataSource.chargeConfig.unit:'',unitLists,'name')}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="航空公司" align="center" class-name="signBox">
                                            <template slot-scope="scope">
                                                <div v-for="(item,idx) in getSingList(scope.row,'hkgs')" :key="idx" class="signDiv">
                                                    <img :src="item.content" alt="">
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作人员" align="center" class-name="signBox">
                                            <template slot-scope="scope">
                                                <div v-for="(item,idx) in getSingList(scope.row,'czry')" :key="idx" class="signDiv">
                                                    <img class="signBox" :src="item.content" alt="">
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="机组人员" align="center" class-name="signBox">
                                            <template slot-scope="scope">
                                                <div v-for="(item,idx) in getSingList(scope.row,'jzry')" :key="idx" class="signDiv">
                                                    <img :src="item.content" alt="">
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="时间" width="200">
                                            <template slot-scope="scope1">
                                                <div>{{scope1.row.startTime?getTimeByFormat(scope1.row.startTime,'YY-MM-DD hh:mm:ss'):''}}</div>
                                                <div>{{getTimeByFormat(scope1.row.endTime,'YY-MM-DD hh:mm:ss')}}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" width="150" align="center" v-if="!searchDel&&(powerData.charge_edit||powerData.charge_delete||powerData.charge_approval)" class-name="optBox">
                                            <template slot-scope="scope1">
                                                <el-button type="text" title="审批" @click="approval(scope1.row)" :disabled="scope1.row.approvalStatus=='PASS'" v-show="powerData.charge_approval">审批</el-button>
                                                <el-button type="text" title="编辑" @click="edit('edit',scope1.row)" :disabled="scope1.row.approvalStatus=='PASS'" v-show="powerData.charge_edit">编辑</el-button>
                                                <el-button type="text" title="删除" @click="del(scope1.row)" :disabled="scope1.row.approvalStatus=='PASS'" v-show="powerData.charge_delete">删除</el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                                <div class=" bill_expand_Box1" v-show="scope.row.flightSupplementInfos&&scope.row.flightSupplementInfos.length>0">
                                    <div class="title">补充信息</div>
                                    <el-table class="outtable" :data="scope.row.flightSupplementInfos" border stripe style="width: 100%" row-class-name="expandRow" cell-class-name="el-table__expanded-cell">
                                        <el-table-column prop="valueTitle" label="名称" align="center"></el-table-column>
                                        <el-table-column prop="valueCode" label="数据" align="center"></el-table-column>
                                        <el-table-column label="操作" width="150" align="center" v-if="!searchDel&&powerData.charge_edit" class-name="optBox">
                                            <template slot-scope="scope1">
                                                <el-button type="text" title="编辑" @click="infoEdit(scope1.row)" v-show="powerData.charge_edit">编辑</el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>

                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="序号" width="100" align="center" class-name="indexTd">
                        <template slot-scope="scope">
                            {{(submitData.current-1)*submitData.size+scope.$index+1}}
                            <div v-show="scope.row.chargeRecords&&scope.row.chargeRecords.length>0">费</div>
                            <div v-show="scope.row.flightSupplementInfos&&scope.row.flightSupplementInfos.length>0">补</div>
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="chargeBillConfigName" label="名称"></el-table-column>
                    <el-table-column prop="flight.flightNo" label="航班号">
                        <template slot-scope="scope">
                            <div>{{scope.row.flight.flightNo}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="flight.aircraftNo" label="机尾号"></el-table-column>
                    <el-table-column prop="flight.seat" label="机位"></el-table-column>

                    <el-table-column label="汇总" width="120" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="right" trigger="hover" v-if="!scope.row.expandDefault">
                                <table class="sumTable" border="1">
                                    <tr>
                                        <td style="padding:10px 20px">单位</td>
                                        <td style="padding:10px 20px">值</td>
                                    </tr>
                                    <tr v-for="(value,key) in scope.row.sum" :key="key">
                                        <td style="padding:10px 20px">{{key}}</td>
                                        <td style="padding:10px 20px">{{value}}</td>
                                    </tr>
                                </table>
                                <el-button slot="reference" type="primary" size="mini" v-if="scope.row.sum&&JSON.stringify(scope.row.sum) != '{}'">查看</el-button>
                            </el-popover>
                            <span v-else>
                                {{getSumText(scope.row.sum)}}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="计划时间" width="200">
                        <template slot-scope="scope">
                            {{scope.row.flight?getTimeByFormat(scope.row.flight.scheduleTime,'YY-MM-DD hh:mm:ss'):''}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间" width="200"></el-table-column>
                    <el-table-column label="操作" width="120" align="center" v-if="!searchDel&&powerData.charge_approval" class-name="optBox">
                        <template slot-scope="scope">
                            <el-button type="text" title="审批" @click="approval([scope.row],'arrs')" :disabled="getapprovaldisabled(scope.row)" v-show="powerData.charge_approval">审批</el-button>
                            <el-button type="text" title="下载" @click="download(scope.row)" v-show="powerData.charge_download">下载</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="submitData.current" :page-sizes="[10,20, 30, 50, 100]" :page-size="submitData.size" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                </div>
            </div>
        </div>
        <edit-list ref="ref_editList" @update="update"></edit-list>
        <add-list ref="ref_addList" @update="update"></add-list>
        <info-edit-list ref="ref_infoEditList" @update="update"></info-edit-list>
    </div>

</template>

<script>
import EditList from '../charge_record/components/editList'
import AddList from './components/addList'
import InfoEditList from './components/editList'
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
            expandKeys: [],
            selections: [],
            powerData: {
                charge_add: false,
                charge_edit: false,
                charge_delete: false,
                charge_approval: false,
                charge_download: false,
            },
            expends: [],
            infoShow: false,
        }
    },
    components: {
        'edit-list': EditList,
        'add-list': AddList,
        'info-edit-list': InfoEditList,
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
        if (this.power) {
            this.powerData = _.cloneDeep(this.power)
        }
        // this.getExpends()
    },
    methods: {
        inIframeInit(data) {
            if (data.token) {
                sessionStorage.setItem('token', data.token)
                this.getUserData(data.token)
                this.getUnitLists()
            }
        },
        getRowName({ row }) {
            let name = 'expandRow'
            let startTime = row.startTime ? new Date(row.startTime).getTime() : ''
            let endTime = row.endTime ? new Date(row.endTime).getTime() : ''

            if (
                row.chargeCode == 'LANQ' &&
                endTime &&
                startTime &&
                (endTime - startTime > 6 * 60 * 60 * 1000 || endTime - startTime < 10 * 60 * 1000)
            ) {
                name += ' timeBorder'
            }
            return name
        },
        getSumText(sum) {
            let text = []
            if (!sum && JSON.stringify(sum) != '{}') {
                return ''
            } else {
                _.forIn(sum, (value, key) => {
                    text.push(value + key)
                })
                return text.join(',')
            }
        },
        getExpends() {
            var arrs = _.reduce(
                this.lists,
                (result, value) => {
                    let hasData = this.getRowClass({ row: value }) ? false : true

                    if (value.expandDefault && hasData) {
                        result.push(value.id)
                    }

                    return result
                },
                []
            )
            this.expends = arrs
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
                this.getSetButtonShow()
            })
        },
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
                console.log(new Date(this.searchTime).getTime())
                data.startTime = this.getTimeByFormat(this.searchTime, 'YY-MM-DD') + ' 00:00:00'
                data.endTime = this.getTimeByFormat(this.searchTime, 'YY-MM-DD') + ' 23:59:59'
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
                    this.$nextTick(function () {
                        this.getExpends()
                    })
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
        approvalSelect() {
            if (this.selections.length == 0) {
                this.$alert('还未勾选收费单！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }

            let arrs = this.selections.filter((list) => {
                return !list.chargeRecords || list.chargeRecords.length == 0
            })
            console.log(arrs)
            if (arrs.length > 0) {
                this.$alert('不能选择无收费记录数据进行审批！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.approval(this.selections, 'arrs')
        },
        approval(row, type) {
            let data = []
            if (type) {
                row.forEach((list, idx) => {
                    let chargeRecordIds = _.reduce(
                        list.chargeRecords || [],
                        function (result, value, key) {
                            if (value.approvalStatus != 'PASS') {
                                result.push({ id: value.id })
                            }
                            return result
                        },
                        []
                    )

                    if (chargeRecordIds.length == 0) {
                        this.$alert(
                            `勾选的第${idx + 1}二条收费单，收费记录以全部审批，不能重复审批！`,
                            '提示',
                            {
                                type: 'error',
                                center: true,
                            }
                        )
                        return false
                    }

                    if (chargeRecordIds.length != 0) {
                        data.push({
                            id: list.id,
                            chargeBillConfigCode: list.chargeBillConfigCode,
                            chargeRecords: chargeRecordIds,
                        })
                    }
                })
            } else {
                if (row.approvalStatus == 'PASS') {
                    this.$alert('该收费记录已经审批！', '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }

                data = [
                    {
                        id: row.chargeBillId,
                        chargeBillConfigCode: row.chargeBillConfigCode,
                        chargeRecords: [{ id: row.id }],
                    },
                ]
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
        download(row) {
            var a = document.createElement('a')
            a.download =
                row.chargeBillConfigName +
                ' ' +
                this.getTimeByFormat(new Date(), 'YY-MM-DD hh:mm:ss')
            a.href =
                this.$axios.defaults.baseURL +
                'charge-bill/exportChargeBillToPdf?isServer=true&chargeBillId=' +
                row.id
            a.target = '_blank'
            $('body').append(a) // 修复firefox中无法触发click
            a.click()
            // $(a).remove()
        },
        send() {
            this.$confirm('确定发送?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios.get('/charge-record/sendChargeRecord').then((res) => {
                    this.update()
                    this.$alert(res.msg, '提示', {
                        type: 'success',
                        center: true,
                    })
                })
            })
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
        add() {
            this.$refs.ref_addList.initData()
        },
        infoEdit(data) {
            this.$refs.ref_infoEditList.initData(_.cloneDeep(data))
        },
        listSelectionChange(val) {
            this.selections = val
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
        getSingSrc(row, type) {
            let obj = _.find(row.chargeBillSigns, { type: type })
            return obj ? obj.content : ''
        },
        getSingList(row, type) {
            let lists = _.filter(row.chargeBillSigns, { type: type })
            return lists
        },
        getRowClass(scope) {
            if (
                (!scope.row.chargeRecords || scope.row.chargeRecords.length == 0) &&
                (!scope.row.flightSupplementInfos || scope.row.flightSupplementInfos.length == 0)
            ) {
                return 'row-expand-cover'
            }
        },
        getSetButtonShow() {
            //设置按钮权限
            let menus = this.userData.menus || []
            menus.map((list) => {
                if (list.code == 'charge_approval') {
                    this.powerData.charge_approval = true
                }
                if (list.code == 'charge_add') {
                    this.powerData.charge_add = true
                }
                if (list.code == 'charge_edit') {
                    this.powerData.charge_edit = true
                }
                if (list.code == 'charge_delete') {
                    this.powerData.charge_delete = true
                }
                if (list.code == 'charge_download') {
                    this.powerData.charge_download = true
                }
            })
        },
        getapprovaldisabled(row) {
            let result = false
            if (!row.chargeRecords || row.chargeRecords.length == 0) {
                result = true
            } else {
                row.chargeRecords.map((list) => {
                    if (list.approvalStatus == 'PASS') {
                        result = true
                    }
                })
            }
            return result
        },
    },
}
</script>