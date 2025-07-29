document addEventListener('DOMContentLoaded'， () => {
    const textDropZone = document.getElementById('text-drop-zone');
    const imageDropZone = document.getElementById('image-drop-zone');
    const imageInput = document.getElementById('image-input');
    const textInput = document.getElementById('text-input');
    const preview = document.getElementById('preview');
    const generateBtnGroup = document.getElementById('generate-btn-group');

    let qrCodeUrl = '';

    /**
     * 设置拖放区域的事件监听器
     * @param {HTMLElement} zone - 拖放区域元素
     * @param {Function} onDrop - 拖放处理函数
     */
    function setupDropZone(zone, onDrop) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            onDrop(e.dataTransfer);
        });
    }

    /**
     * 处理文本拖放
     * @param {DataTransfer} dataTransfer - 拖放数据
     */
    function handleTextDrop(dataTransfer) {
        const text = dataTransfer.getData('text/plain');
        if (text) {
            textInput.value = text;
            checkInputs();
        }
    }

    /**
     * @function handleImageFile
     * @description 统一处理图片文件，包括读取、预览和存储base64数据。
     * @param {File} file - 用户提供图片文件.
     */
    function handleImageFile(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                qrCodeUrl = e.target.result;
                preview.src = qrCodeUrl;
                preview.style.display = 'block';
                checkInputs();
            };
            reader.readAsDataURL(file);
        }
    }

    setupDropZone(textDropZone, handleTextDrop);
    setupDropZone(imageDropZone, (dataTransfer) => handleImageFile(dataTransfer.files[0]));

    textInput.addEventListener('input', checkInputs);

    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageFile(e.target.files[0]);
        }
    });

    window.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                handleImageFile(blob);
                break; // 只处理第一张图片
            }
        }
    });

    /**
     * 检查输入是否完成，以启用生成按钮
     */
    /**
     * 检查输入是否完成，以启用生成按钮
     */
    function checkInputs() {
        const allButtons = document.querySelectorAll('.generate-btn');
        const isEnabled = textInput.value.trim() && qrCodeUrl;
        allButtons.forEach(button => {
            button.disabled = !isEnabled;
        });
    }



    const templateHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITTLE}}</title>
    <style>
        /* A4纸张设置 */
        @page {
            size: A4;
            margin: 20mm;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            /* A4纸张尺寸: 210mm x 297mm */
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
        }
        
        .container {
            width: 100%;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
            padding: 30mm;
            /* padding-left: 30mm;
            padding-right: 30mm; */
            box-sizing: border-box;
        }
        
        .header {
            margin-bottom: 20px;
        }
        
        .route-title {
            font-size: 18px;
            font-weight: 500;
            line-height: 21px;
            margin-bottom: 12px;
        }
        
        .trip-info {
            color: #333;
            font-size: 14px;
            line-height: 16px;
            margin: 6px 0;
        }
        
        .trip-info span {
            margin-right: 32px;
        }
        
        .passenger-info {
            color: #333;
            font-size: 14px;
            line-height: 16px;
            margin: 6px 0;
        }
        
        .train-details {
            margin-bottom: 20px;
        }
        
        .train-card {
            background-color: #f8fafe;
            border-radius: 4px;
            font-size: 12px;
            line-height: 14px;
            margin-top: 12px;
            padding: 18px 20px;
        }
        
        .train-name {
            color: #999;
            line-height: 17px;
            margin-bottom: 7px;
        }
        
        .schedule-table {
            border-collapse: collapse;
            width: 100%;
        }
        
        .time-cell {
            padding: 0;
            text-align: left;
            color: rgba(0,0,0,.87);
            font-size: 18px;
            font-weight: 500;
            letter-spacing: -.4px;
            line-height: 21px;
            width: 80px;
        }
        
        .time-cell.right {
            text-align: right;
        }
        
        .station-name {
            color: rgba(0,0,0,.87);
            font-size: 12px;
            font-weight: 400;
            line-height: 12px;
            margin-top: 4px;
        }
        
        .duration-cell {
            padding: 0;
            color: rgba(0,0,0,.38);
            text-align: center;
        }
        
        .duration-dots {
            display: inline-block;
            border-radius: 50%;
            height: 4px;
            margin-right: 6px;
            vertical-align: middle;
            width: 4px;
        }
        
        .seat-type {
            color: #4985e6;
            margin-top: 12px;
        }
        
        .divider {
            background-color: #fff;
            padding: 32px 0 12px 0;
        }
        
        .divider hr {
            border-style: none;
            border-bottom: 1px solid #f5f5f5;
            margin: 0;
        }
        
        .instructions {
            margin-top: 20px;
        }
        
        .instructions-title {
            font-size: 16px;
            font-weight: 500;
            line-height: 19px;
        }
        
        .instruction-content {
            color: #333;
            font-size: 14px;
            line-height: 16px;
            margin-top: 32px;
        }
        
        .step-title {
            font-weight: 500;
        }
        
        .qr-section {
            margin: 12px 0 30px;
        }
        
        .qr-title {
            font-weight: 500;
        }
        
        .qr-description {
            color: #666;
            margin-top: 6px;
            white-space: pre-line;
        }
        
        .qr-container {
            text-align: center;
            width: 100%;
            font-size: 14px;
            line-height: 17px;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
        }
        
        .booking-number {
            margin-top: 10px;
        }
        
        .ticket-number-section {
            background: #f5f5f5;
            border-radius: 16px;
            margin: 12px auto;
            min-width: 318px;
            padding: 12px;
            text-align: center;
            width: fit-content;
        }
        
        .ticket-number-label {
            color: #757575;
            font-size: 14px;
            font-weight: 400;
            line-height: 21px;
            margin-bottom: 4px;
            text-align: center;
        }
        
        .ticket-number-divider {
            background: #e6e6e6;
            display: inline-block;
            height: 1px;
            vertical-align: middle;
            width: 24px;
        }
        
        .ticket-number-text {
            margin: 0 8px;
        }
        
        .ticket-number {
            color: #2073f9;
            font-size: 20px;
            font-weight: 600;
            line-height: 26.4px;
        }
        
        .guide-button {
            margin: 0;
            border: 1px solid #4a4a4a;
            border-radius: 99rem;
            display: inline-block;
            font-weight: 500;
            outline: none;
            padding: 8px 20px;
            text-decoration: none;
            color: #212121;
            font-size: 16px;
            line-height: 1.44;
            margin-top: 16px;
        }
        
        @media print {
            body {
                background-color: #fff;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
                padding: 20mm;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: left; margin-bottom: 20px;">
            <img src="{{LOGO_URL}}" alt="Logo" style="width: 150px; height: auto;">
        </div>
        <!-- 头部信息 -->
        <div class="header">
            <div class="route-title">{{DEPARTURE_STATION}} - {{ARRIVAL_STATION}}</div>
            <div class="trip-info">
                <span>{{TRAVEL_DATE}}</span>
            </div>
            <div class="passenger-info">乘客： {{PASSENGER_INFO}}</div>
        </div>
        
        <!-- 列车详情 -->
        <div class="train-details">
            <div class="train-card">
                <table class="schedule-table">
                    <tbody>
                        <tr>
                            <td class="time-cell">
                                <div>{{DEPARTURE_TIME}}</div>
                                <div class="station-name">{{DEPARTURE_STATION}}</div>
                            </td>
                            <td class="duration-cell">
                                <div>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.04)"></i>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.06)"></i>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.08)"></i>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.10)"></i>
                                    <span>{{DURATION}}</span>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.10)"></i>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.08)"></i>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.06)"></i>
                                    <i class="duration-dots" style="background-color:rgba(0,0,0,0.04)"></i>
                                </div>
                            </td>
                            <td class="time-cell right">
                                <div>{{ARRIVAL_TIME}}</div>
                                <div class="station-name">{{ARRIVAL_STATION}}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="seat-type">{{SEAT_TYPE}}</div>
            </div>
            
            <div class="divider">
                <hr>
            </div>
        </div>
        
        <!-- 使用说明 -->
        <div class="instructions">
            <div class="instructions-title">如何使用</div>
            <div class="instruction-content">
                <div class="step-title">1.&nbsp;{{DEPARTURE_STATION}}&nbsp;-&nbsp;{{ARRIVAL_STATION}}</div>
                
                <div class="qr-section">
                    <div class="qr-title">使用二维码取票</div>
                    <div class="qr-description">请于带有"5489"或"新幹線·特急"logo的⾃动售票机，使⽤⼆维码取票（每位乘客领取2张票），详情请查看取票指南</div>
                </div>
                
                <div class="qr-container">
                    <table align="center" style="width:100%;">
                        <tbody>
                            <tr>
                                <td style="width:50%;">
                                    <img class="qr-image" src="{{QR_CODE_URL}}" alt="取票二维码">
                                    <div class="booking-number">预订编号:{{BOOKING_NUMBER}}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="ticket-number-section">
                    <div class="ticket-number-label">
                        <span class="ticket-number-divider"></span>
                        <span class="ticket-number-text">取票编号</span>
                        <span class="ticket-number-divider"></span>
                    </div>
                    <div class="ticket-number">
                        <span>05068830745</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 指南按钮 -->
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://www.klook.cn/zh-CN/notice_content/27255/?from_source=email&from_medium=system_email&from_campaign=mob_ptp_voucher" class="guide-button" target="_blank">
                查看领取指南
            </a>
        </div>
    </div>
