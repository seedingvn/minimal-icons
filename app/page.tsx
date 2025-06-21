// File: app/page.tsx

import fs from "fs";
import path from "path";
import IconGrid from "./icon-grid"; // Import component "phòng ăn"

// --- HÀM TRỢ GIÚP ĐỂ TẠO SLUG CHUẨN ---
function slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/\+/g, "plus")
      .replace(/\./g, "dot")
      .replace(/&/g, "and")
      .replace(/đ/g, "d")
      .replace(/ħ/g, "h")
      .replace(/ı/g, "i")
      .replace(/ĸ/g, "k")
      .replace(/ŀ/g, "l")
      .replace(/ł/g, "l")
      .replace(/ß/g, "ss")
      .replace(/ŧ/g, "t")
      // Remove all non-alphanumeric characters except for dashes
      .replace(/[^a-z0-9-]/g, "");
}
// -----------------------------------------

function getIconData() {
  // 1. Đọc file JSON chứa thông tin chi tiết
  const jsonPath = path.join(process.cwd(), "simple-icons.json");
  const jsonFileContent = fs.readFileSync(jsonPath, "utf8");
  const jsonData = JSON.parse(jsonFileContent);
  const iconsData = Array.isArray(jsonData) ? jsonData : jsonData.icons || [];

  // --- TẠO "TỪ ĐIỂN" DỮ LIỆU MỘT CÁCH CHUẨN XÁC ---
  // Key của "từ điển" này sẽ là slug được tạo ra theo đúng quy tắc
  const dataMap = new Map();
  for (const icon of iconsData) {
    // Ưu tiên dùng slug có sẵn trong file JSON, nếu không có thì tạo ra từ title
    const key = icon.slug || slugify(icon.title);
    dataMap.set(key, icon);
  }
  // ----------------------------------------------------

  // 2. Lấy danh sách file SVG làm nguồn chính
  const iconsDirectory = path.join(process.cwd(), "public", "icons");
  const svgFilenames = fs.readdirSync(iconsDirectory);

  // 3. Kết hợp dữ liệu
  const allIcons = svgFilenames
    .map((filename) => {
      if (filename.endsWith(".svg")) {
        const slug = filename.replace(/\.svg$/, "");
        const filePath = path.join(iconsDirectory, filename);
        const svgContent = fs.readFileSync(filePath, "utf8");

        // Tra cứu thông tin bổ sung từ "từ điển" đã tạo
        const extraData = dataMap.get(slug);

        return {
          slug: slug,
          // Nếu tìm thấy trong JSON thì dùng tên chuẩn, nếu không thì dùng tên từ file
          name: extraData ? extraData.title : (slug.charAt(0).toUpperCase() + slug.slice(1)),
          // Nếu tìm thấy trong JSON thì dùng màu chuẩn, nếu không thì dùng màu đen
          color: extraData ? `#${extraData.hex}` : "#000000",
          svgContent: svgContent,
        };
      }
      return null;
    })
    .filter((icon): icon is { slug: string; name: string; color: string; svgContent: string } => icon !== null);

  return allIcons;
}

// Component trang chủ không thay đổi
export default function Page() {
  const allIcons = getIconData();
  return <IconGrid icons={allIcons} />;
}