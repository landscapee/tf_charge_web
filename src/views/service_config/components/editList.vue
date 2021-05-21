<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>{{type=='add'?'新增':'编辑'}}</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-form label-position="right" label-width="100px" ref="listData">
            <el-form-item label="编码" required>
                <el-input v-model="listData.serviceCode" placeholder="编码" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="名称" required>
                <el-input v-model="listData.serviceName" placeholder="名称"></el-input>
            </el-form-item>
            <el-form-item label="收费项" required>
                <el-select v-model="listData.chargeCode" filterable placeholder="请选择">
                    <el-option v-for="item in chargeLists" :key="item.id" :label="item.code+'-'+item.name+'('+item.unit+')'" :value="item.code">
                    </el-option>
                </el-select>
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
    props: ['unitLists', 'inputLists'],
    data() {
        return {
            listShow: false,
            listData: {},
            type: '',
            chargeLists: [],
        }
    },
    methods: {
        initData(type, data) {
            this.type = type
            this.listShow = true
            this.listData = {}
            if (data) {
                this.listData = data
            }
            this.getALLCharge()
        },
        getALLCharge() {
            this.$axios.get('/charge-config/findAllChargeConfig').then((res) => {
                this.chargeLists = res.data
            })
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }
            this.$axios.post('/service-config/save', this.listData).then((res) => {
                console.log(res)
                this.listShow = false
                this.$alert(res.msg, '提示', {
                    type: 'success',
                    center: true,
                })
                this.$emit('update')
            })
        },
        dataVerify() {
            if (!this.listData.serviceCode) {
                this.$alert('编码不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.serviceName) {
                this.$alert('名称不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.chargeCode) {
                this.$alert('收费项不能为空！', '提示', {
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