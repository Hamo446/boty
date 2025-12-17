const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const fs = require('fs');
const path = require('path');

// إعدادات التطبيق
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const BOT_NAME = process.env.BOT_NAME || "𝑯𝑨𝑴𝑶_𝑩𝑶𝑻";
const YEAR = process.env.YEAR || "2025";
const DEVELOPER = process.env.DEVELOPER || "𝑯𝑨𝑴𝑶";

// إعدادات مهمة للسيرفرات
process.on('uncaughtException', (err) => {
    console.log('⚠️  خطأ غير متوقع:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('⚠️  وعد مرفوض:', reason);
});

// إعدادات العميل للسيرفر
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: process.env.CLIENT_ID || "hamo-bot-2025",
        dataPath: process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
    webVersionCache: {
        type: 'none'
    }
});

// تخزين بيانات البوت
let botStatus = 'جاري التهيئة...';
let lastQrTime = null;
let lastQrCode = null;
let logs = [];

// عند جاهزية البوت
client.on('ready', () => {
    console.log('╔══════════════════════════╗');
    console.log(`     ${BOT_NAME} 🚀`);
    console.log('   جاهز للتشغيل على Koyeb');
    console.log(`        ©️ ${YEAR}`);
    console.log('╚══════════════════════════╝');
    console.log(`⏰ ${new Date().toLocaleString('ar-EG')}`);
    botStatus = '🟢 البوت شغال وجاهز!';
    lastQrCode = null;
    addLog('🟢 البوت متصل وجاهز!');
});

// دالة لإضافة سجل
function addLog(message) {
    const timestamp = new Date().toLocaleString('ar-EG');
    logs.unshift({ time: timestamp, msg: message });
    if (logs.length > 100) logs.pop();
}

// عند ظهور QR code
client.on('qr', (qr) => {
    console.log('\n📱 📱 📱 📱 📱 📱 📱 📱 📱');
    console.log('   QR Code جاهز للمسح');
    console.log('📱 📱 📱 📱 📱 📱 📱 📱 📱\n');
    
    qrcode.generate(qr, { small: true });
    
    botStatus = '🟡 بانتظار ربط الواتساب...';
    lastQrTime = new Date();
    lastQrCode = qr;
    addLog('📱 تم إنشاء QR Code جديد');
    
    // حفظ QR في ملف (اختياري للسيرفر)
    const qrData = `QR Code Generated at: ${new Date().toISOString()}\n${qr}`;
    fs.writeFileSync('last_qr.txt', qrData);
});

// عند تغيير حالة الاتصال
client.on('auth_failure', (msg) => {
    console.log('🔴 فشل المصادقة:', msg);
    botStatus = '🔴 فشل المصادقة';
    addLog('🔴 فشل المصادقة: ' + msg);
});

client.on('disconnected', (reason) => {
    console.log('🔴 تم فصل البوت:', reason);
    botStatus = '🔴 البوت مقطوع';
    addLog('🔴 تم فصل البوت: ' + reason);
});

