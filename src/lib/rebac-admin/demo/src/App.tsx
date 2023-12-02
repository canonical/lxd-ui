import Button from "@canonical/react-components/dist/components/Button";
import Col from "@canonical/react-components/dist/components/Col";
import Form from "@canonical/react-components/dist/components/Form";
import Input from "@canonical/react-components/dist/components/Input";
import Row from "@canonical/react-components/dist/components/Row";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import {
  AccessGovernanceLink,
  AuthenticationLink,
  EntitlementsLink,
  GroupsLink,
  ResourcesLink,
  RolesLink,
  UsersLink,
} from "components/links";

import ApplicationLayout, { AppAside } from "./components/ApplicationLayout";

const rebacAdminBaseURL = "/permissions";

const App = () => {
  const [showAside, setShowAside] = useState(false);
  const [asidePinned, setAsidePinned] = useState(false);

  return (
    <ApplicationLayout
      logo={{
        component: Link,
        icon: "https://assets.ubuntu.com/v1/7144ec6d-logo-jaas-icon.svg",
        name: "https://assets.ubuntu.com/v1/2e04d794-logo-jaas.svg",
        nameAlt: "JAAS",
        to: "/",
      }}
      navItems={[
        {
          icon: "drag",
          label: "Models",
          to: "/models",
        },
        {
          icon: "menu",
          label: "Controllers",
          to: "/controllers",
        },
        {
          icon: "user",
          label: "Permissions",
          to: rebacAdminBaseURL,
          end: true,
        },
        <AccessGovernanceLink
          className="p-side-navigation__link"
          baseURL={rebacAdminBaseURL}
        />,
        <AuthenticationLink
          className="p-side-navigation__link"
          baseURL={rebacAdminBaseURL}
        />,
        <EntitlementsLink
          className="p-side-navigation__link"
          baseURL={rebacAdminBaseURL}
        />,
        <GroupsLink
          className="p-side-navigation__link"
          baseURL={rebacAdminBaseURL}
        />,
        <ResourcesLink
          className="p-side-navigation__link"
          baseURL={rebacAdminBaseURL}
        />,
        <RolesLink
          className="p-side-navigation__link"
          baseURL={rebacAdminBaseURL}
        />,
        <UsersLink
          className="p-side-navigation__link"
          baseURL={rebacAdminBaseURL}
        />,
      ]}
      navLinkComponent={NavLink}
      aside={
        showAside ? (
          <AppAside
            controls={
              <Button
                onClick={() => setAsidePinned(!asidePinned)}
                dense
                className="u-no-margin"
              >
                Pin aside
              </Button>
            }
            onClose={() => {
              setShowAside(false);
              setAsidePinned(false);
            }}
            title="Aside panel"
            pinned={asidePinned}
          >
            <Form stacked>
              <Input
                label="Full name"
                type="text"
                name="fullName"
                autoComplete="name"
                stacked
              />
              <Input
                label="Username"
                type="text"
                name="username-stacked"
                autoComplete="username"
                aria-describedby="exampleHelpTextMessage"
                stacked
                help="30 characters or fewer."
              />
              <Input
                type="text"
                label="Email address"
                aria-invalid="true"
                name="username-stackederror"
                autoComplete="email"
                required
                error="This field is required."
                stacked
              />
              <Input
                label="Address line 1"
                type="text"
                name="address-optional-stacked"
                autoComplete="address-line1"
                stacked
              />
              <Input
                label="Address line 2"
                type="text"
                name="address-optional-stacked"
                autoComplete="address-line3"
                stacked
              />
              <Row>
                <Col size={12}>
                  <Button
                    appearance="positive"
                    className="u-float-right"
                    name="add-details"
                  >
                    Add details
                  </Button>
                </Col>
              </Row>
            </Form>
          </AppAside>
        ) : null
      }
      status={
        <Button
          onClick={() => setShowAside(!showAside)}
          dense
          appearance="base"
          className="u-no-margin"
        >
          Toggle aside
        </Button>
      }
    >
      <Outlet />
    </ApplicationLayout>
  );
};

export default App;
