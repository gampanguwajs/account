const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxyaMCWO7OTNTl9ve9vkpmAcZ2v08yLvqQiBd10L4kxxFixh4NmIF5L3J1o2GpKFs9p/exec";
const S_CODES = ["S1","S2","S3","S4","S5","S6","S7","S8","S9","S10"];
const EX_CODES = ["REx1","REx2","REx3","REx4","REx5","REx6","REx7","CEx1","CEx2","CEx3","CEx4","CEx5","CEx6","PC"];
const CODE_INFO = {
    "S1":"ඒකාබද්ධ අරමුදල් සහ පළාත් සභා අරමුදල්", "S2":"සහයෝගිතා ගිවිසුම් යටතේ ක්‍රියාත්මක වන වැඩසටහන් හා ව්‍යාපෘති සඳහා ලැබෙන අරමුදල්", "S3":"රජයේ ආධාර", "S4":"පාසල් පාදක ඉගෙනුම් ප්‍රවර්ධන ප්‍රදානයන්, ගුණාත්මක යෙදවුම් හා උසස් මට්ටමේ ඉගෙනුම් ක්‍රියාවලි සඳහා ලැබෙන අරමුදල්", "S5":"රජය විසින් අනුමත හා ලියාපදිංචි රාජ්‍ය නොවන සංවිධාන වලින් ලැබෙන ආධාර", "S6":"පාසලේ දියුණුව වෙනුවෙන් ස්ව කැමැත්තෙන් දායකත්වය ලබා දෙන ඕනෑම පාර්ශවයක පරිත්‍යාග", "S7":"පාසලට අයත් වත්කම් වලින් උපයා ගන්නා ආදායම්", "S8":"පාසල් සංවර්ධන සමිති සාමාජික මුදල්", "S9":"පාසලේ ඉගෙනුම් ඉගැන්වීම් ක්‍රියාවලියට අදාළ අත්‍යවශ්‍ය ක්‍රියාකාරකම් සඳහා ලැබීම්", "S10":"පාසල් සංවර්ධන සමිතිය මඟින් තීරණය කරනු ලබන පාසලේ අත්‍යවශ්‍ය වියදම් පියවා ගැනීම සඳහා වන අරමුදල්",
    "REx1":"විෂය මාලා ක්‍රියාත්මක කිරීමට අදාළ පුනරාවර්තන වියදම්", "REx2":"උපදේශන, උසස් අධ්‍යාපන හා විෂය සමගාමී ක්‍රියාකාරකම්", "REx3":"අධ්‍යාපන පරිපාලන හා උපයෝගිතා සේවා හා සුභසාධන කටයුතු", "REx4":"කාර්ය මණ්ඩල පාරිශ්‍රමික", "REx5":"ප්‍රාග්ධන භාණ්ඩ හා උපකරණ නඩත්තු/අලුත්වැඩියා", "REx6":"පාසලේ ගොඩනැගිලි සුළු නඩත්තු/අලුත්වැඩියා", "REx7":"පවිත්‍රතා හා පිරිසිදු කිරීම්", 
    "CEx1":"මූලික පහසුකම් - නව සැපයීම්", "CEx2":"විෂය මාලා ක්‍රියාත්මක කිරීමට අදාළ ප්‍රාග්ධන වියදම්", "CEx3":"පුස්තකාල පොත් මිලට ගැනීම්", "CEx4":"ගොඩනැගිලි නව ඉදිකිරීම්, වැඩිදියුණු කිරීම් හා වෙනත් ප්‍රාග්ධන වියදම්", "CEx5":"ප්‍රාග්ධන උපකරණ මිලට ගැනීම්", "CEx6":"විශේෂ ව්‍යාපෘති සඳහා විශේෂ ප්‍රාග්ධන ආධාර",
    "PC":"සුළු මුදල් අග්‍රිමය (Petty Cash Imprest)"
};
const COLORS = ["#2e7d32", "#f9a825", "#388e3c", "#fbc02d", "#43a047", "#fdd835", "#4caf50", "#ffeb3b", "#66bb6a", "#ffee58"];
let currentReport = '';
let userRole = '';
let allocations = JSON.parse(sessionStorage.getItem('sch_allocations') || '{}');
let clearedStatus = JSON.parse(sessionStorage.getItem('sch_cleared') || '{}');
let initialized = false;
let isLoading = false;
let pettyExpenses = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
let periodExpenses = JSON.parse(sessionStorage.getItem('sch_period_expenses') || '[]');
let dbCache = null;
let projectsCache = null;
let allocationsCache = null;
let pettyExpensesCache = null;
let periodExpensesCache = null;
function updateOnlineStatus() {
    const statusDiv = document.getElementById('connection-status');
    if (navigator.onLine) {
        statusDiv.innerHTML = "🟢 ONLINE";
        statusDiv.className = "status-glow-online";
    } else {
        statusDiv.innerHTML = "🔴 OFFLINE";
        statusDiv.className = "status-glow-offline";
    }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
$(document).ready(function() {
    updateOnlineStatus();
    populateOptions();
    setTimeout(() => {
        initializeSelect2();
    }, 500);
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inDate').value = today;
    document.getElementById('exDate').value = today;
    document.getElementById('repFrom').value = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    document.getElementById('repTo').value = today;
    initResponsiveFeatures();
    handleResize();
    initPettyCashSection();
    setTimeout(() => {
        if (document.getElementById('sec-petty').style.display === 'block') {
            displaySavedPeriodSummaries();
        }
    }, 1000);
    addMultiRow();
    $('#allocTypeSelect').on('change', function() {
        updateAllocationCodeSelect();
    });
});
function updateAllocationCodeSelect() {
    const type = $('#allocTypeSelect').val();
    const select = $('#allocCodeSelect');
    let options = '<option value=""></option>';
    if (type === 'IN') {
        S_CODES.forEach(code => {
            options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 40)}...</option>`;
        });
    } else {
        EX_CODES.forEach(code => {
            options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 40)}...</option>`;
        });
    }
    select.html(options);
    select.trigger('change');
}
function loadPettyFloat() {
    const saved = localStorage.getItem('sch_petty_float');
    return saved ? parseFloat(saved) : 1500;
}
function savePettyFloat() {
    if (userRole !== 'ADMIN') {
        showToast("❌ අවසර නැත!");
        return;
    }
    const floatVal = parseAmount(document.getElementById('pettyFloat').value);
    if (floatVal <= 0) {
        showToast("⚠️ වලංගු මුදලක් ඇතුළත් කරන්න");
        return;
    }
    localStorage.setItem('sch_petty_float', floatVal);
    showToast("✅ ස්ථාවර මුදල සුරකින ලදී!");
    renderPettyBook();
}
function initPettyFloat() {
    const floatInput = document.getElementById('pettyFloat');
    if (floatInput) {
        floatInput.value = loadPettyFloat().toFixed(2);
    }
}
function renderPettyBook() {
    const db = getData();
    const pettyEx = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
    const container = document.getElementById('pettyCashBookBody');
    if (!container) return;
    const allTransactions = [];
    db.filter(t => t.code === 'PC' && (t.type === 'IN' || (t.type === 'EX' && t.desc.includes('ප්‍රතිපූරණය')))).forEach(entry => {
    allTransactions.push({
        id: entry.id,
        date: entry.date,
        vouch: entry.vouch || '',
        desc: entry.desc,
        amt: parseFloat(entry.amt) || 0,
        isReceipt: true,
        isReplenishment: entry.desc.includes('ප්‍රතිපූරණය') || false,
        category: entry.code,
        source: entry.source || '',
        isTransferred: false
    });
});
    pettyEx.forEach(entry => {
        allTransactions.push({
            id: entry.id,
            date: entry.date,
            vouch: entry.voucher || '',
            desc: entry.desc,
            amt: parseFloat(entry.amt) || 0,
            isReceipt: false,
            isReplenishment: false,
            category: entry.category,
            source: 'PC',
            isTransferred: entry.transferred === true
        });
    });
    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const replenishmentIndices = [];
    allTransactions.forEach((t, idx) => {
        if (t.isReplenishment) replenishmentIndices.push(idx);
    });
    let periods = [];
    let startIdx = 0;
    for (let repIdx of replenishmentIndices) {
        if (repIdx > startIdx) {
            periods.push({
                start: startIdx,
                end: repIdx - 1,
                openingBalance: 0,
                transactions: allTransactions.slice(startIdx, repIdx),
                hasReplenishment: false
            });
        }
        startIdx = repIdx;
    }
    if (startIdx < allTransactions.length) {
        periods.push({
            start: startIdx,
            end: allTransactions.length - 1,
            openingBalance: 0,
            transactions: allTransactions.slice(startIdx),
            hasReplenishment: false
        });
    }
    if (replenishmentIndices.length === 0 && allTransactions.length > 0) {
        periods = [{
            start: 0,
            end: allTransactions.length - 1,
            openingBalance: 0,
            transactions: allTransactions,
            hasReplenishment: false
        }];
    }
    let previousPeriodClosing = 0;
    let cumulativeTotals = { REx1: 0, REx5: 0, REx6: 0, REx7: 0, REx3: 0 };
    let tableBody = '';
    periods.forEach((period, periodIndex) => {
        const periodTransactions = period.transactions;
        const isFirstPeriod = (periodIndex === 0);
        let openingBalance;
        if (isFirstPeriod) {
            openingBalance = 0;
        } else {
            openingBalance = previousPeriodClosing;
        }
        let periodTotalReceipts = 0;
        let periodTotalExpenses = 0;
        let periodCategoryTotals = { REx1: 0, REx5: 0, REx6: 0, REx7: 0, REx3: 0 };
        periodTransactions.forEach(t => {
            if (t.isReceipt) {
                periodTotalReceipts += t.amt;
            } else {
                periodTotalExpenses += t.amt;
                if (!t.isTransferred && periodCategoryTotals.hasOwnProperty(t.category)) {
                    periodCategoryTotals[t.category] += t.amt;
                }
            }
        });
        if (!isFirstPeriod) {
            // Do nothing
        } else {
            const firstReceipt = periodTransactions.find(t => t.isReceipt && !t.isReplenishment);
            if (firstReceipt) {
                tableBody += `<tr style="background: #e3f2fd; font-weight: bold;">
                    <td style="padding: 8px; border: 1px solid #000; text-align: right;"></td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: center;"></td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: center;">${firstReceipt.date}</td>
                    <td style="padding: 8px; border: 1px solid #000;">ආරම්භක අග්‍රිමය (Opening Imprest)</td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: right;">${firstReceipt.amt.toFixed(2)}</td>
                    <td colspan="5" style="border: 1px solid #000;"></td>
                </tr>`;
            }
        }
        periodTransactions.forEach(t => {
            const rex1Amt = (t.category === 'REx1' && !t.isReceipt) ? t.amt.toFixed(2) : '';
            const rex5Amt = (t.category === 'REx5' && !t.isReceipt) ? t.amt.toFixed(2) : '';
            const rex6Amt = (t.category === 'REx6' && !t.isReceipt) ? t.amt.toFixed(2) : '';
            const rex7Amt = (t.category === 'REx7' && !t.isReceipt) ? t.amt.toFixed(2) : '';
            const rex3Amt = (t.category === 'REx3' && !t.isReceipt) ? t.amt.toFixed(2) : '';
            const receiptAmt = t.isReceipt ? t.amt.toFixed(2) : '';
            const paymentAmt = !t.isReceipt ? t.amt.toFixed(2) : '';
            let rowStyle = '';
            let transferredBadge = '';
            if (t.isTransferred) {
                rowStyle = 'style="background-color: #e8f4fd; border-left: 5px solid #2980b9;"';
                transferredBadge = ' <span style="background: #2980b9; color: white; font-size: 9px; padding: 2px 6px; border-radius: 12px; margin-left: 8px; display: inline-block; font-weight: normal;">✓ Period</span>';
            } else if (t.isReplenishment) {
                rowStyle = 'style="background-color: #fff9c4;"';
            }
            let actionButtons = '';
            if (!t.isReceipt) {
                if (userRole === 'ADMIN' || userRole === 'STAFF') {
                    actionButtons += `<button class="petty-edit-btn" onclick="editPettyExpense(${t.id})" style="background:none; border:none; color:#2980b9; cursor:pointer; margin-left:5px;" title="Edit"><i class="fas fa-edit"></i></button>`;
                }
                if (userRole === 'ADMIN') {
                    actionButtons += `<button class="petty-delete-btn" onclick="deletePettyExpense(${t.id})" style="background:none; border:none; color:#c0392b; cursor:pointer; margin-left:5px;" title="Delete"><i class="fas fa-trash"></i></button>`;
                }
            }
            tableBody += `<tr ${rowStyle}>
                <td style="padding: 8px; border: 1px solid #000; text-align: right;">${receiptAmt}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${t.vouch}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${t.date}</td>
                <td style="padding: 8px; border: 1px solid #000;">${t.desc}${transferredBadge} ${actionButtons}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right;">${paymentAmt}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right;">${rex1Amt}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right;">${rex5Amt}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right;">${rex6Amt}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right;">${rex7Amt}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right;">${rex3Amt}</td>
            </tr>`;
        });
        tableBody += `<tr style="font-weight: bold; background: #eee;">
            <td colspan="4" style="text-align: right; border: 1px solid #000; padding: 8px;">මුළු වියදම (Total Expenses) - මෙම කාලපරිච්ඡේදය</td>
            <td style="border: 1px solid #000; text-align: right; padding: 8px;">${periodTotalExpenses.toFixed(2)}</td>
            <td style="border: 1px solid #000; text-align: right;">${periodCategoryTotals.REx1.toFixed(2)}</td>
            <td style="border: 1px solid #000; text-align: right;">${periodCategoryTotals.REx5.toFixed(2)}</td>
            <td style="border: 1px solid #000; text-align: right;">${periodCategoryTotals.REx6.toFixed(2)}</td>
            <td style="border: 1px solid #000; text-align: right;">${periodCategoryTotals.REx7.toFixed(2)}</td>
            <td style="border: 1px solid #000; text-align: right;">${periodCategoryTotals.REx3.toFixed(2)}</td>
        </tr>`;
        if (periodTotalReceipts > 0) {
            tableBody += `<tr style="font-weight: bold; background: #e8f5e9;">
                <td colspan="4" style="text-align: right; border: 1px solid #000; padding: 8px;">මුළු ලැබීම් (Total Receipts) - මෙම කාලපරිච්ඡේදය</td>
                <td style="border: 1px solid #000; text-align: right; padding: 8px;"></td>
                <td colspan="5" style="border: 1px solid #000; text-align: right;">${periodTotalReceipts.toFixed(2)}</td>
            </tr>`;
        }
        const closingBalance = openingBalance + periodTotalReceipts - periodTotalExpenses;
        tableBody += `<tr style="background-color: #ecf0f1; font-weight: bold; border-bottom: 3px double #000;">
            <td colspan="4" style="text-align: right; border: 1px solid #000;">ශේෂය ප/ගෙ (Balance c/d)</td>
            <td style="text-align: right; border: 1px solid #000;">${closingBalance.toFixed(2)}</td>
            <td colspan="5" style="border: 1px solid #000; background-color: #bdc3c7;"></td>
        </tr>`;
        if (periodIndex < periods.length - 1) {
            const nextPeriodFirstTx = periods[periodIndex + 1].transactions[0];
            const nextDate = nextPeriodFirstTx ? nextPeriodFirstTx.date : '';
            const [nextYear, nextMonth] = nextDate.split('-');
            const nextMonthName = getMonthName(nextMonth);
            tableBody += `<tr style="height: 10px; background-color: #1b5e20;">
                <td colspan="10" style="border: none;"></td>
            </tr>`;
            tableBody += `<tr style="font-weight: bold; background-color: #fff9c4;">
                <td style="text-align: right; border: 1px solid #000;">${closingBalance.toFixed(2)}</td>
                <td style="border: 1px solid #000;"></td>
                <td style="text-align: center; border: 1px solid #000;">${nextDate}</td>
                <td style="border: 1px solid #000;">ශේෂය ඉ/ගෙ (Balance b/f) - ${nextMonthName} ${nextYear}</td>
                <td colspan="6" style="border: 1px solid #000;"></td>
            </tr>`;
        }
        cumulativeTotals.REx1 += periodCategoryTotals.REx1;
        cumulativeTotals.REx5 += periodCategoryTotals.REx5;
        cumulativeTotals.REx6 += periodCategoryTotals.REx6;
        cumulativeTotals.REx7 += periodCategoryTotals.REx7;
        cumulativeTotals.REx3 += periodCategoryTotals.REx3;
        previousPeriodClosing = closingBalance;
    });
    container.innerHTML = tableBody;
    updateCategoryTotalsDisplay(cumulativeTotals);
    document.getElementById('manualREx1').value = cumulativeTotals.REx1.toFixed(2);
    document.getElementById('manualREx5').value = cumulativeTotals.REx5.toFixed(2);
    document.getElementById('manualREx6').value = cumulativeTotals.REx6.toFixed(2);
    document.getElementById('manualREx7').value = cumulativeTotals.REx7.toFixed(2);
    document.getElementById('manualREx3').value = cumulativeTotals.REx3.toFixed(2);
    updatePeriodTotal();
    const totalReceipts = allTransactions.filter(t => t.isReceipt).reduce((sum, t) => sum + t.amt, 0);
    const totalExpenses = allTransactions.filter(t => !t.isReceipt).reduce((sum, t) => sum + t.amt, 0);
    document.getElementById('pettyFloatDisplay').innerText = loadPettyFloat().toFixed(2);
    document.getElementById('pettyTotalReceipts').innerText = totalReceipts.toFixed(2);
    document.getElementById('pettyTotalExpenses').innerText = totalExpenses.toFixed(2);
    document.getElementById('pettyCashInHand').innerText = (totalReceipts - totalExpenses).toFixed(2);
}
function getMonthName(monthNum) {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthNames = ['ජන', 'පෙබ', 'මාර්', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්', 'නොවැ', 'දෙසැ'];
    const index = months.indexOf(monthNum.padStart(2, '0'));
    return monthNames[index] || monthNum;
}
function updateCategoryTotalsDisplay(totals) {
    const container = document.getElementById('periodCategoryTotals');
    if (!container) return;
    container.innerHTML = `
        <div style="background: #e8f5e9; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 12px; color: #1b5e20;">REx1</div>
            <div style="font-size: 16px; font-weight: bold;">රු. ${totals.REx1.toFixed(2)}</div>
        </div>
        <div style="background: #e3f2fd; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 12px; color: #01579b;">REx5</div>
            <div style="font-size: 16px; font-weight: bold;">රු. ${totals.REx5.toFixed(2)}</div>
        </div>
        <div style="background: #fff3e0; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 12px; color: #e65100;">REx6</div>
            <div style="font-size: 16px; font-weight: bold;">රු. ${totals.REx6.toFixed(2)}</div>
        </div>
        <div style="background: #fce4ec; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 12px; color: #880e4f;">REx7</div>
            <div style="font-size: 16px; font-weight: bold;">රු. ${totals.REx7.toFixed(2)}</div>
        </div>
        <div style="background: #f3e5f5; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 12px; color: #4a148c;">REx3</div>
            <div style="font-size: 16px; font-weight: bold;">රු. ${totals.REx3.toFixed(2)}</div>
        </div>
    `;
}
function printPettyCashBook() {
    const printContent = document.getElementById('pettyCashBookTable').cloneNode(true);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>සුළු මුදල් පොත</title>
            <style>
                body { font-family: 'Noto Sans Sinhala', sans-serif; padding: 20px; }
                h1 { color: #1b5e20; text-align: center; }
                h2 { color: #2e7d32; text-align: center; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #1b5e20; color: #ffeb3b; padding: 8px; border: 1px solid #333; }
                td { padding: 6px; border: 1px solid #333; }
                .footer { margin-top: 30px; text-align: right; }
                .school-name { text-align: center; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="school-name">
                <h1>මො/ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
                <h2>සුළු මුදල් පොත</h2>
                <p>මුද්‍රණය: ${new Date().toLocaleDateString('si-LK')}</p>
            </div>
            ${printContent.outerHTML}
            <div class="footer">
                <p>....................................</p>
                <p><b>භාණ්ඩාගාරික</b></p>
                <p style="margin-top: 20px;">....................................</p>
                <p><b>විදුහල්පති</b></p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}
async function exportPettyCashToPDF() {
    if (userRole === 'GUEST') {
        showToast("❌ PDF බාගත කිරීමට අවසර නැත!");
        return;
    }
    toggleLoading(true);
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const element = document.getElementById('pettyCashBookTable');
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`සුළු_මුදල්_පොත_${new Date().toISOString().slice(0,10)}.pdf`);
        
        showToast("✅ PDF බාගත කරන ලදී!");
    } catch (error) {
        console.error("PDF export error:", error);
        showToast("❌ PDF ජනනය කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}
function initPettyCashSection() {
    const today = new Date().toISOString().split('T')[0];
    const pettyDate = document.getElementById('pettyDate');
    if (pettyDate) pettyDate.value = today;
    const float = loadPettyFloat();
    const pettyFloat = document.getElementById('pettyFloat');
    if (pettyFloat) pettyFloat.value = float.toFixed(2);
    
    const sCodeOptions = S_CODES.map(c => `<option value="${c}">${c} - ${CODE_INFO[c]}</option>`).join('');
    const replenishSource = document.getElementById('replenishSourceSelect');
    if (replenishSource) replenishSource.innerHTML = '<option value=""></option>' + sCodeOptions;
    
    if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
        $('#replenishSourceSelect, #pettyCategorySelect').select2({
            placeholder: "තෝරන්න...",
            allowClear: true,
            width: '100%'
        });
    }
}

// ============ Petty Cash Functions ============
// Edit petty expense
function editPettyExpense(id) {
    const expense = pettyExpenses.find(e => e.id == id);
    if (!expense) {
        showToast("⚠️ වියදම සොයාගත නොහැක!");
        return;
    }
    document.getElementById('pettyDate').value = expense.date;
    document.getElementById('pettyDesc').value = expense.desc;
    $('#pettyCategorySelect').val(expense.category).trigger('change');
    document.getElementById('pettyVoucher').value = expense.voucher;
    document.getElementById('pettyAmt').value = expense.amt.toFixed(2);
    document.getElementById('edit-petty-id').value = expense.id;
    document.getElementById('btn-save-petty').innerText = "යාවත්කාලීන කරන්න";
    // Scroll to form
    document.getElementById('petty-expense-form').scrollIntoView({ behavior: 'smooth' });
}

async function savePettyExpense() {
    if(userRole === 'GUEST') {
        showToast("❌ සුළු මුදල් වියදම් ඇතුළත් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    const date = document.getElementById('pettyDate').value;
    const desc = document.getElementById('pettyDesc').value.trim();
    const category = $('#pettyCategorySelect').val();
    const voucher = document.getElementById('pettyVoucher').value.trim();
    const amt = parseAmount(document.getElementById('pettyAmt').value);
    const editId = document.getElementById('edit-petty-id')?.value;
    const isEdit = editId && editId !== '';
    
    if(!date) {
        showToast("⚠️ කරුණාකර දිනය ඇතුළත් කරන්න");
        document.getElementById('pettyDate').focus();
        return;
    }
    if(!desc) {
        showToast("⚠️ කරුණාකර විස්තරය ඇතුළත් කරන්න");
        document.getElementById('pettyDesc').focus();
        return;
    }
    if(!category) {
        showToast("⚠️ කරුණාකර කාණ්ඩය තෝරන්න");
        $('#pettyCategorySelect').select2('open');
        return;
    }
    if(!voucher) {
        showToast("⚠️ කරුණාකර වවුචර් අංකය ඇතුළත් කරන්න");
        document.getElementById('pettyVoucher').focus();
        return;
    }
    if(amt <= 0) {
        showToast("⚠️ කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න");
        document.getElementById('pettyAmt').focus();
        return;
    }
    
    const id = isEdit ? parseInt(editId) : (Date.now() + Math.floor(Math.random() * 1000));
    const data = {
        action: isEdit ? 'update_petty_expense' : 'save_petty_expense',
        id: id,
        date: date,
        desc: desc,
        category: category,
        voucher: voucher,
        amt: amt
    };
    
    toggleLoading(true);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if(result.status === 'success') {
            if (isEdit) {
                const index = pettyExpenses.findIndex(e => e.id == id);
                if (index !== -1) pettyExpenses[index] = data;
            } else {
                pettyExpenses.push(data);
            }
            sessionStorage.setItem('sch_petty_expenses', JSON.stringify(pettyExpenses));
            
            showToast(isEdit ? "✅ වියදම යාවත්කාලීන කරන ලදී!" : "✅ සුළු මුදල් වියදම එකතු කරන ලදී!");
            
            document.getElementById('pettyDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('pettyDesc').value = '';
            $('#pettyCategorySelect').val('').trigger('change');
            document.getElementById('pettyVoucher').value = '';
            document.getElementById('pettyAmt').value = '';
            document.getElementById('edit-petty-id').value = '';
            document.getElementById('btn-save-petty').innerText = "එකතු කරන්න";
            
            renderPettyBook();
        } else {
            throw new Error(result.message || 'Save failed');
        }
    } catch (error) {
        console.error("Save petty expense error:", error);
        if(navigator.onLine) {
            showToast("❌ සුරැකීමේ දෝෂයක්!");
        } else {
            if (isEdit) {
                // For offline, we can't easily update, but we can push a new record with offline flag?
                // Simpler: just show error
                showToast("❌ Offline මාදිලියේ සංස්කරණය කළ නොහැක.");
            } else {
                pettyExpenses.push({...data, offline: true});
                sessionStorage.setItem('sch_petty_expenses', JSON.stringify(pettyExpenses));
                showToast("⚠️ Offline මාදිලියේ සුරකින ලදී.");
            }
        }
    } finally {
        toggleLoading(false);
        renderPettyBook();
    }
}

async function deletePettyExpense(id) {
    if(userRole !== 'ADMIN') {
        showToast("❌ මකා දැමීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const confirm = await showConfirmDialog(
        "🗑️ සුළු මුදල් වියදම මකන්න",
        "මෙම වියදම ස්ථිරවම මකා දමන්නද?",
        "ඔව්, මකන්න",
        "අවලංගු කරන්න"
    );
	// ============ Dropdown Toggle Function ============

    
    if(!confirm) return;
    
    toggleLoading(true);
    
    try {
        const response = await fetch(SCRIPT_URL + "?action=delete_petty_expense&id=" + id + "&t=" + Date.now());
        const result = await response.json();
        
        if(result.status === 'success') {
            pettyExpenses = pettyExpenses.filter(e => e.id != id);
            sessionStorage.setItem('sch_petty_expenses', JSON.stringify(pettyExpenses));
            showToast("✅ වියදම මකා දමන ලදී!");
            renderPettyBook();
        } else {
            throw new Error(result.message || 'Delete failed');
        }
    } catch (error) {
        console.error("Delete petty expense error:", error);
        showToast("❌ මකා දැමීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function replenishPettyCash() {
    if(userRole !== 'ADMIN') {
        showToast("❌ ප්‍රතිපූරණය කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const source = $('#replenishSourceSelect').val();
    if(!source) {
        showToast("⚠️ කරුණාකර මූලාශ්‍ර අරමුදල තෝරන්න");
        $('#replenishSourceSelect').select2('open');
        return;
    }
    
    const voucher = document.getElementById('replenishVoucher').value.trim();
    if(!voucher) {
        showToast("⚠️ කරුණාකර වවුචර් අංකය ඇතුළත් කරන්න");
        document.getElementById('replenishVoucher').focus();
        return;
    }
    
    const chequeNo = document.getElementById('replenishCheque').value.trim();
    
    // ස්ථාවර මුදල (Float) - මෙය පරිශීලකයා විසින් ඇතුළත් කරන ලද අගය භාවිතා කරමු.
    const float = parseAmount(document.getElementById('pettyFloat').value);
    if (float <= 0) {
        showToast("⚠️ කරුණාකර වලංගු ස්ථාවර මුදලක් ඇතුළත් කරන්න");
        document.getElementById('pettyFloat').focus();
        return;
    }
    
    // ============ Google Sheets දත්ත පමණක් භාවිතා කර ගණනය කිරීම ============
    const db = getData();
    const pettyEx = pettyExpenses;
    
    // මෙතෙක් ලැබුණු මුළු ප්‍රතිපූරණ
    const totalReplenishmentsEver = db
        .filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය'))
        .reduce((sum, t) => sum + t.amt, 0);
    
    // මෙතෙක් වියදම් කළ මුළු මුදල
    const totalExpensesEver = pettyEx.reduce((sum, e) => sum + e.amt, 0);
    
    const currentBalance = totalReplenishmentsEver - totalExpensesEver;
    
    // ප්‍රතිපූරණය කළ යුතු මුදල
    const replenishAmount = float - currentBalance;
    
    if(replenishAmount <= 0) {
        showToast(`⚠️ ප්‍රතිපූරණය කිරීමට අවශ්‍ය මුදලක් නැත. (වත්මන් ශේෂය: රු. ${currentBalance.toFixed(2)})`);
        return;
    }
    
    const confirmMessage = 
        `ස්ථාවර මුදල: රු. ${float.toFixed(2)}\n` +
        `මෙතෙක් ලැබුණු මුළු ප්‍රතිපූරණ: රු. ${totalReplenishmentsEver.toFixed(2)}\n` +
        `මෙතෙක් වියදම් කළ මුළු මුදල: රු. ${totalExpensesEver.toFixed(2)}\n` +
        `වත්මන් ශේෂය: රු. ${currentBalance.toFixed(2)}\n\n` +
        `ප්‍රතිපූරණය කළ යුතු මුදල: රු. ${replenishAmount.toFixed(2)}\n\n` +
        `මෙම මුදල නව ප්‍රතිපූරණ ගනුදෙනුවක් ලෙස එකතු කරන්නද?`;
    
    const confirm = await showConfirmDialog(
        "💰 සුළු මුදල් ප්‍රතිපූරණය",
        confirmMessage,
        "ඔව්, ප්‍රතිපූරණය කරන්න",
        "අවලංගු කරන්න"
    );
    
    if(!confirm) return;
    
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    
    const data = {
        action: 'save_transaction',
        id: Date.now(),
        date: currentDate,
        ref: chequeNo,
        vouch: voucher,
        code: 'PC',
        amt: replenishAmount,
        desc: `සුළු මුදල් ප්‍රතිපූරණය (${source}) - ${currentDate}`,
        type: 'EX',
        source: source,
        proj: '',
        status: true,
        isOp: false,
        isImprest: false
    };
    
    toggleLoading(true);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if(result.status === 'success') {
            let db = getData();
            db.push(data);
            setDataCache(db);
            
            showToast(`✅ ප්‍රතිපූරණය සාර්ථකයි! 
                ප්‍රතිපූරණ මුදල: රු. ${replenishAmount.toFixed(2)}
                අලුත් ශේෂය: රු. ${float.toFixed(2)}`);
            
            document.getElementById('replenishVoucher').value = '';
            document.getElementById('replenishCheque').value = '';
            $('#replenishSourceSelect').val('').trigger('change');
            
            renderPettyBook();
            refreshDashboard();
        } else {
            throw new Error(result.message || 'Save failed');
        }
    } catch (error) {
        console.error("Replenishment error:", error);
        if(navigator.onLine) {
            showToast("❌ ප්‍රතිපූරණය අසාර්ථකයි!");
        } else {
            let db = getData();
            db.push({...data, offline: true});
            sessionStorage.setItem('sch_db', JSON.stringify(db));
            showToast("⚠️ Offline මාදිලියේ ප්‍රතිපූරණය සුරකින ලදී.");
        }
    } finally {
        toggleLoading(false);
    }
}

// ============ Period Report Functions ============
function getReplenishmentPeriods() {
    const db = getData();
    const replenishments = db.filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය'))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    let periods = [];
    for (let i = 0; i < replenishments.length; i++) {
        const startDate = replenishments[i].date;
        const endDate = (i < replenishments.length - 1) ? replenishments[i+1].date : new Date().toISOString().split('T')[0];
        periods.push({
            label: `${startDate} සිට ${endDate} දක්වා`,
            start: startDate,
            end: endDate
        });
    }
    return periods;
}

function populatePeriodDropdown() {
    const periods = getReplenishmentPeriods();
    const select = document.getElementById('periodReportSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- තෝරන්න --</option>';
    periods.forEach(p => {
        const option = document.createElement('option');
        option.value = p.label;
        option.setAttribute('data-start', p.start);
        option.setAttribute('data-end', p.end);
        option.textContent = p.label;
        select.appendChild(option);
    });
}

function generatePeriodReport() {
    const select = document.getElementById('periodReportSelect');
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption.value) {
        showToast("⚠️ කරුණාකර කාලපරිච්ඡේදයක් තෝරන්න");
        return;
    }
    const startDate = selectedOption.getAttribute('data-start');
    const endDate = selectedOption.getAttribute('data-end');
    
    const db = getData();
    const pettyEx = pettyExpenses;
    
    // විවෘත ශේෂය (startDate ට පෙර ලැබීම් - වියදම්)
    const receiptsBefore = db.filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය') && t.date < startDate)
                             .reduce((sum, t) => sum + t.amt, 0);
    const expensesBefore = pettyEx.filter(e => e.date < startDate).reduce((sum, e) => sum + e.amt, 0);
    const openingBalance = receiptsBefore - expensesBefore;
    
    // මෙම කාලයේ ලැබීම්
    const periodReceipts = db.filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය') && t.date >= startDate && t.date <= endDate);
    const totalReceipts = periodReceipts.reduce((sum, t) => sum + t.amt, 0);
    
    // මෙම කාලයේ වියදම්
    const periodExpenses = pettyEx.filter(e => e.date >= startDate && e.date <= endDate);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amt, 0);
    
    const closingBalance = openingBalance + totalReceipts - totalExpenses;
    
    // වාර්තාව සැකසීම
    let html = `
        <div style="padding: 10px;">
            <h4 style="color: var(--primary);">කාලපරිච්ඡේද වාර්තාව: ${startDate} සිට ${endDate} දක්වා</h4>
            <div style="display: grid; grid-template-columns: repeat(4,1fr); gap:10px; margin-bottom:20px;">
                <div style="background:#e8f5e9; padding:10px; border-radius:8px; text-align:center;">
                    <div>විවෘත ශේෂය</div>
                    <div style="font-size:20px; font-weight:bold;">රු. ${openingBalance.toFixed(2)}</div>
                </div>
                <div style="background:#e3f2fd; padding:10px; border-radius:8px; text-align:center;">
                    <div>මෙම කාලයේ ලැබීම්</div>
                    <div style="font-size:20px; font-weight:bold;">රු. ${totalReceipts.toFixed(2)}</div>
                </div>
                <div style="background:#fff3e0; padding:10px; border-radius:8px; text-align:center;">
                    <div>මෙම කාලයේ වියදම්</div>
                    <div style="font-size:20px; font-weight:bold;">රු. ${totalExpenses.toFixed(2)}</div>
                </div>
                <div style="background:#f3e5f5; padding:10px; border-radius:8px; text-align:center;">
                    <div>අවසන් ශේෂය</div>
                    <div style="font-size:20px; font-weight:bold;">රු. ${closingBalance.toFixed(2)}</div>
                </div>
            </div>
            <h5>ගනුදෙනු විස්තර</h5>
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:var(--primary); color:white;">
                        <th>දිනය</th>
                        <th>විස්තරය</th>
                        <th>වවුචර්</th>
                        <th>කාණ්ඩය</th>
                        <th>ලැබීම් (රු.)</th>
                        <th>ගෙවීම් (රු.)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // ගනුදෙනු එකතු කර දින අනුව පෙළගැස්වීම
    const allTransactions = [
        ...periodReceipts.map(t => ({...t, isReceipt: true, categoryDisplay: 'ප්‍රතිපූරණය', voucherDisplay: t.vouch})),
        ...periodExpenses.map(e => ({...e, isReceipt: false, categoryDisplay: e.category, voucherDisplay: e.voucher}))
    ].sort((a,b) => new Date(a.date) - new Date(b.date));
    
    allTransactions.forEach(t => {
        html += `<tr>
            <td>${t.date}</td>
            <td>${t.desc}</td>
            <td>${t.voucherDisplay || '-'}</td>
            <td>${t.isReceipt ? 'PC' : t.categoryDisplay}</td>
            <td style="text-align:right;">${t.isReceipt ? t.amt.toFixed(2) : '-'}</td>
            <td style="text-align:right;">${!t.isReceipt ? t.amt.toFixed(2) : '-'}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    document.getElementById('periodReportContent').innerHTML = html;
    document.getElementById('periodReportModal').style.display = 'flex';
}

function printPeriodReport() {
    const content = document.getElementById('periodReportContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>කාලපරිච්ඡේද වාර්තාව</title>
            <style>
                body { font-family: 'Noto Sans Sinhala', sans-serif; padding: 20px; }
                h1 { color: #1b5e20; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #1b5e20; color: #ffeb3b; padding: 10px; }
                td { padding: 8px; border: 1px solid #ddd; }
                .footer { margin-top: 30px; text-align: right; }
            </style>
        </head>
        <body>
            <h1>මො/ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
            <h2>කාලපරිච්ඡේද වාර්තාව</h2>
            ${content}
            <div class="footer">
                <p>....................................</p>
                <p><b>භාණ්ඩාගාරික</b></p>
                <p style="margin-top:20px;">....................................</p>
                <p><b>විදුහල්පති</b></p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

async function exportPeriodReportPDF() {
    if (userRole === 'GUEST') {
        showToast("❌ PDF බාගත කිරීමට අවසර නැත!");
        return;
    }
    
    const content = document.getElementById('periodReportContent');
    if (!content.innerHTML.trim()) {
        showToast("⚠️ මුලින් වාර්තාවක් ජනනය කරන්න");
        return;
    }
    
    toggleLoading(true);
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const canvas = await html2canvas(content, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`කාලපරිච්ඡේද_වාර්තාව_${new Date().toISOString().slice(0,10)}.pdf`);
        
        showToast("✅ PDF බාගත කරන ලදී!");
    } catch (error) {
        console.error("PDF export error:", error);
        showToast("❌ PDF ජනනය කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

// ============ ලදුපත් අංක සම්බන්ධ ශ්‍රිතයන් ============
function formatReceiptRange(fromRef, toRef) {
    fromRef = fromRef.trim();
    fromRef = fromRef.replace(/[^0-9]/g, '');
    const paddedFrom = fromRef.padStart(3, '0');
    
    if (!toRef || toRef.trim() === '') {
        return paddedFrom;
    }
    
    toRef = toRef.trim().replace(/[^0-9]/g, '');
    if (toRef === '') {
        return paddedFrom;
    }
    
    const paddedTo = toRef.padStart(3, '0');
    
    if (paddedFrom === paddedTo) {
        return paddedFrom;
    } else {
        return paddedFrom + " සිට " + paddedTo + " දක්වා";
    }
}

function parseReceiptRange(refValue) {
    let fromRef = '';
    let toRef = '';
    
    if (!refValue) return { fromRef: '', toRef: '' };
    
    if (refValue.includes(' සිට ') && refValue.includes(' දක්වා')) {
        const parts = refValue.split(' සිට ');
        fromRef = parts[0];
        toRef = parts[1] ? parts[1].split(' දක්වා')[0] : '';
    } else {
        fromRef = refValue;
        toRef = '';
    }
    
    return { fromRef, toRef };
}

function checkDuplicateReceipt(fromRef, toRef, excludeId = null) {
    const db = getData();
    const newFrom = parseInt(fromRef) || 0;
    
    let newTo = newFrom;
    if (toRef && toRef.trim() !== '') {
        newTo = parseInt(toRef) || 0;
    }
    
    if (toRef && toRef.trim() !== '' && newFrom > newTo) {
        return {
            isDuplicate: true,
            message: "⚠️ 'දක්වා' අංකය 'සිට' අංකයට වඩා විශාල විය යුතුය!"
        };
    }
    
    const incomeTransactions = db.filter(r => 
        r.type === 'IN' && 
        !r.isOp && 
        (excludeId === null || r.id !== excludeId)
    );
    
    for (let trans of incomeTransactions) {
        const transRef = trans.ref || '';
        let transFrom = 0, transTo = 0;
        
        if (transRef.includes(' සිට ') && transRef.includes(' දක්වා')) {
            const parts = transRef.split(' සිට ');
            transFrom = parseInt(parts[0]) || 0;
            transTo = parseInt(parts[1]?.split(' දක්වා')[0]) || 0;
        } else {
            transFrom = parseInt(transRef) || 0;
            transTo = transFrom;
        }
        
        if ((newFrom >= transFrom && newFrom <= transTo) ||
            (newTo >= transFrom && newTo <= transTo) ||
            (newFrom <= transFrom && newTo >= transTo)) {
            
            let duplicateInfo = `${transFrom.toString().padStart(3, '0')}`;
            if (transFrom !== transTo) {
                duplicateInfo += ` සිට ${transTo.toString().padStart(3, '0')} දක්වා`;
            }
            
            let newRangeInfo = `${newFrom.toString().padStart(3, '0')}`;
            if (newFrom !== newTo) {
                newRangeInfo += ` සිට ${newTo.toString().padStart(3, '0')} දක්වා`;
            }
            
            return {
                isDuplicate: true,
                message: `⚠️ ලදුපත් අංකය (${newRangeInfo}) දැනටමත් භාවිතා කර ඇත!\nපවතින ගනුදෙනුව: ${duplicateInfo}`,
                existingTransaction: trans
            };
        }
    }
    
    return { isDuplicate: false };
}

// ============ Transaction Search Functions ============
function searchTransactions(event) {
    if (event && event.key === 'Enter') {
        event.preventDefault();
    }
    
    const searchTerm = document.getElementById('transactionSearchInput')?.value?.trim() || '';
    const typeFilter = document.getElementById('transactionTypeFilter')?.value || 'ALL';
    const dateFilter = document.getElementById('transactionDateFilter')?.value || 'ALL';
    const inCodeFilter = document.getElementById('searchInCode')?.value || '';
    const exCodeFilter = document.getElementById('searchExCode')?.value || '';
    const sourceFilter = document.getElementById('searchSource')?.value || '';
    const minAmount = parseAmount(document.getElementById('searchMinAmount')?.value || '0');
    const maxAmount = parseAmount(document.getElementById('searchMaxAmount')?.value || '0');
    const projectFilter = document.getElementById('searchProject')?.value || '';
    
    const db = getData();
    let results = [...db];
    
    if (typeFilter !== 'ALL') {
        results = results.filter(r => r.type === typeFilter);
    }
    
    if (inCodeFilter) {
        results = results.filter(r => r.code === inCodeFilter || r.source === inCodeFilter);
    }
    if (exCodeFilter) {
        results = results.filter(r => r.code === exCodeFilter);
    }
    if (sourceFilter) {
        results = results.filter(r => r.source === sourceFilter);
    }
    
    if (projectFilter) {
        results = results.filter(r => r.proj === projectFilter);
    }
    
    if (minAmount > 0) {
        results = results.filter(r => r.amt >= minAmount);
    }
    if (maxAmount > 0) {
        results = results.filter(r => r.amt <= maxAmount);
    }
    
    if (dateFilter !== 'ALL') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        
        results = results.filter(r => {
            const transDate = new Date(r.date);
            transDate.setHours(0, 0, 0, 0);
            
            switch(dateFilter) {
                case 'TODAY': return transDate.getTime() === today.getTime();
                case 'YESTERDAY': return transDate.getTime() === yesterday.getTime();
                case 'THIS_WEEK': return transDate >= thisWeekStart;
                case 'THIS_MONTH': return transDate >= thisMonthStart;
                case 'LAST_MONTH': return transDate >= lastMonthStart && transDate <= lastMonthEnd;
                case 'THIS_YEAR': return transDate >= thisYearStart;
                default: return true;
            }
        });
    }
    
    if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        results = results.filter(r => {
            if (r.amt.toString() === termLower || 
                r.amt.toFixed(2).toString() === termLower ||
                r.amt.toLocaleString('en-US', {minimumFractionDigits: 2}).includes(termLower)) {
                return true;
            }
            
            if (r.ref && r.ref.toLowerCase().includes(termLower)) {
                return true;
            }
            
            if (r.vouch && r.vouch.toLowerCase().includes(termLower)) {
                return true;
            }
            
            if (r.type === 'EX' && r.ref && r.ref.toLowerCase().includes(termLower)) {
                return true;
            }
            
            if (r.code && r.code.toLowerCase().includes(termLower)) {
                return true;
            }
            
            if (r.source && r.source.toLowerCase().includes(termLower)) {
                return true;
            }
            
            if (r.desc && r.desc.toLowerCase().includes(termLower)) {
                return true;
            }
            
            if (r.id && r.id.toString().includes(termLower)) {
                return true;
            }
            
            return false;
        });
    }
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('transactionSearchResults');
    const resultsTable = document.getElementById('transactionSearchResultsTable');
    const resultCount = document.getElementById('searchResultCount');
    
    if (results.length === 0) {
        resultsTable.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                <h4 style="color: #666; margin-bottom: 10px;">ගනුදෙනු කිසිවක් හමු නොවීය</h4>
                <p style="color: #999; font-size: 13px;">කරුණාකර වෙනත් සෙවුම් පදයක් උත්සාහ කරන්න</p>
            </div>
        `;
        resultCount.textContent = 'ගනුදෙනු 0ක්';
        resultsContainer.style.display = 'block';
        return;
    }
    
    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = `
        <table class="transaction-search-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: var(--deep-blue); color: white;">
                    <th style="padding: 12px;">දිනය</th>
                    <th style="padding: 12px;">වර්ගය</th>
                    <th style="padding: 12px;">කේතය</th>
                    <th style="padding: 12px;">මූලාශ්‍රය</th>
                    <th style="padding: 12px;">ලදුපත්/වවුචර්</th>
                    <th style="padding: 12px;">චෙක්පත් අංකය</th>
                    <th style="padding: 12px;">විස්තරය</th>
                    <th style="padding: 12px;">මුදල (රු.)</th>
                    <th style="padding: 12px;">ව්‍යාපෘතිය</th>
                    <th style="padding: 12px;">ක්‍රියා</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach(r => {
        const isIncome = r.type === 'IN';
        const badgeColor = isIncome ? 'var(--success)' : 'var(--danger)';
        const badgeText = isIncome ? 'ලැබීම්' : 'ගෙවීම්';
        const amountColor = isIncome ? 'green' : 'red';
        
        let refDisplay = '-';
        if (isIncome) {
            if (r.ref && r.ref.includes(' සිට ') && r.ref.includes(' දක්වා')) {
                const parts = r.ref.split(' සිට ');
                const fromPart = parts[0];
                const toPart = parts[1]?.split(' දක්වා')[0] || '';
                if (fromPart === toPart) {
                    refDisplay = fromPart;
                } else {
                    refDisplay = r.ref;
                }
            } else {
                refDisplay = r.ref || '-';
            }
        } else {
            refDisplay = r.vouch || '-';
        }
        
        const chequeNumber = !isIncome ? (r.ref || '-') : '-';
        
        let actionButtons = '';
        
        if (userRole === 'ADMIN') {
            actionButtons = `
                <button onclick="editTransaction(${r.id})" class="table-btn" style="background: var(--deep-blue); color: white; padding: 5px 10px; font-size: 11px;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteTransaction(${r.id})" class="table-btn" style="background: var(--danger); color: white; padding: 5px 10px; font-size: 11px; margin-left: 5px;">
                    <i class="fas fa-trash"></i> Del
                </button>
            `;
        } else {
            actionButtons = '<span style="color: #999; font-size: 11px;">-</span>';
        }
        
        html += `
            <tr style="border-bottom: 1px solid #eee; ${isIncome ? 'background: #f9fff9;' : 'background: #fff9f9;'}" 
                onmouseover="this.style.background='${isIncome ? '#e8f5e9' : '#ffebee'}'" 
                onmouseout="this.style.background='${isIncome ? '#f9fff9' : '#fff9f9'}'">
                <td style="padding: 10px; border: 1px solid #ddd;">${r.date}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                    <span style="background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">
                        ${badgeText}
                    </span>
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: ${isIncome ? 'var(--primary)' : 'var(--danger)'};">
                    ${r.code || '-'}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; color: var(--primary);">
                    ${r.source || '-'}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">
                    ${refDisplay}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">
                    ${chequeNumber}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                    ${r.desc || '-'}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: ${amountColor};">
                    ${r.amt.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                    ${r.proj || '-'}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                    ${actionButtons}
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    resultsTable.innerHTML = html;
    resultCount.textContent = `ගනුදෙනු ${results.length}ක්`;
    resultsContainer.style.display = 'block';
    
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ============ Delete Transaction Function ============
async function deleteTransaction(id) {
    if (userRole !== 'ADMIN') {
        showToast("❌ ගනුදෙනු මකා දැමීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const confirm = await showConfirmDialog(
        "🗑️ ගනුදෙනුව මකා දමන්න",
        `ID ${id} සහිත ගනුදෙනුව ස්ථිරවම මකා දමන්නද?`,
        "ඔව්, මකන්න",
        "අවලංගු කරන්න"
    );
    
    if (!confirm) return;
    
    toggleLoading(true);
    
    try {
        const response = await fetch(SCRIPT_URL + "?action=delete&id=" + id + "&t=" + Date.now());
        const result = await response.json();
        
        if (result.status === 'success') {
            let db = getData();
            db = db.filter(item => item.id != id);
            setDataCache(db); // update cache and storage
            showToast("✅ ගනුදෙනුව මකා දමන ලදී!");
            
            const resultsDiv = document.getElementById('transactionSearchResults');
            if (resultsDiv && resultsDiv.style.display === 'block') {
                searchTransactions();
            }
            loadRecentTable();
            refreshDashboard();
        } else {
            throw new Error(result.message || 'Delete failed');
        }
    } catch (error) {
        console.error("Delete error:", error);
        showToast("❌ මකා දැමීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

function toggleAdvancedSearch() {
    const panel = document.getElementById('advancedSearchPanel');
    const toggle = document.getElementById('advancedSearchToggle');
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        toggle.innerHTML = '<i class="fas fa-chevron-up"></i> උසස් සෙවීම් විකල්ප සඟවන්න';
        populateAdvancedSearchFilters();
    } else {
        panel.style.display = 'none';
        toggle.innerHTML = '<i class="fas fa-chevron-down"></i> උසස් සෙවීම් විකල්ප';
    }
}

function populateAdvancedSearchFilters() {
    const inCodeSelect = document.getElementById('searchInCode');
    if (inCodeSelect) {
        let options = '<option value="">සියල්ල</option>';
        S_CODES.forEach(code => {
            options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 30)}...</option>`;
        });
        inCodeSelect.innerHTML = options;
    }
    
    const exCodeSelect = document.getElementById('searchExCode');
    if (exCodeSelect) {
        let options = '<option value="">සියල්ල</option>';
        EX_CODES.forEach(code => {
            options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 30)}...</option>`;
        });
        exCodeSelect.innerHTML = options;
    }
    
    const sourceSelect = document.getElementById('searchSource');
    if (sourceSelect) {
        let options = '<option value="">සියල්ල</option>';
        S_CODES.forEach(code => {
            options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 30)}...</option>`;
        });
        sourceSelect.innerHTML = options;
    }
    
    const projectSelect = document.getElementById('searchProject');
    if (projectSelect) {
        const projs = getProjects(true);
        let options = '<option value="">සියල්ල</option>';
        projs.forEach(p => {
            options += `<option value="${p.projectName}">${p.projectName} ${p.completed ? '(Completed)' : ''}</option>`;
        });
        projectSelect.innerHTML = options;
    }
}

function clearTransactionSearch() {
    document.getElementById('transactionSearchInput').value = '';
    document.getElementById('transactionTypeFilter').value = 'ALL';
    document.getElementById('transactionDateFilter').value = 'ALL';
    
    if (document.getElementById('searchInCode')) document.getElementById('searchInCode').value = '';
    if (document.getElementById('searchExCode')) document.getElementById('searchExCode').value = '';
    if (document.getElementById('searchSource')) document.getElementById('searchSource').value = '';
    if (document.getElementById('searchMinAmount')) document.getElementById('searchMinAmount').value = '';
    if (document.getElementById('searchMaxAmount')) document.getElementById('searchMaxAmount').value = '';
    if (document.getElementById('searchProject')) document.getElementById('searchProject').value = '';
    
    document.getElementById('transactionSearchResults').style.display = 'none';
    document.getElementById('transactionSearchInput').focus();
    
    showToast("🧹 සෙවුම් පෙරහන් ඉවත් කරන ලදී");
}

function exportSearchResults() {
    if (userRole !== 'ADMIN') {
        showToast("❌ CSV බාගත කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const resultsTable = document.querySelector('#transactionSearchResultsTable table');
    if (!resultsTable) {
        showToast("⚠️ බාගත කිරීමට දත්ත නැත!");
        return;
    }
    
    try {
        let csvContent = "දිනය,වර්ගය,කේතය,මූලාශ්‍රය,ලදුපත්/වවුචර්,චෙක්පත් අංකය,විස්තරය,මුදල (රු.),ව්‍යාපෘතිය\n";
        
        const rows = resultsTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            const rowData = [
                cols[0]?.innerText || '',
                cols[1]?.innerText.replace(/[^ලැබීම්ගෙවීම්]/g, '') || '',
                cols[2]?.innerText || '',
                cols[3]?.innerText || '',
                cols[4]?.innerText || '',
                cols[5]?.innerText || '',
                `"${(cols[6]?.innerText || '').replace(/"/g, '""')}"`,
                cols[7]?.innerText || '',
                cols[8]?.innerText || ''
            ].join(',');
            csvContent += rowData + "\n";
        });
        
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.setAttribute("href", url);
        link.setAttribute("download", `ගනුදෙනු_සෙවුම්_ප්‍රතිඵල_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("✅ සෙවුම් ප්‍රතිඵල CSV ලෙස බාගත කරන ලදී!");
    } catch (error) {
        console.error("CSV Export Error:", error);
        showToast("❌ CSV බාගත කිරීමේ දෝෂයක්!");
    }
}

// ============ පද්ධති ශ්‍රිතයන් ============
function formatAmount(input) {
    let value = input.value.replace(/[^\d.]/g, '');

    if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2);
            value = parts.join('.');
        }
    }
    
    input.value = value;
  
    const pattern = /^(\d+)(\.\d{0,2})?$/;
    if (value && !pattern.test(value)) {
        input.style.borderColor = 'var(--danger)';
        input.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.5)';
    } else {
        input.style.borderColor = '#dcedc8';
        input.style.boxShadow = 'none';
    }
}

function parseAmount(amountStr) {
    if (!amountStr) return 0;
    const num = parseFloat(amountStr);
    return isNaN(num) ? 0 : num;
}

function showConfirmDialog(title, message, yesText = "ඔව්", noText = "නැත") {
    return new Promise((resolve) => {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmYes').textContent = yesText;
        document.getElementById('confirmNo').textContent = noText;
        
        const dialog = document.getElementById('confirmDialog');
        dialog.style.display = 'flex';
        
        document.getElementById('confirmYes').onclick = () => {
            dialog.style.display = 'none';
            resolve(true);
        };
        
        document.getElementById('confirmNo').onclick = () => {
            dialog.style.display = 'none';
            resolve(false);
        };
    });
}

// ============ Caching Functions ============
function setDataCache(data) {
    dbCache = data;
    sessionStorage.setItem('sch_db', JSON.stringify(data));
}

function setProjectsCache(data) {
    projectsCache = data;
    sessionStorage.setItem('sch_projs', JSON.stringify(data));
}

function setAllocationsCache(data) {
    allocationsCache = data;
    allocations = data;
    sessionStorage.setItem('sch_allocations', JSON.stringify(data));
}

function setPettyExpensesCache(data) {
    pettyExpensesCache = data;
    pettyExpenses = data;
    sessionStorage.setItem('sch_petty_expenses', JSON.stringify(data));
}

function setPeriodExpensesCache(data) {
    periodExpensesCache = data;
    periodExpenses = data;
    sessionStorage.setItem('sch_period_expenses', JSON.stringify(data));
}

function getData() {
    if (!dbCache) {
        dbCache = JSON.parse(sessionStorage.getItem('sch_db') || '[]');
    }
    return dbCache;
}

function getProjects(includeCompleted = true) {
    if (!projectsCache) {
        projectsCache = JSON.parse(sessionStorage.getItem('sch_projs') || '[]');
    }
    if (!includeCompleted) {
        return projectsCache.filter(p => !p.completed);
    }
    return projectsCache;
}

async function checkLogin() {
    const pass = document.getElementById('passInput').value;
    if(pass === "Admin") {
        userRole = 'ADMIN';
    } else if(pass === "gkvstaff") {
        userRole = 'STAFF';
    } else if(pass === "Guest") {
        userRole = 'GUEST';
    } else { 
        alert("මුරපදය වැරදියි!"); 
        return; 
    }
    
    // වහාම පිවිසුම් තිරය ඉවත් කර Dashboard පෙන්වන්න
    document.getElementById('login-overlay').style.display = 'none';
    showSec('dash');
    applyPermissions();
    showToast("🔄 පද්ධතියට ඇතුළු වෙමින්... පසුබිමේ දත්ත ලබා ගනිමින් පවතී.");
    
    // පසුබිමේ දත්ත සමාන්තරව ලබා ගන්න
    fetchAllDataParallel().then(() => {
        refreshDashboard();
        loadRecentTable();
        renderPettyBook();
        renderCodesList();
        updateProjectSelects();
        renderProjectList();
        displaySavedPeriodSummaries();
        showToast("✅ සියලු දත්ත යාවත්කාලීන කරන ලදී!");
    }).catch(error => {
        console.error("දත්ත යාවත්කාලීන දෝෂය:", error);
        showToast("⚠️ සමහර දත්ත යාවත්කාලීන කිරීමේ දෝෂයක්. පැරණි දත්ත පෙන්වයි.");
    });
    
    setTimeout(() => {
        initializeSelect2();
    }, 100);
    
    initialized = true;
}

// ============ Parallel Data Fetching ============
async function fetchAllDataParallel() {
    if (!navigator.onLine) {
        // Offline නම් cached data පමණක් භාවිතා කරන්න
        return;
    }
    
    try {
        const promises = [
            fetchRemoteData(),
            fetchRemoteProjects(),
            fetchRemoteAllocations(),
            fetchRemotePettyExpenses(),
            fetchRemotePeriodExpenses()
        ];
        
        const results = await Promise.allSettled(promises);
        
        // අසාර්ථක වූ ඒවා පමණක් log කරන්න
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Data fetch ${index} failed:`, result.reason);
            }
        });
        
    } catch (error) {
        console.error("Parallel fetch error:", error);
    }
}
async function fetchRemotePeriodSummaries() {
    try {
        const response = await fetch(SCRIPT_URL + "?action=read_period_summaries&t=" + Date.now());
        const summaries = await response.json();
        // Save to localStorage or a dedicated cache variable
        localStorage.setItem('sch_remote_period_summaries', JSON.stringify(summaries));
        return summaries;
    } catch (e) {
        console.error("Remote period summaries fetch error:", e);
        return [];
    }
}

// ============ Batch Save Functions ============
async function saveBatchTransactions(transactions) {
    if (transactions.length === 0) return true;
    
    // එක එක ගනුදෙනුව වෙන වෙනම save කරන්න
    let successCount = 0;
    
    for (let t of transactions) {
        try {
            // action එක ඉවත් කරන්න (දැනටමත් තිබේ නම්)
            const transactionData = { ...t };
            
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                successCount++;
            } else {
                console.error("Individual save failed:", result);
            }
        } catch (e) {
            console.error("Individual save failed for transaction:", t, e);
        }
    }
    
    return successCount === transactions.length;
}

// ============ Offline Sync ============
async function syncOfflineUpdates() {
    const offlineUpdates = JSON.parse(sessionStorage.getItem('sch_offline_updates') || '[]');
    if (offlineUpdates.length === 0 || !navigator.onLine) return;
    
    showToast(`🔄 සමමුහුර්ත කරමින්... (${offlineUpdates.length} updates)`);
    
    // Batch save උත්සාහ කරන්න
    const success = await saveBatchTransactions(offlineUpdates);
    
    if (success) {
        sessionStorage.setItem('sch_offline_updates', '[]');
        showToast("✅ සමමුහුර්ත කිරීම සාර්ථකයි!");
    } else {
        showToast("⚠️ සමහර ගනුදෙනු සමමුහුර්ත කිරීම අසාර්ථක විය.");
    }
}

async function manualRefresh() { 
    if (isLoading) return;
    
    toggleLoading(true);
    isLoading = true;
    
    try {
        // Offline updates sync කරන්න උත්සාහ කරන්න
        await syncOfflineUpdates();
        
        // දත්ත අලුත් කරන්න
        await fetchAllDataParallel();
        
        refreshDashboard();
        loadRecentTable();
        renderPettyBook();
        showToast("✅ දත්ත අලුත් කරන ලදී!"); 
    } catch (error) {
        console.error("Manual refresh error:", error);
        showToast("⚠️ දත්ත අලුත් කිරීමේ දෝෂයක්");
    } finally {
        toggleLoading(false);
        isLoading = false;
    }
}

function editTransaction(id) {
    if (userRole !== 'ADMIN') {
        showToast("❌ ගනුදෙනු සංස්කරණය කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }

    const db = getData();
    const entry = db.find(r => r.id === id);
    if(!entry) return;

    showSec('entry');

    if(entry.type === 'IN') {
        document.getElementById('edit-id-in').value = entry.id;
        document.getElementById('inDate').value = entry.date.split('T')[0];
        
        const { fromRef, toRef } = parseReceiptRange(entry.ref);
        document.getElementById('inRefFrom').value = fromRef;
        document.getElementById('inRefTo').value = toRef || '';
        
        $('#inCodeSelect').val(entry.code).trigger('change');
        document.getElementById('inAmt').value = entry.amt.toFixed(2);
        $('#inProjSelect').val(entry.proj).trigger('change');
        document.getElementById('inDesc').value = entry.desc;
        document.getElementById('btn-save-in').innerText = "යාවත්කාලීන කරන්න (Update)";
        document.getElementById('edit-id-ex').value = '';
    } else {
        document.getElementById('edit-id-ex').value = entry.id;
        document.getElementById('exDate').value = entry.date.split('T')[0];
        document.getElementById('exVoucher').value = entry.vouch;
        document.getElementById('exRef').value = entry.ref;
        document.getElementById('exAmt').value = entry.amt.toFixed(2);
        $('#exCodeSelect').val(entry.code).trigger('change');
        $('#exSourceSelect').val(entry.source).trigger('change');
        $('#exProjSelect').val(entry.proj).trigger('change');
        document.getElementById('exDesc').value = entry.desc;
        document.getElementById('btn-save-ex').innerText = "යාවත්කාලීන කරන්න (Update)";
        document.getElementById('edit-id-in').value = '';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchRemoteData() {
    try {
        const response = await fetch(SCRIPT_URL + "?action=read&t=" + Date.now());
        const remoteData = await response.json();
        
        setDataCache(remoteData);
        
        let statusObj = {};
        remoteData.forEach(t => {
            if (t.type === 'EX' && t.ref && t.ref.trim() !== '') {
                statusObj[t.id] = t.status === true ? 'Cleared' : 'Pending';
            }
        });
        sessionStorage.setItem('sch_cleared', JSON.stringify(statusObj));
        clearedStatus = statusObj;
        
        return remoteData;
    } catch (e) {
        console.error("Remote data fetch error:", e);
        return getData();
    }
}

async function fetchRemoteProjects() {
    try {
        const response = await fetch(SCRIPT_URL + "?action=read_projects&t=" + Date.now());
        const projects = await response.json();
        
        const updatedProjects = projects.map(p => ({
            ...p,
            completed: p.completed || false
        }));
        
        setProjectsCache(updatedProjects);
    } catch (e) {
        console.error("Remote projects fetch error:", e);
    }
}

async function fetchRemoteAllocations() {
    try {
        const response = await fetch(SCRIPT_URL + "?action=read_allocations&t=" + Date.now());
        const allocs = await response.json();
        
        let allocObj = {};
        allocs.forEach(a => {
            if (a.code) {
                allocObj[a.code] = a.amount;
                // Store type information as well
                if (a.type) {
                    allocObj[a.code + '_type'] = a.type;
                }
            }
        });
        setAllocationsCache(allocObj);
    } catch (e) {
        console.error("Remote allocations fetch error:", e);
    }
}

async function fetchRemotePettyExpenses() {
    try {
        const response = await fetch(SCRIPT_URL + "?action=read_petty_expenses&t=" + Date.now());
        const expenses = await response.json();
        setPettyExpensesCache(expenses);
    } catch (e) {
        console.error("Remote petty expenses fetch error:", e);
        // cache එක නැවත පාවිච්චි කරන්න
        pettyExpenses = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
    }
}

async function fetchRemotePeriodExpenses() {
    try {
        const response = await fetch(SCRIPT_URL + "?action=read_period_expenses&t=" + Date.now());
        const expenses = await response.json();
        setPeriodExpensesCache(expenses);
    } catch (e) {
        console.error("Remote period expenses fetch error:", e);
        periodExpenses = JSON.parse(sessionStorage.getItem('sch_period_expenses') || '[]');
    }
}

function getAllExpenseDataForReports() {
    const db = getData();
    const periodEx = periodExpenses.map(p => ({
        ...p,
        type: 'EX',
        code: p.category,
        source: p.source || 'PC',
        proj: '',
        ref: '',
        vouch: p.voucher,
        status: true,
        isOp: false
    }));
    
    return [...db, ...periodEx];
}

function updatePeriodTotal() {
    const REx1 = parseAmount(document.getElementById('manualREx1').value);
    const REx5 = parseAmount(document.getElementById('manualREx5').value);
    const REx6 = parseAmount(document.getElementById('manualREx6').value);
    const REx7 = parseAmount(document.getElementById('manualREx7').value);
    const REx3 = parseAmount(document.getElementById('manualREx3').value);
    
    const total = REx1 + REx5 + REx6 + REx7 + REx3;
    document.getElementById('manualTotal').value = total.toFixed(2);
}

function savePeriodCategorySummary() {
    if(userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const summary = {
        date: new Date().toISOString().split('T')[0],
        REx1: parseAmount(document.getElementById('manualREx1').value),
        REx5: parseAmount(document.getElementById('manualREx5').value),
        REx6: parseAmount(document.getElementById('manualREx6').value),
        REx7: parseAmount(document.getElementById('manualREx7').value),
        REx3: parseAmount(document.getElementById('manualREx3').value),
        total: parseAmount(document.getElementById('manualTotal').value)
    };
    
    let summaries = JSON.parse(localStorage.getItem('sch_period_summaries') || '[]');
    
    summaries.push({
        ...summary,
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    
    if (summaries.length > 12) {
        summaries = summaries.slice(-12);
    }
    
    localStorage.setItem('sch_period_summaries', JSON.stringify(summaries));
    
    showToast("✅ කාලපරිච්ඡේද වියදම් සාරාංශය සුරකින ලදී!");
    
    displaySavedPeriodSummaries();
}

function viewPeriodSummaryDetails(summaryId) {
    const summaries = JSON.parse(localStorage.getItem('sch_period_summaries') || '[]');
    const summary = summaries.find(s => s.id === summaryId);
    
    if (!summary) {
        showToast("⚠️ සාරාංශය හමු නොවීය!");
        return;
    }
    
    const periodExpensesForDate = periodExpenses.filter(e => 
        e.date === summary.date && 
        ['REx1', 'REx5', 'REx6', 'REx7', 'REx3'].includes(e.category)
    );
    
    let html = `
        <div style="padding: 10px;">
            <h4 style="color: var(--primary); margin-top: 0;">📅 ${summary.date} දින සාරාංශ විස්තර</h4>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                    <h5 style="margin: 0 0 10px 0; color: #2e7d32;">කාණ්ඩ අනුව වියදම්</h5>
                    <table style="width:100%;">
                        <tr><td>REx1 (ලිපි ද්‍රව්‍ය):</td><td style="text-align:right; font-weight:bold;">රු. ${summary.REx1.toFixed(2)}</td></tr>
                        <tr><td>REx5 (උපකරණ නඩත්තු):</td><td style="text-align:right; font-weight:bold;">රු. ${summary.REx5.toFixed(2)}</td></tr>
                        <tr><td>REx6 (සුළු නඩත්තු):</td><td style="text-align:right; font-weight:bold;">රු. ${summary.REx6.toFixed(2)}</td></tr>
                        <tr><td>REx7 (පවිත්‍රතා):</td><td style="text-align:right; font-weight:bold;">රු. ${summary.REx7.toFixed(2)}</td></tr>
                        <tr><td>REx3 (විවිධ):</td><td style="text-align:right; font-weight:bold;">රු. ${summary.REx3.toFixed(2)}</td></tr>
                        <tr style="border-top: 2px solid #ddd;"><td><strong>මුළු එකතුව:</strong></td><td style="text-align:right; font-weight:bold; color: #1b5e20;">රු. ${summary.total.toFixed(2)}</td></tr>
                    </table>
                </div>
                
                <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                    <h5 style="margin: 0 0 10px 0; color: #e65100;">අදාළ ගනුදෙනු</h5>
                    ${periodExpensesForDate.length > 0 ? `
                        <table style="width:100%; font-size: 10px;">
                            <thead>
                                <tr>
                                    <th>කාණ්ඩය</th>
                                    <th>විස්තරය</th>
                                    <th>වවුචර්</th>
                                    <th style="text-align:right;">මුදල</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${periodExpensesForDate.map(e => `
                                    <tr>
                                        <td>${e.category}</td>
                                        <td>${e.desc.substring(0, 20)}...</td>
                                        <td>${e.voucher || '-'}</td>
                                        <td style="text-align:right;">රු. ${e.amt.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="color: #666;">ගනුදෙනු විස්තර නැත</p>'}
                </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                <h5 style="margin: 0 0 10px 0; color: #0c5460;">සටහන</h5>
                <p style="margin: 0;">මෙම කාලපරිච්ඡේදයේ සුළු මුදල් වියදම් එකතුව රු. ${summary.total.toFixed(2)} කි. මෙම වියදම් මුදල් පොතට ඇතුළත් නොකර, අදාළ REx ගෙවීම් කේත වලට පමණක් එකතු කර ඇත.</p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button class="btn" style="background: #95a5a6; color: white;" onclick="closePeriodSummaryDetails()">
                    <i class="fas fa-times"></i> වසන්න
                </button>
                <button class="btn" style="background: var(--deep-blue); color: white;" onclick="printPeriodSummaryDetails(${summaryId})">
                    <i class="fas fa-print"></i> මුද්‍රණය කරන්න
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.id = 'periodSummaryDetailsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10003;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 12px; width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto;">
            ${html}
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closePeriodSummaryDetails() {
    const modal = document.getElementById('periodSummaryDetailsModal');
    if (modal) {
        modal.remove();
    }
}

function printPeriodSummaryDetails(summaryId) {
    const summaries = JSON.parse(localStorage.getItem('sch_period_summaries') || '[]');
    const summary = summaries.find(s => s.id === summaryId);
    
    if (!summary) {
        showToast("⚠️ සාරාංශය හමු නොවීය!");
        return;
    }
    
    const periodExpensesForDate = periodExpenses.filter(e => 
        e.date === summary.date && 
        ['REx1', 'REx5', 'REx6', 'REx7', 'REx3'].includes(e.category)
    );
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>කාලපරිච්ඡේද වියදම් සාරාංශ විස්තර</title>
            <style>
                body { font-family: 'Noto Sans Sinhala', sans-serif; padding: 20px; }
                h1 { color: #1b5e20; text-align: center; }
                h2 { color: #2e7d32; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #1b5e20; color: #ffeb3b; padding: 10px; }
                td { padding: 8px; border: 1px solid #ddd; }
                .total { font-weight: bold; background: #f0f0f0; }
                .footer { margin-top: 30px; text-align: right; }
            </style>
        </head>
        <body>
            <h1>මො/ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
            <h2>කාලපරිච්ඡේද වියදම් සාරාංශ විස්තර - ${summary.date}</h2>
            
            <h3>කාණ්ඩ අනුව වියදම් එකතුව</h3>
            <table>
                <thead>
                    <tr>
                        <th>වියදම් කාණ්ඩය</th>
                        <th>කේතය</th>
                        <th style="text-align:right;">මුදල (රු.)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>ලිපි ද්‍රව්‍ය</td><td>REx1</td><td style="text-align:right;">${summary.REx1.toFixed(2)}</td></tr>
                    <tr><td>උපකරණ නඩත්තු</td><td>REx5</td><td style="text-align:right;">${summary.REx5.toFixed(2)}</td></tr>
                    <tr><td>සුළු නඩත්තු</td><td>REx6</td><td style="text-align:right;">${summary.REx6.toFixed(2)}</td></tr>
                    <tr><td>පවිත්‍රතා</td><td>REx7</td><td style="text-align:right;">${summary.REx7.toFixed(2)}</td></tr>
                    <tr><td>විවිධ</td><td>REx3</td><td style="text-align:right;">${summary.REx3.toFixed(2)}</td></tr>
                    <tr class="total"><td colspan="2" style="text-align:right;">මුළු එකතුව:</td><td style="text-align:right;">${summary.total.toFixed(2)}</td></tr>
                </tbody>
            </table>
            
            <h3 style="margin-top: 30px;">අදාළ ගනුදෙනු විස්තර</h3>
            <table>
                <thead>
                    <tr>
                        <th>කාණ්ඩය</th>
                        <th>විස්තරය</th>
                        <th>වවුචර් අංකය</th>
                        <th style="text-align:right;">මුදල (රු.)</th>
                    </tr>
                </thead>
                <tbody>
                    ${periodExpensesForDate.length > 0 ? 
                        periodExpensesForDate.map(e => `
                            <tr>
                                <td>${e.category}</td>
                                <td>${e.desc}</td>
                                <td>${e.voucher || '-'}</td>
                                <td style="text-align:right;">${e.amt.toFixed(2)}</td>
                            </tr>
                        `).join('') 
                        : '<tr><td colspan="4" style="text-align:center;">ගනුදෙනු විස්තර නැත</td></tr>'
                    }
                </tbody>
            </table>
            
            <div class="footer">
                <p>....................................</p>
                <p><b>භාණ්ඩාගාරික</b></p>
                <p style="margin-top: 20px;">....................................</p>
                <p><b>විදුහල්පති</b></p>
            </div>
            
            <p style="text-align:center; margin-top: 20px; color: #666; font-size: 12px;">
                මුද්‍රණය කළ දිනය: ${new Date().toLocaleString('si-LK')}
            </p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printPeriodSummary() {
    const REx1 = parseAmount(document.getElementById('manualREx1').value);
    const REx5 = parseAmount(document.getElementById('manualREx5').value);
    const REx6 = parseAmount(document.getElementById('manualREx6').value);
    const REx7 = parseAmount(document.getElementById('manualREx7').value);
    const REx3 = parseAmount(document.getElementById('manualREx3').value);
    const total = parseAmount(document.getElementById('manualTotal').value);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>කාලපරිච්ඡේද වියදම් සාරාංශය</title>
            <style>
                body { font-family: 'Noto Sans Sinhala', sans-serif; padding: 20px; }
                h1 { color: #1b5e20; text-align: center; }
                h2 { color: #2e7d32; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #1b5e20; color: #ffeb3b; padding: 10px; }
                td { padding: 8px; border: 1px solid #ddd; }
                .total { font-weight: bold; background: #f0f0f0; }
                .footer { margin-top: 30px; text-align: right; }
            </style>
        </head>
        <body>
            <h1>මො/ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
            <h2>කාලපරිච්ඡේද වියදම් සාරාංශය - ${new Date().toLocaleDateString('si-LK')}</h2>
            
            <table>
                <thead>
                    <tr>
                        <th>වියදම් කාණ්ඩය</th>
                        <th>කේතය</th>
                        <th style="text-align:right;">මුදල (රු.)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ලිපි ද්‍රව්‍ය</td>
                        <td>REx1</td>
                        <td style="text-align:right;">${REx1.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>උපකරණ නඩත්තු</td>
                        <td>REx5</td>
                        <td style="text-align:right;">${REx5.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>සුළු නඩත්තු</td>
                        <td>REx6</td>
                        <td style="text-align:right;">${REx6.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>පවිත්‍රතා</td>
                        <td>REx7</td>
                        <td style="text-align:right;">${REx7.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>විවිධ</td>
                        <td>REx3</td>
                        <td style="text-align:right;">${REx3.toFixed(2)}</td>
                    </tr>
                    <tr class="total">
                        <td colspan="2" style="text-align:right;">මුළු එකතුව:</td>
                        <td style="text-align:right;">${total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                <p>....................................</p>
                <p><b>භාණ්ඩාගාරික</b></p>
                
                <p style="margin-top: 20px;">....................................</p>
                <p><b>විදුහල්පති</b></p>
            </div>
            
            <p style="text-align:center; margin-top: 20px; color: #666; font-size: 12px;">
                මුද්‍රණය කළ දිනය: ${new Date().toLocaleString('si-LK')}
            </p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ============ saveManualPeriodExpenses ශ්‍රිතය (Batch Save සහිතව) ============
// ============ වැඩිදියුණු කළ saveManualPeriodExpenses ශ්‍රිතය ============
async function saveManualPeriodExpenses() {
    if(userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    // ---------- 1. Transferred නොවන Petty Expenses පෙරීම ----------
    const allPettyExpenses = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
    const untransferredExpenses = allPettyExpenses.filter(exp => !exp.transferred);
    
    if (untransferredExpenses.length === 0) {
        showToast("⚠️ මාරු කිරීමට අළුත් සුළු මුදල් වියදම් නැත!");
        return;
    }

    // ---------- 2. කාණ්ඩ අනුව මුදල් ගණනය කිරීම ----------
    const categoryTotals = {
        REx1: 0, REx5: 0, REx6: 0, REx7: 0, REx3: 0
    };

    untransferredExpenses.forEach(exp => {
        if (categoryTotals.hasOwnProperty(exp.category)) {
            categoryTotals[exp.category] += exp.amt;
        }
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    if (totalAmount === 0) {
        showToast("⚠️ මාරු කිරීමට වලංගු වියදම් නැත!");
        return;
    }

    // ---------- 3. කාලපරිච්ඡේදයේ නිවැරදි ආරම්භක සහ අවසන් දිනයන් සොයා ගැනීම ----------
    const currentDate = new Date().toISOString().split('T')[0];
    
    // ප්‍රථම ගනුදෙනුවේ දිනය (Period එකේ ආරම්භය)
    const firstExpense = untransferredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    const periodStartDate = firstExpense.date;
    
    // අවසන් ප්‍රතිපූරණයේ දිනය (තිබේ නම්)
    const db = getData();
    const lastReplenishment = db
        .filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය'))
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    // Period එකේ ආරම්භක දිනය නිවැරදිව තීරණය කිරීම
    let effectiveStartDate = periodStartDate;
    if (lastReplenishment && new Date(lastReplenishment.date) > new Date(periodStartDate)) {
        effectiveStartDate = lastReplenishment.date;
    }
    
    // Period එකේ අවසන් දිනය (වත්මන් දිනය හෝ අවසන් ගනුදෙනු දිනය)
    const lastExpense = untransferredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const periodEndDate = lastExpense.date > currentDate ? lastExpense.date : currentDate;
    
    // Period Name නිවැරදිව සැකසීම
    const periodName = effectiveStartDate === periodEndDate 
        ? `${effectiveStartDate} දින` 
        : `${effectiveStartDate} සිට ${periodEndDate} දක්වා`;

    // ---------- 4. තහවුරු කිරීමේ සංවාදය පෙන්වීම ----------
    const confirmMessage = `පහත සුළු මුදල් වියදම් REx ගෙවීම් ලෙස ඇතුළත් කරන්නද?\n\n` +
        `📅 කාලපරිච්ඡේදය: ${periodName}\n` +
        `📊 ගනුදෙනු ගණන: ${untransferredExpenses.length}\n\n` +
        `REx1 (ලිපි ද්‍රව්‍ය): රු. ${categoryTotals.REx1.toFixed(2)}\n` +
        `REx5 (උපකරණ නඩත්තු): රු. ${categoryTotals.REx5.toFixed(2)}\n` +
        `REx6 (සුළු නඩත්තු): රු. ${categoryTotals.REx6.toFixed(2)}\n` +
        `REx7 (පවිත්‍රතා): රු. ${categoryTotals.REx7.toFixed(2)}\n` +
        `REx3 (විවිධ): රු. ${categoryTotals.REx3.toFixed(2)}\n\n` +
        `💰 **මුළු වියදම්: රු. ${totalAmount.toFixed(2)}**\n\n` +
        `මෙම මුදල් අදාළ REx ගෙවීම් කේත වලට එකතු කර, සුළු මුදල් ගනුදෙනු 'Transferred' ලෙස සලකුණු කරන්නද?`;

    const confirm = await showConfirmDialog(
        "💰 කාලපරිච්ඡේද වියදම් ඇතුළත් කිරීම",
        confirmMessage,
        "ඔව්, ඇතුළත් කරන්න",
        "අවලංගු කරන්න"
    );
    
    if (!confirm) return;

    toggleLoading(true);
    
    try {
        // ---------- 5. Period Expense ගනුදෙනු සකස් කිරීම ----------
        const periodTransactions = [];
        const timestamp = Date.now();
        
        for (const [category, amount] of Object.entries(categoryTotals)) {
            if (amount <= 0) continue;
            
            // අනන්‍ය ID එකක් සෑදීම
            const uniqueId = timestamp + Math.floor(Math.random() * 1000) + 
                (category === 'REx1' ? 100 : 
                 category === 'REx5' ? 200 : 
                 category === 'REx6' ? 300 : 
                 category === 'REx7' ? 400 : 500);
            
            const periodExpenseData = {
                action: 'save_period_expense',
                id: uniqueId,
                date: currentDate,
                desc: `කාලපරිච්ඡේද සාරාංශය - ${getCategoryDescription(category)} (${periodName})`,
                category: category,
                voucher: `PE-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}-${category}`,
                amt: amount,
                source: 'PC',
                periodStart: effectiveStartDate,
                periodEnd: periodEndDate
            };
            periodTransactions.push(periodExpenseData);
        }

        // ---------- 6. ගනුදෙනු එකින් එක සුරැකීම (Batch save වෙනුවට) ----------
        const saveResults = [];
        let successCount = 0;
        
        for (const transaction of periodTransactions) {
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(transaction)
                });
                
                const result = await response.json();
                if (result.status === 'success') {
                    successCount++;
                    saveResults.push({ id: transaction.id, success: true });
                    
                    // Cache එකට එකතු කරන්න
                    periodExpenses.push(transaction);
                } else {
                    saveResults.push({ id: transaction.id, success: false, error: result.message });
                    console.error("Failed to save period expense:", result);
                }
            } catch (e) {
                saveResults.push({ id: transaction.id, success: false, error: e.message });
                console.error("Error saving period expense:", e);
                
                // Offline mode සඳහා
                if (!navigator.onLine) {
                    periodExpenses.push({ ...transaction, offline: true });
                }
            }
        }
        
        // Cache එක යාවත්කාලීන කිරීම
        setPeriodExpensesCache(periodExpenses);
        
        // ---------- 7. සාර්ථකව සුරැකුණු ගනුදෙනු ප්‍රමාණය අනුව කටයුතු කිරීම ----------
        if (successCount > 0) {
            
            // Petty expenses transferred ලෙස සලකුණු කිරීම
            const transferResults = await markExpensesAsTransferred(untransferredExpenses, allPettyExpenses);
            
            // ---------- 8. Period Summary එක Save කිරීම ----------
            try {
                const summaryData = {
                    action: 'save_period_summary',
                    date: currentDate,
                    periodName: periodName,
                    totalAmount: totalAmount,
                    startDate: effectiveStartDate,
                    endDate: periodEndDate,
                    transactionCount: untransferredExpenses.length,
                    categoryBreakdown: {
                        REx1: categoryTotals.REx1,
                        REx5: categoryTotals.REx5,
                        REx6: categoryTotals.REx6,
                        REx7: categoryTotals.REx7,
                        REx3: categoryTotals.REx3
                    }
                };
                
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(summaryData)
                }).catch(e => console.log("Summary save non-critical error:", e));
                
            } catch (summaryError) {
                console.error("Period summary save error (non-critical):", summaryError);
            }

            // ---------- 9. Local Storage Summary එක Update කිරීම ----------
            const localSummary = {
                date: currentDate,
                periodName: periodName,
                startDate: effectiveStartDate,
                endDate: periodEndDate,
                REx1: categoryTotals.REx1,
                REx5: categoryTotals.REx5,
                REx6: categoryTotals.REx6,
                REx7: categoryTotals.REx7,
                REx3: categoryTotals.REx3,
                total: totalAmount,
                transactionCount: untransferredExpenses.length,
                timestamp: new Date().toISOString(),
                id: Date.now()
            };
            
            let summaries = JSON.parse(localStorage.getItem('sch_period_summaries') || '[]');
            summaries.push(localSummary);
            if (summaries.length > 12) {
                summaries = summaries.slice(-12);
            }
            localStorage.setItem('sch_period_summaries', JSON.stringify(summaries));
            
            // ප්‍රතිඵල පණිවිඩය
            const failedCount = periodTransactions.length - successCount;
            let message = `✅ කාලපරිච්ඡේද වියදම් ${successCount}ක් එකතු කරන ලදී!`;
            
            if (failedCount > 0) {
                message += `\n⚠️ ගනුදෙනු ${failedCount}ක් අසාර්ථක විය.`;
            }
            
            if (transferResults.failed > 0) {
                message += `\n⚠️ වියදම් ${transferResults.failed}ක් 'Transferred' ලෙස සලකුණු කිරීමට නොහැකි විය.`;
            }
            
            showToast(message);
            
        } else {
            // කිසිදු ගනුදෙනුවක් සාර්ථක නොවූ විට
            let errorDetails = saveResults.filter(r => !r.success).map(r => r.error).join(', ');
            showToast(`❌ කිසිදු Period Expense එකක් සුරැකීමට නොහැකි විය! ${errorDetails ? 'දෝෂය: ' + errorDetails : ''}`);
        }

        // UI යාවත්කාලීන කිරීම
        renderPettyBook();
        refreshDashboard();
        displaySavedPeriodSummaries();

    } catch (error) {
        console.error("Manual period expenses save error:", error);
        showToast(`❌ දත්ත සුරැකීමේ දෝෂයක්: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

// ============ Helper: markExpensesAsTransferred ============
async function markExpensesAsTransferred(untransferredExpenses, allPettyExpenses) {
    const results = {
        success: 0,
        failed: 0,
        details: []
    };
    
    for (let expense of untransferredExpenses) {
        try {
            const updateData = {
                action: 'mark_expense_transferred',
                id: expense.id,
                transferred: true
            };
            
            if (navigator.onLine) {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(updateData)
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    results.success++;
                    const index = allPettyExpenses.findIndex(e => e.id === expense.id);
                    if (index !== -1) {
                        allPettyExpenses[index].transferred = true;
                    }
                } else {
                    results.failed++;
                    results.details.push({ id: expense.id, error: result.message });
                }
            } else {
                // Offline mode
                let offlineUpdates = JSON.parse(sessionStorage.getItem('sch_offline_updates') || '[]');
                offlineUpdates.push(updateData);
                sessionStorage.setItem('sch_offline_updates', JSON.stringify(offlineUpdates));
                
                const index = allPettyExpenses.findIndex(e => e.id === expense.id);
                if (index !== -1) {
                    allPettyExpenses[index].transferred = true;
                }
                results.success++;
            }
        } catch (error) {
            results.failed++;
            results.details.push({ id: expense.id, error: error.message });
            console.error(`Error updating transferred status for expense ${expense.id}:`, error);
        }
    }
    
    // Updated Petty Expenses list එක save කරන්න
    setPettyExpensesCache(allPettyExpenses);
    
    return results;
}

// Helper function to get category description
function getCategoryDescription(category) {
    const descriptions = {
        'REx1': 'ලිපි ද්‍රව්‍ය',
        'REx5': 'උපකරණ නඩත්තු',
        'REx6': 'සුළු නඩත්තු',
        'REx7': 'පවිත්‍රතා',
        'REx3': 'විවිධ'
    };
    return descriptions[category] || category;
}

async function startNewPeriod() {
    if(userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const REx1 = parseAmount(document.getElementById('manualREx1').value);
    const REx5 = parseAmount(document.getElementById('manualREx5').value);
    const REx6 = parseAmount(document.getElementById('manualREx6').value);
    const REx7 = parseAmount(document.getElementById('manualREx7').value);
    const REx3 = parseAmount(document.getElementById('manualREx3').value);
    
    const db = getData();
    const pcTransactions = db.filter(t => t.type === 'EX' && t.code === 'PC' && !t.isImprest);
    const totalPC = pcTransactions.reduce((sum, t) => sum + t.amt, 0);
    const totalExpenses = pettyExpenses.reduce((sum, e) => sum + e.amt, 0);
    const currentBalance = totalPC - totalExpenses;
    
    const confirm = await showConfirmDialog(
        "🔄 නව කාලපරිච්ඡේදයක් ආරම්භ කරන්න",
        `වත්මන් කාලපරිච්ඡේදයේ වියදම් සාරාංශය:\n` +
        `REx1: රු. ${REx1.toFixed(2)}\n` +
        `REx5: රු. ${REx5.toFixed(2)}\n` +
        `REx6: රු. ${REx6.toFixed(2)}\n` +
        `REx7: රු. ${REx7.toFixed(2)}\n` +
        `REx3: රු. ${REx3.toFixed(2)}\n` +
        `අවසන් ශේෂය: රු. ${currentBalance.toFixed(2)}\n\n` +
        `මෙම වියදම් සාරාංශය සුරකින අතර නව කාලපරිච්ඡේදයක් ආරම්භ කරන්නද?`,
        "ඔව්, ආරම්භ කරන්න",
        "අවලංගු කරන්න"
    );
    
    if(!confirm) return;
    
    const summary = {
        date: new Date().toISOString().split('T')[0],
        REx1: REx1,
        REx5: REx5,
        REx6: REx6,
        REx7: REx7,
        REx3: REx3,
        balance: currentBalance,
        total: REx1 + REx5 + REx6 + REx7 + REx3,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    let summaries = JSON.parse(localStorage.getItem('sch_period_summaries') || '[]');
    summaries.push(summary);
    
    if (summaries.length > 12) {
        summaries = summaries.slice(-12);
    }
    
    localStorage.setItem('sch_period_summaries', JSON.stringify(summaries));
    
    document.getElementById('manualREx1').value = '0';
    document.getElementById('manualREx5').value = '0';
    document.getElementById('manualREx6').value = '0';
    document.getElementById('manualREx7').value = '0';
    document.getElementById('manualREx3').value = '0';
    document.getElementById('manualTotal').value = '0';
    
    showToast("✅ නව කාලපරිච්ඡේදය ආරම්භ කරන ලදී!");
    renderPettyBook();
    displaySavedPeriodSummaries();
}

function displaySavedPeriodSummaries() {
    const summaries = JSON.parse(localStorage.getItem('sch_period_summaries') || '[]');
    const container = document.getElementById('periodSummariesDisplay');
    
    if (!container) return;
    
    if (summaries.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<h5 style="margin: 20px 0 10px 0;">පෙර කාලපරිච්ඡේද සාරාංශ</h5>';
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';
    
    summaries.slice().reverse().forEach(s => {
        html += `
            <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; border-left: 3px solid #8e44ad;">
                <div style="font-size: 12px; color: #666;">${s.date}</div>
                <div style="font-size: 14px; font-weight: bold;">රු. ${s.total.toFixed(2)}</div>
                <button class="btn" style="font-size: 11px; padding: 3px 8px; margin-top: 5px;" onclick="viewPeriodSummaryDetails(${s.id})">
                    <i class="fas fa-eye"></i> බලන්න
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function toggleLoading(show) {
    if (show) {
        document.getElementById('loading-overlay').style.display = 'flex';
    } else {
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

function applyPermissions() {
    if(userRole === 'GUEST') {
        document.querySelectorAll('.staff-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.getElementById('print-btn').style.display = 'none';
        document.getElementById('pdf-btn').style.display = 'none';
        document.querySelectorAll('.table-btn').forEach(btn => btn.style.display = 'none');
        document.getElementById('sec-entry').style.display = 'none';
        
        const csvExportBtn = document.querySelector('#transactionSearchResults .btn[onclick*="exportSearchResults"]');
        if (csvExportBtn) csvExportBtn.style.display = 'none';
        
        const entryNav = document.getElementById('nav-entry');
        if(entryNav) {
            entryNav.style.display = 'none';
        }
        const projNav = document.getElementById('nav-proj');
        if(projNav) {
            projNav.style.display = 'none';
        }
        const pettyNav = document.getElementById('nav-petty');
        if(pettyNav) {
            pettyNav.style.display = 'none';
        }
    } 
    else if(userRole === 'ADMIN') {
        document.querySelectorAll('.staff-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.getElementById('print-btn').style.display = 'flex';
        document.getElementById('pdf-btn').style.display = 'flex';
        document.querySelectorAll('.table-btn').forEach(btn => btn.style.display = 'inline-flex');
        
        const csvExportBtn = document.querySelector('#transactionSearchResults .btn[onclick*="exportSearchResults"]');
        if (csvExportBtn) csvExportBtn.style.display = 'flex';
        
        const entryNav = document.getElementById('nav-entry');
        if(entryNav) {
            entryNav.style.display = 'block';
        }
        const projNav = document.getElementById('nav-proj');
        if(projNav) {
            projNav.style.display = 'block';
        }
        const pettyNav = document.getElementById('nav-petty');
        if(pettyNav) {
            pettyNav.style.display = 'block';
        }
    }
    else if(userRole === 'STAFF') {
        document.querySelectorAll('.staff-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.getElementById('print-btn').style.display = 'flex';
        document.getElementById('pdf-btn').style.display = 'flex';
        
        const csvExportBtn = document.querySelector('#transactionSearchResults .btn[onclick*="exportSearchResults"]');
        if (csvExportBtn) csvExportBtn.style.display = 'none';
        
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        
        const entryNav = document.getElementById('nav-entry');
        if(entryNav) {
            entryNav.style.display = 'block';
        }
        const projNav = document.getElementById('nav-proj');
        if(projNav) {
            projNav.style.display = 'block';
        }
        const pettyNav = document.getElementById('nav-petty');
        if(pettyNav) {
            pettyNav.style.display = 'block';
        }
    }
}

function initializeSelect2() {
    if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
        try {
            $('.select2').each(function() {
                if ($(this).data('select2')) {
                    $(this).select2('destroy');
                }
            });
        } catch (e) {
            console.log("Select2 destroy error, continuing...");
        }
        
        $('#inCodeSelect, #exCodeSelect, #exSourceSelect, #opCodeSelect, #allocCodeSelect, #pettyCategorySelect, #replenishSourceSelect, #multiInProjSelect, #allocTypeSelect').each(function() {
            if ($(this).length > 0) {
                $(this).select2({
                    placeholder: "තෝරන්න...",
                    allowClear: true,
                    width: '100%'
                }).on('select2:open', function() {
                    $(this).data('select2').$dropdown.find(':input.select2-search__field').focus();
                });
            }
        });
    }
}

function populateOptions() {
    const sCodeOptions = S_CODES.map(c => `<option value="${c}">${c} - ${CODE_INFO[c]}</option>`).join('');
    const exCodeOptions = EX_CODES.map(c => `<option value="${c}">${c} - ${CODE_INFO[c]}</option>`).join('');
    const allCodeOptions = sCodeOptions + exCodeOptions;
    
    // inCodeSelect, exSourceSelect, opCodeSelect සඳහා S code options fill කරන්න (මේක එලෙසම තියන්න)
['inCodeSelect', 'exSourceSelect', 'opCodeSelect'].forEach(sId => {
    const el = document.getElementById(sId);
    if(el) {
        el.innerHTML = `<option value=""></option>` + sCodeOptions;
    }
});

// exCodeSelect සඳහා EX code options fill කරන්න (මේක එලෙසම තියන්න)
['exCodeSelect'].forEach(id => {
    const el = document.getElementById(id);
    if(el) {
        el.innerHTML = `<option value=""></option>` + exCodeOptions;
    }
});

// *** වැදගත්: allocCodeSelect එක හිස් කරන්න (මේ කොටස අලුතෙන් එකතු කරන්න) ***
const allocCodeSelectEl = document.getElementById('allocCodeSelect');
if (allocCodeSelectEl) {
    allocCodeSelectEl.innerHTML = '<option value=""></option>'; // හිස් කරන්න
}

    const pettyCatEl = document.getElementById('pettyCategorySelect');
    if (pettyCatEl) {
        pettyCatEl.innerHTML = `
            <option value=""></option>
            <option value="REx1">ලිපි ද්‍රව්‍ය (REx1)</option>
            <option value="REx5">උපකරණ නඩත්තු (REx5)</option>
            <option value="REx6">සුළු නඩත්තු (REx6)</option>
            <option value="REx7">පවිත්‍රතා (REx7)</option>
            <option value="REx3">විවිධ (REx3)</option>
        `;
    }
    
    const replenishEl = document.getElementById('replenishSourceSelect');
    if (replenishEl) {
        replenishEl.innerHTML = `<option value=""></option>` + sCodeOptions;
    }
    
    const repFilter = document.getElementById('repFilter');
    if (repFilter) {
        repFilter.innerHTML = '<option value="ALL">සියලුම කේතයන්</option>' + 
                              sCodeOptions + exCodeOptions;
    }
    
    // Initialize allocation type selector if it exists
    const allocTypeEl = document.getElementById('allocTypeSelect');
    if (allocTypeEl) {
        // Ensure it has options
        if (allocTypeEl.options.length === 0) {
            allocTypeEl.innerHTML = `
                <option value="IN">ලැබීම් කේත (S Codes)</option>
                <option value="EX">ගෙවීම් කේත (EX Codes)</option>
            `;
        }
    }


setTimeout(function() {
        if ($('#allocTypeSelect').length > 0) {
            $('#allocTypeSelect').val('IN').trigger('change');
            updateAllocationCodeSelect();
        }
    }, 100);
}

// ============ Dropdown Toggle Function ============
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    // Find the toggle button - since onclick attribute uses this function, we can find it by the ID
    const toggle = document.querySelector(`[onclick="toggleDropdown('${dropdownId}')"]`);
    
    if (!dropdown || !toggle) return;
    
    // Toggle the dropdown visibility
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        toggle.classList.add('active');
    } else {
        dropdown.style.display = 'none';
        toggle.classList.remove('active');
    }
}
// ============ Allocation Type Functions ============
function updateAllocationCodeSelect() {
    const type = $('#allocTypeSelect').val(); // IN හෝ EX අගය ගන්න
    const select = $('#allocCodeSelect');
    
    let options = '<option value=""></option>'; // හිස් ඔප්ෂන් එක
    
    if (type === 'IN') {
        // IN නම් S_CODES array එකෙන් options හදන්න
        S_CODES.forEach(code => {
            options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 40)}...</option>`;
        });
    } else {
        // EX නම් EX_CODES array එකෙන් options හදන්න
        EX_CODES.forEach(code => {
            options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 40)}...</option>`;
        });
    }
    
    select.html(options); // අලුත් options set කරන්න
    select.trigger('change'); // select2 එක update කරන්න
}


function renderCodesList() {
    document.getElementById('codes-s').innerHTML = S_CODES.map(c => 
        `<div class="code-tag"><span class="code-num">${c}</span>${CODE_INFO[c]}</div>`
    ).join('');
    
    document.getElementById('codes-ex').innerHTML = EX_CODES.map(c => 
        `<div class="code-tag"><span class="code-num" style="background:var(--danger); color:white;">${c}</span>${CODE_INFO[c]}</div>`
    ).join('');
}

function validateForm(type) {
    const prefix = type === 'IN' ? 'in' : 'ex';
    const date = document.getElementById(prefix + 'Date').value;
    const amt = document.getElementById(prefix + 'Amt').value;
    const code = $(`#${prefix}CodeSelect`).val();
    const desc = document.getElementById(prefix + 'Desc').value;
    
    if(!date) {
        showToast("⚠️ කරුණාකර දිනය ඇතුළත් කරන්න");
        document.getElementById(prefix + 'Date').focus();
        return false;
    }
    if(!amt || parseAmount(amt) <= 0) {
        showToast("⚠️ කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න");
        document.getElementById(prefix + 'Amt').focus();
        return false;
    }
    if(!code || code === "") {
        showToast("⚠️ කරුණාකර " + (type === 'IN' ? 'ලැබීම්' : 'ගෙවීම්') + " කේතය තෝරන්න");
        $(`#${prefix}CodeSelect`).select2('open');
        return false;
    }
    if(!desc.trim()) {
        showToast("⚠️ කරුණාකර විස්තරය ඇතුළත් කරන්න");
        document.getElementById(prefix + 'Desc').focus();
        return false;
    }
    
    if(type === 'IN') {
        const fromRef = document.getElementById('inRefFrom').value.trim();
        
        if(!fromRef) {
            showToast("⚠️ කරුණාකර ලදුපත් අංකය ඇතුළත් කරන්න");
            document.getElementById('inRefFrom').focus();
            return false;
        }
        
        if (isNaN(parseInt(fromRef))) {
            showToast("⚠️ කරුණාකර වලංගු අංකයක් ඇතුළත් කරන්න");
            return false;
        }
        
        const toRef = document.getElementById('inRefTo').value.trim();
        if (toRef !== '') {
            if (isNaN(parseInt(toRef))) {
                showToast("⚠️ කරුණාකර වලංගු අංකයක් ඇතුළත් කරන්න");
                return false;
            }
            if (parseInt(fromRef) > parseInt(toRef)) {
                showToast("⚠️ 'දක්වා' අංකය 'සිට' අංකයට වඩා විශාල විය යුතුය!");
                return false;
            }
        }
    } else {
        const voucher = document.getElementById('exVoucher').value;
        const source = $('#exSourceSelect').val();
        
        if(!voucher.trim()) {
            showToast("⚠️ කරුණාකර වවුචර් අංකය ඇතුළත් කරන්න");
            document.getElementById('exVoucher').focus();
            return false;
        }
        if(!source || source === "") {
            showToast("⚠️ කරුණාකර මූලාශ්‍ර අරමුදල තෝරන්න");
            $('#exSourceSelect').select2('open');
            return false;
        }
    }
    
    return true;
}

async function saveData(type) {
    if(userRole === 'GUEST') {
        showToast("❌ ගනුදෙනු ඇතුළත් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    if(!validateForm(type)) return;
    
    const prefix = type === 'IN' ? 'in' : 'ex';
    const existingId = document.getElementById('edit-id-' + prefix).value;
    const isEdit = existingId && existingId !== '';
    const currentId = isEdit ? parseInt(existingId) : (Date.now() + Math.floor(Math.random()*1000));
    
    const action = isEdit ? 'update_transaction' : 'save_transaction';
    
    let referenceValue = "";
    if (type === 'IN') {
        const fromRef = document.getElementById('inRefFrom').value.trim();
        const toRef = document.getElementById('inRefTo').value.trim();
        
        const excludeId = isEdit ? currentId : null;
        const duplicateCheck = checkDuplicateReceipt(fromRef, toRef, excludeId);
        if (duplicateCheck.isDuplicate) {
            showToast(duplicateCheck.message);
            return;
        }
        
        referenceValue = formatReceiptRange(fromRef, toRef);
    } else {
        referenceValue = document.getElementById(prefix + 'Ref').value;
    }
    
    const data = { 
        action: action,
        id: currentId,
        date: document.getElementById(prefix + 'Date').value, 
        ref: referenceValue, 
        vouch: type === 'EX' ? document.getElementById('exVoucher').value : '', 
        code: $(`#${prefix}CodeSelect`).val(), 
        amt: parseAmount(document.getElementById(prefix + 'Amt')?.value || 0), 
        desc: document.getElementById(prefix + 'Desc').value, 
        type: type, 
        source: type === 'EX' ? $('#exSourceSelect').val() : $('#inCodeSelect').val(),
        proj: $(`#${prefix}ProjSelect`).val(),
        status: true,
        isOp: false,
        isImprest: false
    };
    
    toggleLoading(true);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            let db = getData();
            
            if (isEdit) {
                const existingIndex = db.findIndex(item => item.id === currentId);
                if (existingIndex !== -1) {
                    db[existingIndex] = data;
                }
            } else {
                db.push(data);
            }
            
            setDataCache(db);
            showToast(isEdit ? "✅ ගනුදෙනුව සාර්ථකව යාවත්කාලීන කරන ලදී!" : "✅ නව ගනුදෙනුව සාර්ථකව ගිණුම්ගත කරන ලදී!");
        } else {
            throw new Error(result.message || 'Save failed');
        }
    } catch (error) {
        console.error("Save error:", error);
        
        if (navigator.onLine) {
            showToast("❌ දත්ත පරික්ෂා කර බලා නැවත උත්සාහ කරන්න.");
        } else {
            let db = getData();
            
            if (isEdit) {
                const existingIndex = db.findIndex(item => item.id === currentId);
                if (existingIndex !== -1) {
                    db[existingIndex] = { ...data, offline: true };
                }
            } else {
                db.push({ ...data, offline: true });
            }
            
            setDataCache(db);
            showToast("⚠️ දත්ත පරිගණකය තුළ ගබඩා කරන ලදී! අන්තර්ජාලයට සම්බන්ධ වූ විට සමමුහුර්ත වේ.");
        }
    } finally {
        toggleLoading(false);
    }
    
    refreshDashboard();
    loadRecentTable();
    resetForms();
    document.getElementById('btn-save-' + prefix).innerText = 
        type === 'IN' ? "ලැබීම ගිණුම්ගත කරන්න" : "ගෙවීම ගිණුම්ගත කරන්න";
}

async function saveOpening() {
    if(userRole === 'GUEST') {
        showToast("❌ ආරම්භක ශේෂයන් වෙනස් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    const code = $('#opCodeSelect').val();
    const amt = parseAmount(document.getElementById('opAmt').value || 0);
    
    if(!code || code === "") {
        showToast("⚠️ කරුණාකර අරමුදල් කේතය තෝරන්න");
        $('#opCodeSelect').select2('open');
        return;
    }
    
    if(amt <= 0) {
        showToast("⚠️ මුදල ඇතුළත් කරන්න");
        document.getElementById('opAmt').focus();
        return;
    }
    
    toggleLoading(true);
    
    const data = { 
        action: 'save_transaction', 
        id: Date.now(), 
        date: "2024-01-01", 
        ref: 'OPENING', 
        vouch: '', 
        code: code, 
        amt: amt, 
        desc: 'ආරම්භක ශේෂය', 
        type: 'IN', 
        source: code, 
        isOp: true, 
        status: true,
        isImprest: false
    };
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            let db = getData();
            db.push(data);
            setDataCache(db);
            showToast("✅ ආරම්භක ශේෂය ගිණුම්ගත කෙරිණි!");
        } else {
            throw new Error(result.message || 'Save failed');
        }
    } catch (error) {
        console.error("Opening save error:", error);
        showToast("❌ දත්ත සුරැකීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
    
    refreshDashboard();
    document.getElementById('opAmt').value = '';
}

// Updated saveAllocation function to handle both S and EX codes
async function saveAllocation() {
    if(userRole === 'GUEST') {
        showToast("❌ ප්‍රතිපාදන ගිණුම්ගත කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    const code = $('#allocCodeSelect').val();
    const amt = parseAmount(document.getElementById('allocAmt').value || 0);
    const type = $('#allocTypeSelect').val(); // 'IN' for S codes, 'EX' for EX codes
    
    if(!code || code === "") {
        showToast("⚠️ කරුණාකර කේතය තෝරන්න");
        $('#allocCodeSelect').select2('open');
        return;
    }
    
    if(amt <= 0) {
        showToast("⚠️ වලංගු මුදලක් ඇතුළත් කරන්න");
        document.getElementById('allocAmt').focus();
        return;
    }
    
    toggleLoading(true);
    
    const data = {
        action: 'save_allocation',
        allocCode: code,
        allocAmt: amt,
        allocType: type
    };
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            allocations[code] = amt; 
            allocations[code + '_type'] = type; // Store type info
            setAllocationsCache(allocations);
            showToast(`✅ ${type === 'IN' ? 'ලැබීම්' : 'ගෙවීම්'} ප්‍රතිපාදන ගිණුම්ගත කරන ලදී!`);
            
            // Refresh both budget reports if they're currently displayed
            if (currentReport === 'BUDGET_VS_INCOME' || currentReport === 'VARIANCE') {
                generateReport();
            }
        } else {
            throw new Error(result.message || 'Save failed');
        }
    } catch (error) {
        console.error("Allocation save error:", error);
        showToast("❌ ප්‍රතිපාදන සුරැකීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
        document.getElementById('allocAmt').value = '';
    }
}

// ============ Open Report Function ============
function openReport(type) {
    currentReport = type;
    showSec('report');
    
    // Update active state for sub-nav items
    document.querySelectorAll('.sub-nav').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and highlight the clicked sub-nav
    const subNavs = document.querySelectorAll('.sub-nav');
    subNavs.forEach(item => {
        if (item.getAttribute('onclick')?.includes(type)) {
            item.classList.add('active');
        }
    });
    
    const filterBox = document.getElementById('filter-box');
    if (type === 'IN' || type === 'EX') {
        filterBox.style.display = 'block';
        populateReportFilter(type);
    } else {
        filterBox.style.display = 'none';
    }
    
    const bankBalBox = document.getElementById('bank-bal-box');
    if(type === 'BANK') {
        bankBalBox.style.display = 'block';
    } else {
        bankBalBox.style.display = 'none';
    }
    
    generateReport();
}

function populateReportFilter(type) {
    const filterSelect = document.getElementById('repFilter');
    filterSelect.innerHTML = '<option value="ALL">සියලුම කේතයන්</option>';
    
    const codes = (type === 'IN') ? S_CODES : EX_CODES;
    codes.forEach(c => {
        filterSelect.innerHTML += `<option value="${c}">${c} - ${CODE_INFO[c]}</option>`;
    });
}

function viewCodeDetails(code, type) {
    const allData = getAllExpenseDataForReports();
    const from = document.getElementById('repFrom').value;
    const to = document.getElementById('repTo').value;
    
    let incomeTransactions = [];
    let sourceCodesUsed = {};
    let expenseCodesUsed = {};
    
    let openingBalance = 0;
    let openingTransactions = [];
    
    if (type === 'IN') {
        openingTransactions = allData.filter(r => r.isOp && (r.code === code || r.source === code));
        openingBalance = openingTransactions.reduce((sum, r) => sum + r.amt, 0);
    }
    
    const currentIncomeTransactions = allData.filter(r => {
        if (type === 'IN') {
            return !r.isOp && 
                   r.type === 'IN' && 
                   (r.code === code || r.source === code) && 
                   (!from || r.date >= from) && 
                   (!to || r.date <= to);
        } else {
            return r.code === code && 
                   r.type === 'IN' && 
                   (!from || r.date >= from) && 
                   (!to || r.date <= to);
        }
    });
    
    const expenseTransactions = allData.filter(r => {
        if (type === 'EX') {
            return r.code === code && 
                   r.type === 'EX' && 
                   (!from || r.date >= from) && 
                   (!to || r.date <= to);
        } else {
            return r.source === code && 
                   r.type === 'EX' && 
                   (!from || r.date >= from) && 
                   (!to || r.date <= to);
        }
    });
    
    const currentIncomeTotal = currentIncomeTransactions.reduce((sum, t) => sum + t.amt, 0);
    const totalIncome = openingBalance + currentIncomeTotal;
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amt, 0);
    const balance = totalIncome - totalExpense;
    
    if (type === 'EX') {
        expenseTransactions.forEach(tr => {
            if (tr.source && CODE_INFO[tr.source]) {
                if (!sourceCodesUsed[tr.source]) {
                    sourceCodesUsed[tr.source] = {
                        code: tr.source,
                        name: CODE_INFO[tr.source],
                        total: 0,
                        transactions: []
                    };
                }
                sourceCodesUsed[tr.source].total += tr.amt;
                sourceCodesUsed[tr.source].transactions.push(tr);
            }
        });
    }
    
    if (type === 'IN') {
        expenseTransactions.forEach(tr => {
            if (tr.code && CODE_INFO[tr.code]) {
                if (!expenseCodesUsed[tr.code]) {
                    expenseCodesUsed[tr.code] = {
                        code: tr.code,
                        name: CODE_INFO[tr.code],
                        total: 0,
                        transactions: []
                    };
                }
                expenseCodesUsed[tr.code].total += tr.amt;
                expenseCodesUsed[tr.code].transactions.push(tr);
            }
        });
        
        incomeTransactions = [...openingTransactions, ...currentIncomeTransactions];
    }
    
    document.getElementById('modalCodeTitle').innerHTML = 
    '<span style="font-size: 15px; font-weight: bold;">' + 
    code + ' - ' + CODE_INFO[code] + 
    ' <span style="font-size: 10px; color: #666;">(' + (type === 'IN' ? 'ලැබීම්' : 'ගෙවීම්') + ')</span>' + 
    '</span>';
    
    let html = '<div style="margin-bottom: 20px;">';
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">';
    html += '<div style="background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">';
    html += '<div style="font-size: 12px; color: #155724;">මුළු ලැබීම්</div>';
    html += '<div style="font-size: 20px; font-weight: bold; color: green;">' + totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</div>';
    html += '</div>';
    html += '<div style="background: #f8d7da; padding: 12px; border-radius: 8px; text-align: center;">';
    html += '<div style="font-size: 12px; color: #721c24;">මුළු ගෙවීම්</div>';
    html += '<div style="font-size: 20px; font-weight: bold; color: red;">' + totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</div>';
    html += '</div>';
    html += '<div style="background: #d1ecf1; padding: 12px; border-radius: 8px; text-align: center;">';
    html += '<div style="font-size: 12px; color: #0c5460;">ශේෂය</div>';
    html += '<div style="font-size: 20px; font-weight: bold; color: ' + (balance >= 0 ? 'blue' : 'orange') + ';">' + balance.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</div>';
    html += '</div>';
    html += '</div>';
    
    if (type === 'EX' && Object.keys(sourceCodesUsed).length > 0) {
        html += '<h4 style="color: var(--primary); border-bottom: 1px solid var(--primary); padding-bottom: 3px; margin-top: 15px; font-size: 14px;">';
        html += '<span style="background: var(--primary); color: white; padding: 2px 6px; border-radius: 3px; margin-right: 8px; font-size: 6px;">💰</span>';
        html += 'වියදම් දරා ඇති ලැබීම් කේත (S Codes)';
        html += '</h4>';
        html += '<table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; font-size: 12px;">';
        html += '<thead><tr style="background: #e8f5e9;">';
        html += '<th style="padding: 6px; border: 1px solid #ddd; text-align: left; font-size: 11px;">ලැබීම් කේතය</th>';
        html += '<th style="padding: 6px; border: 1px solid #ddd; text-align: left; font-size: 11px;">විස්තරය</th>';
        html += '<th style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 11px;">මුළු වියදම (රු.)</th>';
        html += '<th style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 11px;">ගනුදෙනු</th>';
        html += '</tr></thead><tbody>';
        
        const sortedSourceCodes = Object.values(sourceCodesUsed).sort((a, b) => {
            return S_CODES.indexOf(a.code) - S_CODES.indexOf(b.code);
        });
        
        sortedSourceCodes.forEach(source => {
            html += '<tr style="border-bottom: 1px solid #eee;">';
            html += '<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2e7d32;">' + source.code + '</td>';
            html += '<td style="padding: 8px; border: 1px solid #ddd;">' + source.name + '</td>';
            html += '<td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #c62828;">';
            html += source.total.toLocaleString(undefined, {minimumFractionDigits: 2});
            html += '</td>';
            html += '<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">';
            html += '<span style="background: #6c757d; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">';
            html += source.transactions.length;
            html += '</span></td></tr>';
        });
        
        html += '</tbody><tfoot>';
        html += '<tr style="background: #d4edda; font-weight: bold;">';
        html += '<td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;">මුළු වියදම:</td>';
        html += '<td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #c62828; font-size: 1px;">';
        html += Object.values(sourceCodesUsed).reduce((sum, s) => sum + s.total, 0).toLocaleString(undefined, {minimumFractionDigits: 2});
        html += '</td>';
        html += '<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">';
        html += expenseTransactions.length;
        html += '</td></tr></tfoot></table>';
    }
    
    if (type === 'IN' && Object.keys(expenseCodesUsed).length > 0) {
        html += '<h4 style="color: var(--primary); border-bottom: 1px solid var(--primary); padding-bottom: 3px; margin-top: 15px;font-size: 14px;">';
        html += '<span style="background: var(--primary); color: white; padding: 2px 6px; border-radius: 3px; margin-right: 8px;font-size: 12px;">💸</span>';
        html += 'මෙම ලැබීම් කේතයෙන් ගෙවා ඇති වියදම් කේත (EX Codes)';
        html += '</h4>';
        html += '<table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px;font-size: 12px;">';
        html += '<thead><tr style="background: #fdeaea;">';
        html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;font-size: 11px;">ගෙවීම් කේතය</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;font-size: 11px;">විස්තරය</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: right;font-size: 11px;">මුළු වියදම (රු.)</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: center;font-size: 11px;">ගනුදෙනු</th>';
        html += '</tr></thead><tbody>';
        
        const sortedExpenseCodes = Object.values(expenseCodesUsed).sort((a, b) => {
            return EX_CODES.indexOf(a.code) - EX_CODES.indexOf(b.code);
        });
        
        sortedExpenseCodes.forEach(expCode => {
            html += '<tr style="border-bottom: 1px solid #eee;">';
            html += '<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #b71c1c;">' + expCode.code + '</td>';
            html += '<td style="padding: 8px; border: 1px solid #ddd;">' + expCode.name + '</td>';
            html += '<td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #c62828;">';
            html += expCode.total.toLocaleString(undefined, {minimumFractionDigits: 2});
            html += '</td>';
            html += '<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">';
            html += '<span style="background: #6c757d; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">';
            html += expCode.transactions.length;
            html += '</span></td></tr>';
        });
        
        html += '</tbody><tfoot>';
        html += '<tr style="background: #f5c6cb; font-weight: bold;">';
        html += '<td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;">මුළු වියදම:</td>';
        html += '<td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #c62828; font-size: 16px;">';
        html += Object.values(expenseCodesUsed).reduce((sum, e) => sum + e.total, 0).toLocaleString(undefined, {minimumFractionDigits: 2});
        html += '</td>';
        html += '<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">';
        html += expenseTransactions.length;
        html += '</td></tr></tfoot></table>';
    }
    
    if (type === 'IN') {
        html += '<h4 style="font-size: 13px;color: green; border-bottom: 2px solid #28a745; padding-bottom: 5px; margin-top: 20px;">';
        html += '<span style="background: #28a745; color: white; padding: 3px 8px; border-radius: 4px; margin-right: 10px;">✔</span>';
        html += 'ලැබීම් ගනුදෙනු';
        html += '</h4>';
        
        if (incomeTransactions.length === 0) {
            html += '<p style="text-align: center; color: #666; padding: 20px; background: #f8f9fa; border-radius: 8px;">ලැබීම් ගනුදෙනු කිසිවක් නැත</p>';
        } else {
            html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
            html += '<thead><tr style="background: #d4edda;">';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">දිනය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">විස්තරය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">ලදුපත් අංකය/පරාසය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">ව්‍යාපෘතිය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: right;">මුදල (රු.)</th>';
            html += '</tr></thead><tbody>';
            
            incomeTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(tr => {
                let displayRef = tr.ref || '-';
                
                html += '<tr style="border-bottom: 1px solid #eee;">';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + tr.date + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + tr.desc + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + displayRef + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + (tr.proj || '-') + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: green;">' + tr.amt.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td>';
                html += '</tr>';
            });
            
            html += '</tbody><tfoot>';
            html += '<tr style="background: #c3e6cb; font-weight: bold;">';
            html += '<td colspan="4" style="padding: 10px; border: 1px solid #ddd; text-align: right;">ලැබීම් මුළු එකතුව:</td>';
            html += '<td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: green;">' + totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td>';
            html += '</tr></tfoot></table>';
        }
    }
    
    if (type === 'EX') {
        html += '<h4 style="font-size: 13px;color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 5px; margin-top: 20px;">';
        html += '<span style="background: #dc3545; color: white; padding: 3px 8px; border-radius: 4px; margin-right: 10px;">✗</span>';
        html += 'ගෙවීම් ගනුදෙනු';
        html += '</h4>';
        
        if (expenseTransactions.length === 0) {
            html += '<p style="text-align: center; color: #666; padding: 20px; background: #f8f9fa; border-radius: 8px;">ගෙවීම් ගනුදෙනු කිසිවක් නැත</p>';
        } else {
            html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
            html += '<thead><tr style="background: #f8d7da;">';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">දිනය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">විස්තරය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">වවුචර් අංකය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">ව්‍යාපෘතිය</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">මූලාශ්‍ර (S Code)</th>';
            html += '<th style="padding: 10px; border: 1px solid #ddd; text-align: right;">මුදල (රු.)</th>';
            html += '</tr></thead><tbody>';
            
            expenseTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(tr => {
                html += '<tr style="border-bottom: 1px solid #eee;">';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + tr.date + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + tr.desc + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + (tr.vouch || tr.ref || '-') + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd;">' + (tr.proj || '-') + '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2e7d32;">';
                html += (tr.source || '-');
                if (tr.source && CODE_INFO[tr.source]) {
                    html += '<br><small style="color: #666;">' + CODE_INFO[tr.source] + '</small>';
                }
                html += '</td>';
                html += '<td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: red;">' + tr.amt.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td>';
                html += '</tr>';
            });
            
            html += '</tbody><tfoot>';
            html += '<tr style="background: #f5c6cb; font-weight: bold;">';
            html += '<td colspan="5" style="padding: 10px; border: 1px solid #ddd; text-align: right;">ගෙවීම් මුළු එකතුව:</td>';
            html += '<td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: red;">' + totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td>';
            html += '</tr></tfoot></table>';
        }
    }
    
    html += '<div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-top: 30px; border-left: 5px solid #17a2b8;">';
    html += '<div style="display: flex; justify-content: space-between; align-items: center;">';
    html += '<div>';
    html += '<div style="font-size: 14px; color: #0c5460;">කේතය: <strong>' + code + '</strong></div>';
    html += '<div style="font-size: 14px; color: #0c5460; margin-top: 5px;">' + CODE_INFO[code] + '</div>';
    html += '</div>';
    html += '<div style="text-align: right;">';
    html += '<div style="font-size: 18px; font-weight: bold; color: ' + (balance >= 0 ? 'blue' : 'orange') + ';">';
    html += 'අවසාන ශේෂය: ' + balance.toLocaleString(undefined, {minimumFractionDigits: 2});
    html += '</div>';
    html += '<div style="font-size: 12px; color: #666; margin-top: 5px;">';
    html += '(ලැබීම් ' + totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2}) + ' - ගෙවීම් ' + totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2}) + ')';
    html += '</div>';
    html += '</div></div></div></div>';
    
    document.getElementById('codeDetailsContent').innerHTML = html;
    document.getElementById('codeDetailsModal').style.display = 'flex';
}

function closeCodeDetails() {
    document.getElementById('codeDetailsModal').style.display = 'none';
}

// ============ අලුත් කරන ලද generateReport ශ්‍රිතය ============
function generateReport() {
    const allData = getAllExpenseDataForReports();
    const db = getData();
    const from = document.getElementById('repFrom').value;
    const to = document.getElementById('repTo').value;
    const selectedCode = document.getElementById('repFilter').value; 
    let html = '';
    
    let filtered = allData.filter(r => !r.isOp && (!from || r.date >= from) && (!to || r.date <= to));

    if (currentReport === 'CASHBOOK') {
        // ... (මුදල් පොත සඳහා කේතය - වෙනසක් නැත) ...
        document.getElementById('report-header-title').innerText = "මුදල් පොත";
        document.getElementById('report-header-title').style.fontSize = "24px";
        document.getElementById('report-header-title').style.fontWeight = "bold";
        document.getElementById('report-header-title').style.color = "#0984e3";

        let allTransactions = db.filter(r => !r.isOp).sort((a, b) => new Date(a.date) - new Date(b.date));
        let initialOpBal = db.filter(r => r.isOp).reduce((a, c) => a + c.amt, 0);
        
        let runningBal = initialOpBal;
        let monthlyData = {};

        allTransactions.forEach(r => {
            let monthKey = r.date.substring(0, 7);
            if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
            monthlyData[monthKey].push(r);
        });

        html = `<table><thead><tr>
                    <th>දිනය</th>
                    <th>විස්තරය</th>
                    <th>ලදුපත්/වවුචර්</th>
                    <th>චෙක්පත් අංකය</th>
                    <th>ලැබීම් (+)</th>
                    <th>ගෙවීම් (-)</th>
                    <th>ශේෂය</th>
                </tr></thead><tbody>`;

        Object.keys(monthlyData).sort().forEach(month => {
            let monthInTotal = 0;
            let monthOutTotal = 0;
            let startBal = runningBal;

            let isWithinRange = (!from || month >= from.substring(0, 7)) && (!to || month <= to.substring(0, 7));

            if (isWithinRange) {
                html += `<tr style="background:#e3f2fd; font-weight:bold;">
                            <td colspan="6">ඉදිරියට ගෙන ආ ශේෂය (Balance B/F) - ${month}</td>
                            <td style="text-align:right">${startBal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>`;
            }

            monthlyData[month].forEach(r => {
                let amt = r.amt || 0;
                if (r.type === 'IN') {
                    runningBal += amt;
                    monthInTotal += amt;
                } else {
                    runningBal -= amt;
                    monthOutTotal += amt;
                }

                if (isWithinRange) {
                    if ((!from || r.date >= from) && (!to || r.date <= to)) {
                        let displayRef = r.type === 'IN' ? (r.ref || '-') : (r.vouch || '-');
                        
                        html += `<tr>
                                    <td>${r.date ? r.date.split('T')[0] : ''}</td>
                                    <td>${r.desc}</td>
                                    <td>${displayRef}</td>
                                    <td>${r.type === 'EX' ? (r.ref || '-') : '-'}</td>
                                    <td style="text-align:right; color:green;">${r.type === 'IN' ? amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                                    <td style="text-align:right; color:red;">${r.type === 'EX' ? amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                                    <td style="text-align:right; font-weight:bold">${runningBal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>`;
                    }
                }
            });

            if (isWithinRange) {
                html += `<tr style="background:#fff3e0; font-weight:bold; border-top: 1px solid #333;">
                            <td colspan="4" style="text-align:right">මාසික එකතුව සහ ශේෂය:</td>
                            <td style="text-align:right; color:green;">${monthInTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td style="text-align:right; color:red;">${monthOutTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td style="text-align:right"></td>
                        </tr>
                        <tr style="background:#f0f0f0; font-weight:bold;">
                            <td colspan="6" style="text-align:right">පහළට ගෙන ගිය ශේෂය (Balance C/D):</td>
                            <td style="text-align:right"> ${runningBal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr style="height:20px;"><td colspan="7" style="border:none;"></td></tr>`;
            }
        });

        html += '</tbody></table>';
        document.getElementById('report-content').innerHTML = html;
    } 
    else if (currentReport === 'IN' || currentReport === 'EX') {
        // ... (ලැබීම්/ගෙවීම් විශ්ලේෂණ වාර්තා සඳහා කේතය - වෙනසක් නැත) ...
        document.getElementById('report-header-title').innerText = 
            (currentReport === 'IN' ? "ලැබීම් විශ්ලේෂණ වාර්තාව" : "ගෙවීම් විශ්ලේෂණ වාර්තාව") + 
            (selectedCode !== 'ALL' ? ` - ${selectedCode}` : "");
     
        const codes = (selectedCode === 'ALL') ? 
            (currentReport === 'IN' ? S_CODES : EX_CODES) : 
            [selectedCode];
     
        const openingBalances = {};
        codes.forEach(code => {
            const openingAmt = allData.filter(r => r.isOp && r.source === code)
                .reduce((sum, r) => sum + r.amt, 0);
            openingBalances[code] = openingAmt;
        });
      
        html = `
        <table style="width: 100%; border-collapse: collapse; border: 2px solid ${currentReport === 'IN' ? '#28a745' : '#dc3545'}; margin-bottom: 30px;">
            <thead>
                <tr style="background: ${currentReport === 'IN' ? '#28a745' : '#dc3545'}; color: white;">
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">කේතය</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">විස්තරය</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">ආරම්භක ශේෂය (රු.)</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">ගනුදෙනු ගණන</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">මුළු ${currentReport === 'IN' ? 'ලැබීම්' : 'ගෙවීම්'} (රු.)</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">මුළු එකතුව (රු.)</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">ක්‍රියා</th>
                </tr>
            </thead>
            <tbody>`;
        
        let grandTotal = 0;
        let totalTransactions = 0;
        let totalOpening = 0;
        
        codes.forEach(code => {
            const transactions = allData.filter(r => 
                r.type === currentReport && 
                r.code === code && 
                (!from || r.date >= from) && 
                (!to || r.date <= to)
            );
            
            const codeTotal = transactions.reduce((sum, t) => sum + t.amt, 0);
            const transactionCount = transactions.length;
            const openingAmt = openingBalances[code] || 0;
            
            const effectiveOpeningAmt = currentReport === 'IN' ? openingAmt : 0;
            const grandTotalForCode = currentReport === 'IN' ? (effectiveOpeningAmt + codeTotal) : codeTotal;
            
            grandTotal += grandTotalForCode;
            totalTransactions += transactionCount;
            totalOpening += effectiveOpeningAmt;
            
            html += `
            <tr style="border-bottom: 1px solid #eee; ${transactionCount > 0 ? 'background: #f9f9f9;' : ''}">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: var(--primary);">${code}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${CODE_INFO[code]}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #006400; font-weight: bold;">
                    ${effectiveOpeningAmt > 0 ? effectiveOpeningAmt.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                    <span style="display: inline-block; background: ${transactionCount > 0 ? (currentReport === 'IN' ? '#28a745' : '#dc3545') : '#6c757d'}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
                        ${transactionCount}
                    </span>
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: ${currentReport === 'IN' ? 'green' : 'red'};">${codeTotal > 0 ? codeTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #1b5e20; background: #e8f5e9;">
                    ${grandTotalForCode > 0 ? grandTotalForCode.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                    <button onclick="viewCodeDetails('${code}', '${currentReport}')" 
                        style="background: ${currentReport === 'IN' ? 'var(--success)' : 'var(--danger)'}; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 auto; height: 36px; min-width: 100px; transition: all 0.3s;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 3px 10px rgba(0,0,0,0.15)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <span>🔍</span> විස්තර
                    </button>
                </td>
            </tr>`;
        });
        
        html += `
            </tbody>
            <tfoot>
                <tr style="background: ${currentReport === 'IN' ? '#d4edda' : '#f8d7da'}; font-weight: bold;">
                    <td colspan="2" style="padding: 12px; border: 1px solid #ddd; text-align: right;">මුළු එකතුව:</td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #006400;">
                        ${totalOpening > 0 ? totalOpening.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}
                    </td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                        <span style="display: inline-block; background: #343a40; color: white; padding: 4px 10px; border-radius: 12px;">
                            ${totalTransactions}
                        </span>
                    </td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: ${currentReport === 'IN' ? 'green' : 'red'};">
                        ${(grandTotal - totalOpening) > 0 ? (grandTotal - totalOpening).toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}
                    </td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #1b5e20; font-size: 18px; background: #c8e6c9;">
                        ${grandTotal > 0 ? grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}
                    </td>
                    <td style="padding: 12px; border: 1px solid #ddd;"></td>
                </tr>
            </tfoot>
        </table>`;
                
        document.getElementById('report-content').innerHTML = html;
    }
    
    else if(currentReport === 'BANK') {
        // ... (බැංකු සැසඳුම් ප්‍රකාශය සඳහා කේතය - වෙනසක් නැත) ...
        document.getElementById('report-header-title').innerText = "බැංකු සැසඳුම් ප්‍රකාශය";
        let bankStmtBal = parseAmount(document.getElementById('bankStmtInput').value || 0);
        
        let uncreditedList = db.filter(r => 
            r.type === 'IN' && 
            r.vouch && r.vouch.trim() !== '' &&
            r.isOp !== true &&
            (clearedStatus[r.id] || 'Pending') === 'Pending' &&
            (!from || r.date >= from) && 
            (!to || r.date <= to)
        );
        let totalUncredited = uncreditedList.reduce((a, b) => a + b.amt, 0);

        let unpresentedList = db.filter(r => 
            r.type === 'EX' && 
            r.ref && r.ref.trim() !== '' &&
            (clearedStatus[r.id] || 'Pending') === 'Pending' &&
            (!from || r.date >= from) && 
            (!to || r.date <= to)
        );
        let totalUnpresented = unpresentedList.reduce((a, b) => a + b.amt, 0);

        let adjustedBalance = bankStmtBal + totalUncredited - totalUnpresented;

        html = `
            <div style="background: #ffffff; padding: 20px; border: 2px solid #333; border-radius: 5px; color: #000;">
                <h3 style="text-align:center; text-decoration: underline;">බැංකු සැසඳුම් ප්‍රකාශය - ${to || 'අද දිනට'}</h3>
                <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 8px;"><b>බැංකු ප්‍රකාශය අනුව ශේෂය</b></td>
                        <td style="text-align:right; padding: 8px;"><b> ${bankStmtBal > 0 ? bankStmtBal.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</b></td>
                    </tr>
                    
                    <tr>
                        <td colspan="2" style="padding: 8px; color: #1b5e20;">
                            <b>එකතු කිරීම:</b> නිශ්කාෂණය නොවූ චෙක්පත් ලැබීම් (Uncredited Cheque Deposits)
                        </td>
                    </tr>`;
        
        if (uncreditedList.length > 0) {
            uncreditedList.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
                html += `<tr>
                    <td style="padding-left:40px; font-size: 0.9em;">
                        📅 ${r.date.split('T')[0]} - ${r.desc}<br>
                        <span style="color: #666; font-size: 0.85em;">චෙක්පත් අංකය: ${r.vouch || '-'} | ලදුපත් අංකය: ${r.ref || '-'}</span>
                        <span style="color: #f39c12; margin-left: 10px; font-size: 0.85em;">(Pending)</span>
                    </td>
                    <td style="text-align:right; padding-right: 20px; font-weight: bold; color: #27ae60;">
                        + ${r.amt > 0 ? r.amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                    </td>
                </tr>`;
            });
        } else {
            html += `<tr>
                <td style="padding-left:40px; font-size: 0.9em; color: #666;">නිශ්කාෂණය නොවූ චෙක්පත් ලැබීම් නැත</td>
                <td style="text-align:right; padding-right: 20px;">0.00</td>
            </tr>`;
        }

        html += `<tr>
                    <td style="padding-left:80px;"><b>මුළු නිශ්කාෂණය නොවූ චෙක්පත් ලැබීම් එකතුව</b></td>
                    <td style="text-align:right; border-top:1px solid #000; padding: 8px; font-weight: bold; color: #27ae60;">
                        + ${totalUncredited > 0 ? totalUncredited.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                    </td>
                </tr>
                <tr style="background:#f0f0f0;">
                    <td style="padding: 8px;"><b>උප එකතුව (Bank Balance + Uncredited Cheques)</b></td>
                    <td style="text-align:right; padding: 8px;"><b> 
                        ${(bankStmtBal + totalUncredited) > 0 ? (bankStmtBal + totalUncredited).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                    </b></td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 8px; color: #b71c1c;">
                        <b>අඩු කිරීම:</b> ඉදිරිපත් නොවූ චෙක්පත් (Unpresented Cheques)
                    </td>
                </tr>`;

        if (unpresentedList.length > 0) {
            unpresentedList.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
                html += `<tr>
                    <td style="padding-left:40px; font-size: 0.9em;">
                        📅 ${r.date.split('T')[0]} - ${r.desc}<br>
                        <span style="color: #666; font-size: 0.85em;">චෙක්පත් අංකය: ${r.ref || '-'} | වවුචර් අංකය: ${r.vouch || '-'}</span>
                        <span style="color: #f39c12; margin-left: 10px; font-size: 0.85em;">(Pending)</span>
                    </td>
                    <td style="text-align:right; padding-right: 20px; font-weight: bold; color: #c0392b;">
                        - ${r.amt > 0 ? r.amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                    </td>
                </tr>`;
            });
        } else {
            html += `<tr>
                <td style="padding-left:40px; font-size: 0.9em; color: #666;">ඉදිරිපත් නොවූ චෙක්පත් නැත</td>
                <td style="text-align:right; padding-right: 20px;">0.00</td>
            </tr>`;
        }

        html += `<tr>
                    <td style="padding-left:80px;"><b>මුළු ඉදිරිපත් නොකළ චෙක්පත් එකතුව</b></td>
                    <td style="text-align:right; border-top:1px solid #000; padding: 8px; font-weight: bold; color: #c0392b;">
                        - ${totalUnpresented > 0 ? totalUnpresented.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                    </td>
                </tr>
                <tr style="border-bottom: 4px double #000; background: #fff8e1;">
                    <td style="padding: 12px;"><b style="font-size:1.2em;">මුදල් පොතේ ශේෂය (Cash Book Balance)</b></td>
                    <td style="text-align:right; padding: 12px;"><b style="font-size:1.2em; color: #1b5e20;"> 
                        ${adjustedBalance > 0 ? adjustedBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                    </b></td>
                </tr>
                <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; font-size: 0.85em; color: #666; border-top: 1px dashed #999;">
                        <i class="fas fa-calculator"></i> ගණනය කිරීම: බැංකු ශේෂය ${bankStmtBal.toLocaleString(undefined, {minimumFractionDigits: 2})} 
                        + නිශ්කාෂණය නොවූ චෙක්පත් ලැබීම් ${totalUncredited.toLocaleString(undefined, {minimumFractionDigits: 2})} 
                        - ඉදිරිපත් නොවූ චෙක්පත් ${totalUnpresented.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                </tr>
            </table>
        </div>`;

        if(userRole === 'ADMIN' || userRole === 'STAFF') {
            html += `
            <div class="no-print" style="margin-top:40px;">
                <hr style="border: 1px solid #1b5e20;">
                <h4 style="color: var(--primary); display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-money-check-alt"></i> චෙක්පත් තත්ත්වය යාවත්කාලීන කරන්න (Pending Cheques Only)
                </h4>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 0.95em; color: #1b5e20;">
                        <i class="fas fa-info-circle"></i> 
                        මෙහි පෙන්වන්නේ <strong>Pending</strong> තත්ත්වයේ පවතින චෙක්පත් ගනුදෙනු පමණි.
                    </p>
                </div>
                <table class="q-table">
                    <thead>
                        <tr>
                            <th>දිනය</th>
                            <th>විස්තරය</th>
                            <th>චෙක්පත් අංකය</th>
                            <th>වවුචර් අංකය</th>
                            <th>මුදල (රු.)</th>
                            <th>ගෙවීම් කේතය</th>
                            <th>මූලාශ්‍ර අරමුදල</th>
                            <th>තත්ත්වය</th>
                        </tr>
                    </thead>
                    <tbody>`;

            let pendingCheques = db.filter(r => 
                r.type === 'EX' && 
                r.ref && r.ref.trim() !== '' &&
                (clearedStatus[r.id] || 'Pending') === 'Pending' &&
                (!from || r.date >= from) && 
                (!to || r.date <= to)
            );

            if (pendingCheques.length > 0) {
                pendingCheques.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
                    let status = clearedStatus[r.id] || 'Pending';
                    html += `<tr>
                        <td>${r.date.split('T')[0]}</td>
                        <td>${r.desc}</td>
                        <td><span style="background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-family: monospace;">${r.ref || '-'}</span></td>
                        <td>${r.vouch || '-'}</td>
                        <td style="text-align: right; font-weight: bold; color: #c0392b;">${r.amt > 0 ? r.amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
                        <td>${r.code || '-'}</td>
                        <td>${r.source || '-'}</td>
                        <td>
                            <select class="status-select ${status === 'Cleared' ? 'status-cleared' : 'status-pending'}" 
                                    onchange="updateClearedChequeStatus('${r.id}', this.value, '${r.date}', '${r.ref}', '${r.amt}', '${r.desc}')"
                                    style="padding: 6px; border-radius: 4px; font-size: 12px;">
                                <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                                <option value="Cleared" ${status === 'Cleared' ? 'selected' : ''}>✅ Cleared</option>
                            </select>
                        </td>
                    </tr>`;
                });
            } else {
                html += `<tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: #666;">
                        <i class="fas fa-check-circle" style="color: #27ae60; font-size: 30px; margin-bottom: 10px;"></i><br>
                        <span style="font-size: 16px; font-weight: bold;">Pending තත්ත්වයේ චෙක්පත් කිසිවක් නැත</span><br>
                        <span style="font-size: 14px;">සියලුම චෙක්පත් නිශ්කාෂණය වී ඇත.</span>
                    </td>
                </tr>`;
            }

            html += `</tbody></table></div>`;
        } else {
            html += `
            <div style="margin-top:40px;">
                <hr style="border: 1px solid #1b5e20;">
                <h4 style="color: var(--primary);"><i class="fas fa-money-check-alt"></i> චෙක්පත් තත්ත්වය (Pending Cheques)</h4>
                <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 0.9em; color: #856404;">
                        <i class="fas fa-info-circle"></i> පෙන්වනු ලබන්නේ Pending තත්ත්වයේ චෙක්පත් පමණි
                    </p>
                </div>
                <table class="q-table">
                    <thead>
                        <tr>
                            <th>දිනය</th>
                            <th>විස්තරය</th>
                            <th>චෙක්පත් අංකය</th>
                            <th>වවුචර් අංකය</th>
                            <th>මුදල (රු.)</th>
                            <th>ගෙවීම් කේතය</th>
                            <th>මූලාශ්‍ර අරමුදල</th>
                            <th>තත්ත්වය</th>
                        </tr>
                    </thead>
                    <tbody>`;

            let pendingCheques = db.filter(r => 
                r.type === 'EX' && 
                r.ref && r.ref.trim() !== '' &&
                (clearedStatus[r.id] || 'Pending') === 'Pending' &&
                (!from || r.date >= from) && 
                (!to || r.date <= to)
            );

            if (pendingCheques.length > 0) {
                pendingCheques.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
                    html += `<tr>
                        <td>${r.date.split('T')[0]}</td>
                        <td>${r.desc}</td>
                        <td><span style="background: #f0f0f0; padding: 3px 8px; border-radius: 4px;">${r.ref || '-'}</span></td>
                        <td>${r.vouch || '-'}</td>
                        <td style="text-align: right; font-weight: bold; color: #c0392b;">${r.amt > 0 ? r.amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
                        <td>${r.code || '-'}</td>
                        <td>${r.source || '-'}</td>
                        <td><span class="status-badge status-pending" style="background: #fff3cd; color: #856404; padding: 5px 10px; border-radius: 20px;">⏳ Pending</span></td>
                    </tr>`;
                });
            } else {
                html += `<tr>
                    <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                        <i class="fas fa-check-circle" style="color: #27ae60;"></i> 
                        Pending තත්ත්වයේ චෙක්පත් කිසිවක් නැත.
                    </td>
                </tr>`;
            }
            html += `</tbody></table></div>`;
        }
    }
    // ============ ප්‍රතිපාදන හා ගෙවීම් සැසඳුම (VARIANCE) - නවීකරණය කරන ලදී ============
    else if (currentReport === 'VARIANCE') {
        document.getElementById('report-header-title').innerText = "ප්‍රතිපාදන හා ගෙවීම් සැසඳුම";
        
        html = '<table class="q-table" style="width:100%; border-collapse:collapse;">';
        html += '<thead><tr style="background:var(--primary); color:white;">';
        html += '<th>ගෙවීම් කේතය</th>';
        html += '<th>විස්තරය</th>';
        html += '<th style="text-align:right;">වාර්ෂික ප්‍රතිපාදන (රු.)</th>';
        html += '<th style="text-align:right;">සැබෑ ගෙවීම් (රු.)</th>';
        html += '<th style="text-align:right;">ශේෂය (රු.)</th>';
        html += '<th style="text-align:center;">භාවිත %</th>';
        html += '</tr></thead><tbody>';
        
        let totalAlloc = 0, totalExpense = 0;
        let anyData = false;
        
        EX_CODES.forEach(code => {
            const expense = allData.filter(r => r.type === 'EX' && r.code === code && (!from || r.date >= from) && (!to || r.date <= to))
                                   .reduce((sum, r) => sum + r.amt, 0);
            const alloc = allocations[code] || 0;
            const balance = alloc - expense;
            const perc = alloc > 0 ? ((expense / alloc) * 100).toFixed(1) : (expense > 0 ? '100' : '0');
            
            if (expense > 0 || alloc > 0) anyData = true;
            
            totalAlloc += alloc;
            totalExpense += expense;
            
            html += `<tr>
                <td><b>${code}</b></td>
                <td>${CODE_INFO[code]}</td>
                <td style="text-align:right;">${alloc > 0 ? alloc.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                <td style="text-align:right; color:red;">${expense > 0 ? expense.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                <td style="text-align:right; font-weight:bold; color:${balance >= 0 ? '#1b5e20' : '#c0392b'};">${balance !== 0 ? balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                <td style="text-align:center;">${perc}%</td>
            </tr>`;
        });
        
        if (!anyData) {
            html += `<tr><td colspan="6" style="text-align:center; padding:20px;">⚠️ මෙම කාල සීමාව තුළ දත්ත නොමැත</td></tr>`;
        }
        
        html += `<tr class="q-total-row" style="background:#f0f0f0; font-weight:bold;">
            <td colspan="2" style="text-align:right;">මුළු එකතුව</td>
            <td style="text-align:right;">${totalAlloc > 0 ? totalAlloc.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
            <td style="text-align:right; color:red;">${totalExpense > 0 ? totalExpense.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
            <td style="text-align:right;">${(totalAlloc - totalExpense).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td style="text-align:center;"></td>
        </tr>`;
        html += '</tbody></table>';
        
        document.getElementById('report-content').innerHTML = html;
    }
    // ============ ප්‍රතිපාදන හා ලැබීම් සැසඳුම (BUDGET_VS_INCOME) - නවීකරණය කරන ලදී ============
    else if (currentReport === 'BUDGET_VS_INCOME') {
        document.getElementById('report-header-title').innerText = "ප්‍රතිපාදන හා ලැබීම් සැසඳුම";
        
        html = '<table class="q-table" style="width:100%; border-collapse:collapse;">';
        html += '<thead><tr style="background:var(--primary); color:white;">';
        html += '<th>ලැබීම් කේතය</th>';
        html += '<th>විස්තරය</th>';
        html += '<th style="text-align:right;">වාර්ෂික ප්‍රතිපාදන (රු.)</th>';
        html += '<th style="text-align:right;">සැබෑ ලැබීම් (රු.)</th>';
        html += '<th style="text-align:right;">ශේෂය (රු.)</th>';
        html += '<th style="text-align:center;">භාවිත %</th>';
        html += '</tr></thead><tbody>';
        
        let totalBudget = 0;
        let totalIncome = 0;
        let anyData = false;
        
        S_CODES.forEach(code => {
            // ලැබීම් ගණනය කිරීම
            const incomeTransactions = allData.filter(r => 
                r.type === 'IN' && 
                (r.code === code || r.source === code) && 
                (!from || r.date >= from) && 
                (!to || r.date <= to)
            );
            const income = incomeTransactions.reduce((sum, r) => sum + r.amt, 0);
            const transactionCount = incomeTransactions.length;
            
            // ලැබීම් කේත සඳහා ප්‍රතිපාදන (S Codes වලට allocations තිබේ නම්)
            const budget = allocations[code] || 0;
            const balance = budget - income; // ඉතිරි ප්‍රතිපාදන
            const perc = budget > 0 ? ((income / budget) * 100).toFixed(1) : (income > 0 ? '100' : '0');
            
            if (income > 0 || budget > 0 || transactionCount > 0) anyData = true;
            
            totalBudget += budget;
            totalIncome += income;
            
            html += `<tr>
                <td><b>${code}</b></td>
                <td>${CODE_INFO[code]}</td>
                <td style="text-align:right;">${budget > 0 ? budget.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
                <td style="text-align:right; color:green;">${income > 0 ? income.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
                <td style="text-align:right; font-weight:bold; color:${balance >= 0 ? '#1b5e20' : '#c0392b'};">${balance !== 0 ? balance.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
                <td style="text-align:center;">${perc}%</td>
            </tr>`;
        });
        
        if (!anyData) {
            html += `<tr><td colspan="6" style="text-align:center; padding:20px;">⚠️ මෙම කාල සීමාව තුළ දත්ත නොමැත</td></tr>`;
        }
        
        html += `<tr class="q-total-row" style="background:#f0f0f0; font-weight:bold;">
            <td colspan="2" style="text-align:right;">මුළු එකතුව</td>
            <td style="text-align:right;">${totalBudget > 0 ? totalBudget.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
            <td style="text-align:right; color:green;">${totalIncome > 0 ? totalIncome.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
            <td style="text-align:right;">${(totalBudget - totalIncome).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td style="text-align:center;"></td>
        </tr>`;
        html += '</tbody></table>';
        
        document.getElementById('report-content').innerHTML = html;
    }
    
    else if(currentReport === 'QUARTER') {
        // ... (සිව්මස් ගිණුම් වාර්තාව සඳහා කේතය - වෙනසක් නැත) ...
        document.getElementById('report-header-title').innerText = "සිව්මස් ගිණුම් වාර්තාව";
        
        const fromDate = new Date(document.getElementById('repFrom').value);
        const toDate = new Date(document.getElementById('repTo').value);
        const yearStart = new Date(fromDate.getFullYear(), 0, 1); 

        let opBalTotal = allData.filter(r => r.isOp).reduce((a, b) => a + b.amt, 0);
        let tinTotal = opBalTotal, texTotal = 0;

        html = `<table class="q-table">
            <thead>
                <tr>
                    <th colspan="5" class="q-header">ලැබීම් (හර)</th>
                    <th colspan="5" class="q-header">ගෙවීම් (බැර)</th>
                </tr>
                <tr>
                    <th>කේතය</th>
                    <th>වාර්ෂික ඇස්තමේන්තුව</th>
                    <th>පෙර සිව්මස දක්වා</th>
                    <th>මෙම සිව්මස</th>
                    <th>මුළු එකතුව</th>
                    <th>කේතය</th>
                    <th>වාර්ෂික ප්‍රතිපාදන</th>
                    <th>පෙර සිව්මස දක්වා</th>
                    <th>මෙම සිව්මස</th>
                    <th>මුළු එකතුව</th>
                </tr>
            </thead>
            <tbody>`;

        const maxLength = Math.max(S_CODES.length, EX_CODES.length);

        for (let i = 0; i < maxLength; i++) {
            let s = S_CODES[i] || '';
            let ex = EX_CODES[i] || '';
            let sOp = s ? allData.filter(r => r.isOp && r.source === s).reduce((a, b) => a + b.amt, 0) : 0;
            let sPrev = s ? allData.filter(r => r.type === 'IN' && !r.isOp && r.source === s && new Date(r.date) < fromDate).reduce((a, b) => a + b.amt, 0) : 0;
            let sCurr = s ? allData.filter(r => r.type === 'IN' && r.source === s && new Date(r.date) >= fromDate && new Date(r.date) <= toDate).reduce((a, b) => a + b.amt, 0) : 0;
            let sTotalPrev = sOp + sPrev;
            let exPrev = ex ? allData.filter(r => r.type === 'EX' && r.code === ex && new Date(r.date) < fromDate && new Date(r.date) >= yearStart).reduce((a, b) => a + b.amt, 0) : 0;
            let exCurr = ex ? allData.filter(r => r.type === 'EX' && r.code === ex && new Date(r.date) >= fromDate && new Date(r.date) <= toDate).reduce((a, b) => a + b.amt, 0) : 0;
            tinTotal += (sPrev + sCurr); 
            texTotal += (exPrev + exCurr);
            html += `<tr>
                <td>${s}</td>
                <td class="val-col"> - </td>
                <td class="val-col">${sTotalPrev > 0 ? sTotalPrev.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
                <td class="val-col">${sCurr > 0 ? sCurr.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
                <td class="val-col" style="background:#f9f9f9">${(sTotalPrev + sCurr) > 0 ? (sTotalPrev + sCurr).toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
                
                <td>${ex}</td>
                <td class="val-col">${(allocations[ex] || 0) > 0 ? allocations[ex].toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
                <td class="val-col">${exPrev > 0 ? exPrev.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
                <td class="val-col">${exCurr > 0 ? exCurr.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
                <td class="val-col" style="background:#f9f9f9">${(exPrev + exCurr) > 0 ? (exPrev + exCurr).toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
            </tr>`;
        } 

        html += `<tr class="q-total-row">
            <td colspan="4">මුළු ලැබීම් එකතුව (ආරම්භක ශේෂය සහිතව)</td>
            <td class="val-col">${tinTotal > 0 ? tinTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
            <td colspan="4">මුළු ගෙවීම් එකතුව</td>
            <td class="val-col">${texTotal > 0 ? texTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
        </tr>
        <tr class="q-total-row">
            <td colspan="9" style="text-align:right">අතැති ශේෂය (Balance)</td>
            <td class="val-col" style="background:var(--gold)">${(tinTotal - texTotal) > 0 ? (tinTotal - texTotal).toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
        </tr>
        </tbody></table>`;
    } 
    
    else {
        // ... (වෙනත් වාර්තා සඳහා කේතය - වෙනසක් නැත) ...
        document.getElementById('report-header-title').innerText = currentReport === 'IN' ? "ලැබීම් විශ්ලේෂණ වාර්තාව" : "ගෙවීම් විශ්ලේෂණ වාර්තාව";
        const codes = selectedCode === 'ALL' ? (currentReport === 'IN' ? S_CODES : EX_CODES) : [selectedCode];
        
        if (currentReport === 'IN') {
            html = '<table><tr><th>කේතය</th><th>විස්තරය</th><th style="text-align:right;">මුළු ලැබීම් (රු.)</th><th style="text-align:right;">වැය කළ වියදම (රු.)</th><th style="text-align:right;">ශේෂය (රු.)</th></tr>';
        } else {
            html = '<table><tr><th>කේතය</th><th>විස්තරය</th><th style="text-align:right;">මුදල (රු.)</th></tr>';
        }

        let totalIn = 0, totalEx = 0;

        codes.forEach(c => { 
            const incomeAmt = allData.filter(r => {
                const isCorrectType = r.type === 'IN';
                const isCorrectCode = (r.code === c || r.source === c);
                const isWithinDate = (!from || r.date >= from) && (!to || r.date <= to);
                return isCorrectType && isCorrectCode && (isWithinDate || r.isOp === true);
            }).reduce((a, b) => a + b.amt, 0);

            if (currentReport === 'IN') {
                const expenseAmt = allData.filter(r => r.type === 'EX' && r.source === c && (!from || r.date >= from) && (!to || r.date <= to)).reduce((a, b) => a + b.amt, 0);
                const balance = incomeAmt - expenseAmt;
                html += `<tr><td><b>${c}</b></td><td>${CODE_INFO[c]}</td><td class="val-col">${incomeAmt > 0 ? incomeAmt.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td><td class="val-col" style="color:red;">${expenseAmt > 0 ? expenseAmt.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td><td class="val-col" style="font-weight:bold;">${balance > 0 ? balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td></tr>`;
                totalIn += incomeAmt;
                totalEx += expenseAmt;
            } else {
                html += `<tr><td><b>${c}</b></td><td>${CODE_INFO[c]}</td><td class="val-col">${incomeAmt > 0 ? incomeAmt.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td></tr>`;
                totalIn += incomeAmt;
            }
        });

        if (currentReport === 'IN') {
            html += `<tr style="background:#f1f2f6; font-weight:bold;"><td colspan="2">මුළු එකතුව</td><td class="val-col"> ${totalIn > 0 ? totalIn.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td><td class="val-col" style="color:red;">රු. ${totalEx > 0 ? totalEx.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td><td class="val-col">රු. ${(totalIn - totalEx) > 0 ? (totalIn - totalEx).toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td></tr></table>`;
        } else {
            html += `<tr style="background:#f1f2f6; font-weight:bold;"><td colspan="2">මුළු එකතුව</td><td class="val-col"> ${totalIn > 0 ? totalIn.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td></tr></table>`;
        }
    }

    html += `<div class="print-signatures">
                <div style="width: 33%; text-align: center;">
                    <p>....................................</p>
                    <p><b>පරීක්ෂා කළේ</b></p>
                </div>
                <div style="width: 33%; text-align: center;">
                    <p>....................................</p>
                    <p><b>භාණ්ඩාගාරික</b></p>
                </div>
                <div style="width: 33%; text-align: center;">
                    <p>....................................</p>
                    <p><b>විදුහල්පති</b></p>
                </div>
            </div>`;
    
    document.getElementById('report-content').innerHTML = html;
    document.getElementById('report-date-range').innerText = `කාලසීමාව: ${(from || "ආරම්භය")} සිට ${(to || "අද")} දක්වා`;
}

async function updateClearedChequeStatus(id, status, date, ref, amt, desc) {
    if(userRole === 'GUEST') {
        showToast("❌ චෙක්පත් තත්ත්වය වෙනස් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    const confirm = await showConfirmDialog(
        "✓ චෙක්පත් තත්ත්වය වෙනස් කරන්න",
        `ID: ${id}\nචෙක්පත් අංකය: ${ref}\nමුදල: Rs. ${parseFloat(amt).toFixed(2)}\n\nතත්ත්වය "${status}" ලෙස වෙනස් කරන්නද?`,
        "ඔව්, වෙනස් කරන්න",
        "අවලංගු කරන්න"
    );
    
    if (!confirm) {
        generateReport();
        return;
    }
    
    toggleLoading(true);
    
    clearedStatus[id] = status;
    sessionStorage.setItem('sch_cleared', JSON.stringify(clearedStatus));
    
    let db = getData();
    let transactionIndex = db.findIndex(t => t.id == id);
    if (transactionIndex !== -1) {
        db[transactionIndex].status = (status === 'Cleared');
        setDataCache(db);
    }
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'update_cheque_status',
                id: id,
                status: status === 'Cleared' ? true : false,
                date: date,
                ref: ref,
                amt: parseFloat(amt),
                desc: desc
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast(`✅ චෙක්පත ${status} ලෙස යාවත්කාලීන කරන ලදී!`);
        } else {
            throw new Error(result.message || 'Server update failed');
        }
    } catch (error) {
        console.error("Cheque status update error:", error);
        
        if (navigator.onLine) {
            showToast("❌ සර්වර් එකට සම්බන්ධ වීමට නොහැකි විය. පසුව නැවත උත්සාහ කරන්න.");
        } else {
            showToast("⚠️ ඔබ දැන් OFFLINE. අන්තර්ජාලය සම්බන්ධ වූ පසු සමමුහුර්ත වේ.");
            let offlineUpdates = JSON.parse(sessionStorage.getItem('sch_offline_updates') || '[]');
            offlineUpdates.push({
                action: 'update_cheque_status',
                id: id,
                status: status === 'Cleared' ? true : false,
                timestamp: new Date().toISOString()
            });
            sessionStorage.setItem('sch_offline_updates', JSON.stringify(offlineUpdates));
        }
    } finally {
        toggleLoading(false);
        generateReport();
    }
}

function updateClearedStatus(id, val) {
    if(userRole === 'GUEST') {
        showToast("❌ චෙක්පත් තත්ත්වය වෙනස් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    clearedStatus[id] = val;
    sessionStorage.setItem('sch_cleared', JSON.stringify(clearedStatus));
    generateReport();
    showToast("✅ චෙක්පත් තත්ත්වය යාවත්කාලීන කරන ලදී!");
}

async function refreshDashboard() {
    const db = getData();
    const tin = db.filter(r => r.type === 'IN').reduce((a,b) => a + b.amt, 0);
    const tex = db.filter(r => r.type === 'EX').reduce((a,b) => a + b.amt, 0);
    
    document.getElementById('dash-in').innerText = tin.toLocaleString(undefined, {minimumFractionDigits:2});
    document.getElementById('dash-ex').innerText = tex.toLocaleString(undefined, {minimumFractionDigits:2});
    document.getElementById('dash-bal').innerText = (tin-tex).toLocaleString(undefined, {minimumFractionDigits:2});
    
    let fundHtml = '';
    
    S_CODES.forEach((s, i) => {
        const bal = db.filter(r => r.source === s).reduce((a,b) => a + (b.type==='IN'?b.amt:-b.amt), 0);
        
        const balanceText = bal.toLocaleString(undefined, {
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2
        });
        
        fundHtml += `
            <div class="fund-box" style="background:${COLORS[i]}; position:relative;">
                <span class="fund-index">${i+1}</span>
                <div class="fund-code">
                    ${s}
                </div>
                <div class="fund-amount ${bal >= 0 ? 'positive' : 'negative'}">
                    ${balanceText}
                </div>
                <div class="fund-description">
                    ${CODE_INFO[s]}
                </div>
            </div>`;
    });
    
    document.getElementById('dash-funds').innerHTML = fundHtml;
}

async function loadRecentTable() {
    const db = await getData();
    let html = '<table><tr><th>දිනය</th><th>විස්තරය</th><th>ලදුපත්/වවුචර්</th><th>මුදල (රු.)</th><th>Status</th><th>ක්‍රියා</th></tr>';
    
    db.sort((a,b) => b.id - a.id).slice(0,5).forEach(r => {
        const syncStatus = r.offline ? '<span class="sync-pending">⏳ Offline</span>' : '<span class="sync-done">✅ Online</span>';
        
        let displayRef = '';
        if (r.type === 'IN') {
            displayRef = r.ref || '-';
        } else {
            displayRef = r.vouch || r.ref || '-';
        }
        
        let actions = [];
        if(userRole === 'ADMIN') {
            actions.push(`<button onclick="editTransaction(${r.id})" class="table-btn" style="background:var(--deep-blue); color:white;">Edit</button>`);
            actions.push(`<button onclick="deleteTransaction(${r.id})" class="table-btn" style="background:var(--danger); color:white;">Delete</button>`);
        }
        const actionHtml = actions.length > 0 ? actions.join(' ') : '<span style="color: #999; font-size: 12px;">-</span>';

        html += `<tr>
            <td>${r.date.split('T')[0]}</td>
            <td>${r.desc}</td>
            <td>${displayRef}</td>
            <td style="color:${r.type==='IN'?'green':'red'}"> ${r.amt > 0 ? r.amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td>
            <td>${syncStatus}</td> 
            <td>${actionHtml}</td>
        </tr>`;
    });
    document.getElementById('recent-transactions-table').innerHTML = html + '</table>';
}
async function saveProject() {
    if(userRole === 'GUEST') {
        showToast("❌ ව්‍යාපෘති ඇතුළත් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    const name = document.getElementById('projName').value.trim();
    const est = parseAmount(document.getElementById('projEst').value);
    
    if(!name || !est) {
        showToast("⚠️ කරුණාකර ව්‍යාපෘතියේ නම සහ ඇස්තමේන්තුගත මුදල ඇතුළත් කරන්න");
        return;
    }
    toggleLoading(true);
    try { 
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveProject',
                projectName: name,
                est: est,
                completed: false
            })
        });
        showToast("✅ ව්‍යාපෘතිය සුරැකිණි!"); 
        await fetchRemoteProjects(); 
        updateProjectSelects();
        renderProjectList();
    } catch(e) {
        console.error("Save project error:", e);
        showToast("❌ දෝෂයක් ඇතිවිය!");
    }
    toggleLoading(false);
    document.getElementById('projName').value = '';
    document.getElementById('projEst').value = '';
}
async function completeProject(projectName) {
    if (userRole !== 'ADMIN') {
        showToast("❌ ව්‍යාපෘති අවසන් කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    const confirm = await showConfirmDialog(
        "🏁 ව්‍යාපෘතිය අවසන් කරන්න",
        `"${projectName}" ව්‍යාපෘතිය අවසන් කර Complete ලෙස සලකුණු කරන්නද?\n\n⚠️ අවසන් කළ ව්‍යාපෘති තවදුරටත් dropdown එකේ නොපෙන්වයි.`,
        "ඔව්, අවසන් කරන්න",
        "අවලංගු කරන්න"
    );
    if (!confirm) return;
    toggleLoading(true);
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'completeProject',
                projectName: projectName,
                completed: true
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            let projects = getProjects(true);
            projects = projects.map(p => {
                if (p.projectName === projectName) {
                    return { ...p, completed: true };
                }
                return p;
            });
            setProjectsCache(projects);
            showToast(`✅ "${projectName}" ව්‍යාපෘතිය අවසන් කරන ලදී!`);
            renderProjectList();
            updateProjectSelects();
        } else {
            throw new Error(result.message || 'Server error');
        }
    } catch (error) {
        console.error("Complete project error:", error);
        showToast("❌ ව්‍යාපෘතිය අවසන් කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}
async function deleteProject(projectName) {
    if (userRole !== 'ADMIN') {
        showToast("❌ ව්‍යාපෘති ඉවත් කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    const confirm = await showConfirmDialog(
        "🗑️ ව්‍යාපෘතිය ස්ථිරවම ඉවත් කරන්න",
        `"${projectName}" ව්‍යාපෘතිය සම්පූර්ණයෙන්ම මකා දමන්නද?\n\n⚠️ මෙය ආපසු හැරවිය නොහැක!`,
        "ඔව්, ඉවත් කරන්න",
        "අවලංගු කරන්න"
    );
    if (!confirm) return;
    toggleLoading(true);
    try {
        const response = await fetch(SCRIPT_URL + "?action=delete_project&name=" + encodeURIComponent(projectName));
        const result = await response.json();

        if (result.status === 'success') {
            let projects = getProjects(true);
            projects = projects.filter(p => p.projectName !== projectName);
            setProjectsCache(projects);

            showToast(`✅ "${projectName}" ව්‍යාපෘතිය ඉවත් කරන ලදී!`);
            renderProjectList();
            updateProjectSelects();
        } else {
            throw new Error(result.message || 'Server error');
        }
    } catch (error) {
        console.error("Delete project error:", error);
        showToast("❌ ව්‍යාපෘතිය ඉවත් කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}
function renderProjectList() {
    const allProjects = getProjects(true);
    const activeProjects = allProjects.filter(p => !p.completed);
    const completedProjects = allProjects.filter(p => p.completed === true);
    const db = getData();
    let html = `
        <h4 style="color: var(--success); border-bottom: 2px solid var(--success); padding-bottom: 5px;">
            <i class="fas fa-play-circle"></i> ක්‍රියාත්මක ව්‍යාපෘති
        </h4>
        <table class="project-table" style="width:100%; border-collapse:collapse; margin-bottom:30px;">
            <thead>
                <tr style="background: var(--primary); color: white;">
                    <th>ව්‍යාපෘතිය</th>
                    <th>ඇස්තමේන්තුව (රු.)</th>
                    <th>ආදායම (රු.)</th>
                    <th>වියදම (රු.)</th>
                    <th>ශේෂය (රු.)</th>
                    <th style="text-align:center;">ක්‍රියා</th>
                </tr>
            </thead>
            <tbody>
    `;
    if (activeProjects.length === 0) {
        html += `<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">ක්‍රියාත්මක ව්‍යාපෘති කිසිවක් නැත</td></tr>`;
    } else {
        activeProjects.forEach(p => {
            const pin = db.filter(r => r.proj === p.projectName && r.type === 'IN').reduce((a, b) => a + b.amt, 0);
            const pex = db.filter(r => r.proj === p.projectName && r.type === 'EX').reduce((a, b) => a + b.amt, 0);
            const balance = (p.est + pin) - pex;
            html += `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px; font-weight:bold;">${p.projectName}</td>
                <td style="padding:10px; text-align:right;">${p.est.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                <td style="padding:10px; text-align:right; color:green;">${pin.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                <td style="padding:10px; text-align:right; color:red;">${pex.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                <td style="padding:10px; text-align:right; font-weight:bold; color:${balance >= 0 ? '#1b5e20' : '#c0392b'};">${balance.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                <td style="padding:10px; text-align:center;">
                    ${userRole === 'ADMIN' ? `
                        <button onclick="completeProject('${p.projectName}')" class="table-btn" style="background: #f39c12; color:white; margin-right:5px;">
                            <i class="fas fa-check-circle"></i> අවසන් කරන්න
                        </button>
                        <button onclick="deleteProject('${p.projectName}')" class="table-btn" style="background: var(--danger); color:white;">
                            <i class="fas fa-trash"></i> ඉවත් කරන්න
                        </button>
                    ` : userRole === 'STAFF' ? `
                        <span style="color:#999; font-size:11px;">-</span>
                    ` : ''}
                </td>
            </tr>`;
        });
    }
    html += `</tbody></table>`;
    if (completedProjects.length > 0) {
        html += `
            <h4 style="color: #6c757d; border-bottom: 2px solid #6c757d; padding-bottom: 5px; margin-top: 20px;">
                <i class="fas fa-check-double"></i> අවසන් කළ ව්‍යාපෘති
            </h4>
            <table class="project-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background: #6c757d; color: white;">
                        <th>ව්‍යාපෘතිය</th>
                        <th>ඇස්තමේන්තුව (රු.)</th>
                        <th>ආදායම (රු.)</th>
                        <th>වියදම (රු.)</th>
                        <th>අවසන් ශේෂය (රු.)</th>
                        ${userRole === 'ADMIN' ? '<th style="text-align:center;">ඉවත් කරන්න</th>' : ''}
                    </tr>
                </thead>
                <tbody>
        `;
        completedProjects.forEach(p => {
            const pin = db.filter(r => r.proj === p.projectName && r.type === 'IN').reduce((a, b) => a + b.amt, 0);
            const pex = db.filter(r => r.proj === p.projectName && r.type === 'EX').reduce((a, b) => a + b.amt, 0);
            const balance = (p.est + pin) - pex;
            html += `<tr style="background:#f8f9fa; color:#666;">
                <td style="padding:10px;">${p.projectName}</td>
                <td style="padding:10px; text-align:right;">${p.est.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                <td style="padding:10px; text-align:right;">${pin.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                <td style="padding:10px; text-align:right;">${pex.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                <td style="padding:10px; text-align:right; font-weight:bold;">${balance.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                ${userRole === 'ADMIN' ? `
                    <td style="padding:10px; text-align:center;">
                        <button onclick="deleteProject('${p.projectName}')" class="table-btn" style="background: var(--danger); color:white;">
                            <i class="fas fa-trash"></i> ඉවත් කරන්න
                        </button>
                    </td>
                ` : ''}
            </tr>`;
        });

        html += `</tbody></table>`;
    }
    document.getElementById('project-list-table').innerHTML = html;
}
function updateProjectSelects() {
    const activeProjects = getProjects(false);
    ['inProjSelect', 'exProjSelect', 'searchProject', 'multiInProjSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<option value="">නොමැත / සියල්ල</option>';
            activeProjects.forEach(p => {
                el.innerHTML += `<option value="${p.projectName}">${p.projectName}</option>`;
            });
        }
    });
}
function showSec(id) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('sec-' + id).style.display = 'block';
    document.getElementById('nav-' + id)?.classList.add('active');
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.classList.remove('active');
    });
    if(id === 'entry') loadRecentTable();
    if(id === 'proj') renderProjectList();
    if(id === 'dash') refreshDashboard();
    if(id === 'petty') {
        initPettyFloat();
        renderPettyBook();
        populatePeriodDropdown();
        setTimeout(() => {
            displaySavedPeriodSummaries();
        }, 500);
    }
    if(id === 'codes') {
        renderCodesList();
        setTimeout(() => {
            populateAdvancedSearchFilters();
            const resultsDiv = document.getElementById('transactionSearchResults');
            if (resultsDiv) resultsDiv.style.display = 'none';
            const advPanel = document.getElementById('advancedSearchPanel');
            if (advPanel) advPanel.style.display = 'none';
            const toggle = document.getElementById('advancedSearchToggle');
            if (toggle) toggle.innerHTML = '<i class="fas fa-chevron-down"></i> උසස් සෙවීම් විකල්ප';
        }, 100);
    }
}
function resetForms() {
    document.getElementById('edit-id-in').value = '';
    document.getElementById('edit-id-ex').value = '';
    ['inRefFrom', 'inRefTo', 'inAmt', 'inDesc', 'exVoucher', 'exRef', 'exAmt', 'exDesc'].forEach(id => {
        if (document.getElementById(id)) {
            document.getElementById(id).value = '';
        }
    });
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inDate').value = today; 
    document.getElementById('exDate').value = today;
    $('#inCodeSelect, #exCodeSelect, #exSourceSelect, #inProjSelect, #exProjSelect').val('').trigger('change');
    document.getElementById('btn-save-in').innerText = "ලැබීම ගිණුම්ගත කරන්න";
    document.getElementById('btn-save-ex').innerText = "ගෙවීම ගිණුම්ගත කරන්න";
}

function downloadBackupJSON() {
    const db = getData();
    const blob = new Blob([JSON.stringify(db, null, 2)], {type: 'application/json'});
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = 'backup.json'; 
    a.click();
    showToast("✅ JSON බැකප් ලබා ගන්නා ලදී!");
}
function downloadBackupCSV() {
    try {
        const db = getData();
        if (db.length === 0) {
            showToast("⚠️ බාගත කිරීමට දත්ත කිසිවක් නැත!");
            return;
        }
        let csvContent = "ID,දිනය,වර්ගය,කේතය,මූලාශ්‍ර,මුදල,විස්තරය,වවුචර්,ලදුපත් අංකය/පරාසය,ව්‍යාපෘතිය,Status\n";
        db.forEach(t => {
            const row = [
                t.id,
                t.date,
                t.type,
                t.code,
                t.source || '',
                t.amt,
                `"${t.desc.replace(/"/g, '""')}"`,
                t.vouch || '',
                t.ref || '',
                t.proj || '',
                t.offline ? 'Offline' : 'Online'
            ].join(",");
            csvContent += row + "\n";
        });
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `පාසල්_ගිණුම්_දත්ත_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("✅ CSV දත්ත පිටපත බාගත කරන ලදී!");
    } catch (error) {
        console.error("CSV Download Error:", error);
        showToast("❌ දත්ත බාගත කිරීමේදී දෝෂයක් සිදු විය!");
    }
}
function initResponsiveFeatures() {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.onclick = toggleMobileMenu;
    document.body.appendChild(mobileMenuBtn);
    
    const isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         (navigator.msMaxTouchPoints > 0);
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            handleResize();
        }, 250);
    });
    window.addEventListener('orientationchange', function() {
        setTimeout(refreshLayout, 100);
    });
}
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay') || createOverlay();
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = toggleMobileMenu;
    document.body.appendChild(overlay);
    return overlay;
}
function handleResize() {
    const width = window.innerWidth;
    if (width < 769) {
        document.querySelectorAll('.fund-box').forEach(box => {
            box.style.minHeight = '100px';
        });
    }
    if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
        try {
            $('.select2-selection--single').each(function() {
                if ($(this).data('select2')) {
                    $(this).select2('destroy');
                }
            });
        } catch (e) {
            console.log("Select2 destroy error on resize, continuing...");
        }
        setTimeout(() => {
            initializeSelect2();
        }, 100);
    }
}
function refreshLayout() {
    refreshDashboard();
    generateReport();
}
function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 6000);
}
async function exportToPDF() {
    if(userRole === 'GUEST') {
        showToast("❌ PDF බාගත කිරීමට අවසර නැත!");
        return;
    }
    toggleLoading(true);
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const element = document.getElementById('printable-area');
        
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        pdf.save(`වාර්තා_${currentReport}_${new Date().toISOString().slice(0,10)}.pdf`);
        showToast("✅ PDF වාර්තාව බාගත කරන ලදී!");
    } catch (error) {
        console.error("PDF generation error:", error);
        showToast("❌ PDF ජනනය කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}
function addMultiRow() {
    const container = document.getElementById('multiRowsContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'multi-row';
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.marginBottom = '10px';
    row.style.alignItems = 'center';
    const codeSelect = document.createElement('select');
    codeSelect.className = 'multiCode';
    codeSelect.style.flex = '2';
    codeSelect.style.minWidth = '150px';
    codeSelect.style.padding = '8px';
    codeSelect.style.border = '1px solid #dcedc8';
    codeSelect.style.borderRadius = '5px';
    S_CODES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c + ' - ' + CODE_INFO[c].substring(0, 30);
        codeSelect.appendChild(opt);
    });
    const amtInput = document.createElement('input');
    amtInput.type = 'text';
    amtInput.className = 'multiAmt amount-input';
    amtInput.placeholder = 'මුදල';
    amtInput.style.flex = '1';
    amtInput.oninput = function() { formatAmount(this); };
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'multiDesc';
    descInput.placeholder = 'විස්තරය (විකල්ප)';
    descInput.style.flex = '2';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn remove-row';
    removeBtn.style.background = '#e74c3c';
    removeBtn.style.color = 'white';
    removeBtn.style.minWidth = '40px';
    removeBtn.style.padding = '8px 12px';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = function() { row.remove(); };
    row.appendChild(codeSelect);
    row.appendChild(amtInput);
    row.appendChild(descInput);
    row.appendChild(removeBtn);
    container.appendChild(row);
}
async function saveMultiLineReceipt() {
    if (userRole === 'GUEST') {
        showToast("❌ ගනුදෙනු ඇතුළත් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    const fromRef = document.getElementById('multiInRefFrom').value.trim();
    const toRef = document.getElementById('multiInRefTo').value.trim();
    const date = document.getElementById('multiInDate').value;
    const proj = document.getElementById('multiInProjSelect').value;
    
    if (!fromRef) {
        showToast("⚠️ කරුණාකර ලදුපත් අංකය ඇතුළත් කරන්න");
        document.getElementById('multiInRefFrom').focus();
        return;
    }
    if (isNaN(parseInt(fromRef))) {
        showToast("⚠️ කරුණාකර වලංගු අංකයක් ඇතුළත් කරන්න");
        return;
    }
    if (toRef && isNaN(parseInt(toRef))) {
        showToast("⚠️ කරුණාකර වලංගු අංකයක් ඇතුළත් කරන්න");
        return;
    }
    if (toRef && parseInt(fromRef) > parseInt(toRef)) {
        showToast("⚠️ 'දක්වා' අංකය 'සිට' අංකයට වඩා විශාල විය යුතුය!");
        return;
    }
    if (!date) {
        showToast("⚠️ කරුණාකර දිනය ඇතුළත් කරන්න");
        document.getElementById('multiInDate').focus();
        return;
    }
    const rows = document.querySelectorAll('#multiRowsContainer .multi-row');
    if (rows.length === 0) {
        showToast("⚠️ කරුණාකර අවම වශයෙන් එක් පේළියක් හෝ එකතු කරන්න");
        return;
    }
    const transactions = [];
    let totalAmount = 0;
    for (let row of rows) {
        const codeSelect = row.querySelector('.multiCode');
        const amtInput = row.querySelector('.multiAmt');
        const descInput = row.querySelector('.multiDesc');
        if (!codeSelect || !amtInput) continue;
        const code = codeSelect.value;
        const amt = parseAmount(amtInput.value);
        const desc = descInput.value.trim() || 'බහු-රේඛීය ලැබීම';
        
        if (!code) {
            showToast("⚠️ සියලු පේළි සඳහා කේතය තෝරන්න");
            return;
        }
        if (amt <= 0) {
            showToast("⚠️ සියලු පේළි සඳහා වලංගු මුදලක් ඇතුළත් කරන්න");
            return;
        }
        totalAmount += amt;
        transactions.push({
            action: 'save_transaction',
            id: Date.now() + Math.floor(Math.random() * 1000) + transactions.length,
            date: date,
            ref: formatReceiptRange(fromRef, toRef),
            vouch: '',
            code: code,
            amt: amt,
            desc: desc,
            type: 'IN',
            source: code,
            proj: proj,
            status: true,
            isOp: false,
            isImprest: false
        });
    }
        const duplicateCheck = checkDuplicateReceipt(fromRef, toRef, null);
    if (duplicateCheck.isDuplicate) {
        showToast(duplicateCheck.message);
        return;
    }
    toggleLoading(true);
    try {
        // Batch save උත්සාහ කරන්න
        const success = await saveBatchTransactions(transactions);        
        if (success) {
            // දේශීය cache එකට එකතු කරන්න
            let db = getData();
            db.push(...transactions);
            setDataCache(db);
            
            showToast(`✅ ලැබීම් ${transactions.length}ක් සාර්ථකව ගිණුම්ගත කරන ලදී!`);
            document.getElementById('multiInRefFrom').value = '';
            document.getElementById('multiInRefTo').value = '';
            document.getElementById('multiInDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('multiInProjSelect').value = '';
            document.getElementById('multiRowsContainer').innerHTML = ''; // සියලු පේළි ඉවත් කරන්න
            addMultiRow(); // එක් හිස් පේළියක් එකතු කරන්න
            refreshDashboard();
            loadRecentTable();
        } else {
            showToast("❌ ගනුදෙනු සුරැකීම අසාර්ථකයි!");
        }
    } catch (error) {
        console.error("Multi-line save error:", error);
        showToast("❌ දෝෂයක් සිදු විය!");
    } finally {
        toggleLoading(false);
    }
}
function toggleFoldableCard(cardId) {
    const content = document.getElementById(cardId);
    const icon = document.getElementById(cardId + '-icon');
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    } else {
        content.style.display = 'none';
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
    }
}