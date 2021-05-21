<template>
    <div class="login-container">
        <div class="login-bg blur" :style="'background-image: url(/static/img/'+sysEdition+'/bg.png);'"></div>
        <div class="loginPanle">
            <div class="loginTitle"><span>收费系统</span></div>
            <el-row class="left">
                <img :src="'/static/img/'+sysEdition+'/login-logo.png'" alt="" />
            </el-row>
            <el-row class="right">
                <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
                    <el-form-item prop="username" class="input-panel-g">
                        <span class="imgbox">
                            <img :src="userimg" />
                        </span>
                        <el-input ref="username" v-model="loginForm.username" placeholder="请输入您的用户名" name="username" type="text" tabindex="1" auto-complete="on" />
                    </el-form-item>
                    <el-form-item prop="password" class="input-panel-r">
                        <span class="imgbox">
                            <img class="pwdicon" :src="pwdimg" />
                        </span>
                        <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType" placeholder="请输入您的密码" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
                        <span class="imgbox pointer" style="top:0;right:0;" @click="showPwd">
                            <i class="el-icon-view" style="color:#999;"></i>
                        </span>
                    </el-form-item>
                    <el-button :loading="loading" class="loginBtn" @click.native.prevent="handleLogin($event)">登录 →</el-button>
                </el-form>
            </el-row>
        </div>
        <el-dialog :visible.sync="changePasswordShow" class="nodeDialog" :show-close="false" center width="600px" :append-to-body="true" @close="changePasswordClose">
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
    </div>
</template>

<script>
// import request from '@lib/axios.js';
import userimg from './assets/img/login-username.png'
import pwdimg from './assets/img/login-password.png'
import './assets/index.scss'
import { encryptedData } from '../../lib/des-coder.js'
export default {
    name: 'Login',
    data() {
        const validateUsername = (rule, value, callback) => {
            if (!value.trim().length > 0) {
                callback(new Error('请输入正确的用户名'))
            } else {
                callback()
            }
        }
        const validatePassword = (rule, value, callback) => {
            if (value.length < 4) {
                callback(new Error('密码不能少于4位'))
            } else {
                callback()
            }
        }
        var validateName = (rule, value, callback) => {
            if (value === '' || value === null || value === undefined) {
                callback(new Error('该值不能为空'))
            } else {
                callback()
            }
        }
        var validatePassword1 = (rule, value, callback) => {
            if (value === '' || value === null || value === undefined) {
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
            if (value === '' || value === null || value === undefined) {
                callback(new Error('该值不能为空'))
            } else if (value !== this.passwordObj.newPwd) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        return {
            userimg,
            pwdimg,
            loginForm: {
                username: '',
                password: '',
            },
            loginRules: {
                username: [{ required: true, trigger: 'blur', validator: validateUsername }],
                password: [{ required: true, trigger: 'blur', validator: validatePassword }],
            },
            loading: false,
            passwordType: 'password',
            redirect: undefined,
            changePasswordShow: false,
            passwordObj: {
                oldPwd: '',
                newPwd: '',
                configPwd: '',
                userData: {},
                userToken: '',
            },
            rules: {
                oldPwd: [{ required: true, validator: validateName, trigger: 'blur' }],
                newPwd: [{ required: true, validator: validatePassword1, trigger: 'blur' }],
                configPwd: [{ required: true, validator: validateName1, trigger: 'blur' }],
            },
            oldPwdShow: true,
            newPwdShow: true,
            configPwdShow: true,
        }
    },
    watch: {},
    created() {},
    mounted() {
        sessionStorage.clear()
        localStorage.clear()
        this.$store.commit('resetStore', null)
    },
    methods: {
        showPwd() {
            if (this.passwordType === 'password') {
                this.passwordType = ''
            } else {
                this.passwordType = 'password'
            }
            this.$nextTick(() => {
                this.$refs.password.focus()
            })
        },
        handleLogin(e) {
            $(e.target).blur()
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    let url = ''
                    if (this.coder) {
                        url = '/sso/login/loginWithRsa'
                    } else {
                        url = '/sso/login/login'
                    }
                    this.$axios
                        .post(url, {
                            username: this.coder
                                ? encryptedData(this.loginForm.username)
                                : this.loginForm.username,
                            password: this.coder
                                ? encryptedData(this.loginForm.password)
                                : this.loginForm.password,
                        })
                        .then((res) => {
                            this.loading = false
                            if (
                                res.responseCode == 30002 ||
                                res.responseCode == 30003 ||
                                res.responseCode == 30010
                            ) {
                                this.passwordObj.userData = res.data
                                this.passwordObj.userToken = res.data.token
                                this.$alert(res.responseMessage, '提示', {
                                    type: 'warning',
                                    center: true,
                                    callback: () => {
                                        this.changePasswordShow = true
                                    },
                                })
                                return false
                            }

                            if (res.responseCode == 1000 && res.data) {
                                //登录成功
                                // this.$store.commit("setUserMsg",res.data)
                                sessionStorage.setItem('token', res.data.token)
                                sessionStorage.setItem(
                                    'userData',
                                    JSON.stringify(_.omit(res.data, 'token'))
                                )
                                this.$router.push('/index')
                            } else {
                                this.$message({ message: res.responseMessage, type: 'warning' })
                            }
                        })
                } else {
                    this.$message({ message: '请检查用户名和密码是否按要求填写', type: 'warning' })
                }
            })
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
                    let origin = this.$axios.defaults.baseURL.split('/bvc-controller')[0]
                    $.ajax({
                        type: 'post',
                        url: origin + '/sys/user/changeUserPwd',
                        data: JSON.stringify({
                            id: this.passwordObj.userData.id,
                            oldPwd: this.coder
                                ? encryptedData(this.passwordObj.oldPwd)
                                : this.passwordObj.oldPwd,
                            newPwd: this.coder
                                ? encryptedData(this.passwordObj.newPwd)
                                : this.passwordObj.newPwd,
                        }),
                        dataType: 'json',
                        contentType: 'application/json',
                        beforeSend: (request) => {
                            request.setRequestHeader('Authorization', this.passwordObj.userToken)
                        },
                        success: (res) => {
                            if (res.responseCode == '1000') {
                                this.changePasswordShow = false
                                this.$alert(res.responseMessage, '提示', {
                                    type: 'success',
                                    center: true,
                                })
                            } else {
                                this.$message({ message: res.responseMessage, type: 'warning' })
                            }
                        },
                    })
                } else {
                    this.$message({ message: '修改数据不符合要求', type: 'warning' })
                    return false
                }
            })
        },
        passwordAlert() {
            if (!this.passwordObj.oldPwd) {
                this.$message({ message: '修改数据不符合要求', type: 'warning' })
                return false
            }
            if (!this.passwordObj.newPwd) {
                this.$message({ message: '新密码不能为空', type: 'warning' })
                return false
            }
            if (this.passwordObj.newPwd != this.passwordObj.configPwd) {
                this.$message({ message: '两次输入密码不一致', type: 'warning' })
                return false
            }
            if (
                !/^(?=.*[a-z].*)(?=.*[A-Z].*)(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{8,16}$/.test(
                    this.passwordObj.newPwd
                )
            ) {
                this.$message({
                    message:
                        '请输入8-16位密码，至少包含大小写字母以及数字，可以包含特殊字符。例如：Aabc1234',
                    type: 'warning',
                })
                return false
            }
            return true
        },
    },
}
</script>



