# Vendor Statistics API

Base URL: `/api/vendor/statistics`

Tat ca API trong file nay can token vendor da duoc duyet.

Header:

```http
Authorization: Bearer <vendor_access_token>
```

## Query chung

| Query | Kieu | Bat buoc | Mo ta |
| --- | --- | --- | --- |
| `startDate` | string | Khong | Loc tu ngay, vi du `2026-06-01` hoac ISO date |
| `endDate` | string | Khong | Loc den ngay, vi du `2026-06-30` hoac ISO date |
| `groupBy` | `day`/`month` | Khong | Chi dung cho revenue/dashboard. Mac dinh `day` |
| `limit` | number | Khong | Dung cho `top-products`, `recent-orders`, va dashboard. Mac dinh 5 |

Neu `startDate` lon hon `endDate`, API tra `400`.

## GET `/dashboard`

Dung cho man hinh dashboard vendor, gom tong quan, bieu do doanh thu, san pham ban chay va don gan day.

Example:

```http
GET /api/vendor/statistics/dashboard?startDate=2026-06-01&endDate=2026-06-30&groupBy=day&limit=5
```

Response:

```json
{
  "err": 0,
  "mess": "Lay thong ke dashboard vendor thanh cong",
  "data": {
    "shop": {
      "_id": "665f...",
      "name": "Shop A",
      "slug": "shop-a"
    },
    "filters": {
      "startDate": "2026-06-01",
      "endDate": "2026-06-30",
      "groupBy": "day"
    },
    "overview": {
      "totalProducts": 12,
      "totalOrders": 30,
      "totalProductsSold": 80,
      "grossRevenue": 2500000,
      "deliveredRevenue": 1800000,
      "paidRevenue": 1200000,
      "cancelledRevenue": 300000,
      "averageOrderValue": 83333.33,
      "ordersByStatus": {
        "pending": 4,
        "confirmed": 6,
        "shipping": 3,
        "delivered": 15,
        "cancelled": 2
      }
    },
    "revenueSeries": [
      {
        "period": "2026-06-01",
        "totalOrders": 3,
        "grossRevenue": 250000,
        "deliveredRevenue": 150000,
        "paidRevenue": 100000
      }
    ],
    "topProducts": [
      {
        "productId": "665f...",
        "name": "Banh trang",
        "image": "https://...",
        "quantitySold": 20,
        "revenue": 400000,
        "orderCount": 8
      }
    ],
    "recentOrders": [
      {
        "_id": "665f...",
        "orderCode": "ORDER_...",
        "user": {
          "_id": "665f...",
          "full_name": "Nguyen Van A",
          "email": "a@example.com",
          "phone": "0900000000"
        },
        "status": "pending",
        "paymentMethod": "cod",
        "paymentStatus": "unpaid",
        "isPaid": false,
        "shopTotal": 150000,
        "productTotal": 120000,
        "shippingPrice": 30000,
        "itemCount": 2,
        "createdAt": "2026-06-04T10:00:00.000Z",
        "updatedAt": "2026-06-04T10:00:00.000Z"
      }
    ]
  }
}
```

## GET `/overview`

Tra rieng thong ke tong quan.

```http
GET /api/vendor/statistics/overview?startDate=2026-06-01&endDate=2026-06-30
```

`data` co cung format voi `dashboard.data.overview`.

## GET `/revenue`

Tra chuoi doanh thu theo ngay hoac thang.

```http
GET /api/vendor/statistics/revenue?startDate=2026-01-01&endDate=2026-06-30&groupBy=month
```

`data` la mang:

```json
[
  {
    "period": "2026-06",
    "totalOrders": 20,
    "grossRevenue": 2000000,
    "deliveredRevenue": 1500000,
    "paidRevenue": 800000
  }
]
```

## GET `/top-products`

Tra danh sach san pham ban chay cua shop.

```http
GET /api/vendor/statistics/top-products?startDate=2026-06-01&endDate=2026-06-30&limit=10
```

`data` la mang:

```json
[
  {
    "productId": "665f...",
    "name": "Banh trang",
    "image": "https://...",
    "quantitySold": 20,
    "revenue": 400000,
    "orderCount": 8
  }
]
```

## GET `/recent-orders`

Tra don hang gan day cua shop.

```http
GET /api/vendor/statistics/recent-orders?limit=10
```

`data` la mang order summary, cung format voi `dashboard.data.recentOrders`.

## Ghi chu tinh toan

- `grossRevenue`: tong `shopOrders.shopTotal` cua shop vendor, bo qua order `cancelled`.
- `deliveredRevenue`: tong `shopOrders.shopTotal` cua order co `status = delivered`.
- `paidRevenue`: tong `shopOrders.shopTotal` cua order co `isPaid = true`.
- `cancelledRevenue`: tong `shopOrders.shopTotal` cua order co `status = cancelled`.
- `averageOrderValue`: `grossRevenue / so don khong bi cancelled`.
- Vi mot order co the gom nhieu shop, API chi tinh phan `shopOrders` thuoc shop cua vendor hien tai.

## Error

Vendor chua co shop:

```json
{
  "err": 1,
  "mess": "Vendor chua co shop"
}
```

Khoang ngay khong hop le:

```json
{
  "err": 1,
  "mess": "Khoang thoi gian khong hop le"
}
```
