<template>
    <div class="boarding_bridge_charge_bill">
        <iframe ref="ref_iframe" id="ifm" :src="iframeSrc" frameborder="0" width="100%" height="100%"></iframe>
    </div>
</template>

<script>
export default {
    data() {
        return {
            iframeSrc: '',
        }
    },
    mounted() {
        let ifm = this.$refs.ref_iframe
        this.iframeSrc = window.location.origin + '/#/charge_bill_iframe'
        let token = sessionStorage.token
        ifm.addEventListener('load', () => {
            ifm.contentWindow.postMessage(
                {
                    token: token,
                    pageType: 'boarding-bridge',
                },
                '*'
            )
        })
    },
}
</script>

<style lang="scss" scoped>
.boarding_bridge_charge_bill {
    height: 100%;
    width: 100%;
}
</style>