const transporter = require("@config/mailer");

const sender = "时雨博客 <1152818861@qq.com>";
// 发送邮件
async function sendMail(to, subject, text, html) {
	try {
		const info = await transporter.sendMail({
			from: sender,
			to,
			subject,
			text,
			html,
		});
		console.log("邮件已发送:", info.messageId);
		return true;
	} catch (error) {
		console.error("发送邮件失败:", error);
		return false;
	}
}
module.exports = sendMail;