// عند استقبال رسالة
client.on('message', async message => {
    try {
        const chat = await message.getChat();
        
        // الحصول على اسم المرسل بطريقة آمنة
        let senderName = 'صديق';
        try {
            if (message._data && message._data.notifyName) {
                senderName = message._data.notifyName;
            } else if (message.author) {
                senderName = message.author.split('@')[0];
            } else if (message.from) {
                senderName = message.from.split('@')[0];
            }
        } catch (e) {
            senderName = 'صديق';
        }
        
        console.log(`📩 ${senderName}: ${message.body}`);
        addLog(`📩 رسالة من ${senderName}: ${message.body.substring(0, 50)}${message.body.length > 50 ? '...' : ''}`);
        
        // البوت يعمل على الجروبات والمحادثات الخاصة
        const isGroup = chat.isGroup;
        
        const msg = message.body.toLowerCase().trim();
        
        // ========== حقوق النشر والمطور ==========
        if (msg.includes('حقوق') || msg.includes('copyright') || msg.includes('مين عملك') || msg === '!حقوق') {
            const copyrightMsg = `
╔══════════════════════════╗
        ${BOT_NAME} 🚀
╚══════════════════════════╝

📜 *حقوق النشر ©️ ${YEAR}*

✨ *المطور:* ${DEVELOPER}
🎯 *الإصدار:* 3.0.0

🔒 *شروط الاستخدام:*
• ممنوع إعادة نشر الكود
• للاستخدام الشخصي فقط
• ممنوع البيع أو التوزيع

💖 *صنع بكل حب لخدمتكم!*
`;
            message.reply(copyrightMsg);
            return;
        }
        
        if (msg.includes('مطور') || msg.includes('هامو') || msg.includes('صاحب البوت') || msg === '!مطور') {
            const devMsg = `🛠️ *مطور البوت:* ${DEVELOPER}\n📅 *سنة التطوير:* ${YEAR}\n✨ *المميزات:* هزار، أنس، تسلية\n🛡️ *حقوق النشر محفوظة ©️*\n\n_للاستفسارات: خاص على الواتساب_`;
            message.reply(devMsg);
            return;
        }
        
        if (msg.includes('إصدار') || msg.includes('version') || msg === '!v' || msg === 'v') {
            message.reply(`📱 *${BOT_NAME}*\nالإصدار: 3.0.0\nالسنة: ${YEAR}\nالحالة: ${botStatus}`);
            return;
        }
        
        if (msg === '!حالة' || msg === 'الحالة' || msg === 'status') {
            const now = new Date();
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            
            const statusMsg = `📊 *حالة البوت:*\n\n` +
                             `⚡ الحالة: ${botStatus}\n` +
                             `⏰ وقت التشغيل: ${hours} ساعة ${minutes} دقيقة\n` +
                             `📅 تاريخ السيرفر: ${now.toLocaleDateString('ar-EG')}\n` +
                             `🕒 وقت السيرفر: ${now.toLocaleTimeString('ar-EG')}\n` +
                             `🌐 المضيف: Koyeb Cloud\n\n` +
                             `✨ ${BOT_NAME} ©️ ${YEAR}`;
            message.reply(statusMsg);
            return;
        }
        
        // ========== الأوامر الأساسية ==========
        if (msg.includes('هلو') || msg.includes('اهلا') || msg.includes('hello') || msg.includes('مرحبا')) {
            const greetings = [
                `أهلاً وسهلاً بك يا ${senderName}! 🌹\nكيف حالك اليوم؟\n✨ ${BOT_NAME} ©️ ${YEAR}`,
                `مرحباً حبيبي ${senderName}! 😊\nأهلاً بيك في بوت ${DEVELOPER}\nالسنة: ${YEAR} 🚀`,
                `هلا والله يا ${senderName}! 💖\nتشرفنا بوجودك معانا!\n${BOT_NAME}`
            ];
            message.reply(greetings[Math.floor(Math.random() * greetings.length)]);
            return;
        }
        
        if (msg.includes('عامل اي') || msg.includes('أخبارك') || msg.includes('ازيك')) {
            const replies = [
                `الحمدلله يا قلبي ${senderName}، وانت عامل إيه؟ 😊\n✨ ${BOT_NAME} ©️ ${YEAR}`,
                `تمام والحمدلله يا غالي! 😎\nشكراً لسؤالك!\nالسنة: ${YEAR} 🎉`,
                `ماشي الحال يا ${senderName}! 🚀\n${BOT_NAME} بخير دايماً!`
            ];
            message.reply(replies[Math.floor(Math.random() * replies.length)]);
            return;
        }
        
        if (msg.includes('بحبك') || msg.includes('حبك') || msg.includes('حبق')) {
            const loveReplies = [
                `أنا كمان بحبك يا ${senderName}! ❤️\nالله يخليك ليا!\n✨ ${BOT_NAME} ©️ ${YEAR}`,
                `يا حبيبي ${senderName}! 💝\nربنا يزيد حب بيننا!\n${DEVELOPER}`,
                `والله انت اللي حلو يا ${senderName}! 😘\nأنت اللي تستحق كل الحب!\n©️ ${YEAR}`
            ];
            message.reply(loveReplies[Math.floor(Math.random() * loveReplies.length)]);
            return;
        }
        
        // ========== الهزار ==========
        if (msg.includes('غبي') || msg.includes('تافه') || msg.includes('وحش')) {
            const funnyReplies = [
                `انت اللي غبي يا حبيبي! 😂`,
                `تفتكرني تافه؟ 🤔 أنا بوت ${BOT_NAME}!`,
                `وحش إزاي وأنا شغال على Koyeb! 😎`
            ];
            message.reply(funnyReplies[Math.floor(Math.random() * funnyReplies.length)]);
            return;
        }
        
        if (msg.includes('مزاج') || msg.includes('مود')) {
            const moods = [
                `عالي أوي يا عم! 🎉 عام ${YEAR} بدأ حلو!`,
                'ماشي الحال 😎 والسنة جديدة!',
                `مظبوط والله! 🥳 ${YEAR} هتكون سنة البوتات!`,
                'هجرب أتحسن 🤔 علشان أخدمك أكتر!'
            ];
            message.reply(`مزاجي: ${moods[Math.floor(Math.random() * moods.length)]}\n✨ ${BOT_NAME}`);
            return;
        }
        
        if (msg.includes('نكتة') || msg.includes('نكت') || msg.includes('ضحك')) {
            const jokes = [
                `إيه الفرق بين 2024 و${YEAR}؟ 🤔\nسنة زيادة في عمر ${BOT_NAME}! 😂`,
                `قالوا للبوت: ليه مش بتتعب؟\nقال: علشان أنا على Koyeb والسنة ${YEAR}! 🤖`,
                `إيه رأيك في بوتات ${YEAR}؟\nأحلى بوت: ${BOT_NAME} طبعاً! 🎯`
            ];
            message.reply(jokes[Math.floor(Math.random() * jokes.length)]);
            return;
        }
        
        // ========== معلومات ==========
        if (msg.includes('وقت') || msg.includes('الساعة') || msg === '!وقت') {
            const now = new Date();
            const time = now.toLocaleTimeString('ar-EG');
            const hijri = new Intl.DateTimeFormat('ar-u-ca-islamic', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(now);
            
            message.reply(`🕒 *الوقت الحالي:*\n${time}\n📅 *هجري:* ${hijri}\n✨ ${BOT_NAME} ©️ ${YEAR}`);
            return;
        }
        
        if (msg.includes('تاريخ') || msg.includes('اليوم') || msg === '!تاريخ') {
            const now = new Date();
            const date = now.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            message.reply(`📅 *تاريخ اليوم:*\n${date}\n🎊 *السنة:* ${YEAR}\n✨ ${BOT_NAME}`);
            return;
        }
        
        if (msg.includes('سنة') && msg.includes('جديد')) {
            message.reply(`🎉 *كل سنة وانت طيب!*\n✨ ${YEAR} سنة سعيدة عليك!\n🎊 ${BOT_NAME} معاك طول السنة!`);
            return;
        }
        
        // ========== مساعدة ==========
        if (msg.includes('مساعدة') || msg.includes('الاوامر') || msg === 'help' || msg === '!مساعدة') {
            const helpMsg = `
╔══════════════════════════╗
      ${BOT_NAME} ${YEAR} 🚀
        قائمة الأوامر
╚══════════════════════════╝

📜 *حقوق النشر:*
• !حقوق - معلومات حقوق النشر
• !مطور - معلومات المطور
• !حالة - حالة البوت والسيرفر

👋 *الترحيب:*
• اهلا/مرحبا - ترحيب
• ازيك/أخبارك/عامل اي - أسأل عنك

😄 *الهزار:*
• بحبك/حبق/حبك - ردة حلوة
• مزاج/مود - مزاج البوت
• نكتة/ضحك - نكتة مضحكة

🕒 *المعلومات:*
• وقت/الساعة - الوقت الحالي
• تاريخ/اليوم - تاريخ اليوم
• !إصدار - إصدار البوت

🎭 *تلقائي:*
• قول أي حاجة هرد عليك
• جرب تكتب أي كلام

📌 *ملاحظة:* 
صلي على النبي

✨ *جميع الحقوق محفوظة ©️*
${BOT_NAME}
`;
            message.reply(helpMsg);
            return;
        }
        
        // ========== ردود تلقائية ==========
        if (msg.includes('شكرا') || msg.includes('مشكور') || msg.includes('thanks')) {
            message.reply(`العفو يا ${senderName}! 😊\n✨ ${BOT_NAME} ©️ ${YEAR}`);
            return;
        }
        
        if (msg.includes('صباح') || msg.includes('مساء')) {
            const times = ['صباح الخير! 🌅', 'مساء النور! 🌇', 'أهلاً بيك! 🌟'];
            message.reply(`${times[Math.floor(Math.random() * times.length)]}\n✨ ${BOT_NAME} ©️ ${YEAR}`);
            return;
        }
        
        // ========== رد عشوائي ==========
        if (Math.random() < 0.4) { // 40% احتمال يرد
            const randomReplies = [
                `مش فاهم قصدك يا ${senderName}! 🥺\nاكتب "مساعدة" عشان أعرفك أعمل إيه!\n✨ ${BOT_NAME} ©️ ${YEAR}`,
                `تفسرلي أكثر يا حبيبي؟ 🤔\n✨ ${BOT_NAME}`,
                `والله مش عارف أرد عليك دلوقتي! 😅\nلكن عام ${YEAR} هتعلم أكتر!`,
                `أنا بوت هزار يا ${senderName}! 🎭\nمش بوت جد، بس بحاول!`,
                `السنة ${YEAR} جديدة يا صاحبي! 🎊\nجرب أمر تاني!`
            ];
            message.reply(randomReplies[Math.floor(Math.random() * randomReplies.length)]);
        }
        
    } catch (error) {
        console.error('❌ خطأ في معالجة الرسالة:', error);
    }
});

// ========== Express Routes ==========
app.use(express.json());

// الصفحة الرئيسية
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${BOT_NAME} - ${YEAR}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                color: white;
                min-height: 100vh;
                padding: 20px;
                text-align: center;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                padding: 40px;
                border-radius: 20px;
                border: 2px solid rgba(255,255,255,0.2);
                margin-top: 50px;
            }
            
            .header {
                margin-bottom: 40px;
            }
            
            h1 {
                font-size: 3.5em;
                margin-bottom: 10px;
                color: #ffcc00;
                text-shadow: 0 0 20px rgba(255,204,0,0.5);
            }
            
            h2 {
                color: #00ff88;
                margin-bottom: 30px;
                font-size: 1.8em;
            }
            
            .status-box {
                background: rgba(0,0,0,0.3);
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 5px solid #ff0064;
            }
            
            .info-box {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .info-card {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                transition: transform 0.3s;
            }
            
            .info-card:hover {
                transform: translateY(-5px);
                background: rgba(255,255,255,0.15);
            }
            
            .copyright {
                margin-top: 40px;
                padding: 20px;
                background: rgba(0,0,0,0.4);
                border-radius: 10px;
                border-top: 3px solid #ffcc00;
            }
            
            .qr-section {
                margin: 30px 0;
                padding: 20px;
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
            }
            
            .btn {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(45deg, #ff0064, #ffcc00);
                color: white;
                text-decoration: none;
                border-radius: 50px;
                margin: 10px;
                font-weight: bold;
                transition: all 0.3s;
            }
            
            .btn:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 20px rgba(255,0,100,0.3);
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 20px;
                }
                
                h1 {
                    font-size: 2.5em;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${BOT_NAME}</h1>
                <h2>🚀 بوت واتساب - ${YEAR}</h2>
            </div>
            
            <div class="status-box">
                <h3>📊 حالة البوت:</h3>
                <p style="font-size: 1.5em; margin: 10px 0;">${botStatus}</p>
                <p>⏰ ${new Date().toLocaleString('ar-EG')}</p>
            </div>
            
            <div class="info-box">
                <div class="info-card">
                    <h3>✨ المطور</h3>
                    <p>${DEVELOPER}</p>
                </div>
                
                <div class="info-card">
                    <h3>📅 السنة</h3>
                    <p>${YEAR}</p>
                </div>
                
                <div class="info-card">
                    <h3>🌐 السيرفر</h3>
                    <p>Koyeb Cloud</p>
                </div>
                
                <div class="info-card">
                    <h3>⚡ الحالة</h3>
                    <p id="status">جاري التحميل...</p>
                </div>
            </div>
            
            <div class="qr-section">
                <h3>📱 ربط الواتساب</h3>
                <p>افتح logs في Koyeb لسكان QR code</p>
                <a href="/logs" class="btn">مشاهدة الـ Logs</a>
            </div>
            
            <div class="copyright">
                <h3>📜 حقوق النشر ©️ ${YEAR}</h3>
                <p>جميع الحقوق محفوظة لـ ${BOT_NAME}</p>
                <p>ممنوع إعادة النشر أو البيع أو التعديل</p>
                <p style="margin-top: 15px; color: #ffcc00;">✨ صنع بكل حب لخدمتكم!</p>
            </div>
            
            <div style="margin-top: 30px;">
                <a href="/health" class="btn">فحص الصحة</a>
                <a href="/restart?secret=${process.env.RESTART_SECRET || 'hamo2025'}" class="btn">إعادة التشغيل</a>
                <a href="/stats" class="btn">الإحصائيات</a>
            </div>
        </div>
        
        <script>
            // تحديث حالة البوت
            function updateStatus() {
                fetch('/api/status')
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('status').textContent = data.status;
                    })
                    .catch(() => {
                        document.getElementById('status').textContent = '🔴 غير متصل';
                    });
            }
            
            // تحديث كل 10 ثواني
            updateStatus();
            setInterval(updateStatus, 10000);
            
            // إظهار السنة بشكل مميز
            const yearElement = document.createElement('div');
            yearElement.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: rgba(255,204,0,0.2); color: #ffcc00; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 1.2em; z-index: 1000;';
            yearElement.textContent = '🎊 ${YEAR}';
            document.body.appendChild(yearElement);
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// صفحة الـ logs
app.get('/logs', async (req, res) => {
    let qrImageHtml = '';
    if (lastQrCode) {
        try {
            const qrDataUrl = await QRCode.toDataURL(lastQrCode, { width: 300 });
            qrImageHtml = `
                <div class="qr-container">
                    <h3>📱 امسح رمز QR لربط الواتساب</h3>
                    <img src="${qrDataUrl}" alt="QR Code" style="border-radius: 10px; background: white; padding: 10px;">
                </div>
            `;
        } catch (err) {
            qrImageHtml = '<p style="color: #ff6600;">خطأ في إنشاء صورة QR</p>';
        }
    } else {
        qrImageHtml = '<p style="color: #00ff00;">✅ البوت متصل بالفعل أو في انتظار QR جديد</p>';
    }
    
    const logsHtml = logs.map(log => `<div class="log-entry"><span class="time">[${log.time}]</span> ${log.msg}</div>`).join('');
    
    res.send(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="10">
        <title>Logs - ${BOT_NAME}</title>
        <style>
            body {
                background: #1a1a1a;
                color: #00ff00;
                font-family: monospace;
                padding: 20px;
            }
            .header {
                color: #ffcc00;
                font-size: 2em;
                margin-bottom: 20px;
                text-align: center;
            }
            .info {
                color: #00ffff;
                margin: 20px 0;
                text-align: center;
            }
            .qr-container {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
            }
            .qr-container h3 {
                color: #ffcc00;
                margin-bottom: 15px;
            }
            .logs-container {
                background: #0d0d0d;
                padding: 20px;
                border-radius: 10px;
                max-height: 400px;
                overflow-y: auto;
                margin-top: 20px;
            }
            .log-entry {
                padding: 5px 0;
                border-bottom: 1px solid #333;
            }
            .time {
                color: #888;
            }
            .back-link {
                display: inline-block;
                margin-top: 20px;
                color: #ff0064;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="header">${BOT_NAME} Logs</div>
        <div class="info">
            ⏰ ${new Date().toLocaleString('ar-EG')} | 📅 السنة: ${YEAR} | ✨ المطور: ${DEVELOPER}
        </div>
        
        ${qrImageHtml}
        
        <h3 style="color: #00ffff;">📋 السجلات:</h3>
        <div class="logs-container">
            ${logsHtml || '<p style="color: #666;">لا توجد سجلات بعد...</p>'}
        </div>
        
        <a href="/" class="back-link">← الرجوع للصفحة الرئيسية</a>
    </body>
    </html>
    `);
});

// فحص الصحة
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        bot: botStatus,
        year: YEAR,
        developer: DEVELOPER,
        bot_name: BOT_NAME,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        platform: 'Koyeb Cloud',
        port: PORT
    });
});

// API للحالة
app.get('/api/status', (req, res) => {
    res.json({
        status: botStatus,
        year: YEAR,
        bot_name: BOT_NAME,
        developer: DEVELOPER,
        connected: client.info ? true : false,
        qrGenerated: lastQrTime ? true : false,
        serverTime: new Date().toISOString()
    });
});

// إعادة التشغيل
app.get('/restart', (req, res) => {
    if (req.query.secret === (process.env.RESTART_SECRET || 'hamo2025')) {
        botStatus = '🔄 جاري إعادة التشغيل...';
        setTimeout(() => {
            client.destroy().then(() => client.initialize());
        }, 1000);
        res.send('✅ جاري إعادة تشغيل البوت...');
    } else {
        res.status(401).send('❌ غير مصرح');
    }
});

// الإحصائيات
app.get('/stats', (req, res) => {
    res.json({
        year: YEAR,
        botName: BOT_NAME,
        developer: DEVELOPER,
        version: '3.0.0',
        server: 'Koyeb',
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
    });
});

// تشغيل السيرفر
app.listen(PORT, '0.0.0.0', () => {
    console.log('╔══════════════════════════════════╗');
    console.log(`   ${BOT_NAME} جاري التشغيل...`);
    console.log(`   على المنفذ: ${PORT}`);
    console.log(`   السنة: ${YEAR}`);
    console.log(`   المطور: ${DEVELOPER}`);
    console.log('╚══════════════════════════════════╝');
    
    // بدء البوت بعد 3 ثواني
    setTimeout(() => {
        client.initialize();
        console.log('🚀 جاري تهيئة بوت الواتساب...');
    }, 3000);
});

// لإبقاء السيرفر نشط
setInterval(() => {
    if (client.info) {
        console.log(`❤️  ${new Date().toLocaleTimeString('ar-EG')} - ${BOT_NAME} شغال على ${YEAR}`);
    }
}, 300000); // كل 5 دقائق

// عند إغلاق التطبيق
process.on('SIGINT', () => {
    console.log(`🛑 إغلاق ${BOT_NAME}...`);
    client.destroy();
    process.exit(0);
});
