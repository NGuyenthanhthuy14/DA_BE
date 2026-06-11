# Specialty Story API

Tai lieu nay mo ta model va API cho cau chuyen cua dac san.

Moi `Specialty` chi co toi da mot `SpecialtyStory`. Rang buoc nay nam o field `specialty_id` voi `unique: true`.

## Model

Collection: `specialtystories`

Model: `SpecialtyStory`

| Field | Kieu | Bat buoc | Mo ta |
| --- | --- | --- | --- |
| `_id` | ObjectId | Co | ID cau chuyen |
| `specialty_id` | ObjectId ref `Specialty` | Co | Dac san so huu cau chuyen. Unique, moi dac san chi co mot story |
| `title` | string | Co | Tieu de cau chuyen |
| `slug` | string | Co | Slug cua cau chuyen. Unique |
| `summary` | string | Khong | Mo ta ngan |
| `content` | string | Co | Noi dung dai cua cau chuyen/bai viet |
| `cover_image_url` | string | Khong | Anh dai dien |
| `images` | array | Khong | Danh sach anh phu, moi item gom `url`, `caption` |
| `tags` | string[] | Khong | Tag phuc vu tim kiem/hien thi |
| `author_id` | ObjectId ref `User` | Khong | Admin tao story |
| `status` | `draft`/`published`/`archived` | Khong | Trang thai bai viet. Mac dinh `draft` |
| `published_at` | Date | Khong | Thoi diem publish |
| `seo_title` | string | Khong | Tieu de SEO |
| `seo_description` | string | Khong | Mo ta SEO |
| `view_count` | number | Khong | Luot xem, mac dinh 0 |
| `created_at` | Date | Co | Ngay tao |
| `updated_at` | Date | Co | Ngay cap nhat |

## Response envelope

Tat ca API thanh cong tra:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Success message",
  "metadata": {}
}
```

API loi tra:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Error message",
  "metadata": null
}
```

## Admin APIs

Base URL: `/api/admin/specialty-stories`

Tat ca API admin can token admin.

Header:

```http
Authorization: Bearer <admin_access_token>
```

### GET `/`

Lay danh sach cau chuyen dac san.

Query:

| Query | Kieu | Bat buoc | Mo ta |
| --- | --- | --- | --- |
| `status` | `draft`/`published`/`archived` | Khong | Loc theo trang thai |
| `specialty_id` | ObjectId | Khong | Loc theo dac san |

Example:

```http
GET /api/admin/specialty-stories?status=published
```

