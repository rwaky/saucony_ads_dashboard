// 전역 변수
let originalData = [];
let filteredData = [];
let dataTable = null;
let channelChart = null;
let topCreativesChart = null;
let ctrCvrChart = null;
let roasChart = null;
let efficiencyChart = null;
let radarChart = null;

// 샘플 데이터
const sampleData = [
    { 채널: '네이버', 소재명: '봄 신상 특가 배너 A', 노출: 125000, 클릭: 3750, 전환: 187, 비용: 1875000, 매출: 9375000 },
    { 채널: '네이버', 소재명: '여름 세일 이미지 B', 노출: 98000, 클릭: 2940, 전환: 147, 비용: 1470000, 매출: 7350000 },
    { 채널: '메타', 소재명: '인스타 릴스 광고 C', 노출: 215000, 클릭: 6450, 전환: 322, 비용: 3225000, 매출: 16125000 },
    { 채널: '메타', 소재명: '페이스북 캐러셀 D', 노출: 178000, 클릭: 5340, 전환: 267, 비용: 2670000, 매출: 13350000 },
    { 채널: '구글', 소재명: '검색광고 키워드 A', 노출: 89000, 클릭: 4450, 전환: 445, 비용: 4450000, 매출: 22250000 },
    { 채널: '구글', 소재명: '디스플레이 배너 B', 노출: 156000, 클릭: 3120, 전환: 156, 비용: 1560000, 매출: 7800000 },
    { 채널: '네이버', 소재명: '브랜드 검색 광고 E', 노출: 67000, 클릭: 3350, 전환: 335, 비용: 3350000, 매출: 16750000 },
    { 채널: '메타', 소재명: '스토리 광고 F', 노출: 198000, 클릭: 5940, 전환: 297, 비용: 2970000, 매출: 14850000 },
    { 채널: '구글', 소재명: 'YouTube 범퍼 광고', 노출: 245000, 클릭: 4900, 전환: 245, 비용: 2450000, 매출: 12250000 },
    { 채널: '네이버', 소재명: '쇼핑 라이브 배너', 노출: 134000, 클릭: 4020, 전환: 201, 비용: 2010000, 매출: 10050000 }
];

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const applyDateFilter = document.getElementById('applyDateFilter');
    const searchBox = document.getElementById('searchBox');

    // 파일 선택
    fileInput.addEventListener('change', handleFileSelect);

    // 드래그 앤 드롭
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // 샘플 데이터 로드
    loadSampleBtn.addEventListener('click', loadSampleData);

    // 날짜 필터
    if (applyDateFilter) {
        applyDateFilter.addEventListener('click', applyFilters);
    }

    // 검색
    if (searchBox) {
        searchBox.addEventListener('input', applyFilters);
    }
}

// 드래그 오버
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

// 드래그 떠남
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

// 드롭
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// 파일 선택
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// 파일 처리
function processFile(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
        readCSV(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        readExcel(file);
    } else {
        alert('CSV 또는 Excel 파일만 업로드 가능합니다.');
    }
}

// CSV 읽기
function readCSV(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const data = parseCSV(text);
        processData(data);
    };
    reader.readAsText(file, 'UTF-8');
}

// CSV 파싱
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        
        data.push(row);
    }
    
    return data;
}

