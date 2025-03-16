# AGNT.Hub Daily Rewards Claim Botu


Bu bot, AGNT.Hub platformunda günlük ödülleri (daily rewards) otomatik olarak 24 saatte bir claim etmek için tasarlanmıştır. Linux sunucularında çalışacak şekilde optimize edilmiştir.

## Özellikler

- 🎁 24 saatte bir otomatik claim işlemi
- 📊 Renkli ve detaylı log kaydı
- 🔐 Cookie tabanlı kimlik doğrulama
- 🔄 Hata durumunda otomatik yeniden deneme
- ⏰ Sonraki claim zamanı bildirimi

## Kurulum

### Gereksinimleri Yükleme

```bash
# Repoyu klonla
git clone https://github.com/getcakedieyoungx/AGNTHub-Auto.git
cd AGNTHub-Auto

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
node bot.js
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

# veya screen ile
screen -S agnt-bot
node bot.js
# Ctrl+A, D ile screen'den ayrılabilirsiniz
```

</p>

## 🌟 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Join tg, I will post bots there too.
[Telegram](https://t.me/getcakedieyoungx)

### For donations:
EVM:
0xE065339713A8D9BF897d595ED89150da521a7d09

SOLANA:
CcBPMkpMbZ4TWE8HeUWyv9CkEVqPLJ5gYe163g5SR4Vf
