const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send("Express Gateway is Running!");
});

app.use('/api', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''
    }
}));

app.listen(PORT, () => {
    console.log('Express server is live at http://localhost:' + PORT);
});