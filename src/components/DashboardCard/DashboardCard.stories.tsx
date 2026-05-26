import type { Meta, StoryObj } from "@storybook/react";
import { DoughnutChart } from "@canonical/react-components";
import DashboardCard from "./DashboardCard";

const meta: Meta<typeof DashboardCard> = {
  title: "Components/DashboardCard",
  component: DashboardCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof DashboardCard>;

export const Empty: Story = {};

export const WithText: Story = {
  render: () => <DashboardCard>Simple dashboard content</DashboardCard>,
};

export const WithTitle: Story = {
  render: () => (
    <DashboardCard title="Cluster status">
      <p className="u-no-margin">All services are healthy.</p>
    </DashboardCard>
  ),
};

export const WithTitleAndTitleIcon: Story = {
  render: () => (
    <DashboardCard title="10 instances" titleIcon="pods">
      <div className="u-flex">
        <div style={{ flex: "1" }}>
          <p className="u-no-margin">7 VMs</p>
          <p className="u-no-margin">3 containers</p>
        </div>
        <div style={{ flex: "1" }}>
          <DoughnutChart
            segments={[
              {
                color: "#0E8420",
                tooltip: "10 Running",
                value: 10,
              },
              {
                color: "#CC7900",
                tooltip: "15 Stopped",
                value: 15,
              },
              { color: "#C7162B", tooltip: "5 Frozen", value: 5 },
              { color: "#000", tooltip: "5 Error", value: 5 },
            ]}
            size={150}
            segmentHoverWidth={45}
            segmentThickness={40}
            chartID="default"
          />
        </div>
      </div>
    </DashboardCard>
  ),
};
