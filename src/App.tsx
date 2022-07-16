import * as React from "react";
import { Editor } from "@bytemd/react";
import gfm from "@bytemd/plugin-gfm";
import { listen } from "@tauri-apps/api/event";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { dialog } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import "bytemd/dist/index.css";
import "./App.css";

interface Payload {
    path: string;
    content: string;
}

export default class App extends React.Component {
    state = {
        value: "",
    };

    plugins = [gfm()];

    locale = {
        fullscreen: "全屏",
    };

    filePath: string = "";

    async componentDidMount() {
        await appWindow.onMenuClicked(({ payload: menuId }) => {
            console.log("Menu clicked: " + menuId);
        });
        // 如果触发了两次事件，看这里
        // https://juejin.cn/post/6844904084768587790
        await listen("open_file", (event) => {
            this.filePath = (event.payload as Payload).path;
            let text = (event.payload as Payload).content;
            this.setState({ value: text });
        });
        // save file
        listen("save_file", async () => {
            if (this.filePath === "") {
                return await this.saveFileAs({});
            }
            await writeTextFile(this.filePath, this.state.value, {
                dir: BaseDirectory.Home,
            });
        });
        // save file as
        listen("save_as", async () => {
            let opt = {};
            if (this.filePath !== "") {
                opt = { defaultPath: this.filePath };
            }
            await this.saveFileAs(opt);
        });
    }

    async saveFileAs(opt: dialog.SaveDialogOptions) {
        this.filePath = await dialog.save(opt);
        // 写入文件
        await writeTextFile(this.filePath, this.state.value, {
            dir: BaseDirectory.Home,
        });
        // 修改窗口标题
        appWindow.setTitle(this.filePath.split("/").pop() as string);
    }

    public render() {
        return (
            <Editor
                mode={"auto"}
                locale={this.locale}
                value={this.state.value}
                plugins={this.plugins}
                onChange={(v) => this.setState({ value: v })}
            />
        );
    }
}