// Excel 읽기
function readExcel(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        processData(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

// 샘플 데이터 로드
function loadSampleData() {
    processData(sampleData);
}

// 데이터 처리
function processData(data) {
    // 데이터 검증
    if (!data || data.length === 0) {
        alert('데이터가 비어있습니다.');
        return;
    }
    
    // 필수 컬럼 확인
    const requiredColumns = ['채널', '소재명', '노출', '클릭', '전환', '비용', '매출'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
        alert(`필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
        return;
    }
    
    // 데이터 정규화
    originalData = data.map(row => ({
        채널: row['채널'],
        소재명: row['소재명'],
        노출: Number(row['노출']) || 0,
        클릭: Number(row['클릭']) || 0,
        전환: Number(row['전환']) || 0,
        비용: Number(row['비용']) || 0,
        매출: Number(row['매출']) || 0,
        CTR: calculateCTR(row['클릭'], row['노출']),
        CPC: calculateCPC(row['비용'], row['클릭']),
        CVR: calculateCVR(row['전환'], row['클릭']),
        CPA: calculateCPA(row['비용'], row['전환']),
        ROAS: calculateROAS(row['매출'], row['비용'])
    }));
    
    filteredData = [...originalData];
    
    // UI 표시
    showDashboard();
    setupFilters();
    updateKPIs();
    updateCharts();
    updateTable();
}

// 계산 함수들
function calculateCTR(clicks, impressions) {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;
}

function calculateCPC(cost, clicks) {
    return clicks > 0 ? Math.round(cost / clicks) : 0;
}

function calculateCVR(conversions, clicks) {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;
}

function calculateCPA(cost, conversions) {
    return conversions > 0 ? Math.round(cost / conversions) : 0;
}

function calculateROAS(revenue, cost) {
    return cost > 0 ? ((revenue / cost) * 100).toFixed(0) : 0;
}

// 대시보드 표시
function showDashboard() {
    document.getElementById('filterSection').style.display = 'flex';
    document.getElementById('kpiSection').style.display = 'grid';
    document.getElementById('chartSection').style.display = 'grid';
    document.getElementById('tableSection').style.display = 'block';
}

// 필터 설정
function setupFilters() {
    const channels = [...new Set(originalData.map(row => row['채널']))];
    const channelFiltersContainer = document.getElementById('channelFilters');
    channelFiltersContainer.innerHTML = '';
    
    channels.forEach(channel => {
        const chip = document.createElement('span');
        chip.className = 'filter-chip active';
        chip.textContent = channel;
        chip.dataset.channel = channel;
        chip.addEventListener('click', toggleChannelFilter);
        channelFiltersContainer.appendChild(chip);
    });
}

// 채널 필터 토글
function toggleChannelFilter(e) {
    e.target.classList.toggle('active');
    applyFilters();
}

// 필터 적용
function applyFilters() {
    const activeChannels = Array.from(document.querySelectorAll('.filter-chip.active'))
        .map(chip => chip.dataset.channel);
    
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    
    filteredData = originalData.filter(row => {
        const channelMatch = activeChannels.includes(row['채널']);
        const searchMatch = row['소재명'].toLowerCase().includes(searchTerm);
        return channelMatch && searchMatch;
    });
    
    updateKPIs();
    updateCharts();
    updateTable();
}

// KPI 업데이트
function updateKPIs() {
    const totalImpressions = filteredData.reduce((sum, row) => sum + row['노출'], 0);
    const totalClicks = filteredData.reduce((sum, row) => sum + row['클릭'], 0);
    const totalConversions = filteredData.reduce((sum, row) => sum + row['전환'], 0);
    const totalCost = filteredData.reduce((sum, row) => sum + row['비용'], 0);
    const totalRevenue = filteredData.reduce((sum, row) => sum + row['매출'], 0);
    
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
    const avgCVR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;
    const avgCPA = totalConversions > 0 ? Math.round(totalCost / totalConversions) : 0;
    const avgROAS = totalCost > 0 ? ((totalRevenue / totalCost) * 100).toFixed(0) : 0;
    
    document.getElementById('totalImpressions').textContent = formatNumber(totalImpressions);
    document.getElementById('totalClicks').textContent = formatNumber(totalClicks);
    document.getElementById('avgCTR').textContent = avgCTR + '%';
    document.getElementById('totalCost').textContent = '₩' + formatNumber(totalCost);
    document.getElementById('totalConversions').textContent = formatNumber(totalConversions);
    document.getElementById('avgCVR').textContent = avgCVR + '%';
    document.getElementById('avgCPA').textContent = '₩' + formatNumber(avgCPA);
    document.getElementById('avgROAS').textContent = avgROAS + '%';
}

// 차트 업데이트
function updateCharts() {
    updateChannelChart();
    updateTopCreativesChart();
    updateCTRCVRChart();
    updateROASChart();
    updateEfficiencyChart();
    updateRadarChart();
}

// 채널별 차트
function updateChannelChart() {
    const channelData = {};
    
    filteredData.forEach(row => {
        const channel = row['채널'];
        if (!channelData[channel]) {
            channelData[channel] = { 노출: 0, 클릭: 0, 전환: 0, 비용: 0 };
        }
        channelData[channel]['노출'] += row['노출'];
        channelData[channel]['클릭'] += row['클릭'];
        channelData[channel]['전환'] += row['전환'];
        channelData[channel]['비용'] += row['비용'];
    });
    
    const labels = Object.keys(channelData);
    const impressions = labels.map(ch => channelData[ch]['노출']);
    const clicks = labels.map(ch => channelData[ch]['클릭']);
    const conversions = labels.map(ch => channelData[ch]['전환']);
    
    const ctx = document.getElementById('channelChart').getContext('2d');
    
    if (channelChart) {
        channelChart.destroy();
    }
    
    channelChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '노출',
                    data: impressions,
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 2
                },
                {
                    label: '클릭',
                    data: clicks,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                },
                {
                    label: '전환',
                    data: conversions,
                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 상위 소재 차트
function updateTopCreativesChart() {
    const sortedData = [...filteredData].sort((a, b) => b['전환'] - a['전환']).slice(0, 10);
    
    const labels = sortedData.map(row => row['소재명'].substring(0, 20) + '...');
    const conversions = sortedData.map(row => row['전환']);
    const colors = sortedData.map(row => {
        if (row['채널'] === '네이버') return 'rgba(3, 199, 90, 0.6)';
        if (row['채널'] === '메타') return 'rgba(24, 119, 242, 0.6)';
        return 'rgba(66, 133, 244, 0.6)';
    });
    
    const ctx = document.getElementById('topCreativesChart').getContext('2d');
    
    if (topCreativesChart) {
        topCreativesChart.destroy();
    }
    
    topCreativesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '전환 수',
                data: conversions,
                backgroundColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 테이블 업데이트
function updateTable() {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';
    
    filteredData.forEach(row => {
        const tr = document.createElement('tr');
        
        const channelClass = row['채널'] === '네이버' ? 'channel-naver' : 
                            row['채널'] === '메타' ? 'channel-meta' : 'channel-google';
        
        tr.innerHTML = `
            <td><span class="channel-badge ${channelClass}">${row['채널']}</span></td>
            <td>${row['소재명']}</td>
            <td>${formatNumber(row['노출'])}</td>
            <td>${formatNumber(row['클릭'])}</td>
            <td>${row['CTR']}%</td>
            <td>₩${formatNumber(row['CPC'])}</td>
            <td>${formatNumber(row['전환'])}</td>
            <td>${row['CVR']}%</td>
            <td>₩${formatNumber(row['CPA'])}</td>
            <td>${row['ROAS']}%</td>
            <td>₩${formatNumber(row['비용'])}</td>
            <td>₩${formatNumber(row['매출'])}</td>
        `;
        
        tableBody.appendChild(tr);
    });
    
    // DataTable 초기화
    if (dataTable) {
        dataTable.destroy();
    }
    
    dataTable = $('#dataTable').DataTable({
        pageLength: 10,
        order: [[6, 'desc']], // 전환 기준 정렬
        language: {
            lengthMenu: "_MENU_ 개씩 보기",
            zeroRecords: "데이터가 없습니다",
            info: "_PAGE_ / _PAGES_ 페이지",
            infoEmpty: "데이터 없음",
            infoFiltered: "(전체 _MAX_ 개 중)",
            search: "검색:",
            paginate: {
                first: "처음",
                last: "마지막",
                next: "다음",
                previous: "이전"
            }
        }
    });
}

// 숫자 포맷팅
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// CTR & CVR 비교 차트
function updateCTRCVRChart() {
    const channelData = {};
    
    filteredData.forEach(row => {
        const channel = row['채널'];
        if (!channelData[channel]) {
            channelData[channel] = { clicks: 0, impressions: 0, conversions: 0 };
        }
        channelData[channel].clicks += row['클릭'];
        channelData[channel].impressions += row['노출'];
        channelData[channel].conversions += row['전환'];
    });
    
    const labels = Object.keys(channelData);
    const ctrData = labels.map(ch => {
        const data = channelData[ch];
        return data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : 0;
    });
    const cvrData = labels.map(ch => {
        const data = channelData[ch];
        return data.clicks > 0 ? ((data.conversions / data.clicks) * 100).toFixed(2) : 0;
    });
    
    const ctx = document.getElementById('ctrCvrChart').getContext('2d');
    
    if (ctrCvrChart) {
        ctrCvrChart.destroy();
    }
    
    ctrCvrChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CTR (%)',
                    data: ctrData,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'CVR (%)',
                    data: cvrData,
                    backgroundColor: 'rgba(236, 72, 153, 0.2)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '비율 (%)'
                    }
                }
            }
        }
    });
}

// ROAS 순위 차트
function updateROASChart() {
    const sortedData = [...filteredData]
        .filter(row => row['ROAS'] > 0)
        .sort((a, b) => b['ROAS'] - a['ROAS'])
        .slice(0, 10);
    
    const labels = sortedData.map(row => row['소재명'].substring(0, 15) + '...');
    const roasData = sortedData.map(row => parseFloat(row['ROAS']));
    const colors = sortedData.map(row => {
        const roas = parseFloat(row['ROAS']);
        if (roas >= 400) return 'rgba(34, 197, 94, 0.7)'; // 초록색 - 우수
        if (roas >= 200) return 'rgba(59, 130, 246, 0.7)'; // 파란색 - 양호
        return 'rgba(251, 146, 60, 0.7)'; // 주황색 - 보통
    });
    
    const ctx = document.getElementById('roasChart').getContext('2d');
    
    if (roasChart) {
        roasChart.destroy();
    }
    
    roasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ROAS (%)',
                data: roasData,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.7', '1')),
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'ROAS: ' + context.parsed.x + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'ROAS (%)'
                    }
                }
            }
        }
    });
}

// 효율성 분석 차트 (CPA vs ROAS)
function updateEfficiencyChart() {
    const scatterData = filteredData
        .filter(row => row['CPA'] > 0 && row['ROAS'] > 0)
        .map(row => ({
            x: parseFloat(row['CPA']),
            y: parseFloat(row['ROAS']),
            label: row['소재명'],
            channel: row['채널'],
            conversions: row['전환']
        }));
    
    // 채널별로 데이터 분리
    const channels = [...new Set(scatterData.map(d => d.channel))];
    const datasets = channels.map(channel => {
        const channelData = scatterData.filter(d => d.channel === channel);
        let color;
        if (channel === '네이버') color = 'rgba(3, 199, 90, 0.6)';
        else if (channel === '메타') color = 'rgba(24, 119, 242, 0.6)';
        else color = 'rgba(66, 133, 244, 0.6)';
        
        return {
            label: channel,
            data: channelData.map(d => ({
                x: d.x,
                y: d.y,
                r: Math.sqrt(d.conversions) // 버블 크기는 전환 수에 비례
            })),
            backgroundColor: color,
            borderColor: color.replace('0.6', '1'),
            borderWidth: 2
        };
    });
    
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    
    if (efficiencyChart) {
        efficiencyChart.destroy();
    }
    
    efficiencyChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataIndex = context.dataIndex;
                            const datasetIndex = context.datasetIndex;
                            const channel = channels[datasetIndex];
                            const data = scatterData.filter(d => d.channel === channel)[dataIndex];
                            return [
                                data.label.substring(0, 30),
                                'CPA: ₩' + formatNumber(Math.round(data.x)),
                                'ROAS: ' + data.y + '%',
                                '전환: ' + data.conversions + '개'
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'CPA (원) - 낮을수록 좋음'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'ROAS (%) - 높을수록 좋음'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// 채널별 레이더 차트
function updateRadarChart() {
    const channelData = {};
    
    filteredData.forEach(row => {
        const channel = row['채널'];
        if (!channelData[channel]) {
            channelData[channel] = {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                cost: 0,
                revenue: 0
            };
        }
        channelData[channel].impressions += row['노출'];
        channelData[channel].clicks += row['클릭'];
        channelData[channel].conversions += row['전환'];
        channelData[channel].cost += row['비용'];
        channelData[channel].revenue += row['매출'];
    });
    
    // 정규화 (0-100 스케일)
    const maxValues = {
        impressions: Math.max(...Object.values(channelData).map(d => d.impressions)),
        clicks: Math.max(...Object.values(channelData).map(d => d.clicks)),
        conversions: Math.max(...Object.values(channelData).map(d => d.conversions)),
        ctr: Math.max(...Object.values(channelData).map(d => 
            d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0)),
        cvr: Math.max(...Object.values(channelData).map(d => 
            d.clicks > 0 ? (d.conversions / d.clicks) * 100 : 0)),
        roas: Math.max(...Object.values(channelData).map(d => 
            d.cost > 0 ? (d.revenue / d.cost) * 100 : 0))
    };
    
    const channels = Object.keys(channelData);
    const datasets = channels.map(channel => {
        const data = channelData[channel];
        const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        const cvr = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
        const roas = data.cost > 0 ? (data.revenue / data.cost) * 100 : 0;
        
        let color;
        if (channel === '네이버') color = 'rgba(3, 199, 90, 0.3)';
        else if (channel === '메타') color = 'rgba(24, 119, 242, 0.3)';
        else color = 'rgba(66, 133, 244, 0.3)';
        
        return {
            label: channel,
            data: [
                (data.impressions / maxValues.impressions) * 100,
                (data.clicks / maxValues.clicks) * 100,
                (data.conversions / maxValues.conversions) * 100,
                (ctr / maxValues.ctr) * 100,
                (cvr / maxValues.cvr) * 100,
                (roas / maxValues.roas) * 100
            ],
            backgroundColor: color,
            borderColor: color.replace('0.3', '1'),
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });
    
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    if (radarChart) {
        radarChart.destroy();
    }
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['노출량', '클릭량', '전환량', 'CTR', 'CVR', 'ROAS'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
}