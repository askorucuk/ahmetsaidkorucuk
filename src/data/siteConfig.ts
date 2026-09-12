export type Project = {
  id: string;
  name: string;
  description: string;
  details: string[];
  role: string;
  technologies: string[];
  year: string;
  href: string;
};

export type TimelineItem = {
  period: string;
  title: string;
  description: string;
};

export const siteConfig = {
  person: {
    name: 'Ahmet Said Korucuk',
    title: 'Frontend Developer / AI Product Developer',
    tagline: 'Scalable frontend mimarilerini, gerçek zamanlı akışları ve AI destekli ürün deneyimlerini inşa ediyorum.',
    bio:
      'Frontend Development ve AI Development odağında çalışan, güçlü full-stack ownership refleksine sahip bir geliştiriciyim. React tabanlı production ürünlerinde frontend architecture, state management, real-time communication ve AI-integrated feature geliştirme taraflarında sorumluluk alıyorum.',
    location: 'Urla, Izmir',
    current: 'Jotform',
    education: 'Ege Universitesi, 2017-2022',
    email: 'contact@korucuk.com'
  },
  highlights: [
    'React tabanlı production ürünlerinde frontend ownership ve architecture sorumluluğu',
    'Redux Toolkit, Zustand ve TanStack Query ile sürdürülebilir state ve data-flow yapıları',
    'WebSocket, long polling ve fallback stratejileriyle güvenilir gerçek zamanlı ürün deneyimi',
    'Agent tabanlı AI sistemleriyle prompt suggestion, summarization ve AI feature entegrasyonu'
  ],
  timeline: [
    {
      period: '2017-2022',
      title: 'Bilgisayar mühendisliği temeli',
      description:
        'Ege University Computer Engineering sürecinde algoritmik düşünme, sistem tasarımı ve ürün geliştirme disiplinini güçlü bir mühendislik refleksine dönüştürdüm.'
    },
    {
      period: '2024',
      title: 'React arayüzlerinden ürün sorumluluğuna',
      description:
        'Jotform Report Builder tarafında complex React UI, Redux Toolkit, drag-and-drop ve SCSS mimarileriyle production ölçeğinde feature delivery ve kritik hata çözümü yaptım.'
    },
    {
      period: '2025',
      title: 'Uçtan uca frontend ownership',
      description:
        'Digest Builder ve Boards ürünlerinde reusable component yapıları, CRUD workflow’ları, client-server iletişimi ve performans hassas drag-and-drop deneyimlerini ürün lifecycle’ı boyunca yönettim.'
    },
    {
      period: '2026',
      title: 'AI destekli ürün geliştirme',
      description:
        'Jotform Conversations üzerinde agent-based AI sistemleri, WebSocket iletişimi, Gmail integration testing ve resilient fallback mekanizmalarıyla güvenilir AI product deneyimleri geliştirdim.'
    }
  ] satisfies TimelineItem[],
  skills: [
    'Frontend Development',
    'AI Development',
    'Frontend Architecture',
    'React',
    'TypeScript',
    'Redux Toolkit',
    'Zustand',
    'TanStack Query',
    'State Management',
    'Drag and Drop',
    'SCSS',
    'WebSocket',
    'Long Polling',
    'AI Integration',
    'Email HTML/CSS',
    'Prompt Engineering',
    'Full-Stack Ownership'
  ],
  projects: [
    {
      id: 'report-builder',
      name: 'Jotform Report Builder',
      description:
        'Complex React tabanlı rapor arayüzlerinde feature geliştirme, kritik hata çözümü ve maintainable frontend mimarisi üzerine kurulan ürün deneyimi.',
      details: [
        'Redux Toolkit ile sürdürülebilir state yapıları ve karmaşık UI akışları geliştirildi.',
        'Drag-and-drop etkileşimleri, SCSS mimarisi ve user-centered development pratikleri güçlendirildi.',
        'Production ölçekte bug fixing, feature delivery ve code quality dengesi üzerinde çalışıldı.'
      ],
      role: 'Frontend development, feature implementation, critical issue fixing',
      technologies: ['React', 'Redux Toolkit', 'SCSS', 'Drag and Drop', 'Frontend Architecture'],
      year: '2024',
      href: 'https://www.jotform.com/products/report-builder/'
    },
    {
      id: 'jotform-boards',
      name: 'Jotform Boards',
      description:
        'Kanban-style collaboration ürünü için frontend lifecycle ownership, scalable CRUD workflows ve performance-sensitive drag-and-drop deneyimleri.',
      details: [
        'React, Zustand ve TanStack Query ile modern frontend architecture ve client-server communication kurgulandı.',
        'Form submissions, AI Agent conversations, orders, e-signatures ve workflows kaynaklı görev akışları yönetildi.',
        'Product lifecycle boyunca frontend development liderliği, maintainability ve performans dengesi kuruldu.'
      ],
      role: 'Frontend ownership, frontend architecture, product lifecycle contribution',
      technologies: ['React', 'Zustand', 'TanStack Query', 'SCSS', 'PHP', 'WebSocket', 'Jest', 'Cucumber'],
      year: '2025',
      href: 'https://www.jotform.com/products/boards/task-management-software/'
    },
    {
      id: 'digest-builder',
      name: 'Jotform Digest Builder',
      description:
        'Günlük, haftalık veya aylık form özetlerini grafikler ve detaylı kırılımlarla e-postaya dönüştüren, temelden sahiplenilmiş digest email builder.',
      details: [
        'End-to-end frontend ownership ile reusable component structure ve application state yönetimi kuruldu.',
        'Email-oriented rendering constraints, responsive email davranışları ve cross-client uyumlulukları ele alındı.',
        'Delivery speed ile long-term maintainability arasında dengeli, ürünleşebilir frontend yapısı geliştirildi.'
      ],
      role: 'End-to-end frontend ownership, product evolution, email rendering architecture',
      technologies: ['React', 'SCSS', 'Email HTML/CSS', 'Responsive Email', 'Cross-Client Testing'],
      year: '2025',
      href: 'https://www.jotform.com/help/how-to-set-up-digest-emails/'
    },
    {
      id: 'jotform-conversations',
      name: 'Jotform Conversations',
      description:
        'AI-powered product development odağında, agent-based AI sistemleriyle çalışan prompt suggestion, summarization ve realtime conversation deneyimleri.',
      details: [
        'Frontend uygulamaları agent-based AI sistemlerine bağlanarak prompt-based suggestion ve summarization akışları geliştirildi.',
        'WebSocket communication, long polling ve fallback mekanizmalarıyla güvenilir realtime AI deneyimi hedeflendi.',
        'Gmail integration testing ve multi-channel conversation senaryoları üzerinden AI product kalitesi güçlendirildi.'
      ],
      role: 'AI-integrated frontend development, realtime communication, product reliability',
      technologies: ['React', 'WebSocket', 'Long Polling', 'AI Agents', 'Prompt Engineering', 'Gmail Integration Testing'],
      year: '2026',
      href: 'https://www.linkedin.com/in/ahmetsaidkorucuk'
    },
    {
      id: 'medical-cms',
      name: 'Medical Website & CMS',
      description:
        'Genel cerrahi uzmanı için hasta güveni, erişilebilirlik, blog yönetimi ve özel admin paneli odağında geliştirilen full-stack ürün.',
      details: [
        'Next.js, Firebase ve NoSQL altyapısıyla public website, blog yönetimi ve admin deneyimi birlikte tasarlandı.',
        'SEO, performans, erişilebilirlik ve content management ihtiyaçları tek ürün akışında ele alındı.',
        'Solo ownership ile UI/UX, frontend, backend ve deployment süreçleri uçtan uca yönetildi.'
      ],
      role: 'Solo full-stack ownership, frontend, backend, deployment',
      technologies: ['Next.js', 'React', 'Node.js', 'Firebase', 'NoSQL', 'UI/UX Design'],
      year: '2026',
      href: 'https://ebubekir.korucuk.com'
    }
  ] satisfies Project[],
  socials: [
    { label: 'Email', href: 'mailto:contact@korucuk.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmetsaidkorucuk' },
    { label: 'GitHub', href: 'https://github.com/askorucuk' }
  ],
  colors: {
    background: '#03050c',
    surface: '#08111d',
    ink: '#f4f8ff',
    muted: '#96a5ba',
    cyan: '#4de8ff',
    blue: '#4e8dff',
    violet: '#9a6cff'
  }
} as const;
