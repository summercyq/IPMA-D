# IPMA Lab 專案管理練習室

313 題選擇題與 30 題計算題，取自使用者提供的兩份 IPMA-D PDF。使用繁體中文、響應式介面，支援搜尋、題號跳轉、隨機順序、收藏、錯題複習及瀏覽器本機進度儲存。

## 啟動

啟動需要 Node.js 18 或更新版本；已附上建置好的 Firebase SDK，直接執行網站不需安裝 npm 依賴。重新建置 SDK 需 Node.js 20 或更新版本，建議使用 Node.js 24。

```sh
npm start
```

預設連接埠 3000；可透過 PORT 環境變數設定。`public/` 也可直接部署到靜態網頁主機。請透過 HTTP 開啟，以便載入題庫。

## 驗證

```sh
npm test
```

選擇題點選後即依 PDF 標準答案判分；313 題皆有本站補充的專案管理知識解析，38 題另附題意、版本或答案疑義提醒。原題答案保留供對照，解析不冒充認證機構官方答案。參考框架列於 `public/references.html`，解析資料為 `public/explanations.json`。計算題以原 PDF 裁圖保留公式及圖表，需作答者自行核對解答並評分。正確率反映各題最近一次作答，自評題與選擇題分開統計。未登入時進度保存在目前瀏覽器；完成 Firebase 設定並登入 Google 後可跨裝置同步。

`public/choice.pdf` 和 `public/calc.pdf` 提供完整原文核對。題庫包含原資料中的文字、公式或答案疑義，未擅自更改原答案。

`scripts/extract.py` 為轉換記錄，重新產製時需要 Python、pdfplumber、PyMuPDF，並調整 PDF 來源路徑；正常啟動網頁不需 Python 或原附件路徑。

## GitHub Pages 部署

推送到 `main` 後，`.github/workflows/pages.yml` 會驗證題庫並部署 `public/`。首次部署需在 GitHub 儲存庫 Settings → Pages → Build and deployment → Source 選擇 **GitHub Actions**。若首次執行因 Pages 尚未啟用失敗，啟用後在 Actions 重新執行 Deploy IPMA Lab to GitHub Pages。

預期網址為 `https://summercyq.github.io/IPMA-D/`，須以實際部署成功為準。部署內容包括原題庫 PDF。

## 題庫頁面

首頁提供三個入口，均在同一視窗切換到獨立頁面：

- `choice.html`：選擇題作答，點選即判分；篩選與紀錄可展開查看。
- `calc.html`：計算題作答、筆記及自評。
- `answers.html`：直接閱讀選擇題答案與解析、計算題原始解答。每頁 20 題，支援題型、錯題、收藏、關鍵字或精確題號篩選，以及選擇題精簡／完整閱讀。閱讀解答不會改動作答紀錄。

解答頁的「練習這題」可直接連到相應題號。三個頁面共用同一瀏覽器的既有紀錄。

## Google 帳號與跨裝置同步

網站使用 Firebase Authentication（Google）與 Firestore。公開 Web 設定位於 `public/firebase-client.js`，不用服務帳戶私鑰，也不啟用 Analytics。網站管理者需先在 Firebase 啟用 Google、授權 `summercyq.github.io`，建立 `(default)` Firestore，並發布根目錄 `firestore.rules`。完整步驟也可由網站的 `sync-setup.html` 閱讀。規則不會隨 GitHub Pages 部署自動發布。

- 同一 Google 帳號同步作答結果、選項、收藏及計算筆記；不同帳號的本機紀錄分開保存。
- 首次登入會匯入此裝置既有紀錄；以逐欄位修改時間與裝置識別合併，避免整份資料覆寫。裝置時間應正確設定。
- 未登入仍可作答。離線修改保留在本機，連線恢復、重新開啟或按「立即同步」後補傳。
- 登出會回到獨立訪客模式；未傳出的帳號紀錄仍保留在本機，重新登入該帳號後繼續。
- 登入後重設紀錄會同步清除其他裝置的舊紀錄；訪客模式重設不會清掉雲端帳號資料。
- 規則限制每位登入者只能讀寫自己的 `progress/{uid}` 文件；資料庫規則需由專案管理者發布。單一文件受 Firestore 大小與服務額度限制，失敗時不宣稱已同步。

`public/vendor/firebase.js` 是從鎖定版本的官方 npm 套件建置的瀏覽器 SDK，已隨網站保存，正常啟動仍可直接 `npm start`。重建 SDK 時執行 `npm ci && npm run build`；GitHub Actions 也會重建後再測試與發布。Firebase 連線及真實 Google 登入仍需要網路及正確的主控台設定。

`npm test` 包含合併、移轉、清除標記、帳號隔離及模擬後端測試。瀏覽器模擬兩裝置可驗證前端資料交換，但不等於已用真實 Google 帳號驗證 Firebase 設定。
