import * as React from "react";
import { Textarea } from "@chakra-ui/react";
import { listen } from "@tauri-apps/api/event";
// import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";

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
        // 如果触发了两次事件，不必惊慌
        // https://juejin.cn/post/6844904084768587790
        await listen("open_file", (event) => {
            this.filePath = (event.payload as Payload).path;
            console.log(this.filePath);
            let text = (event.payload as Payload).content;
            this.setState({ value: text });
        });

        /*
        // 前端API保存文件有目录限制
        listen("save_file", async () => {
            console.log("save_file tiggered");
            if (this.filePath === "") {
                return;
            }
            await writeTextFile(this.filePath, this.state.value, {
                dir: BaseDirectory.Download,
            });
        });
        */
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
