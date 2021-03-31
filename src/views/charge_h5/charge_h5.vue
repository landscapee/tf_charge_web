<template>
    <div class="chargeDetails">
        <div class="flightMsg">
            <div class="title">航班基本信息</div>
            <table class="table1">
                <tr>
                    <td>航班号</td>
                    <td>{{details.flightNo}}</td>
                </tr>
                <tr>
                    <td>计划时间</td>
                    <td>{{getTimeByFormat(details.scheduleTime,'YY-MM-DD hh:mm:ss')}}</td>
                </tr>
                <tr>
                    <td>航空公司</td>
                    <td>{{details.airlineCode}}</td>
                </tr>
                <tr>
                    <td>机位</td>
                    <td>{{details.seat}}</td>
                </tr>
                <tr>
                    <td>飞机注册号</td>
                    <td>{{details.aircraftNo}}</td>
                </tr>
                <tr>
                    <td>机型</td>
                    <td>{{details.aircraftType}}</td>
                </tr>
            </table>
        </div>
        <div class="chargeMsg">
            <div class="title">收费数据</div>
            <table>
                <thead>
                    <tr>
                        <th>收费项目</th>
                        <th>收费数据</th>
                        <th>计量单位</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in chargeRecords" :key="item.id">
                        <td>{{item.chargeDataSource&&item.chargeDataSource.chargeConfig?item.chargeDataSource.chargeConfig.name:''}}</td>
                        <td>{{item.chargeData}}</td>
                        <td>{{item.chargeDataSource&&item.chargeDataSource.chargeConfig?item.chargeDataSource.chargeConfig.unit:''}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="chargeMsg">
            <div class="title">补充信息</div>
            <table>
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>数据</th>
                        <th>单位</th>
                        <th>描述</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in supplementInfos" :key="item.id">
                        <td>{{item.supplementTitle}}</td>
                        <td>{{item.valueCode}}</td>
                        <td>{{item.supplementUnit}}</td>
                        <td>{{item.valueTitle}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <div class="title">签名项</div>
            <ul>
                <!--  -->
                <li class='list_in' style='position:relative' v-for="(item,idx) in chargeBillSigns" :key="idx">
                    <div class="label">{{item.name}}签字</div>
                    <div class="value" v-if="!item.signatureId" @click="elSignFn(idx,'posElSignFn'+idx)">点击签字</div>
                    <div style='position:relative'>
                        <div class='list_sign' style="width:100%;position:absolute;left:0px;top:0px;">
                            <div :pos="'posElSignFn'+idx" :id="'posElSignFn'+idx"></div>
                        </div>
                    </div>
                </li>
                <li></li>
            </ul>
        </div>
        <div>
            <button @click="saveSign">保存</button>
        </div>
        <!-- <remote-script src="/static/kinggrid/core/kinggrid.min.js" hasCode="Signature" />
        <remote-script src="/static/kinggrid/core/kinggrid.plus.min.js" hasCode="Signature" />
        <remote-script src="/static/kinggrid/dialog/artDialog/dialog-min.js" hasCode="Signature" />
        <remote-script src="/static/kinggrid/signature.min.js" hasCode="Signature" />
        <remote-script src="/static/kinggrid/password.min.js" hasCode="Signature" />
        <remote-script src="/static/kinggrid/signature.mobile.min.js" hasCode="Signature" />
        <remote-script src="/static/kinggrid/signature_pad.min.js" hasCode="Signature" />
        <remote-script src="/static/kinggrid/html2canvas.min.js" hasCode="Signature" /> -->
    </div>
</template>

<script>
export default {
    data() {
        return {
            details: {},
            isElSign: true,
            elSignImageData: {},
            handSignImageData: {},

            signObj: {},
            signatureId: '',
            signatureData: '',
            signatureImg: '',

            chargeBillSigns: [],
            chargeRecords: [],
            supplementInfos: [],

            queryData: {},
        }
    },
    // components: {
    //     'remote-script': () =>
    //         import(/*webpackChunkName:"glob-head"*/ '../../components/remote-script'),
    // },
    created() {},
    mounted() {
        // if (top != self) {
        //     window.addEventListener(
        //         'message',
        //         (event) => {
        //             this.inIframeInit(event.data)
        //         },
        //         false
        //     )
        // }
        // if(this.$route.query.flightId)
        //15645232
        //fbf8cb10-5730-4b0a-bb2f-80efe69c

        //9b68e4e2-03c9-4214-8600-c5441058
        //15637614

        this.inIframeInit(this.$route.query)
        this.resetSignature()
    },
    methods: {
        inIframeInit(data) {
            this.queryData = data
            // sessionStorage.setItem('token', data.token)
            this.getData(data)
        },
        getData({ flightId, chargeBillId }) {
            this.$axios({
                method: 'GET',
                url:
                    '/flight/findFlightAndChargeRecordByFlightId?flightId=' +
                    flightId +
                    '&chargeBillId=' +
                    chargeBillId,
                headers: {
                    IgnoreToken: 'IgnoreToken',
                },
            }).then((res) => {
                console.log(res.data.chargeBill)
                if (res.code != 200) {
                    return false
                }
                this.details = res.data
                this.chargeBillSigns = _.cloneDeep(
                    (this.details.chargeBill.chargeBillConfig &&
                        this.details.chargeBill.chargeBillConfig.dataDictionaryList) ||
                        []
                )
                this.chargeRecords = this.details.chargeBill.chargeRecords || []
                this.supplementInfos = this.details.chargeBill.flightSupplementInfos || []
                let signs = []
                this.details.chargeBill &&
                    this.details.chargeBill.chargeBillSigns.map((list) => {
                        if (list.signId) {
                            signs.push({
                                signatureid: list.signId,
                                signatureData: list.data,
                            })
                        }
                        let obj = _.find(this.chargeBillSigns, { code: list.type })
                        if (obj) {
                            this.$set(obj, 'signatureId', list.signId)
                            this.$set(obj, 'signatureData', list.data)
                            this.$set(obj, 'sid', list.id)
                        }
                    })
                Signature.loadSignatures(signs)
            })
        },
        delSign(signatureid, signatureData) {
            console.log(signatureData)
            for (var key in Signature.list) {
                if (
                    signatureid == key &&
                    Signature.list[signatureid].keysn == signatureData.keysn
                ) {
                    let obj = _.find(this.chargeBillSigns, { signatureId: key })
                    this.$set(obj, 'signatureId', '')
                    this.$set(obj, 'signatureData', '')
                    var signatureCreator = Signature.create()
                    signatureCreator.removeSignature(signatureData.documentid, signatureid)
                    break
                }
            }
            return true
        },
        resetSignature() {
            let that = this
            function delCB(signatureid, signatureData) {
                for (var key in Signature.list) {
                    if (
                        signatureid == key &&
                        Signature.list[signatureid].keysn == signatureData.keysn
                    ) {
                        let obj = _.find(that.chargeBillSigns, { signatureId: key })
                        that.$set(obj, 'signatureId', '')
                        that.$set(obj, 'signatureData', '')
                        var signatureCreator = Signature.create()
                        signatureCreator.removeSignature(signatureData.documentid, signatureid)
                        break
                    }
                }
                return true
            }

            Signature.init({
                //初始化属性
                //keysn:'0741170010110516',
                keysn: '0003',
                delCallBack: this.delSign,
                moveable: false,
                showNoPW: true,
                password: '123456',
                //icon_remove : false,//撤销签章按钮隐藏显示，缺省显示 false不显示。
                //icon_sign : false, //证书信息按钮隐藏显示，缺省显示 false不显示。
                imgtag: 0, //签章类型：0：无; 1:公章; 2:私章; 3:法人章; 4:法人签名; 5:手写签名
                certType: 'server', //设置证书在签章服务器
                sealType: 'server', //设置印章从签章服务器取
                serverUrl: 'http://173.101.1.134:8089/iSignatureHTML5',
                documentid: 'KG2016093001333', //设置文档ID
                documentname: '测试文档KG2016093001', //设置文档名称
                pw_timeout: 's1800', //s：秒；h:小时；d:天
                scaleImage: 1, //签章图片的缩放比例
            })

            var invalidSignatureArray = Signature.verify() //返回无效签章
            if (invalidSignatureArray.length > 0) {
                for (var i = 0; i < invalidSignatureArray.length; i++) {
                    var signature = invalidSignatureArray[i]
                    console.log(signature.modifiedItems) //获取篡改的保护项
                }
            }
        },
        elSignFn(idx, ele) {
            var signatureCreator = Signature.create()
            var that = this

            signatureCreator.handWriteDlg(
                {
                    image_height: '1',
                    image_width: '1.34',
                    onBegin: function () {
                        console.log('onbegin')
                    },
                    onEnd: function () {
                        console.log('onEnd')
                    },
                },
                function (param) {
                    // alert(param.imageData);
                    signatureCreator.runHW(param, {
                        protectedItems: [], // 设置定位页面DOM的id，自动查找ID，自动获取保护DOM的kg-desc属性作为保护项描述，value属性为保护数据。不设置，表示不保护数据，签章永远有效。
                        position: ele, // 设置盖章定位dom的ID，必须设置
                        okCall: function (fn) {
                            // 点击确定后的回调方法，this为签章对象 ,签章数据撤销时，将回调此方法，需要实现签章数据持久化（保存数据到后台数据库）,保存成功后必须回调fn(true/false)渲染签章到页面上
                            that.signObj[this.getSignatureid()] = this.getSignatureData()
                            fn(true)
                            that.$set(
                                that.chargeBillSigns[idx],
                                'signatureId',
                                this.getSignatureid()
                            )
                            that.$set(
                                that.chargeBillSigns[idx],
                                'signatureData',
                                this.getSignatureData()
                            )
                        },
                        cancelCall: function () {
                            // 点击取消后的回调方法
                            console.log('取消！')
                        },
                    })
                }
            )
        },
        saveSign() {
            let arrs = []
            this.chargeBillSigns.map((list) => {
                let src = ''
                if (list.signatureId) {
                    src = document.querySelector('#kg-img-' + list.signatureId).src
                }
                let data = {
                    chargeBillId: this.details.chargeBill.id,
                    signId: list.signatureId,
                    content: src,
                    type: list.code,
                    data: list.signatureData,
                    id: list.sid,
                }
                arrs.push(data)
            })
            this.$axios
                .post(
                    `/charge-bill-sign/saveAll?userId=${this.queryData.userId}&userLoginName=${this.queryData.userLoginName}`,
                    arrs
                )
                .then((res) => {
                    console.log(res)
                    this.$alert(res.msg, '提示', {
                        type: 'success',
                        center: true,
                        customClass: 'h5Alert',
                    })
                })
        },
    },
}
</script>


<style lang="scss">
.h5Alert {
    width: 1200px;
    * {
        font-size: 80px;
    }
    .el-message-box__title {
        height: 150px;
    }
    .el-message-box__message {
        p {
            height: 150px;
            line-height: 150px;
        }
    }
    .el-button {
        padding: 20px 40px;
    }
}
</style>


<style lang="scss" scoped>
// @import '../../../static/kinggrid/dialog/artDialog/ui-dialog.css';
// <link rel="stylesheet" href="./static/kinggrid/dialog/artDialog/ui-dialog.css"><!-- 弹出框css -->
// <link rel="stylesheet" href="./static/kinggrid/core/kinggrid.plus.css"><!-- 核心css -->
// <link rel="stylesheet" href="./static/kinggrid/core/kinggrid.plus.mobile.css"><!-- 手机端css -->

.chargeDetails {
    height: 100%;
    padding: 40px;
    overflow: auto;
    * {
        font-size: 80px;
    }
    .title {
        height: 150px;
        line-height: 150px;
        border-bottom: 1px solid #ccc;
        margin-bottom: 40px;
        color: #3280e7;
    }
    table {
        width: 100%;
        tr {
            height: 140px;
            td {
                font-size: 70px;
                color: #333;
            }
            td:nth-child(1) {
                width: 500px;
            }
            th {
                font-size: 70px;
                color: #000;
            }
        }
    }
    .flightMsg {
        margin-bottom: 60px;
    }
    .list_in {
        display: flex;
    }
    .list_in .label {
        // color: #3280e7;
        font-size: 70px;
        height: 200px;
        line-height: 200px;
        margin-right: 40px;
    }
    .list_in .value {
        font-size: 70px;
        color: red;
        height: 200px;
        line-height: 200px;
    }
    button {
        width: 100%;
        color: #fff;
        background-color: #409eff;
        border: none;
        border-radius: 10px;
        height: 200px;
        margin-top: 100px;
    }
}
</style>