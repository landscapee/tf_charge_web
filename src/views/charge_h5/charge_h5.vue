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
        <div class="chargeMsg" v-show="supplementInfos.length>0">
            <div class="title">补充信息</div>
            <table>
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>数据</th>
                        <th>描述</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in supplementInfos" :key="item.id">
                        <td>{{item.supplementTitle}}</td>
                        <td>{{item.valueCode}}</td>
                        <td>{{item.valueTitle}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="chargeMsg" v-if="chargeBillRecordSigns.length>0">
            <div class="title">{{chargeBill.chargeBillConfigName}}</div>
            <table v-for="(data,idx) in chargeBillRecordSigns" :key="idx">
                <thead>
                    <tr>
                        <th>收费</th>
                        <th style="width:80px">数据</th>
                        <th style="width:80px">单位</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in data.chargeRecordList" :key="item.id">
                        <td>{{item.chargeDataSource&&item.chargeDataSource.chargeConfig?item.chargeDataSource.chargeConfig.name:''}}</td>
                        <td>{{item.chargeData}}</td>
                        <td>{{item.chargeDataSource&&item.chargeDataSource.chargeConfig?item.chargeDataSource.chargeConfig.unit:''}}</td>
                    </tr>
                    <tr v-for="(item,index) in dataDictionaryList" :key="index" class="list_in">
                        <div class="label">{{item.name}}签字:</div>
                        <div class="value" :id="'sign'+idx+index" @click="elSignFn(idx,index,'posElSignFn'+idx+index)">点击签字</div>
                        <div style='position:relative'>
                            <div class='list_sign' style="width:100%;position:absolute;top:-20px;left:0">
                                <div :pos="'posElSignFn'+idx+index" :id="'posElSignFn'+idx+index"></div>
                            </div>
                        </div>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="chargeMsg" v-else v-show="chargeBill.preSign">
            <table>
                <tbody>
                    <tr v-for="(item,index) in dataDictionaryList" :key="index" class="list_in">
                        <div class="label">{{item.name}}签字:</div>
                        <div class="value" :id="'sign0'+index" @click="elSignFn(0,index,'posElSignFn0'+index)">点击签字</div>
                        <div style='position:relative'>
                            <div class='list_sign' style="width:100%;position:absolute;top:-20px;left:0">
                                <div :pos="'posElSignFn0'+index" :id="'posElSignFn0'+index"></div>
                            </div>
                        </div>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <button @click="saveSign">提交签名</button>
        </div>

        <remote-script src="/static/kinggrid/core/kinggrid.min.js" type="1" @load="loadJS"></remote-script>
        <remote-script :src="src2" v-if="!!src2" type="2" @load="loadJS"></remote-script>
        <remote-script :src="src3" v-if="!!src3" type="3" @load="loadJS"></remote-script>
        <remote-script :src="src4" v-if="!!src4" type="4" @load="loadJS"></remote-script>
        <remote-script :src="src5" v-if="!!src5" type="5" @load="loadJS"></remote-script>
        <remote-script :src="src6" v-if="!!src6" type="6" @load="loadJS"></remote-script>
        <remote-script :src="src7" v-if="!!src7" type="7" @load="loadJS"></remote-script>
        <remote-script :src="src8" v-if="!!src8" type="8" @load="loadJS"></remote-script>

    </div>
</template>
<script>
import '../../components//importJs.js'
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
            chargeBillSigns: {},

            supplementInfos: [],
            queryData: {},

            chargeBill: {},
            chargeBillRecordSigns: [],
            dataDictionaryList: [],

            src2: '',
            src3: '',
            src4: '',
            src5: '',
            src6: '',
            src7: '',
            src8: '',
            jsType: [],
        }
    },

    created() {},
    mounted() {
        let timer = setInterval(() => {
            if (this.jsType.indexOf('3') >= 0) {
                clearInterval(timer)
                this.inIframeInit(this.$route.query)
                this.resetSignature()
            }
        }, 100)
    },
    methods: {
        loadJS(data) {
            if (data == 1) {
                this.src2 = '/static/kinggrid/core/kinggrid.plus.min.js'
            }
            if (data == 2) {
                this.src3 = '/static/kinggrid/signature.min.js'
            }
            if (data == 3) {
                this.src4 = '/static/kinggrid/password.min.js'
                this.src5 = '/static/kinggrid/signature.mobile.min.js'
                this.src6 = '/static/kinggrid/signature_pad.min.js'
                this.src7 = '/static/kinggrid/html2canvas.min.js'
                this.src8 = '/static/kinggrid/dialog/artDialog/dialog-min.js'
            }
            this.jsType.push(data)
        },
        inIframeInit(data) {
            this.queryData = data
            sessionStorage.setItem('token', data.token)
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
                if (res.code != 200) {
                    return false
                }
                this.details = res.data

                this.chargeBill = res.data.chargeBill
                $('title').text(this.chargeBill.chargeBillConfigName)
                this.supplementInfos = this.details.chargeBill.flightSupplementInfos || []
                this.chargeBillRecordSigns = this.details.chargeBill.chargeBillRecordSigns || []
                this.dataDictionaryList =
                    (this.details.chargeBill.chargeBillConfig &&
                        this.details.chargeBill.chargeBillConfig.dataDictionaryList) ||
                    []
                let signs = []
                if (this.chargeBillRecordSigns.length > 0) {
                    this.chargeBillRecordSigns.forEach((list, index) => {
                        this.chargeBillSigns[index] = {}
                        this.dataDictionaryList.forEach((dictionary, idx) => {
                            let sign = _.find(list.chargeBillSignList, { type: dictionary.code })
                            if (sign) {
                                this.chargeBillSigns[index][idx] = sign
                                if (sign.signId && sign.data) {
                                    signs.push({
                                        signatureid: sign.signId,
                                        signatureData: sign.data,
                                    })
                                }
                            } else {
                                this.chargeBillSigns[index][idx] = {
                                    type: dictionary.code,
                                }
                            }
                        })
                    })
                } else {
                    this.chargeBillSigns[0] = {}
                    this.dataDictionaryList.forEach((dictionary, idx) => {
                        this.chargeBillSigns[0][idx] = {
                            type: dictionary.code,
                        }
                    })
                }

                this.$nextTick(() => {
                    this.showSign()
                })
                Signature.loadSignatures(signs)
            })
        },
        showSign() {
            _.forIn(this.chargeBillSigns, (chargeBillSign, idx) => {
                _.forIn(chargeBillSign, (list, index) => {
                    if (list.signId) {
                        $('#sign' + idx + index).hide()
                    } else {
                        $('#sign' + idx + index).show()
                    }
                })
            })
        },
        delSign(signatureid, signatureData) {
            for (var key in Signature.list) {
                if (
                    signatureid == key &&
                    Signature.list[signatureid].keysn == signatureData.keysn
                ) {
                    _.forIn(this.chargeBillSigns, (chargeBillSign) => {
                        _.forIn(chargeBillSign, (list) => {
                            if (list.signId == key) {
                                this.$set(list, 'signId', '')
                                this.$set(list, 'data', '')
                                this.$set(list, 'content', '')
                                this.showSign()
                            }
                        })
                    })
                    var signatureCreator = Signature.create()
                    signatureCreator.removeSignature(signatureData.documentid, signatureid)
                    break
                }
            }
            return true
        },
        resetSignature() {
            Signature.init({
                //初始化属性
                //keysn:'0741170010110516',
                keysn: 'maintenance',
                delCallBack: this.delSign,
                moveable: false,
                showNoPW: true,
                password: '123456',
                //icon_remove : false,//撤销签章按钮隐藏显示，缺省显示 false不显示。
                //icon_sign : false, //证书信息按钮隐藏显示，缺省显示 false不显示。
                imgtag: 0, //签章类型：0：无; 1:公章; 2:私章; 3:法人章; 4:法人签名; 5:手写签名
                certType: 'server', //设置证书在签章服务器
                sealType: 'server', //设置印章从签章服务器取
                serverUrl:
                    this.sysEdition == 'tianfu'
                        ? 'http://10.42.66.33:8089/iSignatureHTML5'
                        : 'http://173.101.1.134:8089/iSignatureHTML5',
                documentid: 'KG2016093001333', //设置文档ID
                documentname: '测试文档KG2016093001', //设置文档名称
                pw_timeout: 's1800', //s：秒；h:小时；d:天
                scaleImage: 1, //签章图片的缩放比例
            })

            // var invalidSignatureArray = Signature.verify() //返回无效签章
            // if (invalidSignatureArray.length > 0) {
            //     for (var i = 0; i < invalidSignatureArray.length; i++) {
            //         var signature = invalidSignatureArray[i]
            //         console.log(signature.modifiedItems) //获取篡改的保护项
            //     }
            // }
        },
        elSignFn(idx, index, ele) {
            var signatureCreator = Signature.create()
            var that = this

            let dataDictionary = this.dataDictionaryList[index]
            signatureCreator.handWriteDlg(
                {
                    image_height: '1',
                    image_width: '1.34',
                    onBegin: function () {
                        // console.log('onbegin')
                    },
                    onEnd: function () {
                        // console.log('onEnd')
                    },
                },
                function (param) {
                    signatureCreator.runHW(param, {
                        protectedItems: [], // 设置定位页面DOM的id，自动查找ID，自动获取保护DOM的kg-desc属性作为保护项描述，value属性为保护数据。不设置，表示不保护数据，签章永远有效。
                        position: ele, // 设置盖章定位dom的ID，必须设置
                        okCall: function (fn) {
                            // 点击确定后的回调方法，this为签章对象 ,签章数据撤销时，将回调此方法，需要实现签章数据持久化（保存数据到后台数据库）,保存成功后必须回调fn(true/false)渲染签章到页面上

                            fn(true)
                            that.$set(
                                that.chargeBillSigns[idx][index],
                                'signId',
                                this.getSignatureid()
                            )
                            that.$set(
                                that.chargeBillSigns[idx][index],
                                'data',
                                this.getSignatureData()
                            )
                            that.$set(that.chargeBillSigns[idx][index], 'type', dataDictionary.code)

                            that.showSign()
                            // that.signObj[this.getSignatureid()] = this.getSignatureData()
                        },
                        cancelCall: function () {
                            // 点击取消后的回调方法
                            // console.log('取消！')
                        },
                    })
                }
            )
        },
        saveSign() {
            let arrs = []
            console.log(this.chargeBillSigns)
            _.forIn(this.chargeBillSigns, (chargeBillSign, key) => {
                _.forIn(chargeBillSign, (list, key) => {
                    let src = ''
                    if (list.signId) {
                        src = document.querySelector('#kg-img-' + list.signId).src
                    }
                    let data = {
                        chargeBillId: this.details.chargeBill.id,
                        signId: list.signId,
                        content: src,
                        type: list.type,
                        data: list.data,
                        id: list.id,
                    }
                    arrs.push(data)
                })
            })

            if (arrs.legnth == 0) {
                this.$alert('当前无签名项！', '提示', {
                    type: 'error',
                    center: true,
                    customClass: 'h5Alert',
                })
                return false
            }
            this.$axios
                .post(`/charge-bill-sign/saveAll?chargeBillId=${this.queryData.chargeBillId}`, arrs)
                .then((res) => {
                    this.$alert(res.msg, '提示', {
                        type: 'success',
                        center: true,
                        customClass: 'h5Alert',
                        callback: () => {
                            window.androidBack()
                        },
                    })
                })
        },
    },
}
</script>


<style lang="scss">
#nameid {
    width: 400px;
}
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
    .el-message-box__status {
        font-size: 100px !important;
    }
}
</style>

<style lang="scss" scoped>
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
            td,
            th {
                padding: 30px 0;
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
    .chargeMsg {
        tr {
            border-bottom: 1px solid #ccc;
        }
        .list_in {
            border: none;
        }
    }
    .flightMsg {
        margin-bottom: 60px;
    }
    .list_in {
        display: flex;
        height: 200px;
        width: 100%;
        align-items: center;
    }
    .list_in .label {
        color: #3280e7;
        font-size: 70px;
        height: 200px;
        line-height: 200px;
        margin-right: 40px;
        white-space: nowrap;
    }
    .list_in .value {
        font-size: 70px;
        color: red;
        height: 200px;
        line-height: 200px;
        white-space: nowrap;
    }
    .list_sign {
        height: 200px;
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