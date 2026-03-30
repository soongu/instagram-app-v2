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
    - `H001`: 해시태그를 찾을 수 없습니다. (존재하지 않는 정규화된 태그명 등)
    - `H002`: 허용되지 않는 해시태그 형식입니다.
    - `H003`: 게시물에 붙일 수 있는 해시태그 개수를 초과했습니다.
    - `H004`: 해시태그 이름이 너무 깁니다.

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
- **Response Body** (`ApiResponse<SliceResponse<PostResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": true,
    "items": [
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
        "commentCount": 0,
        "hashtagNames": ["맛집", "카페"]
      }
    ]
  },
  "error": null
}
```
- `likeStatus.liked`: 로그인한 사용자가 해당 글에 좋아요했으면 `true` (피드 조회 시 QueryDSL `EXISTS(post_like)` 한 쿼리로 계산).
- `likeStatus.likeCount`: 게시물 비정규화 좋아요 수.
- `hashtagNames` (`string[]`): 해당 게시물 본문에서 추출·저장된 **정규화된** 해시태그 이름 목록(표시 순서는 서버 구현에 따름). 태그가 없으면 빈 배열 `[]`.

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
- **해시태그**: `feed.content` 안의 `#태그` 패턴은 저장 시 파싱되어 `Hashtag` / `PostHashtag` 로 동기화됩니다. 개수·길이 제한 위반 시 **400** (`H003`, `H004` 등).

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

### 2.4 피드 상세 조회
- **URL**: `/api/posts/{postId}`
- **Method**: `GET`
- **Description**: 게시물 본문/이미지 캐러셀/작성자 요약과, 선택적 네비게이션 식별자(`prevPostId`, `nextPostId`)를 반환합니다.
- **Authentication**: 선택 (비로그인도 호출 가능)
- **Query Parameters**:
    - `context`: 선택 파라미터 (예: `"profile"` 또는 `"feed"`)
        - `context="profile"` 일 때만 `prevPostId` / `nextPostId`가 채워집니다.
- **Path Parameters**:
    - `postId`: 대상 게시물 ID
- **Response Body** (`ApiResponse<PostDetailResponse>`):
```json
{
  "success": true,
  "data": {
    "postId": 123,
    "content": "게시물 내용",
    "writer": {
      "memberId": 2,
      "username": "mamel",
      "profileImageUrl": "https://example.com/profile/mamel.jpg"
    },
    "imageUrls": ["https://example.com/post/1.jpg"],
    "createdAt": "2026-03-25T17:00:00",
    "likeStatus": {
      "liked": false,
      "likeCount": 12
    },
    "prevPostId": null,
    "nextPostId": null,
    "hashtagNames": ["맛집", "카페"]
  },
  "error": null
}
```
- **필드 설명** (`PostDetailResponse`):
    - `writer`: 게시글 작성자 요약(`memberId`, `username`, `profileImageUrl`)
    - `imageUrls`: 게시물 이미지 URL 목록(캐러셀)
    - `createdAt`: 게시물 생성 시간
    - `likeStatus`: 로그인 유저 기준 좋아요 상태(`liked`, `likeCount`)
    - `prevPostId` / `nextPostId`: `context="profile"`일 때만 이전/다음 글 ID, 그 외에는 `null`
    - `hashtagNames` (`string[]`): 해당 게시물에 연결된 정규화된 해시태그 이름 목록. 없으면 `[]`.
- **에러 (예시)**:
    - **404** — `postId`에 해당 게시물이 없는 경우 (`P003`: 게시물을 찾을 수 없습니다.)

### 2.5 피드·프로필 그리드와 좋아요·해시태그 필드 (참고)
| API | 좋아요·해시태그 관련 필드 | 설명 |
|-----|--------------------------|------|
| `GET /api/posts` (피드) | `items[].likeStatus.liked` | 로그인 사용자가 그 글에 좋아요했는지 (QueryDSL EXISTS 1쿼리) |
| `GET /api/posts` (피드) | `items[].likeStatus.likeCount` | 게시물 비정규화 좋아요 수 |
| `GET /api/posts` (피드) | `items[].hashtagNames` | 해당 글에 붙은 정규화된 태그명 배열 |
| `GET /api/profiles/{username}/posts` (프로필) | `items[].likeCount` | 동일 비정규화 값 (`liked` 없음) |
| `GET /api/hashtags/{name}/posts` | — | 그리드용 `ProfilePostResponse`만 반환(썸네일·수치). 태그 목록은 피드/상세 `PostResponse`·`PostDetailResponse` 참고 |

---

## 3. Profile / Follow (`/profiles`, `/members`)

프론트 라우트가 `/:username` 이므로, 프로필 진입용 API는 `username` 기반 `/api/profiles/...` 를 우선 사용합니다.  
기존 `memberId` 기반 `/api/members/...` API는 호환 또는 내부용으로 유지할 수 있습니다.

### 3.1 프로필 헤더 조회
- **URL**: `/api/profiles/{username}`
- **Method**: `GET`
- **Description**: 특정 유저의 프로필 헤더에 필요한 기본 정보와, 로그인 유저 기준 팔로우 상태를 조회합니다. 프론트의 `/:username` 라우트와 바로 연결됩니다.
- **Authentication**: **필수** (`Authorization: Bearer <AccessToken>`)
- **Path Parameters**:
    - `username`: 조회 대상 회원의 username
- **Response Body** (`ApiResponse<MemberProfileResponse>`):
```json
{
  "success": true,
  "data": {
    "memberId": 2,
    "username": "mamel",
    "name": "마이멜로디",
    "profileImageUrl": "https://example.com/profile/mamel.jpg",
    "followerCount": 10,
    "followingCount": 20,
    "postCount": 30,
    "isFollowing": true,
    "isCurrentUser": false
  },
  "error": null
}
```
- **필드 설명**:
    - `followerCount`: 팔로워 수 (target을 follow 하는 사람 수)
    - `followingCount`: 팔로잉 수 (target이 follow 하는 사람 수)
    - `postCount`: 게시물 수 (target 작성 게시물 수)
    - `isFollowing`: 로그인 유저가 이 프로필 주인을 팔로우 중이면 `true`
    - `isCurrentUser`: 조회 대상이 로그인 유저 본인이면 `true`

- **호환용 기존 API**:
    - `GET /api/members/{memberId}`
    - 내부적으로 동일한 `MemberProfileResponse`를 반환합니다.

### 3.2 프로필 피드 조회
- **URL**: `/api/profiles/{username}/posts`
- **Method**: `GET`
- **Description**: 특정 유저의 프로필 그리드(게시물 목록)를 username 기준으로 조회합니다.
- **Authentication**: 선택 또는 프론트 정책에 따름
- **Query Parameters**:
    - `page`: 페이지 번호 (기본값: 1)
    - `size`: 페이지 크기 (기본값: 12)
- **Path Parameters**:
    - `username`: 조회 대상 회원의 username
- **Response Body** (`ApiResponse<SliceResponse<ProfilePostResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": false,
    "items": [
      {
        "id": 101,
        "thumbnailUrl": "https://picsum.photos/600/600?random=11",
        "multipleImages": true,
        "likeCount": 0,
        "commentCount": 0
      }
    ]
  },
  "error": null
}
```

- **호환용 기존 API**:
    - `GET /api/members/{memberId}/posts`
    - 내부적으로 동일한 `ProfilePostResponse` 목록을 반환합니다.

### 3.3 팔로우
- **URL**: `/api/members/{memberId}/follow`
- **Method**: `POST`
- **Description**: 로그인 유저가 대상 유저를 팔로우합니다.
- **Authentication**: **필수**
- **Path Parameters**:
    - `memberId`: 팔로우할 대상 회원 ID
- **Response Body** (`ApiResponse<FollowStatusResponse>`):
```json
{
  "success": true,
  "data": {
    "memberId": 2,
    "following": true,
    "followerCount": 11
  },
  "error": null
}
```
- **에러 (예시)**:
    - **400** — 자기 자신을 팔로우하려는 경우 (`F003`)
    - **400** — 이미 팔로우 중인 경우 (`F001`)
    - **404** — 대상 회원이 존재하지 않는 경우 (`M004`)

### 3.4 언팔로우
- **URL**: `/api/members/{memberId}/follow`
- **Method**: `DELETE`
- **Description**: 로그인 유저가 대상 유저를 언팔로우합니다.
- **Authentication**: **필수**
- **Path Parameters**:
    - `memberId`: 언팔로우할 대상 회원 ID
- **Response Body** (`ApiResponse<FollowStatusResponse>`):
```json
{
  "success": true,
  "data": {
    "memberId": 2,
    "following": false,
    "followerCount": 10
  },
  "error": null
}
```
- **에러 (예시)**:
    - **404** — 기존 팔로우 관계가 없는 경우 (`F002`)
    - **404** — 대상 회원이 존재하지 않는 경우 (`M004`)

### 3.5 팔로워 목록 조회
- **URL**: `/api/members/{memberId}/followers`
- **Method**: `GET`
- **Description**: 특정 유저를 팔로우하는 사람들의 목록을 조회합니다.
- **Authentication**: **필수**
- **Query Parameters**:
    - `page`: 페이지 번호 (기본값: 1)
    - `size`: 페이지 크기 (기본값: 20, 최대 50)
- **Path Parameters**:
    - `memberId`: 프로필 주인 회원 ID
- **Response Body** (`ApiResponse<SliceResponse<FollowMemberResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": false,
    "items": [
      {
        "memberId": 1,
        "username": "kuromi",
        "name": "쿠로미",
        "profileImageUrl": "https://example.com/profile/kuromi.jpg",
        "following": false,
        "me": true
      },
      {
        "memberId": 3,
        "username": "pikachu",
        "name": "피카츄",
        "profileImageUrl": "https://example.com/profile/pikachu.jpg",
        "following": true,
        "me": false
      }
    ]
  },
  "error": null
}
```
- **필드 설명** (`FollowMemberResponse`):
    - `following`: 로그인 유저 기준으로, 이 사람을 이미 팔로우 중이면 `true`
    - `me`: 리스트 항목의 회원이 로그인 유저 본인이면 `true`
- **정렬 기준**:
    - 가장 최근에 팔로우한 사람이 먼저 내려갑니다. (`Follow.createdAt DESC`)

### 3.6 팔로잉 목록 조회
- **URL**: `/api/members/{memberId}/followings`
- **Method**: `GET`
- **Description**: 특정 유저가 팔로우하고 있는 사람들의 목록을 조회합니다.
- **Authentication**: **필수**
- **Query Parameters**:
    - `page`: 페이지 번호 (기본값: 1)
    - `size`: 페이지 크기 (기본값: 20, 최대 50)
- **Path Parameters**:
    - `memberId`: 프로필 주인 회원 ID
- **Response Body** (`ApiResponse<SliceResponse<FollowMemberResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": false,
    "items": [
      {
        "memberId": 2,
        "username": "mamel",
        "name": "마이멜로디",
        "profileImageUrl": "https://example.com/profile/mamel.jpg",
        "following": true,
        "me": false
      },
      {
        "memberId": 5,
        "username": "heartping",
        "name": "하츄핑",
        "profileImageUrl": "https://example.com/profile/heartping.jpg",
        "following": false,
        "me": false
      }
    ]
  },
  "error": null
}
```
- **참고**:
    - `followers` 와 `followings` 는 URL은 비슷하지만 Follow 조회 방향이 반대입니다.
    - 두 API 모두 `SliceResponse.hasNext`를 실제 페이징 결과에 맞게 반환합니다.
    - 정렬 기준은 최신순이며, 가장 최근에 생성된 팔로우 관계가 맨 위에 옵니다. (`Follow.createdAt DESC`)

---
## 4. 댓글 (`/posts/.../comments`)

### 4.1 댓글 작성 (원댓글/대댓글)
- **URL**: `/api/posts/{postId}/comments`
- **Method**: `POST`
- **Description**: 댓글 또는 대댓글을 작성합니다. `parentId` 유무에 따라 원댓글/대댓글이 결정됩니다.
- **Authentication**: **필수**
- **Path Parameters**:
    - `postId`: 대상 게시물 ID
- **Request Body** (`CommentCreateRequest`):
```json
{
  "content": "댓글 내용",
  "parentId": null
}
```
- `parentId`: 원댓글이면 `null` 또는 생략, 대댓글이면 부모 원댓글 ID
- **Response Body** (`ApiResponse<CommentResponse>`), **HTTP 201**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "content": "댓글 내용",
    "member_id": 2,
    "username": "mamel",
    "profileImageUrl": "https://example.com/profile/mamel.jpg",
    "replyCount": 0,
    "createdAt": "2026-03-25T17:00:00"
  },
  "error": null
}
```
- **필드 설명** (`CommentResponse`):
    - `replyCount`: 원댓글 목록에서만 의미가 있고, 생성 직후 원댓글이면 `0`, 대댓글이면 `null`(응답에서 제외됨)
- **에러 (예시)**:
    - **404** — 게시물을 찾을 수 없음 (`P003`)
    - **404** — 댓글/원댓글 id가 존재하지 않는 경우 (`R001`: 댓글을 찾을 수 없습니다.)
    - **400** — 대댓글의 parent가 원댓글이 아닌 경우 (`R002`)
    - **400** — 요청 경로(postId)와 댓글의 게시글이 일치하지 않는 경우 (`R003`)

### 4.2 원댓글 목록 조회
- **URL**: `/api/posts/{postId}/comments`
- **Method**: `GET`
- **Description**: 원댓글 목록을 페이지 단위로 조회하며, 각 항목에 `replyCount`(대댓글 수)를 포함합니다.
- **Authentication**: **필수**
- **Query Parameters**:
    - `page`: 기본값 `1`
    - `size`: 기본값 `20`
- **Path Parameters**:
    - `postId`: 대상 게시물 ID
- **Response Body** (`ApiResponse<SliceResponse<CommentResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": false,
    "items": [
      {
        "id": 10,
        "content": "원댓글",
        "member_id": 2,
        "username": "mamel",
        "profileImageUrl": "https://example.com/profile/mamel.jpg",
        "replyCount": 3,
        "createdAt": "2026-03-25T17:00:00"
      }
    ]
  },
  "error": null
}
```
- **정렬 기준**:
    - `createdAt ASC, id ASC`

### 4.3 대댓글 목록 조회 (답글 더보기)
- **URL**: `/api/posts/{postId}/comments/{rootCommentId}/replies`
- **Method**: `GET`
- **Description**: 특정 원댓글의 대댓글 목록을 조회합니다.
- **Authentication**: **필수**
- **Query Parameters**:
    - `page`: 기본값 `1`
    - `size`: 기본값 `10`
- **Path Parameters**:
    - `postId`: 대상 게시물 ID
    - `rootCommentId`: 원댓글 ID
- **Response Body** (`ApiResponse<SliceResponse<CommentResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": false,
    "items": [
      {
        "id": 20,
        "content": "대댓글",
        "member_id": 5,
        "username": "user5",
        "profileImageUrl": "https://example.com/profile/user5.jpg",
        "createdAt": "2026-03-25T17:01:00"
      }
    ]
  },
  "error": null
}
```
- **필드 설명**:
    - `replyCount`: 대댓글 목록에서는 `null` → `NON_NULL` 정책으로 응답에서 제외될 수 있습니다.

---

## 5. Hashtag (`/hashtags`)

해시태그 전용 API의 베이스 경로는 `/api/hashtags` 입니다. (게시물 본문의 `#태그` 파싱·저장은 **게시물 작성** 흐름에서 처리되며, 피드·상세 응답의 `hashtagNames` 는 **2.1 피드 조회**, **2.4 피드 상세 조회** 절을 참고하세요.)

