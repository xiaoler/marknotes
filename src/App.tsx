import * as React from "react";
import { Textarea } from "@chakra-ui/react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
interface Payload {
    path: string;
    content: string;
}

export default class App extends React.Component {
    state = {
        value: "",
    };

    async componentDidMount() {
        // 如果触发了两次事件，不必惊慌
        // https://juejin.cn/post/6844904084768587790
        await listen("open_file", (event) => {
            let path = (event.payload as Payload).path;
            console.log(path);
            let text = (event.payload as Payload).content;
            this.setState({ value: text });
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
