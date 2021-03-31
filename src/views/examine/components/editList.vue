<template>
    <el-dialog :visible.sync="listShow" id="addTask" center width="400px" :show-close="false">
        <div slot="title" class="head">
            <div></div>
            <span>{{ type == "add" ? "新增" : "编辑" }}</span>
            <i class="el-icon-circle-close" @click="listShow = false"></i>
        </div>
        <el-form label-position="right" label-width="90px" ref="listData">
            <el-form-item label="项目名称" required>
                <el-input v-model="listData.name" placeholder="收费项目名称"></el-input>
            </el-form-item>
            <el-form-item label="项目编码" required>
                <el-input v-model="listData.code" placeholder="收费项目自定义编码" :disabled="!!listData.id"></el-input>
            </el-form-item>
            <el-form-item label="计量单位" required>
                <el-select v-model="listData.unit" placeholder="请选择">
                    <el-option v-for="(item, idx) in unitLists" :key="idx" :label="item.name" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="采集方式" required>
                <el-select v-model="listData.input" placeholder="请选择">
                    <el-option v-for="(item, idx) in inputLists" :key="idx" :label="item.name" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="footer">
            <el-button @click="listShow = false">取 消</el-button>
            <el-button type="primary">提交</el-button>
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
        }
    },
    methods: {
        initData(type, data) {
            this.type = type
            this.listShow = true
            if (data) {
                this.listData = data
            }
        },
    },
}
</script>