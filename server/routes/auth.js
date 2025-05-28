const express = require('express');
const router = express.Router();

let users = [];

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
  }
  users.push({ username, password });
  res.json({ message: '회원가입 성공!' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    res.json({ message: '로그인 성공!' });
  } else {
    res.status(401).json({ message: '로그인 실패. 사용자 정보를 확인하세요.' });
  }
});

module.exports = router;
