<template>
    <div class="timePicker">
        <input ref="ref_year" placeholder="年" type="text" maxlength=4 v-model="year" class="yearInput" @keyup="inputKeyup($event,'year','month','')" @blur="yeaBulr">-
        <input ref="ref_month" placeholder="月" type="text" maxlength=2 v-model="month" @keyup="inputKeyup($event,'month','day','year')">-
        <input ref="ref_day" placeholder="日" type="text" maxlength=2 v-model="day" @keyup="inputKeyup($event,'day','hours','month')">
        <input ref="ref_hours" placeholder="时" type="text" maxlength=2 v-model="hours" @keyup="inputKeyup($event,'hours','minute','day')">:
        <input ref="ref_minute" placeholder="分" type="text" maxlength=2 v-model="minute" @keyup="inputKeyup($event,'minute','second','hours')">:
        <input ref="ref_second" placeholder="秒" type="text" maxlength=2 v-model="second" @keyup="inputKeyup($event,'second','','minute')">
    </div>
</template>

<script>
export default {
    props: ['keyName', 'value'],
    data() {
        return {
            year: '',
            month: '',
            day: '',
            hours: '',
            minute: '',
            second: '',
        }
    },
    watch: {
        value: function (val) {
            console.log(val)

            if (val) {
                let date = new Date(val)
                this.year = date.getFullYear()
                let month = date.getMonth() + 1
                let day = date.getDate()
                let hours = date.getHours()
                let minute = date.getMinutes()
                let second = date.getSeconds()

                if (month < 10) {
                    month = 0 + '' + month
                }
                if (day < 10) {
                    day = 0 + '' + day
                }
                if (hours < 10) {
                    hours = 0 + '' + hours
                }
                if (minute < 10) {
                    minute = 0 + '' + minute
                }
                if (second < 10) {
                    second = 0 + '' + second
                }
                this.month = month
                this.day = day
                this.hours = hours
                this.minute = minute
                this.second = second
            } else {
                this.year = ''
                this.month = ''
                this.day = ''
                this.hours = ''
                this.minute = ''
                this.second = ''
            }
        },
    },
    methods: {
        inputKeyup(event, type, nextType, prevType) {
            let code = event.keyCode
            let num = 2
            if (type == 'year') {
                num = 4
            }
            if (this[type] === '') {
                return
            }
            let value = parseInt(this[type])

            if (!_.isInteger(value)) {
                this.$alert('时间只能为整数', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }

            if (type == 'month' && (value < 1 || value > 12)) {
                this[type] = ''
                this.$alert('月份只能为1-12', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            if (type == 'day' && (value < 1 || value > 31)) {
                this[type] = ''
                this.$alert('日期只能1-31', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            if (type == 'hours' && (value < 0 || value > 24)) {
                this[type] = ''
                this.$alert('小时只能0-24', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            if (type == 'minute' && (value < 0 || value > 60)) {
                this[type] = ''
                this.$alert('分钟只能0-60', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            if (type == 'second' && (value < 0 || value > 60)) {
                this[type] = ''
                this.$alert('秒钟只能0-60', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            this.$nextTick(() => {
                if (code == 8) {
                    if (prevType && this[type].length == 0) {
                        this.$refs['ref_' + prevType].focus()
                    }
                } else {
                    if (nextType && (this[type].length == num || code == 32)) {
                        this.$refs['ref_' + nextType].focus()
                    }
                }
                this.getValue()
            })
        },
        yeaBulr() {
            let value = parseInt(this.year)
            if (value < 1000 || value > 9999) {
                this['year'] = ''
                this.$refs['ref_year'].focus()
                this.$alert('年份只能1000-9999', '提示', {
                    type: 'warning',
                    center: true,
                })
            }
        },

        getValue() {
            let year = this.year
            let month = this.month
            let day = this.day
            let hours = this.hours
            let minute = this.minute
            let second = this.second
            let time = ''
            if (year && month && day && hours && minute && second) {
                if (month.length == 1) {
                    month = 0 + this.month
                }
                if (day.length == 1) {
                    console.log(day)
                    day = 0 + this.day
                }
                if (hours.length == 1) {
                    hours = 0 + this.hours
                }
                if (minute.length == 1) {
                    minute = 0 + this.minute
                }
                if (second.length == 1) {
                    second = 0 + this.second
                }

                time = `${year}-${month}-${day} ${hours}:${minute}:${second}`
            }

            this.$emit('timePickerTime', this.keyName, time)
        },
    },
}
</script>


<style scoped lang="scss">
.timePicker {
    display: flex;
    align-items: center;
    border: 1px solid #dcdfe6;
    background: #fff;
    border-radius: 4px;
    padding: 0 5px;
    height: 40px;
    font-weight: 600;
    input {
        height: 38px;
        border: none !important;
        text-align: center;
        width: 30px;
        font-weight: 400;
        outline: none;
    }
    .yearInput {
        width: 40px;
    }
}
</style>

