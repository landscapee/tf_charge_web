<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false" @close="closeDialog">
        <div slot="title" class="head">
            <div></div>
            <span>{{type=='add'?'新增':'编辑'}}</span>
            <i class="el-icon-circle-close" @click="listShow=false"></i>
        </div>
        <el-form label-position="right" label-width="100px" ref="listData">
            <el-form-item label="编码" required>
                <el-input v-model="listData.code" placeholder="编码" :disabled="!!listData.id||!listData.id&&fileList.length>0"></el-input>
            </el-form-item>
            <el-form-item label="名称" required>
                <el-input v-model="listData.name" placeholder="名称"></el-input>
            </el-form-item>
            <el-form-item label="收费项" required>
                <el-select v-model="listData.chargeBillItemList" filterable multiple clearable placeholder="请选择">
                    <el-option v-for="item in chargeLists" :key="item.id" :label="item.code+'-'+item.name+'('+item.unit+')'" :value="item.code"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="签名项" required>
                <!-- <el-select v-model="listData.chargeBillConfigSignList" filterable multiple clearable placeholder="请选择">
                    <el-option v-for="item in singLists" :key="item.id" :label="item.name" :value="item.code"></el-option>
                </el-select> -->
                <el-form label-position="right" label-width="160px">
                    <el-form-item :label="sign.name+'   签名次数:'" v-for="(sign,idx) in singListsArr" :key="idx">
                        <el-input-number v-model="sign.number" :min="0" :max="5" label="签名次数"></el-input-number>
                    </el-form-item>
                </el-form>
            </el-form-item>
            <el-form-item label="签名类型" required>
                <el-select v-model="listData.signType" filterable clearable placeholder="请选择">
                    <el-option v-for="item in signTypeLists" :key="item.id" :label="item.name" :value="item.code"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="审批级别" required>
                <el-input type="number" v-model="listData.maxApprovalLevel" placeholder="审批级别"></el-input>
            </el-form-item>
            <el-form-item label="设备号显示">
                <el-radio v-model="listData.showDevice" :label="true">是</el-radio>
                <el-radio v-model="listData.showDevice" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="是否预签">
                <el-radio v-model="listData.preSign" :label="true">是</el-radio>
                <el-radio v-model="listData.preSign" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="默认展开">
                <el-radio v-model="listData.expandDefault" :label="true">是</el-radio>
                <el-radio v-model="listData.expandDefault" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="模板">
                <el-upload class="upload-demo" :action="$axios.defaults.baseURL+'/file/fileUpload'" :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove" :limit="1" :on-exceed="handleExceed" :file-list="fileList" :headers="getHeader()" :on-success="handleSuccess" :data='{chargeBillConfigCode :listData.code}' :disabled="!listData.code">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <span v-show="type=='add'" style="color:red;margin-left:10px;" slot="tip" class="el-upload__tip">上传模板后，不能修改code，如需修改请删除模板</span>
                </el-upload>
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
    props: ['singLists', 'chargeLists', 'signTypeLists'],
    data() {
        return {
            listShow: false,
            listData: {},
            type: '',
            fileList: [],
            singListsArr: [],
            number0: 0,
            number1: 0,
            number2: 0,
            number3: 0,
        }
    },
    methods: {
        initData(type, data) {
            this.type = type
            this.listShow = true
            this.listData = {}
            this.fileList = []
            this.singListsArr = []

            let arrs = _.cloneDeep(this.singLists)
            arrs.map((arr) => {
                arr.number = 0
            })
            if (data) {
                let chargeBillItemList = []
                data.chargeBillItemList &&
                    data.chargeBillItemList.map((list) => {
                        chargeBillItemList.push(list.chargeCode)
                    })
                data.chargeBillItemList = chargeBillItemList
                this.fileList = data.file ? [data.file] : []
                this.listData = data
                arrs.map((arr) => {
                    let sign = _.find(data.chargeBillConfigSignList, { dataCode: arr.code })
                    if (sign) {
                        arr.number = sign.number ? sign.number : 0
                    }
                })
            }
            this.singListsArr = arrs
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }

            let data = _.cloneDeep(this.listData)
            let chargeBillConfigSignList = []
            let chargeBillItemList = []

            this.singListsArr.map((arr) => {
                if (arr.number > 0) {
                    chargeBillConfigSignList.push({
                        chargeBillConfigCode: data.code,
                        dataCode: arr.code,
                        number: arr.number,
                    })
                }
            })
            data.chargeBillItemList.map((list) => {
                chargeBillItemList.push({
                    chargeBillConfigCode: data.code,
                    chargeCode: list,
                })
            })
            data.chargeBillConfigSignList = chargeBillConfigSignList
            data.chargeBillItemList = chargeBillItemList
            this.$axios.post('/charge-bill-config/save', data).then((res) => {
                console.log(res)
                this.listShow = false
                this.$alert(res.msg, '提示', {
                    type: 'success',
                    center: true,
                })
                this.$emit('update')
            })
        },
        closeDialog() {
            this.fileList = []
        },
        dataVerify() {
            if (!this.listData.code) {
                this.$alert('编码不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.name) {
                this.$alert('名称不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.chargeBillItemList || this.listData.chargeBillItemList.length == 0) {
                this.$alert('收费项不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (
                !this.listData.chargeBillConfigSignList ||
                this.listData.chargeBillConfigSignList.length == 0
            ) {
                this.$alert('签名项不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.signType) {
                this.$alert('签名类型不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            return true
        },
        getHeader() {
            return { Authorization: sessionStorage.token }
        },
        handlePreview(file) {
            this.$emit('handle-preview', file)
        },
        handleRemove() {
            this.fileList = []
        },
        handleExceed(files, fileList) {
            this.$message.warning(`只能同时存在一个模板，如需重新上传，请先删除先前模板。`)
        },
        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${file.name}？`)
        },
        handleSuccess(res, file, fileList) {
            this.fileList = [res.data]
        },
    },
}
</script>