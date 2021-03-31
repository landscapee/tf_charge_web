<template>
    <div id="project" class="rightBoxContent">
        <div class="topBox">
            <ul class="navBox">
                <li>
                    <div></div>
                    <div class="mid one">收费单据</div>
                    <div></div>
                </li>
            </ul>
        </div>
        <div class="searchBox">
            <div class="leftBox">
                <!-- <div>
                    <el-date-picker v-model="searchTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']"></el-date-picker>
                </div> -->
                <div>
                    <el-input placeholder="请输入内容" v-model="searchStr" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
            </div>
            <div class="rightBox">
                <el-button type="primary">批量导出</el-button>
            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <el-table :data="records" border stripe style="width: 100%" :max-height="maxHeight" :highlight-current-row="true">
                    <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="code" label="日期" width="180"></el-table-column>
                    <el-table-column prop="name" label="航班号"></el-table-column>
                    <el-table-column prop="unit" label="飞机注册号"></el-table-column>
                    <el-table-column prop="input" label="航班类型"></el-table-column>
                    <el-table-column prop="creatWay" label="机位"></el-table-column>
                    <el-table-column prop="creatUser" label="服务部门"></el-table-column>
                    <el-table-column prop="creatTime" label="收费单据"></el-table-column>
                    <el-table-column label="操作" width="100" align="center" class-name="optBox">
                        <template slot-scope="scope">
                            <el-button type="text" title="编辑" @click="edit('edit',scope.row)">编辑</el-button>
                            <el-button type="text" title="删除" @click="del(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="pageNum" :page-sizes="[20, 30, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                </div>
            </div>
        </div>
        <edit-list ref="ref_editList" :unitLists="unitLists" :inputLists="inputLists"></edit-list>
    </div>

</template>

<script>
import { mapGetters } from 'vuex'
import EditList from './components/editList'
export default {
    data() {
        return {
            searchTime: '',
            searchStr: '',
            records: [
                {
                    code: 'mb0001',
                    name: '机组人员用车',
                    unit: '次',
                    input: '录入',
                    creatWay: '航控',
                    creatUser: '陈林',
                    creatTime: '2021-02-18 09:21:00',
                    status: '0',
                },
                {
                    code: 'mb0001',
                    name: '机组人员用车',
                    unit: '次',
                    input: '录入',
                    creatWay: '航控',
                    creatUser: '陈林',
                    creatTime: '2021-02-18 09:21:00',
                    status: '1',
                },
            ],
            pageNum: 1,
            pageSize: 20,
            total: 0,
            maxHeight: 1000,
            unitLists: [
                { name: '单程', value: '0' },
                { name: '每架航班', value: '1' },
                { name: '人', value: '2' },
                { name: '次数', value: '3' },
                { name: '小时', value: '4' },
            ],
            inputLists: [
                { name: '录入', value: '0' },
                { name: '计算次数', value: '1' },
                { name: '计算时长', value: '2' },
            ],
        }
    },
    components: {
        'edit-list': EditList,
    },
    created() {
        this.handleLists()
    },
    methods: {
        handleLists() {
            let data = {
                current: this.pageNum,
                size: this.pageSize,
                deleted: false,
            }
            this.getLists(data)
        },
        getLists(data) {
            this.$axios
                .get('/charge-bill/findChargeBillWhitPage', {
                    params: data,
                })
                .then((res) => {
                    console.log(res)
                })
        },
        handleSizeChange() {},
        pageBC() {},
        edit(type, data) {
            this.$refs.ref_editList.initData(type, _.cloneDeep(data))
        },
        del(data) {},
        cancel(data) {},
    },
}
</script>