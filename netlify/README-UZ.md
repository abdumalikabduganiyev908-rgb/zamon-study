# Essential Mastery — to‘liq yangi kod

Bu loyiha Next.js, Firebase umumiy bazasi va Netlify bilan ishlaydi. Eski papkangizni zaxiralang; saytga avtomatik deploy qilinmadi.

Eski saytdagi brauzerga saqlangan profillar yangi bazaga avtomatik ko‘chmaydi. Ular o‘chirilmaydi, lekin yangi hisobda ko‘rinmaydi. O‘qituvchi o‘quvchining boshlang‘ich kitob va Unitini belgilashi mumkin.

## 1. Kodni ochish

Kod ZIP’ini ochib, essential-mastery papkasini VS Code’da oching. Git Bash terminalida:

~~~bash
pnpm install
cp .env.example .env.local
~~~

Ignored builds xatosi chiqsa pnpm approve-builds, keyin pnpm install bajaring. pnpm-workspace.yaml kerakli build ruxsatlarini belgilaydi.

## 2. Firebase ulash — majburiy

Loyiha: zamon-c4a03. Web config server ma’lumotlariga kirish uchun yetarli emas. Bu sayt ism-familiya/parol va HttpOnly server sessiyasini ishlatadi; Firebase Authentication yoki email login talab qilinmaydi.

1. Firebase Console → zamon-c4a03 → Build → Firestore Database → Create database. Standard edition va production mode tanlang. Mavjud baza bo‘lsa yangisini yaratmang.
2. Firestore → Rules: yangi, faqat shu saytga tegishli bazada database/firestore.rules faylini qo‘ying va Publish. Agar loyihada boshqa ilovalar bo‘lsa mavjud qoidalarning umumiy ruxsatlari school_* kolleksiyalarini ochib qo‘ymasligini tekshiring; eski qoidalarni ko‘r-ko‘rona almashtirmang. Bu paketdagi qoidalar barcha to‘g‘ridan-to‘g‘ri brauzer kirishini yopadi.
3. Project settings → Service accounts → Generate new private key. Yuklangan JSON’ni loyiha papkasiga firebase-service-account.json nomida joylashtiring. Uni chatga yoki GitHubga yubormang.
4. .env.local ichida FIREBASE_SERVICE_ACCOUNT_FILE=./firebase-service-account.json bo‘lsin. FIREBASE_PROJECT_ID va FIREBASE_STORAGE_BUCKET tayyor kiritilgan. GEMINI_API_KEY ni o‘zingiz kiriting.
5. Server service account’da Firestore o‘qish/yozish uchun IAM ruxsati bo‘lishi kerak. Console yaratgan Admin hisob odatda kerakli ruxsatlar bilan keladi; permission denied bo‘lsa Cloud IAM’da shu client_email hisobining ruxsatlarini tekshiring.

School kolleksiyalari setup:accounts va sayt ishlaganda avtomatik yaratiladi. SQL bajarilmaydi. Mavjud boshqa Firebase ma’lumotlari ko‘chirilmaydi va o‘zgartirilmaydi; sayt school_* kolleksiyalaridan foydalanadi.

Firebase server private key va Gemini kalitini NEXT_PUBLIC o‘zgaruvchisiga qo‘ymang. Key fayli va .env.local .gitignore bilan chiqarilgan.

## 3. O‘qituvchi va vaqtincha Admin

~~~bash
pnpm setup:accounts
~~~

Skript Hamidulloh Tojiboyev uchun bir martalik, 7 kun amal qiladigan taklif kodini chiqaradi. O‘qituvchi parolini siz kiritmaysiz. Kodni faqat Hamidullohga bering. Saytda Teacher → First visit? Set your password tugmasini tanlab, Hamidulloh / Tojiboyev, taklif kodi va o‘zi tanlagan yangi parolni ikki marta kiritadi. Kod ishlatilgach bekor bo‘ladi; keyingi safar oddiy Sign in orqali kiradi. Taklif kodining faqat SHA256 hashi serverda saqlanadi. Bir paytdagi ikki aktivatsiya parolni qayta yozolmaydi.

Keyin setup skripti vaqtincha adminning ism-familiyasi va parolini so‘raydi. Parol kamida 8 belgi; terminalda ko‘rinadi.

Skript mavjud aktiv hisobning paroli yoki rolini almashtirmaydi. Tugallanmagan admin setup bo‘lsa qayta bajarish mumkin. O‘qituvchi hali taklifni ishlatmagan bo‘lsa qayta bajarish eski kodni bekor qiladi va yangisini chiqaradi. Faqat taklifni yangilash:

~~~bash
node --env-file=.env.local scripts/setup-accounts.mjs --teacher-invite-only
~~~

Agar eski kod bilan o‘qituvchi allaqachon parol olgan bo‘lsa, shu hisob o‘zgarmaydi va taklif yaratilmaydi; o‘qituvchi mavjud paroli bilan kiradi. O‘quvchi Teacher tanlashning o‘zi bilan o‘qituvchi bo‘lolmaydi.

