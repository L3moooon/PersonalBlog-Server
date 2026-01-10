const Dypnsapi20170525 = require("@alicloud/dypnsapi20170525");
const OpenApi = require("@alicloud/openapi-client");
const Util = require("@alicloud/tea-util");

const createClient = () => {
	let config = new OpenApi.Config({
		accessKeyId: process.env.ALI_ACCESS_KEY_ID,
		accessKeySecret: process.env.ALI_ACCESS_KEY_SECRET,
	});
	config.endpoint = `dypnsapi.aliyuncs.com`;
	return new Dypnsapi20170525.default(config);
};
//发送手机验证码
exports.send = async (phoneNumber) => {
	let client = createClient();
	let createVerifySchemeRequest = new Dypnsapi20170525.SendSmsVerifyCodeRequest(
		{
			signName: "速通互联验证码",
			templateCode: "100001",
			templateParam: '{"code":"##code##","min":"5"}',
			phoneNumber,
		}
	);
	try {
		let resp = await client.sendSmsVerifyCodeWithOptions(
			createVerifySchemeRequest,
			new Util.RuntimeOptions({})
		);
		console.log(resp.body.code == "OK");
		return resp.body.code == "OK";
	} catch (error) {
		console.log(error.message);
		console.log(error.data["Recommend"]);
	}
};

//验证手机验证码
exports.check = async (phoneNumber, verifyCode) => {
	let client = createClient();
	let checkSmsVerifyCodeRequest =
		new Dypnsapi20170525.CheckSmsVerifyCodeRequest({
			phoneNumber,
			verifyCode,
		});
	try {
		let resp = await client.checkSmsVerifyCodeWithOptions(
			checkSmsVerifyCodeRequest,
			new Util.RuntimeOptions({})
		);
		return resp.body.code == "OK";
	} catch (error) {
		console.log(error.message);
		console.log(error.data["Recommend"]);
	}
};
