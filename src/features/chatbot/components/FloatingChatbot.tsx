import { useState } from "react";

import { Modal } from "antd";

import chatbotImage from "@/assets/hero.png";
import ChatbotPanel from "@/features/chatbot/components/ChatbotPanel";

function FloatingChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Mở chatbot FoodMap"
        className="chatbot-widget__trigger"
        type="button"
        onClick={() => setOpen(true)}
      >
        <img alt="FoodMap AI" src={chatbotImage} />
      </button>

      <Modal
        footer={null}
        mask={false}
        open={open}
        title="FoodMap AI"
        width={380}
        wrapClassName="chatbot-widget-modal"
        onCancel={() => setOpen(false)}
      >
        <ChatbotPanel />
      </Modal>
    </>
  );
}

export default FloatingChatbot;
