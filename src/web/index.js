var METADATA = {
    version_id: "@#y!h(d^l?",
    separator: "：",
    server: "ws://111.67.198.246:5355",
    account_server: "ws://111.67.198.246:1145",
    heartbeat: "HeartBeat",
    file_regxp: /^我发了一个文件，下载(链接|连接)是（.+）$/,
    login_error:
        '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=333750&auto=1&height=66"></iframe>',
    websocket_error: "无法连接至服务器，请联系站长",
    loading_button: "正在进行操作，需要3-5秒时间，请不要多点",
};
var last_time = "00:00";
var username = "Unknown";
var readonly = true;
var fs = require("fs");
var appdata = process.env.APPDATA;
var root_folder = appdata + "\\橘子树工作室\\chat";
var options_file = root_folder + "\\options.json";
var options = {};

document.addEventListener("DOMContentLoaded", (e) => {
    //#region 链接websocket
    console.log(METADATA.server);
    var ws = new WebSocket(METADATA.server);
    ws.addEventListener("open", (e) => {
        setInterval(() => {
            heartbeat(ws);
        }, 10000);
    });
    ws.addEventListener("message", (e) => {
        var user = e.data.split(METADATA.separator)[0] || "匿名用户";
        var content = e.data.split(METADATA.separator)[1];
        add(user, content, user === username);
    });
    ws.addEventListener("error", (e) => {
        alert(METADATA.websocket_error);
    });
    //#endregion
    //#region 处理dom事件
    document.body.addEventListener("keyup", (e) => {
        if (e.key === "v") {
            heartbeat(ws);
        }
    });
    function _() {
        // 临时函数：发送输入框中的消息
        if (readonly) {
            alert("当前为未登录模式，请登录后发送消息");
        } else {
            send(ws, username, document.querySelector("#input > input").value);
            document.querySelector("#input > input").value = "";
        }
    }
    document.querySelector("#input > button").addEventListener("click", _);
    document
        .querySelector("#input > input")
        .addEventListener("keydown", (e) => {
            // 回车发送
            if (e.key === "Enter") {
                _();
            }
        });
    document.querySelector("#login_btn").addEventListener("click", (e) => {
        // 登录按钮
        document.querySelector("#login_btn").innerText =
            "登录 - " + METADATA.loading_button;
        document.querySelector("#login_btn").setAttribute("disabled", "");
        setTimeout(() => {
            login(
                document.querySelector("#username").value,
                document.querySelector("#password").value
            );
            document.querySelector("#login_btn").innerText = "登录";
            document.querySelector("#login_btn").removeAttribute("disabled");
        }, 2000);
    });
    document.querySelector("#register_btn").addEventListener("click", (e) => {
        // 注册按钮
        document.querySelector("#register_btn").innerText =
            "注册 - " + METADATA.loading_button;
        document.querySelector("#register_btn").setAttribute("disabled", "");
        setTimeout(() => {
            register(
                document.querySelector("#username").value,
                document.querySelector("#password").value
            );
            document.querySelector("#register_btn").innerText = "注册";
            document.querySelector("#register_btn").removeAttribute("disabled");
        }, 2000);
    });
    document.querySelector("#readonly_btn").addEventListener("click", (e) => {
        // 不登录按钮
        document.querySelector("#login").style.display = "none";
    });
    //#endregion
    //#region 处理fs相关信息
    try {
        fs.mkdirSync(appdata + "\\橘子树工作室");
        fs.mkdirSync(appdata + "\\橘子树工作室\\chat");
    } catch {}
    try {
        JSON.parse(fs.readFileSync(options_file).toString("utf-8"), (key, value) => {
            console.log("读取配置文件", key, value);
            options[key] = value;
        });
    } catch {
        fs.writeFileSync(options_file, '{"修改前必看": "这是橘子树 Chat 1.0-node(仅此分支) 版本以上的配置文件，编码为 UTF-8，保存时请确认编码为 UTF-8"}');
        window.location.reload();
    }
    //#endregion
});

function heartbeat(ws) {
    console.log("heartbeat");
    ws.send(METADATA.heartbeat);
}
function format_time(date) {
    return date.toTimeString().substring(0, 5);
}
function add(user, content, me) {
    var type = me ? "me" : "msg";
    var el = document.createElement("div");
    el.classList.add(type);
    if (content.match(METADATA.file_regxp)) {
        var file = content.substring(14, content.length - 1);
        file = file.startsWith("http") ? file : `http://${file}`;
        file = file.replace(":8080", ":86");
        el.innerHTML = `<a href="${file}" target="_blank">查看文件</a><details><summary>预览</summary><iframe src="${file}" frameborder="0">无法预览文件</iframe></details>`;
    } else {
        el.innerText = content;
    }
    el.setAttribute("user", user);
    if (last_time !== format_time(new Date())) {
        var el_time = document.createElement("div");
        el_time.classList.add("info");
        el_time.innerText = format_time(new Date());
        document.querySelector("#messages").append(el_time);
        last_time = format_time(new Date());
    }
    document.querySelector("#messages").append(el);
    var messages = document.querySelectorAll("#messages > div");
    for (var msg of messages) {
        if (msg.hasAttribute("user")) {
            if (msg.classList.contains("msg")) {
                msg.setAttribute(
                    "style",
                    `--user: "[ ${msg.getAttribute("user")} ] :";`
                );
            } else if (msg.classList.contains("me")) {
                msg.setAttribute(
                    "style",
                    `--user: ": [ ${msg.getAttribute("user")} ]";`
                );
            }
        }
    }
    document.querySelector("#messages").scrollTop =
        document.querySelector("#messages").scrollHeight;
}
function send(ws, username, message) {
    ws.send(username + METADATA.version_id + message);
}
function login(user, password) {
    var wsa = new WebSocket(METADATA.account_server);
    wsa.addEventListener("open", (e) => {
        console.log(`登录<@*%*@>${user}<@*%*@>${password}`);
        wsa.send(`登录<@*%*@>${user}<@*%*@>${password}`);
    });
    wsa.addEventListener("error", (e) => {
        alert(METADATA.websocket_error);
    });
    wsa.addEventListener("message", (e) => {
        console.log(e.data);
        if (e.data === "<*假*>") {
            document.querySelector("#login_btn").innerText = "登录 - 登录失败";
            var el = document.createElement("div");
            el.innerHTML = METADATA.login_error;
            document.querySelector("#login > .inner").append(el);
        } else {
            username = user;
            readonly = false;
            document.querySelector("#login").style.display = "none";
        }
    });
}
function register(username, password) {
    var wsa = new WebSocket(METADATA.account_server);
    wsa.addEventListener("open", (e) => {
        console.log(`注册<@*%*@>${username}<@*%*@>${password}`);
        wsa.send(`注册<@*%*@>${username}<@*%*@>${password}`);
        alert("注册成功");
    });
    wsa.addEventListener("error", (e) => {
        alert(METADATA.websocket_error);
    });
}
