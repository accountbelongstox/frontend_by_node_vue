<template>
    <div class="">
        <div id="customContextMenu" v-show="showContextMenu" class="fixed z-50 overflow-y-auto customContextMenu"
            :style="{ top: `${menuY}px`, left: `${menuX}px` }">
            <div class="navbar-custom-menu">
                <ul class="menu overflow-hidden w-auto h-auto bg-white border border-gray-300 rounded shadow-lg">
                    <li>
                        <a href="javascript:void(0)" @click="runAsAdmin"
                            class="contextMenuA flex items-center px-4 py-2 hover:bg-gray-100">
                            <svg t="1709795596066" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="10984" width="20" height="20">
                                <path
                                    d="M784.7936 241.8688H239.2064c-29.9008 0-54.0672 24.1664-54.0672 54.0672v322.9696c0 29.9008 24.1664 54.0672 54.0672 54.0672h545.3824c29.9008 0 54.0672-24.1664 54.0672-54.0672V296.1408c0.2048-29.9008-23.9616-54.272-53.8624-54.272z m-183.9104 234.496L452.608 561.9712c-12.6976 7.3728-28.672-1.8432-28.672-16.5888v-171.2128c0-14.7456 15.9744-23.9616 28.672-16.5888l148.2752 85.6064c12.6976 7.3728 12.6976 25.8048 0 33.1776zM651.0592 782.1312H372.9408c-14.1312 0-25.6-11.4688-25.6-25.6s11.4688-25.6 25.6-25.6h278.1184c14.1312 0 25.6 11.4688 25.6 25.6s-11.4688 25.6-25.6 25.6z"
                                    p-id="10985"></path>
                            </svg>
                            运行软件(管理员)
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" @click="openSoftwareLocation"
                            class="contextMenuA flex items-center px-4 py-2 hover:bg-gray-100">
                            <svg t="1709795692883" class="icon" viewBox="0 0 1696 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="13123" width="20" height="20">
                                <path
                                    d="M1507.555556 880.733945h-52.191642V69.80632A17.4842 17.4842 0 0 0 1438.140673 52.191641H258.087666a17.353721 17.353721 0 0 0-17.223242 17.614679V880.733945h-52.191641V69.80632A69.675841 69.675841 0 0 1 258.087666 0h1180.053007a69.675841 69.675841 0 0 1 69.414883 69.80632z"
                                    fill="#282D33" p-id="13124"></path>
                                <path
                                    d="M1392.472987 785.353721H303.885831V120.040775h301.01529v52.191641H356.077472v560.929664h984.203874V172.232416h-255.739042v-52.191641h307.930683v665.312946zM1571.490316 1024H124.607543c-49.060143 0-107.64526-43.188583-114.169215-48.146789L0 968.154944v-117.431193h1696.228338v117.431193l-10.438328 7.828746c-6.523955 4.827727-65.239551 48.01631-114.299694 48.01631zM52.191641 941.537207c20.876656 13.830785 52.191641 30.271152 72.415902 30.271152h1446.882773c21.79001 0 54.148828-18.267074 72.546381-30.271152v-39.143731H52.191641z"
                                    fill="#282D33" p-id="13125"></path>
                                <path
                                    d="M848.114169 686.189602l-16.962283-14.744138C808.970438 652.395515 608.685015 476.379205 608.685015 349.16208a239.429154 239.429154 0 1 1 478.858308 0c0 127.217125-199.633028 302.711519-221.814475 322.283384z m0-526.352701a188.542304 188.542304 0 0 0-187.237513 189.325179c0 79.98369 122.519878 208.766565 187.237513 267.61264 65.239551-59.107034 187.237513-187.759429 187.237513-267.61264A188.542304 188.542304 0 0 0 848.114169 159.836901z"
                                    fill="#282D33" p-id="13126"></path>
                                <path
                                    d="M848.114169 469.724771a120.432212 120.432212 0 1 1 119.649338-120.432212A120.171254 120.171254 0 0 1 848.114169 469.724771z m0-188.672783a68.240571 68.240571 0 1 0 67.457696 68.240571A67.718654 67.718654 0 0 0 848.114169 280.921509z"
                                    fill="#282D33" p-id="13127"></path>
                            </svg>
                            软件位置
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" @click="openIconDir"
                            class="contextMenuA flex items-center px-4 py-2 hover:bg-gray-100">
                            <svg t="1709795571708" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="9985" width="20" height="20">
                                <path
                                    d="M243.36 388.32h537.28a48 48 0 0 1 48 48V816H194.72V437.12a48 48 0 0 1 48.64-48.8z"
                                    fill="#DFE8F4" p-id="9986"></path>
                                <path
                                    d="M146.08 816h731.84A18.08 18.08 0 0 1 896 833.76v10.4a56.8 56.8 0 0 1-56.8 56.8h-654.4A56.8 56.8 0 0 1 128 844.32v-10.4A18.08 18.08 0 0 1 146.08 816z"
                                    fill="#0795FF" p-id="9987"></path>
                                <path
                                    d="M419.68 832.96a37.12 37.12 0 0 0 31.2 17.12h122.24a37.12 37.12 0 0 0 32-17.12 36.96 36.96 0 0 1 30.4-16.96H388.48a36.96 36.96 0 0 1 31.2 16.96z"
                                    fill="#156CDD" p-id="9988"></path>
                                <path d="M194.72 777.12h633.28v38.72H194.72z" fill="#CCD8E5" p-id="9989"></path>
                                <path
                                    d="M710.08 424.16a198.24 198.24 0 0 0-208-197.92 208 208 0 0 0-187.84 184.48 197.76 197.76 0 0 0 73.6 167.84 427.2 427.2 0 0 1 114.24 135.52l5.76 11.04a4.64 4.64 0 0 0 8.32 0l3.36-6.4a436.96 436.96 0 0 1 116-139.84 197.12 197.12 0 0 0 74.56-154.72z"
                                    fill="#0795FF" p-id="9990"></path>
                                <path d="M512 429.28m-66.72 0a66.72 66.72 0 1 0 133.44 0 66.72 66.72 0 1 0-133.44 0Z"
                                    fill="#156CDD" p-id="9991"></path>
                            </svg>
                            图标位置
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" @click="reInstall"
                            class="contextMenuA flex items-center px-4 py-2 hover:bg-gray-100">
                            <svg t="1709795521099" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="7913" width="20" height="20">
                                <path
                                    d="M972.8 307.2v614.4a51.2 51.2 0 0 1-51.2 51.2H102.4a51.2 51.2 0 0 1-51.2-51.2V307.2h921.6z m-460.8 115.2a38.4 38.4 0 0 0-38.4 38.4v265.6768l-88.064-88.064a38.4 38.4 0 0 0-54.272 54.3232l153.6 153.6a38.6048 38.6048 0 0 0 8.2432 6.2976l0.7168 0.4096a38.0928 38.0928 0 0 0 1.7408 0.8704l1.536 0.6656a38.144 38.144 0 0 0 7.936 2.4064l1.7408 0.256 1.4336 0.1536c0.768 0.1024 1.536 0.1536 2.3552 0.1536l1.4336 0.0512a39.0656 39.0656 0 0 0 16.4864-3.6864l1.6896-0.8704 0.7168-0.4096a39.8336 39.8336 0 0 0 2.6112-1.6384l1.3312-0.9216a40.192 40.192 0 0 0 4.3008-3.7376l153.6-153.6a38.4 38.4 0 0 0-54.272-54.272l-88.064 87.9616V460.8a38.4 38.4 0 0 0-33.1776-38.0416zM59.904 247.296l166.0928-166.0928A102.4 102.4 0 0 1 298.3936 51.2h427.2128a102.4 102.4 0 0 1 72.3968 30.0032l166.0416 166.0416a5.12 5.12 0 0 1-3.584 8.7552H63.488a5.12 5.12 0 0 1-3.584-8.704z"
                                    p-id="7914"></path>
                            </svg>
                            重新安装
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" class="contextMenuA flex items-center px-4 py-2 hover:bg-gray-100">
                            <svg t="1709795421985" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="5128" width="20" height="20">
                                <path
                                    d="M661.813 734.064H370.589c-11.516 0-20.813-9.116-20.813-20.874V420.707l-138.684 0.12c-11.637 0-21.535-9.237-21.355-20.634-0.18-6.119 2.76-11.277 6.359-15.356L501.294 79.875c8.157-8.039 21.595-7.918 29.514-0.241l305.199 305.202c8.399 8.517 8.399 21.835 0 29.992-4.016 4.319-9.415 5.999-14.334 5.999H682.568V713.19c0.18 11.758-8.879 20.874-20.755 20.874z"
                                    fill="#0071BC" p-id="5129"></path>
                                <path
                                    d="M915.333 883.906c19.435 0 35.15 15.476 35.15 35.03 0.24 19.437-15.716 34.792-35.15 34.912l-798.875-0.12c-19.194 0-34.911-15.355-34.911-34.792 0-19.555 15.717-35.03 34.911-35.03h798.875z"
                                    fill="#00A0E9" p-id="5130"></path>
                            </svg>

                            升级
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" class="contextMenuA flex items-center px-4 py-2 hover:bg-gray-100">
                            <svg t="1709795664845" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="12045" width="20" height="20">
                                <path
                                    d="M42.666667 768c0 46.933333 38.4 85.333333 85.333333 85.333333h768c46.933333 0 85.333333-38.4 85.333333-85.333333v-170.666667H42.666667v170.666667z m672-64h106.666666c17.066667 0 32 14.933333 32 32s-14.933333 32-32 32h-106.666666c-17.066667 0-32-14.933333-32-32s14.933333-32 32-32zM829.866667 230.4C819.2 194.133333 785.066667 170.666667 748.8 170.666667H275.2c-36.266667 0-70.4 23.466667-81.066667 59.733333L42.666667 533.333333h938.666666l-151.466666-302.933333zM746.666667 473.6v17.066667c-2.133333-21.333333-10.666667-40.533333-23.466667-57.6-12.8-17.066667-27.733333-34.133333-46.933333-46.933334-19.2-12.8-40.533333-23.466667-66.133334-32-23.466667-8.533333-49.066667-12.8-76.8-12.8h-17.066666c-6.4 0-10.666667 0-17.066667 2.133334-6.4 0-10.666667 2.133333-14.933333 2.133333-4.266667 0-10.666667 2.133333-14.933334 4.266667v74.666666l-170.666666-115.2 170.666666-113.066666v64c38.4 0 74.666667 6.4 106.666667 17.066666 34.133333 10.666667 64 25.6 87.466667 44.8 25.6 19.2 44.8 42.666667 59.733333 68.266667 17.066667 25.6 23.466667 53.333333 23.466667 83.2z"
                                    p-id="12046"></path>
                            </svg> 备份
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="flex flex-wrap">
            <div v-for="(group, index) in softList" :key="index"
                :class="['flex-auto', 'bg-gray-200', 'm-2', 'p-3-cus', 'box', 'bl-5', 'border-l-solid', group.border, 'rounded', 'pull-up', 'icon-list-box']"
                :id="group.gid" :style="groupStyle(group)">
                <div class="box-body" style="padding: 0;">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center pr-2 justify-content-between">
                            <h4 class="font-weight-500 softname_group_title" style="color: #fff;">
                                <span class="text-lg overflow-hidden whitespace-nowrap text-white">{{ group.show_cn
                                    }}</span>
                            </h4>
                        </div>
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex" :id="'icon_' + group.gid"
                            style="flex-wrap: wrap; display: flex; justify-content: center;">
                            <div v-for="(software, sIndex) in group.softwareList" :key="sIndex"
                                class="aid_container software-hover"
                                @contextmenu="($event) => handleContextMenu($event, software)"
                                :style="getContainerStyle(software)">
                                <a href="javascript:;" @dblclick="runTheSoftware(software)" :id="software.aid"
                                    :style="getIconDivStyle(software)">
                                    <div class="icon-container" :style="getIconDivWidthHeight(software)">
                                        <div class="default_software_icon " :style="getIconDivWidthHeight(software)">
                                            <img class="rounded-full" :src="software.iconBase64" :alt="software.target"
                                                :title="software.target" :style="getIconStyle(software)" />
                                        </div>
                                        <div v-if="software.isOpenning" class="spin_chart_sentence"
                                            :style="getIconDivWidthHeight(software)">
                                            <svg t="1709831783710" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                                xmlns="http://www.w3.org/2000/svg" p-id="2752"
                                                :width="software.icon_width" :height="software.icon_width">
                                                <path
                                                    d="M109.73952 163.498667A146.346667 146.346667 0 1 0 256.000853 15.872a147.2 147.2 0 0 0-146.261333 147.626667zM0.000853 477.269333c-0.170667 46.165333 24.149333 88.917333 64 112.298667 39.594667 23.04 88.490667 23.04 128 0a130.56 130.56 0 0 0 0-224.426667 126.976 126.976 0 0 0-128 0A129.450667 129.450667 0 0 0 0.000853 477.184z m109.738667 276.906667A109.738667 109.738667 0 1 0 219.30752 643.413333a110.250667 110.250667 0 0 0-109.653333 110.848v-0.085333z m311.466667 121.6a96 96 0 1 0 192-1.706667 96 96 0 0 0-192 1.706667zM731.30752 772.437333a91.477333 91.477333 0 1 0 26.453333-65.024 91.818667 91.818667 0 0 0-26.453333 65.28v-0.256z m146.261333-313.685333A73.130667 73.130667 0 1 0 1024.000853 457.472a73.130667 73.130667 0 0 0-146.176 1.365333zM768.086187 181.930667a55.466667 55.466667 0 0 0 27.392 47.957333 54.442667 54.442667 0 0 0 54.869333 0 55.210667 55.210667 0 1 0-82.261333-47.957333zM503.382187 36.864c0 13.226667 6.997333 25.429333 18.346666 32.085333a36.266667 36.266667 0 0 0 36.522667 0 37.12 37.12 0 0 0 0-64 36.266667 36.266667 0 0 0-36.522667 0 37.034667 37.034667 0 0 0-18.346666 32z"
                                                    fill="#ffffff" fill-opacity=".648" p-id="2753"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="titl_egroup">
                                        <div class="install-button"
                                            v-if="!software.isExist && !software.installingProgress">
                                            <a href="javascript:;" @click="installTheSoftware(software)"
                                                v-if="!software.isExist && !software.isInstalling && software.winget_id != ''"
                                                class="bg-[#ffffff]/[1] text-[#009688] inline-block text-sm mb-2-install">
                                                Get-w</a>
                                            <a href="javascript:;" @click="installTheSoftware(software)"
                                                v-else-if="!software.isExist && !software.isInstalling && software.source_local != ''"
                                                class="bg-[#ffffff]/[1] text-[#009688] inline-block text-sm mb-2-install ">
                                                Get-ld</a>
                                            <a href="javascript:;" @click="installTheSoftware(software)"
                                                v-else-if="!software.isExist && !software.isInstalling && software.source_internet != ''"
                                                class="bg-[#ffffff]/[1] text-[#009688] inline-block text-sm mb-2-install ">
                                                Get-id</a>
                                            <a href="javascript:;" @click="installTheSoftware(software)"
                                                v-else-if="!software.isExist && !software.isInstalling && software.install_type == ''"
                                                class="bg-[#ffffff]/[1] text-[#009688] inline-block text-sm mb-2-install ">
                                                Get-z</a>
                                            <span v-else="software.isInstalling"
                                                class="bg-[#ffffff]/[1] text-[#009688] inline-block text-sm mb-2-install">wait.</span>
                                        </div>
                                        <div class="install-progress" v-if="software.installingProgress">
                                            <div
                                                class="rounded-full h-2.5 p-0.5 bg-dark-light dark:bg-dark-light/10 mb-5">
                                                <div class="bg-gradient-to-r from-[#1e9afe] to-[#60dfcd] h-full rounded-full"
                                                    :style="{ width: software.installingProgress + '%' }"></div>
                                            </div>
                                        </div>
                                        <div class="show-title">
                                            <h6 class="mb-0 softname_title" :class="getTitleClass(software)">
                                                <span class="softname_titlelinear">{{ software.basename }}</span>
                                            </h6>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="grid sm:grid-cols-1 xl:grid-cols-1 gap-6 pt-5">
            <div class="h-full p-0 border-0 overflow-hidden">
                <div class="p-5">
                    <div class="mb-5">
                        <span
                            class="bg-[#1b2e4b] text-white text-xs rounded-full px-4 py-1.5 before:bg-white before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">开发环境指南,:\apps。</span>
                        <span
                            class="bg-[#1b2e4b] text-white text-xs rounded-full px-4 py-1.5 before:bg-white before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">软件使用指南,软件统一安装D:\apps。</span>
                    </div>
                    <div class="text-center px-2 flex justify-around">
                        <button type="button" class="btn btn-secondary ltr:mr-2 rtl:ml-2">View Details</button>
                        <button type="button" class="btn btn-success">Pay Now $29.51</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import mittEvent from '@/api/vue3/mitt.js';
