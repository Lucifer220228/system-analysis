# 前端自動化測試（Jest）

本專案建議使用 [Jest](https://jestjs.io/) 進行 JavaScript 單元測試。

## 安裝 Jest

1. 於專案根目錄執行：
   ```
   npm install --save-dev jest
   ```
2. 於 `package.json` 新增測試指令：
   ```json
   "scripts": {
     "test": "jest"
   }
   ```

## 撰寫測試

- 建議於 `frontend/` 目錄下建立 `__tests__/` 資料夾，撰寫 `*.test.js` 檔案。
- 例如：
  ```js
  // frontend/__tests__/sum.test.js
  const sum = (a, b) => a + b;
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
  ```

## 執行測試

```
npm test
```

---

如需更多 Jest 用法，請參考官方文件：https://jestjs.io/zh-Hant/docs/getting-started
