# Instagram Clone API Documentation

Base URL: `/api`

## 0. 공통 응답 및 에러 형식 (Common Response & Error Format)

### 0.1 공통 응답 (Common Response)
모든 API 응답은 `ApiResponse<T>` 형식을 따릅니다.

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### 0.2 공통 에러 응답 (Common Error Format)
인증 실패나 비즈니스 예외 발생 시 전역적으로 일관된 에러 형식을 반환합니다.

- **Response Body**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "timestamp": "2024-03-06T11:15:30.123",
    "status": 401,
    "error": "UNAUTHORIZED",
    "code": "M008",
    "message": "만료된 토큰입니다.",
    "path": "/api/posts"
  }
}
```

- **핵심 에러 코드 (Core Error Codes)**:
    - `M001`: 이미 존재하는 이메일입니다.
    - `M002`: 이미 존재하는 사용자 이름입니다.
    - `M004`: 회원을 찾을 수 없습니다.
    - `M005`: 아이디 또는 비밀번호가 일치하지 않습니다.
    - `M006`: 로그인이 필요한 서비스입니다. (인증 정보 없음)
    - `M007`: 유요하지 않은 토큰입니다. (서명 위조 등)
    - `M008`: 만료된 토큰입니다. (Access Token 만료)

---

## 1. Authentication (`/auth`)

모든 인증 API의 베이스 경로는 `/api/auth` 입니다.

### 1.1 회원가입
- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Description**: 새로운 사용자를 등록합니다.
- **Request Body** (`SignUpRequest`):
```json
{
  "emailOrPhone": "user@example.com",
  "name": "홍길동",
  "username": "hong_gildong",
  "password": "Password123!"
}
```
- **Response Body** (`ApiResponse<SignUpResponse>`):
```json
{
  "success": true,
  "data": {
    "message": "회원가입이 완료되었습니다.",
    "username": "hong_gildong"
  },
  "error": null
}
```

### 1.2 중복 확인
- **URL**: `/api/auth/check-duplicate`
- **Method**: `GET`
- **Description**: 사용자 이름이나 이메일/전화번호의 중복 여부를 확인합니다.
- **Query Parameters**:
    - `type`: 검사할 타입 (email, username, phone)
    - `value`: 검사할 값
- **Response Body** (`ApiResponse<DuplicateCheckResponse>`):
```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "사용 가능한 username입니다."
  },
  "error": null
}
```

### 1.3 로그인
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: 사용자를 인증하고 Access Token을 반환하며, Refresh Token을 쿠키로 발급합니다.
- **Request Body** (`LoginRequest`):
```json
{
  "username": "hong_gildong",
  "password": "Password123!"
}
```
- **Response Body** (`ApiResponse<LoginResponse>`):
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5c..."
    },
    "user": {
      "id": 1,
      "username": "hong_gildong",
      "name": "홍길동",
      "profileImageUrl": "http://example.com/profile.jpg"
    }
  },
  "error": null
}
```
- **Set-Cookie**: `refresh_token=...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=...`

### 1.4 토큰 재발급 (Reissue)
- **URL**: `/api/auth/reissue`
- **Method**: `POST`
- **Description**: 쿠키의 Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 발급합니다. (RTR)
- **Request**:
    - **Cookies**: `refresh_token=...`
- **Response Body** (`ApiResponse<AuthTokens>`):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5c..."
  },
  "error": null
}
```
- **Set-Cookie**: 새로운 `refresh_token` 쿠키가 재발행됩니다.

### 1.5 로그아웃
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Description**: 서버에서 Refresh Token을 무효화하고 클라이언트 쿠키를 삭제합니다.
- **Request**:
    - **Cookies**: `refresh_token=...`
- **Response Body** (`ApiResponse<String>`):
```json
{
  "success": true,
  "data": "로그아웃 성공",
  "error": null
}
```

---

## 2. Post (`/posts`)

모든 게시물 관련 API의 베이스 경로는 `/api/posts` 입니다.

### 2.1 피드 조회 (전체)
- **URL**: `/api/posts`
- **Method**: `GET`
- **Description**: 최신 게시물 피드를 조회합니다. (페이징 지원)
- **Query Parameters**:
    - `page`: 페이지 번호 (기본값: 1)
    - `size`: 페이지 크기 (기본값: 5)
- **Authentication**: 선택 사항 (로그인 시 `@LoginUser` 정보 활용 가능)
- **Response Body** (`ApiResponse<FeedResponse<PostResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": true,
    "feedList": [
      {
        "feed_id": 1,
        "content": "게시물 내용",
        "username": "writer_username",
        "profileImageUrl": "http://example.com/profile.jpg",
        "images": [
            { 
              "image_id": 100, 
              "imageUrl": "...", 
              "imageOrder": 1 
            }
        ],
        "createdAt": "2024-03-01T12:00:00",
        "likeStatus": {
            "liked": false,
            "likeCount": 0
        },
        "commentCount": 0
      }
    ]
  },
  "error": null
}
```

### 2.2 게시물 생성
- **URL**: `/api/posts`
- **Method**: `POST`
- **Description**: 새로운 게시물을 작성합니다. (이미지 포함 가능)
- **Authentication**: **필수** (`Authorization: Bearer <AccessToken>`)
- **Content-Type**: `multipart/form-data`
- **Request Parts**:
    - `feed` (`application/json`): `{"content": "..."}`
    - `images` (`MultipartFile[]`): 이미지 파일 리스트 (Optional)
- **Response Body** (`ApiResponse<PostCreateResponse>`):
```json
{
  "success": true,
  "data": {
    "postId": 1
  },
  "error": null
}
```

---

> [!NOTE]
> 댓글(Comment), 좋아요(Like), 프로필(Profile), 팔로우(Follow) 관련 기능은 현재 개발 진행 중이며, 컨트롤러 구현이 완료되는 대로 본 문서에 추가될 예정입니다.
