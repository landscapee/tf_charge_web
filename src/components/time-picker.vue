<template>
    <div class="timePicker">
        <input ref="ref_year" placeholder="年" type="text" maxlength=4 v-model="year" class="yearInput"
               @keyup="inputKeyup($event,'year','month','')" @blur="yeaBlur">-
        <input ref="ref_month" placeholder="月" type="text" maxlength=2 v-model="month"
               @keyup="inputKeyup($event,'month','day','year')" @blur="monthBlur">-
        <input ref="ref_day" placeholder="日" type="text" maxlength=2 v-model="day"
               @keyup="inputKeyup($event,'day','hours','month')" @blur="dayBlur">
        <input ref="ref_hours" placeholder="时" type="text" maxlength=2 v-model="hours"
               @keyup="inputKeyup($event,'hours','minute','day')" @blur="hoursBlur">:
        <input ref="ref_minute" placeholder="分" type="text" maxlength=2 v-model="minute"
               @keyup="inputKeyup($event,'minute','second','hours')" @blur="minuteBlur">:
        <input ref="ref_second" placeholder="秒" type="text" maxlength=2 v-model="second"
               @keyup="inputKeyup($event,'second','','minute')" @blur="secondBlur">
    </div>
</template>

<script>
import {map} from 'lodash'

