import * as React from "react";
import { Editor } from "@bytemd/react";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import { writeTextFile, BaseDirectory, readTextFile } from "@tauri-apps/api/fs";
import { dialog } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import "bytemd/dist/index.css";
import "github-markdown-css/github-markdown-light.css";
import "./App.css";

interface Payload {
    path: string;
    content: string;
}

export default class App extends React.Component {
    state = {
        value: "",
    };

    plugins = [gfm(), highlight()];

    locale = {
        fullscreen: "全屏",
    };

    allowFolders = {
        dir: BaseDirectory.Home,
    };

    filePath: string = "";

    async componentDidMount() {
        await appWindow.onMenuClicked(async ({ payload: menuId }) => {
            switch (menuId) {
                case "new_file":
                    this.newFile();
                    break;
                case "open_file":
                    this.openFile();
                    break;
                case "save_file":
                    await this.saveFile();
                    break;
                case "save_file_as":
                    await this.saveFileAs();
                    break;
                default:
                    break;
            }
        });

        await appWindow.onFileDropEvent(async (event) => {
            if (event.payload.type === "drop") {
                this.filePath = event.payload.paths[0];
                let text = await readTextFile(this.filePath, this.allowFolders);
                this.setState({ value: text });
            } else {
                console.log("File drop cancelled");
            }
        });
    }

    async newFile() {
        try {
            return await this.saveAs();
        } catch (e) {
            return;
        }
    }

    async openFile() {
        const selected = await dialog.open({
            directory: false,
            multiple: false,
            // filters: [],
            // defaultPath: await homeDir(),
        });
        if (selected !== null) {
            this.filePath = selected as string;
            let text = await readTextFile(this.filePath, this.allowFolders);
            this.setState({ value: text });
        } else {
            // user cancelled the selection
        }
    }

    async saveFile() {
        if (!this.filePath) {
            try {
                return await this.saveAs();
            } catch (e) {
                return;
            }
        }
        await writeTextFile(this.filePath, this.state.value, this.allowFolders);
    }

    async saveFileAs() {
        let opt = {};
        if (!this.filePath) {
            opt = { defaultPath: this.filePath };
        }
        await this.saveAs(opt);
    }

    async saveAs(opt?: dialog.SaveDialogOptions) {
        if (!opt) {
            opt = { defaultPath: "Untitled.md" };
        }
        try {
            this.filePath = await dialog.save(opt);
        } catch (e) {
            return;
        }
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
                placeholder={"请输入……"}
            />
        );
    }
}
