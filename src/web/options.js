var fs = require("fs");
var appdata = process.env.APPDATA;
var root_folder = appdata + "\\橘子树工作室\\chat";
var options_file = root_folder + "\\options.json";
var options = {};

document.addEventListener("DOMContentLoaded", (e) => {
    options = JSON.parse(fs.readFileSync(options_file).toString("utf-8"));
    document.querySelector("#save").addEventListener("click", (e) => {
        options.theme = document.querySelector("#theme").value;
        (options.autologin || eval("options.autologin = {}; options.autologin;")).username = document.querySelector("#autologin_username").value;
        (options.autologin || eval("options.autologin = {}; options.autologin;")).password = document.querySelector("#autologin_password").value;
        fs.writeFileSync(options_file, JSON.stringify(options));
        document.querySelector("#save").innerText = "保存修改 - 成功";
    });
    document.querySelector(`#theme option[value="${options.theme}"]`).setAttribute("selected", "");
    document.querySelector("#autologin_username").value = (options.autologin || eval("options.autologin = {}; options.autologin;")).username;
    document.querySelector("#autologin_password").value = (options.autologin || eval("options.autologin = {}; options.autologin;")).password;
})