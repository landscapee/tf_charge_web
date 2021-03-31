const sysMsg = {
    state: { 
        serverTime:null,
        userMsg:null,
        flightTpye:{
            "0":"播种",
            "1":"表演",
            "2":"航摄",
            "3":"灭火",
            "4":"农化",
            "5":"试航",
            "6":"降雨",
            "7":"护林",
            "8":"校飞",
            "9":"其它",
            "-":"支线",
            "#":"未知",
            "(":"客加",
            ")":"货加",
            "*":"日航",
            "?":"地航",
            "[":"B/W",
            "\\":"摩发",
            "]":"养调",
            "^":"采矿",
            "|":"鱼苗",
            "+":"熟练",
            "=":"磁测",
            "A":"专机",
            "B":"备降",
            "C":"普加",
            "D":"带飞",
            "E":"急救",
            "F":"校验",
            "G":"技术",
            "H":"货包",
            "I":"要客",
            "J":"班专",
            "K":"本训",
            "L":"包机",
            "M":"视察",
            "N":"调机",
            "O":"货加",
            "P":"首飞",
            "Q":"补班",
            "R":"返航",
            "S":"试飞",
            "T":"训练",
            "U":"公务",
            "V":"转场",
            "W":"正班",
            "X":"测试",
            "Y":"夜航",
            "Z":"货班",
        },
        flightStatus:{
            'ALT':"备降",
            "ARR":"到达",
            "BOR":"登机",
            "CAN":"取消",
            "CAN001":"取消(外站天气)",
            "CANCEL":"航班取消",
            "CKI":"正在值机",
            "CKOFF":"值机截止",
            "DELAY":"航班延误",
            "DEP":"起飞",
            "DLY":"延误",
            "DLY001":"延误(天气-本站)",
            "DLY002":"延误(飞机晚到)",
            "DLY003":"延误(无时)",
            "DLY004":"延误(流控)",
            "DLY005":"延误(航行管制)",
            "DLY006":"延误(飞机调配)",
            "DLY007":"延误(航路天气)",
            "DLY008":"延误(对方天气)",
            "DLY009":"延误(飞机周转)",
            "DLY010":"延误(飞机机械)",
            "DLY011":"延误(旅客)",
            "DLY012":"延误(通信)",
            "DLY013":"延误(公务)",
            "DLY014":"延误(航路)",
            "DLY015":"延误(航空)",
            "EARR":"预计到达",
            "EDEP":"预计起飞",
            "FBAG":"首行李",
            "LBAG":"末行李",
            "NST":"到下站",
            "OFFSTAND":"下轮挡",
            "ONR":"前起",
            "ONSTAND":"上轮挡",
            "PEND":"正常",
            "POK":"关闭",
            "RCFLOP":"正常",
            "RTN":"返航",
            "SCHD":"初始状态",
            "TBR":"过站登机",
            "URBOR":"催登",
        },
        movement:{
            'A':"到达",
            'D':"离港"
        },
        flightIndicator:{
            "D":'国内',
            "M":'混合',
            "R":'地区',
            "I":'国际',
        },
        monitorShowName: {
            actualTime: '实际时间',
            expectTime: '预计时间',
            scheduleTime: '计划时间'
        },
        monitorType:null,
        ElecFlightStatus:{
            'NAC':'未激活',
            'OVE':'入位',
            'TOD':'落地',
            'BAC':'滑回',
            'PRE':'激活',
            'RDY':'准备好',
            'REQ':'申请放行',
            'LIN':'上跑道',
            'CTL':'管制',
            'TAX':'滑行',
            'FCL':'未管制',
            'BRK':'起飞中断',
            'TKF':'起飞',
            'CLD':'已发放行',
            'NPU':'未推出',
            'P^S':"推出开车",
            'PUS':'推出',
            'TTX':'塔台滑行',
            'STR':'开车',
            'LND':'降落',
            'FIN':'管制结束',
        }

    },
    mutations: {
        setUserMsg:(state,data)=>{
            state.userMsg = data
        },
        setServerTime:(state,data)=>{
            state.serverTime = new Date(data)
        },
        setMonitorType:(state,data)=>{
            state.monitorType = data
        },
        resetStore:(state)=>{
            state.userMsg = null
            state.serverTime = null
            state.monitorType = null
        }
    },
    getters: {
        getElecFlightStatus:(state)=>{
            return state.ElecFlightStatus
        },
        getMonitorType:(state)=>{
            return state.monitorType
        },
        getServerTime:(state)=>{
            return state.serverTime
        },
        getUserMsg:(state)=>{
            return state.userMsg
        },
        getflightTpye:(state)=>{
            return state.flightTpye
        },
        getflightStatus:(state)=>{
            return state.flightStatus
        },
        getFlightIndicator:(state)=>{
            return state.flightIndicator
        },
        getMovement:(state)=>{
            return state.movement
        },
        /**
         * @describe 获取航班类型键值翻译
         * @param { String } [key] 键
         * @return { String } [] 键值
        **/
        getFlightTpyeByKey: (state) => (key) => {
            return state.flightTpye[key] || '--'
        },
        /**
         * @describe 获取航班状态键值翻译
         * @param { String } [key] 键
         * @return { String } [] 键值
        **/
        getFlightStatusByKey: (state) => (key) => {
            return state.flightStatus[key] || '--'
        },
        /**
         * @describe 获取航班飞行区域键值翻译
         * @param { String } [key] 键
         * @return { String } [] 键值
        **/
        getFlightIndicatorByKey: (state) => (key) => {
            return state.flightIndicator[key] || '--'
        },
        /**
         * @describe 获取时间配置键值翻译
         * @param { String } [key] 键
         * @return { String } [] 键值
        **/
        getMonitorShowNameByKey: (state) => (key) => {
            return state.monitorShowName[key] || '--'
        },
    }
}

export default sysMsg