import swalMsg from '@/api/vue3/swal_msg.js';
swalMsg.setSetupSwal(inject('$swal'));

import { useAppStore } from '@/stores/index';
const store = useAppStore();
import socket from '@/api/vue3/socket';
const softList = ref([]);

mittEvent.on('installer', (data) => {
    console.log(`installer:`, data);
    if (data && data.basename) {
        if (data.installingProgress) {
            const installingProgress = parseFloat(data.installingProgress)
            if (!isNaN(installingProgress)) {
                if (installingProgress < 0) {
                    const installMessage = data.installMessage ? data.installMessage : '';
                    if (installMessage) {
                        swalMsg.showToastBottomRight(installMessage, "error");
                    }
                }
                if (installingProgress >= 100 || installingProgress < 0) {
                    updateSoftwareValueByAid(data.aid, 'isInstalling', false);
                    deleteSoftwareValueByAid(data.aid, 'installingProgress');
                    updateSoftwareValueByAid(data.aid, 'isExist', data.isExist);
                    if (data.isExist) {
                        swalMsg.showToastTopRight(`${data.basename} 安装完成`);
                    } else {
                        swalMsg.showToastBottomRight(`${data.basename} 安装失败`, "error");
                    }
                } else {
                    updateSoftwareValueByAid(data.aid, 'installingProgress', installingProgress);
                }
            }
        }
    }
});
mittEvent.on('opensoft', (data) => {
    if (data && data.basename) {
        deleteSoftwareValueByAid(data.aid, 'isOpenning');
    }
});
const installTheSoftware = (software: any) => {
    if (software.isInstalling) {
        console.log('isInstalling by :', software.basename);
        return;
    }
    software.isInstalling = true;
    socket.sendData(`installSoftware`, software);
};
const runTheSoftware = (software: any) => {
    if (!software.isExist) {
        return installTheSoftware(software)
    }
    software.isOpenning = true;
    socket.sendData(`runSoftware`, software, (result: any) => {
    });
};
const isHovered = ref(Array.from({ length: softList.value.length }, () => false));
const setHovered = (index: number) => {
    isHovered.value = isHovered.value.map((hovered, i) => i === index);
};
socket.sendData(`getDesktopList`, (result: any) => {
    softList.value = result
})
const hideMenu = () => {
    showContextMenu.value = false;
};
const showContextMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const handleMenuItemClick = (option) => {
    console.log('Clicked:', option);
    hideMenu();
};
const router = useRouter();
const hasRoute = router.hasRoute(`desktop`);
let previousBackgroundImage = '';
if (hasRoute) {
    previousBackgroundImage = document.body.style.backgroundImage;
    document.body.style.backgroundImage = "url('/assets/images/Windows11.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.addEventListener('scroll', hideMenu);
    document.addEventListener('click', hideMenu);
    document.addEventListener('dblclick', hideMenu);
    socket.sendData(`getBackgroundByNetwork`, (result: any) => {
        if (result && result.base64Img && /^data:image\/([a-zA-Z]*);base64,/.test(result.base64Img)) {
            document.body.style.backgroundImage = `url('${result.base64Img}')`;
        }
    });
}
const clearDesktopSet = () => {
    document.body.style.backgroundImage = previousBackgroundImage;
    document.removeEventListener('scroll', hideMenu);
    document.removeEventListener('click', hideMenu);
    document.removeEventListener('dblclick', hideMenu);
}
onMounted(() => {
    router.beforeEach((to, from, next) => {
        if (to.name != 'desktop') {
            clearDesktopSet();
        }
        next();
    });
});
onUnmounted(() => {
    clearDesktopSet();
});
const handleContextMenu = (event, ele) => {
    event.preventDefault();
    showContextMenu.value = true;
    menuX.value = event.clientX;
    menuY.value = event.clientY;
    const exists = ele.exists;
    // const runAsAdminMenuItem = document.querySelector('#customContextMenu li:nth-child(1)');
    // const openSoftwareLocationMenuItem = document.querySelector('#customContextMenu li:nth-child(2)');
    // const openIconDirMenuItem = document.querySelector('#customContextMenu li:nth-child(3)');
    // const reInstallMenuItem = document.querySelector('#customContextMenu li:nth-child(4)');

    // if (exists) {
    //     runAsAdminMenuItem.style.display = 'block';
    //     openSoftwareLocationMenuItem.style.display = 'block';
    //     openIconDirMenuItem.style.display = 'block';
    //     reInstallMenuItem.style.display = 'block';

    //     const customContextMenuImg = document.querySelector('.customContextMenuImg');
    //     customContextMenuImg.style.filter = 'none';
    //     customContextMenuImg.style.opacity = '1';
    // } else {
    //     runAsAdminMenuItem.style.display = 'none';
    //     openSoftwareLocationMenuItem.style.display = 'none';
    //     openIconDirMenuItem.style.display = 'none';
    //     reInstallMenuItem.style.display = 'none';

    //     const customContextMenuImg = document.querySelector('.customContextMenuImg');
    //     customContextMenuImg.style.filter = 'grayscale(100%)';
    //     customContextMenuImg.style.opacity = '0.5';
    // }

};
const getListIconWidth = (group: any): number => {
    const gListLength = group.softwareList.length
    let n = gListLength / 3
    n = Math.ceil(n);
    let imgMargin = 5
    const icon_width = group.icon_width
    const padding_ratio = 0.7; 
    const paddingNum = Math.round(icon_width * padding_ratio);
    let w = (n * (imgMargin * 2 + icon_width)) + paddingNum
    return w 
}
const groupStyle = (group: any) => {
    let w = getListIconWidth(group);
    let css = `width:${w}px;`;
    let style_width = css;
    let app_region = `-webkit-app-region: no-drag;-webkit-user-select: none;`;
    let margin = `margin-right: 10px;`;
    return `${app_region}${style_width}${margin};position: relative;background:none;`;
}
const getContainerStyle = (item: any) => {
    let imgMargin = item.icon_width * 0.1;
    let style = `position:relative;margin: ${imgMargin / 2}px;`;
    if (item.icon_width) {
        style += `width:${item.icon_width + imgMargin}px;`;
    }
    return style;
};
const getIconStyle = (software: any) => {
    let imag_gray = '';
    if (!software.isExist) {
        const installingProgress = software.installingProgress ? 100 - parseInt(software.installingProgress) : 90
        imag_gray = `grayscale(${installingProgress}%)`;
    }
    let imgStyle = `width: ${software.icon_width}px; height: ${software.icon_width}px; filter: ${imag_gray};`;
    return imgStyle;
};
const getIconDivStyle = (software: any) => {
    let imgStyle = `width: ${software.icon_width}px; display: block;`;
    return imgStyle;
};
const getIconDivWidthHeight = (software: any) => {
    let imgStyle = `width: ${software.icon_width}px; height: ${software.icon_width}px; display: block;`;
    return imgStyle;
};

