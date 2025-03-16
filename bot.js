// AGNT.Hub Daily Rewards Claim Botu
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const figlet = require('figlet');

// Sabit değişkenler
const API_BASE_URL = "https://hub-api.agnthub.ai/api";
const TOKEN_FILE = path.join(__dirname, 'token.txt');
const LOG_FILE = path.join(__dirname, 'claim_log.txt');

// ASCII Logo
const displayLogo = () => {
    console.log('\n');
    console.log(chalk.cyan(figlet.textSync('GETCAKE DIEYOUNG', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })));
    console.log(chalk.magenta(figlet.textSync('Daily Claim Bot', {
        font: 'Small',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })));
    console.log('\n');
    console.log(chalk.yellow('=================================================='));
    console.log(chalk.green('  Developed by: ') + chalk.white('getcakedieyoungx'));
    console.log(chalk.green('  TG: https://t.me/getcakedieyoungx ') + chalk.white('github.com/getcakedieyoungx'));
    console.log(chalk.yellow('==================================================\n'));
}

// Renkli log fonksiyonları
const logTypes = {
    INFO: {color: chalk.blue, prefix: '📘 INFO'},
    SUCCESS: {color: chalk.green, prefix: '✅ SUCCESS'},
    WARNING: {color: chalk.yellow, prefix: '⚠️ WARNING'},
    ERROR: {color: chalk.red, prefix: '❌ ERROR'},
    CLAIM: {color: chalk.magenta, prefix: '🎁 CLAIM'},
    SYSTEM: {color: chalk.cyan, prefix: '🔧 SYSTEM'},
    NETWORK: {color: chalk.hex('#FFA500'), prefix: '🌐 NETWORK'}
};

// Log fonksiyonu
function logMessage(type, message) {
    const timestamp = new Date().toISOString();
    const logType = logTypes[type] || logTypes.INFO;
    const coloredMessage = logType.color(`[${timestamp}] ${logType.prefix}: ${message}`);
    const plainMessage = `[${timestamp}] ${logType.prefix}: ${message}\n`;
    
    console.log(coloredMessage);
    fs.appendFileSync(LOG_FILE, plainMessage);
}

// Görsel ayırıcı
function displaySeparator() {
    console.log(chalk.yellow('--------------------------------------------------'));
}

// Token dosyasından cookie bilgilerini oku
function readTokenFromFile() {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
        } else {
            logMessage('ERROR', "token.txt dosyası bulunamadı!");
            return null;
        }
    } catch (error) {
        logMessage('ERROR', `Token okuma hatası: ${error.message}`);
        return null;
    }
}

// Daily reward claim işlemi
async function claimDailyReward() {
    try {
        displaySeparator();
        const cookieHeader = readTokenFromFile();
        
        if (!cookieHeader) {
            logMessage('ERROR', "Cookie bilgisi olmadan işlem yapılamaz.");
            return;
        }
        
        logMessage('SYSTEM', "Daily reward claim işlemi başlatılıyor...");
        
        // Önce daily rewards durumunu kontrol et
        logMessage('NETWORK', "Daily rewards durumu kontrol ediliyor...");
        const checkResponse = await axios.get(`${API_BASE_URL}/daily-rewards`, {
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            }
        });
        
        const rewardStatus = checkResponse.data;
        logMessage('INFO', `Mevcut ödül durumu: Gün ${chalk.bold(rewardStatus.day)}, Miktar: ${chalk.bold(rewardStatus.rewardAmount)}, Alınabilir: ${rewardStatus.todaysRewardAvailable ? chalk.green('EVET') : chalk.red('HAYIR')}`);
        
        // Eğer bugünkü ödül alınabilir durumdaysa claim et
        if (rewardStatus.todaysRewardAvailable) {
            logMessage('NETWORK', "Claim isteği gönderiliyor...");
            const claimResponse = await axios.post(`${API_BASE_URL}/daily-rewards/claim`, "", {
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const claimResult = claimResponse.data;
            logMessage('CLAIM', `${chalk.bold(claimResult.amount)} puan başarıyla kazanıldı! 🎉`);
            
            // Kullanıcı bilgilerini güncelle
            logMessage('NETWORK', "Kullanıcı bilgileri güncelleniyor...");
            const userResponse = await axios.get(`${API_BASE_URL}/users`, {
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const userData = userResponse.data;
            logMessage('SUCCESS', `Güncel toplam puan: ${chalk.bold(userData.points)}`);
            
            // Sonraki claim zamanını hesapla ve göster
            const nextClaimTime = new Date();
            nextClaimTime.setHours(nextClaimTime.getHours() + 24);
            logMessage('INFO', `Sonraki claim: ${chalk.bold(nextClaimTime.toLocaleString())} (24 saat sonra)`);
            
            return {
                success: true,
                message: `Daily reward başarıyla alındı. ${claimResult.amount} puan kazanıldı!`,
                totalPoints: userData.points,
                nextClaim: nextClaimTime
            };
        } else {
            logMessage('WARNING', "Bugün için ödül zaten alınmış veya henüz mevcut değil.");
            logMessage('INFO', `Sonraki ödül: Gün ${chalk.bold(rewardStatus.nextDay)}, Miktar: ${chalk.bold(rewardStatus.nextDayRewardAmount)}`);
            
            // Sonraki claim zamanını hesapla ve göster
            const nextClaimTime = new Date();
            nextClaimTime.setHours(nextClaimTime.getHours() + 24);
            logMessage('INFO', `Sonraki claim denemesi: ${chalk.bold(nextClaimTime.toLocaleString())} (24 saat sonra)`);
            
            return {
                success: false,
                message: "Bugün için ödül zaten alınmış veya henüz mevcut değil.",
                nextDay: rewardStatus.nextDay,
                nextReward: rewardStatus.nextDayRewardAmount,
                nextClaim: nextClaimTime
            };
        }
    } catch (error) {
        logMessage('ERROR', `Claim işlemi sırasında hata oluştu: ${error.message}`);
        if (error.response) {
            logMessage('ERROR', `Hata detayı: ${JSON.stringify(error.response.data)}`);
        }
        
        // Hata durumunda da sonraki claim zamanını göster
        const nextClaimTime = new Date();
        nextClaimTime.setHours(nextClaimTime.getHours() + 24);
        logMessage('INFO', `Sonraki claim denemesi: ${chalk.bold(nextClaimTime.toLocaleString())} (24 saat sonra)`);
        
        return {
            success: false,
            message: "Hata oluştu: " + error.message,
            nextClaim: nextClaimTime
        };
    } finally {
        displaySeparator();
    }
}

// 24 saatte bir çalıştırma fonksiyonu
async function startDailyClaimSchedule() {
    // İlk çalıştırma
    await claimDailyReward();
    
    // 24 saatte bir çalıştır (milisaniye cinsinden)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    setInterval(async () => {
        logMessage('SYSTEM', "24 saat doldu, yeni claim işlemi başlatılıyor...");
        await claimDailyReward();
    }, TWENTY_FOUR_HOURS);
    
    logMessage('SYSTEM', "Bot 24 saatte bir çalışacak şekilde ayarlandı");
}

// Botu başlat
displayLogo();
logMessage('SYSTEM', "AGNT.Hub Daily Rewards Claim Botu başlatıldı!");
startDailyClaimSchedule().catch(error => {
    logMessage('ERROR', `Bot başlatma hatası: ${error.message}`);
});
