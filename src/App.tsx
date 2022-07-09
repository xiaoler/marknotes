import * as React from "react";
import { Textarea } from "@chakra-ui/react";
// import './App.css';

export default () => {
    const [value, setValue] = React.useState("");

    return (
        <Textarea
            className="textarea"
            w="100%"
            h="100vh"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="请输入……"
            border="gray.1"
            focusBorderColor="gray.100"
            resize="none"
        />
    );
};
