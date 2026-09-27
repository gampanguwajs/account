const S_CODES = ["S1","S2","S3","S4","S5","S6","S7","S8","S9","S10"];
const EX_CODES = ["REx1","REx2","REx3","REx4","REx5","REx6","REx7","CEx1","CEx2","CEx3","CEx4","CEx5","CEx6","PC"];
const CODE_INFO = {
    "S1":"ඒකාබද්ධ අරමුදල් සහ පළාත් සභා අරමුදල්", "S2":"සහයෝගිතා ගිවිසුම් යටතේ ක්‍රියාත්මක වන වැඩසටහන් හා ව්‍යාපෘති සඳහා ලැබෙන අරමුදල්", "S3":"රජයේ ආධාර", "S4":"පාසල් පාදක ඉගෙනුම් ප්‍රවර්ධන ප්‍රදානයන්, ගුණාත්මක යෙදවුම් හා උසස් මට්ටමේ ඉගෙනුම් ක්‍රියාවලි සඳහා ලැබෙන අරමුදල්", "S5":"රජය විසින් අනුමත හා ලියාපදිංචි රාජ්‍ය නොවන සංවිධාන වලින් ලැබෙන ආධාර", "S6":"පාසලේ දියුණුව වෙනුවෙන් ස්ව කැමැත්තෙන් දායකත්වය ලබා දෙන ඕනෑම පාර්ශවයක පරිත්‍යාග", "S7":"පාසලට අයත් වත්කම් වලින් උපයා ගන්නා ආදායම්", "S8":"පාසල් සංවර්ධන සමිති සාමාජික මුදල්", "S9":"පාසලේ ඉගෙනුම් ඉගැන්වීම් ක්‍රියාවලියට අදාළ අත්‍යවශ්‍ය ක්‍රියාකාරකම් සඳහා ලැබීම්", "S10":"පාසල් සංවර්ධන සමිතිය මඟින් තීරණය කරනු ලබන පාසලේ අත්‍යවශ්‍ය වියදම් පියවා ගැනීම සඳහා වන අරමුදල්",
    "REx1":"විෂය මාලා ක්‍රියාත්මක කිරීමට අදාළ පුනරාවර්තන වියදම්", "REx2":"උපදේශන, උසස් අධ්‍යාපන හා විෂය සමගාමී ක්‍රියාකාරකම්", "REx3":"අධ්‍යාපන පරිපාලන හා උපයෝගිතා සේවා හා සුභසාධන කටයුතු", "REx4":"කාර්ය මණ්ඩල පාරිශ්‍රමික", "REx5":"ප්‍රාග්ධන භාණ්ඩ හා උපකරණ නඩත්තු/අලුත්වැඩියා", "REx6":"පාසලේ ගොඩනැගිලි සුළු නඩත්තු/අලුත්වැඩියා", "REx7":"පවිත්‍රතා හා පිරිසිදු කිරීම්", 
    "CEx1":"මූලික පහසුකම් - නව සැපයීම්", "CEx2":"විෂය මාලා ක්‍රියාත්මක කිරීමට අදාළ ප්‍රාග්ධන වියදම්", "CEx3":"පුස්තකාල පොත් මිලට ගැනීම්", "CEx4":"ගොඩනැගිලි නව ඉදිකිරීම්, වැඩිදියුණු කිරීම් හා වෙනත් ප්‍රාග්ධන වියදම්", "CEx5":"ප්‍රාග්ධන උපකරණ මිලට ගැනීම්", "CEx6":"විශේෂ ව්‍යාපෘති සඳහා විශේෂ ප්‍රාග්ධන ආධාර",
"PC":"සුළු මුදල් අග්‍රිමය (Petty Cash Imprest)",
    "ADV":"අත්තිකාරම් (Advances)",
    "ADV-RET":"අත්තිකාරම් ආපසු ලැබීම (Advance Refund)"
};
const COLORS = ["#2e7d32", "#f9a825", "#388e3c", "#fbc02d", "#43a047", "#fdd835", "#4caf50", "#ffeb3b", "#66bb6a", "#ffee58"];
let currentUsername = '';
let currentReport = '';
let userRole = '';
let allocations = JSON.parse(sessionStorage.getItem('sch_allocations') || '{}');
let clearedStatus = JSON.parse(sessionStorage.getItem('sch_cleared') || '{}');
let initialized = false;
let isLoading = false;
let pettyExpenses = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
let periodExpenses = JSON.parse(sessionStorage.getItem('sch_period_expenses') || '[]');
let advances = JSON.parse(sessionStorage.getItem('sch_advances') || '[]');
let advanceSettlements = JSON.parse(sessionStorage.getItem('sch_advance_settlements') || '[]');
let dbCache = null;
let projectsCache = null;
let allocationsCache = null;
let pettyExpensesCache = null;
let periodExpensesCache = null;
let advancesCache = null;
let advanceSettlementsCache = null;

const api = window.electronAPI;
if (!api) {
    alert("මෙම යෙදුම Electron + SQLite පරිසරයක් තුළ පමණක් ක්‍රියා කරයි.");
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymsP_xgSr2EqLBLSdndG1LWr4jAqj5_iFg-vFM5EgChhN72qVddng1q4Xkm4WQnS5u/exec';

// Initialize app after registration/login
function initializeApp() {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    
    if (document.getElementById('inDate')) document.getElementById('inDate').value = today;
    if (document.getElementById('exDate')) document.getElementById('exDate').value = today;
    if (document.getElementById('repFrom')) document.getElementById('repFrom').value = startOfYear;
    if (document.getElementById('repTo')) document.getElementById('repTo').value = today;
    if (document.getElementById('multiInDate')) document.getElementById('multiInDate').value = today;
    
    // Initialize other components
    if (typeof populateOptions === 'function') populateOptions();
    setTimeout(() => {
        if (typeof initializeSelect2 === 'function') initializeSelect2();
    }, 500);
    if (typeof initPettyCashSection === 'function') initPettyCashSection();
    if (typeof addMultiRow === 'function') addMultiRow();
        if (typeof populateBankMonths === 'function') {
        populateBankMonths();
    }
    if (typeof initAdvanceForm === 'function') {
        initAdvanceForm();
    }
    
    // Load data
    if (typeof fetchAllDataParallel === 'function') {
        fetchAllDataParallel().then(() => {
            if (typeof refreshDashboard === 'function') refreshDashboard();
            if (typeof loadRecentTable === 'function') loadRecentTable();
            if (typeof renderPettyBook === 'function') renderPettyBook();
            if (typeof renderCodesList === 'function') renderCodesList();
            if (typeof updateProjectSelects === 'function') updateProjectSelects();
            if (typeof renderProjectList === 'function') renderProjectList();
            if (typeof displaySavedPeriodSummaries === 'function') displaySavedPeriodSummaries();
            if (typeof renderAdvancesList === 'function') renderAdvancesList();
        });
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    // Check if Electron API is available
    if (!window.electronAPI) {
        console.error("Electron API not available");
        return;
    }

    try {
        // 1. Check if school is already registered
        const result = await window.electronAPI.dbRead({
            action: 'read_settings',
            data: { key: 'isRegistered' }
        });

        const isRegistered = result && result.length > 0 && result[0].value === 'true';

        if (!isRegistered) {
            // Registration required - block main UI
            document.getElementById('reg-modal').style.display = 'block';
            if (document.querySelector('.sidebar')) document.querySelector('.sidebar').style.display = 'none';
            if (document.querySelector('.main-content')) document.querySelector('.main-content').style.display = 'none';
        } else {
            // Registration exists - show main UI and check for pending sync
            if (document.getElementById('reg-modal')) document.getElementById('reg-modal').style.display = 'none';
            if (document.querySelector('.sidebar')) document.querySelector('.sidebar').style.display = 'block';
            if (document.querySelector('.main-content')) document.querySelector('.main-content').style.display = 'block';
            
            // Check for pending sync data
            checkAndSyncData();
            
            // Initialize the app
            initializeApp();
        }
    } catch (error) {
        console.error("Registration check error:", error);
        showToast("❌ පද්ධතිය ආරම්භ කිරීමේ දෝෂයක්!");
    }

    // Listen for online events to trigger sync
    window.addEventListener('online', () => {
        console.log("Online detected, checking for pending sync...");
        checkAndSyncData();
        updateOnlineStatus();
    });
    
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
});

async function saveRegistration() {
    const schoolName = document.getElementById('reg-school').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const principalName = document.getElementById('reg-principal').value.trim();

    if (!schoolName || !phone) {
        showToast("⚠️ කරුණාකර පාසලේ නම සහ දුරකථන අංකය ඇතුළත් කරන්න.");
        return;
    }

    const data = {
        schoolName: schoolName,
        phone: phone,
        address: address,
        principalName: principalName,
        registrationDate: new Date().toISOString()
    };

    const submitBtn = document.getElementById('reg-submit-btn');
    const statusMsg = document.getElementById('reg-status-msg');
    
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> සුරකිමින්...';
    if (statusMsg) statusMsg.innerHTML = '📝 දත්ත සුරැකෙමින් පවතී...';

    try {
        // Save to SQLite
        await window.electronAPI.dbWrite({ 
            action: 'save_settings', 
            data: { key: 'schoolDetails', value: JSON.stringify(data) } 
        });
        
        await window.electronAPI.dbWrite({ 
            action: 'save_settings', 
            data: { key: 'isRegistered', value: 'true' } 
        });
        
        await window.electronAPI.dbWrite({ 
            action: 'save_settings', 
            data: { key: 'syncStatus', value: 'pending' } 
        });

        if (statusMsg) statusMsg.innerHTML = '✅ දත්ත සාර්ථකව සුරකින ලදී!';

        // Try to sync if online
        if (navigator.onLine) {
            if (statusMsg) statusMsg.innerHTML = '☁️ දත්ත සමමුහුර්ත කරමින්...';
            await syncToGoogleSheets(data);
            if (statusMsg) statusMsg.innerHTML = '✅ ලියාපදිංචිය සාර්ථකයි!';
        } else {
            if (statusMsg) statusMsg.innerHTML = '⚠️ අන්තර්ජාලය නැත. සම්බන්ධ වූ විට සමමුහුර්ත වේ.';
        }

        // Hide modal and show main UI
        setTimeout(() => {
            document.getElementById('reg-modal').style.display = 'none';
            document.querySelector('.sidebar').style.display = 'block';
            document.querySelector('.main-content').style.display = 'block';
            showToast("✅ ලියාපදිංචිය සාර්ථකයි!");
            initializeApp();
        }, 1500);

    } catch (error) {
        console.error("Registration error:", error);
        if (statusMsg) statusMsg.innerHTML = '❌ දත්ත සුරැකීමේ දෝෂයක්!';
        showToast("❌ ලියාපදිංචිය අසාර්ථකයි!");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> ලියාපදිංචි වන්න';
        }
    }
}
async function checkAndSyncData() {
    if (!navigator.onLine) {
        console.log("Offline, skipping sync check");
        return;
    }

    try {
        const syncStatus = await window.electronAPI.dbRead({ 
            action: 'read_settings', 
            data: { key: 'syncStatus' } 
        });
        
        if (syncStatus && syncStatus.length > 0 && syncStatus[0].value === 'pending') {
            const details = await window.electronAPI.dbRead({ 
                action: 'read_settings', 
                data: { key: 'schoolDetails' } 
            });
            
            if (details && details.length > 0) {
                const data = JSON.parse(details[0].value);
                await syncToGoogleSheets(data);
                console.log("Cloud sync successful.");
            }
        }
    } catch (error) {
        console.error("Sync check error:", error);
    }
}
async function syncToGoogleSheets(data) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'OBAGE_WEB_APP_URL_EKA_METHTHATA_DAANNA') {
        console.warn("Google Script URL not configured. Skipping sync.");
        return false;
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'registerSchool',
                schoolData: data,
                timestamp: new Date().toISOString(),
                appVersion: '1.0.0'
            })
        });
        
        // Update sync status to 'synced'
        await window.electronAPI.dbWrite({ 
            action: 'save_settings', 
            data: { key: 'syncStatus', value: 'synced' } 
        });
        
        return true;
    } catch (error) {
        console.error("Sync to Google Sheets failed:", error);
        return false;
    }
}


function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function checkDuplicateInRealTime(field, value, type, excludeId = null) {
    const db = getData();
    const pettyEx = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
    
    let duplicates = [];
    
    if (type === 'IN') {
        duplicates = db.filter(t => 
            t.type === 'IN' && 
            t[field] === value &&
            (excludeId === null || t.id !== excludeId)
        );
    } else if (type === 'EX') {
        duplicates = db.filter(t => 
            t.type === 'EX' && 
            t[field] === value &&
            (excludeId === null || t.id !== excludeId)
        );
    } else if (type === 'PETTY') {
        duplicates = pettyEx.filter(e => 
            e[field] === value &&
            (excludeId === null || e.id !== excludeId)
        );
    }
    
    return duplicates.length > 0;
}

function checkDuplicateTransaction(date, voucher, amount, type, excludeId = null) {
    if (!voucher || !date || amount <= 0) return false;
    
    const db = getData();
    
    const duplicates = db.filter(t => {
        if (t.type !== type) return false;
        if (excludeId !== null && t.id === excludeId) return false;
        
        const dateMatch = t.date === date;
        
        let voucherMatch = false;
        if (type === 'IN') {
            voucherMatch = t.ref === voucher;
        } else {
            voucherMatch = t.vouch === voucher;
        }
        
        const amountMatch = Math.abs(t.amt - amount) < 0.01;
        
        return dateMatch && voucherMatch && amountMatch;
    });
    
    return duplicates.length > 0;
}

function checkDuplicatePettyExpense(date, voucher, amount, category, excludeId = null) {
    if (!voucher || !date || amount <= 0) return false;
    
    const pettyEx = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
    
    const duplicates = pettyEx.filter(e => {
        if (excludeId !== null && e.id === excludeId) return false;
        
        const dateMatch = e.date === date;
        const voucherMatch = e.voucher === voucher;
        const amountMatch = Math.abs(e.amt - amount) < 0.01;
        const categoryMatch = e.category === category;
        
        return dateMatch && voucherMatch && amountMatch && categoryMatch;
    });
    
    return duplicates.length > 0;
}

function validateReceiptNumber(element) {
    const fromRef = document.getElementById('inRefFrom').value.trim();
    const toRef = document.getElementById('inRefTo').value.trim();
    const editId = document.getElementById('edit-id-in').value;
    
    if (!fromRef) return;
    
    const excludeId = editId ? parseInt(editId) : null;
    const duplicateCheck = checkDuplicateReceipt(fromRef, toRef, excludeId);
    
    const warningElement = document.getElementById('receiptNumberWarning');
    
    if (duplicateCheck.isDuplicate) {
        element.style.borderColor = 'var(--danger)';
        element.style.backgroundColor = '#ffebee';
        
        if (!warningElement) {
            const warning = document.createElement('div');
            warning.id = 'receiptNumberWarning';
            warning.style.color = 'var(--danger)';
            warning.style.fontSize = '11px';
            warning.style.marginTop = '5px';
            warning.style.padding = '5px';
            warning.style.backgroundColor = '#ffebee';
            warning.style.borderRadius = '4px';
            warning.innerHTML = `⚠️ ${duplicateCheck.message}`;
            element.parentNode.appendChild(warning);
        }
    } else {
        element.style.borderColor = '#dcedc8';
        element.style.backgroundColor = '';
        if (warningElement) warningElement.remove();
    }
}

function validateVoucherNumber(element) {
    const voucher = element.value.trim();
    const date = document.getElementById('exDate').value;
    const amount = parseAmount(document.getElementById('exAmt').value);
    const editId = document.getElementById('edit-id-ex').value;
    
    if (!voucher || !date || amount <= 0) return;
    
    const excludeId = editId ? parseInt(editId) : null;
    const isDuplicate = checkDuplicateTransaction(date, voucher, amount, 'EX', excludeId);
    
    const warningElement = document.getElementById('voucherWarning');
    
    if (isDuplicate) {
        element.style.borderColor = 'var(--danger)';
        element.style.backgroundColor = '#ffebee';
        
        if (!warningElement) {
            const warning = document.createElement('div');
            warning.id = 'voucherWarning';
            warning.style.color = 'var(--danger)';
            warning.style.fontSize = '11px';
            warning.style.marginTop = '5px';
            warning.style.padding = '5px';
            warning.style.backgroundColor = '#ffebee';
            warning.style.borderRadius = '4px';
            warning.innerHTML = `⚠️ මෙම වවුචර් අංකය, දිනය සහ මුදල සහිත ගනුදෙනුවක් දැනටමත් පවතී!`;
            element.parentNode.appendChild(warning);
        }
    } else {
        element.style.borderColor = '#dcedc8';
        element.style.backgroundColor = '';
        if (warningElement) warningElement.remove();
    }
}

function validatePettyVoucher(element) {
    const voucher = element.value.trim();
    const date = document.getElementById('pettyDate').value;
    const amount = parseAmount(document.getElementById('pettyAmt').value);
    const category = $('#pettyCategorySelect').val();
    const editId = document.getElementById('edit-petty-id').value;
    
    if (!voucher || !date || amount <= 0 || !category) return;
    
    const excludeId = editId ? parseInt(editId) : null;
    const isDuplicate = checkDuplicatePettyExpense(date, voucher, amount, category, excludeId);
    
    const warningElement = document.getElementById('pettyVoucherWarning');
    
    if (isDuplicate) {
        element.style.borderColor = 'var(--danger)';
        element.style.backgroundColor = '#ffebee';
        
        if (!warningElement) {
            const warning = document.createElement('div');
            warning.id = 'pettyVoucherWarning';
            warning.style.color = 'var(--danger)';
            warning.style.fontSize = '11px';
            warning.style.marginTop = '5px';
            warning.style.padding = '5px';
            warning.style.backgroundColor = '#ffebee';
            warning.style.borderRadius = '4px';
            warning.innerHTML = `⚠️ මෙම වවුචර් අංකය, දිනය, කාණ්ඩය සහ මුදල සහිත වියදමක් දැනටමත් පවතී!`;
            element.parentNode.appendChild(warning);
        }
    } else {
        element.style.borderColor = '#dcedc8';
        element.style.backgroundColor = '';
        if (warningElement) warningElement.remove();
    }
}

