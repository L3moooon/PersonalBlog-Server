const data = [
  {
    id: 1,
    title: "这是一个普通的标题",
    content:
      "这是一段废话，大大大大大大大大大大大大大大大大大大大大大大大的",
    time: "13394194952",
    tag: 'game',
    author: "willi",
    comment: { username: "jerry", content: "233333", reply: "" },
    read: 2000,
    img: "/",
  },
];

// app.get('/home', (req, res) => {
//   res.status(200).json({ data });
// });
// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/home', (req, res) => {
  res.status(200).json({ data });
});

module.exports = router;