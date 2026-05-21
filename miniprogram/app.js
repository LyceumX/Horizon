App({
  onLaunch() {
    // 小程序启动时的全局初始化
    console.log("Horizon Zero 小程序启动");
  },

  globalData: {
    // 你的 Vercel 部署域名，请替换为实际地址
    // 示例: "https://horizon-zero.vercel.app"
    webUrl: "https://YOUR_VERCEL_DOMAIN"
  }
});
