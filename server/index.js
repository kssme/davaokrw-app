const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/auth'); // ← 이 줄 추가

app.use(express.json());
app.use(express.static('public'));
app.use('/auth', authRoutes); // ← 이 줄 추가

app.get('/', (req, res) => {
  res.send('서버가 실행 중입니다!');
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
