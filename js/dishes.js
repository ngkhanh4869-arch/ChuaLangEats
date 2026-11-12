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
    },
    {
        id: "oc-luoc",
        name: "Ốc Luộc",
        description: "Ốc tươi luộc sả, chấm nước mắm gừng cay nồng — món ăn chơi buổi tối quen thuộc của giới trẻ Hà Nội.",
        category: "Ăn Vặt",
        mealTypes: ["dinner", "snack"],
        priceText: "30.000 – 60.000 VNĐ",
        keywords: ["ốc luộc", "ốc"],
        image: "https://static.vinwonders.com/production/oc-luoc-ha-noi-1.jpg"
    },
    {
        id: "ga-ran",
        name: "Gà Rán",
        description: "Gà tẩm bột chiên vàng giòn rụm, thơm lừng — vừa làm món ăn vặt vừa no bụng được bữa chính.",
        category: "Ăn Vặt",
        mealTypes: ["lunch", "dinner", "snack"],
        priceText: "25.000 – 45.000 VNĐ",
        keywords: ["gà rán"],
        image: "https://static1.squarespace.com/static/5fee116050339566e9b38f09/5fee11df5abd827cad1a68c9/67c79935e60afb37c9886499/1741360470879/Screenshot+2025-03-04+at+7.25.58+PM.png?format=1500w"
    },

    // --- Added from a sweep of 4 Chùa Láng food blogs (emdoi.vn, digifood.vn,
    // mytour.vn, greensm.com) that surfaced dishes/eateries not yet covered
    // above. Image URLs below are best-effort hotlinks — the UI already
    // falls back gracefully if one breaks, but it's worth spot-checking them.
    {
        id: "thit-xien-nuong",
        name: "Thịt Xiên Nướng",
        description: "Xiên thịt heo/gà tẩm ướp nướng than hoa, ăn kèm nộm bò đu đủ hoặc bánh mì — món vỉa hè quen thuộc buổi tối.",
        category: "Ăn Vặt",
        mealTypes: ["dinner", "snack"],
        priceText: "15.000 – 60.000 VNĐ",
        keywords: ["thịt xiên nướng", "xiên nướng"],
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pork_skewers_on_the_grill_-_Banh_Uot_hawker.jpg"
    },
    {
        id: "bun-do",
        name: "Bún Đỏ",
        description: "Đặc sản Buôn Ma Thuột hiếm gặp ở Hà Nội: sợi bún dày màu cam đỏ từ dầu điều, ăn cùng chả cua, giò, nem rán, trứng cút.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch", "dinner"],
        priceText: "35.000 – 45.000 VNĐ",
        keywords: ["bún đỏ"],
        image: "https://static.vinwonders.com/production/bun-do-buon-ma-thuot-1.jpg"
    },
    {
        id: "tao-pho",
        name: "Tào Phớ (Tàu Hũ)",
        description: "Óc đậu mềm mịn chan nước đường gừng hoặc nước cốt dừa — món giải nhiệt nhẹ nhàng, rẻ tiền.",
        category: "Bánh/Tráng Miệng",
        mealTypes: ["snack"],
        priceText: "10.000 – 25.000 VNĐ",
        keywords: ["tào phớ", "tàu hũ"],
        image: "https://static.vinwonders.com/production/tao-pho-ha-noi-1.jpg"
    },
    {
        id: "pad-thai",
        name: "Pad Thái",
        description: "Mì gạo xào kiểu Thái với tôm/gà, trứng, giá đỗ và nước sốt me chua ngọt, rắc đậu phộng rang.",
        category: "Khác",
        mealTypes: ["lunch", "dinner"],
        priceText: "60.000 – 120.000 VNĐ",
        keywords: ["pad thái", "pad thai"],
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pad_Thai_with_tofu.jpg"
    },
    {
        id: "kimmari",
        name: "Kimmari",
        description: "Chả giò rong biển chiên giòn kiểu Hàn Quốc, cuộn miến bên trong, chấm tương ớt ngọt.",
        category: "Ăn Vặt",
        mealTypes: ["snack", "dinner"],
        priceText: "25.000 – 45.000 VNĐ",
        keywords: ["kimmari"],
        image: "https://static.vinwonders.com/production/kimmari-ha-noi.jpg"
    },
    {
        id: "banh-trang-nuong",
        name: "Bánh Tráng Nướng",
        description: "\"Pizza Việt Nam\": bánh tráng nướng than hoa với trứng cút, hành phi, mỡ hành, pate hoặc xúc xích.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "15.000 – 35.000 VNĐ",
        keywords: ["bánh tráng nướng"],
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%A1nh%20tr%C3%A1ng%20n%C6%B0%E1%BB%9Bng%20TP.%20H%E1%BB%93%20Ch%C3%AD%20Minh%20-%20street%20food%20in%20Ho%20Chi%20Minh%20City%2C%20Vietnam.jpg"
    },
    {
        id: "banh-trang-tron",
        name: "Bánh Tráng Trộn",
        description: "Bánh tráng cắt sợi trộn xoài xanh, khô bò, trứng cút, rau răm, sa tế và nước sốt me — ăn vặt quốc dân.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "15.000 – 30.000 VNĐ",
        keywords: ["bánh tráng trộn"],
        image: "https://static.vinwonders.com/production/banh-trang-tron-sai-gon.jpg"
    },
    {
        id: "sup-cua",
        name: "Súp Cua",
        description: "Súp sánh mịn với thịt cua, trứng cút, nấm và trứng gà đánh tơi — món ăn vặt ấm bụng ngày se lạnh.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "15.000 – 25.000 VNĐ",
        keywords: ["súp cua"],
        image: "https://static.vinwonders.com/production/sup-cua-ha-noi.jpg"
    },
    {
        id: "nuoc-rau-ma",
        name: "Nước Rau Má",
        description: "Rau má xay nhuyễn lọc lấy nước, thường pha thêm đậu xanh hoặc sữa dừa — thức uống giải nhiệt quen thuộc.",
        category: "Đồ Uống",
        mealTypes: ["snack"],
        priceText: "10.000 – 20.000 VNĐ",
        keywords: ["rau má", "nước rau má"],
        image: "https://static.vinwonders.com/production/nuoc-rau-ma.jpg"
    },
    {
        id: "bun-mong-gio",
        name: "Bún Móng Giò",
        description: "Bún bung chân giò ninh mềm, nước dùng đậm đà nấu cùng dọc mùng hoặc hoa chuối.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch", "dinner"],
        priceText: "30.000 – 50.000 VNĐ",
        keywords: ["bún móng giò", "móng giò"],
        image: "https://static.vinwonders.com/production/bun-moc-ha-noi.jpg"
    },
    {
        id: "hotdog-chien",
        name: "Hotdog Chiên Kiểu Hàn",
        description: "Xúc xích bọc bột chiên xù hoặc bọc mì tôm, phô mai kéo sợi, lăn đường — món ăn vặt du nhập từ Hàn Quốc.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "25.000 – 45.000 VNĐ",
        keywords: ["hotdog", "hot dog"],
        image: "https://static.vinwonders.com/production/corn-dog-han-quoc.jpg"
    },
    {
        id: "ga-lac-pho-mai",
        name: "Gà Lắc Phô Mai",
        description: "Gà rán chiên giòn lắc cùng bột phô mai đậm vị, ăn kèm tương ớt mayonnaise.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "20.000 – 40.000 VNĐ",
        keywords: ["gà lắc phô mai"],
        image: "https://static.vinwonders.com/production/ga-lac-pho-mai.jpg"
    },
    {
        id: "bun-suon-chua",
        name: "Bún Sườn Chua",
        description: "Nước dùng chua dịu từ sấu hoặc me, sườn non ninh mềm, ăn cùng rau sống và bún.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch"],
        priceText: "30.000 – 45.000 VNĐ",
        keywords: ["bún sườn chua", "bún sườn"],
        image: "https://static.vinwonders.com/production/bun-suon-ha-noi.jpg"
    },
    {
        id: "chan-ga-sot-thai",
        name: "Chân Gà Sốt Thái",
        description: "Chân gà rút xương sốt chua cay kiểu Thái với sả, ớt, lá chanh — món nhậu vặt được ưa chuộng.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "20.000 – 40.000 VNĐ",
        keywords: ["chân gà sốt thái", "chân gà"],
        image: "https://static.vinwonders.com/production/chan-ga-sot-thai.jpg"
    },
    {
        id: "bun-mam-heo-quay",
        name: "Bún Mắm Heo Quay",
        description: "Nước dùng mắm cá đậm đà kiểu miền Tây, ăn cùng heo quay giòn bì và rau sống đa dạng.",
        category: "Cơm/Bún/Phở",
        mealTypes: ["lunch", "dinner"],
        priceText: "30.000 – 50.000 VNĐ",
        keywords: ["bún mắm heo quay", "bún mắm"],
        image: "https://static.vinwonders.com/production/bun-mam-mien-tay.jpg"
    },
    {
        id: "trung-chen-nuong",
        name: "Trứng Chén Nướng",
        description: "Trứng gà đánh cùng thịt băm, mộc nhĩ, hành lá, nướng trong chén nhỏ trên than hoa — ăn vặt lạ miệng.",
        category: "Ăn Vặt",
        mealTypes: ["snack"],
        priceText: "10.000 – 20.000 VNĐ",
        keywords: ["trứng chén nướng"],
        image: "https://static.vinwonders.com/production/trung-nuong-cho.jpg"
    }
];
