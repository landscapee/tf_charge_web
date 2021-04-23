// 导入外部js
import Vue from 'vue'
 
Vue.component('remote-script', {
    render: function (createElement) {
        var self = this;
        return createElement('script', {
            attrs: {
                type: 'text/javascript',
                src: this.src
            },
            on: {
                load: function (event) {
                    self.$emit('load', self.type);
                },
                error: function (event) {
                    self.$emit('error', event);
                },
                readystatechange: function (event) {
                    if (this.readyState == 'complete') {
                        self.$emit('load', event);
                    }
                }
            }
        });
    },
    props: {
        src: {
            type: String,
            required: true
        },
        type: {
            type: String,

        }
    },
    watch: {
        src: function (val) {
            this.$createElement("script", {
                attrs: {
                    type: 'text/javascript',
                    src: val
                },
                on: {
                    // load: function (event) {
                    //     self.$emit('load', self.type);
                    // },
                    // error: function (event) {
                    //     self.$emit('error', event);
                    // },
                    // readystatechange: function (event) {
                    //     if (this.readyState == 'complete') {
                    //         self.$emit('load', event);
                    //     }
                    // }
                }
            })
        }
    }
    
});