### 5.1 특정 해시태그가 붙은 게시물 목록 (그리드·무한 스크롤)
- **URL**: `/api/hashtags/{name}/posts`
- **Method**: `GET`
- **Description**: **정규화된** 해시태그 이름(`name`)이 붙은 게시물을 **프로필 그리드**와 동일한 `ProfilePostResponse` 슬라이스로 조회합니다. 정렬은 서버에서 **`id` 내림차순** 고정입니다.
- **Path Parameters**:
    - `name`: 조회할 해시태그 이름(서버 저장 형식과 동일하게, 예: 소문자 `맛집`)
- **Query Parameters**:
    - `page`: 페이지 번호 (기본값: `1`)
    - `size`: 페이지 크기 (기본값: `12`)
- **Authentication**: 인증 필수.
- **Response Body** (`ApiResponse<SliceResponse<ProfilePostResponse>>`):
```json
{
  "success": true,
  "data": {
    "hasNext": false,
    "items": [
      {
        "post_id": 101,
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "multipleImages": true,
        "likeCount": 5,
        "commentCount": 2
      }
    ]
  },
  "error": null
}
```
- **에러 (예시)**:
    - **404** — 해당 이름의 해시태그가 존재하지 않음 (`H001`: 해시태그를 찾을 수 없습니다.)

### 5.2 해시태그 추천 (Top N)
- **URL**: `/api/hashtags/suggestions`
- **Method**: `GET`
- **Description**: 작성 화면 등에서 쓸 **추천 해시태그** 목록을 반환합니다. `postCount` 내림차순 등 서비스 랭킹 규칙에 따릅니다.
- **Query Parameters**:
    - `prefix`: 선택. 이름 **접두사**로 필터(예: `맛` → `맛집` 계열만).
    - `limit`: 최대 개수 (기본값: `5`)
- **Authentication**: 필수
- **Response Body** (`ApiResponse<List<HashtagMetaResponse>>`):
```json
{
  "success": true,
  "data": [
    {
      "hashtagName": "맛집",
      "postCount": 120
    },
    {
      "hashtagName": "카페",
      "postCount": 88
    }
  ],
  "error": null
}
```
- **필드 설명** (`HashtagMetaResponse`):
    - `hashtagName` (`string`): 표시·검색에 쓰는 태그 이름(정규화된 값).
    - `postCount` (`long`): 해당 태그가 붙은 게시물 수.

