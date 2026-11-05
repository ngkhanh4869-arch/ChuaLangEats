// js/dishes.js
//
// Dataset for the "Hôm nay ăn gì?" (What to eat today?) randomizer on the
// homepage. This is intentionally separate from the Supabase `spots` table:
// it's a curated list of popular Vietnamese dishes so the randomizer stays
// fun and varied even before the vendor database is big, and can surface
// dishes nobody has added a quán for yet.
//
// To add a dish: copy an entry below and fill in the fields. `category`
// should match one of the categories used in add-spot.html
// (Cơm/Bún/Phở, Ăn Vặt, Cà Phê/Trà Sữa, Đồ Uống, Bánh/Tráng Miệng, Khác)
// so the "quán gần đây" lookup has something sensible to compare against.
// `mealTypes` is any combination of breakfast/lunch/dinner/snack.
// `keywords` are lowercase strings (with Vietnamese diacritics) used to spot
// an existing vendor that already serves this dish — the first keyword is
// also what gets typed into the search bar when jumping to results.
// `image` is a photo URL; if it ever breaks, the UI falls back to a plain
// placeholder automatically, so swapping in your own photo later is safe.

export const DISHES = [
    {
        id: "pho-bo",
        name: "Phở Bò",
        description: "Nước dùng xương bò ninh nhiều giờ, thơm mùi quế hồi, ăn cùng bánh phở mềm.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["breakfast", "lunch", "dinner"],
        priceText: "30.000 – 50.000 VNĐ",
        keywords: ["phở bò", "phở"],
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pho-Beef-Noodles-2008.jpg"
    },
    {
        id: "pho-ga",
        name: "Phở Gà",
        description: "Phiên bản thanh nhẹ hơn của phở, nước dùng ngọt từ xương gà, ăn kèm lá chanh thái chỉ.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["breakfast", "lunch"],
        priceText: "30.000 – 45.000 VNĐ",
        keywords: ["phở gà", "phở"],
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chicken-pho-vietnamese-soup.JPG"
    },
    {
        id: "com-tam",
        name: "Cơm Tấm",
        description: "Cơm gạo tấm, sườn nướng, bì, chả trứng — bữa trưa no bụng kiểu miền Nam.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch", "dinner"],
        priceText: "30.000 – 45.000 VNĐ",
        keywords: ["cơm tấm"],
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Com-Tam-2008.jpg"
    },
    {
        id: "bun-dau-mam-tom",
        name: "Bún Đậu Mắm Tôm",
        description: "Đậu rán, bún lá, chả cốm chấm mắm tôm dậy mùi — món thử thách lòng can đảm nhưng gây nghiện.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch", "dinner"],
        priceText: "35.000 – 60.000 VNĐ",
        keywords: ["bún đậu", "mắm tôm"],
        image: "https://static.vinwonders.com/production/2025/06/met-bun-dau-mam-tom-vung-tau.jpg"
    },
    {
        id: "bun-cha",
        name: "Bún Chả",
        description: "Chả viên và chả miếng nướng than hoa, chấm cùng bún và nước mắm chua ngọt — đặc sản Hà Nội.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch", "dinner"],
        priceText: "30.000 – 45.000 VNĐ",
        keywords: ["bún chả"],
        image: "https://static.vinwonders.com/production/bun-cha-ha-noi-01.jpg"
    },
    {
        id: "bun-bo-hue",
        name: "Bún Bò Huế",
        description: "Nước dùng cay nồng sả ớt, đậm vị mắm ruốc, ăn cùng chả cua và giò heo.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["breakfast", "lunch"],
        priceText: "30.000 – 45.000 VNĐ",
        keywords: ["bún bò huế", "bún bò"],
        image: "https://static.vinwonders.com/production/bun-bo-hue-1.jpg"
    },
    {
        id: "mi-quang",
        name: "Mì Quảng",
        description: "Sợi mì vàng nghệ, nước dùng sánh đậm, ăn kèm tôm thịt, trứng cút và bánh đa.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch", "dinner"],
        priceText: "30.000 – 45.000 VNĐ",
        keywords: ["mì quảng"],
        image: "https://static.vinwonders.com/2022/06/mi-quang-da-nang-1-1.jpg"
    },
    {
        id: "xoi-xeo",
        name: "Xôi Xéo",
        description: "Xôi nếp dẻo, đậu xanh nghiền, hành phi thơm lừng — bữa sáng quen thuộc của người Hà Nội.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["breakfast"],
        priceText: "15.000 – 25.000 VNĐ",
        keywords: ["xôi xéo", "xôi"],
        image: "https://static.vinwonders.com/production/Xoi-xeo.jpg"
    },
    {
        id: "banh-mi",
        name: "Bánh Mì",
        description: "Vỏ giòn rụm, nhân pate, chả, trứng ốp la — bữa sáng hoặc ăn vặt \"cân\" mọi lúc.",
        category: "Ăn Vặt",
        mealTypes: ["breakfast", "snack"],
        priceText: "15.000 – 25.000 VNĐ",
        keywords: ["bánh mì"],
        image: "https://static.vinwonders.com/production/banh-mi-ha-noi-0.jpg"
    },
    {
        id: "nem-chua-ran",
        name: "Nem Chua Rán",
        description: "Nem chua lên men nhẹ, chiên giòn, chấm tương ớt — món vặt vỉa hè không thể bỏ qua.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "15.000 – 25.000 VNĐ",
        keywords: ["nem chua rán", "nem chua"],
        image: "https://vietnam-amazing.com/wp-content/uploads/2023/12/nem-chua-ran-e1701403891504-678x381.jpeg"
    },
    {
        id: "banh-xeo",
        name: "Bánh Xèo",
        description: "Vỏ bánh giòn tan nhân tôm thịt giá đỗ, cuốn rau sống chấm nước mắm chua ngọt.",
        category: "Ăn Vặt",
        mealTypes: ["dinner", "snack"],
        priceText: "25.000 – 40.000 VNĐ",
        keywords: ["bánh xèo"],
        image: "https://static.vinwonders.com/production/banh-xeo-ngon-ha-noi-2.jpg"
    },
    {
        id: "che-thai",
        name: "Chè Thái",
        description: "Thạch nhiều màu, trái cây, nước cốt dừa béo ngậy — giải nhiệt cực đã vào ngày nóng.",
        category: "Bánh/Tráng Miệng",
        mealTypes: ["snack"],
        priceText: "15.000 – 25.000 VNĐ",
        keywords: ["chè thái", "chè"],
        image: "https://photo-baomoi.bmcdn.me/w700_r1/2026_07_21_83_55659398/96d188eac5a12cff75b0.jpg"
    }
];
