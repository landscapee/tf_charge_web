<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>编辑</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-form label-position="right" label-width="90px" ref="listData">
            <el-form-item label="名称">
                <el-input v-model="listData.valueTitle" placeholder="名称" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="数据">
                <el-input v-model="listData.valueCode" placeholder="数据"></el-input>
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
            listData: {},
        }
    },
    methods: {
        initData(data) {
            this.listShow = true
            this.listData = {}
            console.log(data)
            if (data) {
                this.listData = _.cloneDeep(data)
            }
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }
            this.$axios.post('/flight-supplement-info/save', this.listData).then((res) => {
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