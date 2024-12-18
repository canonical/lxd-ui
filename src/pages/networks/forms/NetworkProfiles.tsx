import { FC } from "react";
import ExpandableList from "components/ExpandableList";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { filterUsedByType } from "util/usedBy";
import UsedByItem from "components/UsedByItem";

interface Props {
  project: string;
  formik: FormikProps<NetworkFormValues>;
}

const NetworkProfiles: FC<Props> = ({ formik, project }) => {
  const profileList = filterUsedByType(
    "profile",
    formik.values.bareNetwork?.used_by,
  );

  return (
    <div className="general-field">
      <div className="general-field-label">Used by profiles</div>
      <div className="general-field-content">
        {profileList.length === 0 ? (
          "-"
        ) : (
          <ExpandableList
            items={profileList.map((item) => (
              <UsedByItem
                key={item.name}
                item={item}
                activeProject={project}
                type="profile"
                to={`/ui/project/${item.project}/profile/${item.name}`}
              />
            ))}
          />
        )}
      </div>
    </div>
  );
};

export default NetworkProfiles;
