import type { FC } from "react";
import { useEffect, useState } from "react";
import { Col, Notification, Row } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchResources } from "api/server";
import ScrollableContainer from "components/ScrollableContainer";
import { debounce } from "util/debounce";
import ClusterMemberDetailSystem from "pages/cluster/ClusterMemberDetailSystem";
import ClusterMemberDetailCPU from "pages/cluster/ClusterMemberDetailCPU";
import ClusterMemberDetailMemory from "pages/cluster/ClusterMemberDetailMemory";
import ClusterMemberDetailGPU from "pages/cluster/ClusterMemberDetailGPU";
import ClusterMemberDetailNetworks from "pages/cluster/ClusterMemberDetailNetworks";
import ClusterMemberDetailPCI from "pages/cluster/ClusterMemberDetailPCI";
import ClusterMemberDetailStorage from "pages/cluster/ClusterMemberDetailStorage";
import ClusterMemberDetailUSB from "pages/cluster/ClusterMemberDetailUSB";
import type { LxdClusterMember } from "types/cluster";
import { getFirstVisibleSection } from "util/scroll";
import { fetchClusterMemberState } from "api/cluster-members";
import Loader from "components/Loader";

interface Props {
  member?: LxdClusterMember;
}

const ClusterMemberHardware: FC<Props> = ({ member }) => {
  const [section, setSection] = useState("system");

  const { data: resources, isLoading } = useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      member?.server_name ?? undefined,
      queryKeys.resources,
    ],
    queryFn: async () => fetchResources(member?.server_name),
  });

  const { data: state, isLoading: isStateLoading } = useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      member?.server_name ?? undefined,
      queryKeys.state,
    ],
    queryFn: async () => fetchClusterMemberState(member?.server_name ?? ""),
    enabled: !!member,
  });

  const sections = [
    "System",
    "CPU",
    "GPU",
    "Memory",
    "Networks",
    "Storage",
    "PCI",
    "USB",
  ];

  useEffect(() => {
    const wrapper = document.getElementById("content-details");
    const activateSectionOnScroll = () => {
      const activeSection = getFirstVisibleSection(sections, wrapper);
      setSection(activeSection.toLowerCase());
    };
    const scrollListener = () => {
      debounce(activateSectionOnScroll, 20);
    };
    wrapper?.addEventListener("scroll", scrollListener);
    return () => wrapper?.removeEventListener("scroll", scrollListener);
  }, [isLoading, sections]);

  if (isLoading || isStateLoading) {
    return <Loader />;
  }

  return (
    <>
      {!resources && (
        <Notification
          severity="negative"
          title="Could not load details for this member"
        />
      )}
      {resources && (
        <ScrollableContainer dependencies={[resources]}>
          {sections.map((sectionName) => (
            <Row className="hardware-section" key={sectionName}>
              <Col size={2}>
                <h2 className="p-heading--5" id={sectionName.toLowerCase()}>
                  {sectionName}
                </h2>
              </Col>
              <Col size={10}>
                {sectionName === "System" && (
                  <ClusterMemberDetailSystem
                    resources={resources}
                    state={state}
                  />
                )}
                {sectionName === "CPU" && (
                  <ClusterMemberDetailCPU resources={resources} state={state} />
                )}
                {sectionName === "Memory" && (
                  <ClusterMemberDetailMemory
                    resources={resources}
                    state={state}
                  />
                )}
                {sectionName === "GPU" && (
                  <ClusterMemberDetailGPU resources={resources} />
                )}
                {sectionName === "Networks" && (
                  <ClusterMemberDetailNetworks resources={resources} />
                )}
                {sectionName === "PCI" && (
                  <ClusterMemberDetailPCI resources={resources} />
                )}
                {sectionName === "Storage" && (
                  <ClusterMemberDetailStorage resources={resources} />
                )}
                {sectionName === "USB" && (
                  <ClusterMemberDetailUSB resources={resources} />
                )}
              </Col>
            </Row>
          ))}
          <div className="aside">
            <nav aria-label="Hardware navigation" className="toc-tree">
              <ul>
                {sections.map((sectionName) => (
                  <li className="p-side-navigation__item" key={sectionName}>
                    <a
                      className="p-side-navigation__link"
                      href={`#${sectionName.toLowerCase()}`}
                      aria-current={
                        section === sectionName.toLowerCase()
                          ? "page"
                          : undefined
                      }
                    >
                      {sectionName}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </ScrollableContainer>
      )}
    </>
  );
};

export default ClusterMemberHardware;
