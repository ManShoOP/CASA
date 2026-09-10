export type SharedMenuItem = {
  id: string | number;
  name: string;
  nameTh: string;
  nameEn: string;
  category: "Starters" | "Tacos & Mains" | "Sides" | "Drinks & Desserts";
  categoryTh: string;
  price: number;
  priceFormatted: string;
  description: string;
  descriptionTh: string;
  descriptionEn: string;
  image: string;
  dietary: string[];
};

export const MASTER_MENU_ITEMS: SharedMenuItem[] = [
  {
    id: 1,
    category: "Starters",
    categoryTh: "ของว่าง",
    name: "Guacamole & Chips",
    nameEn: "Guacamole & Chips",
    nameTh: "กัวคาโมเล่ & แผ่นข้าวโพดทอด (Guacamole & Chips)",
    description: "Fresh Hass avocados, jalapeño, red onion, cilantro, lime, served with house-made tortilla chips.",
    descriptionEn: "Fresh Hass avocados, jalapeño, red onion, cilantro, lime, served with house-made tortilla chips.",
    descriptionTh: "อะโวคาโดพันธุ์แฮสสด บดพร้อมพริกฮาลาเปนโญ หอมแดง ผักชี มะนาว เสิร์ฟคู่กับแผ่นตอร์ติญ่าทอดกรอบสูตรของทางร้าน",
    price: 12,
    priceFormatted: "$12",
    dietary: ["V", "GF"],
    image: "/images/guacamole.jpg"
  },
  {
    id: 2,
    category: "Starters",
    categoryTh: "ของว่าง",
    name: "Queso Fundido",
    nameEn: "Queso Fundido",
    nameTh: "ชีสเยิ้มกระทะร้อน (Queso Fundido)",
    description: "Melted Oaxaca cheese, house chorizo, roasted poblano peppers, warm flour tortillas.",
    descriptionEn: "Melted Oaxaca cheese, house chorizo, roasted poblano peppers, warm flour tortillas.",
    descriptionTh: "ชีสโออาซากาละลายร้อนๆ ผสมไส้กรอกโชริโซ พริกโพบลานอย่าง เสิร์ฟพร้อมแป้งตอร์ติญ่าอุ่นๆ",
    price: 14,
    priceFormatted: "$14",
    dietary: [],
    image: "/images/queso-fundido.jpg"
  },
  {
    id: 3,
    category: "Tacos & Mains",
    categoryTh: "ทาโก้ & จานหลัก",
    name: "Al Pastor Tacos",
    nameEn: "Al Pastor Tacos",
    nameTh: "ทาโก้หมูหมักสับปะรดย่าง (Al Pastor Tacos)",
    description: "Marinated pork, grilled pineapple, white onion, cilantro, salsa roja.",
    descriptionEn: "Marinated pork, grilled pineapple, white onion, cilantro, salsa roja.",
    descriptionTh: "เนื้อหมูหมักเครื่องเทศต้นตำรับ สับปะรดย่าง หอมใหญ่ ผักชี และซัลซ่าโรฮา",
    price: 16,
    priceFormatted: "$16",
    dietary: ["GF"],
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    category: "Tacos & Mains",
    categoryTh: "ทาโก้ & จานหลัก",
    name: "Baja Fish Tacos",
    nameEn: "Baja Fish Tacos",
    nameTh: "ทาโก้ปลาบาฮาทอดกรอบ (Baja Fish Tacos)",
    description: "Crispy beer-battered cod, cabbage slaw, chipotle crema, pico de gallo.",
    descriptionEn: "Crispy beer-battered cod, cabbage slaw, chipotle crema, pico de gallo.",
    descriptionTh: "ปลาค็อดชุบแป้งเบียร์ทอดกรอบ สลัดกะหล่ำปลี ครีมชิโปตเล่ และปิโกเดกาโย",
    price: 18,
    priceFormatted: "$18",
    dietary: [],
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    category: "Tacos & Mains",
    categoryTh: "ทาโก้ & จานหลัก",
    name: "Carne Asada",
    nameEn: "Carne Asada",
    nameTh: "สเต๊กเนื้อย่างสไตล์เม็กซิกัน (Carne Asada)",
    description: "Grilled marinated skirt steak, roasted jalapeño, grilled onions, rice, beans, tortillas.",
    descriptionEn: "Grilled marinated skirt steak, roasted jalapeño, grilled onions, rice, beans, tortillas.",
    descriptionTh: "เนื้อสเต๊กหมักย่างบนเตาถ่าน พริกฮาลาเปนโญย่าง หอมใหญ่ย่าง เสิร์ฟพร้อมข้าว ถั่ว และแป้งตอร์ติญ่า",
    price: 28,
    priceFormatted: "$28",
    dietary: ["GF"],
    image: "/images/carne-asada.jpg"
  },
  {
    id: 6,
    category: "Sides",
    categoryTh: "เครื่องเคียง",
    name: "Esquites",
    nameEn: "Esquites",
    nameTh: "ข้าวโพดย่างสไตล์สตรีทฟู้ด (Esquites)",
    description: "Roasted corn off the cob, epazote, mayo, cotija cheese, chili powder.",
    descriptionEn: "Roasted corn off the cob, epazote, mayo, cotija cheese, chili powder.",
    descriptionTh: "ข้าวโพดย่างคลุกเคล้าใบเอพาโซเต มาโย คอนทิฮาชีส และผงพริกสไตล์เม็กซิกัน",
    price: 8,
    priceFormatted: "$8",
    dietary: ["V", "GF"],
    image: "/images/esquites.jpg"
  },
  {
    id: 7,
    category: "Sides",
    categoryTh: "เครื่องเคียง",
    name: "Frijoles Refritos",
    nameEn: "Frijoles Refritos",
    nameTh: "ถั่วปินโตบดผัดทรงเครื่อง (Frijoles Refritos)",
    description: "Slow-cooked pinto beans, toasted garlic, epazote, topped with queso fresco.",
    descriptionEn: "Slow-cooked pinto beans, toasted garlic, epazote, topped with queso fresco.",
    descriptionTh: "ถั่วปินโตตุ๋นเคี่ยวนาน กระเทียมเจียวหอม ใบเอพาโซเต โรยหน้าด้วยชีสสดเกโซเฟรสโก",
    price: 6,
    priceFormatted: "$6",
    dietary: ["V", "GF"],
    image: "/images/frijoles-refritos.jpg"
  },
  {
    id: 8,
    category: "Drinks & Desserts",
    categoryTh: "เครื่องดื่ม & ของหวาน",
    name: "Classic Margarita",
    nameEn: "Classic Margarita",
    nameTh: "คลาสสิก มาร์การิต้า (Classic Margarita)",
    description: "Blanco tequila, fresh lime juice, organic agave nectar, salt rim.",
    descriptionEn: "Blanco tequila, fresh lime juice, organic agave nectar, salt rim.",
    descriptionTh: "บลองโก้เตกีล่า น้ำมะนาวคั้นสด น้ำเชื่อมอากาเว่ออร์แกนิก ขอบแก้วเคลือบเกลือ",
    price: 12,
    priceFormatted: "$12",
    dietary: ["V", "GF"],
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 9,
    category: "Drinks & Desserts",
    categoryTh: "เครื่องดื่ม & ของหวาน",
    name: "Churros con Chocolate",
    nameEn: "Churros con Chocolate",
    nameTh: "ชูร์โรสพร้อมซอสช็อกโกแลต (Churros con Chocolate)",
    description: "Cinnamon-sugar dusted churros, warm spiced chocolate dipping sauce.",
    descriptionEn: "Cinnamon-sugar dusted churros, warm spiced chocolate dipping sauce.",
    descriptionTh: "ขนมปาท่องโก๋สเปนคลุกน้ำตาลอบเชย เสิร์ฟพร้อมซอสช็อกโกแลตร้อนเข้มข้นสูตรพิเศษ",
    price: 10,
    priceFormatted: "$10",
    dietary: ["V"],
    image: "/images/churros.jpg"
  }
];
