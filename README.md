# Ahmet Said Korucuk Neural Portfolio

Sinematik scroll deneyimiyle ilerleyen, hücrelerden merkezi sinir ağına dönüşen deneysel kişisel portfolyo.

## Teknolojiler

- React, TypeScript, Vite
- Three.js, React Three Fiber, @react-three/drei
- GSAP ScrollTrigger
- Lenis smooth scroll
- Global CSS

## Kurulum

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Deploy

Bu proje GitHub Pages üzerinde `ahmetsaid.korucuk.com` custom domain'i ile kökten serve edilir. Bu yüzden Vite `base` ayarı varsayılan `/` olarak bırakılmıştır.

Deploy akışı:

1. GitHub repository settings içinde Pages source olarak `GitHub Actions` seçilir.
2. `main` veya `master` branch'e push yapılır.
3. `.github/workflows/deploy.yml` dependency audit, production build ve Pages deploy adımlarını çalıştırır.
4. Root'taki `CNAME` dosyası build sonunda `dist/CNAME` içine kopyalanır.

Manuel deploy tetiklemek için GitHub Actions ekranından `Deploy to GitHub Pages` workflow'u `Run workflow` ile çalıştırılabilir.

## İçerik Değiştirme

Kişisel bilgiler, yetenekler, projeler, sosyal bağlantılar ve renk değerleri tek dosyadan yönetilir:

```text
src/data/siteConfig.ts
```

Nöral ağın düğüm ve bağlantı üretimi:

```text
src/data/neuralField.ts
```

## Yapı

```text
src/
  components/
    NeuralCanvas/
    NeuralSignalField/
    NeuronSystem/
    NeuralConnections/
    SceneLighting/
    ScrollExperience/
    PortfolioOverlay/
    ProjectSection/
    ContactSection/
    LoadingScreen/
  hooks/
  data/
  styles/
```

## Performans ve Erişilebilirlik

- 5000'e kadar GPU tabanlı sinyal tohumu ile yoğun ilk ekran
- BufferGeometry ve shader uniform ile bağlantı animasyonları
- Sınırlı devicePixelRatio
- Mobilde daha düşük nöron, bağlantı ve partikül yoğunluğu
- Düşük FPS algılanırsa otomatik kalite azaltma
- WebGL fallback
- `prefers-reduced-motion` desteği
- Semantik HTML içerik katmanı ve klavye ile erişilebilir bağlantılar
