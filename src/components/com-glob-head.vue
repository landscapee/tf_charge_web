<template>
    <el-row id="com_glob_head" type="flex" justify="space-between" align="middle">
        <div class="logo_left">
            <div :style="'background-image:url(/static/img/'+sysEdition+'/logoTitle.png);'"></div>
            <span class="sansB">收费系统</span>
        </div>
        <div class="user_right">
            <div class="dateBox">
                <i class="el-icon-date" style="color:#fff;"></i>
                <span class="orbiL flexSC">{{getTimeByFormat(getServerTime,'YY-MM-DD')}}</span>
            </div>
            <div class="timeBox">
                <i class="el-icon-time" style="color:#fff;"></i>
                <span class="orbiL flexSC">{{getTimeByFormat(getServerTime,'hh:mm')}}</span>
            </div>
            <div>
                <!-- <i class="el-icon-user-solid" style="color:#fff;"></i> -->
                <icon-svg iconClass="yonghu" iconColor="#fff"></icon-svg>
                <el-dropdown @command="userHandleCommand" trigger="click">
                    <span class="el-dropdown-link sansB pointer flexSC">
                        {{userData&&userData.name?userData.name:''}}<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="password">修改密码</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <div class="logoutBox" title="退出" @click="outLogin">
                <i class="el-icon-switch-button" style="color:#fff;"></i>
            </div>
        </div>
        <el-dialog :visible.sync="changePasswordShow" class="nodeDialog passwordNodeDialog" :show-close="false" center width="500px" :append-to-body="true" @close="changePasswordClose">
            <template slot="title">
                <div class="blankDiv"></div>
                <div class="el-dialog_header_step">密码修改</div>
                <div class="blankDiv"><i class="el-icon-circle-close" @click="changePasswordShow = false"></i></div>
            </template>
            <el-form :model="passwordObj" label-width="100px" :rules="rules" ref="configPassword">
                <el-form-item label="旧密码" prop="oldPwd">
                    <el-input v-model="passwordObj.oldPwd" placeholder="当前密码" :type="oldPwdShow?'password':'text'">
                        <el-button slot="append" icon="el-icon-view" @click="oldPwdShow=!oldPwdShow"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPwd">
                    <el-input v-model="passwordObj.newPwd" placeholder="修改的新密码" :type="newPwdShow?'password':'text'">
                        <el-button slot="append" icon="el-icon-view" @click="newPwdShow=!newPwdShow"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item label="确认新密码" prop="configPwd">
                    <el-input v-model="passwordObj.configPwd" placeholder="确认新密码" :type="configPwdShow?'password':'text'">
                        <el-button slot="append" icon="el-icon-view" @click="configPwdShow=!configPwdShow"></el-button>
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="dialog-footer">
                <el-button @click="changePasswordShow = false">取 消</el-button>
                <el-button type="primary" @click="changePassword">提 交</el-button>
            </div>
        </el-dialog>

    </el-row>
