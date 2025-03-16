# AGNT.Hub Daily Rewards Claim Botu

<p align="center">
  <img src="screenshots/bot-screenshot.png" alt="AGNT.Hub Daily Claim Bot" width="700">
</p>

Bu bot, AGNT.Hub platformunda günlük ödülleri (daily rewards) otomatik olarak 24 saatte bir claim etmek için tasarlanmıştır. Linux sunucularında çalışacak şekilde optimize edilmiştir.

## Özellikler

- 🎁 24 saatte bir otomatik claim işlemi
- 📊 Renkli ve detaylı log kaydı
- 🔐 Cookie tabanlı kimlik doğrulama
- 🔄 Hata durumunda otomatik yeniden deneme
- ⏰ Sonraki claim zamanı bildirimi
- 🎨 Güzel ASCII sanatı logo

## Kurulum

### Gereksinimleri Yükleme

```bash
# Repoyu klonla
git clone https://github.com/getcakedieyoungx/agnt-hub-daily-claim-bot.git
cd agnt-hub-daily-claim-bot

# Bağımlılıkları yükle
npm install
```

### Cookie Bilgilerini Alma

1. AGNT.Hub sitesine giriş yapın
2. F12 tuşuna basarak geliştirici araçlarını açın
3. Network sekmesine geçin
4. Herhangi bir API isteğine tıklayın (örneğin `/api/users`)
5. Headers (Başlıklar) sekmesinde "Request Headers" bölümünü bulun
6. "Cookie" satırını bulun ve tüm değeri kopyalayın

### Cookie Bilgilerini Kaydetme

Kopyaladığınız cookie değerini `token.txt` adlı bir dosyaya kaydedin:

```bash
# token.txt dosyası oluştur
echo "kopyaladığınız_cookie_değeri" > token.txt
```

## Kullanım

```bash
# Botu başlat
npm start
```

Bot başladıktan sonra:
- İlk claim işlemini hemen gerçekleştirecek
- Sonraki claim işlemini 24 saat sonra otomatik olarak yapacak
- Tüm işlemleri renkli konsola ve `claim_log.txt` dosyasına kaydedecek

## Önemli Notlar

1. **Cookie Süresi**: Cookie'lerin genellikle bir süresi vardır. Eğer bot bir süre sonra çalışmayı durdurursa, yeni cookie bilgilerini almanız ve `token.txt` dosyasını güncellemeniz gerekebilir.

2. **Güvenlik**: Cookie bilgileri hesabınıza erişim sağlar, bu yüzden `token.txt` dosyasını güvenli tutun ve sadece güvendiğiniz sunucularda saklayın.

3. **Sürekli Çalışma**: Botun sürekli çalışması için terminal penceresini açık tutmanız gerekir. Alternatif olarak `nohup` veya `screen` gibi araçlar kullanabilirsiniz:

```bash
# nohup ile arka planda çalıştırma
nohup npm start > output.log 2>&1 &

# veya screen ile
screen -S agnt-bot
npm start
# Ctrl+A, D ile screen'den ayrılabilirsiniz
```

## Ekran Görüntüleri

<p align="center">
  <img src="screenshots/claim-success.png" alt="Başarılı Claim" width="600">
</p>

## Lisans

MIT
