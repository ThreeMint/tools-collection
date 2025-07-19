const express = require("express");
const path = require("path");
const fs = require("fs");
const { log } = require("console");
const app = express();
const PORT = 3000;

// 添加 JSON 解析中间件
app.use(express.json());

// 手动设置响应头
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // 允许任意来源
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// GET 请求通常不携带请求体（Body）
/**
 * 下载文件的API（一次性加载）,没有使用流式传输
 *
 *    如果文件很大（比如几百 MB 或几 GB），会占用大量内存。
 *    用户要等整个文件加载完成才能开始接收数据（加载到内存中），用户体验差。
 *    可能导致 Node.js 进程崩溃（OOM - Out of Memory）
 */
app.get("/download", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", "手机壁纸5.rar");
  const fileName = path.basename(filePath);
  const encodedFileName = encodeURIComponent(fileName);
  try {
    const data = fs.readFileSync(filePath); //就像先把整箱书搬到车上再出发
    res.header({
      "Content-Type": "application/x-rar-compressed",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
      "Content-Length": data.length,
    });
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("File not found");
  }
});

app.get("/download-stream", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", "手机壁纸5.rar");

  fs.stat(filePath, fs.constants.F_OK, (err, stat) => {
    if (err) {
      return res.status(404).send("文件不存在");
    }

    const fileName = path.basename(filePath);
    const encodedFileName = encodeURIComponent(fileName);

    res.header({
      "Content-Type": "application/x-rar-compressed", // ✅ 支持 rar 的 MIME 类型
      "Content-Disposition": `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
      "Content-Length": stat.size,
      "Access-Control-Expose-Headers": "Content-Length", // 👈 关键：暴露 Content-Length
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

app.post("/upload", (req, res) => {
  res.send("响应内容");
});

app.listen(PORT, () => {
  console.log(`服务运行成功，在 http://localhost:${PORT}`);
});