Response:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lay danh sach cau chuyen dac san thanh cong",
  "metadata": [
    {
      "_id": "665f...",
      "specialty_id": {
        "_id": "665e...",
        "name": "Banh pia Soc Trang",
        "slug": "banh-pia-soc-trang",
        "image_url": "https://example.com/specialty.jpg",
        "status": "active",
        "approval_status": "approved"
      },
      "title": "Cau chuyen ve banh pia Soc Trang",
      "slug": "cau-chuyen-ve-banh-pia-soc-trang",
      "summary": "Nguon goc va net dac trung cua banh pia.",
      "content": "Noi dung bai viet dai...",
      "cover_image_url": "https://example.com/cover.jpg",
      "images": [],
      "tags": ["dac-san", "soc-trang"],
      "status": "published",
      "published_at": "2026-06-11T00:00:00.000Z",
      "created_at": "2026-06-11T00:00:00.000Z",
      "updated_at": "2026-06-11T00:00:00.000Z"
    }
  ]
}
```

### GET `/:id`

Lay chi tiet cau chuyen theo ID.

```http
GET /api/admin/specialty-stories/665f...
```

### POST `/`

Tao cau chuyen cho mot dac san.

Luu y: neu dac san da co story, API tra `400`.

Body:

```json
{
  "specialty_id": "665e...",
  "title": "Cau chuyen ve banh pia Soc Trang",
  "summary": "Nguon goc va net dac trung cua banh pia.",
  "content": "Noi dung bai viet dai...",
  "cover_image_url": "https://example.com/cover.jpg",
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "caption": "Lang nghe lam banh pia"
    }
  ],
  "tags": ["dac-san", "soc-trang"],
  "status": "draft",
  "seo_title": "Banh pia Soc Trang",
  "seo_description": "Cau chuyen ve dac san banh pia Soc Trang"
}
```

Field toi thieu:

```json
{
  "specialty_id": "665e...",
  "title": "Cau chuyen ve banh pia Soc Trang",
  "content": "Noi dung bai viet dai..."
}
```

Response `201`:

```json
{
  "statusCode": 201,
  "error": null,
  "message": "Tao cau chuyen dac san thanh cong",
  "metadata": {
    "_id": "665f...",
    "specialty_id": "665e...",
    "title": "Cau chuyen ve banh pia Soc Trang",
    "slug": "cau-chuyen-ve-banh-pia-soc-trang",
    "summary": "Nguon goc va net dac trung cua banh pia.",
    "content": "Noi dung bai viet dai...",
    "status": "draft",
    "published_at": null
  }
}
```

### PUT `/:id`

Cap nhat cau chuyen.

```http
PUT /api/admin/specialty-stories/665f...
```

Body co the gui mot phan field:

```json
{
  "title": "Cau chuyen dac san banh pia",
  "summary": "Ban cap nhat",
  "content": "Noi dung moi...",
  "status": "published"
}
```

Ghi chu:

- Neu doi `title` ma khong gui `slug`, API tu tao lai slug moi.
- Neu gui `status = published`, API tu set `published_at`.
- Neu gui `status = draft` hoac `archived`, API reset `published_at = null`.
- Neu doi `specialty_id`, dac san moi cung phai chua co story.

### PATCH `/:id/publish`

Xuat ban cau chuyen.

```http
PATCH /api/admin/specialty-stories/665f.../publish
```

Response:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Xuat ban cau chuyen dac san thanh cong",
  "metadata": {
    "_id": "665f...",
    "status": "published",
    "published_at": "2026-06-11T00:00:00.000Z"
  }
}
```

### PATCH `/:id/archive`

Luu tru cau chuyen.

```http
PATCH /api/admin/specialty-stories/665f.../archive
```

### DELETE `/:id`

Xoa cau chuyen.

```http
DELETE /api/admin/specialty-stories/665f...
```

Response:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Xoa cau chuyen dac san thanh cong",
  "metadata": null
}
```

## Public APIs

Public API khong can token.

### GET `/api/specialty-stories/nearby`

Lay danh sach story published cua cac dac san xung quanh user.

FE phai gui toa do that cua user lay tu trinh duyet. Backend khong co toa do mac dinh.

Query:

| Query | Kieu | Bat buoc | Mo ta |
| --- | --- | --- | --- |
| `lat` | number | Co | Latitude cua user |
| `lng` | number | Co | Longitude cua user |
| `maxKm` | number | Khong | Ban kinh tim kiem, mac dinh 20km |
| `limit` | number | Khong | So story toi da, mac dinh 20 |

Example:

```http
GET /api/specialty-stories/nearby?lat=10.7769&lng=106.7009&maxKm=20&limit=10
```

Response:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Get nearby specialty stories successfully",
  "metadata": {
    "stories": [
      {
        "_id": "665f...",
        "specialty_id": "665e...",
        "title": "Cau chuyen ve banh pia Soc Trang",
        "slug": "cau-chuyen-ve-banh-pia-soc-trang",
        "summary": "Nguon goc va net dac trung cua banh pia.",
        "content": "Noi dung bai viet dai...",
        "cover_image_url": "https://example.com/cover.jpg",
        "images": [],
        "tags": ["dac-san", "soc-trang"],
        "status": "published",
        "published_at": "2026-06-11T00:00:00.000Z",
        "distanceKm": 3.25,
        "specialty": {
          "_id": "665e...",
          "name": "Banh pia Soc Trang",
          "slug": "banh-pia-soc-trang",
          "description": "Mo ta dac san",
          "image_url": "https://example.com/specialty.jpg",
          "status": "active",
          "approval_status": "approved"
        },
        "shop": {
          "_id": "665d...",
          "name": "Shop dac san A",
          "slug": "shop-dac-san-a",
          "address": "Dia chi shop",
          "formatted_address": "Dia chi hien thi",
          "cover_image": "https://example.com/shop.jpg",
          "latitude": 10.78,
          "longitude": 106.7
        }
      }
    ],
    "total": 1,
    "radiusKm": 20
  }
}
```