Admin hamma bo‘limni ko‘radi. Settings → Leave admin role bilan chiqadi. Keyin Admin huquqini faqat o‘qituvchi hisobidan qayta berish yoki olib tashlash mumkin. Unitni o‘zgartirish/ochish ham faqat o‘qituvchiga tegishli.

## 4. Barcha audiolar — shu ZIP ichida

media/audio papkasida 1362 MP3 bor. Firebase Console → Storage → Get started. Firebase Storage uchun Blaze billing plan talab qilinadi (rasmiy ma’lumot: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024). Bu kod avtomatik pullik tarifni yoqmaydi.

Yangi, faqat shu saytga tegishli bucket’da database/storage.rules qoidalarini Storage → Rules’ga qo‘ying va Publish. Boshqa ilova bilan bir bucket ishlatilsa eski qoidalarni almashtirishdan oldin mavjud fayl ruxsatlarini tekshiring. Audio/ ostidagi school audiolari ommaga ochiq bo‘lmasin.

Server service account’da Storage object o‘qish/yozish IAM ruxsati kerak. Keyin:

~~~bash
pnpm upload:audio
~~~

Audio audio/a1/coursebook va boshqa papkalarga yuklanadi, jami taxminan 457 MiB. Uzilish bo‘lsa qayta bajaring. media/ GitHubga yuborilmaydi. Server o‘quvchining kitob/Unit ruxsatini tekshirib, bir soatlik signed URL beradi. Essential listening brauzer ovozi bilan ishlaydi.

## 5. Ishga tushirish

~~~bash
pnpm dev
~~~

http://localhost:3000 oching. Birinchi kirish inglizcha, Settings’da o‘zbekcha tanlanadi.

~~~bash
pnpm typecheck
pnpm build
~~~

O‘quvchi faqat birinchi ro‘yxatdan o‘tishda joriy kitob, Unit va dars qismini (Essential’da so‘zni) tanlaydi. Davom etish tugmasi aynan shu joydan yoki keyingi tugallanmagan darsdan boshlaydi. Oldingi qismlar avval o‘rganilgan deb ochiq turadi; ularga sun’iy baho yoki javob yozilmaydi. Shu Unit va oldingilari ochiq, keyingilari yopiq. O‘qituvchi boshlang‘ich darajani tekshirib tuzatishi mumkin.

Essential’da 3 so‘z ochiq. Bir so‘zning hamma mashqi to‘g‘ri tugatilsa, yana bittasi ochiladi. Takror bajarish qo‘shimcha so‘z ochmaydi. Unit testi oldingi Unitlarni ham takrorlaydi. Keyingi Unitni test avtomatik ochmaydi — o‘qituvchi tasdiqlaydi.

Navigate’da 70 Unit va 280 dars qismi mavjud. Dastlab .1 qismi ochiq; uni tugatgach .2, keyin .3 va .4 ochiladi. Unit testi hamma qismlar tugagach ochiladi. Mavzu va grammar yuborilgan Coursebook mundarijalariga moslangan, mashqlar mustaqil tuzilgan. Bu kitobdagi barcha topshiriqlarning to‘liq raqamli nusxasi emas. Yozma ishlar o‘qituvchi tekshirishi uchun saqlanadi; Gemini fikri o‘qituvchi bahosini almashtirmaydi.

Listening: Kitob → Coursebook / Workbook → Unit → Track.
Videos: Kitob → Unit → Video. 70 ta video havolasi mavjud. Ichki YouTube player ishlamasa Open on YouTube tugmasi bor. Shu muhitda ularning barchasining playback/embedding ruxsati tasdiqlanmadi. Videoda savol-javob yo‘q.

## 6. Guruhlar, uyga vazifa va baholar

Groups bo‘limida guruh nomi, dars kunlari, dars vaqti va eslatma vaqtini belgilang. Barcha vaqtlar Asia/Tashkent bo‘yicha.

Students → New students orqali yangi o‘quvchilarni guruhga qo‘shing. O‘qituvchi kitob/Unitni belgilaydi yoki Approve next Unit tugmasini bosadi. O‘qituvchi o‘z pedagogik qarori bilan ruxsat beradi; test uni avtomatik cheklamaydi.

Vazifa yoki event qo‘shishda kerakli guruhlar alohida tanlanadi, hech bir guruh avtomatik tanlanmaydi. Qo‘shimcha vazifada pop-up belgisi bor. O‘quvchi I have read this bosgunga qadar u o‘qilmagan hisoblanadi. Deadline yo‘q; vazifa o‘qituvchi olib tashlaguncha ko‘rinadi.

