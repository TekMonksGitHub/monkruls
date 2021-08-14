/**
 * (C) 2020 TekMonks. All rights reserved.
 *
 * Admin login
 */
const fspromises = require("fs").promises; 
const cryptMod = require(CONSTANTS.LIBDIR+"/crypt.js");
const ADMIN_JSON = `${APP_CONSTANTS.CONF_DIR}/admin.json`;
const LOGIN_REG_DISTM_KEY = "__org_monkshu_loginregistry_key";

exports.doService = async jsonReq => {
	if (jsonReq && (!jsonReq.op)) jsonReq.op = "login";
	if (!validateRequest(jsonReq)) {LOG.error(`Bad login request ${jsonReq?JSON.stringify(jsonReq):"null"}.`); return CONSTANTS.FALSE_RESULT;}

	const loginReg = CLUSTER_MEMORY.get(LOGIN_REG_DISTM_KEY) || JSON.parse(await fspromises.readFile(ADMIN_JSON));
	if (!CLUSTER_MEMORY.get(LOGIN_REG_DISTM_KEY)) CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);

	if (jsonReq.op.toLowerCase() == "add") return {result: await _addAdmin(jsonReq.id, jsonReq.pw, loginReg)};
	else if (jsonReq.op.toLowerCase() == "delete") return {result: await _deleteAdmin(jsonReq.id, loginReg)};
	else if (jsonReq.op.toLowerCase() == "login") return {result: _loginAdmin(jsonReq.id, jsonReq.pw, loginReg)};
	else if (jsonReq.op.toLowerCase() == "changepw") return {result: await _changeAdminPw(jsonReq.id, jsonReq.oldpw, jsonReq.newpw, loginReg)};
	else {LOG.error(`Unkown admin ID operation in request: ${jsonReq?JSON.stringify(jsonReq):"null"}.`); return CONSTANTS.FALSE_RESULT};
}

const _loginAdmin = (id, pw, loginReg) => (loginReg[id] && cryptMod.decrypt(loginReg[id]) == pw);

async function _addAdmin(id, pw, loginReg) {
	if (loginReg[id]) {LOG.error(`Admin ID ${id} to be added already exists.`); return false;} else loginReg[id] = cryptMod.encrypt(pw);
	await fspromises.writeFile(ADMIN_JSON, JSON.stringify(loginReg, null, 4));
	CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);
	return true;
}

async function _deleteAdmin(id, loginReg) {
	if (!loginReg[id]) {LOG.error(`Admin ID ${id} to be deleted doesn't exist.`); return false;} else delete loginReg[id];
	await fspromises.writeFile(ADMIN_JSON, JSON.stringify(loginReg, null, 4));
	CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);
	return true;
}

async function _changeAdminPw(id, oldpw, newpw, loginReg) {
	if (!_loginAdmin(id, oldpw, loginReg)) {LOG.error(`Admin ID ${id}, bad old password for change request.`); return false;}
	loginReg[id] = cryptMod.encrypt(newpw);
	await fspromises.writeFile(ADMIN_JSON, JSON.stringify(loginReg, null, 4));
	CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);
	return true;
}

const validateRequest = jsonReq => jsonReq && jsonReq.id && ( 
	((jsonReq.op.toLowerCase() == "add" || jsonReq.op.toLowerCase() == "login") && jsonReq.pw) || 
	jsonReq.op.toLowerCase() == "delete" ||
	(jsonReq.op.toLowerCase() == "changepw" && jsonReq.oldpw && jsonReq.newpw));