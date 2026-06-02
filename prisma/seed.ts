// Ejecutar con:
//   npx prisma db seed
import { PrismaClient, SellStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SELLERS_SEED = [
  {
    clerkUserId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn",
    name: "Brian Crowley",
    email: "crowley.brian2004@gmail.com",
    description: "Official seller of running and collector sneakers.",
    avatarUrl: "",
  },
  {
    clerkUserId: "user_3DpXMEd6u89VnAWhsLtcjJc75bQ",
    name: "Bart Simpson",
    email: "bart.simpsonvendedor@gmail.com",
    description: "Urban and skate sneakers specialist.",
    avatarUrl: "",
  },
];

const PRODUCTS_SEED = [
  // ----- Brian -----
  {
    sellerIdx: 0,
    name: "Nike Air Max 90",
    description:
      "Classic 90s sneaker with visible Air cushioning and premium leather upper.",
    price: 89999,
    brand: "Nike",
    category: "Running",
    image: "https://newsport.vtexassets.com/arquivos/ids/8456341-800-auto?v=637629136499930000&width=800&height=auto&aspect=true",      
    colors: ["Black", "White", "Red"],
    
    sizes: [
      { size: "40", stock: 3 },
      { size: "41", stock: 5 },
      { size: "42", stock: 2 },
      { size: "43", stock: 1 },
    ],
  },
  {
    sellerIdx: 0,
    name: "Adidas Ultraboost 23",
    description:
      "High-performance running shoe with BOOST cushioning and Primeknit upper.",
    price: 124999,
    brand: "Adidas",
    category: "Running",
    image: "https://http2.mlstatic.com/D_Q_NP_664895-MLU79062099952_092024-O.webp",
    
    colors: ["Black", "White", "Red"],
    
    sizes: [
      { size: "39", stock: 4 },
      { size: "40", stock: 6 },
      { size: "41", stock: 3 },
      { size: "42", stock: 2 },
    ],
  },
  {
    sellerIdx: 0,
    name: "New Balance 574",
    description:
      "Streetwear icon featuring ENCAP cushioning and suede mesh construction.",
    price: 67500,
    brand: "New Balance",
    category: "Lifestyle",
    image: "https://cdn-images.farfetch-contents.com/20/20/64/43/20206443_50082436_600.jpg",
    
    colors: ["Black", "White", "Red"],

    sizes: [
      { size: "41", stock: 8 },
      { size: "42", stock: 5 },
      { size: "43", stock: 3 },
    ],
  },
  {
    sellerIdx: 0,
    name: "Jordan 1 Retro High OG",
    description:
      "The iconic 1985 silhouette reimagined with premium leather construction.",
    price: 189999,
    brand: "Nike",
    category: "Basketball",
    image: "https://i5.walmartimages.com/seo/Men-s-Air-Jordan-1-Retro-High-OG-Reimagined-Patent-Bred-Banned-2021-555088-063_f7999591-55f6-4344-bbaf-1735f4a6fd55.85d5cc8382de5b2a41fb421fb6b93965.jpeg",
    colors: ["Black", "White", "Red"],
    sizes: [
      { size: "40", stock: 1 },
      { size: "41", stock: 2 },
      { size: "42", stock: 1 },
    ],
  },

  // ----- Bart -----
  {
    sellerIdx: 1,
    name: "Vans Old Skool",
    description:
      "Classic skate shoe with suede and canvas upper and waffle outsole.",
    price: 52000,
    brand: "Vans",
    category: "Skate",
    image: "https://cdn-images.farfetch-contents.com/25/25/55/72/25255572_55353963_1000.jpg",
    colors: ["Red", "Blue", "White"],
    sizes: [
      { size: "37", stock: 6 },
      { size: "38", stock: 4 },
      { size: "39", stock: 7 },
      { size: "40", stock: 5 },
    ],
  },
  {
    sellerIdx: 1,
    name: "Converse Chuck Taylor All Star",
    description:
      "Timeless canvas sneaker with vulcanized rubber sole and iconic silhouette.",
    price: 41999,
    brand: "Converse",
    category: "Lifestyle",
    image: "https://sportline.vtexassets.com/arquivos/ids/1757802/026030000156996_1.jpg?v=639009455740600000",
    
    colors: ["Red", "Blue", "White"],

      sizes: [
      { size: "36", stock: 5 },
      { size: "37", stock: 8 },
      { size: "38", stock: 6 },
      { size: "39", stock: 4 },
      { size: "40", stock: 3 },
    ],
  },
  {
    sellerIdx: 1,
    name: "Puma Suede Classic",
    description:
      "Legendary suede sneaker loved by generations of streetwear enthusiasts.",
    price: 58500,
    brand: "Puma",
    category: "Lifestyle",
    image: "https://production.cdn.vaypol.com/variants/s56mrdxb731turq2yej3bvp5vshr/e82c8d6171dd25bb538f2e7263b5bc7dfc6a79352d85923074be76df53fbc6f4",
   
     colors: ["Red", "Blue", "White"],

     sizes: [
      { size: "40", stock: 4 },
      { size: "41", stock: 3 },
      { size: "42", stock: 2 },
    ],
  },
  {
    sellerIdx: 1,
    name: "Reebok Classic Leather",
    description:
      "Soft leather sneaker with lightweight cushioning for all-day comfort.",
    price: 63000,
    brand: "Reebok",
    category: "Lifestyle",
    image: "https://acdn-us.mitiendanube.com/stores/004/951/039/products/whatsapp-image-2025-08-28-at-10-36-30-f1230cb833f0048bf117563883514097-480-0.webp",
    
    colors: ["Red", "Blue", "White"],

    sizes: [
      { size: "38", stock: 2 },
      { size: "39", stock: 5 },
      { size: "40", stock: 4 },
      { size: "41", stock: 3 },
    ],
  },
];

const SELLS_SEED = [
  {
    sellerIdx: 0,
    orderId: "buyer-order-001",
    total: 89999,
    status: SellStatus.CONFIRMED,
    details: [
      {
        productIdx: 0,
        quantity: 1,
        unitPrice: 89999,
        size: "42",
      },
    ],
  },
  {
    sellerIdx: 0,
    orderId: "buyer-order-002",
    total: 249998,
    status: SellStatus.CONFIRMED,
    details: [
      {
        productIdx: 1,
        quantity: 1,
        unitPrice: 124999,
        size: "41",
      },
      {
        productIdx: 2,
        quantity: 1,
        unitPrice: 67500,
        size: "41",
      },
    ],
  },
  {
    sellerIdx: 0,
    orderId: "buyer-order-003",
    total: 189999,
    status: SellStatus.PENDING,
    details: [
      {
        productIdx: 3,
        quantity: 1,
        unitPrice: 189999,
        size: "40",
      },
    ],
  },
  {
    sellerIdx: 1,
    orderId: "buyer-order-004",
    total: 93999,
    status: SellStatus.CONFIRMED,
    details: [
      {
        productIdx: 4,
        quantity: 1,
        unitPrice: 52000,
        size: "38",
      },
      {
        productIdx: 5,
        quantity: 1,
        unitPrice: 41999,
        size: "38",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Delete respecting FK order
  await prisma.sellDetail.deleteMany();
  await prisma.sell.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.seller.deleteMany();

  // Sellers
  const sellers = await Promise.all(
    SELLERS_SEED.map((seller) =>
      prisma.seller.create({
        data: seller,
      })
    )
  );

  console.log(`✅ ${sellers.length} sellers created`);

  // Products + sizes
  const products = await Promise.all(
    PRODUCTS_SEED.map(({ sellerIdx, sizes, ...data }) =>
      prisma.product.create({
        data: {
          ...data,
          sellerId: sellers[sellerIdx].id,
          sizes: {
            create: sizes,
          },
        },
      })
    )
  );

  console.log(`✅ ${products.length} products created`);

  // Sells + details
  const sells = await Promise.all(
    SELLS_SEED.map(({ sellerIdx, details, ...data }) =>
      prisma.sell.create({
        data: {
          ...data,
          sellerId: sellers[sellerIdx].id,
          details: {
            create: details.map(({ productIdx, ...detail }) => ({
              ...detail,
              productId: products[productIdx].id,
            })),
          },
        },
      })
    )
  );

  console.log(`✅ ${sells.length} sells created`);

  console.log("🎉 Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

