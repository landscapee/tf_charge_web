<template>
    <div>
        <el-dialog :visible.sync="listShow" id="addTask" center width="600px" :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>{{type=='add'?'新增':'编辑'}}</span>
                <i class="el-icon-circle-close" @click="listShow=false"></i>
            </div>
            <el-form label-position="right" label-width="100px" ref="listData">
                <el-form-item label="编码" required>
                    <el-input v-model="listData.code" placeholder="编码" :disabled="!!listData.id"></el-input>
                </el-form-item>
                <el-form-item label="名称" required>
                    <el-input v-model="listData.name" placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item label="级别" required>
                    <el-input-number v-model="listData.sort" :min="0" label="级别"></el-input-number>
                </el-form-item>
                <el-form-item label="类型" required>
                    <el-select v-model="listData.type" filterable placeholder="请选择">
                        <el-option v-for="item in dataTypeLists" :key="item.id" :label="item.name" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="收费项" required>
                    <el-select v-model="listData.chargeCode" filterable placeholder="请选择">
                        <el-option v-for="item in chargeLists" :key="item.id" :label="item.code+'-'+item.name+'('+item.unit+')'" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="参数">
                    <el-button type="primary" size="small" @click="editParameter">查看</el-button>
                </el-form-item>
            </el-form>
            <div slot="footer" class="footer">
                <el-button @click="listShow=false">取 消</el-button>
                <el-button type="primary" @click="save">提交</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="parameterShow" id="addTask" center width="600px" :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>参数配置</span>
                <i class="el-icon-circle-close" @click="parameterShow=false"></i>
            </div>
            <el-form label-position="right" label-width="100px" ref="listData">

                <el-form-item label="参数类型" required>
                    <el-select v-model="parameterData.type" filterable clearable placeholder="请选择" @clear="clear">
                        <el-option v-for="item in typeLists" :key="item.value" :label="item.name" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="最小数字" v-if="parameterData.type===0">
                    <el-input type="number" v-model="parameterData.minNumber" placeholder="最小数字"></el-input>
                </el-form-item>
                <el-form-item label="最大数字" v-if="parameterData.type===0">
                    <el-input type="number" v-model="parameterData.maxNumber" placeholder="最大数字"></el-input>
                </el-form-item>
                <el-form-item label="小数位数" v-if="parameterData.type===0">
                    <el-input type="number" v-model="parameterData.decimalLength" placeholder="小数位数"></el-input>
                </el-form-item>

                <el-form-item label="最大长度" v-if="parameterData.type==1">
                    <el-input type="number" v-model="parameterData.maxInput" placeholder="最大长度"></el-input>
                </el-form-item>

                <el-form-item label="参数值" v-if="parameterData.type===0||parameterData.type==1">
                    <el-input v-model="parameterData.value" placeholder="参数名称"></el-input>
                </el-form-item>
                <el-form-item label="选项" v-if="parameterData.type==3||parameterData.type==2">
                    <el-table :data="parameterData.selects" border stripe style="width: 100%">
                        <el-table-column label="code">
                            <template slot-scope="scope">
                                <el-input v-if="scope.row.type" v-model="scope.row.code" placeholder="code"></el-input>
                                <div v-else>{{scope.row.code}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="describe" label="名称">
                            <template slot-scope="scope">
                                <el-input v-if="scope.row.type" v-model="scope.row.describe" placeholder="名称"></el-input>
                                <div v-else>{{scope.row.describe}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="select" label="是否选中">
                            <template slot-scope="scope">
                                <el-radio v-model="scope.row.select" :label="true" :disabled="!scope.row.type">是</el-radio>
                                <el-radio v-model="scope.row.select" :label="false" :disabled="!scope.row.type">否</el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="100" align="center" class-name="optBox">
                            <template slot-scope="scope">
                                <el-button type="text" title="编辑" v-if="!scope.row.type" @click="editRowHandle(scope)">
                                    <i class="el-icon-edit"></i>
                                </el-button>
                                <el-button type="text" title="删除" v-if="!scope.row.type" @click="delRowHandle(scope)">
                                    <i class="el-icon-delete"></i>
                                </el-button>
                                <el-button type="text" title="上传" v-if="scope.row.type" @click="sureRowHandle(scope)">
                                    <i class="el-icon-upload2"></i>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="addRowBoxBox" style="margin-top:15px;">
                        <el-button class="addRowBox" type="primary" icon="el-icon-plus" @click="addRowValue" style="width:100%">增加</el-button>
                    </div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="footer">
                <el-button @click="parameterShow=false">取 消</el-button>
                <el-button type="primary" @click="parameterSave">提交</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
export default {
    props: ['dataTypeLists', 'inputLists'],
    data() {
        return {
            listShow: false,
            listData: {},
            type: '',
            chargeLists: [],

            parameterShow: false,
            typeLists: [
                { name: '数字单行输入框', value: 0 },
                { name: '文本多行输入框', value: 1 },
                { name: '单选', value: 2 },
                { name: '复选', value: 3 },
            ],
            parameterData: {
                selects: [],
            },
        }
    },
    methods: {
        initData(type, data) {
            this.type = type
            this.listShow = true
            this.listData = {}
            if (data) {
                data.parameter = data.parameter ? JSON.parse(data.parameter) : { selects: [] }
                data.sort = data.sort ? data.sort : 0
                this.listData = data
            }
            this.getALLCharge()
        },
        getALLCharge() {
            this.$axios.get('/charge-config/findAllChargeRecordConfig').then((res) => {
                this.chargeLists = res.data
            })
        },
        save() {
            let verify = this.dataVerify()
            if (!verify) {
                return false
            }

            if (this.listData.parameter && _.isNumber(this.listData.parameter.type)) {
                this.listData.parameter.title = this.listData.name
                this.listData.parameter.code = this.listData.code
                this.listData.parameter = JSON.stringify(this.listData.parameter)
            } else {
                this.listData.parameter = null
            }
            this.$axios.post('/charge-data-source/save', this.listData).then((res) => {
                console.log(res)
                this.listShow = false
                this.$alert(res.msg, '提示', {
                    type: 'success',
                    center: true,
                })
                this.$emit('update')
            })
        },
        clear() {
            this.parameterData.type = ''
        },
        dataVerify() {
            if (!this.listData.code) {
                this.$alert('数据源编码不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.listData.name) {
                this.$alert('数据源名称不能为空！', '提示', {
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
            if (!this.listData.type) {
                this.$alert('类型不能为空！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            return true
        },
        editParameter() {
            this.parameterShow = true
            this.parameterData = this.listData.parameter || { selects: [] }
        },
        editRowHandle(scope) {
            this.$set(this.parameterData.selects[scope.$index], 'type', 'new')
        },
        delRowHandle(scope) {
            this.parameterData.selects.splice(scope.$index, 1)
        },
        sureRowHandle(scope) {
            this.$set(this.parameterData.selects[scope.$index], 'type', '')
        },
        addRowValue() {
            this.parameterData.selects.push({
                code: '',
                describe: '',
                select: false,
                type: 'new',
            })
        },
        parameterSave() {
            let parameterData = _.cloneDeep(this.parameterData)
            parameterData.selects.forEach((list, idx) => {
                if (list.type == 'new') {
                    parameterData.selects.splice(idx, 1)
                }
                delete list.type
            })
            this.listData.parameter = this.parameterData
            this.parameterShow = false
        },
    },
}
</script>