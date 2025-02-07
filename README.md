

## migration process


1. **프로젝트 초기 설정**
```bash
npm create vite@latest instagram-clone -- --template react
cd instagram-clone
npm install @reduxjs/toolkit react-router-dom sass axios react-icons
```

2. **폴더 구조 설계**
```
src/
  ├── assets/         # 이미지, 아이콘 등 정적 파일
  ├── components/     # 재사용 가능한 컴포넌트
  │   ├── common/    # 공통 컴포넌트 (Modal, Button 등)
  │   ├── feed/      # 피드 관련 컴포넌트
  │   ├── story/     # 스토리 관련 컴포넌트
  │   └── profile/   # 프로필 관련 컴포넌트
  ├── features/      # Redux 슬라이스
  ├── hooks/         # 커스텀 훅
  ├── layouts/       # 레이아웃 컴포넌트
  ├── pages/         # 페이지 컴포넌트
  ├── services/      # API 통신 관련
  ├── styles/        # SCSS 모듈 및 공통 스타일
  └── utils/         # 유틸리티 함수
```

3. **주요 마이그레이션 단계**

A. **공통 컴포넌트 마이그레이션**
- Modal (CreatePost, FeedDetail, Search 등)
- Sidebar
- Loading Spinner
- Carousel

B. **주요 기능별 마이그레이션**
1. **인증 관련**
    - 로그인/회원가입 페이지
    - 인증 상태 관리 (Redux)
    - 인증 관련 커스텀 훅

2. **피드 관련**
    - 피드 리스트 및 무한 스크롤
    - 좋아요/댓글 기능
    - 이미지 캐러셀

3. **프로필 관련**
    - 프로필 페이지
    - 팔로우/팔로잉 기능
    - 프로필 수정

4. **검색 및 해시태그**
    - 검색 기능
    - 해시태그 검색
    - 자동완성

5. **주요 고려사항**

- **상태관리**:
    - 전역 상태는 Redux Toolkit으로 관리
    - 지역 상태는 useState, useReducer 활용

- **성능 최적화**:
    - React.memo, useMemo, useCallback 적절히 활용
    - 이미지 최적화
    - 코드 스플리팅

- **재사용성**:
    - 공통 컴포넌트는 Props와 타입을 명확히 정의
    - 커스텀 훅으로 로직 분리

6**마이그레이션 우선순위**

1. 기본 레이아웃 및 라우팅 설정
2. 인증 시스템 구현
3. 피드 기능 구현
4. 프로필 기능 구현
5. 검색 기능 구현
6. 부가 기능 구현

