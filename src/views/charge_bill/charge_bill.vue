<template>
    <div id="project" class="rightBoxContent">
        <div class="topBox">
            <ul class="navBox">
                <li>
                    <div></div>
                    <div class="mid one">{{flagNav?flagNav.name:'收费单'}}</div>
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
                    <el-date-picker v-model="searchTime" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" @change="handleLists" :default-time="['00:00:00', '23:59:59']"></el-date-picker>
                </div>
                <div>
                    <el-select v-model="searchDel" placeholder="请选择" @change="handleLists">
                        <el-option label="正常" :value="false"></el-option>
                        <el-option label="已删除" :value="true"></el-option>
                    </el-select>
                </div>
                <div>
                    <ul class="radioApproval">
                        <li :class="searchApproval===false?'active':''" @click="searchApproval=searchApproval===false?'':false">待审批</li>
                        <li :class="searchApproval===true?'active':''" @click="searchApproval=searchApproval===true?'':true">审批完成</li>
                    </ul>
                </div>
                <div>
                    <ul class="radioApproval" v-if="sendShow">
                        <li :class="searchSend===false?'active':''" @click="searchSend=searchSend===false?'':false;handleLists()">未发送</li>
                        <li :class="searchSend===true?'active':''" @click="searchSend=searchSend===true?'':true;handleLists()">已发送</li>
                    </ul>
                </div>
                <div>
                    <el-input placeholder="机位查询" v-model="searchSeat" @keyup.enter.native="handleLists" style="width:100px" />
                </div>
                <div>
                    <el-input placeholder="机号查询" v-model="searchAircraftNo" @keyup.enter.native="handleLists" style="width:100px" />
                </div>
                <div>
                    <el-input placeholder="航班号或航司查询" v-model="searchStr" @keyup.enter.native="handleLists" />
                </div>
                <div v-show="unsendCount>0">
                    <el-button type="danger" @click="getUnSendHandle">
                        {{sendShow?'昨日未发送'+unsendCount+'个':'昨日未审批'+unsendCount+'个'}}
                    </el-button>
                </div>
            </div>
            <div class="rightBox">
                <el-button type="primary" @click="add('')">补录</el-button>
                <el-button type="primary" @click="sendSelect" v-show="searchSend===false" v-if="sendShow">发送</el-button>
                <el-button type="primary" @click="approvalSelect" v-show="powerData.charge_approval">批量审批</el-button>
                <el-button type="primary" @click="delBillSelect" v-show="powerData.charge_delete&&!searchDel">批量删除</el-button>
                <el-button type="primary" @click="handleLists">刷新</el-button>
            </div>
        </div>
        <div id="tableBox">
            <div class="tableBox" ref="tableBox">
                <!-- :span-method="arraySpanMethod" -->
                <el-table :data="lists" border stripe style="width: 100%" :max-height="maxHeight" :highlight-current-row="true" :row-class-name="getRowClass" @selection-change="listSelectionChange" :expand-row-keys="expends" row-key="id" @sort-change="sortChange">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <div class="bill_expand">
                                <div class="bill_expand_Box" v-show="scope.row.chargeRecords&&scope.row.chargeRecords.length>0">
                                    <div class="title">收费数据</div>
                                    <el-table class="outtable" :data="scope.row.chargeRecords" border stripe style="width: 100%" :row-class-name="getRowName" :cell-class-name="getCellClassname">
                                        <el-table-column label="收费项" align="center">
                                            <template slot-scope="scope1">
                                                {{scope1.row.chargeDataSource&&scope1.row.chargeDataSource.chargeConfig?scope1.row.chargeDataSource.chargeConfig.name:''}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="dataSourceSort" label="来源" align="center" v-if="scope.row.chargeBillConfigCode=='LANQ'" width="60">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div>{{getSourceName(scope1.row)}}</div>
                                                    <div v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{getSourceName(scope1.row.relateRecord)}}</div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="deviceCode" label="设备号" align="center" v-if="scope.row.showDevice">
                                            <template slot-scope="{row}">
                                                <div>
                                                    <div>{{row.deviceCode?row.deviceCode:'--'}}</div>
                                                    <div v-if="row.dataSourceSort===0&&row.relateRecord">{{row.relateRecord.deviceCode}}</div>
                                                </div>

                                            </template>
                                        </el-table-column>

                                        <template v-if="scope.row.chargeBillConfigCode=='LANQ'">
                                            <el-table-column prop="afterStartTime" label="航后开始" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div :title="getTimeByFormat(scope1.row.afterStartTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.afterStartTime,'hh:mm:ss(DD)')}}</div>
                                                        <div :title="getTimeByFormat(scope1.row.relateRecord.afterStartTime,'YY年MM月DD日 hh时mm分ss秒')" v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{getTimeByFormat(scope1.row.relateRecord.afterStartTime,'hh:mm:ss(DD)')}}</div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="afterEndTime" label="航后结束" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div :title="getTimeByFormat(scope1.row.afterEndTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.afterEndTime,'hh:mm:ss(DD)')}}</div>
                                                        <div :title="getTimeByFormat(scope1.row.relateRecord.afterEndTime,'YY年MM月DD日 hh时mm分ss秒')" v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{getTimeByFormat(scope1.row.relateRecord.afterEndTime,'hh:mm:ss(DD)')}}</div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="startTime" label="接桥时间" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div :title="getTimeByFormat(scope1.row.startTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.startTime,'hh:mm:ss(DD)')}}</div>
                                                        <div :title="getTimeByFormat(scope1.row.relateRecord.startTime,'YY年MM月DD日 hh时mm分ss秒')" v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{getTimeByFormat(scope1.row.relateRecord.startTime,'hh:mm:ss(DD)')}}</div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="endTime" label="撤桥时间" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div :title="getTimeByFormat(scope1.row.endTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.endTime,'hh:mm:ss(DD)')}}</div>
                                                        <div :title="getTimeByFormat(scope1.row.relateRecord.endTime,'YY年MM月DD日 hh时mm分ss秒')" v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{getTimeByFormat(scope1.row.relateRecord.endTime,'hh:mm:ss(DD)')}}</div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="startStaffName" label="接桥人员" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div>{{scope1.row.startStaffName?scope1.row.startStaffName:'--'}}</div>
                                                        <div v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{scope1.row.relateRecord.startStaffName}}</div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="endStaffName" label="撤桥人员" align="center">
                                                <template slot-scope="scope1">
                                                    <div>
                                                        <div>{{scope1.row.endStaffName?scope1.row.endStaffName:'--'}}</div>
                                                        <div v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{scope1.row.relateRecord.endStaffName}}</div>
                                                    </div>

                                                </template>
                                            </el-table-column>
                                        </template>
                                        <el-table-column label="开始时间" align="center" v-if="scope.row.chargeBillConfigCode!='LANQ'&&scope.row.chargeBillConfigCode!='QZSB'">
                                            <template slot-scope="scope1">
                                                <div :title="getTimeByFormat(scope1.row.startTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.startTime,'hh:mm:ss(DD)')}}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="结束时间" align="center" v-if="scope.row.chargeBillConfigCode!='LANQ'&&scope.row.chargeBillConfigCode!='QZSB'">
                                            <template slot-scope="scope1">
                                                <div :title="getTimeByFormat(scope1.row.endTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.endTime,'hh:mm:ss(DD)')}}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="时间" align="center" v-if="scope.row.chargeBillConfigCode=='QZSB'">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div :title="getTimeByFormat(scope1.row.startTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.startTime,'hh:mm:ss(DD)')}}</div>
                                                    <div :title="getTimeByFormat(scope1.row.endTime,'YY年MM月DD日 hh时mm分ss秒')">{{getTimeByFormat(scope1.row.endTime,'hh:mm:ss(DD)')}}</div>
                                                </div>

                                            </template>
                                        </el-table-column>

                                        <el-table-column prop="chargeData" label="收费数据" align="center">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div>{{getChargeData(scope1.row)}}</div>
                                                    <div v-if="scope1.row.dataSourceSort===0&&scope1.row.relateRecord">{{getChargeData(scope1.row.relateRecord)}}</div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="航后签章" align="center" class-name="signBox" v-if="scope.row.chargeBillConfigCode=='LANQ'">
                                            <template slot-scope="scope1">
                                                <div class="signDiv">
                                                    <img :src="scope1.row.afterFlightSign" alt="">
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="航空公司" align="center" class-name="signBox" v-if="getSignColShow('hkgs',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'hkgs')" :key="idx" class="signDiv">
                                                        <img :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作人员" align="center" class-name="signBox" v-if="getSignColShow('czry',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'czry')" :key="idx" class="signDiv">
                                                        <img class="signBox" :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="机组人员" align="center" class-name="signBox" v-if="getSignColShow('jzry',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'jzry')" :key="idx" class="signDiv">
                                                        <img :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="调度人员" align="center" class-name="signBox" v-if="getSignColShow('ddry',scope.row.chargeBillConfigCode)">
                                            <template slot-scope="scope1">
                                                <div>
                                                    <div v-for="(item,idx) in getSingList(scope1.row,'ddry')" :key="idx" class="signDiv">
                                                        <img :src="item.content" alt="">
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作人" align="center" v-if="scope.row.chargeBillConfigCode!='LANQ'">
                                            <template slot-scope="{row}">
                                                <div>{{row.operatorName?row.operatorName:'--'}}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="审核人" align="center">
                                            <template slot-scope="{row}">
                                                <div>{{row.approvalPersonnel?row.approvalPersonnel:'--'}}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="其他数据" align="center" width="100">
                                            <template slot-scope="{row}">
                                                <el-popover placement="left" trigger="hover">
                                                    <table class="sumTable" border="1">
                                                        <tr>
                                                            <td style="padding:10px 20px">发送人</td>
                                                            <td style="padding:10px 20px">{{row.sendPersonnel?row.sendPersonnel:'--'}}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">发送时间</td>
                                                            <td style="padding:10px 20px">{{getTimeByFormat(row.sendTime,'hh:mm:ss(DD)')}}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">补录人</td>
                                                            <td style="padding:10px 20px">{{row.supplementPersonnel?row.supplementPersonnel:'--'}}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">变更人</td>
                                                            <td style="padding:10px 20px">{{row.changePersonnel?row.changePersonnel:'--'}}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 20px">变更时间</td>
                                                            <td style="padding:10px 20px">{{getTimeByFormat(row.changeTime,'hh:mm:ss(DD)')}}</td>
                                                        </tr>
                                                    </table>
                                                    <el-button slot="reference" type="primary" size="mini">查看</el-button>
                                                </el-popover>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="remark" label="备注" align="center">
                                            <template slot-scope="{row}">
                                                <div :title="row.remark">{{row.remark?row.remark:'--'}}</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" align="center" v-if="!searchDel" class-name="optBox" width="130">
                                            <template slot-scope="scope1">
                                                <el-button type="text" title="审批" @click="approval(scope1.row)" :disabled="!!(scope1.row.approvalStatus=='PASS'||scope1.row.dataSourceSort==1&&scope1.row.chargeBillConfigCode=='LANQ')" v-show="getPower(scope.row,'charge_approval')">审批</el-button>
                                                <el-button type="text" title="编辑" @click="edit('edit',scope1.row,scope.row)" :disabled="!!scope1.row.send" v-show="getPower(scope1.row,'charge_edit')">编辑</el-button>
                                                <el-dropdown trigger="click" style="margin-left:.1rem;">
                                                    <el-button type="text" title="更多" class="el-dropdown-link">
                                                        更多
                                                    </el-button>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item>
                                                            <el-button type="text" title="删除" @click="del(scope1.row)" :disabled="!!(scope1.row.approvalStatus=='PASS')" v-show="getPower(scope1.row,'charge_delete')">删除</el-button>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item>
                                                            <el-button type="text" title="历史" @click="history(scope1.row)">历史</el-button>
                                                        </el-dropdown-item>
                                                        <!-- <el-dropdown-item>
                                                            <el-button type="text" title="备注" @click="edit('remark',scope1.row)" :disabled="!!(scope1.row.approvalStatus=='PASS'||scope1.row.send)">备注</el-button>
                                                        </el-dropdown-item> -->
                                                        <el-dropdown-item>
                                                            <el-button type="text" title="发送日志" @click="sendLog(scope1)">日志</el-button>
                                                        </el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" align="center" v-else class-name="optBox" width="130">
                                            <template slot-scope="scope1">
                                                <el-button type="text" title="历史" @click="history(scope1.row)">历史</el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>

                                <div class="bill_expand_Box1" v-show="scope.row.flightSupplementInfos&&scope.row.flightSupplementInfos.length>0">
                                    <el-form :inline="true" class="demo-form-inline">
                                        <el-form-item :label="item.supplementTitle+':'" v-for="(item,idx) in scope.row.flightSupplementInfos" :key="idx">
                                            <el-input v-model="item.valueTitle" v-if="item.type===0||item.type===1" :type="item.type===0?'number':'text'" @change="saveSupplement(item)"></el-input>
                                            <el-select v-model="item.valueCode" v-else placeholder="请选择" filterable :multiple="item.type===2?false:true" @change="saveSupplement(item)">
                                                <el-option v-for="select in getSupplementOption(item.supplementInfoConfig)" :key="select.code" :label="select.describe" :value="select.code"></el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-form>
                                </div>

                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="序号" width="80" align="center" class-name="indexTd">
                        <template slot-scope="scope">
                            {{(submitData.current-1)*submitData.size+scope.$index+1}}
                            <div v-show="scope.row.chargeRecords&&scope.row.chargeRecords.length>0">费</div>
                            <div v-show="scope.row.flightSupplementInfos&&scope.row.flightSupplementInfos.length>0">补</div>
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="chargeBillConfigName" label="名称" sortable='custom'></el-table-column>
                    <el-table-column label="计划时间">
                        <template slot-scope="scope">
                            <div>{{getTimeByFormat(getRowFlightLoading(scope.row)['A'].scheduleTime,'YY-MM-DD hh:mm')}}</div>
                            <div>{{getTimeByFormat(getRowFlightLoading(scope.row)['D'].scheduleTime,'YY-MM-DD hh:mm')}}</div>

                        </template>
                    </el-table-column>
                    <el-table-column label="实际时间">
                        <template slot-scope="scope">
                            <div>{{getTimeByFormat(getRowFlightLoading(scope.row)['A'].actualTime,'YY-MM-DD hh:mm')}}</div>
                            <div>{{getTimeByFormat(getRowFlightLoading(scope.row)['D'].actualTime,'YY-MM-DD hh:mm')}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="seat" label="机位" sortable='custom' width="70"></el-table-column>
                    <el-table-column prop="flight.flightNo" label="航班号" sortable='custom'>
                        <template slot-scope="scope">
                            <div>{{getActiveFlight(scope).flightNo}}({{getActiveFlight(scope).successionFlightNo?getActiveFlight(scope).successionFlightNo:'--'}})</div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="aircraftNo" label="机号" sortable='custom' width="80"></el-table-column>
                    <el-table-column prop="flight.aircraftType" label="机型" sortable='custom' width="80">
                        <template slot-scope="scope">
                            <div>{{getActiveFlight(scope).aircraftType}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="" label="进/离" width="70">
                        <template slot-scope="{row}">
                            <div>{{row.flight.movement=='A'?'进':'离'}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="汇总" width="120">
                        <template slot-scope="scope">
                            <el-popover placement="right" trigger="hover" v-if="size(scope.row.sum)>1">
                                <table class="sumTable" border="1">
                                    <tr v-for="(value,key) in scope.row.sum" :key="key">
                                        <td style="padding:10px 20px">{{key=='秒'?timeLength(parseInt(value*1000)):`${value}${key}`}}</td>
                                    </tr>
                                </table>
                                <el-button slot="reference" type="primary" size="mini" v-if="scope.row.sum&&JSON.stringify(scope.row.sum) != '{}'">查看</el-button>
                            </el-popover>
                            <span v-else>
                                {{getSumText(scope.row.sum)}}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="flight.aircraftType" label="是否发送" width="80">
                        <template slot-scope="scope">
                            {{scope.row.sendAll?'已发送':'未发送'}}
                        </template>
                    </el-table-column>
                    <el-table-column label="其他数据" align="center" width="100">
                        <template slot-scope="{row}">
                            <el-popover placement="left" trigger="hover">
                                <table class="sumTable" border="1">

                                    <tr>
                                        <td style="padding:10px 20px">变更人</td>
                                        <td style="padding:10px 20px">{{row.changePersonnel?row.changePersonnel:'--'}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:10px 20px">变更时间</td>
                                        <td style="padding:10px 20px">{{getTimeByFormat(row.changeTime,'hh:mm:ss(DD)')}}</td>
                                    </tr>
                                </table>
                                <el-button slot="reference" type="primary" size="mini">查看</el-button>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" v-if="!searchDel" class-name="optBox" width="200">
                        <template slot-scope="scope">
                            <el-button type="text" title="新增" @click="add(scope.row)" v-show="powerData.charge_add" :disabled="!!scope.row.approvalStatus">新增</el-button>
                            <el-button type="text" title="审批" @click="approval([scope.row],'arrs')" :disabled="!!scope.row.approvalStatus" v-show="powerData.charge_approval">审批</el-button>
                            <el-button type="text" title="上报" @click="report(scope)" :disabled="scope.row.report" v-if="getReportShow(scope)">上报</el-button>
                            <el-button type="text" title="下载" @click="download(scope.row)" v-show="powerData.charge_download">下载</el-button>
                            <el-button type="text" title="删除" @click="delBill([scope.row])" v-show="powerData.charge_delete&&scope.row.chargeRecords.length==0">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="paginationBox">
                    <el-pagination background @size-change="handleSizeChange" @current-change="pageBC" :current-page="submitData.current" :page-sizes="[10,20, 30, 50, 100]" :page-size="submitData.size" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                </div>
            </div>
        </div>
        <charge-bill-edit ref="ref_editList" @update="update" :userDeptLists="userDeptLists"></charge-bill-edit>
        <add-list ref="ref_addList" @update="update" :userDeptLists="userDeptLists" :chargeBillArrs="chargeBillArrs"></add-list>
        <supplement-edit ref="ref_supplementEdit" @update="update"></supplement-edit>
        <history ref="ref_history"></history>

        <el-dialog :visible.sync="logShow" id="addTask" class="codeDialog" center width="1000px" :show-close="false">
            <div slot="title" class="head">
                <div></div>
                <span>日志</span>
                <i class="el-icon-circle-close" @click="logShow=false"></i>
            </div>
            <ul>
                <li v-for="(item,idx) in logLists" :key="idx">
                    {{item.content}}
                </li>

            </ul>

        </el-dialog>
    </div>

</template>

<script>
import ChargeBillEdit from './components/charge_bill_edit'
import AddList from './components/addList'
import SupplementEdit from './components/supplement_edit'
import History from './components/history'
export default {
    props: ['power', 'flagNav'],
    components: {
        'charge-bill-edit': ChargeBillEdit,
        'add-list': AddList,
        'supplement-edit': SupplementEdit,
        history: History,
    },
    data() {
        return {
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
        }
    },

    created() {},
    mounted() {
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
        sendLog({ row }) {
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
        getRowFlightLoading({ flight }) {
            let obj = {
                A: {},
                D: {},
            }
            if (!flight) {
                return obj
            }
            if (flight.movement == 'A') {
                obj['A'] = flight
                obj['D'] = flight.flight || {}
            } else {
                obj['D'] = flight
                obj['A'] = flight.flight || {}
            }
            return obj
        },
        getActiveFlight({ row }) {
            let flightId = row.flightId
            if (row.flight.flightId == flightId) {
                return row.flight
            } else {
                return row.flight.flight
            }
        },
        sortChange({ prop, order }) {
            this.sortObj = {}
            this.sortObj[prop] = order
            if (!order) {
                this.sortObj = {}
            }
            this.submitData.current = 1
            this.handleLists()
        },
        inIframeInit(data) {
            if (data.token) {
                sessionStorage.setItem('token', data.token)
                this.pageType = data.pageType
                this.getChargeBillArr()
            }
        },
        getRowName({ row }) {
            let flight = _.find(this.lists, { id: row.chargeBillId }).flight
            let name = 'expandRow'
            let startTime = row.startTime ? new Date(row.startTime).getTime() : ''
            let endTime = row.endTime ? new Date(row.endTime).getTime() : ''
            let atd = flight.atd ? new Date(flight.atd).getTime() : ''
            let ata = flight.ata ? new Date(flight.ata).getTime() : ''

            if (
                (atd && endTime && atd < endTime) ||
                (ata && startTime && ata > startTime) ||
                (endTime &&
                    startTime &&
                    (endTime - startTime > 6 * 60 * 60 * 1000 ||
                        endTime - startTime < 10 * 60 * 1000))
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
                    let hasData = this.getRowClass({ row: value }) ? false : true

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

            if (this.searchTime && this.searchTime.length > 0) {
                data.startTime = this.searchTime[0]
                data.endTime = this.searchTime[1]
            }
            if (this.searchDel) {
                data.deleted = this.searchDel
            }
            if (this.searchStr) {
                data.params = this.searchStr
            }
            if (this.searchSeat) {
                data.seat = this.searchSeat
            }
            if (this.searchAircraftNo) {
                data.aircraftNo = this.searchAircraftNo
            }
            data.approvalStatus = this.searchApproval
            data.send = this.searchSend

            this.searchYesterdaySend = false
            this.searchYesterdayTime = false

            data.yesterdayTime = false
            data.yesterdaySend = false

            data = { ...data, orderBy: this.sortObj }
            this.findChargeBillWhitPageAndPc(data)
        },
        getunSendCount() {
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
                this.searchSend = !this.searchYesterdaySend
            } else {
                this.searchYesterdaySend = false
                this.searchYesterdayTime = !this.searchYesterdayTime
            }

            this.searchTime = []

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

            data.yesterdaySend = this.searchYesterdaySend
            data.yesterdayTime = this.searchYesterdayTime

            data = { ...data, orderBy: this.sortObj }
            this.findChargeBillWhitPageAndPc(data)
        },
        findChargeBillWhitPageAndPc(data, update, getCount) {
            if (!getCount) {
                this.submitData = data
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

                    lists.map((list) => {
                        list.chargeRecords = _.sortBy(list.chargeRecords, 'chargeCode')

                        if (list.chargeBillConfigCode == 'QZSB') {
                            list.flightSupplementInfos.map((list) => {
                                if (_.includes(list.supplementTitle, '航班')) {
                                    list.sort = 0
                                }
                                if (_.includes(list.supplementTitle, '飞机')) {
                                    list.sort = 1
                                }
                                if (_.includes(list.supplementTitle, '电源')) {
                                    list.sort = 2
                                }
                                if (_.includes(list.supplementTitle, '空调')) {
                                    list.sort = 3
                                }
                                if (_.includes(list.supplementTitle, '备注')) {
                                    list.sort = 4
                                }
                            })
                            list.flightSupplementInfos = _.sortBy(
                                list.flightSupplementInfos,
                                'sort'
                            )
                        }

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
                    records.push({ data: list })
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
        arraySpanMethod({ row, column, rowIndex, columnIndex }) {
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

            let arrs = this.selections.filter((list) => {
                return !list.chargeRecords || list.chargeRecords.length == 0
            })
            console.log(arrs)
            if (arrs.length > 0) {
                this.$alert('不能选择无收费项数据进行审批！', '提示', {
                    type: 'error',
                    center: true,
                })
                return false
            }
            this.approval(this.selections, 'arrs')
        },
        approval(row, type) {
            let data = []

            if (type) {
                row.forEach((list, idx) => {
                    let chargeRecordIds = _.reduce(
                        list.chargeRecords || [],
                        function (result, value) {
                            if (value.approvalStatus != 'PASS' && value.chargeData) {
                                result.push({ id: value.id })
                            }
                            return result
                        },
                        []
                    )

                    if (chargeRecordIds.length == 0) {
                        this.$alert(
                            `勾选的第${idx + 1}二条收费单，收费记录以全部审批，不能重复审批！`,
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
                if (row.approvalStatus == 'PASS') {
                    this.$alert('该收费记录已经审批！', '提示', {
                        type: 'error',
                        center: true,
                    })
                    return false
                }
                if (!row.chargeData) {
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
                        chargeRecords: [{ id: row.id }],
                    },
                ]
            }
            this.$confirm('确定审批?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios
                    .post('/charge-record/approval?approvalStatus=PASS', data)
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
        report({ row }) {
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
            this.$refs.ref_editList.initData(type, _.cloneDeep(data), row)
        },
        add(row) {
            this.$refs.ref_addList.initData(row, this.chargeBillArrs)
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
            let obj = _.find(lists, { code: item })
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
            let obj = _.find(row.chargeBillSigns, { type: type })
            return obj ? obj.content : ''
        },
        getSingList(row, type) {
            let lists = _.filter(row.chargeBillSigns, { type: type })
            return lists
        },
        getSignColShow(type, code) {
            let charge = _.find(this.chargeBillArrs, { code })
            if (charge) {
                let sign = _.find(charge.chargeBillConfigSignList, { dataCode: type })
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
            let role = _.find(this.userData.roles, { code: row.chargeBillConfigCode })
            let obj = role ? _.find(role.menus, { code: power }) : ''
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
        getReportShow({ row }) {
            let airline = _.find(this.reporLists, { code: 'RULE_CHARGE_PUB_AL' })
            let charge = _.find(this.reporLists, { code: 'RULE_CHARGE_PUB_BILL' })
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
        getCellClassname({ row, column }) {
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
        saveSupplement(item) {
            let data = _.cloneDeep(item)
            if (item.type == 2) {
                let options = this.getSupplementOption(item.supplementInfoConfig)
                let option = _.find(options, { code: item.valueCode })
                data.valueTitle = option.describe
            } else if (item.type == 3) {
                let title = []
                let code = []
                let options = this.getSupplementOption(item.supplementInfoConfig)
                item.valueCode.map((list) => {
                    let option = _.find(options, { code: list })
                    title.push(option.describe)
                    code.push(option.code)
                })
                data.valueCode = code.join(',')
                data.valueTitle = title.join(',')
            } else {
                data.valueCode = data.valueTitle
            }

            this.$axios.post('/flight-supplement-info/save', data).then((res) => {
                this.$message({
                    message: res.msg,
                    type: 'success',
                })
                this.update()
            })
        },
    },
}
</script>
