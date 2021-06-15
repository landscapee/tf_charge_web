<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>编辑</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-form label-position="right" label-width="90px" ref="listData">
            <el-form-item label="名称">
                <el-input v-model="listData.supplementTitle" placeholder="名称" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="数据" v-if="listData.type===0">
                <el-input type="number" v-model="listData.valueCode" placeholder="数据"></el-input>
            </el-form-item>
            <el-form-item label="数据" v-if="listData.type===1">
                <el-input type="text" v-model="listData.valueCode" placeholder="数据"></el-input>
            </el-form-item>
            <el-form-item label="数据" v-if="listData.type===2||listData.type===3">
                <el-select v-model="listData.valueCode" placeholder="请选择" :multiple="listData.type===2?false:true">
                    <el-option v-for="item in options" :key="item.code" :label="item.describe" :value="item.code"></el-option>
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
    data() {
        return {
            listShow: false,
            listData: {},
            options: [],
        }
    },
    methods: {
        initData(data) {
            this.listShow = true
            this.listData = {
                type: 1,
            }
            this.options = []
            if (data) {
                let params =
                    data.supplementInfoConfig && data.supplementInfoConfig.params
                        ? JSON.parse(data.supplementInfoConfig.params)
                        : {}
                this.options = params.selects ? params.selects : []
                data.type = params.type ? params.type : 1
                if (data.type == 3) {
                    data.valueCode = data.valueCode.split(',') || []
                }
                this.listData = _.cloneDeep(data)
            }
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }
            let data = _.cloneDeep(this.listData)
            if (this.listData.type == 2) {
                let option = _.find(this.options, { code: this.listData.valueCode })
                data.valueTitle = option.describe
            }

            if (this.listData.type == 3) {
                let title = []
                let code = []
                this.listData.valueCode.map((list) => {
                    let option = _.find(this.options, { code: list })
                    title.push(option.describe)
                    code.push(option.code)
                })
                data.valueCode = code.join(',')
                data.valueTitle = title.join(',')
            }
            this.$axios.post('/flight-supplement-info/save', data).then((res) => {
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