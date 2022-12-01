var fs = require("fs");
var appdata = process.env.APPDATA;
var root_folder = appdata + "\\橘子树工作室\\chat";
var options_file = root_folder + "\\options.json";
var options = {};

document.addEventListener("DOMContentLoaded", (e) => {
    document.querySelector("#save").addEventListener("click", (e) => {
        JSON.parse(fs.readFileSync(options_file).toString("utf-8"), (key, value) => {
            console.log("读取配置文件", key, value);
            options[key] = value;
        });
        options.theme = document.querySelector("#theme").value;
        fs.writeFileSync(options_file, JSON.stringify(options));
        document.querySelector("#save").innerText = "保存修改 - 成功";
    })
})