const getTitleClass = (item: any) => {
    let titleClass = (item.basename.length > 8) ? 'softname_title' : 'softname_title_not_translate';
    return titleClass;
};

if (!store.sidebar) {
    store.toggleSidebar();
}
function getSoftwareByGroupAndBasename(groupname, basename) {
    const group = softList.value.find(group => group.groupname === groupname);
    return group ? group.softwareList.find(software => software.basename === basename) : null;
}
function getSoftwareListByGroup(groupname) {
    const group = softList.value.find(group => group.groupname === groupname);
    return group ? group.softwareList : [];
}
function updateSoftwareValueByGroup(groupname, basename, key, value) {
    const group = softList.value.find(group => group.groupname === groupname);
    if (group) {
        const software = group.softwareList.find(software => software.basename === basename);
        if (software) {
            software[key] = value;
        }
    }
}
function updateSoftwareValueByAid(aid, key, value) {
    for (const group of softList.value) {
        const software = group.softwareList.find(software => software.aid === aid);
        if (software) {
            const basename = software.basename;
            software[key] = value;
            return;
        }
    }
}
function deleteSoftwareValueByAid(aid, key) {
    for (const group of softList.value) {
        const software = group.softwareList.find(software => software.aid === aid);
        if (software) {
            delete software[key];
            return;
        }
    }
}
function filterGroupsAndSoftware(inputSoftwareName: string) {
    const filteredGroups = [];
    for (const group of softList.value) {
        const filteredSoftwareList = group.softwareList.filter(software => {
            return software.basename.includes(inputSoftwareName);
        });
        if (filteredSoftwareList.length > 0) {
            filteredGroups.push({ ...group, softwareList: filteredSoftwareList });
        }
    }
    softList.value = filteredGroups;
}
function getLevelPath(apath: string, n: number, x: any) {
    const segments = apath.split(/[\/\\]+/);
    if (x === undefined) {
        return segments[n];
    } else {
        return segments.slice(n, x + 1).join('/');
    }
}
</script>
<style>
.border-l-solid {
    border-left: 2px solid;
}

