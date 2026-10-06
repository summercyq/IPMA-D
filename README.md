# IPMA Lab 專案管理練習室

313 題選擇題與 30 題計算題，取自使用者提供的兩份 IPMA-D PDF。使用繁體中文、響應式介面，支援搜尋、題號跳轉、隨機順序、收藏、錯題複習及瀏覽器本機進度儲存。

## 啟動

需要 Node.js 18 或更新版本，不需安裝 npm 依賴。

```sh
npm start
```

預設連接埠 3000；可透過 PORT 環境變數設定。`public/` 也可直接部署到靜態網頁主機。請透過 HTTP 開啟，以便載入題庫。

## 驗證

```sh
npm test
```

選擇題點選後即依 PDF 標準答案判分；313 題皆有本站補充的專案管理知識解析，38 題另附題意、版本或答案疑義提醒。原題答案保留供對照，解析不冒充認證機構官方答案。參考框架列於 `public/references.html`，解析資料為 `public/explanations.json`。計算題以原 PDF 裁圖保留公式及圖表，需作答者自行核對解答並評分。正確率反映各題最近一次作答，自評題與選擇題分開統計。進度僅存於目前瀏覽器，未同步到其他裝置。

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
