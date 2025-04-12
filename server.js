const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件目录
app.use(express.static(__dirname));

// 主路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 设置端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 