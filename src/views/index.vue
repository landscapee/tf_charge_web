<template>
    <el-container id="index">
        <el-header style="padding:0;" height="48px">
            <glob-head />
        </el-header>
        <el-container class="content">
            <el-aside width="220px" class="leftBox">
                <div class="userMsgBox">
                    <img src="/static/img/userImg.png" alt="">
                    <div>{{userData.name}}</div>
                    <div>{{userData.deptName}}</div>
                </div>
                <ul>
                    <el-row type="flex" tag="li" align="middle" v-for="(nav,idx) in navLists" :key="idx" :class="{active:flagNav.path==nav.path}" @click.native="navHandle(nav,idx)" v-show="nav.show">
                        <i :class="nav.icon" class="iconfont"></i>
                        <span>{{nav.name}}</span>
                    </el-row>
                </ul>
            </el-aside>
            <el-main class="rightBox" style="padding:0;">
                <router-view :power="power" :flagNav="flagNav" />
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            userData: {},
            flagNav: {},
            navLists: [
                {
                    name: '收费项配置',
                    icon: 'el-icon-setting',
                    path: 'charge_config',
                    show: false,
                },
                {
                    name: '附加信息项配置',
                    icon: 'el-icon-setting',
                    path: 'additional_information_config',
                    show: false,
                },
                {
                    name: '签字单配置',
                    icon: 'el-icon-setting',
                    path: 'sign_config',
                    show: false,
                },

                {
                    name: '服务记录单配置',
                    icon: 'el-icon-setting',
                    path: 'service_config',
                    show: false,
                },

                {
                    name: '收费单配置',
                    icon: 'el-icon-setting',
                    path: 'charge_bill_config',
                    show: false,
                },
                {
                    name: '数据源配置',
                    icon: 'el-icon-setting',
                    path: 'charge_data_source',
                    show: false,
                },

                {
                    name: '补充信息配置',
                    icon: 'el-icon-setting',
                    path: 'supplement_info_config',
                    show: false,
                },
                {
                    name: '数据字典',
                    icon: 'el-icon-setting',
                    path: 'data_dictionary',
                    show: false,
                },
                {
                    name: '收费记录',
                    icon: 'el-icon-c-scale-to-original',
                    path: 'charge_record',
                    show: false,
                },
                {
                    name: '收费单',
                    icon: 'el-icon-c-scale-to-original',
                    path: 'charge_bill',
                    show: false,
                },
                {
                    name: '登机桥收费单',
                    icon: 'el-icon-c-scale-to-original',
                    path: 'boarding_bridge_charge_bill',
                    show: false,
                },
                {
                    name: '收费保障',
                    icon: 'el-icon-c-scale-to-original',
                    path: 'flight_control_report',
                    show: false,
                },
                // {
                //     name: '收费数据审批',
                //     icon: 'el-icon-c-scale-to-original',
                //     path: 'examine',
                //     show: false,
                // },
                { name: '收费单据', icon: 'el-icon-s-custom', path: 'bill', show: false },
            ],
            power: {
                charge_add: false,
                charge_edit: false,
                charge_delete: false,
                charge_approval: false,
                charge_download: false,
            },
        }
    },
    computed: {},
    components: {
        'glob-head': () => import(/*webpackChunkName:"glob-head"*/ '../components/com-glob-head'),
    },
    created() {
        this.userData = JSON.parse(sessionStorage.userData)
        this.getSetButtonShow()
    },
    methods: {
        navHandle(nav) {
            this.flagNav = nav
            this.$router.push(nav.path)
        },
        getSetButtonShow() {
            //设置按钮权限
            let menus = this.userData.menus || []

            menus.map((list) => {
                let obj = _.find(this.navLists, { path: list.code })
                if (obj) {
                    obj.show = true
                    obj.name = list.name
                }
                if (list.code == 'charge_approval') {
                    this.power.charge_approval = true
                }
                if (list.code == 'charge_add') {
                    this.power.charge_add = true
                }
                if (list.code == 'charge_edit') {
                    this.power.charge_edit = true
                }
                if (list.code == 'charge_delete') {
                    this.power.charge_delete = true
                }
                if (list.code == 'charge_download') {
                    this.power.charge_download = true
                }
            })

            let newNav = this.navLists.filter((nav) => {
                return nav.show
            })
            if (newNav.length > 0) {
                let nav = _.find(newNav, { path: this.$route.name })
                if (nav) {
                    this.navHandle(nav)
                } else {
                    this.navHandle(newNav[0])
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
#index {
    height: 100%;
    width: 100%;
    .content {
        height: calc(100% - 40px);
    }
    .leftBox {
        width: 220px;
        background-image: url('/static/img/left-bg.png');
        background-size: 100% 100%;
        .userMsgBox {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px 0;
            img {
                height: 50p;
                width: 50px;
                margin-bottom: 10px;
            }
            div {
                line-height: 20px;
                color: #fff;
            }
        }
        ul {
            li {
                height: 50px;
                // display: flex;
                // align-items: center;
                color: #fff;
                cursor: pointer;
                i {
                    margin: 0 10px 0 40px;
                }
            }
            li.active {
                background: linear-gradient(
                    270deg,
                    rgba(73, 90, 255, 1) 1%,
                    rgba(10, 207, 254, 1) 100%
                );
            }
        }
    }
    .rightBox {
        width: calc(100% - 220px);
        background: #eee;
        position: relative;
        overflow: hidden;
    }
    .msg_box {
        width: 400px;
        position: absolute;
        bottom: 10px;
        right: 20px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-radius: 4px;
            position: relative;
            margin-bottom: 10px;
            background-color: #faecd8;
            color: #e6a23c;
            box-shadow: 0px 0px 10px #333333;
            p {
                line-height: 20px;
            }
        }
    }
}
</style>
<style lang="scss">
.signBox {
    .cell {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .signDiv {
        display: flex;
        align-items: center;
        margin: 0 5px;
        img {
            height: 40px;
        }
    }
}
.signImgBox {
    img {
        height: 30px;
    }
}
.el-form-item {
    margin-bottom: 15px !important;
}
.el-date-editor .el-range-separator {
    width: 30px;
}
// .el-range-editor{width:250px!important;}
// .el-button--text{color:#333;padding: 0;}
.el-cascader__tags {
    display: flex;
    flex-wrap: nowrap;
}
.el-cascader__tags span:nth-child(1) {
    max-width: 110px;
}

// .el-select__tags > span {
//     display: flex !important;
// }
// .el-select__tags > span span:nth-child(1) {
//     display: flex;
//     align-items: center;
//     span {
//         max-width: 100px;
//         overflow: hidden;
//         text-overflow: ellipsis;
//         white-space: nowrap;
//         display: inline-block;
//     }
// }

.el-cascader {
    .el-input__inner {
        height: 40px !important;
    }
}

.rightBoxContent {
    display: flex;
    flex-direction: column;
    height: 100%;
    .topBox {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 50px;
        padding: 0 20px;
        align-items: center;
        border-bottom: 1px solid rgba(210, 210, 210, 1);
        background: #fff;
        .navBox {
            display: flex;
            height: 100%;
            align-items: center;
            li {
                display: flex;
                flex-direction: column;
                height: 100%;
                justify-content: space-between;
                margin-right: 20px;
                cursor: pointer;
                .top {
                    height: 5px;
                }
                .mid.one {
                    font-size: 16px;
                    font-weight: 600;
                }
                .bottom {
                    height: 5px;
                    width: 100%;
                    background: transparent;
                    border-radius: 5px;
                }
            }
            li.active {
                .mid {
                    font-size: 16px;
                    font-weight: 600;
                }
                .bottom {
                    background: linear-gradient(
                        270deg,
                        rgba(73, 90, 255, 1) 1%,
                        rgba(10, 207, 254, 1) 100%
                    );
                }
            }
        }
    }
    .searchBox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 10px 0;
        .leftBox {
            display: flex;
            & > div {
                margin-right: 10px;
            }
            .el-select {
                width: 100px;
            }
            .radioApproval {
                display: flex;
                border-radius: 4px;
                overflow: hidden;
                li {
                    height: 40px;
                    padding: 0 10px;
                    border: 1px solid #dcdfe6;
                    line-height: 40px;
                    background-color: #fff;
                    cursor: pointer;
                    color: #606266;
                }
                li:nth-child(1) {
                    border-right: none;
                    border-radius: 4px 0 0 4px;
                }
                li:nth-child(2) {
                    border-radius: 0 4px 4px 0;
                }
                li.active {
                    background-color: #409eff;
                    color: #fff;
                }
            }
        }
        .rightBox {
            display: flex;
            & > div {
                margin-right: 10px;
            }
            .el-select {
                width: 100px;
            }
        }
    }
    #tableBox {
        height: calc(100% - 100px);
        padding: 10px;
    }
    .tableBox {
        background: #fff;
        height: 100%;
    }
}

table {
    width: 100%;
    .cell {
        height: 100%;
        padding: 4px 6px !important;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .el-dropdown {
        display: flex;
        align-items: center;
    }
    .optBox,
    .indexTd {
        .cell {
            flex-direction: inherit !important;
        }
    }
    thead {
        tr {
            height: 40px;
            th {
                background-color: #3a3f43 !important;
                color: #fff;
                height: 40px;
                padding: 0 !important;
            }
        }
    }
    tbody {
        tr {
            height: 50px;
            td {
                height: 50px;
                padding: 0 0 !important;
            }
            // td{text-align: center;}
            .cell > i {
                margin: 0 5px;
                cursor: pointer;
                font-size: 18px;
            }
            .stateBoxBox {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }

        tr:hover {
            td:not(.el-table__expanded-cell) {
                background-color: #a0cbf6 !important;
            }
        }
        .timeBorder {
            td {
                background-color: rgba(245, 108, 108, 0.8) !important;
                color: #fff;
            }
        }
        .expandRow:hover {
            td {
                background-color: #a0cbf6 !important;
            }
        }
    }
}

.outtable {
    th {
        background: none !important;
        color: #333 !important;
    }
    tr {
        height: 40px !important;
        td {
            height: 40px !important;
        }
    }
}
.optBox {
    .el-button {
        padding: 0;
    }
}
.paginationBox {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}
.stateBox {
    padding: 0 15px;
    border-radius: 20px;
    font-size: 12px;
    color: #fff;
}
.stateE {
    background: #ccc;
}
.stateD {
    background: #3988ff;
}
.stateC {
    background: #1bd69b;
}
.stateB {
    background: #ff7172;
}
.stateA {
    background: #e6a23c;
}
.recordD {
    background: #3988ff;
}
.recordC {
    background: rgba(197, 127, 240, 1);
}
.recordB {
    background: rgba(221, 189, 75, 1);
}
.recordA {
    background: rgba(27, 214, 155, 1);
}
.stateDefault {
    background: #fff;
    color: #333;
    border: 1px solid #333;
}
.noApprove {
    .cell {
        background: #f56c6c !important;
    }
}
.passApprove {
    .cell {
        background: #67c23a !important;
    }
}
.noRelateRecord {
    .cell {
        background: #e6a23c !important;
    }
}

.rowDrawer {
    .el-drawer {
        overflow: auto;
    }
    .title {
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        .left {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
        }
        .stateBox {
            font-size: 14px;
            font-weight: 400;
            margin-left: 5px;
        }
        // .el-button--text{color:#333;padding: 0;}
    }
    .content {
        border-top: 1px solid #ccc;
        padding: 20px 20px 20px 0;
    }
    .reportContent {
        border-top: 1px dashed #ccc;
        padding: 20px;
        & > div {
            text-align: right;
            color: #999;
            line-height: 24px;
        }
    }
    .el-form-item {
        margin-bottom: 15px;
    }
    .el-form-item__label {
        font-weight: 600;
        color: #333;
        line-height: 24px;
    }
    .el-form-item__content {
        line-height: 24px;
    }
    .buttonBox {
        display: flex;
        justify-content: flex-end;
    }
    .fileBox {
        span {
            color: #3988ff;
            cursor: pointer;
        }
    }
}
.fileImg {
    .el-dialog__body {
        padding: 0 !important;
    }
}

#addTask {
    .el-dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0 !important;
    }
    .el-dialog__header {
        padding: 0;
    }
    .head {
        height: 50px;
        display: flex;
        justify-content: space-between;
        padding: 0 20px;
        align-items: center;
        color: #fff;
        background: rgba(57, 136, 255, 1);
        div {
            width: 18px;
        }
        span {
            font-size: 18px;
        }
        i {
            cursor: pointer;
        }
    }
}
.bill_expand {
    padding: 0 5px 10px;

    .title {
        height: 40px;
        line-height: 40px;
        color: #3988ff;
        font-size: 18px;
        text-align: center;
    }
    .bill_expand_Box {
        width: 100%;
        padding: 0;
    }
    .bill_expand_Box1 {
        width: 100%;
        padding: 15px 15px 0;
        // display: flex;
        // flex-wrap: wrap;
    }
}
.indexTd {
    .cell {
        display: flex;
        justify-content: center;
        align-items: center;
        div {
            font-size: 12px;
            height: 20px;
            width: 20px;
            line-height: 20px;
            text-align: center;
            background-color: red;
            color: #fff;
            border-radius: 4px;
            margin-left: 5px;
            transform: scale(0.8, 0.8);
        }
    }
}
.row-expand-cover td .el-table__expand-icon {
    visibility: hidden;
}

.flightNoBox {
    display: flex;
    .flightNo-check {
        display: flex;
        flex-direction: column;
        width: 600px;
        margin: 0 0 20px 10px;
        p {
            height: 40px;
            line-height: 40px;
            text-align: center;
            color: #3988ff;
        }
        ul {
            height: 300px;
            overflow: auto;
            border: 1px solid #ccc;
            display: flex;
            flex-wrap: wrap;
            flex-direction: column;
            li {
                height: 30px;
                border: 1px solid #3988ff;
                margin: 5px;
                display: flex;
                align-items: center;
                padding: 0 10px;
                cursor: pointer;
                justify-content: center;
            }
        }
    }
}
</style>
