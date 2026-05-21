const app = getApp();

Page({
  data: {
    webUrl: ""
  },

  onLoad() {
    // 从全局配置读取 Web 端地址
    const webUrl = app.globalData.webUrl;
    if (webUrl && webUrl !== "https://YOUR_VERCEL_DOMAIN") {
      this.setData({ webUrl });
    } else {
      console.warn("webView URL 尚未配置，请在 app.js 中替换 YOUR_VERCEL_DOMAIN");
    }
  },

  onShow() {
    // 页面显示时，如果需要可以刷新
  },

  onWebViewLoad(e) {
    console.log("WebView 加载完成", e);
  },

  onWebViewError(e) {
    console.error("WebView 加载失败", e);
    wx.showToast({
      title: "页面加载失败",
      icon: "none",
      duration: 2000
    });
  },

  onWebViewMessage(e) {
    // 处理来自 H5 页面的 postMessage
    // 可用于将来的小程序原生功能调用（分享、支付等）
    const data = e.detail.data;
    console.log("收到 H5 消息", data);
  }
});
