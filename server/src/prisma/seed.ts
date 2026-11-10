import bcrypt from 'bcryptjs';
import { prisma } from './client';

export async function seedDatabase() {
  console.log('🌱 Starting Digital Kirana database seed...');

  // Check if owner already exists
  const existingOwner = await prisma.user.findUnique({
    where: { email: 'owner@kirana.com' },
  });

  if (existingOwner) {
    console.log('ℹ️ Database already seeded. Skipping initial seeding.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // 1. Create Owner User
  const owner = await prisma.user.create({
    data: {
      name: 'Shankar Gowda',
      email: 'owner@kirana.com',
      password: hashedPassword,
      phone: '+91 98450 11223',
      role: 'OWNER',
      isEmailVerified: true,
    },
  });

  // 2. Create Kirana Business
  const business = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: 'Sri Manjunatha Kirana & General Provision Stores',
      email: 'store@manjunathakirana.in',
      phone: '+91 80 2314 5678',
      location: '12th Cross, 4th Block, Rajajinagar, Bengaluru, Karnataka 560010',
      category: 'Kirana & General Stores',
      businessType: 'Retail',
      currency: 'INR',
      lowStockThreshold: 15,
      taxRate: 5.0,
      description: 'Serving Bangalore homes with authentic Karnataka provisions, whole grains, pulses, Nandini dairy and spices since 1998.',
    },
  });

  // Update owner businessId
  await prisma.user.update({
    where: { id: owner.id },
    data: { businessId: business.id },
  });

  // 3. Create Staff User
  await prisma.user.create({
    data: {
      name: 'Ramesh Kumar',
      email: 'staff@kirana.com',
      password: hashedPassword,
      phone: '+91 98452 33445',
      role: 'STAFF',
      businessId: business.id,
      isEmailVerified: true,
    },
  });

  // 4. Create Customer User
  const customerUser = await prisma.user.create({
    data: {
      name: 'Ananya Rao',
      email: 'customer@kirana.com',
      password: hashedPassword,
      phone: '+91 99001 77889',
      role: 'CUSTOMER',
      isEmailVerified: true,
    },
  });

  // 5. Create Kirana Categories
  const categoriesData = [
    { name: 'Staples & Grains', nameKn: 'ಧಾನ್ಯಗಳು ಮತ್ತು ಬೇಳೆಕಾಳುಗಳು', description: 'Rice, Dal, Atta, Ragi and whole pulses', icon: '🌾' },
    { name: 'Oils & Dairy', nameKn: 'ಎಣ್ಣೆ ಮತ್ತು ಹೈನುಗಾರಿಕೆ', description: 'Pure Nandini ghee, cooking oils, butter and milk products', icon: '🧈' },
    { name: 'Spices & Masalas', nameKn: 'ಮಸಾಲೆಗಳು', description: 'Authentic Karnataka powders, whole spices, sambar mix', icon: '🌶️' },
    { name: 'Beverages', nameKn: 'ಪಾನೀಯಗಳು', description: 'Filter coffee powders, premium teas and healthy drinks', icon: '☕' },
    { name: 'Personal Care', nameKn: 'ವೈಯಕ್ತಿಕ ಆರೈಕೆ', description: 'Mysore Sandal soaps, dental care and grooming essentials', icon: '🧼' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({
      data: {
        businessId: business.id,
        ...cat,
      },
    });
  }

  // 6. Create Authentic Kirana Products
  const productsData = [
    {
      name: 'Karnataka Sona Masoori Rice (25kg)',
      nameKn: 'ಕರ್ನಾಟಕ ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ (೨೫ ಕೆಜಿ)',
      brand: 'Bhadravathi Mills',
      barcode: '8901030384012',
      categoryName: 'Staples & Grains',
      groceryType: 'Rice & Grains',
      unitType: 'BAG',
      isLooseItem: false,
      purchasePrice: 1280,
      sellingPrice: 1480,
      quantity: 36,
      reorderLevel: 10,
      stockStatus: 'AVAILABLE',
      supplier: 'Kaveri Agro Traders',
      description: 'Aged 1-year premium soft polished rice, high yield and non-sticky texture.',
    },
    {
      name: 'Pure Nandini Ghee 1 Litre Tin',
      nameKn: 'ಶುದ್ಧ ನಂದಿನಿ ತುಪ್ಪ ೧ ಲೀಟರ್',
      brand: 'KMF Nandini',
      barcode: '8906036670014',
      categoryName: 'Oils & Dairy',
      groceryType: 'Dairy & Ghee',
      unitType: 'LITRE',
      isLooseItem: false,
      purchasePrice: 560,
      sellingPrice: 620,
      quantity: 24,
      reorderLevel: 8,
      stockStatus: 'AVAILABLE',
      supplier: 'KMF Bangalore Dairy Union',
      description: 'Aromatic pure cow ghee prepared from fresh golden butter, AGMARK special grade.',
    },
    {
      name: 'Premium Karnataka Toor Dal (Polished) 1kg',
      nameKn: 'ಉತ್ತಮ ತೊಗರಿ ಬೇಳೆ ೧ ಕೆಜಿ',
      brand: 'Kalaburagi Gold',
      barcode: '8901030384029',
      categoryName: 'Staples & Grains',
      groceryType: 'Pulses',
      unitType: 'KG',
      isLooseItem: false,
      purchasePrice: 135,
      sellingPrice: 165,
      quantity: 48,
      reorderLevel: 15,
      stockStatus: 'AVAILABLE',
      supplier: 'Kalaburagi APMC Mandi',
      description: 'Unpolished GI-tagged Kalaburagi Toor Dal, high protein and rich sambar aroma.',
    },
    {
      name: 'Mysore Sandal Gold Soap 125g',
      nameKn: 'ಮೈಸೂರು ಸ್ಯಾಂಡಲ್ ಗೋಲ್ಡ್ ಸಾಬೂನು ೧೨೫ಗ್ರಾಂ',
      brand: 'KSDL Mysore',
      barcode: '8901248101015',
      categoryName: 'Personal Care',
      groceryType: 'Toiletries',
      unitType: 'PIECE',
      isLooseItem: false,
      purchasePrice: 78,
      sellingPrice: 95,
      quantity: 65,
      reorderLevel: 20,
      stockStatus: 'AVAILABLE',
      supplier: 'Karnataka Soaps and Detergents Ltd',
      description: 'Only soap made with 100% pure natural sandalwood oil and skin conditioners.',
    },
    {
      name: 'MTR Special Karnataka Sambar Powder 200g',
      nameKn: 'ಎಂ.ಟಿ.ಆರ್ ವಿಶೇಷ ಸಾಂಬಾರ್ ಪುಡಿ ೨೦೦ಗ್ರಾಂ',
      brand: 'MTR Foods',
      barcode: '8901042951011',
      categoryName: 'Spices & Masalas',
      groceryType: 'Masala Powders',
      unitType: 'PACKET',
      isLooseItem: false,
      purchasePrice: 64,
      sellingPrice: 78,
      quantity: 32,
      reorderLevel: 10,
      stockStatus: 'AVAILABLE',
      supplier: 'MTR Direct Depot',
      description: 'Traditional Karnataka blend with coriander, fenugreek, cumin and Byadagi chilli.',
    },
    {
      name: 'Chikmagalur Filter Coffee Blend (80:20) 500g',
      nameKn: 'ಚಿಕ್ಕಮಗಳೂರು ಫಿಲ್ಟರ್ ಕಾಫಿ ಪುಡಿ ೫೦೦ಗ್ರಾಂ',
      brand: 'Malnad Roast',
      barcode: '8901058001021',
      categoryName: 'Beverages',
      groceryType: 'Coffee',
      unitType: 'PACKET',
      isLooseItem: false,
      purchasePrice: 195,
      sellingPrice: 240,
      quantity: 22,
      reorderLevel: 10,
      stockStatus: 'AVAILABLE',
      supplier: 'Chikmagalur Planters Union',
      description: 'Freshly ground Plantation-A coffee with 20% chicory for thick traditional South Indian decoction.',
    },
    {
      name: 'Aashirvaad Sharbati Whole Wheat Atta 10kg',
      nameKn: 'ಆಶೀರ್ವಾದ್ ಶರ್ಬತಿ ಗೋಧಿ ಹಿಟ್ಟು ೧೦ ಕೆಜಿ',
      brand: 'Aashirvaad',
      barcode: '8901725181033',
      categoryName: 'Staples & Grains',
      groceryType: 'Flours',
      unitType: 'BAG',
      isLooseItem: false,
      purchasePrice: 410,
      sellingPrice: 475,
      quantity: 20,
      reorderLevel: 8,
      stockStatus: 'AVAILABLE',
      supplier: 'ITC Logistics Hub',
      description: '100% pure Sharbati grains for fluffy, soft rotis that stay fresh longer.',
    },
    {
      name: 'Karnataka Organic Ragi Flour 1kg',
      nameKn: 'ಸಾವಯವ ರಾಗಿ ಹಿಟ್ಟು ೧ ಕೆಜಿ',
      brand: 'Mandya Organic',
      barcode: '8901030384043',
      categoryName: 'Staples & Grains',
      groceryType: 'Millet Flours',
      unitType: 'KG',
      isLooseItem: false,
      purchasePrice: 45,
      sellingPrice: 62,
      quantity: 40,
      reorderLevel: 15,
      stockStatus: 'AVAILABLE',
      supplier: 'Mandya Farmer Producer Co',
      description: 'Finely milled finger millet for authentic Ragi Mudde, Ragi Dosa and healthy porridge.',
    },
    {
      name: 'Byadagi Red Chilli Whole (Wrinkled) 500g',
      nameKn: 'ಬ್ಯಾಡಗಿ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ ೫೦೦ಗ್ರಾಂ',
      brand: 'Haveri Fresh',
      barcode: '8901030384050',
      categoryName: 'Spices & Masalas',
      groceryType: 'Spices',
      unitType: 'PACKET',
      isLooseItem: false,
      purchasePrice: 180,
      sellingPrice: 220,
      quantity: 7,
      reorderLevel: 12,
      stockStatus: 'LOW_STOCK',
      supplier: 'Byadagi APMC Commission Agents',
      description: 'Deep red color and mild sweetness with low pungency, essential for Karnataka sambar.',
    },
    {
      name: 'Cold-Pressed Groundnut Oil 1 Litre Bottle',
      nameKn: 'ಗಾಣದ ಕಡಲೆಕಾಯಿ ಎಣ್ಣೆ ೧ ಲೀಟರ್',
      brand: 'Kolar Gaana',
      barcode: '8906036670021',
      categoryName: 'Oils & Dairy',
      groceryType: 'Cooking Oils',
      unitType: 'LITRE',
      isLooseItem: false,
      purchasePrice: 175,
      sellingPrice: 210,
      quantity: 5,
      reorderLevel: 10,
      stockStatus: 'LOW_STOCK',
      supplier: 'Kolar Agro Crushing Mills',
      description: 'Traditional wood-pressed peanut oil with pure nutty aroma and zero preservatives.',
    },
    {
      name: 'Tata Salt Crystal Iodized 1kg',
      nameKn: 'ಟಾಟಾ ಹರಳು ಉಪ್ಪು ೧ ಕೆಜಿ',
      brand: 'Tata Consumer',
      barcode: '8901030384067',
      categoryName: 'Staples & Grains',
      groceryType: 'Salt',
      unitType: 'KG',
      isLooseItem: false,
      purchasePrice: 22,
      sellingPrice: 28,
      quantity: 0,
      reorderLevel: 25,
      stockStatus: 'OUT_OF_STOCK',
      supplier: 'Tata Distributor Hub',
      description: 'Iodized coarse crystal salt for sambar, rasam, pickles and everyday boiling.',
    },
    {
      name: 'Nandini Pure Salted Table Butter 500g',
      nameKn: 'ನಂದಿನಿ ಬೆಣ್ಣೆ ೫೦೦ಗ್ರಾಂ',
      brand: 'KMF Nandini',
      barcode: '8906036670038',
      categoryName: 'Oils & Dairy',
      groceryType: 'Dairy',
      unitType: 'PACKET',
      isLooseItem: false,
      purchasePrice: 245,
      sellingPrice: 285,
      quantity: 0,
      reorderLevel: 15,
      stockStatus: 'OUT_OF_STOCK',
      supplier: 'KMF Bangalore Dairy Union',
      description: 'Golden churned salted butter for morning dosas, toast and baking.',
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const p = await prisma.product.create({
      data: {
        businessId: business.id,
        ...prod,
      },
    });
    createdProducts.push(p);

    // Initial stock transaction
    if (p.quantity > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          businessId: business.id,
          productId: p.id,
          type: 'STOCK_IN',
          quantityDelta: p.quantity,
          previousQuantity: 0,
          newQuantity: p.quantity,
          notes: 'Initial warehouse intake for store opening',
          performedById: owner.id,
        },
      });
    }
  }

  // 7. Create Customers
  const customerList = [
    {
      name: 'Suresh Hegde',
      phone: '+91 98451 22334',
      email: 'suresh.hegde@gmail.com',
      address: 'Plot 44, 2nd Main, Malleshwaram 7th Cross, Bengaluru',
      totalOrders: 14,
      totalSpending: 18450,
      lastPurchaseDate: new Date(Date.now() - 86400000 * 2),
      notes: 'Prefers 25kg Sona Masoori bags home delivered on Saturdays.',
    },
    {
      name: 'Lakshmi Devi',
      phone: '+91 99002 44556',
      email: 'lakshmi.devi@yahoo.com',
      address: 'House #12, 10th Main, Rajajinagar 3rd Block, Bengaluru',
      totalOrders: 28,
      totalSpending: 32600,
      lastPurchaseDate: new Date(Date.now() - 86400000),
      notes: 'Regular weekly customer. Always buys Nandini ghee and filter coffee.',
    },
    {
      name: 'Girish Patel',
      phone: '+91 97412 88990',
      email: 'girish.patel@outlook.com',
      address: 'No 705, Royal Apartments, Basaveshwaranagar, Bengaluru',
      totalOrders: 8,
      totalSpending: 9400,
      lastPurchaseDate: new Date(Date.now() - 86400000 * 5),
      notes: 'Pays via UPI. Requests GST invoice.',
    },
    {
      name: 'Ananya Rao',
      phone: '+91 99001 77889',
      email: 'customer@kirana.com',
      address: '3rd Floor, Shanthi Nilaya, Rajajinagar, Bengaluru',
      userId: customerUser.id,
      totalOrders: 5,
      totalSpending: 5200,
      lastPurchaseDate: new Date(),
      notes: 'Customer portal app user.',
    },
  ];

  const createdCustomers = [];
  for (const c of customerList) {
    const cust = await prisma.customer.create({
      data: {
        businessId: business.id,
        ...c,
      },
    });
    createdCustomers.push(cust);
  }

  // 8. Create Sample Completed Orders
  const sampleOrders = [
    {
      orderNumber: 'ORD-1001',
      customer: createdCustomers[0],
      items: [
        { product: createdProducts[0], quantity: 1 }, // Rice 25kg
        { product: createdProducts[1], quantity: 2 }, // Nandini Ghee
      ],
      discountAmount: 100,
      paymentMethod: 'UPI',
      daysAgo: 3,
    },
    {
      orderNumber: 'ORD-1002',
      customer: createdCustomers[1],
      items: [
        { product: createdProducts[2], quantity: 3 }, // Toor Dal
        { product: createdProducts[4], quantity: 2 }, // Sambar powder
        { product: createdProducts[5], quantity: 1 }, // Coffee
      ],
      discountAmount: 50,
      paymentMethod: 'CASH',
      daysAgo: 2,
    },
    {
      orderNumber: 'ORD-1003',
      customer: createdCustomers[2],
      items: [
        { product: createdProducts[6], quantity: 1 }, // Atta 10kg
        { product: createdProducts[3], quantity: 4 }, // Mysore Sandal
      ],
      discountAmount: 0,
      paymentMethod: 'CARD',
      daysAgo: 1,
    },
    {
      orderNumber: 'ORD-1004',
      customer: createdCustomers[3],
      items: [
        { product: createdProducts[1], quantity: 1 }, // Ghee
        { product: createdProducts[5], quantity: 2 }, // Coffee
        { product: createdProducts[7], quantity: 2 }, // Ragi
      ],
      discountAmount: 40,
      paymentMethod: 'UPI',
      daysAgo: 0,
    },
  ];

  for (const ord of sampleOrders) {
    let subtotal = 0;
    const itemsData = ord.items.map((it) => {
      const lineSubtotal = it.product.sellingPrice * it.quantity;
      subtotal += lineSubtotal;
      return {
        productId: it.product.id,
        productName: it.product.name,
        unitPrice: it.product.sellingPrice,
        costPrice: it.product.purchasePrice,
        quantity: it.quantity,
        subtotal: lineSubtotal,
      };
    });

    const taxAmount = ((subtotal - ord.discountAmount) * 5) / 100;
    const totalAmount = Math.round((subtotal - ord.discountAmount + taxAmount) * 100) / 100;
    const createdAt = new Date(Date.now() - ord.daysAgo * 86400000);

    const order = await prisma.order.create({
      data: {
        businessId: business.id,
        customerId: ord.customer.id,
        orderNumber: ord.orderNumber,
        subtotal,
        discountAmount: ord.discountAmount,
        taxAmount,
        totalAmount,
        status: 'DELIVERED',
        createdAt,
        updatedAt: createdAt,
        items: {
          create: itemsData,
        },
        payments: {
          create: {
            amount: totalAmount,
            method: ord.paymentMethod,
            status: 'COMPLETED',
            receivedAt: createdAt,
          },
        },
      },
    });

    // Record sales transactions
    for (const item of itemsData) {
      await prisma.inventoryTransaction.create({
        data: {
          businessId: business.id,
          productId: item.productId,
          type: 'SALE',
          quantityDelta: -item.quantity,
          previousQuantity: 50,
          newQuantity: 50 - item.quantity,
          referenceId: order.id,
          notes: `POS Sale Order #${ord.orderNumber}`,
          performedById: owner.id,
          createdAt,
        },
      });
    }
  }

  // 9. Create Promotional Offers
  await prisma.offer.create({
    data: {
      businessId: business.id,
      title: 'Ugadi Festival Kirana Mega Offer',
      description: 'Flat 10% discount on all grains, Atta, and pulses for festive celebrations.',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 30),
      eligibleCategories: JSON.stringify(['Staples & Grains', 'Oils & Dairy']),
      eligibleProducts: JSON.stringify([]),
      isActive: true,
    },
  });

  await prisma.offer.create({
    data: {
      businessId: business.id,
      title: 'Weekend Ghee & Coffee Combo Saver',
      description: 'Get ₹50 instant deduction on combo purchase of Nandini Ghee + Filter Coffee Blend.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 14),
      eligibleCategories: JSON.stringify([]),
      eligibleProducts: JSON.stringify([createdProducts[1].id, createdProducts[5].id]),
      isActive: true,
    },
  });

  // 10. Create Real-Time Notifications
  await prisma.notification.create({
    data: {
      businessId: business.id,
      type: 'OUT_OF_STOCK',
      title: 'Inventory Alert: Tata Crystal Salt is Out of Stock',
      message: 'Zero stock units remaining for Tata Salt Crystal Iodized 1kg. Recommended reorder: 40 units.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      businessId: business.id,
      type: 'OUT_OF_STOCK',
      title: 'Inventory Alert: Nandini Table Butter is Out of Stock',
      message: 'Zero stock units remaining for KMF Nandini Butter 500g. Dairy distributor delivery expected tomorrow.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      businessId: business.id,
      type: 'LOW_STOCK',
      title: 'Low Stock Buffer: Byadagi Red Chilli',
      message: 'Only 7 packets of Byadagi Chilli remaining. Stock has fallen below minimum safety threshold (12 packets).',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      businessId: business.id,
      type: 'SALES_MILESTONE',
      title: 'Daily Sales Target Reached',
      message: 'Congratulations! Your Kirana store reached ₹15,000+ in sales today with 100% digital cash/UPI reconciliation.',
      isRead: true,
    },
  });

  console.log('✅ Digital Kirana database seeded successfully with authentic Karnataka store data!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