Students’da mashq javoblari, xatolar, natija, sarflangan vaqt, baho va izoh ko‘rinadi. O‘quvchi faqat o‘z natijalarini ko‘radi. Javoblar oynasida oxirgi 1000 urinish ko‘rsatiladi; tugallangan darslar va umumiy sarflangan vaqt bazada alohida saqlanadi, eski urinishlar ko‘rinmay qolsa ham darslar qayta yopilmaydi. Speaking taxminiy transkript orqali baholanadi, fonema yoki aksent o‘lchanmaydi. Mikrofon audio yozuvi serverga saqlanmaydi.

## 7. Bildirishnomalar va o‘rnatish

~~~bash
pnpm setup:push
~~~

Chiqqan NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT qiymatlarini .env.local va Netlify environment variables’ga yozing. VAPID_SUBJECT haqiqiy https://sizning-saytingiz.netlify.app manzili bo‘lsin. Private key sir saqlanadi. Kalit almashsa foydalanuvchilar ruxsatni qayta ulashi kerak.

Netlify daily-reminders funksiyasini har 15 daqiqada bajaradi. Belgilangan guruh eslatma vaqtidan keyin kuniga bir marta bugungi dars, uyga vazifa yoki event haqida xabar yuboradi. Yetkazilish vaqti taxminan 15 daqiqalik oraliqda, qurilma/internetga bog‘liq. Mahalliy pnpm dev’da jadval avtomatik yurmaydi.

Settings → Enable notifications. Brauzer ruxsati, HTTPS, Firebase, VAPID va Netlify scheduled function tayyor bo‘lishi kerak. Ular ulanmaguncha fon bildirishnomalari ishlamaydi.

Android/Chrome’da Install app taklifi yoki brauzer menyusi orqali o‘rnating. iPhone’da Safari → Share → Add to Home Screen. O‘rnatish offline darslar borligini anglatmaydi.

Speaking mikrofon ruxsatini so‘raganda Allow bosing. Avval bloklangan bo‘lsa brauzer manzil satri → Site permissions → Microphone → Allow. Chrome/Edge ovozni tanishi internet va brauzerga bog‘liq. Qo‘llanmasa transkript yozib o‘qituvchiga topshirish mumkin.

## 8. GitHub va Netlify

Eski repozitoriy papkasidagi kodni shu kod bilan almashtiring, .git papkasini saqlang. .env.local va media papkasi GitHubga yuborilmaydi.

~~~bash
git status
git add .
git commit -m "Add Navigate books and teacher-managed learning"
git push origin main
~~~

Netlify → Environment variables:

- FIREBASE_PROJECT_ID=zamon-c4a03
- FIREBASE_STORAGE_BUCKET=zamon-c4a03.firebasestorage.app
- FIREBASE_SERVICE_ACCOUNT_JSON: firebase-service-account.json ichidagi butun JSON matni. Bu faqat server env qiymati; frontend kod yoki repository fayli emas.
- GEMINI_API_KEY, GEMINI_MODEL va push uchun VAPID o‘zgaruvchilari.

Netlify’da FIREBASE_SERVICE_ACCOUNT_FILE kerak emas; server JSON environment qiymatini ishlatadi. Build command pnpm build, publish directory .next. netlify.toml paketda bor. Key yoki .env.local faylini Netlify repositoryga yuklamang.

Bir xil Firebase loyihasi ishlatilsa hisoblar va natijalar Netlify sayt/profil o‘zgarganda ham shu bazada saqlanadi. Eski brauzer/Supabase profillarini bu paket avtomatik migratsiya qilmaydi.

## Tekshiruv va cheklovlar

TypeScript va Next.js production build o‘tdi. Mahalliy mock sinovda OAuth imzosi/token keshi, CRUD, takror ismning rad etilishi, progress upsert, statistika, login limiti, parallel kunlik notification claim va audio URL imzosi tekshirildi.

Firebase adapterida kolleksiya CRUD, atomik login limitlari, qayta topshirishda progress upsert va kunlik notification claim ishlatiladi. Huquqlar Next.js serverida tekshiriladi; brauzer Firestore va Storage bazasiga bevosita kira olmaydi. Web configdagi API key bu server kalitining o‘rnini bosmaydi.

Firebase haqiqiy loyihasiga ulanish hali tekshirilmagan: server private key foydalanuvchining kompyuterida kiritiladi. Real audio upload, Gemini va push tekshiruvlari sozlangandan keyin bajariladi. Telefon ko‘rinishlari va barcha YouTube embedding ruxsatlari avtomatik tasdiqlanmagan. Navigate mashqlari mavzuga mos original mashqlar; barcha textbook mashqlarining nusxasi emas.

Firestore adapteri avval bitta tenglik filtri bilan oladi, qolgan filtrlash/sortni serverda bajaradi. O‘qituvchi statistikasi barcha attemptlarni o‘qiydi; katta sinflarda foydalanish va read xarajatlarini kuzating. Login limitlari 15 daqiqada 15 urinish. Eski session/notification hujjatlari avtomatik o‘chirilmaydi; Firestore TTL/arxiv siyosati keyingi boshqaruv ishidir.
