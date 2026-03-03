import ChatList from "./chatList/ChatList";
import Chat from "../chat/Chat"; 
import "./list.css";
import Userinfo from "./userInfo/Userinfo";

const List = () => {
  return (
    <div className="list" style={{ display: "flex" }}>
      <Userinfo/>
      <ChatList/>
    </div>
  )
}

export default List;
