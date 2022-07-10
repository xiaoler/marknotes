import * as React from "react";
import { Textarea } from "@chakra-ui/react";
import { listen } from "@tauri-apps/api/event";
interface Payload {
    path: string;
    content: string;
}

export default class App extends React.Component {
    state = {
        value: "",
    };

    async componentDidMount() {
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
