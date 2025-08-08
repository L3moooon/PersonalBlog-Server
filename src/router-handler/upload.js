const OSS = require('ali-oss')
const fs = require('fs');
const path = require('path');
const ossConfig = require('@config/oss')

// 初始化OSS客户端
const client = new OSS(ossConfig)

// 上传文件到OSS
exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }
    const localFilePath = req.file.path;
    const fileExt = path.extname(req.file.originalname);

    // 根据文件类型设置OSS中的存储路径
    const fileType = req.file.mimetype.startsWith('image/') ? 'images' : 'videos';
    const ossFilePath = `${fileType}/${Date.now()}${fileExt}`;

    // 上传文件到OSS
    const result = await client.put(ossFilePath, localFilePath);
    console.log(result);

    // 删除本地临时文件
    fs.unlinkSync(localFilePath);
    // 返回上传结果，包含文件URL
    return res.json({
      status: 1,
      message: '文件上传成功',
      data: {
        name: req.file.originalname,
        url: result.url,
      }
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({
      message: '文件上传失败',
      error: error.message
    });
  }
}