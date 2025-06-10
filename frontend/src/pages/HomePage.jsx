import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser , selectedGroup } = useChatStore();

  return (
    <div className="h-screen bg-base-200 pt-16">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 bg-base-200">
          {!selectedUser && !selectedGroup ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;