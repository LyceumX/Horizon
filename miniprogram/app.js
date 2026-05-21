App({
  onLaunch() {
    // 小程序启动时的全局初始化
    console.log("Horizon Zero 小程序启动");
  },

  globalData: {
    // 中文站域名（微信小程序指向 cn 子域）
    webUrl: "https://cn.horizon.cc.cd"
  }
});
