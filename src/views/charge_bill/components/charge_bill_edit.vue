<template>
    <el-dialog :visible.sync="listShow" id="addTask" center :width="pageType=='boarding-bridge'&&type=='edit'?'800px':'400px'" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>{{type=='add'?'新增':'编辑'}}</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-form label-position="right" :label-width="pageType=='boarding-bridge'?'110px':'80px'" ref="listData">
            <el-form-item label="航班号">
                <el-input v-model="listData.flightNo" placeholder="航班号" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="收费项">
                <el-input v-model="listData.chargeDataSource.chargeConfig.name" placeholder="收费项" :disabled="!!listData.id"></el-input>
            </el-form-item>

            <template v-if="pageType=='boarding-bridge'&&type=='edit'">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="接桥时间">
                            <el-date-picker style="width:100%" v-model="listData.startTime" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="接桥人">
                            <el-select v-model="listData.startStaffId" filterable clearable placeholder="请选择">
                                <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="撤桥时间">
                            <el-date-picker style="width:100%" v-model="listData.endTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="撤侨人">
                            <el-select v-model="listData.endStaffId" filterable clearable placeholder="请选择">
                                <el-option v-for="item in userDeptLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="航后开始时间">
                            <el-date-picker style="width:100%" v-model="listData.afterStartTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="航后结束时间">
                            <el-date-picker style="width:100%" v-model="listData.afterEndTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="设备号">
                            <el-input v-model="listData.deviceCode" placeholder="设备编号"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="来源">
                            <el-input :value="getSourceName(listData)" disabled></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
            <template v-else>
                <el-form-item label="收费数据" required v-if="!timeShow&&type=='edit'">
                    <el-input v-model="listData.chargeData" placeholder="收费数据"></el-input>
                </el-form-item>
                <el-form-item label="开始时间" v-if="timeShow&&type=='edit'">
                    <el-date-picker style="width:100%" v-model="listData.startTime" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间" v-if="timeShow&&type=='edit'">
                    <el-date-picker style="width:100%" v-model="listData.endTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                </el-form-item>
            </template>
            <el-form-item label="备注" v-if="type=='remark'">
                <el-input v-model="listData.remark" placeholder="备注"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="footer">
            <el-button @click="listShow=false">取 消</el-button>
            <el-button type="primary" @click="save">提交</el-button>
        </div>
    </el-dialog>
</template>

<script>
export default {
    props: ['userDeptLists'],
    data() {
        return {
            listShow: false,
            listData: {
                chargeBill: {},
                chargeDataSource: {
                    chargeConfig: {},
                },
                startTime: '',
                endTime: '',
                remark: '',
            },
            type: '',
            timeShow: false,
            pageType: '',
            rowData: {},
        }
    },
    methods: {
        getSourceName(record) {
            return record.dataSourceSort === 0 ? 'BBMS' : 'OMMS'
        },
        initData(type, data, row) {
            this.timeShow = false
            this.type = type
            this.listShow = true
            this.rowData = row
            if (data.chargeCode == 'LANQ') {
                this.pageType = 'boarding-bridge'
            } else {
                this.pageType = ''
            }

            this.listData = {
                chargeBill: {},
                chargeDataSource: {
                    chargeConfig: {},
                },
                startTime: '',
                endTime: '',
                remark: '',
            }
            if (data) {
                this.listData = _.cloneDeep(data)
                console.log(this.listData)

                this.timeShow = data.unit == '秒' ? true : false
            }
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }

            let startStaffObj = _.find(this.userDeptLists, { id: this.listData.startStaffId }) || {}
            let endStaffObj =
                _.find(this.userDeptLists, {
                    id: this.listData.endStaffId,
                }) || {}

            this.listData.startStaffName = startStaffObj.name || ''
            this.listData.endStaffName = endStaffObj.name || ''

            let url =
                this.pageType == 'boarding-bridge'
                    ? '/boarding-bridge-charge-record/save'
                    : '/charge-record/save'

            this.$axios.post(url, this.listData).then((res) => {
                this.listShow = false
                this.$alert(res.msg, '提示', {
                    type: 'success',
                    center: true,
                })
                this.$emit('update')
            })
        },
        dataVerify() {
            if (!this.listData.chargeData && this.timeShow) {
                this.$alert('收费数据不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            return true
        },
    },
}
</script>