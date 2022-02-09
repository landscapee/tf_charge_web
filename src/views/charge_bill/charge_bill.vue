<template>
    <div id="project" class="rightBoxContent" v-loading="loading" element-loading-text="加载中...">
        <div class="topBox">
            <ul class="navBox">
                <li>
                    <div></div>
                    <div class="mid one">{{ flagNav ? flagNav.name : '收费单' }}</div>
                    <div>
                    </div>
                </li>
            </ul>
            <el-button type="primary" size="mini" v-show="qzjyShow">
                <el-link :href="qzsbUrl" target="_blank" :underline="false" style="color:#fff">桥载校验</el-link>
            </el-button>
        </div>
        <div class="searchBox">
            <div class="leftBox">
                <div>
                    <el-date-picker v-model="searchTime" type="datetimerange" range-separator="至"
                                    start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
                                    value-format="yyyy-MM-dd HH:mm:ss" @change="handleLists"
                                    :default-time="['00:00:00', '23:59:59']"></el-date-picker>
                </div>
                <div>
                    <el-select v-model="searchDel" placeholder="请选择" @change="handleLists">
                        <el-option label="正常" :value="false"></el-option>
                        <el-option label="已删除" :value="true"></el-option>
                    </el-select>
                </div>
                <div>
                    <ul class="radioApproval">
                        <li :class="searchApproval===false?'active':''"
                            @click="searchApproval=searchApproval===false?'':false">待审批
                        </li>
                        <li :class="searchApproval===true?'active':''"
                            @click="searchApproval=searchApproval===true?'':true">审批完成
                        </li>
                    </ul>
                </div>
                <div>
                    <ul class="radioApproval" v-if="sendShow">
                        <li :class="searchSend===false?'active':''"
                            @click="searchSend=searchSend===false?'':false;handleLists()">未发送
                        </li>
                        <li :class="searchSend===true?'active':''"
                            @click="dealSend">已发送
                        </li>
                    </ul>
                </div>
                <div>
                    <el-input placeholder="机位查询" v-model="searchSeat" @keyup.enter.native="handleLists"
                              style="width:90px"/>
                </div>
                <div>
                    <el-input placeholder="机号查询" v-model="searchAircraftNo" @keyup.enter.native="handleLists"
                              style="width:90px"/>
                </div>
                <div>
                    <el-input placeholder="航班号/航司" v-model="searchStr" @keyup.enter.native="handleLists"
                              style="width:110px"/>
                </div>
                <div v-if="chargeBillArrs.length>1">
                    <el-select v-model="searchBillCodes" clearable multiple collapse-tags placeholder="收费单选择"
                               style="width:150px" @change="handleLists">
                        <el-option v-for="item in chargeBillArrs" :key="item.code" :label="item.name"
                                   :value="item.code"></el-option>
                    </el-select>
                </div>
                <div v-show="unsendCount>0">

                    <el-button :class="getSendS?'':'sendClassSelect'" :type="getSendS?'danger':''"  @click="getUnSendHandle">
                        {{ sendShow ? '昨日未发送' + unsendCount + '个' : '昨日未审批' + unsendCount + '个' }}
                    </el-button>
                </div>
            </div>
            <div class="rightBox">
                <el-button type="primary" @click="sendSelect" v-show="searchSend===false" v-if="sendShow">发送</el-button>
                <el-button type="primary" @click="handleLists">刷新</el-button>
                <!-- <el-button type="primary" @click="add('')">补录</el-button>
                <el-button type="primary" @click="sendSelect" v-show="searchSend===false" v-if="sendShow">发送</el-button>
                <el-button type="primary" @click="approvalSelect" v-show="powerData.charge_approval">批量审批</el-button>
                <el-button type="primary" @click="delBillSelect" v-show="powerData.charge_delete&&!searchDel">批量删除</el-button>
                <el-button type="primary" @click="handleLists">刷新</el-button> -->

                <el-dropdown size="medium" type="primary" @command="pageCommand">
                    <el-button type="primary">更多<i class="el-icon-arrow-down el-icon--right"></i></el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="0">补录</el-dropdown-item>
                        <el-dropdown-item command="2" v-show="powerData.charge_approval" divided>批量审批</el-dropdown-item>
                        <el-dropdown-item command="3" divided>批量删除</el-dropdown-item>

                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <!-- :span-method="arraySpanMethod" -->
                <el-table :data="lists" border stripe style="width: 100%" :max-height="maxHeight"
                          :highlight-current-row="true" :row-class-name="getRowClass"
                          @selection-change="listSelectionChange" :expand-row-keys="expends" row-key="id"
                          @sort-change="sortChange" ref="ref_chargeBill" @row-dblclick="openChargeRecord">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <div class="bill_expand">
                                <div class="bill_expand_Box"
                                     v-show="scope.row.chargeRecords&&scope.row.chargeRecords.length>0">
                                    <div class="title">收费数据</div>
                                    <el-table class="outtable" :data="scope.row.chargeRecords" border stripe
                                              style="width: 100%"
                                              :row-class-name="(data)=>{return getRowName(data,scope)}"
                                              :cell-class-name="getCellClassname">
                                        <el-table-column label="收费项" align="center" class-name="indexTd">
                                            <template slot-scope="scope1">

                                                {{
                                                    scope1.row.chargeDataSource && scope1.row.chargeDataSource.chargeConfig ? scope1.row.chargeDataSource.chargeConfig.name : ''
                                                }}
                                                <div class="blue"
                                                     v-for="(item,index) in getStatusChildMark__(scope1.row,scope)"
                                                     :key="index+'C'">
                                                    <el-tooltip class="item" effect="dark" :content="item.c"
                                                                placement="top-start">
                                                        <span>{{ item.d }}</span>
                                                    </el-tooltip>
                                                </div>

                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="dataSourceSort" label="来源" align="center"
                                                         v-if="scope.row.chargeBillConfigCode=='LANQ'" width="60">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div>{{ getSourceName(scope1.row) }}</div>
                                                    <div v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                        {{ getSourceName(scope1.row.relateRecord) }}
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="deviceCode" label="设备号" align="center"
                                                         v-if="scope.row.showDevice">
                                            <template slot-scope="{row}">
                                                <div>
                                                    <div>{{ row.deviceCode ? row.deviceCode : '--' }}</div>
                                                    <div v-if="row.dataSourceSort===0&&row.relateRecord">
                                                        {{ row.relateRecord.deviceCode }}
                                                    </div>
                                                </div>

                                            </template>
                                        </el-table-column>

                                        <template v-if="scope.row.chargeBillConfigCode=='LANQ'">
                                            <el-table-column prop="afterStartTime" label="航后开始" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.afterStartTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                            {{
                                                                getTimeByFormat(scope1.row.afterStartTime, 'hh:mm:ss(DD)')
                                                            }}
                                                        </div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.relateRecord.afterStartTime,'YY年MM月DD日 hh时mm分ss秒')"
                                                            v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                            {{
                                                                getTimeByFormat(scope1.row.relateRecord.afterStartTime, 'hh:mm:ss(DD)')
                                                            }}
                                                        </div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="afterEndTime" label="航后结束" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.afterEndTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                            {{
                                                                getTimeByFormat(scope1.row.afterEndTime, 'hh:mm:ss(DD)')
                                                            }}
                                                        </div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.relateRecord.afterEndTime,'YY年MM月DD日 hh时mm分ss秒')"
                                                            v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                            {{
                                                                getTimeByFormat(scope1.row.relateRecord.afterEndTime, 'hh:mm:ss(DD)')
                                                            }}
                                                        </div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="startTime" label="接桥时间" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.startTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                            {{ getTimeByFormat(scope1.row.startTime, 'hh:mm:ss(DD)') }}
                                                        </div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.relateRecord.startTime,'YY年MM月DD日 hh时mm分ss秒')"
                                                            v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                            {{
                                                                getTimeByFormat(scope1.row.relateRecord.startTime, 'hh:mm:ss(DD)')
                                                            }}
                                                        </div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="endTime" label="撤桥时间" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.endTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                            {{ getTimeByFormat(scope1.row.endTime, 'hh:mm:ss(DD)') }}
                                                        </div>
                                                        <div
                                                            :title="getTimeByFormat(scope1.row.relateRecord.endTime,'YY年MM月DD日 hh时mm分ss秒')"
                                                            v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                            {{
                                                                getTimeByFormat(scope1.row.relateRecord.endTime, 'hh:mm:ss(DD)')
                                                            }}
                                                        </div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="startStaffName" label="接桥人员" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div>
                                                            {{
                                                                scope1.row.startStaffName ? scope1.row.startStaffName : '--'
                                                            }}
                                                        </div>
                                                        <div
                                                            v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                            {{ scope1.row.relateRecord.startStaffName }}
                                                        </div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="endStaffName" label="撤桥人员" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div>
                                                            {{
                                                                scope1.row.endStaffName ? scope1.row.endStaffName : '--'
                                                            }}
                                                        </div>
                                                        <div
                                                            v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                            {{ scope1.row.relateRecord.endStaffName }}
                                                        </div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                        </template>
                                        <el-table-column label="开始时间" align="center"
                                                         v-if="scope.row.chargeBillConfigCode!='LANQ'&&scope.row.chargeBillConfigCode!='QZSB'">
                                            <template slot-scope="scope1">
                                                <div
                                                    :title="getTimeByFormat(scope1.row.startTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                    {{ getTimeByFormat(scope1.row.startTime, 'hh:mm:ss(DD)') }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="结束时间" align="center"
                                                         v-if="scope.row.chargeBillConfigCode!='LANQ'&&scope.row.chargeBillConfigCode!='QZSB'">
                                            <template slot-scope="scope1">
                                                <div :title="getTimeByFormat(scope1.row.endTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                    {{ getTimeByFormat(scope1.row.endTime, 'hh:mm:ss(DD)') }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="时间" align="center"
                                                         v-if="scope.row.chargeBillConfigCode=='QZSB'">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div
                                                        :title="getTimeByFormat(scope1.row.startTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                        {{ getTimeByFormat(scope1.row.startTime, 'hh:mm:ss(DD)') }}
                                                    </div>
                                                    <div
                                                        :title="getTimeByFormat(scope1.row.endTime,'YY年MM月DD日 hh时mm分ss秒')">
                                                        {{ getTimeByFormat(scope1.row.endTime, 'hh:mm:ss(DD)') }}
                                                    </div>
                                                </div>

                                            </template>
                                        </el-table-column>

                                        <el-table-column prop="chargeData" label="收费数据" align="center">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div>{{ getChargeData(scope1.row) }}</div>
                                                    <div v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">
                                                        {{ getChargeData(scope1.row.relateRecord) }}
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="航后签章" align="center" class-name="signBox"
                                                         v-if="scope.row.chargeBillConfigCode=='LANQ'">
                                            <template slot-scope="scope1">
                                                <div class="signDiv">
                                                    <img :src="scope1.row.afterFlightSign" alt="">
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="航空公司" align="center" class-name="signBox"
                                                         v-if="getSignColShow('hkgs',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'hkgs')" :key="idx"
                                                         class="signDiv">
                                                        <img :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作人员" align="center" class-name="signBox"
                                                         v-if="getSignColShow('czry',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'czry')" :key="idx"
                                                         class="signDiv">
                                                        <img class="signBox" :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="机组人员" align="center" class-name="signBox"
                                                         v-if="getSignColShow('jzry',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'jzry')" :key="idx"
                                                         class="signDiv">
                                                        <img :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="调度人员" align="center" class-name="signBox"
                                                         v-if="getSignColShow('ddry',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'ddry')" :key="idx"
                                                         class="signDiv">
                                                        <img :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作人" align="center"
                                                         v-if="scope.row.chargeBillConfigCode!='LANQ'">
                                            <template slot-scope="{row}">
                                                <div>{{ getOperatorName(row) }}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="审核人" align="center">
                                            <template slot-scope="{row}">
                                                <div>{{ row.approvalPersonnel ? row.approvalPersonnel : '--' }}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="其他数据" align="center" width="100">
                                            <template slot-scope="{row}">
                                                <el-popover placement="left" trigger="hover">
                                                    <table class="sumTable" border="1">
                                                        <tr>
                                                            <td style="padding:10px 20px">发送人</td>
                                                            <td style="padding:10px 20px">
                                                                {{ row.sendPersonnel ? row.sendPersonnel : '--' }}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">发送时间</td>
                                                            <td style="padding:10px 20px">
                                                                {{ getTimeByFormat(row.sendTime, 'hh:mm:ss(DD)') }}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">补录人</td>
                                                            <td style="padding:10px 20px">
                                                                {{
                                                                    row.supplementPersonnel ? row.supplementPersonnel : '--'
                                                                }}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">变更人</td>
                                                            <td style="padding:10px 20px">
                                                                {{ row.changePersonnel ? row.changePersonnel : '--' }}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">变更时间</td>
                                                            <td style="padding:10px 20px">
                                                                {{ getTimeByFormat(row.changeTime, 'hh:mm:ss(DD)') }}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <el-button slot="reference" type="primary" size="mini">查看
                                                    </el-button>
                                                </el-popover>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="remark" label="备注" align="center">
                                            <template slot-scope="{row}">
                                                <div :title="row.remark">{{ row.remark ? row.remark : '--' }}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" align="center" v-if="!searchDel" class-name="optBox"
                                                         width="90">
                                            <template slot-scope="scope1">

                                                <el-button type="text" title="编辑"
                                                           @click="edit('edit',scope1.row,scope.row)"
                                                           :disabled="!!scope1.row.send"
                                                           v-show="getPower(scope1.row,'charge_edit')">编辑
                                                </el-button>
                                                <el-dropdown trigger="click" style="margin-left:.1rem;">
                                                    <el-button type="text" title="更多" class="el-dropdown-link">更多
                                                    </el-button>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item>
                                                            <el-button type="text"
                                                                       :title="scope1.row.approvalStatus=='PASS'?'取消审批':'审批'"
                                                                       @click="approval(scope1.row,'sign',scope1.row.approvalStatus=='PASS')"
                                                                       :disabled="!!scope1.row.send"
                                                                       v-show="getPower(scope.row,'charge_approval')">
                                                                {{
                                                                    scope1.row.approvalStatus == 'PASS' ? '取消审批' : '审批'
                                                                }}
                                                            </el-button>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item>
                                                            <el-button type="text" title="删除" @click="del(scope1.row)"
                                                                       :disabled="!!(scope1.row.approvalStatus=='PASS')"
                                                                       v-show="getPower(scope1.row,'charge_delete')">删除
                                                            </el-button>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item>
                                                            <el-button type="text" title="历史"
                                                                       @click="history(scope1.row)">历史
                                                            </el-button>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item>
                                                            <el-button type="text" title="发送日志"
                                                                       @click="sendLog(scope1)">日志
                                                            </el-button>
                                                        </el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" align="center" v-else class-name="optBox"
                                                         width="100">
                                            <template slot-scope="scope1">
                                                <el-button type="text" title="历史" @click="history(scope1.row)">历史
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                                <div class="bill_expand_Box1"
                                     v-show="getChargeBill(scope.row)&&getChargeBill(scope.row).length>0">
                                    <el-form :inline="true" class="demo-form-inline">
                                        <el-form-item :class="getitemClass(item)" :label="item.supplementTitle+':'"
                                                      v-for="(item,idx) in getChargeBill(scope.row) " :key="idx+'qwe'">
                                             <input class="myChargeInput__" v-model="item.valueTitle" :disabled="!!scope.row.approvalStatus"
                                                   v-if="item.type===0||item.type===1"
                                                   :type="item.type===0?'number':'text'"
                                                   @keyup.enter="saveSupplement(item)"
                                            >
                                            <el-select v-model="item.valueCode" :disabled="!!scope.row.approvalStatus"
                                                       v-else placeholder="请选择" filterable
                                                       :multiple="item.type===2?false:true"
                                                       @change="saveSupplement(item,scope.row)">
                                                <el-option
                                                    v-for="select in getSupplementOption(item.supplementInfoConfig)"
                                                    :key="select.code" :label="select.describe"
                                                    :value="select.code"></el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-form>
                                </div>

                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="序号" width="100" align="center" class-name="indexTd">
                        <template slot-scope="scope">
                            {{ (submitData.current - 1) * submitData.size + scope.$index + 1 }}
                            <div v-show="scope.row.chargeRecords&&scope.row.chargeRecords.length>0">费</div>
                            <div v-show="scope.row.flightSupplementInfos&&scope.row.flightSupplementInfos.length>0">补

                            </div>
                            <div   >
                                <el-tooltip class="item" effect="dark" :content="getBuildModeMark(scope.row).c" placement="top-start">
                                    <span>{{ getBuildModeMark(scope.row).d }}</span>
                                </el-tooltip>
                            </div>
                            <div class="blue" v-for="(item,index) in getStatusMark__(scope.row)" :key="index+'q'">
                                <el-tooltip class="item" effect="dark" :content="item.c" placement="top-start">
                                    <span>{{ item.d }}</span>
                                </el-tooltip>
                            </div>

                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="chargeBillConfigName" label="名称" sortable='custom'></el-table-column>
                    <el-table-column label="计划时间">
                        <template slot-scope="scope">
                            <div>
                                {{
                                    getTimeByFormat(getRowFlightLoading(scope.row)['A'].scheduleTime, 'YY-MM-DD hh:mm')
                                }}
                            </div>
                            <div>
                                {{
                                    getTimeByFormat(getRowFlightLoading(scope.row)['D'].scheduleTime, 'YY-MM-DD hh:mm')
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="实际时间">
                        <template slot-scope="scope">
                            <div>
                                {{ getTimeByFormat(getRowFlightLoading(scope.row)['A'].actualTime, 'YY-MM-DD hh:mm') }}
                            </div>
                            <div>
                                {{ getTimeByFormat(getRowFlightLoading(scope.row)['D'].actualTime, 'YY-MM-DD hh:mm') }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="seat" label="机位" sortable='custom' width="80">
                        <template slot-scope="scope">
                            <div>
                                {{
                                    scope.row.seat == getActiveFlight(scope).seat ? scope.row.seat : (scope.row.seat ? scope.row.seat + "(" + getActiveFlight(scope).seat + ")" : "(" + getActiveFlight(scope).seat + ")")
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="flightNo" label="航班号" sortable='custom'>
                        <template slot-scope="scope">
                            <div>
                                {{
                                    getActiveFlight(scope).flightNo
                                }}({{
                                    getActiveFlight(scope).successionFlightNo ? getActiveFlight(scope).successionFlightNo : '--'
                                }})
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="aircraftNo" label="机号" sortable='custom' width="110">
                        <template slot-scope="scope">
                            <div>
                                {{
                                    scope.row.aircraftNo == getActiveFlight(scope).aircraftNo ? scope.row.aircraftNo : (scope.row.aircraftNo ? scope.row.aircraftNo + "(" + getActiveFlight(scope).aircraftNo + ")" : "(" + getActiveFlight(scope).aircraftNo + ")")
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="aircraftType" label="机型" sortable='custom' width="80">
                        <template slot-scope="scope">
                            <div>{{ getActiveFlight(scope).aircraftType }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="movement" label="进/离" width="70" sortable='custom'>
                        <template slot-scope="{row}">
                            <div>{{ row.flight.movement == 'A' ? '进' : '离' }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="汇总" width="120">
                        <template slot-scope="scope">
                            <el-popover placement="right" trigger="hover" v-if="size(scope.row.sum)>1">
                                <table class="sumTable" border="1">
                                    <tr v-for="(value,key) in scope.row.sum" :key="key">
                                        <td style="padding:10px 20px">
                                            {{ key == '秒' ? timeLength(parseInt(value * 1000)) : `${value}${key}` }}
                                        </td>
                                    </tr>
                                </table>
                                <el-button slot="reference" type="primary" size="mini"
                                           v-if="scope.row.sum&&JSON.stringify(scope.row.sum) != '{}'">查看
                                </el-button>
                            </el-popover>
                            <span v-else>
                                {{ getSumText(scope.row.sum) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="flight.aircraftType" label="是否发送" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.sendAll ? '已发送' : '未发送' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="其他数据" align="center" width="100">
                        <template slot-scope="{row}">
                            <el-popover placement="left" trigger="hover">
                                <table class="sumTable" border="1">

                                    <tr>
                                        <td style="padding:10px 20px">变更人</td>
                                        <td style="padding:10px 20px">
                                            {{ row.changePersonnel ? row.changePersonnel : '--' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:10px 20px">变更时间</td>
                                        <td style="padding:10px 20px">
                                            {{ getTimeByFormat(row.changeTime, 'hh:mm:ss(DD)') }}
                                        </td>
                                    </tr>
                                </table>
                                <el-button slot="reference" type="primary" size="mini">查看</el-button>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" v-if="!searchDel" class-name="optBox" width="90">
                        <template slot-scope="scope">

                            <el-button type="text" title="审批" @click="approval([scope.row],'arrs',false,'row')"
                                       :disabled="!!scope.row.approvalStatus" v-show="powerData.charge_approval">审批
                            </el-button>

                            <el-dropdown trigger="click" style="margin-left:.1rem;">
                                <el-button type="text" title="更多" class="el-dropdown-link">更多</el-button>
                                <el-dropdown-menu slot="dropdown">

                                    <el-dropdown-item>
                                        <el-button type="text" title="取消审批" @click="approval([scope.row],'arrs',true)"
                                                   :disabled="!!scope.row.sendAll||scope.row.chargeRecords.length==0"
                                                   v-show="powerData.charge_approval">取消审批
                                        </el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button type="text" title="新增" @click="add(scope.row)"
                                                   v-show="powerData.charge_add" :disabled="!!scope.row.approvalStatus">
                                            新增
                                        </el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button type="text" title="编辑" @click="editBill(scope.row)"
                                                   v-show="powerData.charge_edit"
                                                   :disabled="!!scope.row.approvalStatus">编辑
                                        </el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button type="text" title="上报" @click="report(scope)"
                                                   :disabled="scope.row.report" v-if="getReportShow(scope)">上报
                                        </el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button type="text" title="下载" @click="download(scope.row)"
                                                   v-show="powerData.charge_download">下载
                                        </el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button type="text" title="删除" @click="delBill([scope.row])"
                                                   v-show="powerData.charge_delete&&scope.row.chargeRecords.length==0">
                                            删除
                                        </el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-button type="text" title="变更" @click="flightHistory(scope.row)">变更
                                        </el-button>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC"
                                   :current-page="submitData.current" :page-sizes="[10,20, 30, 50, 100,200,300,400,500]"
                                   :page-size="submitData.size" layout="total, sizes, prev, pager, next, jumper"
                                   :total="total"></el-pagination>
                </div>
            </div>
        </div>
        <charge-bill-edit ref="ref_chargeBillEdit" @update="update" :userDeptLists="userDeptLists"></charge-bill-edit>
        <add-list ref="ref_addList" @update="update" :userDeptLists="userDeptLists"
                  :chargeBillArrs="chargeBillArrs"></add-list>
        <edit-list ref="ref_editList" @update="update"></edit-list>
        <supplement-edit ref="ref_supplementEdit" @update="update"></supplement-edit>
        <history ref="ref_history"></history>

        <el-dialog dialog-drag :visible.sync="logShow" id="addTask" class="codeDialog" center width="1000px"
                   :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>日志</span>
                <i class="el-icon-circle-close" @click="logShow=false"></i>
            </div>
            <ul>
                <li v-for="(item,idx) in logLists" :key="idx">
                    {{ item.content }}
                </li>
            </ul>
        </el-dialog>
        <el-dialog dialog-drag :visible.sync="flightHistoriesShow" id="addTask" class="codeDialog" center width="1000px"
                   :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>历史变更记录</span>
                <i class="el-icon-circle-close" @click="flightHistoriesShow=false"></i>
            </div>
            <el-table :data="flightHistories" style="width: 100%" size="mini" border height="260"
                      :header-cell-style="{backgroundColor:'#3A3F43',fontSize:'14px'}"
                      :cell-style="taskFlightHistoriesStyle">
                <el-table-column rop="updateTime" label="变更时间">
                    <template slot-scope="scope">{{
                            $moment(Number(scope.row.updateTime)).format('HH:mm(DD)')
                        }}
                    </template>
                </el-table-column>
                <el-table-column prop="flightNo" label="航班号"></el-table-column>
                <el-table-column prop="relFlightNo" label="连班航班号"></el-table-column>
                <el-table-column prop="seat" label="机位"></el-table-column>
                <el-table-column prop="aircraftNo" label="机号"></el-table-column>
                <el-table-column prop="aircraftType" label="机型"></el-table-column>
            </el-table>

        </el-dialog>
    </div>

</template>

<script>
import ChargeBillEdit from './components/charge_bill_edit'
import AddList from './components/addList'
import editList from './components/editList'
import SupplementEdit from './components/supplement_edit'
import History from './components/history'
import {map, filter,sortBy} from 'lodash'
import VerifyMix from './components/verifyMix'

export default {
    props: ['power', 'flagNav'],
    components: {
        'charge-bill-edit': ChargeBillEdit,
        'add-list': AddList,
        'edit-list': editList,
        'supplement-edit': SupplementEdit,
        history: History,
    },
    data() {
        return {
            flightHistoriesShow: false,
            flightHistories: [],
            logShow: false,
            logLists: [],

            searchTime: [],
            searchApproval: '',
            searchSend: '',
            searchStrType: 0,
            searchStr: '',
            searchDel: false,
            searchAircraftNo: '',
            searchSeat: '',
            searchBillCodes: [],

            lists: [],
            submitData: {
                current: 1,
                size: 20,
                params: null,
                deleted: false,
            },
            total: 0,
            maxHeight: 1000,
            unitLists: [],
            reporLists: [],
            expandKeys: [],
            selections: [],
            powerData: {
                charge_add: false,
                charge_edit: false,
                charge_delete: false,
                charge_approval: false,
                charge_download: false,
            },
            expends: [],
            infoShow: false,
            size: _.size,
            userData: {},
            pageType: '',
            userDeptLists: [],
            sortObj: {},
            chargeBillArrs: [],
            pageSelf: true,
            sendShow: false,
            dataTimer: null,
            searchYesterdayTime: false,
            searchYesterdaySend: false,
            unsendCount: 0,
            unsendAlert: false,
            qzsbUrl: '',
            qzjyShow: false,
            loading: false,
        }
    },
    mixins: [VerifyMix],
    created() {
    },
    computed: {
        getBuildModeMark(){
          return (row)=>{
               let textObj= {
                  null: {
                      d: '无',
                      c: '无任务',
                  },
                  auto: {
                      d: '例',
                      c: '例行保障任务',
                  },
                  manual: {
                      d: '临',
                      c: '临时任务',
                  },
              }
              return textObj[String(row.buildMode||'null')]
          }
        },
        getStatusMark__() {
            return (row) => {
                let obj = {}

                let textObj1 = {
                    conditionerBlo: {
                        d: '电',
                        c: '桥载空调保障时间范围 大于 桥载电源 时间范围',
                    },
                    QZDY: {
                        d: '超',
                        c: '桥载电源保障时间 超出 飞机起降时间范围',
                    },
                    QZKT: {
                        d: '超',
                        c: '桥载空调保障时间 超出 飞机起降时间范围',
                    },
                    QZDYC: {
                        d: '长',
                        c: '桥载电源超长保障',
                    },
                    QZKTC: {
                        d: '长',
                        c: '桥载空调超长保障',
                    },
                    QZDYD: {
                        d: '短',
                        c: '桥载电源过短保障',
                    },
                    QZKTD: {
                        d: '短',
                        c: '桥载空调过短保障',
                    },
                }
                map(row.chargeRecords || [], k => {
                    obj = this.dealStatus(k, {row}, obj)
                })
                let arr = []
                let recordsObj = {}
                map(obj, (val, key) => {
                    let textObj = textObj1[key]
                    if (val && textObj&&!recordsObj[textObj.d]) {
                        arr.push(textObj)
                        recordsObj[textObj.d] = 1
                    }
                })
                return arr
            }
        },
        getStatusChildMark__() {
            return (row, scope) => {
                let obj = {}
                obj = this.dealStatus(row, scope, obj)
                let textObj = {
                    conditionerBlo: {
                        d: '电',
                        c: '桥载空调保障时间范围 大于 桥载电源 时间范围',
                    },
                    QZDY: {
                        d: '超',
                        c: '桥载电源保障时间 超出 飞机起降时间范围',
                    },
                    QZKT: {
                        d: '超',
                        c: '桥载空调保障时间 超出 飞机起降时间范围',
                    },
                }
                let textObj1 = {
                    ...textObj,
                    QZDYC: {
                        d: '长',
                        c: '桥载电源超长保障',
                    },
                    QZKTC: {
                        d: '长',
                        c: '桥载空调超长保障',
                    },
                    QZDYD: {
                        d: '短',
                        c: '桥载电源过短保障',
                    },
                    QZKTD: {
                        d: '短',
                        c: '桥载空调过短保障',
                    },
                }
                let arr = []
                map(obj, (val, key) => {
                    let textObj = textObj1[key]
                    if (val&&textObj) {
                        arr.push(textObj)
                    }
                })
                return arr
            }
        },
        getChargeBillArrCom() {
            return (val)=>{
                let userData = JSON.parse(sessionStorage.userData)
                let arrs = []
                userData.roles.map((role) => {
                    let charge = _.find(val, { code: role.code })
                    if (charge && role.menus && role.menus.length > 0) {
                        let menuadd = _.find(role.menus, { code: 'charge_add' })
                        if (menuadd) {
                            arrs.push(charge)
                        }
                    }
                })
                return arrs
            }


        },
        getChargeBill() {
            return (row) => {
                let codeObj = {}
                map(row.flightSupplementInfos, item => {
                    codeObj[item.supplementCode] = _.cloneDeep(item)
                })
                let arr=this.getChargeBillArrCom(this.chargeBillArrs)
                let charge= null;
                filter(arr, k => {
                    if (row.chargeBillConfigCode == k.code) {
                        charge=_.cloneDeep(k)
                        return true;
                    }
                })
                let formData=sortBy(charge&&charge.supplementInfoConfigs||[],'sort')
                let supplementInfoConfigs=    map(formData,(list) => {

                    let obj=codeObj[list.code]
                    let params1=list.params
                    if(typeof list.params=='string'){
                        params1=JSON.parse(list.params)
                    }
                    if(obj){
                        if(typeof obj.supplementInfoConfig.params=='string'){
                            params1=JSON.parse(list.params)
                        }
                         return {...obj,
                            type:params1.type||obj.type,
                            valueCode:obj.valueCode|| null,
                            valueTitle: obj.valueTitle||(params1.type==1?'': null),
                        }
                    }else{
                        return {
                            supplementInfoConfig:{
                                ...list,
                                "flightId":row.flightId,
                                "taskId":row.taskId,
                                "chargeBillId":row.id,
                                type:list.type,
                                valueCode: null,
                                valueTitle: null,
                                "createrId":list.createrId,
                                "createrName":list.createrName,
                                "supplementCode":list.code,
                                "supplementTitle":list.name,
                            },
                            "flightId":row.flightId,
                            "taskId":row.taskId,
                            "chargeBillId":row.id,
                            type:params1.type,
                            valueCode: null,
                            valueTitle: null,
                            "createrId":list.createrId,
                            "createrName":list.createrName,
                            "supplementCode":list.code,
                            "supplementTitle":list.name,

                        }
                    }
                })
                let supplementArr = _.cloneDeep(_.sortBy(supplementInfoConfigs || [], 'sort'))
                 return supplementArr
            }
        },
        getSendS(){
            let s=false
            if((this.sendShow&&this.searchYesterdaySend)||(!this.sendShow&&this.searchYesterdayTime)){
                s=true
            }
            return s
        } ,


    },
    mounted() {
        let size=localStorage.getItem('chargePageSize__')
         this.submitData.size=size&&Number(size)||this.submitData.size
        this.searchTime = [
            this.getTimeByFormat(new Date() - 1 * 24 * 60 * 60 * 1000, 'YY-MM-DD') + ' 00:00:00',
            this.$moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        ]

        if (top != self) {
            window.addEventListener(
                'message',
                (event) => {
                    this.pageSelf = false
                    this.inIframeInit(event.data)
                },
                false
            )
        } else {
            this.pageSelf = true
            this.getChargeBillArr()
        }
        this.maxHeight = $('.tableBox').height() - 72
        if (this.power) {
            this.powerData = _.cloneDeep(this.power)
        }
    },
    watch: {
        searchApproval: function () {
            this.handleLists()
        },
        // searchSend: function () {
        //     this.handleLists()
        // },
    },
    detroyed() {
        clearInterval(this.dataTimer)
    },
    methods: {
        dealSend(){
            this.searchSend=this.searchSend?'':true
            this.searchYesterdaySend = false
            this.searchYesterdayTime = false
            this.handleLists()

        },
        dealChargeBill(data) {

        },
        taskFlightHistoriesStyle({row, column, rowIndex, columnIndex}) {
            let style = {
                fontSize: '14px',
            }
            if (row.changed && row.changed.indexOf(column.property) >= 0) {
                style.background = 'yellow'
            }
            return style
        },
        getitemClass(item) {
            if (item.supplementCode == 'QZSB-BZ') {
                return 'remarkItem'
            }
            return ''
        },
        pageCommand(command) {
            switch (command) {
                case '0':
                    this.add('')
                    break
                case '1':
                    this.sendSelect()
                    break
                case '2':
                    this.approvalSelect()
                    break
                case '3':
                    this.delBillSelect()
                    break
                case '4':
                    this.handleLists()
                    break
                default:
                    break
            }
        },
        getOperatorName(row) {
            let operatorName = row.operatorName
            let startUserName = row.startUserName

            if (operatorName && startUserName && operatorName != startUserName) {
                return startUserName   + ',' + operatorName
            }
            return operatorName ? operatorName : startUserName
        },
        openChargeRecord(row) {
            if (
                (row.chargeRecords && row.chargeRecords.length > 0) ||
                (row.flightSupplementInfos && row.flightSupplementInfos.length > 0)
            ) {
                this.$refs.ref_chargeBill.toggleRowExpansion(row)
            }
        },
        sendLog({row}) {
            let origin = `http://${window.location.hostname}:6010`

            if (
                _.includes(origin, 'localhost') ||
                _.includes(origin, '127.0.0.1') ||
                _.includes(origin, '192.168.131.131')
            ) {
                origin = 'http://173.101.4.3:6010'
            }
            let url =
                origin + '/omms-tf-charge-service/chargeRecord/sendLogs?chargeRecordId=' + row.id
            this.$axios.get(url).then((res) => {
                this.logShow = true
                this.logLists = res.data
            })
        },
        getChargeBillArr() {
            this.$axios.get('/charge-bill-config/findChargeBillConfigWithAuth').then((res) => {
                this.chargeBillArrs = res.data

                this.qzjyShow =
                    res.data.filter((list) => {
                        return list.code == 'QZSB'
                    }).length > 0
                        ? true
                        : false

                if (this.pageSelf) {
                    this.getUserLists()
                    this.userData = JSON.parse(sessionStorage.userData)
                    this.sendShow =
                        this.userData.deptCode == 'BoardingBridge' ||
                        this.userData.deptCode == 'MaintenanceLoadBridge'
                    this.getUnitLists()
                } else {
                    this.getUserData(sessionStorage.token)
                }
            })
        },
        getSourceName(record) {
            return record.chargeDataSource.code.split('-')[1]
        },
        getValueByKey(flight, movement, key) {
            let flightObj = this.getRowFlightLoading(flight)
            let flightData = flightObj[movement]
            return flightData && flightData[key] ? flightData[key] : '--'
        },

        getActiveFlight({row}) {
            let flightId = row.flightId
            if (row.flight.flightId == flightId) {
                return row.flight
            } else {
                return row.flight.flight
            }
        },
        sortChange({prop, order}) {
            // this.sortObj = {}
            this.sortObj[prop] = order
            if (!order) {
                this.sortObj = {}
            }
            this.submitData.current = 1
            this.handleLists()
            return
            if (this.searchYesterdayTime == false || this.searchYesterdaySend == true) {
                this.unsendHandle()
            } else {
                this.handleLists()
            }
        },

        inIframeInit(data) {
            if (data.token) {
                sessionStorage.setItem('token', data.token)
                this.pageType = data.pageType
                this.getChargeBillArr()
            }
        },

        getRowName({row, rowIndex}, scope) {
            // 主表格状态标记使用
            let name = 'expandRow'
            // dealStatus 来自 component/verifyMix
            let statusFRowObj = this.dealStatus(row, scope)


            if (
                statusFRowObj.conditionerBlo || statusFRowObj[row.chargeCode] ||
                statusFRowObj[row.chargeCode + 'D'] || statusFRowObj[row.chargeCode + 'C']
            ) {
                name += ' timeBorder'
            }

            return name
        },
        getSumText(sum) {
            let text = []
            if (!sum && JSON.stringify(sum) != '{}') {
                return ''
            } else {
                _.forIn(sum, (value, key) => {
                    if (key == '秒') {
                        text.push(this.timeLength(parseInt(value) * 1000))
                    } else {
                        text.push(value + key)
                    }
                })
                return text.join(',')
            }
        },
        getExpends() {
            var arrs = _.reduce(
                this.lists,
                (result, value) => {
                    let hasData = this.getRowClass({row: value}) ? false : true
                    if (value.expandDefault && hasData) {
                        result.push(value.id)
                    }
                    return result
                },
                []
            )
            this.expends = arrs
        },
        getUserData(token) {
            this.$axios({
                method: 'post',
                url: '/sso/login/userInfo',
                dataType: 'text',
                data: token,
                async: true,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
            }).then((res) => {
                this.userData = res.data
                sessionStorage.setItem('userData', JSON.stringify(_.omit(res.data, 'token')))
                this.sendShow =
                    this.userData.deptCode == 'BoardingBridge' ||
                    this.userData.deptCode == 'MaintenanceLoadBridge'
                this.getSetButtonShow()
                if (this.pageType == 'boarding-bridge') {
                    this.getUserLists()
                }
                this.getUnitLists()
            })
        },
        handleLists() {
            this.lists = []
            let data = {
                current: 1,
                size: this.submitData.size,
                params: null,
                deleted: false,
                linkedData: true,
            }
            if(!this.searchYesterdaySend&&!this.searchYesterdayTime){
                if (this.searchTime && this.searchTime.length > 0) {
                    data.startTime = this.searchTime[0]
                    data.endTime = this.searchTime[1]
                }
                data.send = this.searchSend
                data.approvalStatus = this.searchApproval

            }else{
                data.send = ''
                data.approvalStatus = ''
            }

            if (this.searchDel) {
                data.deleted = this.searchDel
            }
            if (this.searchStr) {
                data.params = this.searchStr
            }

            if (this.searchBillCodes.length > 0) {
                data.chargeBillCodes = this.searchBillCodes.join(',')
            }
            if (this.searchSeat) {
                data.seat = this.searchSeat.toUpperCase()
            }
            if (this.searchAircraftNo) {
                data.aircraftNo = this.searchAircraftNo
            }

            data.yesterdayTime = this.searchYesterdayTime
            data.yesterdaySend = this.searchYesterdaySend

            data = {...data, orderBy: this.sortObj}
            this.findChargeBillWhitPageAndPc(data)
        },
        getunSendCount() {
            // let size=localStorage.getItem('chargePageSize__')
            // console.log('size',size);
            let data = {
                current: 1,
                size: this.submitData.size,
                params: null,
                deleted: false,
                linkedData: true,
                approvalStatus: '',
                send: '',
                orderBy: {},
            }
            if (this.sendShow) {
                data.yesterdaySend = true
            } else {
                data.yesterdayTime = true
            }

            this.findChargeBillWhitPageAndPc(data, '', 'getCount')
        },
        getUnSendHandle() {
            if (this.sendShow) {
                this.searchYesterdaySend = !this.searchYesterdaySend
                this.searchYesterdayTime = false
                this.searchSend = this.searchYesterdaySend === true ? false : ''
            } else {
                this.searchYesterdaySend = false
                this.searchYesterdayTime = !this.searchYesterdayTime
            }

            this.unsendHandle()
        },
        unsendHandle() {
            this.searchDel = false
            this.searchStr = ''
            this.searchSeat = ''
            this.searchAircraftNo = ''
            this.searchApproval = ''

            let data = {
                current: 1,
                size: this.submitData.size,
                params: null,
                deleted: false,
                linkedData: true,
                approvalStatus: '',
                send: '',
            }

            if (
                this.searchTime &&
                this.searchTime.length > 0 &&
                !this.searchYesterdayTime &&
                !this.searchYesterdaySend
            ) {
                data.startTime = this.searchTime[0]
                data.endTime = this.searchTime[1]
            }

            data.yesterdaySend = this.searchYesterdaySend
            data.yesterdayTime = this.searchYesterdayTime

            data = {...data, orderBy: this.sortObj}
            this.findChargeBillWhitPageAndPc(data)
        },
        findChargeBillWhitPageAndPc(data, update, getCount) {
            if (!getCount) {
                this.submitData = data
                this.loading = true
            }

            let url =
                this.pageType == 'boarding-bridge'
                    ? '/boarding-bridge-charge-bill/findChargeBillWhitPageAndPc'
                    : '/charge-bill/findChargeBillWhitPageAndPc'
            this.$axios
                .get(url, {
                    params: data,
                })
                .then((res) => {
                    if (getCount) {
                        let nowTime = new Date().getTime()
                        let startTime = new Date(
                            this.getTimeByFormat(nowTime, 'YY-MM-DD') + ' 08:00:00'
                        )
                        let endTime = new Date(
                            this.getTimeByFormat(nowTime, 'YY-MM-DD') + ' 09:20:00'
                        )
                        if (this.unsendCount != res.data.total && this.unsendAlert) {
                            this.$msgbox.close()
                            this.unsendAlert = false
                        }
                        this.unsendCount = res.data.total

                        if (
                            !this.unsendAlert &&
                            this.unsendCount > 0 &&
                            nowTime >= startTime &&
                            nowTime <= endTime
                        ) {
                            this.unsendAlert = true
                            this.$msgbox.alert(
                                `昨日还有${this.unsendCount}个航班未${
                                    this.sendShow ? '发送' : '审核'
                                }，财务要求9点前完成00点之前执行的收费数据${
                                    this.sendShow ? '发送' : '审核'
                                }。`,
                                '提示',
                                {
                                    type: 'warning',
                                    center: true,
                                    callback: () => {
                                        this.unsendAlert = false
                                    },
                                }
                            )
                        }

                        return
                    }
                    let lists = res.data.records
                    this.total = res.data.total

                    this.loading = false

                    lists.map((list) => {
                        list.chargeRecords = _.sortBy(list.chargeRecords, 'chargeCode')

                        // if (list.chargeBillConfigCode == 'QZSB') {
                        //     list.flightSupplementInfos.map((list) => {
                        //         if (_.includes(list.supplementTitle, '航班')) {
                        //             list.sort = 0
                        //         }
                        //         if (_.includes(list.supplementTitle, '飞机')) {
                        //             list.sort = 1
                        //         }
                        //         if (_.includes(list.supplementTitle, '电源')) {
                        //             list.sort = 2
                        //         }
                        //         if (_.includes(list.supplementTitle, '空调')) {
                        //             list.sort = 3
                        //         }
                        //         if (_.includes(list.supplementTitle, '备注')) {
                        //             list.sort = 4
                        //         }
                        //     })
                        // }
                        list.flightSupplementInfos = _.sortBy(
                            list.flightSupplementInfos,
                            (item) => {
                                return item.supplementInfoConfig.sort
                            }
                        )

                        if (list.chargeBillConfigCode == 'LANQ') {
                            let newLists = []
                            list.chargeRecords.map((record) => {
                                if (record.dataSourceSort === 0) {
                                    newLists.push(record)
                                }
                            })

                            list.chargeRecords.map((record) => {
                                if (record.dataSourceSort === 1) {
                                    let relateRecord = _.find(newLists, {
                                        id: record.relateRecordId,
                                    })
                                    if (relateRecord) {
                                        relateRecord.relateRecord = record
                                    } else {
                                        newLists.push(record)
                                    }
                                }
                            })
                            list.chargeRecords = newLists
                        }
                    })

                    this.lists = lists

                    if (update) {
                        return
                    }
                    this.$nextTick(function () {
                        this.getExpends()
                    })
                })
        },
        getUserLists() {
            let userData = JSON.parse(sessionStorage.userData)
            this.$axios
                .get('/sys/user/getAllUserByDeptId?deptId=' + userData.deptId)
                .then((res) => {
                    if (res && res.data) {
                        this.userDeptLists = res.data
                    }
                })
        },
        loadData(data) {
            let records = []
            data.map((list) => {
                let chargeRecords = list.chargeRecords || []
                if (chargeRecords.length == 0) {
                    records.push({data: list})
                } else {
                    chargeRecords.map((record) => {
                        let newData = _.omit(list, 'chargeRecords')
                        record.data = newData
                        record.rowspan = list.chargeRecords.length
                        records.push(record)
                    })
                }
            })
            this.lists = records
        },
        arraySpanMethod({row, column, rowIndex, columnIndex}) {
            if (columnIndex === 0 || columnIndex === 1 || columnIndex == 2) {
                if (rowIndex === 0) {
                    return {
                        rowspan: row.rowspan,
                        colspan: 1,
                    }
                } else {
                    return {
                        rowspan: 0,
                        colspan: 0,
                    }
                }
            }
        },
        approvalSelect() {
            if (this.selections.length == 0) {
                this.$alert('还未勾选收费单！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }

            // let arrs = this.selections.filter((list) => {
            //     return !list.chargeRecords || list.chargeRecords.length == 0
            // })
            // if (arrs.length > 0) {
            //     this.$alert('不能选择无收费项数据进行审批！', '提示', {
            //         type: 'error',
            //         center: true,
            //     })
            //     return false
            // }
            this.approval(this.selections, 'arrs', false)
        },
        chargeDataHasValue(row){
             let itemArr =row.chargeRecords||[]
            let blo=!itemArr.length||itemArr.some(k=>{
                return !k.chargeData||k.chargeData==='0'
            })
            return blo
        },
        approval(row, type, send,isRow) {

            let data = []
            let approvalStatus = 'PASS'
            let msg = '确定审批?'
            let endHttp = false
            if (type == 'arrs') {
                let {current,size}=this.submitData
                let dataNum=(current-1)*size
                if (send) {
                    approvalStatus = 'PENDING'
                    msg = '确定取消审批?'
                } else {
                    let arr=[]
                    map(row,(k,i)=>{
                        let blo =this.chargeDataHasValue(k)
                        blo &&arr.push(i+dataNum+1)
                    })
                    console.log(2211,dataNum,arr,current,size);
                    let s=`序号为 ${arr.join('、')} 的收费单，有收费数据为空或无收费项，不能审批！`
                    if(isRow=='row'){
                         s='该收费单有收费数据为空或无收费项，不能审批！'
                    }
                    if(arr.length){
                        this.$alert(s, '提示', {
                            type: 'error',
                            center: true,
                        })
                        return
                    }

                    approvalStatus = 'PASS'
                }

                row.forEach((list, idx) => {
                    let chargeRecordIds = _.reduce(
                        list.chargeRecords || [],
                        function (result, value) {
                            if (!send && value.approvalStatus != 'PASS' && value.chargeData) {
                                result.push({id: value.id})
                            }
                            if (send && value.approvalStatus == 'PASS' && !value.send) {
                                result.push({id: value.id})
                            }

                            return result
                        },
                        []
                    )
                    if (chargeRecordIds.length == 0) {
                        endHttp = true
                        this.$alert(
                            send
                                ? `收费项未审批，或者已发送，不能取消审批`
                                : `序号为${
                                    idx +dataNum+ 1
                                }的收费单，收费项以全部审批，不能重复审批！`,
                            '提示',
                            {
                                type: 'error',
                                center: true,
                            }
                        )
                        return false
                    }

                    if (chargeRecordIds.length != 0) {
                        data.push({
                            id: list.id,
                            chargeBillConfigCode: list.chargeBillConfigCode,
                            chargeRecords: chargeRecordIds,
                        })
                    }
                })
            } else {
                if (send) {
                    approvalStatus = 'PENDING'
                    msg = '确定取消审批?'
                } else {
                    approvalStatus = 'PASS'
                }
                if (!row.chargeData) {
                    endHttp = true
                    this.$alert('该收费数据为空，不能审批！', '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }

                data = [
                    {
                        id: row.chargeBillId,
                        chargeBillConfigCode: row.chargeBillConfigCode,
                        chargeRecords: [{id: row.id}],
                    },
                ]
            }
            if (endHttp) {
                return false
            }
            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios
                    .post('/charge-record/approval?approvalStatus=' + approvalStatus, data)
                    .then((res) => {
                        this.update()
                        this.$alert(res.msg, '提示', {
                            type: 'success',
                            center: true,
                        })
                    })
            })
        },
        sendSelect() {
            if (this.selections.length == 0) {
                this.$alert('还未勾选收费单！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.send(this.selections, 'arrs')
        },
        send(row, type) {
            let data = []
            let index = _.findIndex(row, (list) => {
                return list.chargeRecords.length == 0
            })
            if (index >= 0) {
                this.$alert(`发送的收费单必须含有收费项才能发送！`, '提示', {
                    type: 'error',
                    center: true,
                })
                return
            }
            row.map((list) => {
                data.push(list.id)
            })

            let chargeBillIds = data.join(',')
            this.$confirm('确定发送?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios
                    .get('/charge-record/sendChargeRecord?chargeBillIds=' + chargeBillIds)
                    .then((res) => {
                        this.update()
                        this.$alert(res.msg, '提示', {
                            type: 'success',
                            center: true,
                        })
                    })
            })
        },
        delBillSelect() {
            if (this.selections.length == 0) {
                this.$alert('还未勾选收费单！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            console.log(this.selections)

            let arrs = this.selections.filter((list) => {
                return list.chargeRecords.length > 0
            })
            if (arrs.length > 0) {
                this.$alert('不能选择有收费项数据进行删除！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.delBill(this.selections, 'arrs')
        },
        delBill(rows) {
            let ids = []

            rows.forEach((row, index) => {
                ids.push(row.id)
            })
            console.log(ids)

            this.$confirm('确定删除该收费单?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios.post('/charge-bill/deleteByIds', ids).then((res) => {
                    this.update()
                    this.$alert(res.msg, '提示', {
                        type: 'success',
                        center: true,
                    })
                })
            })
        },
        flightHistory(row) {
            this.flightHistoriesShow = true
            // 16947666
            this.$axios
                .get('/flightHistory/selectByFlightId?flightId=' + row.flightId)
                .then((res) => {
                    this.flightHistories = res.data
                })
        },
        download(row) {
            var a = document.createElement('a')
            a.download =
                row.chargeBillConfigName + ' ' + this.getTimeByFormat(new Date(), 'hh:mm:ss(DD)')
            a.href =
                this.$axios.defaults.baseURL +
                'charge-bill/exportChargeBillToPdf?isServer=true&chargeBillId=' +
                row.id
            a.target = '_blank'
            $('body').append(a) // 修复firefox中无法触发click
            a.click()
            $(a).remove()
        },
        report({row}) {
            if (!row.chargeRecords || row.chargeRecords.length == 0) {
                this.$alert('当前没有收费项，不能上报！', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            if (!row.approvalStatus) {
                this.$alert('当前有未审核收费项，不能上报！', '提示', {
                    type: 'warning',
                    center: true,
                })
                return
            }
            this.$confirm('确定上报?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                // +
                //             '&relateFlightId=' +
                //             row.relateFlightId
                this.$axios.post('/flightReport/report?flightId=' + row.flightId).then((res) => {
                    this.update()
                    this.$alert(res.msg, '提示', {
                        type: 'success',
                        center: true,
                    })
                })
            })
        },
        edit(type, data, row) {
            this.$refs.ref_chargeBillEdit.initData(type, _.cloneDeep(data), row)
        },
        add(row) {
            this.$refs.ref_addList.initData(row, this.chargeBillArrs)
        },
        editBill(row) {
            this.$refs.ref_editList.initData(row)
        },
        del(data) {
            this.$confirm('确定删除该数据?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios
                    .get('/charge-record/deleteById', {
                        params: {
                            id: data.id,
                        },
                    })
                    .then((res) => {
                        this.update()
                        this.$alert(res.msg, '提示', {
                            type: 'success',
                            center: true,
                        })
                    })
            })
        },
        history(row) {
            this.$refs.ref_history.initData(row)
        },

        infoEdit(data) {
            this.$refs.ref_supplementEdit.initData(_.cloneDeep(data))
        },
        listSelectionChange(val) {
            this.selections = val
        },
        update() {
            this.findChargeBillWhitPageAndPc(this.submitData, 'update')
            this.getunSendCount()
        },
        handleSizeChange(pageSize) {
            this.submitData.current = 1
            this.submitData.size = pageSize
            localStorage.setItem('chargePageSize__',pageSize)
            this.findChargeBillWhitPageAndPc(this.submitData)
        },
        pageBC(pageNo) {
            this.submitData.current = pageNo
            this.findChargeBillWhitPageAndPc(this.submitData)
        },
        getUnitLists() {
            this.$axios
                .all([
                    this.$axios.get('/data-dictionary/findDataDictionaryByCode', {
                        params: {
                            code: 'unit',
                        },
                    }),
                    this.$axios.get('/data-dictionary/findDataDictionaryByCode', {
                        params: {
                            code: 'RULE_CHARGE_PUB',
                        },
                    }),
                    this.$axios.get('/data-dictionary/findDataDictionaryByCode', {
                        params: {
                            code: 'qzjyym',
                        },
                    }),
                ])
                .then(
                    this.$axios.spread((res1, res2, res3) => {
                        this.unitLists = res1.data
                        this.reporLists = res2.data
                        this.qzsbUrl = res3.data.length > 0 ? res3.data[0].name : ''
                        this.handleLists()

                        if (this.dataTimer) {
                            clearInterval(this.dataTimer)
                            this.dataTimer = null
                        }
                        this.getunSendCount()
                        this.dataTimer = setInterval(() => {
                            this.getunSendCount()
                        }, 5 * 60 * 1000)
                    })
                )
        },
        getName(item, lists, key) {
            let obj = _.find(lists, {code: item})
            return obj ? obj[key] : item
        },
        getChargeData(row) {
            if (row.unit == '秒') {
                return `${this.timeLength(parseInt(row.chargeData) * 1000)}`
            } else {
                return `${row.chargeData}${row.unit}`
            }
        },
        getSingSrc(row, type) {
            let obj = _.find(row.chargeBillSigns, {type: type})
            return obj ? obj.content : ''
        },
        getSingList(row, type) {
            let lists = _.filter(row.chargeBillSigns, {type: type})
            return lists
        },
        getSignColShow(type, code) {
            let charge = _.find(this.chargeBillArrs, {code})
            if (charge) {
                let sign = _.find(charge.chargeBillConfigSignList, {dataCode: type})
                if (sign) {
                    return true
                }
            }
            return false
        },
        getRowClass(scope) {
            if (
                (!scope.row.chargeRecords || scope.row.chargeRecords.length == 0) &&
                (!scope.row.flightSupplementInfos || scope.row.flightSupplementInfos.length == 0)
            ) {
                return 'row-expand-cover'
            }
        },
        getPower(row, power) {
            let role = _.find(this.userData.roles, {code: row.chargeBillConfigCode})
            let obj = role ? _.find(role.menus, {code: power}) : ''
            return obj ? true : false
        },
        getSetButtonShow() {
            //设置按钮权限
            let menus = this.userData.menus || []
            menus.map((list) => {
                if (list.code == 'charge_approval') {
                    this.powerData.charge_approval = true
                }
                if (list.code == 'charge_add') {
                    this.powerData.charge_add = true
                }
                if (list.code == 'charge_edit') {
                    this.powerData.charge_edit = true
                }
                if (list.code == 'charge_delete') {
                    this.powerData.charge_delete = true
                }
                if (list.code == 'charge_download') {
                    this.powerData.charge_download = true
                }
            })
        },
        getapprovaldisabled(row) {
            let result = false
            if (!row.chargeRecords || row.chargeRecords.length == 0) {
                result = true
            } else {
                row.chargeRecords.map((list) => {
                    if (list.approvalStatus == 'PASS') {
                        result = true
                    }
                })
            }
            return result
        },
        getReportShow({row}) {
            let airline = _.find(this.reporLists, {code: 'RULE_CHARGE_PUB_AL'})
            let charge = _.find(this.reporLists, {code: 'RULE_CHARGE_PUB_BILL'})
            if (
                airline &&
                row.flight &&
                airline.name.indexOf(row.flight.airlineCode) >= 0 &&
                charge &&
                charge.name.indexOf(row.chargeBillConfigCode) >= 0
            ) {
                return true
            }
            return false
        },
        getCellClassname({row, column}) {
            if (column.property == 'dataSourceSort') {
                if (row.dataSourceSort === 0 && row.relateRecordId && row.relateRecord) {
                    return 'hasRelateRecord el-table__expanded-cell'
                } else {
                    return 'noRelateRecord el-table__expanded-cell'
                }
            }
            return 'el-table__expanded-cell'
        },
        getSupplementOption(supplementInfoConfig) {
            if (supplementInfoConfig && supplementInfoConfig.params) {
                let params = JSON.parse(supplementInfoConfig.params)
                return params.selects ? params.selects : []
            } else {
                return []
            }
        },

        saveSupplement(data,row) {

             if(data.supplementCode=="QZSB-FJLX"){
                let objType={
                    KTJ:'2',
                    ZTJ:'1'
                }
                map(this.getChargeBill(  row),k=>{
                    if(k.supplementCode=="QZSB-DYLX"||k.supplementCode=="QZSB-KTLX"){
                        let obj={...k,valueCode:objType[data.valueCode]}
                        this.saveSupplementC(obj,true)
                    }
                })

            }
            this.saveSupplementC(data)

        },
        saveSupplementC(item,isUpdate) {

            let data = _.cloneDeep(item)

             if (item.type == 2) {
                let options = this.getSupplementOption(data.supplementInfoConfig)
                 let option = _.find(options, {code: data.valueCode})
                data.valueTitle = option.describe
            } else if (item.type == 3) {
                let title = []
                let code = []
                let options = this.getSupplementOption(data.supplementInfoConfig)
                data.valueCode.map((list) => {
                    let option = _.find(options, {code: list})
                    title.push(option.describe)
                    code.push(option.code)
                })
                data.valueCode = code.join(',')
                data.valueTitle = title.join(',')
            } else {
                data.valueCode = data.valueTitle
            }
             this.$axios.post('/flight-supplement-info/save', data).then((res) => {
               if(!isUpdate){
                   this.$message({
                       message: res.msg,
                       type: 'success',
                   })
                   this.update()
               }
            })
        },
    },
}
</script>
<style scoped lang="scss">
/deep/ .indexTd {
    .cell {
        flex-wrap: wrap !important;
    }

    .blue {
        //background:#E6A23C!important;
        //background: #f19408 !important;
        background: blue !important;
    }
}
.myChargeInput__{
    outline: none;
    height: 40px;
    width: 100%;
    padding-left:3px;
    border-radius: 5px;
    border: 1px solid #DCDFE6;
}
//:not(.myChargeInput__[disabled='disabled'])
.myChargeInput__:hover{
    border-color: #b6b9c0;
}
.myChargeInput__:focus{
    border-color: #409EFF;
}
/deep/ .sendClassSelect{
    background: #e5dada !important;
    border-color: #e5dada;
    span{
        color: #222;
    }
}

</style>