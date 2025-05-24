const { app, BrowserWindow, ipcMain, net, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow; // تعریف mainWindow در سطح بالاتر برای دسترسی در صورت نیاز

console.log('[Main Process] اسکریپت main.js شروع به اجرا کرد.');

// این تابع پنجره اصلی برنامه را ایجاد و پیکربندی می‌کند
function createWindow() {
console.log('[Main Process] تابع createWindow فراخوانی شد.');
try {
mainWindow = new BrowserWindow({
width: 1350,
height: 900,
show: false, // ⭐ مهم: پنجره در ابتدا مخفی باشد
icon: path.join(\_\_dirname, 'resources/app\_icon.ico'), // اطمینان از مسیر صحیح آیکون
webPreferences: {
preload: path.join(\_\_dirname, 'preload.js'), // مسیر صحیح به preload.js
nodeIntegration: false, // برای امنیت، false توصیه می‌شود
contextIsolation: true, // برای امنیت، true توصیه می‌شود
sandbox: false,         // در محیط‌های Codespaces با Xvfb، گاهی false لازم است
// فلگ --no-sandbox در خط فرمان نیز همین کار را می‌کند
devTools: true // ابزار توسعه‌دهنده را به طور پیش‌فرض فعال می‌کند (برای دیباگ)
}
});
