const { Server } = require("socket.io");

module.exports = function initializeWebSocket(server) {
	const io = new Server(server, {
		cors: {
			origin: [
				`http://localhost:${process.env.FRONTEND_WEB_PORT}`,
				`http://localhost:${process.env.FRONTEND_ADMIN_PORT}`,
				`http://localhost:8080`,
			],
			methods: ["GET", "POST"],
		},
	});
	// 存储在线用户(前台)
	const onlineUsers = new Map();

	const webWS = io.of("/webWS");
	const adminWS = io.of("/adminWS");

	// 前台连接逻辑
	webWS.on("connection", (socket) => {
		console.log("前台客户端连接:", socket.id);
		socket.on("login", (data) => {
			onlineUsers.set(socket.id, data);
			console.log("前台用户操作:", data);
			// 转发消息到后台命名空间
			adminWS.emit("webWS_notify", {
				type: data.type,
				content: data.content,
				time: new Date().toLocaleTimeString(),
			});
			webWS.emit("onlineCount", {
				count: onlineUsers.size,
			});
		});
		// 监听前台发送的消息
		socket.on("operate", (data) => {
			console.log("前台用户操作:", data);
			// 转发消息到后台命名空间
			adminWS.emit("web_notify", {
				type: data.type,
				content: data.content,
				time: new Date().toLocaleTimeString(),
			});
		});
		socket.on("disconnect", () => {
			console.log("前台客户端断开:", socket.id);
			onlineUsers.delete(socket.id); // 移除用户
		});
	});

	// 后台连接逻辑
	adminWS.on("connection", (socket) => {
		console.log("后台客户端连接:", socket.id);
		// 监听后台发送的消息
		socket.on("adminWS_reply", (data) => {
			console.log("后台管理员回复:", data);
			// 转发消息到前台命名空间
			webWS.emit("adminWS_notify", {
				content: data.content,
				time: new Date().toLocaleTimeString(),
			});
		});
		socket.on("disconnect", () => {
			console.log("后台客户端断开:", socket.id);
		});
	});
	console.log("webSocket 服务已初始化");
};
