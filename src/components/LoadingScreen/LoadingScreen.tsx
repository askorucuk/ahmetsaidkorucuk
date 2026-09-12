export function LoadingScreen() {
  return (
    <div className="loadingScreen" role="status" aria-live="polite">
      <svg className="loadingRing" viewBox="0 0 160 160" role="img" aria-label="Site yükleniyor">
        <defs>
          <filter id="loading-water-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
          <linearGradient id="loading-water-gradient" x1="24" x2="136" y1="32" y2="128">
            <stop offset="0" stopColor="#e8ffff" />
            <stop offset="0.45" stopColor="#63edff" />
            <stop offset="1" stopColor="#3e8fff" />
          </linearGradient>
        </defs>
        <circle className="loadingRingGhost" cx="80" cy="80" r="55" />
        <g className="loadingRingOrbit">
          <g filter="url(#loading-water-blur)" opacity="0.45">
            <path
              className="loadingRingArc loadingRingArcLeft"
              pathLength="1"
              d="M53 124C27 105 24 73 39 50c12-19 29-24 45-20"
            />
            <path
              className="loadingRingArc loadingRingArcRight"
              pathLength="1"
              d="M102 35c25 11 34 38 25 63-6 18-20 30-39 37"
            />
          </g>
          <path
            className="loadingRingArc loadingRingArcLeft"
            pathLength="1"
            d="M53 124C27 105 24 73 39 50c12-19 29-24 45-20"
          />
          <path
            className="loadingRingArc loadingRingArcLeft loadingRingThread"
            pathLength="1"
            d="M42 110c-8-19-4-36 9-50 7-8 14-13 25-18"
          />
          <path
            className="loadingRingArc loadingRingArcRight"
            pathLength="1"
            d="M102 35c25 11 34 38 25 63-6 18-20 30-39 37"
          />
          <path
            className="loadingRingArc loadingRingArcRight loadingRingThread"
            pathLength="1"
            d="M112 45c15 16 17 39 7 58-5 11-15 18-29 25"
          />
          <ellipse className="loadingRingDrop loadingRingDropA" cx="56" cy="119" rx="8" ry="4" />
          <ellipse className="loadingRingDrop loadingRingDropB" cx="40" cy="68" rx="5" ry="10" />
          <ellipse className="loadingRingDrop loadingRingDropC" cx="123" cy="85" rx="5" ry="14" />
          <circle className="loadingRingDrop loadingRingDotA" cx="74" cy="132" r="2.4" />
          <circle className="loadingRingDrop loadingRingDotB" cx="86" cy="133" r="1.9" />
        </g>
      </svg>
      <span className="srOnly">Site yükleniyor</span>
    </div>
  );
}
