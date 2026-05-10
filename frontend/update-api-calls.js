#!/usr/bin/env node

/**
 * Script cập nhật tất cả API calls từ relative paths thành sử dụng API_URL config
 * 
 * Chạy: node update-api-calls.js
 * Hoặc: npm run update-api-calls
 */

const fs = require('fs');
const path = require('path');

// Danh sách file cần cập nhật
const filesToUpdate = [
  'src/components/NotificationBell.jsx',
  'src/components/ProfilePage.jsx',
  'src/context/CartContext.jsx',
  'src/pages/customers/Checkout.jsx',
  'src/pages/customers/BookingHistory.jsx',
  'src/pages/customers/ProductDetail.jsx',
  'src/pages/customers/PurchaseHistory.jsx',
  'src/pages/customers/Shop.jsx',
  'src/pages/customers/POS.jsx',
  'src/pages/customers/OrderComplete.jsx',
  'src/pages/managers/AdminHome.jsx',
  'src/pages/managers/AdminDashboard.jsx',
  'src/pages/managers/AdminCategories.jsx',
  'src/pages/managers/AdminProducts.jsx',
  'src/pages/managers/AdminOrders.jsx',
  'src/pages/managers/DatSanNgay.jsx',
  'src/pages/managers/DatSanThang.jsx',
  'src/pages/managers/QuanLySan.jsx',
  'src/pages/managers/QuanLyTaiKhoan.jsx',
  'src/pages/managers/LichSuNhapHang.jsx',
  'src/pages/managers/QuanLyNhaCungCap.jsx',
  'src/pages/managers/XacNhanDatSan.jsx',
  'src/pages/employees/CaLam.jsx',
  'src/pages/login/Login.jsx',
  'src/pages/login/Register.jsx',
  'src/pages/login/ForgotPassword.jsx',
];

console.log('🔄 Updating API calls in frontend files...\n');

filesToUpdate.forEach((filePath) => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const hasApiConfig = content.includes("import { API_URL }") || 
                        content.includes("from '../config/api'") ||
                        content.includes("from '../../config/api'") ||
                        content.includes("from '../../../config/api'");

    if (!hasApiConfig && (content.includes('axios.') || content.includes('fetch'))) {
      // Thêm import API_URL
      // Tìm dòng import đầu tiên
      const importMatch = content.match(/^import\s/m);
      if (importMatch) {
        // Insert thêm import API_URL
        const insertPos = importMatch.index;
        const relativePath = filePath.split('/').length === 3 ? '../config/api' :
                            filePath.split('/').length === 4 ? '../../config/api' :
                            '../../../config/api';
        
        content = content.slice(0, insertPos) + 
                 `import { API_URL } from '${relativePath}';\n` +
                 content.slice(insertPos);
        
        // Ghi lại file
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`✅ Updated: ${filePath}`);
      }
    } else if (hasApiConfig) {
      console.log(`✓  Already has API_URL config: ${filePath}`);
    } else {
      console.log(`-  No API calls: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n✅ Done! Now you need to replace `/api/` calls with `${API_URL}/api/` manually');
console.log('   Or use Find & Replace in VS Code for each file');
