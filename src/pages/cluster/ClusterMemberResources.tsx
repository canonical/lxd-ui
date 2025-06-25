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
import { activeScrollSection } from "util/scroll";

interface Props {
  member?: LxdClusterMember;
}

const ClusterMemberResources: FC<Props> = ({ member }) => {
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
      const activeSection = activeScrollSection(sections, wrapper);
      setSection(activeSection.toLowerCase());
    };
    const scrollListener = () => {
      debounce(activateSectionOnScroll, 20);
    };
    wrapper?.addEventListener("scroll", scrollListener);
    return () => wrapper?.removeEventListener("scroll", scrollListener);
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      {!resources && (
        <Notification
          severity="negative"
          title="Could not load resources for this member"
        />
      )}
      {resources && (
        <ScrollableContainer dependencies={[resources]}>
          {sections.map((sectionName) => (
            <Row className="u-border-bottom" key={sectionName}>
              <Col size={2}>
                <h2 className="p-heading--5" id={sectionName.toLowerCase()}>
                  {sectionName}
                </h2>
              </Col>
              <Col size={7}>
                {sectionName === "System" && (
                  <ClusterMemberDetailSystem resources={resources} />
                )}
                {sectionName === "CPU" && (
                  <ClusterMemberDetailCPU resources={resources} />
                )}
                {sectionName === "Memory" && (
                  <ClusterMemberDetailMemory resources={resources} />
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
            <nav aria-label="Network form navigation" className="toc-tree">
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

export default ClusterMemberResources;
