#! python3
"""
Sapling Studio 橘子树工作室
橘子树 Chat PY 分支
-----
MIT License

Copyright (c) 2022 shikukuya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

from __future__ import annotations
from typing import Callable
from prompt_toolkit import Application
from prompt_toolkit.layout import Layout, HSplit, VSplit, Dimension
from prompt_toolkit.lexers import Lexer
from prompt_toolkit.widgets import TextArea
from prompt_toolkit.key_binding import KeyBindings, KeyPressEvent
from prompt_toolkit.document import Document
from prompt_toolkit.keys import Keys
from prompt_toolkit.formatted_text import StyleAndTextTuples
from websockets.client import connect as wsconnect
from websockets.client import WebSocketClientProtocol
from asyncio import sleep
from re import match


class MessageLexer(Lexer):
    def __init__(self) -> None:
        super().__init__()

    def lex_document(self, document: Document) -> Callable[[int], StyleAndTextTuples]:
        lines = document.lines

        def get_line(lineno: int) -> StyleAndTextTuples:
            "Return the tokens for the given line."
            try:
                t = document.lines[lineno - 1]
                if match(r"^.+……$", t):
                    r = [
                        ("#ffff00", t)
                    ]
                elif match(r"^.+：.+$", t):
                    a = t.split("：")[0]
                    b = "：".join(t.split("：")[1:])
                    r = [
                        ("#81d4fa", a),
                        ("#bbbbbb", "："),
                        ("#ffffff", b)
                    ]
                else:
                    r = [
                        ("#ffffff", t)
                    ]
                return r  # type: ignore
            except IndexError:
                return []

        return get_line


user = TextArea(
    read_only=False,
    focus_on_click=True,
    focusable=True,
    width=Dimension(14, 14),
    height=Dimension(1, 1),
    wrap_lines=False,
    multiline=False
)
recv = TextArea(
    read_only=True,
    focus_on_click=True,
    focusable=True,
    multiline=True,
    lexer=MessageLexer(),
    scrollbar=True
)
send = TextArea(
    read_only=False,
    focus_on_click=True,
    focusable=True,
    height=Dimension(1, 1),
    wrap_lines=False,
    multiline=False,
)
layout = Layout(
    HSplit(
        [
            recv,
            VSplit(
                [
                    VSplit(
                        [user, send],
                        padding_char=" | ",
                        padding=3,
                        padding_style="#ffff00"
                    ),
                    TextArea(
                        "[ENTER] 发送",
                        style="#ffff00",
                        width=Dimension(14, 14)
                    )
                ],
                padding_char=" | ",
                padding=3,
                padding_style="#ffff00"
            )
        ],
        padding_char="—",
        padding=1,
        padding_style="#ffff00"
    )
)
ws: WebSocketClientProtocol = None  # type: ignore

kb = KeyBindings()


@kb.add(Keys.Escape)
async def _(event: KeyPressEvent):
    # 不能close，会超时报错
    # await ws.close()
    event.app.exit()


@kb.add(Keys.Enter)
async def _(event: KeyPressEvent):
    await sendmsg()


@kb.add(Keys.F1)
async def _(event: KeyPressEvent):
    app.layout.focus(recv)


@kb.add(Keys.F2)
async def _(event: KeyPressEvent):
    app.layout.focus(user)


@kb.add(Keys.F3)
async def _(event: KeyPressEvent):
    app.layout.focus(send)


async def task_heartbeat():
    while True:
        await sleep(5)
        await ws.send("HeartBeat")


async def add(msg: str):
    recv.text = recv.text + "\n" + msg


async def sendmsg(username: str | None = None, msg: str | None = None):
    username = username or user.text
    msg = msg or send.text
    await ws.send(username + "@#y!h(d^l?" + msg)


async def connect():
    global ws
    ws = await wsconnect("ws://111.67.198.246:5355", ping_interval=None)
    while True:
        await add(str(await ws.recv()))
        await sleep(0.5)


async def task_background():
    recv.text = "连接成功，ESC退出，F1-F3移动焦点……"
    await connect()


app = Application(layout=layout, full_screen=True, key_bindings=kb)
app.create_background_task(task_background())
app.create_background_task(task_heartbeat())
app.run()
