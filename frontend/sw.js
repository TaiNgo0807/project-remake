// Cài đặt bù nhìn cho có lệ
self.addEventListener("install", (e) => {
  console.log("[Service Worker] Đã cài đặt hoàn tất!");
  self.skipWaiting();
});

// Khi app gọi mạng thì cứ cho gọi bình thường, không cản
self.addEventListener("fetch", (e) => {
  // Không làm gì cả, lách luật thành công =))
});
