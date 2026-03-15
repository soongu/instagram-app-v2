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
    - `P003`: 게시물을 찾을 수 없습니다. (존재하지 않는 `postId` 등)

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
- **Authentication**: **필수** (로그인 회원 기준 `likeStatus.liked`: 해당 글에 좋아요 눌렀으면 `true`)
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
- `likeStatus.liked`: 로그인한 사용자가 해당 글에 좋아요했으면 `true` (피드 조회 시 QueryDSL `EXISTS(post_like)` 한 쿼리로 계산).
- `likeStatus.likeCount`: 게시물 비정규화 좋아요 수.

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

### 2.3 좋아요 토글 (Toggle Like)
- **URL**: `/api/posts/{postId}/likes`
- **Method**: `POST`
- **Description**: 로그인한 사용자 기준으로 해당 게시물에 **좋아요를 추가하거나 취소**합니다.  
  - 이미 좋아요한 상태에서 호출하면 → 좋아요 **취소**  
  - 아직 안 누른 상태에서 호출하면 → 좋아요 **추가**  
  한 번의 요청으로 on/off 가 전환되는 **토글** 동작입니다.
- **Authentication**: **필수** (`Authorization: Bearer <AccessToken>`)
- **Path Parameters**:
    - `postId`: 대상 게시물 ID
- **Request Body**: 없음
- **Response Body** (`ApiResponse<LikeStatusResponse>`), **HTTP 200**:
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 12
  },
  "error": null
}
```
- **필드 설명** (`LikeStatusResponse`):
    - `liked` (`boolean`): **이 요청 직후** 상태. `true` = 지금 좋아요 눌린 상태, `false` = 취소된 상태.
    - `likeCount` (`long`): 같은 요청 직후 해당 게시물의 **좋아요 수**. `Post.likeCount` 비정규화 값(토글 시 +1 / -1 반영).

- **에러 (예시)**:
    - **404** — `postId`에 해당 게시물이 없음 (`code`: `P003`, `message`: 게시물을 찾을 수 없습니다.)
    - **401** — 미로그인 또는 토큰 무효 (`M006` ~ `M008` 등)

- **클라이언트 가이드**:
    - 토글 성공 후 UI는 응답의 `liked`로 하트 채움 여부, `likeCount`로 숫자를 바로 갱신할 수 있습니다.
    - 피드 목록(`GET /api/posts`)의 `likeStatus`와 동일한 의미이며, 토글 후 피드를 다시 불러오면 목록과도 일치합니다.

### 2.4 피드·프로필 그리드와 좋아요 필드 (참고)
| API | 좋아요 관련 필드 | 설명 |
|-----|------------------|------|
| `GET /api/posts` (피드) | `feedList[].likeStatus.liked` | 로그인 사용자가 그 글에 좋아요했는지 (QueryDSL EXISTS 1쿼리) |
| `GET /api/posts` (피드) | `feedList[].likeStatus.likeCount` | 게시물 비정규화 좋아요 수 |
| `GET /api/members/{memberId}/posts` (프로필) | `feedList[].likeCount` | 동일 비정규화 값 (`liked` 없음) |

---

> [!NOTE]
> 댓글(Comment), 프로필(Profile), 팔로우(Follow) 등 나머지 API는 구현·문서 보강 예정입니다. **좋아요 토글·피드 `likeStatus`는 반영됨.**