Dieu kien story duoc tra ve:

- Shop cua dac san co `status = active` va nam trong ban kinh `maxKm`.
- Dac san co `status = active`.
- Dac san co `approval_status = approved`.
- Story co `status = published`.

### GET `/api/specialties/:slug/story`

Lay cau chuyen published theo slug cua dac san.

Chi tra story khi dac san co:

- `status = active`
- `approval_status = approved`

Example:

```http
GET /api/specialties/banh-pia-soc-trang/story
```

Response:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Get specialty story successfully",
  "metadata": {
    "_id": "665f...",
    "specialty_id": "665e...",
    "title": "Cau chuyen ve banh pia Soc Trang",
    "slug": "cau-chuyen-ve-banh-pia-soc-trang",
    "summary": "Nguon goc va net dac trung cua banh pia.",
    "content": "Noi dung bai viet dai...",
    "cover_image_url": "https://example.com/cover.jpg",
    "images": [],
    "tags": ["dac-san", "soc-trang"],
    "status": "published",
    "published_at": "2026-06-11T00:00:00.000Z",
    "specialty": {
      "_id": "665e...",
      "name": "Banh pia Soc Trang",
      "slug": "banh-pia-soc-trang",
      "status": "active",
      "approval_status": "approved"
    }
  }
}
```

### GET `/api/specialty-stories/:slug`

Lay cau chuyen published theo slug cua story.

Endpoint nay phu hop cho trang bai viet rieng.

Example:

```http
GET /api/specialty-stories/cau-chuyen-ve-banh-pia-soc-trang
```

Response `metadata.specialty_id` duoc populate thong tin dac san:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Get specialty story successfully",
  "metadata": {
    "_id": "665f...",
    "specialty_id": {
      "_id": "665e...",
      "name": "Banh pia Soc Trang",
      "slug": "banh-pia-soc-trang",
      "image_url": "https://example.com/specialty.jpg",
      "status": "active",
      "approval_status": "approved"
    },
    "title": "Cau chuyen ve banh pia Soc Trang",
    "slug": "cau-chuyen-ve-banh-pia-soc-trang",
    "summary": "Nguon goc va net dac trung cua banh pia.",
    "content": "Noi dung bai viet dai...",
    "status": "published"
  }
}
```

## Error cases

ID story khong hop le:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "ID cau chuyen khong hop le",
  "metadata": null
}
```

ID dac san khong hop le:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "ID dac san khong hop le",
  "metadata": null
}
```

Dac san khong ton tai:

```json
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "Khong tim thay dac san",
  "metadata": null
}
```

Dac san da co cau chuyen:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Dac san nay da co cau chuyen",
  "metadata": null
}
```

Thieu title:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Tieu de cau chuyen la bat buoc",
  "metadata": null
}
```

Thieu content:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Noi dung cau chuyen la bat buoc",
  "metadata": null
}
```

Public story khong ton tai hoac chua published:

```json
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "Specialty story not found",
  "metadata": null
}
```

Thieu toa do khi goi nearby:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "lat and lng are required",
  "metadata": null
}
```

Toa do khong hop le:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "latitude, longitude khong hop le",
  "metadata": null
}
```

## Ghi chu tich hop FE

- Man story gan user nen goi `GET /api/specialty-stories/nearby?lat=<browser_lat>&lng=<browser_lng>`.
- Man chi tiet dac san nen goi `GET /api/specialties/:slug/story`.
- Trang bai viet/tin tuc rieng nen goi `GET /api/specialty-stories/:slug`.
- Admin chi tao mot story cho moi dac san. Khi API tra `Dac san nay da co cau chuyen`, FE nen chuyen sang flow cap nhat story hien co.
- Story chi hien thi public khi `status = published`.
- Xoa dac san se xoa story lien quan theo logic backend hien tai.