function updateOnlineStatus() {
    const statusDiv = document.getElementById('connection-status');
    if (navigator.onLine) {
        statusDiv.innerHTML = "🟢 FULL OFFLINE VERSION";
        statusDiv.className = "status-glow-online";
    } else {
        statusDiv.innerHTML = "🔴 FULL OFFLINE VERSION";
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
    return saved ? parseFloat(saved) : 0;
}

function savePettyFloat() {
    if (userRole !== 'ADMIN') {
        showToast("❌ අවසර නැත!");
        return;
    }
    const floatVal = parseAmount(document.getElementById('pettyFloat').value);
    if (floatVal < 0) {
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
		const isTransferred = entry.transferred === true || entry.transferred === 1;
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
            isTransferred: isTransferred,
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
        
        if (isFirstPeriod) {
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
                // Transferred වියදම් සංස්කරණය කළ හැක්කේ ADMIN ට පමණි
                const canEdit = (userRole === 'ADMIN') || (!t.isTransferred && userRole === 'STAFF');
                if (canEdit) {
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
                @page {
                    size: A4;
                    margin: 2cm;
                }
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
                <h1>මො / ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
                <h2>සුළු මුදල් පොත</h2>
                <p>මුද්‍රණය: ${new Date().toLocaleDateString('si-LK')}</p>
            </div>
            ${printContent.outerHTML}
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
        const imgData = canvas.toDataURL('image/png');
        
        // ========== Page Margins (1.5cm වටේම) ==========
        const marginMM = 15; // 1.5cm
        const pageWidthMM = 210;
        const pageHeightMM = 297;
        const contentWidthMM = pageWidthMM - (marginMM * 2);
        const contentHeightMM = pageHeightMM - (marginMM * 2);
        
        const imgHeight = (canvas.height * contentWidthMM) / canvas.width;
        let heightLeft = imgHeight;
        let position = marginMM;
        
        pdf.addImage(imgData, 'PNG', marginMM, position, contentWidthMM, imgHeight);
        heightLeft -= contentHeightMM;
        
        while (heightLeft > 0) {
            position = marginMM + (heightLeft - imgHeight);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', marginMM, position, contentWidthMM, imgHeight);
            heightLeft -= contentHeightMM;
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


function printReport() {
    const reportTitle = document.getElementById('report-header-title').innerText;
    const reportDateRange = document.getElementById('report-date-range').innerText;
    const reportContent = document.getElementById('report-content').innerHTML;
    
    // Orientation තීරණය කරන්න
    const isLandscape = currentReport !== 'BANK';
    
    // එක් පිටුවකට ගැලපේද යන්න පරීක්ෂා කරන්න
    const isCompact = canFitOnOnePage(currentReport);
    
    // Compact mode සඳහා විශේෂ CSS ප්‍රමාණ
    const fontSmall = isCompact ? '8px' : (isLandscape ? '10px' : '12px');
    const fontMedium = isCompact ? '9px' : (isLandscape ? '10px' : '12px');
    const fontLarge = isCompact ? '11px' : (isLandscape ? '14px' : '16px');
    const paddingCell = isCompact ? '2px 3px' : (isLandscape ? '4px 3px' : '8px');
    const marginTop = isCompact ? '20px' : (isLandscape ? '30px' : '50px');
    
    const printWindow = window.open('', '_blank');
    
printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${reportTitle}</title>
        <style>
            @page {
                size: ${isLandscape ? 'A4 landscape' : 'A4'};
                margin: ${isCompact ? '0.5cm' : (isLandscape ? '0.8cm' : '1.5cm')};
            }
            
            body {
                font-family: 'Noto Sans Sinhala', 'Segoe UI', 'Iskoola Pota', sans-serif;
                margin: 0;
                padding: ${isCompact ? '3px' : (isLandscape ? '5px' : '10px')};
                background: white;
                color: black;
            }
            
            @media print {
                * {
                    color: black !important;
                    background-color: white !important;
                    background-image: none !important;
                    text-shadow: none !important;
                    box-shadow: none !important;
                }
                
                /* Header එකට පසුව පිටුව බෙදීම වැලැක්වීම */
                .school-header,
                .report-header {
                    page-break-after: avoid;
                    break-after: avoid;
                }
                
                .school-header h1,
                .school-header h2,
                .school-header p,
                .report-header h2,
                .report-header p {
                    page-break-before: avoid;
                    break-before: avoid;
                    page-break-after: avoid;
                    break-after: avoid;
                }
                
                table {
                    border-collapse: collapse;
                    width: 100%;
                    page-break-inside: auto;
                    page-break-before: avoid;
                    break-before: avoid;
                }
                
                thead {
                    display: table-header-group;
                }
                
                tfoot {
                    display: table-footer-group;
                }
                
                tr, .stat-card, .fund-box {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                
                .signatures {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    page-break-before: avoid;
                    break-before: avoid;
                }
                
                table {
                    page-break-inside: avoid;
                }
                
                th {
                    background: #f0f0f0 !important;
                    color: black !important;
                    font-weight: bold;
                    border: 1px solid black !important;
                    font-size: ${fontMedium};
                    padding: ${paddingCell};
                }
                
                td {
                    border: 1px solid #333 !important;
                    padding: ${paddingCell};
                    font-size: ${fontSmall};
                }
                
                td[style*="color: green"], 
                td[style*="color: red"],
                .positive, .negative {
                    color: black !important;
                    font-weight: bold;
                }
                
                tr[style*="background"], 
                .stat-card, 
                .fund-box {
                    background: white !important;
                    border: 1px solid black !important;
                }
            }
            
            .school-header {
                text-align: center;
                margin-bottom: ${isCompact ? '5px' : (isLandscape ? '8px' : '15px')};
                border-bottom: 1.5px solid black;
                padding-bottom: ${isCompact ? '3px' : (isLandscape ? '5px' : '8px')};
            }
            
            .school-header h1 {
                color: black;
                margin: 0;
                font-size: ${isCompact ? '12px' : (isLandscape ? '16px' : '20px')};
            }
            
            .school-header h2 {
                color: black;
                margin: 2px 0;
                font-size: ${isCompact ? '10px' : (isLandscape ? '12px' : '16px')};
            }
            
            .school-header p {
                color: black;
                margin: 2px 0;
                font-size: ${fontSmall};
            }
            
            .report-header {
                text-align: center;
                margin-bottom: ${isCompact ? '5px' : (isLandscape ? '8px' : '12px')};
            }
            
            .report-header h2 {
                color: black;
                margin: 0;
                font-size: ${fontLarge};
            }
            
            .report-header p {
                color: black;
                margin: 2px 0;
                font-weight: bold;
                font-size: ${fontSmall};
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: ${isCompact ? '3px 0' : (isLandscape ? '5px 0' : '10px 0')};
                font-size: ${fontSmall};
                border: 1px solid black;
            }
            
            th {
                background: #f0f0f0;
                color: black;
                padding: ${paddingCell};
                border: 1px solid black;
                font-weight: bold;
                font-size: ${fontMedium};
            }
            
            td {
                padding: ${paddingCell};
                border: 1px solid #333;
                font-size: ${fontSmall};
            }
            
            .total-row {
                background: #f0f0f0 !important;
                font-weight: bold;
            }
            
            .signatures {
                display: flex;
                justify-content: space-between;
                margin-top: ${isCompact ? '15px' : (isLandscape ? '20px' : '35px')};
            }
            
            .signature-box {
                width: 30%;
                text-align: center;
            }
            
            .signature-line {
                margin-top: ${isCompact ? '12px' : (isLandscape ? '20px' : '30px')};
                border-top: 1.5px solid black;
                width: 100%;
            }
            
            .signature-label {
                margin-top: 3px;
                font-weight: bold;
                font-size: ${fontSmall};
            }
            
            .print-date {
                text-align: right;
                margin-top: ${isCompact ? '5px' : (isLandscape ? '8px' : '12px')};
                color: black;
                font-size: ${isCompact ? '7px' : (isLandscape ? '9px' : '11px')};
            }
            
            /* Compact mode සඳහා විශේෂ */
            ${isCompact ? `
                .q-table th, .q-table td {
                    padding: 1px 2px !important;
                    font-size: 7px !important;
                }
                .val-col {
                    font-size: 8px !important;
                }
                .q-total-row td {
                    font-size: 9px !important;
                }
                .stat-grid {
                    gap: 5px !important;
                }
                .stat-card {
                    padding: 5px !important;
                }
                .stat-card h2 {
                    font-size: 14px !important;
                }
                .fund-grid {
                    gap: 5px !important;
                }
                .fund-box {
                    padding: 8px !important;
                    min-height: 80px !important;
                }
                .fund-amount {
                    font-size: 12px !important;
                    min-width: 60px !important;
                    padding: 3px 8px !important;
                }
                .fund-code {
                    font-size: 14px !important;
                }
                .fund-description {
                    font-size: 6px !important;
                }
            ` : ''}
        </style>
    </head>
    <body>
        <div class="school-header">
            <h1>පාසල් මූල්‍ය කළමනාකරණ පද්ධතිය</h1>
            <h2>SCHOOL FINANCE MANAGEMENT SYSTEM</h2>
            <p>මො / ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</p>
        </div>
        
        <div class="report-header">
            <h2>${reportTitle}</h2>
            <p>${reportDateRange}</p>
        </div>
        
        ${reportContent}
        
        <div class="signatures">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">පරීක්ෂා කළේ</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">භාණ්ඩාගාරික</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">විදුහල්පති</div>
            </div>
        </div>
        
        <div class="print-date">
            මුද්‍රණය: ${new Date().toLocaleString('si-LK')}
        </div>
    </body>
    </html>
`);
    
    printWindow.document.close();
    printWindow.print();
}
function canFitOnOnePage(reportType) {
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return false;
    
    const summaryReports = ['QUARTER', 'VARIANCE', 'BUDGET_VS_INCOME', 'BANK'];
    if (summaryReports.includes(reportType)) return true;
    
    if (reportType === 'IN' || reportType === 'EX') return true;
    
    const rowCount = reportContent.querySelectorAll('tbody tr').length;
    const maxRowsForOnePage = reportType === 'CASHBOOK' ? 30 : 35;
    
    return rowCount <= maxRowsForOnePage;
}

async function exportReportToPDF() {
    if (userRole === 'GUEST') {
        showToast("❌ PDF බාගත කිරීමට අවසර නැත!");
        return;
    }
    
    toggleLoading(true);
    
    try {
        const reportTitle = document.getElementById('report-header-title').innerText;
        const reportDateRange = document.getElementById('report-date-range').innerText;
        const reportContent = document.getElementById('report-content').innerHTML;
        
        // Orientation තීරණය කරන්න
        const isLandscape = currentReport !== 'BANK';
        
        // එක් පිටුවකට ගැලපේද යන්න පරීක්ෂා කරන්න
        const isCompact = canFitOnOnePage(currentReport);
        
        // Compact mode සඳහා විශේෂ ප්‍රමාණ
        const fontSmall = isCompact ? '8px' : (isLandscape ? '10px' : '12px');
        const fontMedium = isCompact ? '9px' : (isLandscape ? '10px' : '12px');
        const fontLarge = isCompact ? '11px' : (isLandscape ? '14px' : '16px');
        const paddingCell = isCompact ? '2px 3px' : (isLandscape ? '4px 3px' : '8px');
        const marginTop = isCompact ? '20px' : (isLandscape ? '30px' : '50px');
        
        const tempDiv = document.createElement('div');
        tempDiv.style.width = isLandscape ? '297mm' : '210mm';
        tempDiv.style.padding = isCompact ? '5px' : (isLandscape ? '10px' : '20px');
        tempDiv.style.fontFamily = 'Noto Sans Sinhala, sans-serif';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.color = 'black';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        
        const grayscaleStyles = `
            <style>
                * {
                    color: black !important;
                    background-color: white !important;
                    background-image: none !important;
                    text-shadow: none !important;
                    box-shadow: none !important;
                    border-color: black !important;
                }
                
                table {
                    border-collapse: collapse;
                    width: 100%;
                    border: 1px solid black !important;
                    font-size: ${fontSmall} !important;
                }
                
                th {
                    background: #f0f0f0 !important;
                    color: black !important;
                    font-weight: bold;
                    border: 1px solid black !important;
                    padding: ${paddingCell} !important;
                    font-size: ${fontMedium} !important;
                }
                
                td {
                    border: 1px solid #333 !important;
                    padding: ${paddingCell} !important;
                    font-size: ${fontSmall} !important;
                }
                
                [style*="color: green"], 
                [style*="color: red"],
                .positive, .negative,
                td[style*="color"] {
                    color: black !important;
                    font-weight: bold;
                }
                
                tr[style*="background"], 
                .stat-card, 
                .fund-box,
                [style*="background"] {
                    background: white !important;
                    border: 1px solid black !important;
                }
                
                tr:nth-child(even) {
                    background: #f5f5f5 !important;
                }
                
                ${isCompact ? `
                    .q-table th, .q-table td {
                        padding: 1px 2px !important;
                        font-size: 7px !important;
                    }
                    .val-col {
                        font-size: 8px !important;
                    }
                    .q-total-row td {
                        font-size: 9px !important;
                    }
                    .stat-card {
                        padding: 5px !important;
                    }
                    .stat-card h2 {
                        font-size: 14px !important;
                    }
                    .fund-box {
                        padding: 8px !important;
                        min-height: 80px !important;
                    }
                    .fund-amount {
                        font-size: 12px !important;
                        min-width: 60px !important;
                        padding: 3px 8px !important;
                    }
                    .fund-code {
                        font-size: 14px !important;
                    }
                    .fund-description {
                        font-size: 6px !important;
                    }
                ` : ''}
            </style>
        `;
        
        tempDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: ${isCompact ? '8px' : (isLandscape ? '15px' : '30px')}; border-bottom: 2px solid black; padding-bottom: ${isCompact ? '5px' : (isLandscape ? '10px' : '15px')};">
                <h1 style="color: black; margin: 0; font-size: ${isCompact ? '14px' : (isLandscape ? '18px' : '24px')};">මො / ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
                <h2 style="color: black; margin: 3px 0; font-size: ${isCompact ? '11px' : (isLandscape ? '14px' : '20px')};">SCHOOL FINANCE MANAGEMENT SYSTEM</h2>
                <p style="color: black; margin: 3px 0; font-size: ${fontSmall};">පාසල් මූල්‍ය කළමනාකරණ පද්ධතිය</p>
            </div>
            
            <div style="text-align: center; margin-bottom: ${isCompact ? '8px' : (isLandscape ? '15px' : '25px')};">
                <h2 style="color: black; margin: 0; font-size: ${fontLarge};">${reportTitle}</h2>
                <p style="color: black; margin: 3px 0; font-weight: bold; font-size: ${fontSmall};">${reportDateRange}</p>
            </div>
            
            ${grayscaleStyles}
            
            ${reportContent}
            
            <div style="display: flex; justify-content: space-between; margin-top: ${marginTop};">
                <div style="text-align: center; width: 30%;">
                    <div style="margin-top: ${isCompact ? '15px' : (isLandscape ? '25px' : '40px')}; border-top: 2px solid black; width: 100%;"></div>
                    <div style="margin-top: 5px; font-weight: bold; font-size: ${fontSmall};">පරීක්ෂා කළේ</div>
                </div>
                <div style="text-align: center; width: 30%;">
                    <div style="margin-top: ${isCompact ? '15px' : (isLandscape ? '25px' : '40px')}; border-top: 2px solid black; width: 100%;"></div>
                    <div style="margin-top: 5px; font-weight: bold; font-size: ${fontSmall};">භාණ්ඩාගාරික</div>
                </div>
                <div style="text-align: center; width: 30%;">
                    <div style="margin-top: ${isCompact ? '15px' : (isLandscape ? '25px' : '40px')}; border-top: 2px solid black; width: 100%;"></div>
                    <div style="margin-top: 5px; font-weight: bold; font-size: ${fontSmall};">විදුහල්පති</div>
                </div>
            </div>
            
            <div style="text-align: right; margin-top: ${isCompact ? '8px' : (isLandscape ? '15px' : '20px')}; color: black; font-size: ${isCompact ? '7px' : (isLandscape ? '9px' : '11px')};">
                මුද්‍රණය: ${new Date().toLocaleString('si-LK')}
            </div>
        `;
        
        document.body.appendChild(tempDiv);
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'mm', 'a4');
        
        const canvas = await html2canvas(tempDiv, {
            scale: isCompact ? 3.5 : 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: (isLandscape ? 297 : 210) * 3.78,
            onclone: function(clonedDoc) {
                const style = clonedDoc.createElement('style');
                style.innerHTML = `
                    * {
                        -webkit-filter: grayscale(100%) !important;
                        filter: grayscale(100%) !important;
                    }
                `;
                clonedDoc.head.appendChild(style);
            }
        });
        
        document.body.removeChild(tempDiv);
        
        const imgData = canvas.toDataURL('image/png');
        
        // ========== Page Margins (1.5cm වටේම) ==========
        const marginMM = 15; // 1.5cm = 15mm
        const pageWidthMM = isLandscape ? 297 : 210;
        const pageHeightMM = isLandscape ? 210 : 297;
        const contentWidthMM = pageWidthMM - (marginMM * 2);
        const contentHeightMM = pageHeightMM - (marginMM * 2);
        
        const imgHeight = (canvas.height * contentWidthMM) / canvas.width;
        
        // Compact mode සඳහා - එක් පිටුවකට ගැලපේ නම්, උස අඩු කරන්න
        if (isCompact && imgHeight > contentHeightMM) {
            const scale = contentHeightMM / imgHeight;
            const newWidth = contentWidthMM * scale;
            const newX = marginMM + ((contentWidthMM - newWidth) / 2);
            pdf.addImage(imgData, 'PNG', newX, marginMM, newWidth, contentHeightMM);
        } else {
            let heightLeft = imgHeight;
            let position = marginMM; // ඉහළ margin එකෙන් පටන් ගන්න
            
            // පළමු පිටුව
            pdf.addImage(imgData, 'PNG', marginMM, position, contentWidthMM, imgHeight);
            heightLeft -= contentHeightMM;
            
            // අනෙක් පිටු
            while (heightLeft > 0) {
                position = marginMM + (heightLeft - imgHeight);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', marginMM, position, contentWidthMM, imgHeight);
                heightLeft -= contentHeightMM;
            }
        }
        
        const fileName = `වාර්තාව_${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(fileName);
        
        showToast("✅ PDF වාර්තාව බාගත කරන ලදී!");
    } catch (error) {
        console.error("PDF generation error:", error);
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
    
    // Year-end transfer select populate කිරීම
    const yearEndSource = document.getElementById('yearEndSourceSelect');
    if (yearEndSource) yearEndSource.innerHTML = '<option value=""></option>' + sCodeOptions;
    
    if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
        $('#replenishSourceSelect, #pettyCategorySelect, #yearEndSourceSelect').select2({
            placeholder: "තෝරන්න...",
            allowClear: true,
            width: '100%'
        });
    }
}

function editPettyExpense(id) {
    const expense = pettyExpenses.find(e => e.id == id);
    if (!expense) {
        showToast("⚠️ වියදම සොයාගත නොහැක!");
        return;
    }
    
    // Transferred වියදම් සංස්කරණය කළ හැක්කේ ADMIN ට පමණි
    if (expense.transferred && userRole !== 'ADMIN') {
        showToast("❌ මාරු කළ වියදම් සංස්කරණය කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    document.getElementById('pettyDate').value = expense.date;
    document.getElementById('pettyDesc').value = expense.desc;
    $('#pettyCategorySelect').val(expense.category).trigger('change');
    document.getElementById('pettyVoucher').value = expense.voucher;
    document.getElementById('pettyAmt').value = expense.amt.toFixed(2);
    document.getElementById('edit-petty-id').value = expense.id;
    document.getElementById('btn-save-petty').innerText = "යාවත්කාලීන කරන්න";
    
    document.getElementById('petty-expense-form').scrollIntoView({ behavior: 'smooth' });
}

async function savePettyExpense() {
    if(userRole === 'GUEST') {
        showToast("❌ සුළු මුදල් වියදම් ඇතුළත් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    const saveButton = document.getElementById('btn-save-petty');
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> සුරකිමින්...';
    
    const date = document.getElementById('pettyDate').value;
    const desc = document.getElementById('pettyDesc').value.trim();
    const category = $('#pettyCategorySelect').val();
    const voucher = document.getElementById('pettyVoucher').value.trim();
    const amt = parseAmount(document.getElementById('pettyAmt').value);
    const editId = document.getElementById('edit-petty-id')?.value;
    const isEdit = editId && editId !== '';
    
    if(!date) {
        showToast("⚠️ කරුණාකර දිනය ඇතුළත් කරන්න");
        saveButton.disabled = false;
        saveButton.innerHTML = "එකතු කරන්න";
        document.getElementById('pettyDate').focus();
        return;
    }
    
    if(!desc) {
        showToast("⚠️ කරුණාකර විස්තරය ඇතුළත් කරන්න");
        saveButton.disabled = false;
        saveButton.innerHTML = "එකතු කරන්න";
        document.getElementById('pettyDesc').focus();
        return;
    }
    
    if(!category) {
        showToast("⚠️ කරුණාකර කාණ්ඩය තෝරන්න");
        saveButton.disabled = false;
        saveButton.innerHTML = "එකතු කරන්න";
        $('#pettyCategorySelect').select2('open');
        return;
    }
    
    if(!voucher) {
        showToast("⚠️ කරුණාකර වවුචර් අංකය ඇතුළත් කරන්න");
        saveButton.disabled = false;
        saveButton.innerHTML = "එකතු කරන්න";
        document.getElementById('pettyVoucher').focus();
        return;
    }
    
    if(amt <= 0) {
        showToast("⚠️ කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න");
        saveButton.disabled = false;
        saveButton.innerHTML = "එකතු කරන්න";
        document.getElementById('pettyAmt').focus();
        return;
    }
    
    const excludeId = isEdit ? parseInt(editId) : null;
    if (checkDuplicatePettyExpense(date, voucher, amt, category, excludeId)) {
        showToast("⚠️ මෙම වවුචර් අංකය, දිනය, කාණ්ඩය සහ මුදල සහිත වියදමක් දැනටමත් පවතී!");
        saveButton.disabled = false;
        saveButton.innerHTML = "එකතු කරන්න";
        return;
    }
    
    const id = isEdit ? parseInt(editId) : (Date.now() + Math.floor(Math.random() * 1000));
    const data = {
        action: 'save_petty_expense',
        id: id,
        date: date,
        desc: desc,
        category: category,
        voucher: voucher,
        amt: amt,
        clientId: generateUUID()
    };
    
    toggleLoading(true);
    
    try {
        const result = await api.dbWrite({ action: 'save_petty_expense', data: data });
        
        if(result.status === 'success') {
            if (isEdit) {
                const index = pettyExpenses.findIndex(e => e.id == id);
                if (index !== -1) {
                    // Original transferred status එක රඳවා ගන්න
                    const originalTransferred = pettyExpenses[index].transferred;
                    pettyExpenses[index] = { ...data, transferred: originalTransferred };
                }
            } else {
                pettyExpenses.push({ ...data, transferred: false });
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
        showToast("❌ සුරැකීමේ දෝෂයක්! SQLite දත්ත ගබඩාවට සම්බන්ධ වීමට නොහැකි විය.");
    } finally {
        toggleLoading(false);
        saveButton.disabled = false;
        saveButton.innerHTML = "එකතු කරන්න";
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
    
    if(!confirm) return;
    
    toggleLoading(true);
    
    try {
        const result = await api.dbWrite({ action: 'delete_petty_expense', data: { id: id } });
        
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
    const float = parseAmount(document.getElementById('pettyFloat').value);
    
    if (float < 0) {
        showToast("⚠️ කරුණාකර වලංගු ස්ථාවර මුදලක් ඇතුළත් කරන්න (0 හෝ ඊට වැඩි)");
        document.getElementById('pettyFloat').focus();
        return;
    }
    
    const db = getData();
    const pettyEx = pettyExpenses;
    
    const totalReplenishmentsEver = db
        .filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය'))
        .reduce((sum, t) => sum + t.amt, 0);
    
    const totalExpensesEver = pettyEx.reduce((sum, e) => sum + e.amt, 0);
    
    const currentBalance = totalReplenishmentsEver - totalExpensesEver;
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
        isImprest: false,
        clientId: generateUUID()
    };
    
    toggleLoading(true);
    
    try {
        const result = await api.dbWrite({ action: 'save_transaction', data: data });
        
        if(result.status === 'success') {
            let db = getData();
            db.push(data);
            setDataCache(db);
            
            showToast(`✅ ප්‍රතිපූරණය සාර්ථකයි! ප්‍රතිපූරණ මුදල: රු. ${replenishAmount.toFixed(2)}`);
            
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
        showToast("❌ ප්‍රතිපූරණය අසාර්ථකයි!");
    } finally {
        toggleLoading(false);
    }
}

// -------------------- වර්ෂය අවසාන සුළු මුදල් මාරු කිරීම (Year-End Petty Cash Transfer) --------------------
async function yearEndPettyCashTransfer() {
    if (userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const sourceCode = $('#yearEndSourceSelect').val();
    if (!sourceCode) {
        showToast("⚠️ කරුණාකර ලැබීම් කේතය (S Code) තෝරන්න");
        $('#yearEndSourceSelect').select2('open');
        return;
    }
    
    const voucher = document.getElementById('yearEndVoucher').value.trim();
    if (!voucher) {
        showToast("⚠️ කරුණාකර වවුචර් අංකය ඇතුළත් කරන්න");
        document.getElementById('yearEndVoucher').focus();
        return;
    }
    
    const db = getData();
    const pettyEx = pettyExpenses;
    
    const totalReplenishments = db
        .filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය'))
        .reduce((sum, t) => sum + t.amt, 0);
    
    const totalExpenses = pettyEx.reduce((sum, e) => sum + e.amt, 0);
    const closingBalance = totalReplenishments - totalExpenses;
    
    if (closingBalance <= 0) {
        showToast(`⚠️ මාරු කිරීමට ශේෂයක් නැත. (වත්මන් ශේෂය: රු. ${closingBalance.toFixed(2)})`);
        return;
    }
    
    const confirmMessage = 
        `📅 දෙසැම්බර් 31 දිනට සුළු මුදල් ශේෂය: රු. ${closingBalance.toFixed(2)}\n` +
        `මෙම මුදල ${sourceCode} කේතයට ලැබීමක් ලෙස ඇතුළත් කර, ස්ථාවර මුදල 0 ලෙස සැකසීමට ඔබට අවශ්‍යද?\n\n` +
        `⚠️ මෙය වර්ෂය අවසානයේ එක් වරක් පමණක් කළ යුතු ක්‍රියාවකි.`;
    
    const confirm = await showConfirmDialog(
        "💰 වර්ෂය අවසාන සුළු මුදල් මාරු කිරීම",
        confirmMessage,
        "ඔව්, මාරු කරන්න",
        "අවලංගු කරන්න"
    );
    
    if (!confirm) return;
    
    const today = new Date();
    const transferDate = '2024-12-31'; // දෙසැම්බර් 31
    
    const data = {
        action: 'save_transaction',
        id: Date.now(),
        date: transferDate,
        ref: voucher,
        vouch: '',
        code: sourceCode,
        amt: closingBalance,
        desc: `වර්ෂය අවසාන සුළු මුදල් ශේෂය මාරු කිරීම (Petty Cash Year-End Transfer)`,
        type: 'IN',
        source: sourceCode,
        proj: '',
        status: true,
        isOp: false,
        isImprest: false,
        clientId: generateUUID()
    };
    
    toggleLoading(true);
    
    try {
        const result = await api.dbWrite({ action: 'save_transaction', data: data });
        
        if (result.status === 'success') {
            let dbData = getData();
            dbData.push(data);
            setDataCache(dbData);
            
            // ස්ථාවර මුදල 0 ලෙස සකසන්න
            localStorage.setItem('sch_petty_float', '0');
            document.getElementById('pettyFloat').value = '0.00';
            
            showToast(`✅ වර්ෂය අවසාන මාරු කිරීම සාර්ථකයි! රු. ${closingBalance.toFixed(2)} ${sourceCode} වෙත මාරු කරන ලදී.`);
            showToast("✅ ස්ථාවර මුදල 0 ලෙස සකසන ලදී. ජනවාරි 01 දින නව ස්ථාවර මුදලක් ඇතුළත් කරන්න.");
            
            document.getElementById('yearEndVoucher').value = '';
            $('#yearEndSourceSelect').val('').trigger('change');
            
            renderPettyBook();
            refreshDashboard();
        } else {
            throw new Error(result.message || 'Save failed');
        }
    } catch (error) {
        console.error("Year-end transfer error:", error);
        showToast("❌ වර්ෂය අවසාන මාරු කිරීම අසාර්ථකයි!");
    } finally {
        toggleLoading(false);
    }
}

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
    
    const receiptsBefore = db.filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය') && t.date < startDate)
                             .reduce((sum, t) => sum + t.amt, 0);
    const expensesBefore = pettyEx.filter(e => e.date < startDate).reduce((sum, e) => sum + e.amt, 0);
    const openingBalance = receiptsBefore - expensesBefore;
    
    const periodReceipts = db.filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය') && t.date >= startDate && t.date <= endDate);
    const totalReceipts = periodReceipts.reduce((sum, t) => sum + t.amt, 0);
    
    const periodExpenses = pettyEx.filter(e => e.date >= startDate && e.date <= endDate);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amt, 0);
    
    const closingBalance = openingBalance + totalReceipts - totalExpenses;
    
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
                @page {
                    size: A4;
                    margin: 2cm;
                }
                body { font-family: 'Noto Sans Sinhala', sans-serif; padding: 20px; }
                h1 { color: #1b5e20; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #1b5e20; color: #ffeb3b; padding: 10px; }
                td { padding: 8px; border: 1px solid #ddd; }
                .footer { margin-top: 30px; text-align: right; }
            </style>
        </head>
        <body>
            <h1>මො / ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
            <h2>කාලපරිච්ඡේද වාර්තාව</h2>
            ${content}
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
    
    toggleLoading(true);
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const canvas = await html2canvas(document.getElementById('periodReportContent'), {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // ========== Page Margins (1.5cm වටේම) ==========
        const marginMM = 15; // 1.5cm = 15mm
        const pageWidthMM = 210;
        const pageHeightMM = 297;
        const contentWidthMM = pageWidthMM - (marginMM * 2);
        const contentHeightMM = pageHeightMM - (marginMM * 2);
        
        const imgHeight = (canvas.height * contentWidthMM) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = marginMM;
        
        pdf.addImage(imgData, 'PNG', marginMM, position, contentWidthMM, imgHeight);
        heightLeft -= contentHeightMM;
        
        while (heightLeft > 0) {
            position = marginMM + (heightLeft - imgHeight);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', marginMM, position, contentWidthMM, imgHeight);
            heightLeft -= contentHeightMM;
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
		 if (!transRef) continue; 
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
        <div class="table-container" style="overflow-x: auto; max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px;">
            <table class="transaction-search-table" style="width: 100%; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr style="background: var(--deep-blue); color: white;">
                        <th style="padding: 12px; border: 1px solid #ddd;">දිනය</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">වර්ගය</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">කේතය</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">මූලාශ්‍රය</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">ලදුපත්/වවුචර්</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">චෙක්පත් අංකය</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">විස්තරය</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">මුදල (රු.)</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">ව්‍යාපෘතිය</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">ක්‍රියා</th>
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
        </div>
    `;
    
    resultsTable.innerHTML = html;
    resultCount.textContent = `ගනුදෙනු ${results.length}ක්`;
    resultsContainer.style.display = 'block';
    
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

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
        const result = await api.dbWrite({ action: 'delete', data: { id: id } });
        
        if (result.status === 'success') {
            let db = getData();
            db = db.filter(item => item.id != id);
            setDataCache(db);
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

// -------------------- සම්පූර්ණ දත්ත CSV බාගත කිරීම (Full CSV Export) --------------------
async function downloadFullCSVBackup() {
    if (userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    toggleLoading(true);
    
    try {
        // JSZip පුස්තකාලය පරීක්ෂා කරන්න
        if (typeof JSZip === 'undefined') {
            showToast("⚠️ JSZip පුස්තකාලය පූරණය වී නැත!");
            toggleLoading(false);
            return;
        }
        
        const zip = new JSZip();
        
        // 1. Transactions CSV
        const transactions = getData();
        let transactionsCSV = "ID,දිනය,වර්ගය,කේතය,මූලාශ්‍රය,මුදල,විස්තරය,වවුචර්,ලදුපත් අංකය,ව්‍යාපෘතිය,තත්ත්වය,isOp,isImprest\n";
        transactions.forEach(t => {
            transactionsCSV += `${t.id},${t.date},${t.type},${t.code},${t.source || ''},${t.amt},"${(t.desc || '').replace(/"/g, '""')}",${t.vouch || ''},${t.ref || ''},${t.proj || ''},${t.status ? 1 : 0},${t.isOp ? 1 : 0},${t.isImprest ? 1 : 0}\n`;
        });
        zip.file("transactions.csv", "\ufeff" + transactionsCSV);
        
        // 2. Projects CSV
        const projects = getProjects(true);
        let projectsCSV = "projectName,est,completed\n";
        projects.forEach(p => {
            projectsCSV += `${p.projectName},${p.est},${p.completed ? 1 : 0}\n`;
        });
        zip.file("projects.csv", "\ufeff" + projectsCSV);
        
        // 3. Allocations CSV
        let allocationsCSV = "code,amount,type\n";
        Object.keys(allocations).forEach(key => {
            if (!key.endsWith('_type')) {
                const type = allocations[key + '_type'] || '';
                allocationsCSV += `${key},${allocations[key]},${type}\n`;
            }
        });
        zip.file("allocations.csv", "\ufeff" + allocationsCSV);
        
        // 4. Petty Expenses CSV
        let pettyCSV = "id,date,desc,category,voucher,amt,transferred\n";
        pettyExpenses.forEach(e => {
            pettyCSV += `${e.id},${e.date},"${(e.desc || '').replace(/"/g, '""')}",${e.category},${e.voucher || ''},${e.amt},${e.transferred ? 1 : 0}\n`;
        });
        zip.file("petty_expenses.csv", "\ufeff" + pettyCSV);
        
        // 5. Period Expenses CSV
        let periodCSV = "id,date,desc,category,voucher,amt,source,periodStart,periodEnd\n";
        periodExpenses.forEach(e => {
            periodCSV += `${e.id},${e.date},"${(e.desc || '').replace(/"/g, '""')}",${e.category},${e.voucher || ''},${e.amt},${e.source || ''},${e.periodStart || ''},${e.periodEnd || ''}\n`;
        });
        zip.file("period_expenses.csv", "\ufeff" + periodCSV);
        
        // ZIP ගොනුව ජනනය කර බාගත කරන්න
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sfms_full_backup_${new Date().toISOString().slice(0,10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast("✅ සම්පූර්ණ දත්ත CSV ZIP ලෙස බාගත කරන ලදී!");
    } catch (error) {
        console.error("Full CSV backup error:", error);
        showToast("❌ CSV බාගත කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

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
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        const dialog = document.getElementById('confirmDialog');
        
        if (!titleEl || !messageEl || !yesBtn || !noBtn || !dialog) {
            console.error("Confirm dialog elements not found!");
            resolve(false);
            return;
        }
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        yesBtn.textContent = yesText;
        noBtn.textContent = noText;
        
        dialog.style.display = 'flex';
        
        const onYes = () => {
            dialog.style.display = 'none';
            cleanup();
            resolve(true);
        };
        
        const onNo = () => {
            dialog.style.display = 'none';
            cleanup();
            resolve(false);
        };
        
        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
        };
        
        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    });
}

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

function setAdvancesCache(data) {
    advancesCache = data;
    advances = data;
    sessionStorage.setItem('sch_advances', JSON.stringify(data));
}

function setAdvanceSettlementsCache(data) {
    advanceSettlementsCache = data;
    advanceSettlements = data;
    sessionStorage.setItem('sch_advance_settlements', JSON.stringify(data));
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

// මෙය global scope එකේ තබන්න (DOMContentLoaded එකට පෙර හෝ පසුව)
async function checkLogin(event) {
    if (event && event.key === 'Enter') event.preventDefault();

    const username = document.getElementById('usernameSelect').value;
    const password = document.getElementById('passInput').value;

    if (!username) {
        showToast("⚠️ කරුණාකර පරිශීලක නාමය තෝරන්න");
        return;
    }
    if (!password) {
        showToast("⚠️ කරුණාකර මුරපදය ඇතුළත් කරන්න");
        return;
    }

    toggleLoading(true);

    try {
        const users = await api.dbRead({ 
            action: 'read_user', 
            data: { username } 
        });
        
        if (!users || users.length === 0) {
            showToast("❌ පරිශීලක නාමය වලංගු නොවේ!");
            toggleLoading(false);
            return;
        }

        const user = users[0];
        
        if (user.password === password) {
            userRole = user.role;
            currentUsername = username; 
            document.getElementById('login-overlay').style.display = 'none';
            showSec('dash');
            applyPermissions();
            showToast(`✅ ${username} ලෙස පද්ධතියට ඇතුළු විය!`);
            
            fetchAllDataParallel().then(() => {
                refreshDashboard();
                loadRecentTable();
                renderPettyBook();
                renderCodesList();
                updateProjectSelects();
                renderProjectList();
                displaySavedPeriodSummaries();
                renderAdvancesList();
                initAdvanceForm();
            });
        } else {
            showToast("❌ වැරදි මුරපදය!");
            document.getElementById('passInput').value = '';
            document.getElementById('passInput').focus();
        }
    } catch (error) {
        console.error("Login error:", error);
        showToast("❌ පිවිසුම් දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Check if Electron API is available
    if (!window.electronAPI) {
        console.error("Electron API not available");
        return;
    }

    // Add login event listeners
    document.getElementById('usernameSelect').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkLogin();
        }
    });
    
    document.getElementById('passInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkLogin();
        }
    });
    
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    const fab = document.querySelector('.mobile-fab i');
    
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 600) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    if (fab) {
                        fab.className = 'fas fa-bars';
                    }
                }
            });
        });
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 600) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            if (fab) fab.className = 'fas fa-bars';
        }
    });
});