</template>
<script>
import { mapGetters } from 'vuex'
import { encryptedData } from '../lib/des-coder.js'
export default {
    data() {
        var validateName = (rule, value, callback) => {
            if (value === '' || value === null) {
                callback(new Error('该值不能为空'))
            } else {
                callback()
            }
        }
        var validatePassword = (rule, value, callback) => {
            if (value === '' || value === null) {
                callback(new Error('该值不能为空'))
            } else if (
                !/^(?=.*[a-z].*)(?=.*[A-Z].*)(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{8,16}$/.test(
                    value
                )
            ) {
                callback(new Error('新密码必须是包含数字和大小字母的8-16位字符'))
            } else {
                callback()
            }
        }
        var validateName1 = (rule, value, callback) => {
            if (value === '' || value === null) {
                callback(new Error('该值不能为空'))
            } else if (value !== this.passwordObj.newPwd) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        return {
            navList: [],
            navFlag: 0,
            userData: {},
            changePasswordShow: false,
            passwordObj: {
                oldPwd: '',
                newPwd: '',
                configPwd: '',
            },
            rules: {
                oldPwd: [{ required: true, validator: validateName, trigger: 'blur' }],
                newPwd: [{ required: true, validator: validatePassword, trigger: 'blur' }],
                configPwd: [{ required: true, validator: validateName1, trigger: 'blur' }],
            },
            oldPwdShow: true,
            newPwdShow: true,
            configPwdShow: true,
        }
    },
    props: ['path', 'seatFalg', 'planConfig'],
    beforeMounte() {},
    watch: {},
    computed: {
        ...mapGetters(['getServerTime']),
    },
    mounted() {
        this.userData = JSON.parse(sessionStorage.userData) || {}
        this.getNavList()
    },
    methods: {
        outLogin() {
            this.$confirm('确定退出系统？', '提示', {
                type: 'warning',
            })
                .then(() => {
                    this.$router.push('/')
                    sessionStorage.clear()
                    localStorage.clear()
                })
                .catch(() => {})
        },
        userHandleCommand(command) {
            if (command == 'password') {
                this.passwordObj = {
                    oldPwd: '',
                    newPwd: '',
                    configPwd: '',
                }
                this.changePasswordShow = true
            }
        },
        changePasswordClose() {
            Object.assign(this.$data.passwordObj, this.$options.data().passwordObj)
            this.$refs['configPassword'].clearValidate()
            this.oldPwdShow = true
            this.newPwdShow = true
            this.configPwdShow = true
        },
        changePassword() {
            let alert = this.passwordAlert()
            if (!alert) {
                return false
            }
            this.$refs['configPassword'].validate((valid) => {
                if (valid) {
                    this.$axios
                        .post('/sys/user/changeUserPwd', {
                            id: this.userData.id,
                            oldPwd: this.coder
                                ? encryptedData(this.passwordObj.oldPwd)
                                : this.passwordObj.oldPwd,
                            newPwd: this.coder
                                ? encryptedData(this.passwordObj.newPwd)
                                : this.passwordObj.newPwd,
                        })
                        .then((res) => {
                            if (res.responseCode == '1000') {
                                this.changePasswordShow = false
                                // this.$router.push("/")
                                this.$alert(res.data, '提示', {
                                    type: 'success',
                                    center: true,
                                    showClose: false,
                                    callback: () => {
                                        this.$router.push('/')
                                    },
                                })
                            }
                        })
                } else {
                    // this.passwordAlert()
                    this.$alert('修改数据不符合要求', '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
            })
        },
        passwordAlert() {
            if (!this.passwordObj.oldPwd) {
                this.$alert('旧密码不能为空', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (!this.passwordObj.newPwd) {
                this.$alert('新密码不能为空', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (this.passwordObj.newPwd != this.passwordObj.configPwd) {
                this.$alert('两次输入密码不一致', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            if (
                !/^(?=.*[a-z].*)(?=.*[A-Z].*)(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{8,16}$/.test(
                    this.passwordObj.newPwd
                )
            ) {
                this.$alert(
                    '请输入8-16位密码，至少包含大小写字母以及数字，可以包含特殊字符。例如：Aabc1234',
                    '提示',
                    {
                        type: 'error',
                        center: true,
                    }
                )
                return false
            }
            return true
        },
        getNavList() {
            let menus = this.userData.menus || []
            menus.map((list) => {
                let nav = _.find(this.navList, { code: list.code })
                if (nav) {
                    return false
                }
                if (list.code == 'flight_monitor') {
                    //航班监控
                    list.icon = 'jiankong2'
                    this.navList.push(list)
                }
                if (list.code == 'support_monitor') {
                    //作业保障监控
                    list.icon = 'peizhi'
                    this.navList.push(list)
                }
                if (list.code == 'flight_dynamics') {
                    //航班动态
                    list.icon = 'hangbandongtai'
                    this.navList.push(list)
                }
                if (list.code == 'flight_full') {
                    //航班动态
                    list.icon = 'jiankong1'
                    this.navList.push(list)
                }
            })
            this.setNavFlag()
        },
        setNavFlag() {
            this.navList.forEach((list, index) => {
                if (list.code == this.path) {
                    this.navFlag = index
                }
            })
        },
    },
}
</script>

<style lang="scss" scoped>
#com_glob_head {
    height: 48px;
    width: 100%;
    background: linear-gradient(90deg, #183d71 0%, #0172cf 100%);
    .logo_left {
        height: 48px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background: linear-gradient(90deg, #0f4291 0%, #428bff 100%);
        box-shadow: 0px 0px 6px 0px rgba(47, 61, 142, 1);
        border-radius: 0px 0 100px 0px;
        color: #fff;
        padding: 0 20px;

        div {
            height: 100%;
            width: 110px;
            background-size: 100% auto;
            background-repeat: no-repeat;
            background-position: center left;
        }
        span {
            font-size: 18px;
            margin-left: 15px;
        }
    }
    .nav_middle {
        display: flex;
        align-items: center;
        margin-left: 22px;
        flex: 1;
        li {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 48px;
            cursor: pointer;

            div {
                height: 20px;
                width: 100%;
                padding: 0 20px;
                border-left: 1px solid rgba(255, 255, 255, 0.3);
                display: flex;
                justify-content: center;
                align-items: center;

                span {
                    font-size: 16px;
                    color: #fff;
                    margin-left: 8px;
                }
            }
        }
        li.active {
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(61, 132, 255, 1) 100%);
        }
    }
    .user_right {
        display: flex;
        align-items: center;
        & > div {
            margin: 0 12px;
            height: 40px;
            display: flex;
            justify-content: flex-start;
            align-items: center;

            span {
                color: #fff;
                font-size: 16px;
                margin-left: 8px;
            }
        }
        .timeBox {
            width: 80px;
            span {
                font-size: 18px;
            }
        }
        .dateBox {
            span {
                font-size: 18px;
            }
        }

        .logoutBox,
        .setBox {
            width: 48px;
            height: 48px;
            background: rgba(14, 52, 113, 1);
            opacity: 0.6;
            cursor: pointer;
        }
        .logoutBox {
            margin: 0;
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            justify-content: center;
        }
    }
}
</style>
<style lang="scss">
.handover_content {
    h3 {
        font-weight: 600;
    }
    .left_Box {
        width: 260px;
        height: 400px;
        border: 1px solid #ddd;
        margin-right: 15px;
        padding: 10px;
        overflow: auto;

        .treeBox {
            flex: 1;
            padding: 10px 0;
        }
    }
    .right_Box {
        flex: 1;
        border: 1px solid #ddd;
        padding: 10px;
        height: 400px;
        overflow: auto;
        .userBox {
            flex: 1;
            padding: 10px 0;
            label {
                margin: 5px 10px;
            }
        }
    }
}
</style>
