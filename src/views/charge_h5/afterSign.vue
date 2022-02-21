<template>
    <div class="chargeDetails">

        <div class="signBox">
            <div id="afterDiv"></div>
            <div class="clickSign" v-if="!signObj.signId" @click="elSignFn">
                <span>点</span>
                <span>击</span>
                <span>签</span>
                <span>字</span>
            </div>
        </div>

        <div>
<!--            <button @click="saveSign">提交签名</button>-->
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
import '../../components/importJs.js'
export default {
    data() {
        return {
            isElSign: true,
            elSignImageData: {},
            handSignImageData: {},
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
            signObj: {
                content: '',
                data: '',
                signId: '',
            },
            httpUrl: '',
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
        let hostname = location.hostname
        this.httpUrl = `http://${hostname}:6010`
        if (_.includes(hostname, 'localhost') || _.includes(hostname, '127.0.0.1')) {
            this.httpUrl = 'http://173.101.4.3:6010'
        }
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
        getData({ flightId, taskId, token }) {
            this.$axios({
                method: 'GET',
                url:
                    this.httpUrl +
                    '/omms-tf-boardbridge-web/boardbridgeAfterFlightSign/findByTaskId?taskId=' +
                    taskId,
                headers: {
                    token,
                },
            }).then((res) => {
                if (res.responseCode != 1000) {
                    return false
                }
                Signature.loadSignatures([
                    { signatureid: res.data.signId, signatureData: res.data.data },
                ])
                this.signObj = {
                    signId: res.data.signId,
                    data: res.data.data,
                    content: res.data.content,
                }
            })
        },
        delSign(signatureid, signatureData) {
            var signatureCreator = Signature.create()
            signatureCreator.removeSignature(signatureData.documentid, signatureid)
            this.signObj = {
                content: '',
                data: '',
                signId: '',
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
                showSealsDlg:false,
                // serverUrl:'http://173.101.1.134:8089/iSignatureHTML5',

                serverUrl:
                    this.sysEdition == 'shuangliu'
                        ? 'http://173.101.1.134:8089/iSignatureHTML5'
                        : 'http://10.42.66.33:8089/iSignatureHTML5',
                documentid: 'KG2016093001333', //设置文档ID
                documentname: '测试文档KG2016093001', //设置文档名称
                pw_timeout: 's1800', //s：秒；h:小时；d:天
                scaleImage: 1, //签章图片的缩放比例
            })
        },
        elSignFn() {
            var signatureCreator = Signature.create()
            var that = this
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
                        position: 'afterDiv', // 设置盖章定位dom的ID，必须设置
                        okCall: function (fn) {
                            // 点击确定后的回调方法，this为签章对象 ,签章数据撤销时，将回调此方法，需要实现签章数据持久化（保存数据到后台数据库）,保存成功后必须回调fn(true/false)渲染签章到页面上

                            that.signObj.signId = this.getSignatureid()
                            that.signObj.data = this.getSignatureData()
                            fn(true)
                            that.saveSign()
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
            console.log(this.signObj)

            if (!this.signObj.signId) {
                this.$alert('当前无签名项！', '提示', {
                    type: 'error',
                    center: true,
                    customClass: 'h5Alert',
                })
                return false
            }

            this.signObj.content = document.querySelector('#kg-img-' + this.signObj.signId).src
            this.signObj.taskId = this.queryData.taskId

            this.$axios({
                method: 'POST',
                url: this.httpUrl + '/omms-tf-boardbridge-web/boardbridgeAfterFlightSign/save',
                data: this.signObj,
                headers: {
                    token: this.queryData.token,
                },
            }).then((res) => {
                // this.$message.success(res.msg)
                this.$alert(res.msg, '提示', {
                    type: 'success',
                    center: true,
                    customClass: 'h5Alert',
                    callback: () => {
                        return
                        window.WebViewJavascriptBridge.callHandler(
                            'androidBack',
                            '1',
                            function (responseData) {}
                        )
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
    .signBox {
        height: 200px;
    }
    #afterDiv {
    }
    .clickSign {
        height: 200px;
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
        border: 1px dashed #ccc;
        span {
            color: #ccc;
        }
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