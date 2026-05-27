import { useEffect, useRef, useState } from "react";

import { SendOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Input, Space, Tag, Typography, message } from "antd";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import {
  chatbotService,
  type ChatbotRestaurantVo,
} from "@/features/chatbot/services/chatbot.service";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  restaurants?: ChatbotRestaurantVo[];
};

const quickPrompts = [
  "Gợi ý quán đang mở cửa gần tôi",
  "Tìm quán cafe yên tĩnh để làm việc",
  "Có quán trà sữa nào được đánh giá tốt không?",
  "Tôi muốn ăn tối với bạn bè, gợi ý vài quán phù hợp",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Bạn có thể hỏi theo món ăn, loại quán, khu vực, giờ mở cửa hoặc mức đánh giá.",
  },
];

function formatRating(value?: number | string | null) {
  const rating = Number(value ?? 0);

  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "Chưa có đánh giá";
}

function getChatbotErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as { message?: string } | undefined;

    return responseData?.message || "Không thể kết nối chatbot. Vui lòng thử lại sau.";
  }

  return "Không thể kết nối chatbot. Vui lòng thử lại sau.";
}

function ChatbotPanel() {
  const navigate = useNavigate();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasUserAsked = messages.some((chatMessage) => chatMessage.role === "user");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [isSending, messages]);

  const sendQuestion = async (nextQuestion = question) => {
    const normalizedQuestion = nextQuestion.trim();

    if (!normalizedQuestion) {
      messageApi.warning("Vui lòng nhập câu hỏi.");

      return;
    }

    setIsSending(true);
    setQuestion("");
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: normalizedQuestion,
      },
    ]);

    try {
      const response = await chatbotService.ask(normalizedQuestion);

      setMessages((current) => [
        ...current,
        {
          id: response.sessionId || `assistant-${Date.now()}`,
          role: "assistant",
          content:
            response.answer ||
            "Mình chưa có câu trả lời phù hợp, bạn thử mô tả rõ hơn về món hoặc khu vực.",
          restaurants: response.cuaHangs ?? [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: getChatbotErrorMessage(error),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Space className="chatbot-panel" direction="vertical" size={14}>
      {messageContextHolder}
      <div className="chatbot-panel__messages">
        {messages.map((chatMessage) => (
          <div
            className={`chatbot-panel__message chatbot-panel__message--${chatMessage.role}`}
            key={chatMessage.id}
          >
            <Typography.Text strong>
              {chatMessage.role === "assistant" ? "FoodMap AI" : "Bạn"}
            </Typography.Text>
            <Typography.Paragraph className="chatbot-panel__message-content">
              {chatMessage.content}
            </Typography.Paragraph>
            {chatMessage.restaurants && chatMessage.restaurants.length > 0 ? (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {chatMessage.restaurants.slice(0, 3).map((restaurant) => (
                  <Card className="chatbot-panel__restaurant" key={restaurant.id} size="small">
                    <Flex align="start" justify="space-between" gap={10}>
                      <div>
                        <Typography.Text strong>
                          {restaurant.tenQuanAn || "Quán ăn"}
                        </Typography.Text>
                        <Typography.Paragraph
                          className="chatbot-panel__restaurant-address"
                          ellipsis={{ rows: 2 }}
                        >
                          {restaurant.diaChi || "Chưa có địa chỉ"}
                        </Typography.Paragraph>
                        <Tag color="gold">
                          {formatRating(restaurant.diemDanhGiaTrungBinh)}
                        </Tag>
                      </div>
                      <Button
                        size="small"
                        type="link"
                        onClick={() => navigate(`/cua-hang/${restaurant.id}`)}
                      >
                        Xem
                      </Button>
                    </Flex>
                  </Card>
                ))}
              </Space>
            ) : null}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!hasUserAsked ? (
        <Flex gap={8} wrap="wrap">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              size="small"
              onClick={() => {
                setQuestion(prompt);
                sendQuestion(prompt);
              }}
            >
              {prompt}
            </Button>
          ))}
        </Flex>
      ) : null}

      <Input.TextArea
        placeholder="Ví dụ: Tìm quán cafe ở Hà Nội đang mở cửa và được đánh giá tốt"
        rows={3}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onPressEnter={(event) => {
          if (!event.shiftKey) {
            event.preventDefault();
            sendQuestion();
          }
        }}
      />
      <Button
        block
        icon={<SendOutlined />}
        loading={isSending}
        type="primary"
        onClick={() => sendQuestion()}
      >
        Gửi câu hỏi
      </Button>
    </Space>
  );
}

export default ChatbotPanel;
