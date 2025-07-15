// 工程服务页面脚本
// 功能：获取并展示最新空调状态
// 依赖：LeanCloud SDK

// 已由 config.js 统一初始化 LeanCloud，无需重复初始化

/**
 * 查询最新空调记录并渲染到页面
 * 增加研发楼分水阀状态及说明
 */
async function renderLatestAirConditionStatus() {
    const section = document.getElementById('aircondition-section');
    if (!section) return;
    section.innerHTML = '<div class="text-gray-400">正在加载空调状态...</div>';
    try {
        const query = new AV.Query('AirConditionRecord');
        query.descending('createdAt');
        query.limit(1);
        const results = await query.find();
        // 计算分水阀状态
        const now = new Date();
        const hour = now.getHours();
        const isValveOpen = hour >= 7 && hour < 17;
        const valveStatus = isValveOpen ? '<span class="text-green-600 font-bold">开启</span>' : '<span class="text-gray-500 font-bold">关闭</span>';
        if (results.length === 0) {
            section.innerHTML = `
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
                    <div class="flex flex-col gap-2 mb-4">
                        <div class="flex items-center text-base">
                            <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /></svg>
                            研发楼分水阀当前状态：${valveStatus}
                        </div>
                        <div class="text-xs text-blue-700">分水阀开启时间：7:00-17:00，其他时间自动关闭。</div>
                        <div class="text-xs text-gray-600">分水阀作用：用于控制研发楼空调系统的冷水供应，保障研发楼在工作时段内空调正常运行，非工作时段关闭以节能降耗。</div>
                    </div>
                    <div class="text-gray-400">暂无空调记录</div>
                </div>
            `;
            return;
        }
        const record = results[0];
        // 优化后的空调状态卡片样式，顶部增加分水阀状态和说明
        section.innerHTML = `
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
                <div class="flex flex-col gap-2 mb-4">
                    <div class="flex items-center text-base">
                        <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /></svg>
                        研发楼分水阀当前状态：${valveStatus}
                    </div>
                    <div class="text-xs text-blue-700">分水阀开启时间：7:00-17:00，其他时间关闭。</div>
                    <div class="text-xs text-gray-600">分水阀作用：用于控制研发楼空调系统的冷水供应，保障研发楼在工作时段内空调正常运行，非工作时段关闭以节能降耗。</div>
                </div>
                <div class="flex items-center justify-between mb-4">
                    <span class="font-bold text-xl text-blue-800 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v8z" /></svg>
                        当前机组状态
                    </span>
                    <span class="text-lg font-semibold text-blue-600">${record.get('unitStatus') || '未知'}</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700 mb-2">
                    <div class="flex items-center"><span class="w-24 text-gray-500">冷冻水泵：</span><span class="font-medium">${record.get('chilledWaterPump') ? '开' : '关'}</span></div>
                    <div class="flex items-center"><span class="w-24 text-gray-500">冷却水泵：</span><span class="font-medium">${record.get('coolingWaterPump') ? '开' : '关'}</span></div>
                    <div class="flex items-center"><span class="w-28 text-gray-500">冷冻水进水温：</span><span class="font-medium">${record.get('chilledWaterInletTemp') ?? '-'}</span></div>
                    <div class="flex items-center"><span class="w-28 text-gray-500">冷冻水出水温：</span><span class="font-medium">${record.get('chilledWaterOutletTemp') ?? '-'}</span></div>
                    <div class="flex items-center"><span class="w-28 text-gray-500">高温发生器温：</span><span class="font-medium">${record.get('highTempGeneratorTemp') ?? '-'}</span></div>
                    <div class="flex items-center"><span class="w-28 text-gray-500">冷却水进水温：</span><span class="font-medium">${record.get('coolingWaterInletTemp') ?? '-'}</span></div>
                    <div class="flex items-center"><span class="w-28 text-gray-500">冷却水出水温：</span><span class="font-medium">${record.get('coolingWaterOutletTemp') ?? '-'}</span></div>
                    <div class="flex items-center"><span class="w-24 text-gray-500">真空压力：</span><span class="font-medium">${record.get('vacuumPressure') ?? '-'}</span></div>
                    <div class="flex items-center"><span class="w-24 text-gray-500">高区水温：</span><span class="font-medium">${record.get('highZoneWaterTemp') ?? '-'}</span></div>
                    <div class="flex items-center"><span class="w-24 text-gray-500">低区水温：</span><span class="font-medium">${record.get('lowZoneWaterTemp') ?? '-'}</span></div>
                </div>
                <div class="text-right text-xs text-gray-400 mt-2">更新时间：${record.createdAt.toLocaleString()} | 操作人：${record.get('realName') || '-'}</div>
            </div>
        `;
    } catch (e) {
        section.innerHTML = '<div class="text-red-400">空调状态加载失败</div>';
    }
}

