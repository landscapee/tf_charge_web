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
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="edit('add')">新增</el-button>
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
                    <el-table-column prop="code" label="编码"></el-table-column>
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column prop="serviceName" label="服务项">
                        <template slot-scope="scope">
                            {{scope.row.serviceName||scope.row.serviceCode}}
                        </template>
                    </el-table-column>
                    <el-table-column label="参数" width="120" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="right" width="400" trigger="hover">
                                <pre>
                                    {{scope.row.params?JSON.parse(scope.row.params):''}}
                                </pre>
                                <el-button slot="reference" type="primary" size="mini" v-if="getShowParameter(scope.row.params)">查看</el-button>
                            </el-popover>
                        </template>
                    </el-table-column>

                    <el-table-column prop="createrName" label="创建人"></el-table-column>
                    <el-table-column label="创建时间" width="180">
                        <template slot-scope="scope">
                            {{getTimeByFormat(scope.row.createTime,'YY-MM-DD hh:mm:ss')}}
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100" align="center" v-if="!searchDel" class-name="optBox">
                        <template slot-scope="scope">
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
        }
    },
    components: {
        'edit-list': EditList,
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
                .get('/supplement-info-config/findSupplementInfoConfigWhitPage', {
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
                    .get('/supplement-info-config/deleteById', {
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
        getShowParameter(parameter) {
            let show = false
            let data = parameter ? JSON.parse(parameter) : ''
            if (data && _.isNumber(data.type)) {
                show = true
            }
            return show
        },
    },
}
</script>