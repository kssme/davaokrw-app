const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공 (HTML, JS 등)
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우터 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`서버가 실행 중입니다! 포트: ${PORT}`);
});