/**
 * 查询并渲染报修列表
 */
async function renderRepairList() {
    const list = document.getElementById('repair-list');
    if (!list) return;
    list.innerHTML = '<div class="text-gray-400">正在加载...</div>';
    try {
        const query = new AV.Query('EngineeringRepair');
        query.descending('createdAt');
        query.limit(20);
        const results = await query.find();
        
        if (results.length === 0) {
            list.innerHTML = '<div class="text-gray-400">暂无报修记录</div>';
            return;
        }
        list.innerHTML = results.map(r => `
            <div class="bg-white rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div class="font-medium text-gray-800 mb-1">${r.get('content')}</div>
                    <div class="text-sm text-gray-500">房间号：${r.get('room') || '-'}</div>
                    
                </div>
                <div class="text-xs text-gray-400 mt-2 sm:mt-0">${r.createdAt.toLocaleString()}</div>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<div class="text-red-400">报修列表加载失败</div>';
    }
}

// 打开/关闭模态窗
function openRepairModal() {
    document.getElementById('repairModal').classList.remove('hidden');
}
function closeRepairModal() {
    document.getElementById('repairModal').classList.add('hidden');
}

// 表单自动联想联系人
function setupContactAutocomplete() {
    const contactInput = document.getElementById('repairContact');
    if (!contactInput) return;
    contactInput.addEventListener('input', async function() {
        const val = contactInput.value.trim();
        if (!val) return;
        // 查询历史联系人
        const query = new AV.Query('EngineeringRepair');
        query.contains('contact', val);
        query.limit(5);
        const results = await query.find();
        if (results.length > 0) {
            contactInput.setAttribute('list', 'contact-list');
            let datalist = document.getElementById('contact-list');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'contact-list';
                contactInput.parentNode.appendChild(datalist);
            }
            datalist.innerHTML = results.map(r => `<option value="${r.get('contact')}">${r.get('contact')}（${r.get('phone')||''}）</option>`).join('');
        }
    });
}

// 提交报修表单
async function handleRepairFormSubmit(e) {
    e.preventDefault();
    const content = document.getElementById('repairContent').value.trim();
    const room = document.getElementById('repairRoom').value.trim();
    const contact = document.getElementById('repairContact').value.trim();
    const phone = document.getElementById('repairPhone').value.trim();
    if (!content || !room || !contact || !phone) return;
    try {
        const repair = new AV.Object('EngineeringRepair');
        repair.set('content', content);
        repair.set('room', room);
        repair.set('contact', contact);
        repair.set('phone', phone);
        await repair.save();
        
        // 发送企业微信机器人通知
        try {
            const webhookUrl = "https://www.junwei.bid:89/web/20/wecom-webhook-yafalou.php";
            const messageContent = `**研发楼报修通知**\n\n${content}\n\n**房间号**: ${room}\n**联系人**: ${contact}\n**电话**: ${phone}\n\n请及时处理！`;
             await fetch(webhookUrl, {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({ content: messageContent })
             });
        } catch (wechatError) {
            console.error('企业微信通知发送失败:', wechatError);
        }
        
        closeRepairModal();
        renderRepairList();
    } catch (e) {
        alert('报修提交失败');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderLatestAirConditionStatus();
    renderRepairList();
    document.getElementById('openRepairModalBtn').onclick = openRepairModal;
    document.getElementById('closeRepairModalBtn').onclick = closeRepairModal;
    document.getElementById('repairForm').onsubmit = handleRepairFormSubmit;
    setupContactAutocomplete();
});
document.addEventListener('DOMContentLoaded', renderLatestAirConditionStatus);

// ================== 二维码模态窗交互 ==================
/**
 * 初始化二维码模态窗的显示、关闭与下载功能
 */
function setupQRCodeModal() {
    const openBtn = document.getElementById('openQRCodeModalBtn');
    const modal = document.getElementById('qrCodeModal');
    const closeBtn = document.getElementById('closeQRCodeModalBtn');
    const downloadBtn = document.getElementById('downloadQRCodeBtn');
    const qrImg = modal ? modal.querySelector('img') : null;

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    // 点击模态窗外部关闭
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    // 下载二维码图片
    if (downloadBtn && qrImg) {
        downloadBtn.addEventListener('click', () => {
            const url = qrImg.src;
            const a = document.createElement('a');
            a.href = url;
            a.download = '研发楼工程联络群二维码.webp';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
}

// 页面加载后初始化二维码模态窗功能
window.addEventListener('DOMContentLoaded', () => {
    setupQRCodeModal();
});
