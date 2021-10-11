<template>
    <div>
        <el-dialog :visible.sync="listShow" id="addTask" center :width="'800px'" :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>编辑</span>
                <i class="el-icon-circle-close" @click="listShow=false"></i>
            </div>
            <el-form label-position="right" label-width="80px" ref="listData">
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="航班号" required>
                            <el-input v-model="rowData.flightNo" placeholder="航班号" ref="ref_flightNo" :disabled="true"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="机位" required>
                            <el-input v-model="rowData.seat" placeholder="机位"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="机号" required>
                            <el-input v-model="rowData.aircraftNo" placeholder="机号"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="footer">
                <el-button @click="listShow=false">取 消</el-button>
                <el-button type="primary" @click="save">提交</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
export default {
    props: ['userDeptLists'],
    data() {
        return {
            listShow: false,
            rowData: {},
        }
    },
    mounted() {},
    watch: {},
    methods: {
        initData(row) {
            this.listShow = true
            this.rowData = _.cloneDeep(row)
        },

        save() {
            if (!this.rowData.seat) {
                this.$alert('机位不能为空', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.rowData.aircraftNo) {
                this.$alert('机号不能为空', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }

            this.$axios
                .post('/charge-bill/updateChargeBill', {
                    id: this.rowData.id,
                    aircraftNo: this.rowData.aircraftNo,
                    seat: this.rowData.seat,
                })
                .then((res) => {
                    this.listShow = false
                    this.$alert(res.msg, '提示', {
                        type: 'success',
                        center: true,
                    })
                    this.$emit('update')
                })
        },
    },
}
</script>