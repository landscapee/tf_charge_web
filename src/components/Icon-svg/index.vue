<template>
    <svg class="svg-icon" aria-hidden="true" :style="'color:'+iconColor">
        <use :xlink:href="iconName"></use>
    </svg>
</template>

<script>
export default {
    name: 'icon-svg',
    props: {
        iconClass: {
            type: String,
            required: true,
        },
        iconColor: {
            type: String,
            required: false,
        },
    },
    computed: {
        iconName: function () {
            return '#icon-' + this.iconClass
        },
    },
}
</script>
