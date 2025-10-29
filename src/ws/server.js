const { Server } = require("socket.io");

// 导出WebSocket初始化函数
module.exports = function initializeWebSocket(server) {
	// 配置Socket.io
	const io = new Server(server, {
		cors: {
			origin: process.env.FRONTEND_URL || "http://localhost:5173",
			methods: ["GET", "POST"],
		},
	});

	// 存储在线用户
	const onlineUsers = new Map();

	// 处理连接事件
	io.on("connection", async (socket) => {
		console.log(`客户端连接: ${socket.id}`);
		// 用户登录
		socket.on("user_login", (username) => {
			onlineUsers.set(socket.id, username);
			io.emit("user_status", {
				online: Array.from(onlineUsers.values()),
				message: `${username} 已上线`,
			});
		});

		// 获取历史消息
		socket.on("get_history", async (limit = 20) => {
			try {
				const [rows] = await dbConnection.execute(
					"SELECT * FROM messages ORDER BY created_at DESC LIMIT ?",
					[limit]
				);
				socket.emit("history_messages", rows.reverse());
			} catch (error) {
				console.error("获取历史消息失败:", error);
				socket.emit("error", "获取历史消息失败");
			}
		});

		// 接收消息并广播
		socket.on("send_message", async (data) => {
			try {
				// 保存消息到数据库
				const [result] = await dbConnection.execute(
					"INSERT INTO messages (username, content, created_at) VALUES (?, ?, NOW())",
					[data.username, data.content]
				);

				// 获取完整消息记录
				const [newMessage] = await dbConnection.execute(
					"SELECT * FROM messages WHERE id = ?",
					[result.insertId]
				);

				// 广播给所有用户
				io.emit("new_message", newMessage[0]);
			} catch (error) {
				console.error("消息处理失败:", error);
				socket.emit("error", "发送消息失败");
			}
		});

		// 断开连接处理
		socket.on("disconnect", async () => {
			console.log(`客户端断开: ${socket.id}`);

			// 移除在线用户
			const username = onlineUsers.get(socket.id);
			if (username) {
				onlineUsers.delete(socket.id);
				io.emit("user_status", {
					online: Array.from(onlineUsers.values()),
					message: `${username} 已下线`,
				});
			}
		});
	});

	console.log("WebSocket 服务已初始化");
	return io;
};