async function fetchAllDataParallel() {
    try {
        const promises = [
            fetchRemoteData(),
            fetchRemoteProjects(),
            fetchRemoteAllocations(),
            fetchRemotePettyExpenses(),
            fetchRemotePeriodExpenses(),
            fetchRemoteAdvances()
        ];
        
        const results = await Promise.allSettled(promises);
        
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
        const summaries = await api.dbRead({ action: 'read_period_summaries' });
        localStorage.setItem('sch_remote_period_summaries', JSON.stringify(summaries));
        return summaries;
    } catch (e) {
        console.error("Remote period summaries fetch error:", e);
        return [];
    }
}

async function saveBatchTransactions(transactions) {
    if (transactions.length === 0) return true;
    
    let successCount = 0;
    
    for (let t of transactions) {
        try {
            const transactionData = { ...t };
            const result = await api.dbWrite({ action: transactionData.action, data: transactionData });
            
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

async function manualRefresh() { 
    if (isLoading) return;
    
    toggleLoading(true);
    isLoading = true;
    
    try {
        await fetchAllDataParallel();
        
        refreshDashboard();
        loadRecentTable();
        renderPettyBook();
        renderAdvancesList();
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
        const remoteData = await api.dbRead({ action: 'read' });
        setDataCache(remoteData);
        let statusObj = {};
        remoteData.forEach(t => {
            if (t.type === 'EX' && t.ref && t.ref.trim() !== '') {
                statusObj[t.id] = t.status === 1 || t.status === true ? 'Cleared' : 'Pending';
            }
        });
        localStorage.setItem('sch_cleared', JSON.stringify(statusObj));
        clearedStatus = statusObj;
        return { success: true, data: remoteData };
    } catch (e) {
        console.error("Remote data fetch error:", e);
        const savedStatus = localStorage.getItem('sch_cleared');
        if (savedStatus) {
            clearedStatus = JSON.parse(savedStatus);
        }
        return { success: false, data: getData(), error: e.message };
    }
}

async function fetchRemoteProjects() {
    try {
        const projects = await api.dbRead({ action: 'read_projects' });
        
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
        const allocs = await api.dbRead({ action: 'read_allocations' });
        
        let allocObj = {};
        allocs.forEach(a => {
            if (a.code) {
                allocObj[a.code] = a.amount;
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
        const expenses = await api.dbRead({ action: 'read_petty_expenses' });
        
        // ⚠️ SQLite වලින් ලැබෙන transferred (0/1) boolean බවට පරිවර්තනය කරන්න
        const convertedExpenses = expenses.map(exp => ({
            ...exp,
            transferred: exp.transferred === 1 || exp.transferred === true
        }));
        
        setPettyExpensesCache(convertedExpenses);
        return convertedExpenses;
    } catch (e) {
        console.error("Remote petty expenses fetch error:", e);
        pettyExpenses = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
        return pettyExpenses;
    }
}

async function fetchRemotePeriodExpenses() {
    try {
        const expenses = await api.dbRead({ action: 'read_period_expenses' });
        setPeriodExpensesCache(expenses);
    } catch (e) {
        console.error("Remote period expenses fetch error:", e);
        periodExpenses = JSON.parse(sessionStorage.getItem('sch_period_expenses') || '[]');
    }
}

async function fetchRemoteAdvances() {
    try {
        const advanceList = await api.dbRead({ action: 'read_advances' });
        setAdvancesCache(advanceList || []);
        return advanceList;
    } catch (e) {
        console.error("Remote advances fetch error:", e);
        advances = JSON.parse(sessionStorage.getItem('sch_advances') || '[]');
        return advances;
    }
}

async function fetchRemoteAdvanceSettlements(advanceId) {
    try {
        const settlements = await api.dbRead({ 
            action: 'read_advance_settlements', 
            data: { advance_id: advanceId } 
        });
        return settlements || [];
    } catch (e) {
        console.error("Remote advance settlements fetch error:", e);
        return [];
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

// ⚠️ නව function: OPEN-BAL බැහැර කර සැබෑ S කේත දත්ත ලබා ගැනීම
function getAllDataExcludingGeneralOpening() {
    return getAllExpenseDataForReports().filter(r => 
        r.code !== 'OPEN-BAL' && r.source !== 'OPEN-BAL'
    );
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
                @page {
                    size: A4;
                    margin: 2cm;
                }
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
            <h1>මො / ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
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
                @page {
                    size: A4;
                    margin: 2cm;
                }
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
            <h1>මො / ගම්පංගුව කනිෂ්ඨ විද්‍යාලය</h1>
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
                    <tr><td>ලිපි ද්‍රව්‍ය</td><td>REx1</td><td style="text-align:right;">${REx1.toFixed(2)}</td></tr>
                    <tr><td>උපකරණ නඩත්තු</td><td>REx5</td><td style="text-align:right;">${REx5.toFixed(2)}</td></tr>
                    <tr><td>සුළු නඩත්තු</td><td>REx6</td><td style="text-align:right;">${REx6.toFixed(2)}</td></tr>
                    <tr><td>පවිත්‍රතා</td><td>REx7</td><td style="text-align:right;">${REx7.toFixed(2)}</td></tr>
                    <tr><td>විවිධ</td><td>REx3</td><td style="text-align:right;">${REx3.toFixed(2)}</td></tr>
                    <tr class="total"><td colspan="2" style="text-align:right;">මුළු එකතුව:</td><td style="text-align:right;">${total.toFixed(2)}</td></tr>
                </tbody>
            </table>
            
            <p style="text-align:center; margin-top: 20px; color: #666; font-size: 12px;">
                මුද්‍රණය කළ දිනය: ${new Date().toLocaleString('si-LK')}
            </p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

async function saveManualPeriodExpenses() {
    if(userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const allPettyExpenses = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
   const untransferredExpenses = allPettyExpenses.filter(exp => {
        return exp.transferred !== true && exp.transferred !== 1;
    });
    
    console.log("Untransferred expenses:", untransferredExpenses.length); // Debug සඳහා
    
    if (untransferredExpenses.length === 0) {
        showToast("⚠️ මාරු කිරීමට අළුත් සුළු මුදල් වියදම් නැත!");
        return;
    }

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

    const currentDate = new Date().toISOString().split('T')[0];
    
    const firstExpense = untransferredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    const periodStartDate = firstExpense.date;
    
    const db = getData();
    const lastReplenishment = db
        .filter(t => t.type === 'EX' && t.code === 'PC' && t.desc.includes('ප්‍රතිපූරණය'))
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    let effectiveStartDate = periodStartDate;
    if (lastReplenishment && new Date(lastReplenishment.date) > new Date(periodStartDate)) {
        effectiveStartDate = lastReplenishment.date;
    }
    
    const lastExpense = untransferredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const periodEndDate = lastExpense.date > currentDate ? lastExpense.date : currentDate;
    
    const periodName = effectiveStartDate === periodEndDate 
        ? `${effectiveStartDate} දින` 
        : `${effectiveStartDate} සිට ${periodEndDate} දක්වා`;

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
    const periodTransactions = [];
    const baseTimestamp = Date.now();
    let counter = 0;
    
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount <= 0) continue;
        
        const uniqueId = baseTimestamp + counter + 
            (category === 'REx1' ? 100 : 
             category === 'REx5' ? 200 : 
             category === 'REx6' ? 300 : 
             category === 'REx7' ? 400 : 500);
        counter++;
            
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
                periodEnd: periodEndDate,
                clientId: generateUUID()
            };
            periodTransactions.push(periodExpenseData);
        }

        const saveResults = [];
        let successCount = 0;
        
        for (const transaction of periodTransactions) {
            try {
                const result = await api.dbWrite({ action: 'save_period_expense', data: transaction });
                
                if (result.status === 'success') {
                    successCount++;
                    saveResults.push({ id: transaction.id, success: true });
                    periodExpenses.push(transaction);
                } else {
                    saveResults.push({ id: transaction.id, success: false, error: result.message });
                    console.error("Failed to save period expense:", result);
                }
            } catch (e) {
                saveResults.push({ id: transaction.id, success: false, error: e.message });
                console.error("Error saving period expense:", e);
            }
        }
        
        setPeriodExpensesCache(periodExpenses);
        
        if (successCount > 0) {
            const transferResults = await markExpensesAsTransferred(untransferredExpenses, allPettyExpenses);
            
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
                    },
                    clientId: generateUUID()
                };
                
                await api.dbWrite({ action: 'save_period_summary', data: summaryData }).catch(e => console.log("Summary save non-critical error:", e));
            } catch (summaryError) {
                console.error("Period summary save error (non-critical):", summaryError);
            }

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
            let errorDetails = saveResults.filter(r => !r.success).map(r => r.error).join(', ');
            showToast(`❌ කිසිදු Period Expense එකක් සුරැකීමට නොහැකි විය! ${errorDetails ? 'දෝෂය: ' + errorDetails : ''}`);
        }

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
                transferred: 1,  // ⚠️ SQLite සඳහා 1 ලෙස යවන්න
                clientId: generateUUID()
            };
            
            const result = await api.dbWrite({ action: 'mark_expense_transferred', data: updateData });
            
            if (result.status === 'success') {
                results.success++;
                const index = allPettyExpenses.findIndex(e => e.id === expense.id);
                if (index !== -1) {
                    // ⚠️ දෙකම ගබඩා කරන්න - boolean සහ integer
                    allPettyExpenses[index].transferred = true;      // frontend සඳහා
                    allPettyExpenses[index].transferred_db = 1;      // backend සඳහා (විකල්ප)
                }
            } else {
                results.failed++;
                results.details.push({ id: expense.id, error: result.message });
            }
        } catch (error) {
            results.failed++;
            results.details.push({ id: expense.id, error: error.message });
            console.error(`Error updating transferred status for expense ${expense.id}:`, error);
        }
    }
    
    // ⚠️ sessionStorage එකට සුරැකීමේදී boolean ලෙස ගබඩා කරන්න
    setPettyExpensesCache(allPettyExpenses);
    
    return results;
}
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
        if(entryNav) entryNav.style.display = 'none';
        const projNav = document.getElementById('nav-proj');
        if(projNav) projNav.style.display = 'none';
        const pettyNav = document.getElementById('nav-petty');
        if(pettyNav) pettyNav.style.display = 'none';
        const advNav = document.getElementById('nav-advances');
        if(advNav) advNav.style.display = 'none';
    } 
    else if(userRole === 'ADMIN') {
        document.querySelectorAll('.staff-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.getElementById('print-btn').style.display = 'flex';
        document.getElementById('pdf-btn').style.display = 'flex';
        document.querySelectorAll('.table-btn').forEach(btn => btn.style.display = 'inline-flex');
        
        const csvExportBtn = document.querySelector('#transactionSearchResults .btn[onclick*="exportSearchResults"]');
        if (csvExportBtn) csvExportBtn.style.display = 'flex';
        
        const fullCsvBtn = document.querySelector('#fullCsvBackupBtn');
        if (fullCsvBtn) fullCsvBtn.style.display = 'flex';
        
        const entryNav = document.getElementById('nav-entry');
        if(entryNav) entryNav.style.display = 'block';
        const projNav = document.getElementById('nav-proj');
        if(projNav) projNav.style.display = 'block';
        const pettyNav = document.getElementById('nav-petty');
        if(pettyNav) pettyNav.style.display = 'block';
        const advNav = document.getElementById('nav-advances');
        if(advNav) advNav.style.display = 'block';
    }
    else if(userRole === 'STAFF') {
        document.querySelectorAll('.staff-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.getElementById('print-btn').style.display = 'flex';
        document.getElementById('pdf-btn').style.display = 'flex';
        
        const csvExportBtn = document.querySelector('#transactionSearchResults .btn[onclick*="exportSearchResults"]');
        if (csvExportBtn) csvExportBtn.style.display = 'none';
        
        const entryNav = document.getElementById('nav-entry');
        if(entryNav) entryNav.style.display = 'block';
        const projNav = document.getElementById('nav-proj');
        if(projNav) projNav.style.display = 'block';
        const pettyNav = document.getElementById('nav-petty');
        if(pettyNav) pettyNav.style.display = 'block';
        const advNav = document.getElementById('nav-advances');
        if(advNav) advNav.style.display = 'block';
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
        
        $('#inCodeSelect, #exCodeSelect, #exSourceSelect, #opCodeSelect, #allocCodeSelect, #pettyCategorySelect, #replenishSourceSelect, #multiInProjSelect, #allocTypeSelect, #yearEndSourceSelect').each(function() {
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
    
    // ⚠️ විශේෂ option: ආරම්භක මුදල් ශේෂය (General Opening Balance)
    const generalOpeningOption = `<option value="OPEN-BAL" style="color: #e67e22; font-weight: bold;">💰 මුදල් ශේෂය (ආරම්භක සාමාන්‍ය ශේෂය)</option>`;
    
    ['inCodeSelect', 'opCodeSelect'].forEach(sId => {
        const el = document.getElementById(sId);
        if(el) {
            el.innerHTML = `<option value=""></option>` + sCodeOptions;
        }
    });
    
    // ⚠️ exSourceSelect සඳහා වෙන වෙනම - OPEN-BAL option එක එකතු කරන්න
    const exSourceEl = document.getElementById('exSourceSelect');
    if (exSourceEl) {
        exSourceEl.innerHTML = `<option value=""></option>` + generalOpeningOption + sCodeOptions;
    }

    ['exCodeSelect'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.innerHTML = `<option value=""></option>` + exCodeOptions;
        }
    });

    const allocCodeSelectEl = document.getElementById('allocCodeSelect');
    if (allocCodeSelectEl) {
        allocCodeSelectEl.innerHTML = '<option value=""></option>';
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
    
    // Year-end transfer select populate කිරීම
    const yearEndEl = document.getElementById('yearEndSourceSelect');
    if (yearEndEl) {
        yearEndEl.innerHTML = `<option value=""></option>` + sCodeOptions;
    }
    
    const repFilter = document.getElementById('repFilter');
    if (repFilter) {
        repFilter.innerHTML = '<option value="ALL">සියලුම කේතයන්</option>' + 
                              sCodeOptions + exCodeOptions;
    }
    
    const allocTypeEl = document.getElementById('allocTypeSelect');
    if (allocTypeEl) {
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

// ⚠️ නව function: ශේෂ වර්ගය අනුව UI toggle කිරීම
function toggleOpeningBalanceType() {
    const type = document.getElementById('opBalanceType')?.value || 'GENERAL';
    const codeWiseBox = document.getElementById('opCodeWiseBox');
    
    if (codeWiseBox) {
        codeWiseBox.style.display = type === 'CODE_WISE' ? 'block' : 'none';
    }
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const toggle = document.querySelector(`[onclick="toggleDropdown('${dropdownId}')"]`);
    
    if (!dropdown || !toggle) return;
    
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        toggle.classList.add('active');
    } else {
        dropdown.style.display = 'none';
        toggle.classList.remove('active');
    }
}

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
    
    const saveButton = document.getElementById('btn-save-' + prefix);
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> සුරකිමින්...';
    
    const action = isEdit ? 'update_transaction' : 'save_transaction';
    
    let referenceValue = "";
    if (type === 'IN') {
        const fromRef = document.getElementById('inRefFrom').value.trim();
        const toRef = document.getElementById('inRefTo').value.trim();
        
        const excludeId = isEdit ? currentId : null;
        const duplicateCheck = checkDuplicateReceipt(fromRef, toRef, excludeId);
        if (duplicateCheck.isDuplicate) {
            showToast(duplicateCheck.message);
            saveButton.disabled = false;
            saveButton.innerHTML = "ලැබීම ගිණුම්ගත කරන්න";
            return;
        }
        
        referenceValue = formatReceiptRange(fromRef, toRef);
    } else {
        referenceValue = document.getElementById(prefix + 'Ref')?.value || '';
        
        const voucher = document.getElementById('exVoucher').value;
        const date = document.getElementById('exDate').value;
        const amount = parseAmount(document.getElementById('exAmt').value);
        const excludeId = isEdit ? currentId : null;
        
        if (checkDuplicateTransaction(date, voucher, amount, 'EX', excludeId)) {
            showToast("⚠️ මෙම වවුචර් අංකය, දිනය සහ මුදල සහිත ගනුදෙනුවක් දැනටමත් පවතී!");
            saveButton.disabled = false;
            saveButton.innerHTML = "ගෙවීම ගිණුම්ගත කරන්න";
            return;
        }
    }
    
    // 6. දත්ත Object එක සැකසීම
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
        status: (type === 'EX' && document.getElementById('exRef')?.value?.trim() !== '') ? false : true,
        isOp: false,
        isImprest: false,
        clientId: generateUUID()
    };
    
    toggleLoading(true);
    
    try {
        const result = await api.dbWrite({ action: action, data: data });
        
        if (result.status === 'success') {
            let db = getData();
            
            if (isEdit) {
                const existingIndex = db.findIndex(item => item.id === currentId);
                if (existingIndex !== -1) {
                    db[existingIndex] = { ...data };
                }
            } else {
                db.push({ ...data });
            }
            
            setDataCache(db);
            
            showToast(isEdit ? "✅ ගනුදෙනුව සාර්ථකව යාවත්කාලීන කරන ලදී!" : "✅ නව ගනුදෙනුව සාර්ථකව ගිණුම්ගත කරන ලදී!");
            refreshDashboard();
            loadRecentTable();
            resetForms(); // Form එක reset කිරීම
        } else {
            throw new Error(result.message || 'Save failed');
        }
        
    } catch (error) {
        console.error("Save error:", error);
        showToast("❌ දත්ත සුරැකීමේ දෝෂයක්! SQLite දත්ත ගබඩාවට සම්බන්ධ වීමට නොහැකි විය.");
    } finally {
        toggleLoading(false);
        saveButton.disabled = false;
        saveButton.innerHTML = type === 'IN' ? "ලැබීම ගිණුම්ගත කරන්න" : "ගෙවීම ගිණුම්ගත කරන්න";
    }
    
}

async function saveOpening() {
    if(userRole === 'GUEST') {
        showToast("❌ ආරම්භක ශේෂයන් වෙනස් කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    const balanceType = document.getElementById('opBalanceType')?.value || 'GENERAL';
    const amt = parseAmount(document.getElementById('opAmt').value || 0);
    
    if(amt <= 0) {
        showToast("⚠️ වලංගු මුදලක් ඇතුළත් කරන්න");
        document.getElementById('opAmt').focus();
        return;
    }
    
    let code, source, desc;
    
    if (balanceType === 'GENERAL') {
        // ⚠️ සාමාන්‍ය මුදල් ශේෂය — S කේත වලට බෙදා නොහැර
        code = 'OPEN-BAL';
        source = 'OPEN-BAL';
        desc = 'වර්ෂය ආරම්භක මුදල් ශේෂය';
    } else {
        // S කේත අනුව ශේෂය
        code = $('#opCodeSelect').val();
        if(!code || code === "") {
            showToast("⚠️ කරුණාකර අරමුදල් කේතය තෝරන්න");
            $('#opCodeSelect').select2('open');
            return;
        }
        source = code;
        desc = `${code} කේතයේ ආරම්භක ශේෂය`;
    }
    
    toggleLoading(true);
    
    const data = { 
        action: 'save_transaction', 
        id: Date.now(), 
        date: new Date().getFullYear() + "-01-01", 
        ref: 'OPENING', 
        vouch: '', 
        code: code, 
        amt: amt, 
        desc: desc, 
        type: 'IN', 
        source: source, 
        isOp: true, 
        status: true,
        isImprest: false,
        clientId: generateUUID()
    };
    
    try {
        const result = await api.dbWrite({ action: 'save_transaction', data: data });
        
        if (result.status === 'success') {
            let db = getData();
            db.push(data);
            setDataCache(db);
            showToast(balanceType === 'GENERAL' 
                ? "✅ සාමාන්‍ය මුදල් ශේෂය ගිණුම්ගත කෙරිණි!" 
                : "✅ ආරම්භක ශේෂය ගිණුම්ගත කෙරිණි!");
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

async function saveAllocation() {
    if(userRole === 'GUEST') {
        showToast("❌ ප්‍රතිපාදන ගිණුම්ගත කිරීමට ඔබට අවසර නැත.");
        return;
    }
    
    const code = $('#allocCodeSelect').val();
    const amt = parseAmount(document.getElementById('allocAmt').value || 0);
    const type = $('#allocTypeSelect').val();
    
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
        allocType: type,
        clientId: generateUUID()
    };
    
    try {
        const result = await api.dbWrite({ action: 'save_allocation', data: data });
        
        if (result.status === 'success') {
            allocations[code] = amt; 
            allocations[code + '_type'] = type;
            setAllocationsCache(allocations);
            showToast(`✅ ${type === 'IN' ? 'ලැබීම්' : 'ගෙවීම්'} ප්‍රතිපාදන ගිණුම්ගත කරන ලදී!`);
            
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

function openReport(type) {
    currentReport = type;
    showSec('report');
    
    document.querySelectorAll('.sub-nav').forEach(item => {
        item.classList.remove('active');
    });
    
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
	const bankMonthBox = document.getElementById('bank-month-box');
    const bankAdjustmentForm = document.getElementById('bank-adjustment-form');
    const bankAdjustmentsList = document.getElementById('bankAdjustmentsList');
     if(type === 'BANK') {
        bankBalBox.style.display = 'block';
        bankMonthBox.style.display = 'block';
        bankAdjustmentForm.style.display = 'block';
        bankAdjustmentsList.style.display = 'block';
        populateBankMonths();
        loadBankAdjustmentsList();
    } else {
        bankBalBox.style.display = 'none';
        bankMonthBox.style.display = 'none';
        bankAdjustmentForm.style.display = 'none';
        bankAdjustmentsList.style.display = 'none';
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
    if (code === 'PC') {
        const floatAmount = loadPettyFloat();
        const pettyExpenses = JSON.parse(sessionStorage.getItem('sch_petty_expenses') || '[]');
        const transferredCount = pettyExpenses.filter(e => e.transferred).length;
        const pendingCount = pettyExpenses.filter(e => !e.transferred).length;
        
        let html = '<div style="margin-bottom: 20px;">';
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">';
        html += '<div style="background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">';
        html += '<div style="font-size: 12px; color: #155724;">ස්ථාවර මුදල (Float)</div>';
        html += '<div style="font-size: 20px; font-weight: bold; color: green;">' + floatAmount.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</div>';
        html += '</div>';
        html += '<div style="background: #d1ecf1; padding: 12px; border-radius: 8px; text-align: center;">';
        html += '<div style="font-size: 12px; color: #0c5460;">වියදම් තොරතුරු</div>';
        html += '<div style="font-size: 16px; font-weight: bold;">මාරු කළ: ' + transferredCount + ' | ඉතිරි: ' + pendingCount + '</div>';
        html += '</div>';
        html += '</div>';
        
        html += '<div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 5px solid #17a2b8;">';
        html += '<div style="font-size: 14px; color: #0c5460;">';
        html += '<strong>PC කේතය පිළිබඳ විස්තර:</strong><br>';
        html += '• මෙය සුළු මුදල් ස්ථාවර මුදල (Petty Cash Float) පමණක් නිරූපණය කරයි.<br>';
        html += '• සුළු මුදල් වියදම් REx කේත වලට මාරු කිරීමෙන් පසු ඒවා අදාළ REx කේත යටතේ පෙන්වයි.<br>';
        html += '• ප්‍රතිපූරණ ගනුදෙනු ඒවායේ මූලාශ්‍ර S කේත යටතේ පෙන්වයි.<br>';
        html += '• එමනිසා PC කේතය යටතේ පෙන්වන්නේ වත්මන් ස්ථාවර මුදල පමණි.';
        html += '</div></div></div>';
        
        document.getElementById('modalCodeTitle').innerHTML = 
            '<span style="font-size: 15px; font-weight: bold;">PC - සුළු මුදල් (Petty Cash)</span>';
        document.getElementById('codeDetailsContent').innerHTML = html;
        document.getElementById('codeDetailsModal').style.display = 'flex';
        return;
    }
    
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
async function generateReport() {
    const allData = getAllExpenseDataForReports();
    const db = getData();
    const from = document.getElementById('repFrom').value;
    const to = document.getElementById('repTo').value;
    const selectedCode = document.getElementById('repFilter').value; 
    let html = '';
    
    let filtered = allData.filter(r => !r.isOp && (!from || r.date >= from) && (!to || r.date <= to));

    if (currentReport === 'CASHBOOK') {
        document.getElementById('report-header-title').innerText = "මුදල් පොත";
        document.getElementById('report-header-title').style.fontSize = "24px";
        document.getElementById('report-header-title').style.fontWeight = "bold";
        document.getElementById('report-header-title').style.color = "#0984e3";

let allTransactions = db.filter(r => !r.isOp).sort((a, b) => new Date(a.date) - new Date(b.date));
// අත්තිකාරම් නිකුතු ද ඇතුළත් වේ (code === 'ADV')
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
    document.getElementById('report-header-title').innerText = 
        (currentReport === 'IN' ? "ලැබීම් විශ්ලේෂණ වාර්තාව" : "ගෙවීම් විශ්ලේෂණ වාර්තාව") + 
        (selectedCode !== 'ALL' ? ` - ${selectedCode}` : "");
 
    let codes;
    if (selectedCode === 'ALL') {
        codes = (currentReport === 'IN' ? S_CODES : EX_CODES);
    } else {
        codes = [selectedCode];
    }
 
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
        let transactions = [];
        let codeTotal = 0;
        let transactionCount = 0;
        let codeDescription = CODE_INFO[code] || (code === 'PC' ? 'සුළු මුදල් අග්‍රිමය (Petty Cash Imprest)' : '');
        
        if (currentReport === 'EX' && code === 'PC') {
            const floatAmount = loadPettyFloat(); 
            codeTotal = floatAmount; 
            transactionCount = 1; 
        } else {
            transactions = allData.filter(r => 
                r.type === currentReport && 
                r.code === code && 
                (!from || r.date >= from) && 
                (!to || r.date <= to)
            );
            codeTotal = transactions.reduce((sum, t) => sum + t.amt, 0);
            transactionCount = transactions.length;
        }
        
        const openingAmt = openingBalances[code] || 0;
        const effectiveOpeningAmt = currentReport === 'IN' ? openingAmt : 0;
        const grandTotalForCode = currentReport === 'IN' ? (effectiveOpeningAmt + codeTotal) : codeTotal;
        
        grandTotal += grandTotalForCode;
        totalTransactions += transactionCount;
        totalOpening += effectiveOpeningAmt;
        
        html += `
        <tr style="border-bottom: 1px solid #eee; ${transactionCount > 0 ? 'background: #f9f9f9;' : ''}">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: var(--primary);">${code}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${codeDescription}</td>
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
                ${code !== 'PC' ? `
                <button onclick="viewCodeDetails('${code}', '${currentReport}')" 
                    style="background: ${currentReport === 'IN' ? 'var(--success)' : 'var(--danger)'}; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 auto; height: 36px; min-width: 100px; transition: all 0.3s;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 3px 10px rgba(0,0,0,0.15)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <span>🔍</span> විස්තර
                </button>
                ` : `
                <span style="color: #999; font-size: 11px;">ස්ථාවර මුදල</span>
                `}
            </td>
         </tr>`;
        
        // ========== නව කොටස: තනි කේතයක් තෝරාගත් විට සවිස්තරාත්මක තොරතුරු ==========
        if (selectedCode !== 'ALL' && code === selectedCode && transactionCount > 0) {
            html += generateDetailedCodeReport(code, currentReport, transactions, allData, from, to);
        }
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
    document.getElementById('report-header-title').innerText = "බැංකු සැසඳුම් ප්‍රකාශය";
    
    const selectedMonth = document.getElementById('bankReconMonth').value;
    let bankStmtBal = parseAmount(document.getElementById('bankStmtInput').value || 0);
    
    let startDate, endDate;
    let adjustments = [];
    
    if (selectedMonth) {
        // තෝරාගත් මාසය සඳහා දින සීමාව ගණනය කරන්න
        const [year, month] = selectedMonth.split('-');
        startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${year}-${month}-${lastDay}`;
        
        // මෙම මාසය සඳහා ගැලපුම් ගනුදෙනු ලබා ගන්න
        adjustments = await getBankAdjustmentsForMonth(selectedMonth);
    } else {
        startDate = from;
        endDate = to;
        adjustments = [];
    }
    
    // සාමාන්‍ය ගනුදෙනු පෙරීම
    let uncreditedList = db.filter(r => 
        r.type === 'IN' && 
        r.vouch && r.vouch.trim() !== '' &&
        r.isOp !== true &&
        (clearedStatus[r.id] || 'Pending') === 'Pending' &&
        (!startDate || r.date >= startDate) && 
        (!endDate || r.date <= endDate)
    );
    let totalUncredited = uncreditedList.reduce((a, b) => a + b.amt, 0);

    let unpresentedList = db.filter(r => 
        r.type === 'EX' && 
        r.ref && r.ref.trim() !== '' &&
        (clearedStatus[r.id] || 'Pending') === 'Pending' &&
        (!startDate || r.date >= startDate) && 
        (!endDate || r.date <= endDate)
    );
    let totalUnpresented = unpresentedList.reduce((a, b) => a + b.amt, 0);
    
    // ගැලපුම් ගනුදෙනු වෙන වෙනම ගණනය කිරීම
    let adjustmentAdditions = 0;
    let adjustmentDeductions = 0;
    let adjustmentList = [];
    
    adjustments.forEach(adj => {
        if (adj.type === 'DEPOSIT' || adj.type === 'INTEREST') {
            adjustmentAdditions += adj.amount;
            adjustmentList.push({ ...adj, isAddition: true });
        } else {
            adjustmentDeductions += adj.amount;
            adjustmentList.push({ ...adj, isAddition: false });
        }
    });

    let adjustedBalance = bankStmtBal + totalUncredited + adjustmentAdditions - totalUnpresented - adjustmentDeductions;

    html = `
        <div style="background: #ffffff; padding: 20px; border: 2px solid #333; border-radius: 5px; color: #000;">
            <h3 style="text-align:center; text-decoration: underline;">බැංකු සැසඳුම් ප්‍රකාශය - ${selectedMonth ? selectedMonth : (to || 'අද දිනට')}</h3>
            ${selectedMonth ? `<p style="text-align:center; color:#3498db; margin-top:-10px;"><i class="fas fa-info-circle"></i> පසුව ඇතුළත් කළ ගැලපුම් ගනුදෙනු ඇතුළත් කර ඇත</p>` : ''}
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
        html += `<tr><td style="padding-left:40px; font-size: 0.9em; color: #666;">නිශ්කාෂණය නොවූ චෙක්පත් ලැබීම් නැත</td><td style="text-align:right;">0.00</td></tr>`;
    }
    
    // ගැලපුම් එකතු කිරීම් (පසුව ඇතුළත් කළ ඒවා)
    if (adjustmentAdditions > 0) {
        html += `<tr><td colspan="2" style="padding: 8px; color: #2980b9;"><b>එකතු කිරීම:</b> පසුව ඇතුළත් කළ බැංකු ගැලපුම් (Bank Adjustments)</td></tr>`;
        
        adjustmentList.filter(a => a.isAddition).forEach(adj => {
            const typeText = adj.type === 'DEPOSIT' ? 'සෘජු ප්‍රේෂණ' : adj.type === 'INTEREST' ? 'පොලී ආදායම' : adj.type;
            html += `<tr style="background: #e8f4fd;">
                <td style="padding-left:40px; font-size: 0.9em;">
                    📅 ${adj.date} - ${adj.description}<br>
                    <span style="color: #666; font-size: 0.85em;">${typeText} ${adj.cheque_no ? '| චෙක්පත්: ' + adj.cheque_no : ''}</span>
                    <span style="color: #27ae60; margin-left: 10px; font-size: 0.85em;">(Added Later)</span>
                </td>
                <td style="text-align:right; padding-right: 20px; font-weight: bold; color: #27ae60;">
                    + ${adj.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
             </tr>`;
        });
    }

    html += `<tr>
                <td style="padding-left:80px;"><b>මුළු නිශ්කාෂණය නොවූ චෙක්පත් ලැබීම් + ගැලපුම් එකතුව</b></td>
                <td style="text-align:right; border-top:1px solid #000; padding: 8px; font-weight: bold; color: #27ae60;">
                    + ${(totalUncredited + adjustmentAdditions).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
             </tr>
            <tr style="background:#f0f0f0;">
                <td style="padding: 8px;"><b>උප එකතුව (Bank Balance + Uncredited + Adjustments)</b></td>
                <td style="text-align:right; padding: 8px;"><b> 
                    ${(bankStmtBal + totalUncredited + adjustmentAdditions).toLocaleString(undefined, {minimumFractionDigits: 2})}
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
        html += `<tr><td style="padding-left:40px; font-size: 0.9em; color: #666;">ඉදිරිපත් නොවූ චෙක්පත් නැත</td><td style="text-align:right;">0.00</td></tr>`;
    }
    
    // ගැලපුම් අඩු කිරීම් (පසුව ඇතුළත් කළ බැංකු ගාස්තු)
    if (adjustmentDeductions > 0) {
        html += `<tr><td colspan="2" style="padding: 8px; color: #e67e22;"><b>අඩු කිරීම:</b> පසුව ඇතුළත් කළ බැංකු ගාස්තු / ගැලපුම්</td></tr>`;
        
        adjustmentList.filter(a => !a.isAddition).forEach(adj => {
            const typeText = adj.type === 'CHARGE' ? 'බැංකු ගාස්තු' : adj.type;
            html += `<tr style="background: #fff3e0;">
                <td style="padding-left:40px; font-size: 0.9em;">
                    📅 ${adj.date} - ${adj.description}<br>
                    <span style="color: #666; font-size: 0.85em;">${typeText} ${adj.cheque_no ? '| චෙක්පත්: ' + adj.cheque_no : ''}</span>
                    <span style="color: #e67e22; margin-left: 10px; font-size: 0.85em;">(Added Later)</span>
                </td>
                <td style="text-align:right; padding-right: 20px; font-weight: bold; color: #e67e22;">
                    - ${adj.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
             </tr>`;
        });
    }

    html += `<tr>
                <td style="padding-left:80px;"><b>මුළු ඉදිරිපත් නොකළ චෙක්පත් + ගැලපුම් අඩුකිරීම්</b></td>
                <td style="text-align:right; border-top:1px solid #000; padding: 8px; font-weight: bold; color: #c0392b;">
                    - ${(totalUnpresented + adjustmentDeductions).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
             </tr>
            <tr style="border-bottom: 4px double #000; background: #fff8e1;">
                <td style="padding: 12px;"><b style="font-size:1.2em;">මුදල් පොතේ නිවැරදි ශේෂය (Adjusted Cash Book Balance)</b></td>
                <td style="text-align:right; padding: 12px;"><b style="font-size:1.2em; color: #1b5e20;"> 
                    ${adjustedBalance > 0 ? adjustedBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                </b></td>
             </tr>
            <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-size: 0.85em; color: #666; border-top: 1px dashed #999;">
                    <i class="fas fa-calculator"></i> ගණනය කිරීම: බැංකු ශේෂය ${bankStmtBal.toLocaleString(undefined, {minimumFractionDigits: 2})} 
                    + නිශ්කාෂණය නොවූ ලැබීම් ${totalUncredited.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    + පසුව එකතු කළ ලැබීම් ${adjustmentAdditions.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    - ඉදිරිපත් නොවූ ගෙවීම් ${totalUnpresented.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    - පසුව එකතු කළ ගාස්තු ${adjustmentDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}
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
            const incomeTransactions = allData.filter(r => 
                r.type === 'IN' && 
                (r.code === code || r.source === code) && 
                (!from || r.date >= from) && 
                (!to || r.date <= to)
            );
            const income = incomeTransactions.reduce((sum, r) => sum + r.amt, 0);
            const transactionCount = incomeTransactions.length;
            
            const budget = allocations[code] || 0;
            const balance = budget - income;
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
    document.getElementById('report-header-title').innerText = "සිව්මස් ගිණුම් වාර්තාව";
    
    const fromDate = new Date(document.getElementById('repFrom').value);
    const toDate = new Date(document.getElementById('repTo').value);
    const yearStart = new Date(fromDate.getFullYear(), 0, 1); 

    // ========== ආරම්භක ශේෂයන් එකතුව ගණනය කිරීම ==========
    // ========== ආරම්භක ශේෂයන් එකතුව ගණනය කිරීම ==========
    let totalOpeningBalance = 0;
    const openingBalances = {};
    
    // ⚠️ සාමාන්‍ය මුදල් ශේෂය (OPEN-BAL) ඇත්නම් එය මුළු ආරම්භක ශේෂයට එකතු කරන්න
    const generalOpeningBalance = allData
        .filter(r => r.isOp && r.code === 'OPEN-BAL')
        .reduce((sum, r) => sum + (Number(r.amt) || 0), 0);
    
    totalOpeningBalance += generalOpeningBalance;
    
    // S කේත අනුව ආරම්භක ශේෂයන්
    S_CODES.forEach(code => {
        const openingAmt = allData.filter(r => 
            r.isOp && 
            r.code !== 'OPEN-BAL' && 
            (r.code === code || r.source === code)
        ).reduce((sum, r) => sum + (Number(r.amt) || 0), 0);
        openingBalances[code] = openingAmt;
        totalOpeningBalance += openingAmt;
    });

    // ========== අත්තිකාරම් ගණනය කිරීම ==========
    let advancesIssuedThisQuarter = 0;
    let advancesIssuedBefore = 0;
    let advancesSettledThisQuarter = 0;
    let advancesSettledBefore = 0;
    let advancesReturnedThisQuarter = 0;
    let advancesReturnedBefore = 0;
    
    // අත්තිකාරම් නිකුතු - transactions table එකෙන් (code = 'ADV')
    db.filter(t => t.code === 'ADV' && t.type === 'EX').forEach(t => {
        const txnDate = new Date(t.date);
        if (txnDate >= yearStart && txnDate < fromDate) {
            advancesIssuedBefore += Number(t.amt) || 0;
        } else if (txnDate >= fromDate && txnDate <= toDate) {
            advancesIssuedThisQuarter += Number(t.amt) || 0;
        }
    });
    
    // අත්තිකාරම් පියවීම් - period_expenses වලින් (source = 'ADV')
    periodExpenses.filter(p => p.source === 'ADV').forEach(p => {
        const expDate = new Date(p.date);
        if (expDate >= yearStart && expDate < fromDate) {
            advancesSettledBefore += Number(p.amt) || 0;
        } else if (expDate >= fromDate && expDate <= toDate) {
            advancesSettledThisQuarter += Number(p.amt) || 0;
        }
    });
    
    // අත්තිකාරම් ශේෂය ආපසු ලැබීම් - transactions වලින් (code = 'ADV-RET', type = 'IN')
    db.filter(t => t.code === 'ADV-RET' && t.type === 'IN').forEach(t => {
        const txnDate = new Date(t.date);
        if (txnDate >= yearStart && txnDate < fromDate) {
            advancesReturnedBefore += Number(t.amt) || 0;
        } else if (txnDate >= fromDate && txnDate <= toDate) {
            advancesReturnedThisQuarter += Number(t.amt) || 0;
        }
    });

    let tinTotal = totalOpeningBalance;
    let texTotal = 0;

    html = `
        <table class="q-table" style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background: var(--primary); color: white;">
                    <th colspan="5" class="q-header">ලැබීම් (හර)</th>
                    <th colspan="5" class="q-header">ගෙවීම් (බැර)</th>
                  </tr>
                <tr style="background: #2c3e50; color: white;">
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
    
    // ========== ආරම්භක ශේෂය පේළිය ==========
    // ========== ආරම්භක ශේෂය පේළිය ==========
    const openingBalanceLabel = generalOpeningBalance > 0 
        ? 'මුදල් ශේෂය' 
        : 'ආරම්භක ශේෂය';
    const openingBalanceNote = generalOpeningBalance > 0 
        ? `<br><small style="font-size: 9px; color: #a04000;">S කේත වලට බෙදා නොහැර ${yearStart.getFullYear()} ජනවාරි 01</small>` 
        : `<br><small style="font-size: 9px; color: #a04000;">${yearStart.getFullYear()} ජනවාරි 01</small>`;
    
    html += `
        <tr style="background: linear-gradient(135deg, #f9e79f 0%, #f7dc6f 100%); font-weight: bold; border-bottom: 2px solid #e67e22;">
            <td style="padding: 10px; font-size: 14px;">
                <i class="fas fa-chart-line" style="color: #e67e22;"></i> 
                <span style="color: #b45f06;">${openingBalanceLabel}</span>
                ${openingBalanceNote}
            </td>
            <td class="val-col" style="background: #fff3cd;">-</td>
            <td class="val-col" style="background: #fff3cd;">-</td>
            <td class="val-col" style="background: #fff3cd;">-</td>
            <td class="val-col" style="background: #fff3cd; font-size: 16px; color: #2c3e50;">
                ${totalOpeningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </td>
            <td style="background: #fff3cd;"></td>
            <td class="val-col" style="background: #fff3cd;">-</td>
            <td class="val-col" style="background: #fff3cd;">-</td>
            <td class="val-col" style="background: #fff3cd;">-</td>
            <td class="val-col" style="background: #fff3cd;">-</td>
          </tr>`;

    const maxLength = Math.max(S_CODES.length, EX_CODES.length);
    
    for (let i = 0; i <= maxLength; i++) {
        let s = S_CODES[i] || '';
        let ex = EX_CODES[i] || '';
        
        let sPrev = 0, sCurr = 0, sAllocation = 0;
        
        if (s) {
            sAllocation = allocations[s] || 0;
            
            // ⚠️ අත්තිකාරම් ආපසු ලැබීම් (ADV-RET) බැහැර කරන්න — ඒවා සැබෑ ලැබීම් නොවේ
            // r.code === s පමණක් බලන්න (source එකෙන් එන ADV-RET බැහැර වේ)
            sPrev = allData.filter(r => 
                r.type === 'IN' && !r.isOp && 
                r.code !== 'ADV-RET' && 
                r.code !== 'ADV' && 
                (r.code === s || (r.source === s && r.code !== 'ADV-RET')) && 
                new Date(r.date) >= yearStart && 
                new Date(r.date) < fromDate
            ).reduce((a, b) => a + (Number(b.amt) || 0), 0);
            
            sCurr = allData.filter(r => 
                r.type === 'IN' && !r.isOp && 
                r.code !== 'ADV-RET' && 
                r.code !== 'ADV' && 
                (r.code === s || (r.source === s && r.code !== 'ADV-RET')) && 
                new Date(r.date) >= fromDate && 
                new Date(r.date) <= toDate
            ).reduce((a, b) => a + (Number(b.amt) || 0), 0);
            
            tinTotal += (sPrev + sCurr);
        }
        
        let exPrev = 0, exCurr = 0, exAllocation = 0;
        
        let exTotalForCode = 0;
        
        if (ex === 'PC') {
            // PC කේතය යටතේ පෙන්විය යුත්තේ ස්ථාවර මුදල (Petty Cash Float) පමණි.
            // ප්‍රතිපූරණය කළ මුදල් අදාළ REx වියදම් කේත යටතේ දැනටමත් පෙන්වයි.
            // එම නිසා මෙහි ප්‍රතිපූරණ එකතු නොකළ යුතුය (Double Counting වැළැක්වීමට).
            const floatAmount = loadPettyFloat();
            exAllocation = floatAmount;
            exPrev = 0;
            exCurr = 0;
            exTotalForCode = floatAmount;
        } else if (ex) {
            exAllocation = allocations[ex] || 0;
            exPrev = allData.filter(r => 
                r.type === 'EX' && r.code === ex && 
                new Date(r.date) >= yearStart && 
                new Date(r.date) < fromDate
            ).reduce((a, b) => a + (Number(b.amt) || 0), 0);
            
            exCurr = allData.filter(r => 
                r.type === 'EX' && r.code === ex && 
                new Date(r.date) >= fromDate && 
                new Date(r.date) <= toDate
            ).reduce((a, b) => a + (Number(b.amt) || 0), 0);
            
            exTotalForCode = exPrev + exCurr;
        }
        
        if (ex) {
            texTotal += exTotalForCode;
        }
        
        // S කේත පේළිය
        html += `<tr style="${s ? 'border-left: 3px solid #2e7d32;' : ''}">
            <td style="padding: 8px; font-weight: bold; ${s ? 'color: #2e7d32;' : 'color:#999;'}">${s || '-'}${s ? ' <span style="font-size: 9px; color: #27ae60;">(S)</span>' : ''}</td>
            <td class="val-col">${sAllocation > 0 ? sAllocation.toLocaleString(undefined, {minimumFractionDigits: 2}) : (s ? '-' : '')}</td>
            <td class="val-col">${sPrev > 0 ? sPrev.toLocaleString(undefined, {minimumFractionDigits: 2}) : (s ? '-' : '')}</td>
            <td class="val-col" style="color: ${sCurr > 0 ? '#27ae60' : (s ? '#666' : '')};">${sCurr > 0 ? sCurr.toLocaleString(undefined, {minimumFractionDigits: 2}) : (s ? '-' : '')}</td>
            <td class="val-col" style="background:#f9f9f9; font-weight: bold;">${(sPrev + sCurr) > 0 ? (sPrev + sCurr).toLocaleString(undefined, {minimumFractionDigits: 2}) : (s ? '-' : '')}</td>
            
            <td style="padding: 8px; font-weight: bold; ${ex ? 'color: #c0392b;' : 'color:#999;'}">${ex || '-'}${ex === 'PC' ? ' <span style="font-size: 9px; color: #e67e22;">(PC)</span>' : (ex ? ' <span style="font-size: 9px; color: #e74c3c;">(EX)</span>' : '')}</td>
            <td class="val-col">${exAllocation > 0 ? exAllocation.toLocaleString(undefined, {minimumFractionDigits: 2}) : (ex ? '-' : '')}</td>
            <td class="val-col">${exPrev > 0 ? exPrev.toLocaleString(undefined, {minimumFractionDigits: 2}) : (ex ? '-' : '')}</td>
            <td class="val-col" style="color: ${exCurr > 0 ? '#e67e22' : (ex ? '#666' : '')};">${exCurr > 0 ? exCurr.toLocaleString(undefined, {minimumFractionDigits: 2}) : (ex ? '-' : '')}</td>
			            <td class="val-col" style="background:#f9f9f9; font-weight: bold;">${exTotalForCode > 0 ? exTotalForCode.toLocaleString(undefined, {minimumFractionDigits: 2}) : (ex ? '-' : '')}</td>
          </tr>`;
    } 

      // ========== අත්තිකාරම් පේළිය (ශුද්ධ අගය = නිකුත් - පියවූ - ආපසු ලැබීම්) ==========
    const advancesNetThisQuarter = advancesIssuedThisQuarter - advancesSettledThisQuarter - advancesReturnedThisQuarter;
    
    if (advancesNetThisQuarter !== 0) {
        html += `
            <tr style="background: #fdebd0; border-bottom: 2px solid #e67e22;">
                <td colspan="4" style="text-align: right; font-weight: bold; padding: 10px; color: #b45f06;">
                    <i class="fas fa-hand-holding-usd"></i> ශුද්ධ අත්තිකාරම් (Net Advances) - මෙම සිව්මස:
                </td>
                <td class="val-col" style="background: #fad7a0; font-weight: bold; color: #b45f06; font-size: 16px;">
                    ${advancesNetThisQuarter.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td colspan="5" style="background: #fdebd0; border: 1px solid #bdc3c7;"></td>
              </tr>`;
        
        texTotal += advancesNetThisQuarter;
    }
    
    // ========== සාරාංශ පේළි ==========
    html += `<tr class="q-total-row" style="background: #e8f5e9; border-top: 2px solid #2e7d32;">
        <td colspan="4" style="text-align: right; font-weight: bold; padding: 12px; font-size: 14px;">මුළු ලැබීම් එකතුව (ආරම්භක ශේෂය ඇතුළුව)</td>
        <td class="val-col" style="background: #c8e6c9; font-size: 18px; font-weight: bold;">${tinTotal > 0 ? tinTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
        <td colspan="4" style="text-align: right; font-weight: bold; padding: 12px; font-size: 14px;">මුළු ගෙවීම් එකතුව</td>
        <td class="val-col" style="background: #ffcdd2; font-size: 18px; font-weight: bold;">${texTotal > 0 ? texTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
      </tr>
      <tr class="q-total-row" style="background: #fff3e0;">
        <td colspan="9" style="text-align: right; font-weight: bold; font-size: 16px; padding: 12px;">අතැති ශේෂය (Balance)</td>
        <td class="val-col" style="background: #ffe0b2; font-size: 20px; font-weight: bold; color: ${(tinTotal - texTotal) >= 0 ? '#1b5e20' : '#c0392b'};">${(tinTotal - texTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
      </tr>`;
    
    html += `</tbody>
        </table>`;
    
    document.getElementById('report-content').innerHTML = html;
}
    else {
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

            // PC ප්‍රතිපූරණය සඳහා මෙම S කේතයෙන් ලබා දුන් මුදල් එකතු කරන්න
            const pcReplenishments = allData.filter(r => 
                r.type === 'EX' && 
                r.code === 'PC' && 
                r.source === c &&
                r.desc && r.desc.includes('ප්‍රතිපූරණය') &&
                (!from || r.date >= from) && 
                (!to || r.date <= to)
            ).reduce((a, b) => a + b.amt, 0);

            const totalIncomeForCode = incomeAmt + pcReplenishments;

            if (currentReport === 'IN') {
                const expenseAmt = allData.filter(r => r.type === 'EX' && r.source === c && (!from || r.date >= from) && (!to || r.date <= to)).reduce((a, b) => a + b.amt, 0);
                const balance = totalIncomeForCode - expenseAmt;
                html += `<tr><td><b>${c}</b></td><td>${CODE_INFO[c]}</td><td class="val-col">${totalIncomeForCode > 0 ? totalIncomeForCode.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td><td class="val-col" style="color:red;">${expenseAmt > 0 ? expenseAmt.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td><td class="val-col" style="font-weight:bold;">${balance > 0 ? balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : ' - '}</td></tr>`;
                totalIn += totalIncomeForCode;
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
    
    document.getElementById('report-content').innerHTML = html;
    document.getElementById('report-date-range').innerText = `කාලසීමාව: ${(from || "ආරම්භය")} සිට ${(to || "අද")} දක්වා`;
}
// තනි කේතයක සවිස්තරාත්මක වාර්තාව ජනනය කිරීම
function generateDetailedCodeReport(code, reportType, transactions, allData, from, to) {
    let detailsHtml = '';
    
    // ගෙවීම් වාර්තාවක් නම් (EX)
    if (reportType === 'EX') {
        const sourceCodesUsed = {};
        
        transactions.forEach(tr => {
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
        
        if (Object.keys(sourceCodesUsed).length > 0) {
            detailsHtml += `
                <tr style="background: #f5f5f5;">
                    <td colspan="7" style="padding: 15px 10px 5px 10px;">
                        <div style="margin-top: 20px; border-top: 2px solid #8e44ad; padding-top: 15px;">
                            <h4 style="color: var(--primary); margin: 0 0 10px 0; font-size: 14px;">
                                <i class="fas fa-chart-pie"></i> 📊 ${code} කේතයෙන් ගෙවා ඇති මූලාශ්‍ර අරමුදල් (S Codes)
                            </h4>
                        </div>
                    </td>
                </tr>
                <tr style="background: #e8f5e9;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">මූලාශ්‍ර කේතය</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">විස්තරය</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">මුළු වියදම (රු.)</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">ගනුදෙනු ගණන</th>
                    <th colspan="3" style="border: 1px solid #ddd;"></th>
                </tr>`;
            
            const sortedSourceCodes = Object.values(sourceCodesUsed).sort((a, b) => {
                return S_CODES.indexOf(a.code) - S_CODES.indexOf(b.code);
            });
            
            sortedSourceCodes.forEach(source => {
                detailsHtml += `
                    <tr style="background: #fff;">
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2e7d32;">${source.code}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${source.name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #c62828;">
                            ${source.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                            <span style="background: #6c757d; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">
                                ${source.transactions.length}
                            </span>
                        </td>
                        <td colspan="3" style="border: 1px solid #ddd;"></td>
                    </tr>`;
            });
        }
        
        // ගෙවීම් ගනුදෙනු විස්තර
        detailsHtml += `
            <tr style="background: #f5f5f5;">
                <td colspan="7" style="padding: 15px 10px 5px 10px;">
                    <div style="margin-top: 15px;">
                        <h4 style="color: var(--danger); margin: 0 0 10px 0; font-size: 14px;">
                            <i class="fas fa-list"></i> 📋 ${code} කේතය යටතේ ගෙවීම් ගනුදෙනු
                        </h4>
                    </div>
                </td>
            </tr>
            <tr style="background: #ffebee;">
                <th style="padding: 8px; border: 1px solid #ddd;">දිනය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">විස්තරය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">වවුචර් අංකය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">චෙක්පත් අංකය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">මූලාශ්‍රය (S Code)</th>
                <th style="padding: 8px; border: 1px solid #ddd;">ව්‍යාපෘතිය</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">මුදල (රු.)</th>
            </tr>`;
        
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(tr => {
            detailsHtml += `
                <tr>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.date}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.desc}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.vouch || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.ref || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold; color: #2e7d32;">
                        ${tr.source || '-'}
                        ${tr.source && CODE_INFO[tr.source] ? '<br><small style="color:#666;">' + CODE_INFO[tr.source].substring(0, 30) + '...</small>' : ''}
                    </td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.proj || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: red;">
                        ${tr.amt.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                </tr>`;
        });
    }
    
    // ලැබීම් වාර්තාවක් නම් (IN)
    else if (reportType === 'IN') {
        // මෙම ලැබීම් කේතයෙන් ගෙවා ඇති වියදම් කේත
        const expenseCodesUsed = {};
        const expenseTransactions = allData.filter(r => 
            r.type === 'EX' && 
            r.source === code && 
            (!from || r.date >= from) && 
            (!to || r.date <= to)
        );
        
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
        
        if (Object.keys(expenseCodesUsed).length > 0) {
            detailsHtml += `
                <tr style="background: #f5f5f5;">
                    <td colspan="7" style="padding: 15px 10px 5px 10px;">
                        <div style="margin-top: 20px; border-top: 2px solid #8e44ad; padding-top: 15px;">
                            <h4 style="color: var(--primary); margin: 0 0 10px 0; font-size: 14px;">
                                <i class="fas fa-chart-pie"></i> 📊 ${code} කේතයෙන් ගෙවා ඇති වියදම් කේත (EX Codes)
                            </h4>
                        </div>
                    </td>
                </tr>
                <tr style="background: #fdeaea;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ගෙවීම් කේතය</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">විස්තරය</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">මුළු වියදම (රු.)</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">ගනුදෙනු ගණන</th>
                    <th colspan="3" style="border: 1px solid #ddd;"></th>
                </tr>`;
            
            const sortedExpenseCodes = Object.values(expenseCodesUsed).sort((a, b) => {
                return EX_CODES.indexOf(a.code) - EX_CODES.indexOf(b.code);
            });
            
            sortedExpenseCodes.forEach(expCode => {
                detailsHtml += `
                    <tr style="background: #fff;">
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #b71c1c;">${expCode.code}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${expCode.name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #c62828;">
                            ${expCode.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                            <span style="background: #6c757d; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">
                                ${expCode.transactions.length}
                            </span>
                        </td>
                        <td colspan="3" style="border: 1px solid #ddd;"></td>
                    </tr>`;
            });
        }
        
        // ලැබීම් ගනුදෙනු විස්තර (ආරම්භක ශේෂයන් සහිතව)
        const openingTransactions = allData.filter(r => r.isOp && (r.code === code || r.source === code));
        const currentIncomeTransactions = transactions;
        const allIncomeTransactions = [...openingTransactions, ...currentIncomeTransactions];
        
        detailsHtml += `
            <tr style="background: #f5f5f5;">
                <td colspan="7" style="padding: 15px 10px 5px 10px;">
                    <div style="margin-top: 15px;">
                        <h4 style="color: var(--success); margin: 0 0 10px 0; font-size: 14px;">
                            <i class="fas fa-list"></i> 📋 ${code} කේතය යටතේ ලැබීම් ගනුදෙනු
                        </h4>
                    </div>
                </td>
            </tr>
            <tr style="background: #d4edda;">
                <th style="padding: 8px; border: 1px solid #ddd;">දිනය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">විස්තරය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">ලදුපත් අංකය/පරාසය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">චෙක්පත් අංකය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">ව්‍යාපෘතිය</th>
                <th style="padding: 8px; border: 1px solid #ddd;">වර්ගය</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">මුදල (රු.)</th>
            </tr>`;
        
        allIncomeTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(tr => {
            const isOpening = tr.isOp === true;
            detailsHtml += `
                <tr style="${isOpening ? 'background: #e3f2fd;' : ''}">
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.date}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.desc}${isOpening ? ' <span style="background:#0984e3; color:white; padding:2px 6px; border-radius:10px; font-size:9px;">ආරම්භක</span>' : ''}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.ref || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.vouch || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${tr.proj || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${isOpening ? 'ආරම්භක ශේෂය' : 'ලැබීම'}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: green;">
                        ${tr.amt.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                </tr>`;
        });
    }
    
    return detailsHtml;
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
        const selectElement = event?.target;
        if (selectElement) {
            selectElement.value = status === 'Cleared' ? 'Pending' : 'Cleared';
        }
        return;
    }
    
    toggleLoading(true);
    
    try {
        // clientId එක එවන්න එපා - status පමණක් එවන්න
        const result = await api.dbWrite({ 
            action: 'update_cheque_status', 
            data: {
                id: id,
                status: status === 'Cleared' // boolean
                // clientId ඉවත් කර ඇත
            }
        });
        
        if (result.status === 'success') {
            // Local storage update කරන්න
            clearedStatus[id] = status;
            localStorage.setItem('sch_cleared', JSON.stringify(clearedStatus));
            
            // Transactions cache update කරන්න
            let db = getData();
            let transactionIndex = db.findIndex(t => t.id == id);
            if (transactionIndex !== -1) {
                db[transactionIndex].status = (status === 'Cleared');
                setDataCache(db);
            }
            
            showToast(`✅ චෙක්පත ${status} ලෙස යාවත්කාලීන කරන ලදී!`);
            generateReport();
        } else {
            throw new Error(result.message || 'Server update failed');
        }
    } catch (error) {
        console.error("Cheque status update error:", error);
        showToast("❌ දත්ත ගබඩාවට ලිවීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
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
    
    // ⚠️ සාමාන්‍ය මුදල් ශේෂය පෙන්වන්න (තිබේ නම්)
       const generalOpeningBalance = db
        .filter(r => r.isOp && r.code === 'OPEN-BAL')
        .reduce((sum, r) => sum + (Number(r.amt) || 0), 0);
    
    // ⚠️ OPEN-BAL මූලාශ්‍රය භාවිතා කරමින් සිදු කළ ගනුදෙනු ගණනය කරන්න
    const generalOpeningIncome = db
        .filter(r => !r.isOp && r.type === 'IN' && r.source === 'OPEN-BAL')
        .reduce((sum, r) => sum + (Number(r.amt) || 0), 0);
    
    const generalOpeningExpense = db
        .filter(r => !r.isOp && r.type === 'EX' && r.source === 'OPEN-BAL')
        .reduce((sum, r) => sum + (Number(r.amt) || 0), 0);
    
    // වත්මන් මුදල් ශේෂය = ආරම්භක + ලැබීම් − ගෙවීම්
    const generalCurrentBalance = generalOpeningBalance + generalOpeningIncome - generalOpeningExpense;
    
    if (generalOpeningBalance > 0 || generalCurrentBalance > 0) {
        const balanceColor = generalCurrentBalance >= 0 ? '#7f4f00' : '#c0392b';
        fundHtml += `
            <div class="fund-box" style="background: linear-gradient(135deg, #f39c12 0%, #fbc02d 100%); position: relative;">
                <span class="fund-index"><i class="fas fa-wallet"></i></span>
                <div class="fund-code" style="font-size: 22px;">
                    මුදල් ශේෂය
                </div>
                <div class="fund-amount ${generalCurrentBalance >= 0 ? 'positive' : 'negative'}" style="color: ${balanceColor};">
                    ${generalCurrentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </div>
                <div class="fund-description">
                    ආරම්භක ශේෂය: රු. ${generalOpeningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </div>
            </div>`;
    }
    
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
    let html = '<table><tr><th>දිනය</th><th>විස්තරය</th><th>ලදුපත්/වවුචර්</th><th>මුදල (රු.)</th><th>ක්‍රියා</th></tr>';
    
    db.sort((a,b) => b.id - a.id).slice(0,5).forEach(r => {
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
        const result = await api.dbWrite({ action: 'saveProject', data: {
            action: 'saveProject',
            projectName: name,
            est: est,
            completed: false,
            clientId: generateUUID()
        }});
        
        if (result.status === 'success') {
            showToast("✅ ව්‍යාපෘතිය සුරැකිණි!"); 
            await fetchRemoteProjects(); 
        } else {
            throw new Error(result.message || 'Save failed');
        }
        
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
        const result = await api.dbWrite({ action: 'completeProject', data: {
            action: 'completeProject',
            projectName: projectName,
            completed: true,
            clientId: generateUUID()
        }});
        
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
        } else {
            throw new Error(result.message || 'Server error');
        }
        
        renderProjectList();
        updateProjectSelects();
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
        const result = await api.dbWrite({ action: 'delete_project', data: { name: projectName } });

        if (result.status === 'success') {
            let projects = getProjects(true);
            projects = projects.filter(p => p.projectName !== projectName);
            setProjectsCache(projects);
            showToast(`✅ "${projectName}" ව්‍යාපෘතිය ඉවත් කරන ලදී!`);
        } else {
            throw new Error(result.message || 'Server error');
        }
        
        renderProjectList();
        updateProjectSelects();
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
    if(id === 'advances') {
        renderAdvancesStats();
        renderAdvancesList();
        initAdvanceForm();
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

// app.js හි එකතු කළ යුතු නව ශ්‍රිත

// ==================== බැංකු ගැලපුම් කළමනාකරණය ====================

async function saveBankAdjustment() {
    if (userRole !== 'ADMIN') {
        showToast("❌ බැංකු ගැලපුම් එකතු කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const originalMonth = document.getElementById('adjOriginalMonth').value;
    const date = document.getElementById('adjDate').value;
    const type = document.getElementById('adjType').value;
    const description = document.getElementById('adjDesc').value.trim();
    const amount = parseAmount(document.getElementById('adjAmount').value);
    const chequeNo = document.getElementById('adjChequeNo').value.trim();
    
    if (!originalMonth) {
        showToast("⚠️ කරුණාකර මුල් මාසය තෝරන්න");
        return;
    }
    
    if (!date) {
        showToast("⚠️ කරුණාකර ගනුදෙනු දිනය ඇතුළත් කරන්න");
        return;
    }
    
    if (!description) {
        showToast("⚠️ කරුණාකර විස්තරය ඇතුළත් කරන්න");
        return;
    }
    
    if (amount <= 0) {
        showToast("⚠️ කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න");
        return;
    }
    
    const currentDate = new Date();
    const adjustmentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const data = {
        action: 'save_bank_adjustment',
        original_month: originalMonth,
        adjustment_month: adjustmentMonth,
        date: date,
        description: description,
        amount: amount,
        type: type,
        cheque_no: chequeNo,
        clientId: generateUUID()
    };
    
    toggleLoading(true);
    
    try {
        const result = await api.dbWrite({ action: 'save_bank_adjustment', data: data });
        
        if (result.status === 'success') {
            showToast("✅ බැංකු ගැලපුම් ගනුදෙනුව සුරකින ලදී!");
            
            // පෝරමය පිරිසිදු කරන්න
            document.getElementById('adjOriginalMonth').value = '';
            document.getElementById('adjDate').value = '';
            document.getElementById('adjDesc').value = '';
            document.getElementById('adjAmount').value = '';
            document.getElementById('adjChequeNo').value = '';
            
            // ලැයිස්තුව refresh කරන්න
            if (currentReport === 'BANK') {
                loadBankAdjustmentsList();
                generateReport();
            }
        } else {
            throw new Error(result.message || 'Save failed');
        }
    } catch (error) {
        console.error("Save bank adjustment error:", error);
        showToast("❌ බැංකු ගැලපුම් සුරැකීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function loadBankAdjustmentsList() {
    const selectedMonth = document.getElementById('bankReconMonth').value;
    if (!selectedMonth) return;
    
    try {
        const adjustments = await api.dbRead({ 
            action: 'get_bank_adjustments', 
            data: { original_month: selectedMonth }
        });
        
        const container = document.getElementById('bankAdjustmentsTable');
        const listContainer = document.getElementById('bankAdjustmentsList');
        
        if (!adjustments || adjustments.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">මෙම මාසය සඳහා ගැලපුම් ගනුදෙනු නැත</p>';
            listContainer.style.display = 'block';
            return;
        }
        
        let html = `
            <table style="width:100%; border-collapse: collapse; background:white; border-radius:8px; overflow:hidden;">
                <thead>
                    <tr style="background: #3498db; color: white;">
                        <th style="padding:10px;">දිනය</th>
                        <th style="padding:10px;">වර්ගය</th>
                        <th style="padding:10px;">විස්තරය</th>
                        <th style="padding:10px;">මුදල (රු.)</th>
                        <th style="padding:10px;">චෙක්පත් අංකය</th>
                        <th style="padding:10px;">තත්ත්වය</th>
                        <th style="padding:10px;">ක්‍රියා</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        adjustments.forEach(adj => {
            const typeIcon = adj.type === 'DEPOSIT' ? '📥' : adj.type === 'CHARGE' ? '💰' : adj.type === 'INTEREST' ? '📈' : '🔄';
            const amountColor = (adj.type === 'DEPOSIT' || adj.type === 'INTEREST') ? 'green' : 'red';
            const amountSign = (adj.type === 'DEPOSIT' || adj.type === 'INTEREST') ? '+' : '-';
            
            html += `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:8px;">${adj.date}${adj.type === 'CHARGE' ? ' (Bank Charge)' : ''}${adj.type === 'DEPOSIT' ? ' (Direct Deposit)' : ''}${adj.type === 'INTEREST' ? ' (Interest)' : ''}</td>
                    <td style="padding:8px;">${typeIcon} ${adj.type}</td>
                    <td style="padding:8px;">${adj.description}</td>
                    <td style="padding:8px; text-align:right; font-weight:bold; color:${amountColor};">${amountSign} ${parseFloat(adj.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td style="padding:8px;">${adj.cheque_no || '-'}</td>
                    <td style="padding:8px;">
                        <span style="background: ${adj.status === 'RECONCILED' ? '#27ae60' : '#f39c12'}; color:white; padding:3px 8px; border-radius:12px; font-size:11px;">
                            ${adj.status === 'RECONCILED' ? '✓ සමපාත කළා' : '⏳ එකතු කළා'}
                        </span>
                    </td>
                    <td style="padding:8px; text-align:center;">
                        <button class="table-btn" style="background:#e74c3c; color:white;" onclick="deleteBankAdjustment(${adj.id})">
                            <i class="fas fa-trash"></i> මකන්න
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        container.innerHTML = html;
        listContainer.style.display = 'block';
        
    } catch (error) {
        console.error("Load bank adjustments error:", error);
    }
}

async function deleteBankAdjustment(id) {
    if (userRole !== 'ADMIN') {
        showToast("❌ මකා දැමීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const confirm = await showConfirmDialog(
        "🗑️ බැංකු ගැලපුම් මකන්න",
        "මෙම ගැලපුම් ගනුදෙනුව ස්ථිරවම මකා දමන්නද?",
        "ඔව්, මකන්න",
        "අවලංගු කරන්න"
    );
    
    if (!confirm) return;
    
    toggleLoading(true);
    
    try {
        const result = await api.dbWrite({ action: 'delete_bank_adjustment', data: { id: id } });
        
        if (result.status === 'success') {
            showToast("✅ ගැලපුම් ගනුදෙනුව මකා දමන ලදී!");
            loadBankAdjustmentsList();
            generateReport();
        } else {
            throw new Error(result.message || 'Delete failed');
        }
    } catch (error) {
        console.error("Delete bank adjustment error:", error);
        showToast("❌ මකා දැමීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function getBankAdjustmentsForMonth(month) {
    try {
        const adjustments = await api.dbRead({ 
            action: 'get_bank_adjustments', 
            data: { original_month: month }
        });
        return adjustments || [];
    } catch (error) {
        console.error("Get bank adjustments error:", error);
        return [];
    }
}

function populateBankMonths() {
    const monthSelect = document.getElementById('bankReconMonth');
    if (!monthSelect) return;
    
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2; // පසුගිය අවුරුදු 2
    
    let options = '<option value="">-- මාසයක් තෝරන්න --</option>';
    
    for (let year = currentYear; year >= startYear; year--) {
        for (let month = 12; month >= 1; month--) {
            const monthValue = `${year}-${String(month).padStart(2, '0')}`;
            const monthNames = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
            const monthName = monthNames[month - 1];
            options += `<option value="${monthValue}">${monthName} ${year}</option>`;
        }
    }
    
    monthSelect.innerHTML = options;
}

// -------------------- SQLite Database Download & Restore --------------------
async function downloadSQLiteDatabase() {
    if (userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    toggleLoading(true);
    
    try {
        const result = await api.dbRead({ action: 'download_database' });
        
        if (result.status === 'success' && result.data) {
            // Base64 දත්ත බයිනරි බවට පරිවර්තනය කරන්න
            const binaryString = atob(result.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const blob = new Blob([bytes], { type: 'application/x-sqlite3' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sfms_database_${new Date().toISOString().slice(0,10)}.db`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showToast("✅ SQLite දත්ත ගබඩාව බාගත කරන ලදී!");
        } else {
            throw new Error(result.message || 'Download failed');
        }
    } catch (error) {
        console.error("SQLite download error:", error);
        showToast("❌ දත්ත ගබඩාව බාගත කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function restoreSQLiteDatabase() {
    if (userRole !== 'ADMIN') {
        showToast("❌ මෙම ක්‍රියාව සඳහා අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    // File input එකක් සාදා ගන්න
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.db';
    
    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const confirm = await showConfirmDialog(
            "⚠️ දත්ත ගබඩාව ප්‍රතිස්ථාපනය කරන්න",
            `"${file.name}" ගොනුව සමඟ වත්මන් දත්ත ගබඩාව සම්පූර්ණයෙන්ම ප්‍රතිස්ථාපනය කරන්නද?\n\nමෙම ක්‍රියාව ආපසු හැරවිය නොහැක!`,
            "ඔව්, ප්‍රතිස්ථාපනය කරන්න",
            "අවලංගු කරන්න"
        );
        
        if (!confirm) return;
        
        toggleLoading(true);
        
        try {
            // File එක Base64 බවට පරිවර්තනය කරන්න
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const base64Data = e.target.result.split(',')[1]; // Remove data URL prefix
                
                const result = await api.dbWrite({
                    action: 'restore_database',
                    data: {
                        fileData: base64Data,
                        clientId: generateUUID()
                    }
                });
                
                if (result.status === 'success') {
                    showToast("✅ දත්ත ගබඩාව සාර්ථකව ප්‍රතිස්ථාපනය කරන ලදී!");
                    
                    // නැවත පිවිසීමට උපදෙස් දෙන්න
                    setTimeout(() => {
                        showToast("⚠️ කරුණාකර නැවත පද්ධතියට පිවිසෙන්න.");
                        logout();
                    }, 2000);
                } else {
                    throw new Error(result.message || 'Restore failed');
                }
                
                toggleLoading(false);
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error("SQLite restore error:", error);
            showToast("❌ දත්ත ගබඩාව ප්‍රතිස්ථාපනය කිරීමේ දෝෂයක්!");
            toggleLoading(false);
        }
    };
    
    fileInput.click();
}

function downloadBackupJSON() {
    // Old function - replaced by SQLite download
    showToast("⚠️ JSON බැකප් වෙනුවට SQLite Database Download භාවිතා කරන්න.");
    downloadSQLiteDatabase();
}

function downloadBackupCSV() {
    // Old function - kept for compatibility, but we'll replace it with the full CSV backup
    downloadFullCSVBackup();
}

// ==================== අත්තිකාරම් කළමනාකරණය (Advances Management) ====================

function initAdvanceForm() {
    const today = new Date().toISOString().split('T')[0];
    
    const advDate = document.getElementById('advDate');
    if (advDate && !advDate.value) advDate.value = today;
    
    const advNo = document.getElementById('advNo');
    if (advNo && !advNo.value) advNo.value = generateAdvanceNo();
    
    // ⚠️ අලුතින් එක් කරන්න:
    const issueDate = document.getElementById('advIssueDate');
    if (issueDate && !issueDate.value) issueDate.value = today;
    
    // ⚠️ S කේත dropdown populate කරන්න:
    const srcSelect = document.getElementById('advIssueSourceCode');
    if (srcSelect) {
        let opts = '<option value="">තෝරන්න...</option>';
        S_CODES.forEach(code => {
            opts += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 40)}...</option>`;
        });
        srcSelect.innerHTML = opts;
    }
    
    const settleDate = document.getElementById('advSettleDate');
    if (settleDate && !settleDate.value) settleDate.value = today;
    
    populateAdvanceSettlementCodes();
}

function generateAdvanceNo() {
    const year = new Date().getFullYear();
    const existing = advances.filter(a => a.advance_no && a.advance_no.startsWith(`ADV-${year}-`));
    const nextNum = existing.length + 1;
    return `ADV-${year}-${String(nextNum).padStart(3, '0')}`;
}

function generateReturnVoucherNo(advanceNo) {
    return `${advanceNo}-RET`;
}

function generateExtraVoucherNo(advanceNo) {
    return `${advanceNo}-EXT`;
}

function populateAdvanceSettlementCodes() {
    const select = document.getElementById('advSettleCode');
    if (!select) return;
    
    let options = '<option value=""></option>';
    EX_CODES.forEach(code => {
        options += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 40)}...</option>`;
    });
    select.innerHTML = options;
}

function resetAdvanceForm() {
    document.getElementById('advNo').value = '';
    document.getElementById('advOfficer').value = '';
    document.getElementById('advDesignation').value = '';
    document.getElementById('advPurpose').value = '';
    document.getElementById('advEstimate').value = '';
    document.getElementById('advApproved').value = '';
    document.getElementById('advRemarks').value = '';
    document.getElementById('edit-adv-id').value = '';
    
    // නව fields clear කරන්න
    const srcCode = document.getElementById('advIssueSourceCode');
    if (srcCode) srcCode.value = '';
    const voucher = document.getElementById('advIssueVoucher');
    if (voucher) voucher.value = '';
    
    initAdvanceForm();
}


function renderAdvancesStats() {
    const totalIssued = advances.filter(a => a.status === 'ISSUED' || a.status === 'SETTLED')
        .reduce((sum, a) => sum + (Number(a.approved_amount) || 0), 0);
    const totalSettled = advances.reduce((sum, a) => sum + (Number(a.settled_amount) || 0), 0);
    const outstanding = advances.filter(a => a.status === 'ISSUED')
        .reduce((sum, a) => sum + (Number(a.approved_amount) || 0) - (Number(a.settled_amount) || 0), 0);
    const activeCount = advances.filter(a => a.status !== 'SETTLED' && a.status !== 'CANCELLED').length;
    
    const el1 = document.getElementById('advStatIssued');
    const el2 = document.getElementById('advStatSettled');
    const el3 = document.getElementById('advStatOutstanding');
    const el4 = document.getElementById('advStatCount');
    
    if (el1) el1.innerText = totalIssued.toLocaleString(undefined, {minimumFractionDigits: 2});
    if (el2) el2.innerText = totalSettled.toLocaleString(undefined, {minimumFractionDigits: 2});
    if (el3) el3.innerText = outstanding.toLocaleString(undefined, {minimumFractionDigits: 2});
    if (el4) el4.innerText = activeCount.toString();
}


function renderAdvancesList() {
    const container = document.getElementById('advancesListTable');
    if (!container) return;
    
    if (!advances || advances.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#666;">
            <i class="fas fa-inbox" style="font-size:40px; margin-bottom:10px; opacity:0.3;"></i>
            <p>අත්තිකාරම් කිසිවක් නොමැත</p>
        </div>`;
        return;
    }
    
    let html = `
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
                <tr style="background: var(--primary); color: white;">
                    <th style="padding:10px; border:1px solid #ddd;">අත්තිකාරම් අංකය</th>
                    <th style="padding:10px; border:1px solid #ddd;">දිනය</th>
                    <th style="padding:10px; border:1px solid #ddd;">නිලධාරියා</th>
                    <th style="padding:10px; border:1px solid #ddd;">අරමුණ</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:right;">අනුමත මුදල</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:right;">බිල්පත් පියවීම්</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:right;">මුදල් පියවීම්</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:right;">ශේෂය</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:center;">තත්ත්වය</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:center;">ක්‍රියා</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    advances.forEach(a => {
        // ⚠️ සියලු අගයන් safe ලෙස ලබා ගන්න
        const approvedAmt = Number(a.approved_amount) || 0;
        const settledAmt = Number(a.settled_amount) || 0;
        const returnedAmt = Number(a.returned_amount) || 0;
        const extraPaid = Number(a.extra_paid_amount) || 0;
        const balance = approvedAmt - settledAmt - returnedAmt + extraPaid;
        
        const statusColors = {
            'APPROVED': '#3498db',
            'ISSUED': '#f39c12',
            'SETTLED': '#27ae60',
            'CANCELLED': '#e74c3c'
        };
        const statusLabels = {
            'APPROVED': 'අනුමත',
            'ISSUED': 'නිකුත් කළ',
            'SETTLED': 'පියවා ඇත',
            'CANCELLED': 'අවලංගු'
        };
        
        html += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:8px; font-weight:bold;">${a.advance_no || '-'}</td>
            <td style="padding:8px;">${a.date || '-'}</td>
            <td style="padding:8px;">${a.officer_name || '-'}</td>
            <td style="padding:8px;">${a.purpose || '-'}</td>
            <td style="padding:8px; text-align:right;">${approvedAmt.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            <td style="padding:8px; text-align:right; color:#e74c3c;">${settledAmt.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            <td style="padding:8px; text-align:right; color:#27ae60;">${(returnedAmt + extraPaid).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            <td style="padding:8px; text-align:right; font-weight:bold; color:${balance >= 0 ? '#27ae60' : '#e74c3c'};">${balance.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            <td style="padding:8px; text-align:center;">
                <span style="background:${statusColors[a.status] || '#95a5a6'}; color:white; padding:3px 10px; border-radius:12px; font-size:11px;">
                    ${statusLabels[a.status] || a.status || '-'}
                </span>
            </td>
            <td style="padding:8px; text-align:center;">
<button class="table-btn" style="background:#3498db; color:white;" onclick="openAdvanceSettlement(${a.id})">
    <i class="fas fa-eye"></i> පියවීම
</button>
                <button class="table-btn" style="background:#27ae60; color:white; margin-left:3px;" onclick="printAdvance(${a.id})">
                    <i class="fas fa-print"></i>
                </button>
                ${userRole === 'ADMIN' && a.status !== 'SETTLED' ? `
                    <button class="table-btn" style="background:#e74c3c; color:white; margin-left:3px;" onclick="deleteAdvance(${a.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
    renderAdvancesStats();
}

async function saveAdvance() {
    if (userRole === 'GUEST') {
        showToast("❌ අත්තිකාරම් ඇතුළත් කිරීමට අවසර නැත!");
        return;
    }
    
    const editId = document.getElementById('edit-adv-id').value;
    const advance_no = document.getElementById('advNo').value.trim();
    const date = document.getElementById('advDate').value;
    const officer_name = document.getElementById('advOfficer').value.trim();
    const officer_designation = document.getElementById('advDesignation').value.trim();
    const purpose = document.getElementById('advPurpose').value.trim();
    const estimate_amount = parseAmount(document.getElementById('advEstimate').value);
    const approved_amount = parseAmount(document.getElementById('advApproved').value);
    const remarks = document.getElementById('advRemarks').value.trim();
    
    const sourceCode = document.getElementById('advIssueSourceCode')?.value;
    const voucherNo = document.getElementById('advIssueVoucher')?.value.trim();
    const issueDate = document.getElementById('advIssueDate')?.value || date;
    
    // වලංගුතා පරීක්ෂාව
    if (!advance_no || !date || !officer_name || !purpose || approved_amount <= 0) {
        showToast("⚠️ කරුණාකර අවශ්‍ය සියලු තොරතුරු ඇතුළත් කරන්න");
        return;
    }
    
    if (approved_amount > 40000) {
        showToast("⚠️ උපරිම සීමාව රු. 40,000.00 (54/2023 වකුලේඛනය)");
        return;
    }
    
    if (!editId && !sourceCode) {
        showToast("⚠️ කරුණාකර නිකුත් කරන S කේතය තෝරන්න");
        return;
    }
    
    if (!editId && !voucherNo) {
        showToast("⚠️ කරුණාකර මුදල් පොතේ වවුචර් අංකය ඇතුළත් කරන්න");
        return;
    }
    
    toggleLoading(true);
    
    try {
        // 1. අත්තිකාරම් ගිණුම්ගත කරන්න (status = ISSUED ලෙසම)
        const advanceData = {
            action: 'save_advance',
            id: editId ? parseInt(editId) : null,
            advance_no: advance_no,
            date: date,
            officer_name: officer_name,
            officer_designation: officer_designation || '',
            purpose: purpose,
            estimate_amount: Number(estimate_amount) || 0,
            approved_amount: Number(approved_amount) || 0,
            status: 'ISSUED',
            approved_by: currentUsername || 'Admin',
            approved_date: new Date().toISOString().split('T')[0],
            remarks: remarks || '',
            clientId: generateUUID()
        };
        
        const result = await api.dbWrite({ action: 'save_advance', data: advanceData });
        
        if (result.status !== 'success') throw new Error(result.message || 'Save failed');
        
        const newAdvanceId = result.id;
        
        // 2. නව අත්තිකාරමක් නම් — මුදල් පොතට ගෙවීමක් ලෙස එක් කරන්න
        if (!editId && newAdvanceId) {
            const txnData = {
                action: 'save_transaction',
                id: Date.now() + Math.floor(Math.random() * 1000),
                date: issueDate,
                ref: '',
                vouch: voucherNo,
                code: 'ADV',
                amt: Number(approved_amount) || 0,
                desc: `අත්තිකාරම් නිකුතුව - ${advance_no} - ${officer_name}`,
                type: 'EX',
                source: sourceCode,
                proj: '',
                status: true,
                isOp: false,
                isImprest: false,
                isAdvance: true,
                advanceId: newAdvanceId,
                clientId: generateUUID()
            };
            
            const txnResult = await api.dbWrite({ action: 'save_transaction', data: txnData });
            if (txnResult.status !== 'success') {
                throw new Error("මුදල් පොතට එක් කිරීමේ දෝෂයක්");
            }
            
            // Local cache එකට එක් කරන්න
            let db = getData();
            db.push(txnData);
            setDataCache(db);
            
            // අත්තිකාරම් තත්ත්වය ISSUED + voucher + source යාවත්කාලීන කරන්න
            await api.dbWrite({
                action: 'update_advance_issued',
                data: {
                    id: newAdvanceId,
                    issued_voucher: voucherNo,
                    issued_date: issueDate,
                    issue_source_code: sourceCode,
                    status: 'ISSUED'
                }
            });
        }
        
        showToast("✅ අත්තිකාරම සාර්ථකව නිකුත් කරන ලදී! මුදල් පොතට එක් විය.");
        
        resetAdvanceForm();
        await fetchRemoteAdvances();
        renderAdvancesStats();
        renderAdvancesList();
        refreshDashboard();
        loadRecentTable();
        
    } catch (e) {
        console.error("Save advance error:", e);
        showToast("❌ අත්තිකාරම සුරැකීමේ දෝෂයක්! " + e.message);
    } finally {
        toggleLoading(false);
    }
}

async function issueAdvance(advanceId) {
    if (userRole !== 'ADMIN') {
        showToast("❌ අත්තිකාරම් නිකුත් කිරීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) return;
    
    const sourceCode = document.getElementById('advIssueSourceCode')?.value;
    if (!sourceCode) {
        showToast("⚠️ කරුණාකර නිකුත් කරන S කේතය තෝරන්න");
        return;
    }
    
    const voucherNo = document.getElementById('advIssueVoucher')?.value.trim();
    if (!voucherNo) {
        showToast("⚠️ කරුණාකර මුදල් පොතේ වවුචර් අංකය ඇතුළත් කරන්න");
        return;
    }
    
    const issueDate = document.getElementById('advIssueDate')?.value || new Date().toISOString().split('T')[0];
    
    const confirm = await showConfirmDialog(
        "💰 අත්තිකාරම් නිකුත් කිරීම",
        `අත්තිකාරම්: ${advance.advance_no}\nනිලධාරියා: ${advance.officer_name}\nමූලාශ්‍රය: ${sourceCode}\nමුදල: රු. ${Number(advance.approved_amount).toFixed(2)}\nවවුචර්: ${voucherNo}\n\n⚠️ මුදල් පොතේ ගෙවීමක් ලෙස සටහන් වේ.\n\nනිකුත් කරන්නද?`,
        "ඔවුන්, නිකුත් කරන්න",
        "අවලංගු කරන්න"
    );
    
    if (!confirm) return;
    
    toggleLoading(true);
    try {
        const txnData = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            date: issueDate,
            ref: '',
            vouch: voucherNo,
            code: 'ADV',
            amt: Number(advance.approved_amount) || 0,
            desc: `අත්තිකාරම් නිකුතුව - ${advance.advance_no} - ${advance.officer_name}`,
            type: 'EX',
            source: sourceCode,
            proj: '',
            status: true,
            isOp: false,
            isImprest: false,
            isAdvance: true,
            advanceId: advanceId,
            clientId: generateUUID()
        };
        
        const txnResult = await api.dbWrite({ action: 'save_transaction', data: txnData });
        if (txnResult.status !== 'success') throw new Error("මුදල් පොතට එක් කිරීමේ දෝෂයක්");
        
        const updateData = {
            id: advanceId,
            issued_voucher: voucherNo,
            issued_date: issueDate,
            issue_source_code: sourceCode,
            status: 'ISSUED'
        };
        
        const advResult = await api.dbWrite({ action: 'update_advance_issued', data: updateData });
        if (advResult.status !== 'success') throw new Error("අත්තිකාරම් යාවත්කාලීන දෝෂයක්");
        
        let db = getData();
        db.push(txnData);
        setDataCache(db);
        
        const advIndex = advances.findIndex(a => a.id === advanceId);
        if (advIndex !== -1) {
            advances[advIndex].status = 'ISSUED';
            advances[advIndex].issued_voucher = voucherNo;
            advances[advIndex].issued_date = issueDate;
            advances[advIndex].issue_source_code = sourceCode;
            setAdvancesCache(advances);
        }
        
        showToast("✅ අත්තිකාරම් නිකුත් විය! මුදල් පොතට එක් විය.");
        await fetchRemoteAdvances();
        renderAdvancesStats();
        renderAdvancesList();
        refreshDashboard();
        loadRecentTable();
        
        document.getElementById('advIssueSourceCode').value = '';
        document.getElementById('advIssueVoucher').value = '';
        
        setTimeout(() => openAdvanceSettlement(advanceId), 400);
    } catch (e) {
        console.error("Issue advance error:", e);
        showToast("❌ නිකුත් කිරීමේ දෝෂයක්! " + e.message);
    } finally {
        toggleLoading(false);
    }
}

async function viewAdvanceDetails(advanceId) {
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) {
        showToast("❌ අත්තිකාරම හමු නොවීය!");
        return;
    }
    
    const settlements = await fetchRemoteAdvanceSettlements(advanceId);
    setAdvanceSettlementsCache([...advanceSettlements.filter(e => e.advance_id !== advanceId), ...settlements]);
    
    const modal = document.getElementById('advanceDetailsModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('advDetailAdvanceId').value = advanceId;
    document.getElementById('advSettleAdvanceId').value = advanceId;
    
    renderAdvanceDetails(advanceId);
    initAdvanceForm();
}

function closeAdvanceModal() {
    const modal = document.getElementById('advanceDetailsModal');
    if (modal) modal.style.display = 'none';
}

function renderAdvanceDetails(advanceId) {
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) return;
    
    // පැරණි APPROVED සඳහා auto-migrate (කලින්ම සිදු නොවූ නම්)
    if (advance.status === 'APPROVED' || !advance.status) {
        advance.status = 'ISSUED';
        const idx = advances.findIndex(a => a.id === advanceId);
        if (idx !== -1) advances[idx].status = 'ISSUED';
        setAdvancesCache(advances);
        api.dbWrite({ 
            action: 'update_advance_issued', 
            data: { 
                id: advanceId, 
                issued_voucher: advance.issued_voucher || 'AUTO', 
                issued_date: advance.issued_date || advance.date, 
                issue_source_code: advance.issue_source_code || 'S1', 
                status: 'ISSUED' 
            } 
        }).catch(e => console.log('Auto-issue migration error:', e));
    }
    
    const settlements = advanceSettlements.filter(e => e.advance_id === advanceId);
    const totalSettled = settlements.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const approvedAmt = Number(advance.approved_amount) || 0;
    const balance = approvedAmt - totalSettled;
    
    const statusColors = {
        'ISSUED': '#f39c12', 'SETTLED': '#27ae60', 'CANCELLED': '#e74c3c'
    };
    const statusLabels = {
        'ISSUED': 'නිකුත් කළ', 'SETTLED': 'පියවා ඇත', 'CANCELLED': 'අවලංගු'
    };
    
    document.getElementById('advDetailTitle').innerHTML = 
        `අත්තිකාරම් ${advance.advance_no || '-'} - ${advance.officer_name || '-'}`;
    
    let html = `
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px; margin-bottom:20px;">
            <div style="background:#e3f2fd; padding:12px; border-radius:8px; text-align:center;">
                <div style="font-size:12px; color:#0c5460;">අනුමත මුදල</div>
                <div style="font-size:18px; font-weight:bold;">රු. ${approvedAmt.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
            </div>
            <div style="background:#fff3e0; padding:12px; border-radius:8px; text-align:center;">
                <div style="font-size:12px; color:#e65100;">මුළු පියවීම්</div>
                <div style="font-size:18px; font-weight:bold;">රු. ${totalSettled.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
            </div>
            <div style="background:#e8f5e9; padding:12px; border-radius:8px; text-align:center;">
                <div style="font-size:12px; color:#1b5e20;">ශේෂය</div>
                <div style="font-size:18px; font-weight:bold; color:${balance >= 0 ? '#1b5e20' : '#c62828'};">රු. ${balance.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
            </div>
            <div style="background:${statusColors[advance.status] || '#95a5a6'}; padding:12px; border-radius:8px; text-align:center; color:white;">
                <div style="font-size:12px;">තත්ත්වය</div>
                <div style="font-size:16px; font-weight:bold;">${statusLabels[advance.status] || advance.status || '-'}</div>
            </div>
        </div>
        
        <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin-bottom:20px;">
            <h4 style="margin:0 0 10px 0; color:var(--primary); font-size:14px;">අත්තිකාරම් තොරතුරු</h4>
            <table style="width:100%; font-size:13px;">
                <tr><td style="padding:5px; font-weight:bold; width:140px;">අරමුණ:</td><td>${advance.purpose || '-'}</td></tr>
                <tr><td style="padding:5px; font-weight:bold;">නිලධාරියා:</td><td>${advance.officer_name || '-'} ${advance.officer_designation ? ' - ' + advance.officer_designation : ''}</td></tr>
                <tr><td style="padding:5px; font-weight:bold;">අනුමත කළේ:</td><td>${advance.approved_by || '-'}</td></tr>
                <tr><td style="padding:5px; font-weight:bold;">අනුමත දිනය:</td><td>${advance.approved_date || '-'}</td></tr>
                ${advance.issue_source_code ? `<tr><td style="padding:5px; font-weight:bold;">මූලාශ්‍ර S කේතය:</td><td>${advance.issue_source_code} - ${CODE_INFO[advance.issue_source_code] || ''}</td></tr>` : ''}
                ${advance.issued_voucher ? `<tr><td style="padding:5px; font-weight:bold;">නිකුතු වවුචර්:</td><td>${advance.issued_voucher} (${advance.issued_date || '-'})</td></tr>` : ''}
                ${advance.settlement_voucher ? `<tr><td style="padding:5px; font-weight:bold;">පියවීම් වවුචර්:</td><td>${advance.settlement_voucher} (${advance.settlement_date || '-'})</td></tr>` : ''}
                ${advance.remarks ? `<tr><td style="padding:5px; font-weight:bold;">සටහන්:</td><td>${advance.remarks}</td></tr>` : ''}
            </table>
        </div>
    `;
    
    // ==================== පියවර 2: පියවීම් වියදම් (ISSUED විට පමණි) ====================
    if (advance.status === 'ISSUED') {
        html += `
            <div style="background:#e8f5e9; padding:15px; border-radius:8px; margin-bottom:20px; border-left:4px solid #27ae60;">
                <h4 style="margin:0 0 15px 0; color:#1b5e20; font-size:14px;">
                    <i class="fas fa-plus-circle"></i> පියවීම් වියදම් එකතු කරන්න
                </h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px;">
                    <div>
                        <label class="required">දිනය</label>
                        <input type="date" id="advSettleDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div style="grid-column: span 2;">
                        <label class="required">විස්තරය</label>
                        <input type="text" id="advSettleDesc" placeholder="උදා: කුසලාන මිලදී ගැනීම">
                    </div>
                    <div>
                        <label class="required">වැය කේතය</label>
                        <select id="advSettleCode"></select>
                    </div>
                    <div>
                        <label class="required">මුදල (රු.)</label>
                        <input type="text" id="advSettleAmount" class="amount-input" inputmode="decimal" oninput="formatAmount(this)" placeholder="0.00">
                    </div>
                    <div>
                        <label>බිල්පත් අංකය</label>
                        <input type="text" id="advSettleBillNo" placeholder="INV-001">
                    </div>
                    <div>
                        <label>බිල්පත් දිනය</label>
                        <input type="date" id="advSettleBillDate">
                    </div>
                    <div>
                        <label>සැපයුම්කරු</label>
                        <input type="text" id="advSettleSupplier" placeholder="විකුණුම්කරුගේ නම">
                    </div>
                    <div style="display: flex; align-items: flex-end;">
                        <button class="btn" style="background:#27ae60; color:white; width:100%;" onclick="addAdvanceSettlement()">
                            <i class="fas fa-plus"></i> එකතු කරන්න
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==================== පියවීම් විස්තර වගුව ====================
    html += `<h4 style="margin:0 0 10px 0; color:var(--danger); font-size:14px;">පියවීම් වියදම් විස්තර</h4>`;
    
    if (settlements.length === 0) {
        html += `<p style="text-align:center; padding:20px; color:#666;">පියවීම් වියදම් කිසිවක් නොමැත</p>`;
    } else {
        html += `
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <thead>
                    <tr style="background:var(--primary); color:white;">
                        <th style="padding:8px; border:1px solid #ddd;">දිනය</th>
                        <th style="padding:8px; border:1px solid #ddd;">විස්තරය</th>
                        <th style="padding:8px; border:1px solid #ddd;">වැය කේතය</th>
                        <th style="padding:8px; border:1px solid #ddd;">බිල්පත්</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:right;">මුදල</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:center;">ක්‍රියා</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        settlements.forEach(exp => {
            const expAmount = Number(exp.amount) || 0;
            html += `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:6px;">${exp.date || '-'}</td>
                <td style="padding:6px;">${exp.description || '-'}</td>
                <td style="padding:6px; font-weight:bold; color:var(--primary);">${exp.code || '-'}</td>
                <td style="padding:6px;">${exp.bill_no || '-'} ${exp.bill_date ? '<br><small>' + exp.bill_date + '</small>' : ''}</td>
                <td style="padding:6px; text-align:right; font-weight:bold; color:#c62828;">${expAmount.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td style="padding:6px; text-align:center;">
                    ${advance.status !== 'SETTLED' && userRole === 'ADMIN' ? `
                        <button class="table-btn" style="background:#e74c3c; color:white;" onclick="deleteAdvanceSettlement(${exp.id}, ${advanceId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : '-'}
                </td>
            </tr>`;
        });
        
        html += `<tr style="background:#f0f0f0; font-weight:bold;">
            <td colspan="4" style="padding:8px; text-align:right;">මුළු එකතුව:</td>
            <td style="padding:8px; text-align:right; color:#c62828;">${totalSettled.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            <td></td>
        </tr></tbody></table>`;
    }
    
    // ==================== පියවර 3: පියවීම සම්පූර්ණ කිරීම ====================
    if (advance.status === 'ISSUED' && settlements.length > 0) {
        html += `
            <div style="background:#e3f2fd; padding:15px; border-radius:8px; margin-top:20px; border-left:4px solid #3498db;">
                <h4 style="margin:0 0 15px 0; color:#0c5460; font-size:14px;">
                    <i class="fas fa-check-circle"></i> අත්තිකාරම් පියවීම සම්පූර්ණ කරන්න
                </h4>
                <div style="background:#fff9e6; padding:10px; border-radius:6px; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px;">
                        <span>අනුමත මුදල:</span>
                        <strong>රු. ${approvedAmt.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px;">
                        <span>මුළු පියවීම්:</span>
                        <strong>රු. ${totalSettled.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:14px; border-top:1px solid #ddd; padding-top:5px;">
                        <span><strong>ශේෂය:</strong></span>
                        <strong style="color:${balance >= 0 ? '#1b5e20' : '#c62828'};">රු. ${balance.toFixed(2)}</strong>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr auto; gap:10px; align-items:flex-end;">
                    <div>
                        <label class="required">පියවීම් වවුචර් අංකය</label>
                        <input type="text" id="advSettleVoucher" placeholder="SET-2026-001">
                    </div>
                    <div>
                        <label class="required">ආපසු ලැබීමේ ලදුපත් අංකය</label>
                        <input type="text" id="advReturnReceiptNo" placeholder="R-001">
                    </div>
                    <div>
                        <button class="btn" style="background:#27ae60; color:white;" onclick="settleAdvance(${advanceId})">
                            <i class="fas fa-check-double"></i> පියවීම සම්පූර්ණ කරන්න
                        </button>
                    </div>
                </div>
                <p style="margin:10px 0 0 0; font-size:11px; color:#0c5460;">
                    ⚠️ වැය ශීර්ෂ වලට එක් වේ. ශේෂය මුදල් පොතට ලැබීමක් ලෙස සටහන් වේ.
                </p>
            </div>
        `;
    }
    
    document.getElementById('advanceDetailContent').innerHTML = html;
    
    populateAdvanceSettlementCodes();
}
async function addAdvanceSettlement() {
    if (userRole === 'GUEST') {
        showToast("❌ අත්තිකාරම් පියවීම් ඇතුළත් කිරීමට අවසර නැත!");
        return;
    }
    
    const advanceId = document.getElementById('advSettleAdvanceId').value;
    const date = document.getElementById('advSettleDate').value;
    const code = document.getElementById('advSettleCode').value;
    const description = document.getElementById('advSettleDesc').value.trim();
    const amount = parseAmount(document.getElementById('advSettleAmount').value);
    const bill_no = document.getElementById('advSettleBillNo').value.trim();
    const bill_date = document.getElementById('advSettleBillDate').value;
    const supplier = document.getElementById('advSettleSupplier').value.trim();
    
    if (!advanceId || !date || !description || !code || amount <= 0) {
        showToast("⚠️ කරුණාකර අවශ්‍ය සියලු තොරතුරු ඇතුළත් කරන්න");
        return;
    }
    
    const advance = advances.find(a => a.id === parseInt(advanceId));
    if (!advance) {
        showToast("❌ අත්තිකාරම හමු නොවීය!");
        return;
    }
    
    const currentSettlements = advanceSettlements
        .filter(e => e.advance_id === parseInt(advanceId))
        .reduce((sum, e) => sum + e.amount, 0);
    
    if (currentSettlements + amount > advance.approved_amount) {
        showToast(`⚠️ අනුමත මුදල ඉක්මවයි! ඉතිරි ශේෂය: රු. ${(advance.approved_amount - currentSettlements).toFixed(2)}`);
        return;
    }
    
    const data = {
        action: 'save_advance_settlement',
        id: null,
        advance_id: parseInt(advanceId),
        date, code, description, bill_no, bill_date, supplier, amount,
        clientId: generateUUID()
    };
    
    toggleLoading(true);
    try {
        const result = await api.dbWrite({ action: 'save_advance_settlement', data });
        if (result.status === 'success') {
            showToast("✅ පියවීම් වියදම එකතු කරන ලදී!");
            document.getElementById('advSettleDesc').value = '';
            document.getElementById('advSettleCode').value = '';
            document.getElementById('advSettleAmount').value = '';
            document.getElementById('advSettleBillNo').value = '';
            document.getElementById('advSettleSupplier').value = '';
            
            const settlements = await fetchRemoteAdvanceSettlements(parseInt(advanceId));
            setAdvanceSettlementsCache([...advanceSettlements.filter(e => e.advance_id !== parseInt(advanceId)), ...settlements]);
            
            renderAdvanceSettlementsTable(parseInt(advanceId), settlements);
updateAdvanceBalanceInfo(parseInt(advanceId));
document.getElementById('advanceCompleteSection').style.display = 'block';
        } else throw new Error(result.message);
    } catch (e) {
        console.error("Add advance settlement error:", e);
        showToast("❌ පියවීම් වියදම එකතු කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function deleteAdvanceSettlement(settlementId, advanceId) {
    if (userRole !== 'ADMIN') {
        showToast("❌ මකා දැමීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const confirm = await showConfirmDialog("🗑️ වියදම මකන්න", "මෙම පියවීම් වියදම ස්ථිරවම මකා දමන්නද?", "ඔව්", "නැත");
    if (!confirm) return;
    
    toggleLoading(true);
    try {
        await api.dbWrite({ action: 'delete_advance_settlement', data: { id: settlementId } });
        showToast("✅ වියදම මකා දමන ලදී!");
        const settlements = await fetchRemoteAdvanceSettlements(advanceId);
        setAdvanceSettlementsCache([...advanceSettlements.filter(e => e.advance_id !== advanceId), ...settlements]);
        renderAdvanceDetails(advanceId);
    } catch (e) {
        console.error("Delete advance settlement error:", e);
        showToast("❌ මකා දැමීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function settleAdvance(advanceId) {
    if (userRole !== 'ADMIN') {
        showToast("❌ පියවීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) return;
    
    const settlements = advanceSettlements.filter(e => e.advance_id === advanceId);
    const totalSettled = settlements.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const approvedAmt = Number(advance.approved_amount) || 0;
    const balance = approvedAmt - totalSettled;
    
    const settleVoucher = document.getElementById('advSettleVoucher')?.value.trim();
    if (!settleVoucher) {
        showToast("⚠️ කරුණාකර පියවීම් වවුචර් අංකය ඇතුළත් කරන්න");
        return;
    }
    
    const returnReceipt = document.getElementById('advReturnReceiptNo')?.value.trim();
    if (balance > 0 && !returnReceipt) {
        showToast("⚠️ කරුණාකර ආපසු ලැබීමේ ලදුපත් අංකය ඇතුළත් කරන්න");
        return;
    }
    
    const settleDate = new Date().toISOString().split('T')[0];
    const sourceCode = advance.issue_source_code || 'S1';
    
    let message = `අත්තිකාරම්: ${advance.advance_no}\n`;
    message += `අනුමත මුදල: රු. ${approvedAmt.toFixed(2)}\n`;
    message += `පියවීම්: රු. ${totalSettled.toFixed(2)}\n`;
    message += `ශේෂය: රු. ${balance.toFixed(2)}\n`;
    message += `මූලාශ්‍රය: ${sourceCode}\n\n`;
    
    if (balance > 0) {
        message += `💰 රු. ${balance.toFixed(2)} මුදල් පොතට ලැබීමක් ලෙස සටහන් වේ (${returnReceipt})\n\n`;
    } else if (balance < 0) {
        message += `⚠️ රු. ${Math.abs(balance).toFixed(2)} අමතර ගෙවීමක් මුදල් පොතට සටහන් වේ\n\n`;
    }
    message += `⚠️ පියවීම් වියදම් REx කේත වලට එකතු වේ.\n\nපියවන්නද?`;
    
    const confirm = await showConfirmDialog("✅ අත්තිකාරම් පියවීම", message, "ඔවුන්, පියවන්න", "අවලංගු කරන්න");
    if (!confirm) return;
    
    toggleLoading(true);
    try {
        // 1. වියදම් කේත වලට යවන්න (period_expenses)
        for (const settlement of settlements) {
            const periodExpenseData = {
                action: 'save_period_expense',
                id: Date.now() + Math.floor(Math.random() * 10000) + Math.floor(Math.random() * 100),
                date: settlement.date,
                desc: `අත්තිකාරම් පියවීම - ${settlement.description} (${advance.advance_no})`,
                category: settlement.code,
                voucher: settleVoucher,
                amt: settlement.amount,
                source: 'ADV',
                periodStart: advance.issued_date || advance.date,
                periodEnd: settleDate,
                clientId: generateUUID()
            };
            await api.dbWrite({ action: 'save_period_expense', data: periodExpenseData });
            periodExpenses.push(periodExpenseData);
        }
        setPeriodExpensesCache(periodExpenses);
        
        // 2. ශේෂය ආපසු ලැබීම - මුදල් පොතට
        if (balance > 0) {
            const returnTxn = {
                action: 'save_transaction',
                id: Date.now() + Math.floor(Math.random() * 10000),
                date: settleDate,
                ref: returnReceipt,
                vouch: '',
                code: 'ADV-RET',
                amt: balance,
                desc: `අත්තිකාරම් ශේෂය ආපසු ලැබීම - ${advance.advance_no} - ${advance.officer_name}`,
                type: 'IN',
                source: sourceCode,
                proj: '',
                status: true,
                isOp: false,
                isImprest: false,
                isAdvance: true,
                advanceId: advanceId,
                clientId: generateUUID()
            };
            await api.dbWrite({ action: 'save_transaction', data: returnTxn });
            let db = getData();
            db.push(returnTxn);
            setDataCache(db);
        } else if (balance < 0) {
            const extraTxn = {
                action: 'save_transaction',
                id: Date.now() + Math.floor(Math.random() * 10000) + 500,
                date: settleDate,
                ref: '',
                vouch: settleVoucher,
                code: 'REx3',
                amt: Math.abs(balance),
                desc: `අත්තිකාරම් අමතර ගෙවීම - ${advance.advance_no} - ${advance.officer_name}`,
                type: 'EX',
                source: sourceCode,
                proj: '',
                status: true,
                isOp: false,
                isImprest: false,
                isAdvance: true,
                advanceId: advanceId,
                clientId: generateUUID()
            };
            await api.dbWrite({ action: 'save_transaction', data: extraTxn });
            let db = getData();
            db.push(extraTxn);
            setDataCache(db);
        }
        
        // 3. අත්තිකාරම් යාවත්කාලීන කරන්න
        const updateData = {
            action: 'complete_advance_settlement',
            id: advanceId,
            settlement_voucher: settleVoucher,
            settlement_date: settleDate,
            settled_amount: totalSettled,
            returned_amount: balance > 0 ? balance : 0,
            extra_paid_amount: balance < 0 ? Math.abs(balance) : 0,
            status: 'SETTLED'
        };
        
        await api.dbWrite({ action: 'complete_advance_settlement', data: updateData });
        
        showToast("✅ අත්තිකාරම සාර්ථකව පියවන ලදී!");
        await fetchRemoteAdvances();
        closeAdvanceModal();
        closeAdvanceSettlement();
        renderAdvancesStats();
        renderAdvancesList();
        refreshDashboard();
        loadRecentTable();
    } catch (e) {
        console.error("Settle advance error:", e);
        showToast("❌ පියවීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function deleteAdvance(advanceId) {
    if (userRole !== 'ADMIN') {
        showToast("❌ මකා දැමීමට අවසර ඇත්තේ පරිපාලකට පමණි!");
        return;
    }
    
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) return;
    
    if (advance.status === 'SETTLED') {
        showToast("❌ පියවා ඇති අත්තිකාරම් මකා දැමිය නොහැක!");
        return;
    }
    
    const confirm = await showConfirmDialog(
        "🗑️ අත්තිකාරම මකන්න",
        `අත්තිකාරම් අංකය: ${advance.advance_no}\n\nමෙම අත්තිකාරම සහ ඊට අදාළ සියලු පියවීම් ස්ථිරවම මකා දමන්නද?\n\n⚠️ මෙය ආපසු හැරවිය නොහැක!`,
        "ඔවුන්, මකන්න",
        "අවලංගු කරන්න"
    );
    
    if (!confirm) return;
    
    toggleLoading(true);
    try {
        // මුදල් පොතේ අත්තිකාරම් නිකුතුව ඉවත් කරන්න
        let db = getData();
        const advanceTxn = db.find(t => t.advanceId === advanceId && t.isAdvance);
        if (advanceTxn) {
            await api.dbWrite({ action: 'delete', data: { id: advanceTxn.id } });
            db = db.filter(t => t.id !== advanceTxn.id);
            setDataCache(db);
        }
        
        // අත්තිකාරම් පියවීම් වලට අදාළ period_expenses ඉවත් කරන්න
        const advanceSettlementsList = advanceSettlements.filter(e => e.advance_id === advanceId);
        for (const settlement of advanceSettlementsList) {
            // period_expenses වලින් අදාළ ගනුදෙනු සොයා මකන්න
            const periodExps = periodExpenses.filter(p => 
                p.source === 'ADV' && 
                p.category === settlement.code && 
                p.amt === settlement.amount &&
                p.desc && p.desc.includes(advance.advance_no)
            );
            for (const pe of periodExps) {
                await api.dbWrite({ action: 'delete_period_expense', data: { id: pe.id } });
            }
        }
        
        // periodExpenses cache යාවත්කාලීන කරන්න
        const updatedPeriodExpenses = periodExpenses.filter(p => 
            !(p.source === 'ADV' && p.desc && p.desc.includes(advance.advance_no))
        );
        setPeriodExpensesCache(updatedPeriodExpenses);
        
        await api.dbWrite({ action: 'delete_advance', data: { id: advanceId } });
        showToast("✅ අත්තිකාරම මකා දමන ලදී!");
        await fetchRemoteAdvances();
        await fetchRemotePeriodExpenses();
        renderAdvancesList();
        refreshDashboard();
        loadRecentTable();
    } catch (e) {
        console.error("Delete advance error:", e);
        showToast("❌ මකා දැමීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

function printAdvance(advanceId) {
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) return;
    
    const settlements = advanceSettlements.filter(e => e.advance_id === advanceId);
    const totalSettled = settlements.reduce((sum, e) => sum + e.amount, 0);
    const balance = advance.approved_amount - totalSettled;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>අත්තිකාරම් ${advance.advance_no}</title>
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { font-family: 'Noto Sans Sinhala', sans-serif; font-size: 12px; }
                h1 { text-align: center; color: #1b5e20; font-size: 18px; margin: 0 0 5px 0; }
                h2 { text-align: center; color: #2e7d32; font-size: 14px; margin: 0 0 20px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background: #1b5e20; color: white; padding: 8px; border: 1px solid #333; font-size: 11px; }
                td { padding: 6px; border: 1px solid #333; font-size: 11px; }
                .info-table td { padding: 5px; }
                .info-label { font-weight: bold; width: 30%; background: #f0f0f0; }
                .total-row { background: #e8f5e9; font-weight: bold; }
                .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
                .sig-box { width: 30%; text-align: center; }
                .sig-line { border-top: 1.5px solid black; margin-top: 50px; padding-top: 5px; }
            </style>
        </head>
        <body>
            <h1>SCHOOL FINANCE MANAGEMENT SYSTEM</h1>
            <h2>අත්තිකාරම් පියවීමේ වවුචරය</h2>
            
            <table class="info-table">
                <tr>
                    <td class="info-label">අත්තිකාරම් අංකය:</td>
                    <td>${advance.advance_no}</td>
                    <td class="info-label">දිනය:</td>
                    <td>${advance.date}</td>
                </tr>
                <tr>
                    <td class="info-label">නිලධාරියාගේ නම:</td>
                    <td>${advance.officer_name}</td>
                    <td class="info-label">තනතුර:</td>
                    <td>${advance.officer_designation || '-'}</td>
                </tr>
                <tr>
                    <td class="info-label">අරමුණ:</td>
                    <td colspan="3">${advance.purpose}</td>
                </tr>
                <tr>
                    <td class="info-label">අනුමත මුදල:</td>
                    <td>රු. ${advance.approved_amount.toFixed(2)}</td>
                    <td class="info-label">මුළු පියවීම්:</td>
                    <td>රු. ${totalSettled.toFixed(2)}</td>
                </tr>
                <tr style="background:#e8f5e9;">
                    <td class="info-label">ශේෂය:</td>
                    <td colspan="3"><strong>රු. ${balance.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td class="info-label">අනුමත කළේ:</td>
                    <td>${advance.approved_by || '-'}</td>
                    <td class="info-label">අනුමත දිනය:</td>
                    <td>${advance.approved_date || '-'}</td>
                </tr>
                ${advance.issued_voucher ? `
                <tr>
                    <td class="info-label">නිකුතු වවුචර්:</td>
                    <td>${advance.issued_voucher}</td>
                    <td class="info-label">නිකුතු දිනය:</td>
                    <td>${advance.issued_date || '-'}</td>
                </tr>` : ''}
                ${advance.settlement_voucher ? `
                <tr>
                    <td class="info-label">පියවීම් වවුචර්:</td>
                    <td>${advance.settlement_voucher}</td>
                    <td class="info-label">පියවීම් දිනය:</td>
                    <td>${advance.settlement_date || '-'}</td>
                </tr>` : ''}
            </table>
            
            <h3 style="margin-top: 25px; color: #2e7d32;">පියවීම් වියදම් විස්තර</h3>
            <table>
                <thead>
                    <tr>
                        <th>අනු අංකය</th>
                        <th>දිනය</th>
                        <th>වැය කේතය</th>
                        <th>විස්තරය</th>
                        <th>බිල්පත් අංකය</th>
                        <th style="text-align:right;">මුදල (රු.)</th>
                    </tr>
                </thead>
                <tbody>
                    ${settlements.map((e, i) => `
                        <tr>
                            <td style="text-align:center;">${i + 1}</td>
                            <td>${e.date}</td>
                            <td>${e.code}</td>
                            <td>${e.description}</td>
                            <td>${e.bill_no || '-'}</td>
                            <td style="text-align:right;">${e.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="5" style="text-align:right;">මුළු එකතුව:</td>
                        <td style="text-align:right;">${totalSettled.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="signatures">
                <div class="sig-box">
                    <div class="sig-line">අත්තිකාරම් ලැබූ නිලධාරියාගේ අත්සන</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line">පරීක්ෂා කළේ</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line">විදුහල්පති</div>
                </div>
            </div>
            
            <p style="text-align:right; margin-top:30px; font-size:10px;">
                මුද්‍රණය: ${new Date().toLocaleString('si-LK')}
            </p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printAdvanceForm() {
    const advanceNo = document.getElementById('advNo').value || 'ADV-____';
    const date = document.getElementById('advDate').value;
    const officerName = document.getElementById('advOfficer').value;
    const designation = document.getElementById('advDesignation').value;
    const purpose = document.getElementById('advPurpose').value;
    const estimate = document.getElementById('advEstimate').value;
    const approved = document.getElementById('advApproved').value;
    const remarks = document.getElementById('advRemarks').value;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>අත්තිකාරම් ඉල්ලීමේ පෝරමය</title>
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { font-family: 'Noto Sans Sinhala', sans-serif; font-size: 12px; }
                h1 { text-align: center; font-size: 16px; margin-bottom: 5px; }
                h2 { text-align: center; font-size: 14px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 8px; border: 1px solid #333; }
                .label { background: #f0f0f0; font-weight: bold; width: 30%; }
                .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
                .sig-box { width: 30%; text-align: center; }
                .sig-line { border-top: 1.5px solid black; margin-top: 50px; padding-top: 5px; }
                .note { font-size: 10px; color: #666; margin-top: 20px; line-height: 1.6; }
            </style>
        </head>
        <body>
            <h1>SCHOOL FINANCE MANAGEMENT SYSTEM</h1>
            <h2>අත්තිකාරම් මුදල් ඉල්ලීමේ පෝරමය</h2>
            
            <table>
                <tr>
                    <td class="label">අත්තිකාරම් අංකය:</td>
                    <td>${advanceNo}</td>
                    <td class="label">දිනය:</td>
                    <td>${date || '____/____/________'}</td>
                </tr>
                <tr>
                    <td class="label">නිලධාරියාගේ නම:</td>
                    <td colspan="3">${officerName || '..............................................................'}</td>
                </tr>
                <tr>
                    <td class="label">තනතුර:</td>
                    <td colspan="3">${designation || '..............................................................'}</td>
                </tr>
                <tr>
                    <td class="label">අරමුණ:</td>
                    <td colspan="3">${purpose || '..............................................................'}</td>
                </tr>
                <tr>
                    <td class="label">ඇස්තමේන්තුගත මුදල:</td>
                    <td>රු. ${estimate || '0.00'}</td>
                    <td class="label">අනුමත මුදල:</td>
                    <td>රු. ${approved || '0.00'}</td>
                </tr>
                <tr>
                    <td class="label">සටහන්:</td>
                    <td colspan="3">${remarks || ''}</td>
                </tr>
            </table>
            
            <div class="note">
                <strong>උපදෙස්:</strong><br>
                1. අත්තිකාරම් මුදල ලබා ගැනීමට අපේක්ෂා කරන නිලධාරියා තම ඉල්ලීම හා වියදම් ඇස්තමේන්තුවද සකස් කර, පොදු 35 වවුචරයකට අමුණා ඉල්ලා සිටිය යුතුය.<br>
                2. 54/2023 වකුලේඛනයට අනුව උපරිම සීමාව රු. 40,000.00 කි.<br>
                3. ඇස්තමේන්තු මුදල සංශෝධනය කිරීමට විදුහල්පතිවරයාට හැකි ය.<br>
                4. නිකුත් කිරීමේදී මුදල් පොතේ ගෙවීමක් ලෙස සටහන් වේ (වැය ශීර්ෂ වලට එක් නොවේ).<br>
                5. පියවීමේදී වැය ශීර්ෂ වලට එක් වේ (මුදල් පොතට එක් නොවේ).<br>
                6. ශේෂය ආපසු ලැබීමක් හෝ අමතර ගෙවීමක් ලෙස මුදල් පොතට එක් වේ.
            </div>
            
            <div class="signatures">
                <div class="sig-box">
                    <div class="sig-line">ඉල්ලීම්කරුගේ අත්සන</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line">භාණ්ඩාගාරික</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line">විදුහල්පති</div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
    amtInput.inputMode = 'decimal';
    amtInput.pattern = '[0-9]*\\.?[0-9]{0,2}';
    
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
    const baseTimestamp = Date.now();
    
    for (let i = 0; i < rows.length; i++) {
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
            id: baseTimestamp + i + Math.floor(Math.random() * 1000), // <-- better ID generation
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
            isImprest: false,
            clientId: generateUUID()
        });
    }
    
    const duplicateCheck = checkDuplicateReceipt(fromRef, toRef, null);
    if (duplicateCheck.isDuplicate) {
        showToast(duplicateCheck.message);
        return;
    }
    
    const saveButton = document.querySelector('button[onclick="saveMultiLineReceipt()"]');
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> සුරකිමින්...';
    
    toggleLoading(true);
    
    try {
        const success = await saveBatchTransactions(transactions);        
        if (success) {
            let db = getData();
            db.push(...transactions);
            setDataCache(db);
            showToast(`✅ ලැබීම් ${transactions.length}ක් සාර්ථකව ගිණුම්ගත කරන ලදී!`);
        } else {
            showToast("❌ ගනුදෙනු සුරැකීම අසාර්ථකයි!");
        }
        
        document.getElementById('multiInRefFrom').value = '';
        document.getElementById('multiInRefTo').value = '';
        document.getElementById('multiInDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('multiInProjSelect').value = '';
        document.getElementById('multiRowsContainer').innerHTML = ''; 
        addMultiRow(); 
        refreshDashboard();
        loadRecentTable();
    } catch (error) {
        console.error("Multi-line save error:", error);
        showToast("❌ දෝෂයක් සිදු විය!");
    } finally {
        toggleLoading(false);
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save"></i> බහු-රේඛීය ලැබීම සුරකින්න';
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

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    const fab = document.querySelector('.mobile-fab i');
    
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        if (fab) {
            fab.className = 'fas fa-bars';
        }
    } else {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        if (fab) {
            fab.className = 'fas fa-times';
        }
    }
}

function logout() {
    currentUsername = '';
    userRole = '';
    location.reload();
}

function changePassword() {
    if (!userRole) {
        showToast("❌ කරුණාකර පළමුව පද්ධතියට ඇතුළු වන්න");
        return;
    }
    
    if (!currentUsername) {
        showToast("❌ පරිශීලක නාමය හමු නොවීය! කරුණාකර නැවත පිවිසෙන්න.");
        return;
    }
    
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    
    document.getElementById('passwordChangeModal').style.display = 'flex';
}

function closePasswordModal() {
    document.getElementById('passwordChangeModal').style.display = 'none';
}

async function submitPasswordChange() {
    const currentPassword = document.getElementById('currentPasswordInput').value;
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("⚠️ කරුණාකර සියලුම මුරපද ඇතුළත් කරන්න");
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast("⚠️ නව මුරපද දෙක ගැලපෙන්නේ නැත!");
        return;
    }
    
    closePasswordModal();
    toggleLoading(true);

    try {
        const users = await api.dbRead({ 
            action: 'read_user', 
            data: { username: currentUsername } 
        });

        if (!users || users.length === 0) {
            showToast("❌ පරිශීලකයා හමු නොවීය!");
            toggleLoading(false);
            return;
        }

        if (users[0].password !== currentPassword) {
            showToast("❌ වත්මන් මුරපදය වැරදියි!");
            toggleLoading(false);
            return;
        }

        const result = await api.dbWrite({
            action: 'update_user_password',
            data: { username: currentUsername, newPassword }
        });

        if (result.status === 'success') {
            showToast("✅ මුරපදය සාර්ථකව වෙනස් කරන ලදී!");
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Password change error:", error);
        showToast("❌ මුරපදය වෙනස් කිරීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}
// ==================== අත්තිකාරම් පියවීම් අංශය ====================

function openAdvanceSettlement(advanceId) {
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) {
        showToast("❌ අත්තිකාරම හමු නොවීය!");
        return;
    }
    
    document.getElementById('currentAdvanceIdForSettlement').value = advanceId;
    document.getElementById('advanceSettlementCard').style.display = 'block';
    
    // අත්තිකාරම් තොරතුරු පෙන්වන්න
    const approvedAmt = Number(advance.approved_amount) || 0;
    document.getElementById('advanceSettlementInfo').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
            <div>
                <div style="font-size: 11px; color: #666;">අත්තිකාරම් අංකය</div>
                <div style="font-size: 16px; font-weight: bold; color: #1b5e20;">${advance.advance_no}</div>
            </div>
            <div>
                <div style="font-size: 11px; color: #666;">නිලධාරියා</div>
                <div style="font-size: 14px; font-weight: bold;">${advance.officer_name}</div>
            </div>
            <div>
                <div style="font-size: 11px; color: #666;">අරමුණ</div>
                <div style="font-size: 13px;">${advance.purpose}</div>
            </div>
            <div>
                <div style="font-size: 11px; color: #666;">අනුමත මුදල</div>
                <div style="font-size: 16px; font-weight: bold; color: #c62828;">රු. ${approvedAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
        </div>
    `;
    
    // දැනට ඇති පියවීම් පෙන්වන්න
    loadAdvanceSettlementsForSection(advanceId);
    
    // තත්ත්වය අනුව පෝරම පෙන්වන්න
// "පියවර 1" අංශය සැමවිටම සඟවන්න (අනුමතය = නිකුතුව)
const issueSection = document.getElementById('advanceIssueSection');
if (issueSection) issueSection.style.display = 'none';

if (advance.status === 'SETTLED') {
    // පියවා අවසන් — පෝරම නොපෙන්වයි
    document.getElementById('advanceSettleExpenseSection').style.display = 'none';
    document.getElementById('advanceCompleteSection').style.display = 'none';
} else {
    // ISSUED (හෝ පැරණි APPROVED) — පියවීම් හැඩතලය පෙන්වයි
    document.getElementById('advanceSettleExpenseSection').style.display = 'block';
    
    const settlements = advanceSettlements.filter(e => e.advance_id === advanceId);
    if (settlements.length > 0) {
        document.getElementById('advanceCompleteSection').style.display = 'block';
        updateAdvanceBalanceInfo(advanceId);
    } else {
        document.getElementById('advanceCompleteSection').style.display = 'none';
    }
}
    
    // Select2 සඳහා කේත populate කරන්න
        // Select2 සඳහා කේත populate කරන්න
    populateAdvanceSettlementCodes();
    
    // S කේත dropdown populate කරන්න
    const srcSelect = document.getElementById('advIssueSourceCode');
    if (srcSelect) {
        let opts = '<option value="">තෝරන්න...</option>';
        S_CODES.forEach(code => {
            opts += `<option value="${code}">${code} - ${CODE_INFO[code].substring(0, 40)}...</option>`;
        });
        srcSelect.innerHTML = opts;
        if (advance.issue_source_code) srcSelect.value = advance.issue_source_code;
    }
    
    // සිරස් තීරුවේ අත්තිකාරම් අංකය පෙන්වන්න
    const titleSpan = document.getElementById('settleAdvanceNo');
    if (titleSpan) titleSpan.innerText = advance.advance_no || '';
    
    // පිටුවට scroll කරන්න
    document.getElementById('advanceSettlementCard').scrollIntoView({ behavior: 'smooth' });
}

function closeAdvanceSettlement() {
    document.getElementById('advanceSettlementCard').style.display = 'none';
}

async function loadAdvanceSettlementsForSection(advanceId) {
    const settlements = await fetchRemoteAdvanceSettlements(advanceId);
    
    // Cache යාවත්කාලීන කරන්න
    const otherSettlements = advanceSettlements.filter(e => e.advance_id !== advanceId);
    setAdvanceSettlementsCache([...otherSettlements, ...settlements]);
    
    // වගුව පෙන්වන්න
    renderAdvanceSettlementsTable(advanceId, settlements);
}

function renderAdvanceSettlementsTable(advanceId, settlements) {
    const container = document.getElementById('advanceSettlementsTable');
    if (!container) return;
    
    const totalSettled = settlements.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    if (settlements.length === 0) {
        container.innerHTML = `<p style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 6px;">පියවීම් වියදම් කිසිවක් නොමැත</p>`;
        return;
    }
    
    let html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: white;">
            <thead>
                <tr style="background: var(--primary); color: white;">
                    <th style="padding: 8px; border: 1px solid #ddd;">දිනය</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">විස්තරය</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">වැය කේතය</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">බිල්පත්</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">මුදල</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">ක්‍රියා</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    settlements.forEach(exp => {
        const expAmount = Number(exp.amount) || 0;
        html += `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px;">${exp.date || '-'}</td>
            <td style="padding: 6px;">${exp.description || '-'}</td>
            <td style="padding: 6px; font-weight: bold; color: var(--primary);">${exp.code || '-'}</td>
            <td style="padding: 6px;">${exp.bill_no || '-'} ${exp.bill_date ? '<br><small>' + exp.bill_date + '</small>' : ''}</td>
            <td style="padding: 6px; text-align: right; font-weight: bold; color: #c62828;">${expAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td style="padding: 6px; text-align: center;">
                ${userRole === 'ADMIN' ? `
                    <button class="table-btn" style="background: #e74c3c; color: white; padding: 3px 8px;" onclick="deleteAdvanceSettlementFromSection(${exp.id}, ${advanceId})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : '-'}
            </td>
        </tr>`;
    });
    
    html += `<tr style="background: #f0f0f0; font-weight: bold;">
        <td colspan="4" style="padding: 8px; text-align: right;">මුළු එකතුව:</td>
        <td style="padding: 8px; text-align: right; color: #c62828;">${totalSettled.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
        <td></td>
    </tr></tbody></table>`;
    
    container.innerHTML = html;
}

function updateAdvanceBalanceInfo(advanceId) {
    const advance = advances.find(a => a.id === advanceId);
    if (!advance) return;
    
    const settlements = advanceSettlements.filter(e => e.advance_id === advanceId);
    const totalSettled = settlements.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const approvedAmt = Number(advance.approved_amount) || 0;
    const balance = approvedAmt - totalSettled;
    
    const infoDiv = document.getElementById('advanceBalanceInfo');
    if (!infoDiv) return;
    
    infoDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
            <span>අනුමත මුදල:</span>
            <strong>රු. ${approvedAmt.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
            <span>මුළු පියවීම්:</span>
            <strong>රු. ${totalSettled.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; border-top: 1px solid #ddd; padding-top: 5px;">
            <span><strong>ශේෂය:</strong></span>
            <strong style="color: ${balance >= 0 ? '#1b5e20' : '#c62828'};">රු. ${balance.toFixed(2)}</strong>
        </div>
    `;
}

async function issueAdvanceFromSection() {
    const advanceId = parseInt(document.getElementById('currentAdvanceIdForSettlement').value);
    if (!advanceId) {
        showToast("⚠️ අත්තිකාරම් අංකය හමු නොවීය!");
        return;
    }
    await issueAdvance(advanceId);
    setTimeout(() => {
        openAdvanceSettlement(advanceId);
    }, 500);
}

async function addAdvanceSettlementFromSection() {
    const advanceId = parseInt(document.getElementById('currentAdvanceIdForSettlement').value);
    if (!advanceId) {
        showToast("⚠️ අත්තිකාරම් අංකය හමු නොවීය!");
        return;
    }
    document.getElementById('advSettleAdvanceId').value = advanceId;
    
    await addAdvanceSettlement();
    setTimeout(() => {
        loadAdvanceSettlementsForSection(advanceId);
        updateAdvanceBalanceInfo(advanceId);
        document.getElementById('advanceCompleteSection').style.display = 'block';
    }, 500);
}

async function deleteAdvanceSettlementFromSection(settlementId, advanceId) {
    const confirm = await showConfirmDialog("🗑️ වියදම මකන්න", "මෙම පියවීම් වියදම ස්ථිරවම මකා දමන්නද?", "ඔව්", "නැත");
    if (!confirm) return;
    
    toggleLoading(true);
    try {
        await api.dbWrite({ action: 'delete_advance_settlement', data: { id: settlementId } });
        showToast("✅ වියදම මකා දමන ලදී!");
        await loadAdvanceSettlementsForSection(advanceId);
        updateAdvanceBalanceInfo(advanceId);
        const settlements = advanceSettlements.filter(e => e.advance_id === advanceId);
        if (settlements.length === 0) {
            document.getElementById('advanceCompleteSection').style.display = 'none';
        }
    } catch (e) {
        console.error("Delete advance settlement error:", e);
        showToast("❌ මකා දැමීමේ දෝෂයක්!");
    } finally {
        toggleLoading(false);
    }
}

async function settleAdvanceFromSection() {
    const advanceId = parseInt(document.getElementById('currentAdvanceIdForSettlement').value);
    if (!advanceId) {
        showToast("⚠️ අත්තිකාරම් අංකය හමු නොවීය!");
        return;
    }
    await settleAdvance(advanceId);
    setTimeout(() => {
        closeAdvanceSettlement();
        renderAdvancesList();
    }, 500);
}
