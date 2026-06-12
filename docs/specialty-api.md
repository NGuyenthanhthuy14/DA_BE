# Specialty API

Tai lieu nay mo ta luong tao, duyet va su dung dac san.

Specialty duoc su dung nhu mot category dung chung:

- Admin tao specialty: specialty duoc `approved` va `active` ngay.
- Vendor tao specialty: specialty co trang thai `pending` va `inactive`, can admin duyet.
- Sau khi specialty duoc `approved` va `active`, moi shop deu co the su dung specialty do de tao hoac cap nhat san pham.
- `shop_id` tren specialty ghi nhan shop da de xuat specialty. Field nay chi dung de vendor quan ly specialty cua minh khi dang cho duyet, khong gioi han shop duoc su dung specialty sau khi duyet.
- Vendor chi co the sua hoac xoa specialty do shop minh tao khi specialty van dang `pending`.

## Specialty Model

| Field | Kieu | Mo ta |
| --- | --- | --- |
| `_id` | ObjectId | ID specialty |
| `name` | string | Ten dac san |
| `slug` | string | Slug duy nhat |
| `description` | string | Mo ta |
| `image_url` | string | Anh dac san |
| `created_by` | ObjectId | User tao specialty |
| `created_by_role` | `vendor`/`admin` | Vai tro cua user tao |
| `shop_id` | ObjectId/null | Shop de xuat specialty neu duoc tao boi vendor |
| `approval_status` | `pending`/`approved`/`rejected` | Trang thai duyet |
| `status` | `active`/`inactive` | Trang thai hoat dong |
| `rejected_reason` | string | Ly do admin tu choi |
| `reviewed_by` | ObjectId/null | Admin duyet hoac tu choi |
| `reviewed_at` | date/null | Thoi diem duyet hoac tu choi |

## Vendor API

Base URL: `/api/vendor/specialties`

Tat ca Vendor API can token cua vendor da duoc duyet.

```http
Authorization: Bearer <vendor_access_token>
```

### GET `/`

Lay danh sach specialty dung chung ma vendor co the chon khi tao hoac cap nhat san pham.

API chi tra specialty co:

- `approval_status = approved`
- `status = active`

Danh sach khong bi gioi han theo `shop_id`. Vi vay specialty do admin hoac vendor khac tao deu duoc tra ve sau khi da duoc duyet.

```http
GET /api/vendor/specialties
```

Response:

```json
{
  "err": 0,
  "mess": "Lay danh sach dac san da duyet thanh cong",
  "data": [
    {
      "_id": "665e...",
      "name": "Banh pia Soc Trang",
      "slug": "banh-pia-soc-trang",
      "approval_status": "approved",
      "status": "active"
    }
  ]
}
```

### GET `/mine`

Lay cac specialty do shop cua vendor hien tai tao. Dung cho man hinh quan ly cac de xuat specialty cua vendor.

Query:

| Query | Gia tri | Bat buoc | Mo ta |
| --- | --- | --- | --- |
| `approval_status` | `pending`/`approved`/`rejected` | Khong | Loc theo trang thai duyet |
| `status` | `active`/`inactive` | Khong | Loc theo trang thai hoat dong |

```http
GET /api/vendor/specialties/mine?approval_status=rejected
```

### GET `/pending`

Lay cac specialty do shop cua vendor hien tai tao va dang cho admin duyet.

```http
GET /api/vendor/specialties/pending
```

### POST `/`

Vendor de xuat specialty moi.

Request:

```json
{
  "name": "Banh pia Soc Trang",
  "slug": "banh-pia-soc-trang",
  "description": "Dac san Soc Trang",
  "image_url": "https://example.com/banh-pia.jpg"
}
```

Specialty duoc tao voi:

```json
{
  "created_by_role": "vendor",
  "approval_status": "pending",
  "status": "inactive"
}
```

### PUT `/:id`

Cap nhat specialty do shop cua vendor tao.

Chi cho phep cap nhat specialty dang `pending`. Request co the gom mot hoac nhieu field:

```json
{
  "name": "Banh pia dau xanh",
  "description": "Mo ta moi",
  "image_url": "https://example.com/new-image.jpg"
}
```

### DELETE `/:id`

Xoa specialty do shop cua vendor tao.

Chi cho phep xoa specialty dang `pending`.

## Admin API

Base URL: `/api/admin/specialties`

Tat ca Admin API can token admin.

```http
Authorization: Bearer <admin_access_token>
```

### GET `/`

Lay tat ca specialty. Ho tro query `approval_status` va `status`.

```http
GET /api/admin/specialties?approval_status=pending
```

### GET `/:slug`

Lay chi tiet specialty theo slug, bao gom cac san pham dang gan specialty.

### POST `/`

Admin tao specialty moi. Specialty duoc `approved` va `active` ngay.

### PUT `/:id`

Admin cap nhat specialty.

### PATCH `/:id/approve`

Duyet specialty. Sau khi duyet:

```json
{
  "approval_status": "approved",
  "status": "active",
  "rejected_reason": ""
}
```

Tu thoi diem nay, tat ca shop co the su dung specialty de tao hoac cap nhat san pham.

### PATCH `/:id/reject`

Tu choi specialty.

Request:

```json
{
  "rejected_reason": "Thong tin dac san chua day du"
}
```

Specialty bi tu choi co `approval_status = rejected` va `status = inactive`.

### DELETE `/:id`

Xoa specialty. Khong the xoa specialty neu dang co san pham lien ket.

## Public API

Base URL: `/api/specialties`

### GET `/`

Lay tat ca specialty co `approval_status = approved` va `status = active`.

### GET `/:slug`

Lay chi tiet specialty approved/active theo slug, bao gom san pham cua tat ca shop dang su dung specialty.

### GET `/nearby`

Lay specialty gan toa do user.

```http
GET /api/specialties/nearby?lat=10.7769&lng=106.7009&maxKm=20&limit=20
```

### GET `/:slug/story`

Lay story published cua specialty approved/active.

## Gan Specialty Vao San Pham

Vendor gui `specialty_id` khi tao hoac cap nhat san pham:

```json
{
  "name": "Banh pia dau xanh",
  "specialty_id": "665e...",
  "image_url": "https://example.com/product.jpg",
  "price": 120000,
  "rating": 5,
  "description": "Banh pia cua shop"
}
```

Backend chi chap nhan specialty co:

- `approval_status = approved`
- `status = active`

Backend khong kiem tra `specialty.shop_id` co trung voi shop tao san pham hay khong. Do do moi shop deu co the su dung specialty da duoc duyet.

## Luong Tich Hop De Xuat

1. Man tao/cap nhat san pham goi `GET /api/vendor/specialties` de hien danh sach specialty dung chung.
2. Neu chua co specialty phu hop, vendor goi `POST /api/vendor/specialties` de gui de xuat.
3. Vendor theo doi de xuat tai `GET /api/vendor/specialties/mine` hoac `/pending`.
4. Admin xem danh sach pending va goi `PATCH /api/admin/specialties/:id/approve` hoac `/reject`.
5. Sau khi admin duyet, specialty xuat hien trong `GET /api/vendor/specialties` cua tat ca vendor.

## Error Thuong Gap

Vendor chua co shop:

```json
{
  "err": 1,
  "mess": "Vendor chua co shop"
}
```

Vendor sua hoac xoa specialty khong con pending:

```json
{
  "err": 1,
  "mess": "Chi co the sua hoac xoa dac san dang cho duyet"
}
```

San pham dung specialty khong hop le hoac chua duoc duyet:

```json
{
  "err": 1,
  "mess": "dac san khong ton tai hoac chua duoc duyet"
}
```
