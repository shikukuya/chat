const METADATA = {
  version_id: "@#y!h(d^l?",
  separator: "：",
  server: "ws://111.67.198.246:5355",
  heartbeat: "HeartBeat",
  file_regxp: /^我发了一个文件，下载(链接|连接)是（.+）$/,
};
last_time = "00:00";

document.addEventListener("DOMContentLoaded", (e) => {
  console.log(METADATA.server);
  var ws = new WebSocket(METADATA.server);
  login(ws);
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
    alert("发生错误");
  });
  // -----
  document.body.addEventListener("keyup", (e) => {
    if (e.key === "v") {
      heartbeat(ws);
    }
  });
  function _() {
    // 临时函数
    send(ws, username, document.querySelector("#input > input").value);
    document.querySelector("#input > input").value = "";
  }
  document.querySelector("#input > button").addEventListener("click", _);
  document.querySelector("#input > input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      _();
    }
  });
  document.querySelector("#theme").addEventListener("change", (e) => {
    document.querySelector("html").className = document.querySelector("#theme").value;
  });
  document.querySelector("#login_btn").addEventListener("click", (e) => {
    if (hcaptcha.getResponse() === "") {
      document.querySelector("#login_btn").innerText = "登录 - 请先完成 hCaptcha 验证"
    } else {
      fetch()
    }
  })
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
    file = file.startsWith("http") ? file : `http://${file}`
    file = file.replace(":8080", ":86");
    el.innerHTML = `<a href="${file}" target="_blank">查看文件</a><details><summary>预览</summary><iframe src="${file}" frameborder="0">无法预览文件</iframe></details>`
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
function login(ws) {
  
}
