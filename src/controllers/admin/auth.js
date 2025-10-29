const IP2Region = require("ip2region").default;
const IPquery = new IP2Region();
const jwt = require("jsonwebtoken");
const { secretKey } = require("@config/jwt"); // 引入固定密钥
const { query } = require("@config/db-util");
const redisClient = require("@config/redis");
const transporter = require("@config/mailer");
//管理员登录
exports.login = async (req, res) => {
	const { type } = req.body;
	let userInfo;
	let loginAccount;
	try {
		//账号密码登录
		if (type == "account") {
			const { account, password } = req.body;
			if (!account || !password) {
				// 输入验证
				return res.status(400).json({ code: 0, msg: "邮箱和密码是必需的" });
			}
			loginAccount = account; // 记录登录账号
			const sqlStringl = `
        SELECT 
          a.id as user_id, 
          a.name,
          p.permission_type,
          p.path,
          p.component,
          p.permission_code
        FROM admin_account a
        LEFT JOIN account_role_relation ar ON a.id = ar.user_id
        LEFT JOIN admin_role r ON ar.role_id = r.id
        LEFT JOIN role_permission_relation rp ON r.id = rp.role_id
        LEFT JOIN admin_permission p ON rp.permission_id = p.id
        WHERE a.account = ? AND a.password = ?
      `;
			userInfo = await query(sqlStringl, [account, password]);
			if (userInfo.length === 0) {
				return res.json({ code: 0, msg: "用户名或密码错误" });
			}
		} else if (type == "email") {
			const { email, captcha } = req.body;
			if (!email || !captcha) {
				return res.status(400).json({ code: 0, msg: "邮箱和验证码不能为空" });
			}
			loginAccount = email; // 记录登录账号（邮箱即账号）
			// 从Redis获取存储的验证码
			const storedCode = await redisClient.get(`verification:${email}`);
			if (!storedCode) {
				return res
					.status(400)
					.json({ code: 0, msg: "验证码已过期，请重新获取" });
			}
			if (storedCode !== captcha) {
				return res.status(400).json({ code: 0, msg: "验证码不正确" });
			}
			// 验证码正确，执行登录逻辑
			await redisClient.del(`verification:${email}`); // 清除已使用的验证码
			const userSql = "SELECT * FROM admin_account WHERE account = ?";
			const userResult = await query(userSql, [email]);
			// 该邮箱首次登录自动注册，将新用户存入admin_account表中
			if (userResult.length === 0) {
				// 插入新用户
				const insertSql =
					"INSERT INTO admin_account (account,name，password) VALUES (?,?,NULL)";
				const insertResult = await query(insertSql, [email, email]);
				const assignRoleSql =
					"INSERT INTO account_role_relation (user_id, role_id) VALUES (?, ?)";
				await query(assignRoleSql, [insertResult.insertId, 4]); // 默认角色ID-游客
			}
			const sqlStringl = `
          SELECT 
            a.id as user_id, 
            a.name,
            p.permission_type,
            p.path,
            p.component,
            p.permission_code
          FROM admin_account a
          LEFT JOIN account_role_relation ar ON a.id = ar.user_id
          LEFT JOIN admin_role r ON ar.role_id = r.id
          LEFT JOIN role_permission_relation rp ON r.id = rp.role_id
          LEFT JOIN admin_permission p ON rp.permission_id = p.id
          WHERE a.account = ?
        `;
			userInfo = await query(sqlStringl, [email]);
		} else {
			return res.status(400).json({ code: 0, msg: "不支持的登录类型" });
		}
		//通用登录逻辑
		if (!userInfo || userInfo.length === 0) {
			return res.status(500).json({ code: 0, msg: "获取用户信息失败" });
		}
		const { user_id, name } = userInfo[0];
		const permission = {
			routeKeys: [],
			componentKeys: [],
			buttonKeys: [],
		};
		console.log(userInfo);
		userInfo.map((item) => {
			switch (item.permission_type) {
				case 1:
					permission.routeKeys.push(item.path);
					break;
				case 2:
					permission.componentKeys.push(item.component);
					break;
				case 3:
					permission.buttonKeys.push(item.permission_code);
					break;
				default:
					break;
			}
		});
		const token = jwt.sign({ user_id }, secretKey, { expiresIn: "168h" });
		await redisClient.set(
			`user:session:${token}`,
			JSON.stringify({
				user_id,
				permission,
				loginTime: new Date().toISOString(),
			}),
			{ EX: 604800 } // 一周过期
		);
		//登录成功时获取ip地址
		const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
		const address = JSON.stringify(IPquery.search(ip));
		//将ip数据添加到数据库
		const sqlString2 =
			"UPDATE admin_account SET ip = ?, location = ? ,last_login_time = CURRENT_TIMESTAMP WHERE account = ?";
		await query(sqlString2, [ip, address, loginAccount]);
		console.log(permission);
		return res.json({
			code: 1,
			token,
			user: {
				name,
				permission,
			},
		});
	} catch (error) {
		handleError(res, error);
	}
};

//管理员注册-默认角色为游客
exports.register = async (req, res) => {
	const { account, password, name } = req.body;
	try {
		// 检查邮箱是否已存在
		const checkSql = "SELECT * FROM admin_account WHERE account = ?";
		const checkResult = await query(checkSql, [account]);
		if (checkResult.length > 0) {
			return res.json({ status: 0, message: "该邮箱已被注册" });
		}
		// 插入新用户
		const insertSql =
			"INSERT INTO admin_account (account, password, name) VALUES (?, ?, ?)";
		const insertResult = await query(insertSql, [account, password, name]);
		// 为新用户分配默认角色
		const defaultRoleId = 4; // 默认角色ID-游客
		const assignRoleSql =
			"INSERT INTO account_role_relation (user_id, role_id) VALUES (?, ?)";
		await query(assignRoleSql, [insertResult.insertId, defaultRoleId]);
		res.json({ code: 1, msg: "注册成功" });
	} catch (error) {
		handleError(res, error);
	}
};
//忘记密码

// 生成6位数字验证码
function generateVerificationCode() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}
// 发送验证码到邮箱
async function sendVerificationCode(email, code) {
	try {
		const info = await transporter.sendMail({
			from: '"时雨博客" <1152818861@qq.com>',
			to: email,
			subject: "登录验证码",
			text: `你的登录验证码是: ${code}，有效期5分钟。`,
			html: `<p>你的登录验证码是: <strong>${code}</strong>，有效期5分钟。</p>`,
		});

		console.log("验证码邮件已发送:", info.messageId);
		return true;
	} catch (error) {
		console.error("发送邮件失败:", error);
		return false;
	}
}
//获取邮箱验证码
exports.getEmailCaptcha = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ msg: "邮箱地址不能为空" });
		}
		// 生成验证码
		const code = generateVerificationCode();
		// 存储验证码到Redis，设置5分钟过期
		await redisClient.set(
			`verification:${email}`,
			code,
			{ EX: 300 } // 300秒 = 5分钟
		);

		// 发送验证码邮件
		const emailSent = await sendVerificationCode(email, code);
		if (emailSent) {
			res.json({ code: 1, msg: "验证码已发送到你的邮箱，请注意查收" });
		} else {
			res.status(500).json({ code: 0, msg: "发送验证码失败，请稍后重试" });
		}
	} catch (error) {
		console.error("发送验证码过程出错:", error);
		res.status(500).json({ msg: "服务器错误，请稍后重试" });
	}
};

// 统一错误处理函数
const handleError = (res, error) => {
	return res.send({ code: 0, msg: error.message });
};
