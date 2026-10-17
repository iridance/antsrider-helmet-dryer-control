# NA ANTSRIDER 安全帽風乾消毒機 控制頁

用瀏覽器直接以藍牙（Web Bluetooth）控制 NA ANTSRIDER 安全帽風乾消毒機，不需要微信小程序。

**線上使用：<https://iridance.github.io/antsrider-helmet-dryer-control/>**

## 功能

- 風力：關閉、1 到 10 檔
- 定時：5 分鐘到 4 小時的常用選項
- 紫外線殺菌：開／關
- 自動連線、繁體中文／English 切換、四種主題色（螢光綠、粉、藍綠、橘）

## 使用方式

1. 使用 Android 或電腦版 Chrome／Edge（iPhone 的 Safari 不支援 Web Bluetooth）。
2. 先關閉手機上微信小程序的連線，設備同一時間只接受一個連線。
3. 開啟上方網址，點「連線設備」，選擇 `KT6328A-BLE-2.1`。

## 通訊協定

設備為 BLE 低功耗藍牙，服務 `0xFFF0`，指令以無回應寫入送到特徵值 `0xFFF1`：

| 功能 | 指令 |
| --- | --- |
| 風力 0 到 10 | `AA 01 <檔位>` |
| 定時（分鐘，16 位元） | `AA 02 <高位元組> <低位元組>` |
| 紫外線 | `AA 03 00 00 <1 開／0 關>` |

`0xFFF2` 為通知特徵值，頁面會把設備回傳的資料顯示在「trace log」。

## 本機執行

純靜態頁面，無需建置。用 Chrome 直接開啟 `site/index.html`，或在專案目錄執行 `python -m http.server -d site 8000` 後開 `http://localhost:8000`。

## 部署

推送版本 tag（例如 `v1.0.0`）後，GitHub Actions 才會部署 `site/` 到 GitHub Pages，頁尾的 version 即為 tag 版本號；推送 `main` 不會更新頁面。

```
git tag v1.0.0
git push origin v1.0.0
```

第一次使用請到 repo 的 Settings → Pages，把 Source 設為「GitHub Actions」。

## 聲明

本專案為非官方開發，與 ANTSRIDER 品牌無關聯。使用風險自負。

© [Irice](https://github.com/iridance)，以 [MIT 授權](LICENSE) 釋出。
