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
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="edit('add')" v-show="power.charge_add">新增</el-button>
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
                    <el-input placeholder="请输入内容" v-model="searchStr" clearable @keyup.enter.native="handleLists">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
            </div>
            <div class="rightBox">

            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <el-table :data="lists" border stripe style="width: 100%" :max-height="maxHeight" :highlight-current-row="true">
                    <el-table-column label="序号" width="60" align="center">
                        <template slot-scope="scope">
                            {{(submitData.current-1)*submitData.size+scope.$index+1}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="code" label="编码" width="100"></el-table-column>
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column label="收费项">
                        <template slot-scope="scope">
                            {{getName(scope.row.chargeBillItemList,chargeLists,'chargeCode','unit')}}
                        </template>
                    </el-table-column>
                    <el-table-column label="签名项" width="200">
                        <template slot-scope="scope">
                            {{getName(scope.row.chargeBillConfigSignList,singLists,'dataCode')}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="maxApprovalLevel" label="审批级别" width="100"></el-table-column>
                    <el-table-column label="预签名" width="100">
                        <template slot-scope="scope">
                            {{scope.row.preSign?'是':'否'}}
                        </template>
                    </el-table-column>
                    <el-table-column label="默认展开" width="100">
                        <template slot-scope="scope">
                            {{scope.row.expandDefault?'是':'否'}}
                        </template>
                    </el-table-column>
                    <el-table-column label="模板" width="100" align="center">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" v-if="scope.row.file&&scope.row.file.id" @click="handlePreview(scope.row.file)">下载</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createrName" label="创建人" width="120"></el-table-column>
                    <el-table-column label="创建时间" width="200">
                        <template slot-scope="scope">
                            {{getTimeByFormat(scope.row.createTime,'YY-MM-DD hh:mm:ss')}}
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100" align="center" v-if="!searchDel&&(power.charge_edit||power.charge_delete)" class-name="optBox">
                        <template slot-scope="scope">
                            <el-button type="text" title="编辑" @click="edit('edit',scope.row)" v-show="power.charge_edit">编辑</el-button>
                            <el-button type="text" title="删除" @click="del(scope.row)" v-show="power.charge_delete">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="submitData.current" :page-sizes="[10,20, 30, 50, 100]" :page-size="submitData.size" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                </div>
            </div>
        </div>
        <edit-list ref="ref_editList" @update="update" @handle-preview="handlePreview" :singLists="singLists" :chargeLists="chargeLists" :signTypeLists="signTypeLists"></edit-list>
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
            singLists: [],
            chargeLists: [],
            signTypeLists: [
                { code: 'STAFF', name: '保障人员查看' },
                { code: 'ROLE', name: '角色查看' },
            ],
        }
    },
    components: {
        'edit-list': EditList,
    },
    created() {
        this.getALLCharge()
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
                .get('/charge-bill-config/findChargeBillConfigWhitPage', {
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
        getSingLists() {
            this.$axios
                .get('/data-dictionary/findDataDictionaryByCode', {
                    params: {
                        code: 'sign',
                    },
                })
                .then((res) => {
                    this.singLists = res.data
                    this.handleLists()
                })
        },
        getALLCharge() {
            this.$axios.get('/charge-config/findAllChargeRecordConfig').then((res) => {
                this.chargeLists = res.data
                this.getSingLists()
            })
        },
        getName(items, lists, key, key1) {
            let arr = []
            if (items && items.length > 0) {
                items.map((list) => {
                    let obj = _.find(lists, { code: list[key] })
                    arr.push(obj.name + (key1 ? '(' + obj[key1] + ')' : ''))
                })
            }
            return arr.join(',')
        },
        handlePreview(file) {
            var a = document.createElement('a')
            a.download = file.name
            a.href = this.$axios.defaults.baseURL + 'file/download/' + file.id
            a.target = '_blank'
            $('body').append(a) // 修复firefox中无法触发click
            a.click()
            $(a).remove()
        },
    },
}
</script>