</body>
</html>
`;

    generateBtnGroup.addEventListener('click', async (e) => {
        const originalTitle = document.title;
        if (!e.target.classList.contains('generate-btn')) return;

        const seatType = e.target.dataset.seatType;
        const text = textInput.value;
        const data = parseText(text);

        if (!data) {
            alert('无法解析文本，请检查格式。');
            return;
        }

        data.SEAT_TYPE = seatType;
        data.QR_CODE_URL = qrCodeUrl;
        data.LOGO_URL = 'https://apaang.github.io/klook/jtr-voucher/LOGO.png';

        // 检查缺失信息并提示用户输入
        const missingData = checkMissingData(templateHtml, data);
        if (missingData.length > 0) {
            const userInputData = promptForMissingData(missingData);
            if (userInputData === null) {
                return; // 用户取消了输入
            }
            // 将用户输入的数据合并到原数据中
            Object.assign(data, userInputData);
        }

        const filledHtml = fillTemplate(templateHtml, data);

        // 创建一个隐藏的iframe用于打印
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(filledHtml);
        doc.close();

        // 设置主页面的标题用于打印
        document.title = data.TITTLE || 'JTR 凭证';

        // 等待iframe内容加载完成再打印
        iframe.onload = function() {
            iframe.contentWindow.focus(); // 确保iframe获得焦点
            iframe.contentWindow.print();
            // 打印后移除iframe并恢复原始标题
            setTimeout(() => {
                document.body.removeChild(iframe);
                document.title = originalTitle;
            }, 1000);
        };
    });

    /**
     * 解析文本内容提取信息
     * @param {string} text - 输入的文本
     * @returns {object} - 提取的数据对象
     */
    function parseText(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const data = {};
        let currentKey = null;
        
        // 定义文本标签到数据键的映射
        const keyMapping = {
            'Reservation No.': 'BOOKING_NUMBER',
            'Ticket Name': 'Ticket Name', // 使用 Ticket Name 作为键
            'Travel Date': 'TRAVEL_DATE',
            'Area': 'AREA',
            'No. of Users': 'PASSENGER_INFO'
        };

        // 逐行解析文本，处理多行值
        lines.forEach(line => {
            const parts = line.split(/\t|\s{2,}/);
            const potentialKey = parts[0].trim();
            
            if (keyMapping[potentialKey]) {
                currentKey = keyMapping[potentialKey];
                data[currentKey] = parts.slice(1).join(' ').trim();
            } else if (currentKey) {
                // 将多行内容追加到当前键值
                data[currentKey] += ' ' + line.trim();
            }
        });

        // 对提取的'Area'信息进行后处理
        if (data.AREA) {
            const areaText = data.AREA;
            // 提取出发站和到达站
            const departureMatch = areaText.match(/^\s*([^（]+)/);
            if (departureMatch) {
                data.DEPARTURE_STATION = departureMatch[1].trim();
            }
            const arrivalMatch = areaText.match(/から\s*(.*?)(?=\s*（\d{2}:\d{2}着）)/);
            if (arrivalMatch) {
                data.ARRIVAL_STATION = arrivalMatch[1].trim();
            }

            // 提取出发和到达时间
            const departureTimeMatch = areaText.match(/(\d{2}):(\d{2})発/);
            const arrivalTimeMatch = areaText.match(/(\d{2}):(\d{2})着/);
            if (departureTimeMatch && arrivalTimeMatch) {
                data.DEPARTURE_TIME = `${departureTimeMatch[1]}:${departureTimeMatch[2]}`;
                data.ARRIVAL_TIME = `${arrivalTimeMatch[1]}:${arrivalTimeMatch[2]}`;

                // 计算旅行时长
                const departure = new Date(0);
                departure.setUTCHours(parseInt(departureTimeMatch[1], 10), parseInt(departureTimeMatch[2], 10), 0);
                
                const arrival = new Date(0);
                arrival.setUTCHours(parseInt(arrivalTimeMatch[1], 10), parseInt(arrivalTimeMatch[2], 10), 0);

                let diffMs = arrival - departure;
                if (diffMs < 0) { // 处理跨天情况
                    diffMs += 24 * 60 * 60 * 1000;
                }
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                data.DURATION = `${diffHours}h ${diffMins}m`;
            }
            delete data.AREA; // 删除临时键
        }
        
        // 设置页面标题
        if (data.DEPARTURE_STATION && data.ARRIVAL_STATION) {
            data.TITTLE = `${data.DEPARTURE_STATION} - ${data.ARRIVAL_STATION} | ${data.BOOKING_NUMBER}`;
        }

        // 填充模板中需要但源文本未提供的数据
        data.TRANSFER_TYPE = data.TRANSFER_TYPE || '无需换乘'; // 示例数据
        data.TRAIN_NAME = data.TRAIN_NAME || 'e5489'; // 示例数据

        return data;
    }

    /**
     * 检查模板中缺失的数据
     * @param {string} template - HTML模板字符串
     * @param {object} data - 已有的数据
     * @returns {Array} - 缺失的数据键数组
     */
    function checkMissingData(template, data) {
        const placeholderRegex = /{{([^}]+)}}/g;
        const placeholders = [];
        let match;
        
        // 提取模板中所有的占位符
        while ((match = placeholderRegex.exec(template)) !== null) {
            const key = match[1].trim();
            if (!placeholders.includes(key)) {
                placeholders.push(key);
            }
        }
        
        // 检查哪些占位符没有对应的数据或数据为空
        const missingData = placeholders.filter(key => {
            // LOGO_URL 和 QR_CODE_URL 是内部处理的，不需要用户输入
            if (key === 'LOGO_URL' || key === 'QR_CODE_URL') {
                return false;
            }
            return !data[key] || data[key].toString().trim() === '';
        });
        
        return missingData;
    }

    /**
     * 提示用户输入缺失的数据
     * @param {Array} missingKeys - 缺失的数据键数组
     * @returns {Object|null} - 用户输入的数据对象，如果用户取消则返回null
     */
    function promptForMissingData(missingKeys) {
        const userInputData = {};
        
        // 为缺失的键提供友好的中文名称
        const keyDisplayNames = {
            'TITTLE': '页面标题',
            'DEPARTURE_STATION': '出发站',
            'ARRIVAL_STATION': '到达站',
            'TRAVEL_DATE': '旅行日期',
            'PASSENGER_INFO': '乘客信息',
            'DEPARTURE_TIME': '出发时间',
            'ARRIVAL_TIME': '到达时间',
            'DURATION': '旅行时长',
            'SEAT_TYPE': '座席类型',
            'QR_CODE_URL': '二维码图片',
            'BOOKING_NUMBER': '预订编号',
            'Ticket Name': '票券名称',
            'TRANSFER_TYPE': '换乘类型',
            'TRAIN_NAME': '列车名称'
        };
        
        let message = '检测到以下信息缺失，请输入相应的值：\n\n';
        missingKeys.forEach((key, index) => {
            const displayName = keyDisplayNames[key] || key;
            message += `${index + 1}. ${displayName} (${key})\n`;
        });
        
        message += '\n点击确定开始逐一输入，点击取消放弃生成。';
        
        if (!confirm(message)) {
            return null;
        }
        
        // 逐一提示用户输入每个缺失的值
        for (const key of missingKeys) {
            const displayName = keyDisplayNames[key] || key;
            let userInput = prompt(`请输入 ${displayName}:`, '');
            
            if (userInput === null) {
                // 用户点击了取消
                return null;
            }
            
            // 如果用户输入为空，给一个默认值或再次提示
            if (userInput.trim() === '') {
                userInput = prompt(`${displayName} 不能为空，请重新输入:`, '');
                if (userInput === null || userInput.trim() === '') {
                    return null;
                }
            }
            
            userInputData[key] = userInput.trim();
        }
        
        return userInputData;
    }

    /**
     * 将数据填充到HTML模板中
     * @param {string} template - HTML模板字符串
     * @param {object} data - 要填充的数据
     * @returns {string} - 填充后的HTML字符串
     */
    function fillTemplate(template, data) {
        let filled = template;
        for (const key in data) {
            const regex = new RegExp('{{' + key + '}}', 'g');
            filled = filled.replace(regex, data[key]);
        }
        return filled;
    }
});
