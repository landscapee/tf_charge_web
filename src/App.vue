<template>
    <div style="width:100%;height:100%;">
        <router-view v-if="isRouterShow"/>
    </div>
</template>
<script>
export default {
    data(){
        return{
            isRouterShow: true
        }
    },
    provide () {
        return {
            reload: this.reload
        }
    },
    methods: {
        async reload () {
            this.isRouterShow = false
            await this.$nextTick()
            this.isRouterShow = true
        }
    },
}
</script>
<style lang="scss">
    @import './styles/App.scss';
</style>