.icon-list-box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(to top, #5ee7df 0%, #b490ca 100%) !important;
    opacity: 0.3;
    z-index: -1;
    border-radius: 10px;
}

.softname_title,
.softname_title_not_translate {
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    color: #fff;
    font-size: 13px;
    text-align: center;
}

.softname_group_title {
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
}

.softname_group_title:hover .softname_group_sub_title {
    animation: softname_titlescrollLeft 3s linear infinite;
}

.softname_title:hover .softname_titlelinear {
    animation: softname_titlescrollLeft 3s linear infinite;
}

.softname_titlelinear {
    display: inline-block;
    white-space: nowrap;
}

.softname_group_sub_title {
    display: inline-block;
    white-space: nowrap;
}

@keyframes softname_titlescrollLeft {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-100%);
    }
}

.software-hover {
    transition: background-color 0.3s, transform 0.3s;
    transform-origin: center;
}

.software-hover:hover {
    transform: scale(1.1);
}

.aid_container .install-button {
    display: none;
}

.aid_container:hover .install-button {
    display: inline-block;
}

.aid_container {
    border-radius: 10px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between
}

.titl_egroup {
    position: relative;
    width: 100%;
    height: 30px;
    margin: 5px 0;
}

.install-button {
    position: absolute;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 5px 0;
}

.install-progress {
    position: absolute;
    z-index: 1001;
    top: -13px;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 5px 0;
}

.show-title {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.install-button a,
.install-button span {
    border-radius: 5px;
    width: 100%;
    display: block;
    background-color: #f0f0f0;
    height: 100%;
    line-height: 20px;
    text-align: center;
    background-color: #f0f0f0;
}

.icon-container {
    position: relative;
}

.default_software_icon {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
}

.spin_chart_sentence {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.mb-2-install {
    font-size: 12px !important;
}
.p-3-cus{
    padding: 5px !important;
}
.customContextMenu {
    z-index: 9999999 !important;
}
</style>