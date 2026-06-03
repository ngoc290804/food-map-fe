import { TrophyOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import { checkInService } from "@/features/restaurant/services/check-in.service";
import { restaurantService } from "@/features/restaurant/services/restaurant.service";

const rankingPageSize = 10;

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : "0.0";
}

function BangXepHangPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["restaurants", "ranking", 0, rankingPageSize],
    queryFn: () => restaurantService.getRanking({ page: 0, size: rankingPageSize }),
  });
  const {
    data: checkInRanking,
    isLoading: isCheckInRankingLoading,
  } = useQuery({
    queryKey: ["check-ins", "ranking", 0, rankingPageSize],
    queryFn: () => checkInService.getRanking({ page: 0, size: rankingPageSize }),
  });
  const rankingItems = data?.items ?? [];
  const checkInRankingItems = checkInRanking?.items ?? [];

  return (
    <Space className="leaderboard-page" direction="vertical" size={24}>
      <Flex align="center" className="leaderboard-page__title" gap={16} justify="center">
        <TrophyOutlined />
        <Typography.Title level={1}>Bảng xếp hạng</Typography.Title>
        <TrophyOutlined />
      </Flex>

      <div className="leaderboard-page__grid">
        <section className="leaderboard-panel">
          <Flex align="center" className="leaderboard-panel__head" justify="space-between">
            <Typography.Title level={3}>Quán ăn nổi bật</Typography.Title>
            <Typography.Text>{rankingItems.length} quán</Typography.Text>
          </Flex>

          <div className="leaderboard-table">
            <div className="leaderboard-table__header">
              <span>Hạng</span>
              <span>Tên quán</span>
              <span>Điểm</span>
            </div>

            {rankingItems.map((item, index) => (
              <div className="leaderboard-table__row" key={item.id}>
                <span className="leaderboard-table__rank">{index + 1}</span>
                <Button
                  className="leaderboard-table__name"
                  type="link"
                  onClick={() => navigate(`/cua-hang/${item.id}`)}
                >
                  {item.name}
                </Button>
                <span className="leaderboard-table__score">
                  {formatRating(item.averageRating)}
                </span>
              </div>
            ))}

            {isLoading ? (
              <Typography.Text className="leaderboard-table__state">
                Đang tải bảng xếp hạng...
              </Typography.Text>
            ) : null}

            {!isLoading && rankingItems.length === 0 ? (
              <Typography.Text className="leaderboard-table__state">
                Chưa có dữ liệu xếp hạng.
              </Typography.Text>
            ) : null}
          </div>
        </section>

        <section className="leaderboard-panel">
          <Flex align="center" className="leaderboard-panel__head" justify="space-between">
            <Typography.Title level={3}>Check-in</Typography.Title>
            <Typography.Text>{checkInRankingItems.length} tài khoản</Typography.Text>
          </Flex>

          <div className="leaderboard-table leaderboard-table--checkin">
            <div className="leaderboard-table__header">
              <span>Tên tài khoản</span>
              <span>Họ tên</span>
              <span>Số lần</span>
            </div>

            {checkInRankingItems.map((item) => (
              <div className="leaderboard-table__row" key={item.username}>
                <span className="leaderboard-table__cell" title={item.username}>
                  {item.username || "--"}
                </span>
                <span className="leaderboard-table__cell" title={item.fullName}>
                  {item.fullName || "--"}
                </span>
                <span className="leaderboard-table__score">
                  {item.checkInCount}
                </span>
              </div>
            ))}

            {isCheckInRankingLoading ? (
              <Typography.Text className="leaderboard-table__state">
                Đang tải bảng check-in...
              </Typography.Text>
            ) : null}

            {!isCheckInRankingLoading && checkInRankingItems.length === 0 ? (
              <Typography.Text className="leaderboard-table__state">
                Chưa có dữ liệu check-in.
              </Typography.Text>
            ) : null}
          </div>
        </section>
      </div>
    </Space>
  );
}

export default BangXepHangPage;
