# ExamBoost - 시험공부 최적화 시뮬레이터

시험 D-Day 기반 최적 학습 계획 시뮬레이터입니다.

## 기능

- 시험 정보 입력 (시험명, D-Day, 하루 공부 시간)
- 과목별 상세 정보 관리 (학습량, 우선순위, 학습 속도)
- 다양한 학습 전략 시뮬레이션
  - 균등 분배 전략
  - 우선순위 기반 분배
  - 목표 회독수 달성 우선
- 시각적 결과 차트
- 로컬 스토리지를 통한 데이터 저장

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI
- React Hooks

## 시작하기

### 설치

\`\`\`bash
npm install
\`\`\`

### 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

\`\`\`bash
npm run build
\`\`\`

### 프로덕션 실행

\`\`\`bash
npm start
\`\`\`

## 폴더 구조

\`\`\`
examboost/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── subjects/
│   │   │   └── page.tsx
│   │   └── simulation/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-picker.tsx
│   │   │   └── popover.tsx
│   │   ├── specific/
│   │   │   ├── subject-card.tsx
│   │   │   └── simulation-result-chart.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   └── use-local-storage.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── simulation-engine.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       ├── subject.ts
│       └── simulation.ts
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── README.md
\`\`\`

## 알고리즘

### 시뮬레이션 엔진

1. **균등 분배 전략**: 모든 과목에 동일한 시간 할당
2. **우선순위 기반 분배**: 과목 우선순위에 따른 가중치 적용
3. **목표 회독수 달성**: 그리디 알고리즘을 사용한 최적화

### 핵심 계산

- D-Day 계산
- 총 가용 학습 시간 계산
- 과목별 1회독 소요 시간 계산
- 전략별 회독수 시뮬레이션

## 라이센스

MIT License