export default {
    // props: ['keyName', 'value'],
    props: {
        keyName: {
            type: String,
        },
        objectName: {
            type: String,
        },
        value: {
            type: String,
        },
    },
    data() {
        return {
            year: '',
            month: '',
            day: '',
            hours: '',
            minute: '',
            second: '',

            yearAlert: false,
            monthAlert: false,
        }
    },
    watch: {
        value: function (val) {
            console.log(121, val)

            if (val) {
                let riqishijian = (val || '').split(' ')
                let riqi = riqishijian[0] && riqishijian[0].split('-')
                let shijian = riqishijian[1] && riqishijian[1].split(':')
                let riqiMap = ['year', 'month', 'day']
                let shijianMap = ['hours', 'minute', 'second']
                map(riqi, (k, i) => {
                    this[riqiMap[i]] = k
                });
                map(shijian, (k, i) => {
                    this[shijianMap[i]] = k
                })
                return
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
            let value = _.toNumber(_.trim(this[type]))
            let length = _.trim(this[type]).length
            if (!_.isInteger(value)) {
                this.$alert('时间只能为整数', '提示', {
                    type: 'warning',
                    center: true,
                })
                this[type] = ''
                return
            }
            if (type == 'year') {
                this.$nextTick(() => {
                    if (code == 32) {
                        this.$refs['ref_' + nextType].focus()
                        return
                    }
                    if (length == 4) {
                        this.$refs['ref_' + nextType].focus()
                    }
                })
            }
            if (type == 'month') {
                this.$nextTick(() => {
                    if (code == 8 && length == 0) {
                        this.$refs['ref_' + prevType].focus()
                        return
                    }
                    if (code == 32) {
                        this.$refs['ref_' + nextType].focus()
                        return
                    }

                    if (length == 2) {
                        this.$refs['ref_' + nextType].focus()
                    }
                })
            }
            if (type == 'day') {
                this.$nextTick(() => {
                    if (code == 8 && length == 0) {
                        this.$refs['ref_' + prevType].focus()
                        return
                    }
                    if (code == 32 && length < 2) {
                        this.$refs['ref_' + nextType].focus()
                        return
                    }

                    if (length == 2) {
                        this.$refs['ref_' + nextType].focus()
                    }
                })
            }
            if (type == 'hours') {
                this.$nextTick(() => {
                    if (code == 8 && length == 0) {
                        this.$refs['ref_' + prevType].focus()
                        return
                    }
                    if (code == 32 && length < 2) {
                        this.$refs['ref_' + nextType].focus()
                        return
                    }

                    if (length == 2) {
                        this.$refs['ref_' + nextType].focus()
                    }
                })
            }
            if (type == 'minute') {
                this.$nextTick(() => {
                    if (code == 8 && length == 0) {
                        this.$refs['ref_' + prevType].focus()
                        return
                    }
                    if (code == 32) {
                        this.$refs['ref_' + nextType].focus()
                        return
                    }

                    if (length == 2) {
                        this.$refs['ref_' + nextType].focus()
                    }
                })
            }
            if (type == 'second') {
                this.$nextTick(() => {
                    if (code == 8 && length == 0) {
                        this.$refs['ref_' + prevType].focus()
                        return
                    }
                })
                return
            }
            // this.getValue()
        },
        yeaBlur() {
            let value = parseInt(_.trim(this.year))
            if (value < 1000 || value > 9999) {
                this.$alert('年份只能1000-9999', '提示', {
                    type: 'warning',
                    center: true,
                    callback: () => {
                        this.$refs['ref_year'].focus()
                        this.year = ''
                    },
                })
            }
        },
        monthBlur() {
            let month = _.toNumber(_.trim(this.month))
            if (this.month !== null && this.month !== '' && (month > 12 || month <= 0)) {
                this.$alert('月份只能为01-12', '提示', {
                    type: 'warning',
                    center: true,
                    callback: () => {
                        this.$refs['ref_month'].focus()
                        this.monthAlert = false
                        this.month = ''
                    },
                })
                return
            }

            if (this.month !== null && this.month !== '' && month < 10 && month > 0) {
                this.month = '0' + month
            }
            this.getValue()
        },
        dayBlur() {
            let day = _.toNumber(_.trim(this.day))
            if (this.day !== null && this.day !== '' && (day > 31 || day <= 0)) {
                this.$alert('日期只能01-31', '提示', {
                    type: 'warning',
                    center: true,
                    callback: () => {
                        this.$refs['ref_day'].focus()
                        this.dayAlert = false
                        this.day = ''
                    },
                })
                return
            }

            if (this.day !== null && this.day !== '' && day < 10 && day > 0) {
                this.day = '0' + day
            }
            this.getValue()
        },
        hoursBlur() {
            let hours = _.toNumber(_.trim(this.hours))
            if (hours > 24 || hours < 0) {
                this.$alert('小时只能00-24', '提示', {
                    type: 'warning',
                    center: true,
                    callback: () => {
                        this.$refs['ref_hours'].focus()
                        this.hoursAlert = false
                        this.hours = ''
                    },
                })
                return
            }

            if (this.hours !== null && this.hours !== '' && hours < 10 && hours >= 0) {
                this.hours = '0' + hours
            }
            this.getValue()
        },
        minuteBlur() {
            let minute = _.toNumber(_.trim(this.minute))
            if (minute > 60 || minute < 0) {
                this.$alert('分钟只能00-60', '提示', {
                    type: 'warning',
                    center: true,
                    callback: () => {
                        this.$refs['ref_minute'].focus()
                        this.minuteAlert = false
                        this.minute = ''
                    },
                })
                return
            }

            if (this.minute !== null && this.minute !== '' && minute < 10 && minute >= 0) {
                this.minute = '0' + minute
            }
            this.getValue()
        },
        secondBlur() {
            let second = _.toNumber(_.trim(this.second))
            if (second > 60 || second < 0) {
                this.$alert('秒钟只能0-60', '提示', {
                    type: 'warning',
                    center: true,
                    callback: () => {
                        this.$refs['ref_second'].focus()
                        this.secondAlert = false
                        this.second = ''
                    },
                })
                return
            }
            if (this.second !== null && this.second !== '' && second < 10 && second >= 0) {
                this.second = '0' + second
            }
            this.getValue()
        },
        getValue() {
            let year = _.toNumber(_.trim(this.year))
            let month = _.toNumber(_.trim(this.month))
            let day = _.toNumber(_.trim(this.day))
            let hours = _.toNumber(_.trim(this.hours))
            let minute = _.toNumber(_.trim(this.minute))
            let second = _.toNumber(_.trim(this.second))

            if (year == 0 && month == 0 && day == 0 && hours == 0 && minute == 0 && second == 0) {
                this.$emit('timePickerTime', this.keyName, '')
                return
            }

            if (
                year &&
                month > 0 &&
                day > 0 &&
                hours >= 0 &&
                minute >= 0 &&
                second >= 0 &&
                this.hours &&
                this.minute &&
                this.second
            ) {
                let time = `${this.year}-${this.month}-${this.day} ${this.hours}:${this.minute}:${this.second}`
                this.$emit('timePickerTime', this.objectName, this.keyName, time)
            }
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

