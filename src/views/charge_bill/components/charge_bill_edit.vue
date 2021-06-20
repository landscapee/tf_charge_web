<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>{{type=='add'?'新增':'编辑'}}</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-form label-position="right" label-width="90px" ref="listData">
            <el-form-item label="航班号">
                <el-input v-model="listData.flightNo" placeholder="航班号" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="收费项">
                <el-input v-model="listData.chargeDataSource.chargeConfig.name" placeholder="收费项" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="收费数据" required v-if="!timeShow&&type=='edit'">
                <el-input v-model="listData.chargeData" placeholder="收费数据"></el-input>
            </el-form-item>
            <el-form-item label="开始时间" required v-if="timeShow&&type=='edit'">
                <el-date-picker v-model="listData.startTime" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间" required v-if="timeShow&&type=='edit'">
                <el-date-picker v-model="listData.endTime" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </el-form-item>
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
        }
    },
    methods: {
        initData(type, data) {
            this.timeShow = false
            this.type = type
            this.listShow = true
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
                let startTime = new Date(this.listData.startTime).getTime()
                let endTime = new Date(this.listData.endTime).getTime()
                console.log(this.listData)
                if (
                    endTime &&
                    startTime &&
                    (endTime - startTime > 6 * 24 * 3600000 || endTime - startTime < 10 * 600000)
                ) {
                    this.timeShow = true
                }
            }
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }
            this.$axios.post('/charge-record/save', this.listData).then((res) => {
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