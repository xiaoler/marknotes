import * as React from "react";
import { Textarea } from "@chakra-ui/react";
import { listen } from "@tauri-apps/api/event";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { dialog } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";

interface Payload {
    path: string;
    content: string;
}

export default class App extends React.Component {
    state = {
        value: "",
    };

    filePath: string = "";

    async componentDidMount() {
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
                return;
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
            this.filePath = await dialog.save(opt);
            // 写入文件
            await writeTextFile(this.filePath, this.state.value, {
                dir: BaseDirectory.Home,
            });
            // 修改窗口标题
            appWindow.setTitle(this.filePath.split("/").pop() as string);
        });
    }

    public render() {
        return (
            <Textarea
                w="100%"
                h="100vh"
                value={this.state.value}
                onChange={(e) => this.setState({ value: e.target.value })}
                placeholder="请输入……"
                border="gray.1"
                focusBorderColor="gray.100"
                resize="none"
            />
        );
    }
}
