const schedule = require('node-schedule');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const ossClient = require('@config/oss')


// 确保备份目录存在
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 执行备份的函数
function backupDatabase() {
  const date = new Date();
  const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

  const filename = `${config.db.database}-${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);

  // 构建mysqldump命令
  const cmd = `mysqldump -h ${config.db.host} -P ${config.db.port} -u ${config.db.user} -p${config.db.password} ${config.db.database} > ${filepath}`;

  console.log(`开始备份数据库到 ${filepath}`);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`备份失败: ${error.message}`);
      return;
    }
    if (stderr) {
      console.warn(`备份警告: ${stderr}`);
    }
    console.log(`备份成功: ${filepath}`);
    // 压缩备份文件
    compressBackup(filepath);
  });
}

// 压缩备份文件
function compressBackup(filepath) {
  const cmd = `gzip ${filepath}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`压缩失败: ${error.message}`);
      return;
    }
    if (stderr) {
      console.warn(`压缩警告: ${stderr}`);
    }

    const compressedFile = `${filepath}.gz`;
    console.log(`压缩成功: ${compressedFile}`);

    // 上传到OSS
    uploadToOSS(compressedFile)
      .then(() => {
        console.log(`成功上传到OSS: ${compressedFile}`);
        // 清理本地文件
        cleanOldBackups();
      })
      .catch(err => {
        console.error(`上传到OSS失败: ${err.message}`);
      });
  });
}

// 上传到OSS
async function uploadToOSS(filepath) {
  try {
    const filename = path.basename(filepath);
    const key = `${config.oss.folder}/${filename}`;

    // 上传文件
    const result = await ossClient.put(key, filepath);
    console.log(`文件已上传到OSS: ${result.url}`);

    // 上传成功后删除本地文件
    fs.unlinkSync(filepath);
    console.log(`已删除本地文件: ${filepath}`);

    return result;
  } catch (err) {
    throw new Error(`OSS上传错误: ${err.message}`);
  }
}

// 清理旧备份
function cleanOldBackups() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.backup.keepDays);

  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error(`读取备份目录失败: ${err.message}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`获取文件信息失败: ${err.message}`);
          return;
        }

        if (stats.isFile() && stats.mtime < cutoffDate) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`删除旧备份失败: ${err.message}`);
              return;
            }
            console.log(`已删除旧备份: ${filePath}`);
          });
        }
      });
    });
  });
}

// 立即执行一次备份（可选）
if (process.argv.includes('--immediate')) {
  backupDatabase();
}

// 定时执行备份任务
const job = schedule.scheduleJob(config.backup.cronTime, backupDatabase);
console.log(`已设置定时备份任务，将在 ${config.backup.cronTime} 执行`);
