import { createContext } from "react";
import { message } from "antd";
const MessageContext = createContext();
const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};
export { MessageProvider, MessageContext };
