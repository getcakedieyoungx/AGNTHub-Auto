// AGNT.Hub Daily Rewards Claim Botu
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Sabit değişkenler
const API_BASE_URL = "https://hub-api.agnthub.ai/api";
const TOKEN_FILE = path.join(__dirname, 'token.txt');
const LOG_FILE = path.join(__dirname, 'claim_log.txt');

// Log fonksiyonu
function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    fs.appendFileSync(LOG_FILE, logEntry);
}

// Token dosyasından cookie bilgilerini oku
function readTokenFromFile() {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
        } else {
            logMessage("HATA: token.txt dosyası bulunamadı!");
            return null;
        }
    } catch (error) {
        logMessage(`Token okuma hatası: ${error.message}`);
        return null;
    }
}

// Daily reward claim işlemi
async function claimDailyReward() {
    try {
        const cookieHeader = readTokenFromFile();
        
        if (!cookieHeader) {
            logMessage("Cookie bilgisi olmadan işlem yapılamaz.");
            return;
        }
        
        logMessage("Daily reward claim işlemi başlatılıyor...");
        
        // Önce daily rewards durumunu kontrol et
        const checkResponse = await axios.get(`${API_BASE_URL}/daily-rewards`, {
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            }
        });
        
        const rewardStatus = checkResponse.data;
        logMessage(`Mevcut ödül durumu: Gün ${rewardStatus.day}, Miktar: ${rewardStatus.rewardAmount}, Alınabilir: ${rewardStatus.todaysRewardAvailable}`);
        
        // Eğer bugünkü ödül alınabilir durumdaysa claim et
        if (rewardStatus.todaysRewardAvailable) {
            const claimResponse = await axios.post(`${API_BASE_URL}/daily-rewards/claim`, "", {
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const claimResult = claimResponse.data;
            logMessage(`Claim başarılı: ${claimResult.amount} puan kazanıldı!`);
            
            // Kullanıcı bilgilerini güncelle
            const userResponse = await axios.get(`${API_BASE_URL}/users`, {
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const userData = userResponse.data;
            logMessage(`Güncel toplam puan: ${userData.points}`);
            
            // Sonraki claim zamanını hesapla ve göster
            const nextClaimTime = new Date();
            nextClaimTime.setHours(nextClaimTime.getHours() + 24);
            logMessage(`Sonraki claim: ${nextClaimTime.toLocaleString()} (24 saat sonra)`);
            
            return {
                success: true,
                message: `Daily reward başarıyla alındı. ${claimResult.amount} puan kazanıldı!`,
                totalPoints: userData.points,
                nextClaim: nextClaimTime
            };
        } else {
            logMessage("Bugün için ödül zaten alınmış veya henüz mevcut değil.");
            logMessage(`Sonraki ödül: Gün ${rewardStatus.nextDay}, Miktar: ${rewardStatus.nextDayRewardAmount}`);
            
            // Sonraki claim zamanını hesapla ve göster
            const nextClaimTime = new Date();
            nextClaimTime.setHours(nextClaimTime.getHours() + 24);
            logMessage(`Sonraki claim denemesi: ${nextClaimTime.toLocaleString()} (24 saat sonra)`);
            
            return {
                success: false,
                message: "Bugün için ödül zaten alınmış veya henüz mevcut değil.",
                nextDay: rewardStatus.nextDay,
                nextReward: rewardStatus.nextDayRewardAmount,
                nextClaim: nextClaimTime
            };
        }
    } catch (error) {
        logMessage(`Claim işlemi sırasında hata oluştu: ${error.message}`);
        if (error.response) {
            logMessage(`Hata detayı: ${JSON.stringify(error.response.data)}`);
        }
        
        // Hata durumunda da sonraki claim zamanını göster
        const nextClaimTime = new Date();
        nextClaimTime.setHours(nextClaimTime.getHours() + 24);
        logMessage(`Sonraki claim denemesi: ${nextClaimTime.toLocaleString()} (24 saat sonra)`);
        
        return {
            success: false,
            message: "Hata oluştu: " + error.message,
            nextClaim: nextClaimTime
        };
    }
}

// 24 saatte bir çalıştırma fonksiyonu
async function startDailyClaimSchedule() {
    // İlk çalıştırma
    await claimDailyReward();
    
    // 24 saatte bir çalıştır (milisaniye cinsinden)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    setInterval(async () => {
        logMessage("24 saat doldu, yeni claim işlemi başlatılıyor...");
        await claimDailyReward();
    }, TWENTY_FOUR_HOURS);
    
    logMessage("Bot 24 saatte bir çalışacak şekilde ayarlandı");
}

// Botu başlat
logMessage("AGNT.Hub Daily Rewards Claim Botu başlatıldı!");
startDailyClaimSchedule().catch(error => {
    logMessage(`Bot başlatma hatası: ${error.message}`);
});
