import { useMemo, type FC } from "react";
import { useSearchParams } from "react-router-dom";
import { Row, Spinner, useNotify } from "@canonical/react-components";
import type { LxdImageRegistry } from "types/image";
import { useRegistryImages } from "context/useImageRegistries";
import { useSettings } from "context/useSettings";
import ImageTable from "pages/images/ImageTable";
import type { ImagesSearchFilterType } from "pages/images/ImagesSearchFilter";
import ImagesSearchFilter, {
  QUERY,
  ARCHITECTURE,
  TYPE,
} from "pages/images/ImagesSearchFilter";
import {
  getArchitectureAliases,
  getArchitectureTechnicalName,
} from "util/architectures";
import { getImageTypeDisplayName } from "util/images";

interface Props {
  imageRegistry: LxdImageRegistry;
}

const ImageRegistryImages: FC<Props> = ({ imageRegistry }) => {
  const [searchParams] = useSearchParams();
  const notify = useNotify();
  const {
    data: images,
    isLoading: isImagesLoading,
    error: imagesError,
  } = useRegistryImages(imageRegistry.name);
  const { data: settings, error: settingsError } = useSettings();
  const error = imagesError || settingsError;

  if (error) {
    notify.failure("Loading images failed", error);
  }

  const serverArchitectures = settings?.environment?.architectures ?? [];
  const supportedArchitectures = useMemo(
    () => getArchitectureAliases(serverArchitectures),
    [serverArchitectures],
  );

  const filters: ImagesSearchFilterType = {
    queries: searchParams.getAll(QUERY).map((q) => q.toLowerCase()),
    arch: searchParams.getAll(ARCHITECTURE),
    type: searchParams.getAll(TYPE),
  };

  const technicalArchFilters = filters.arch.map(getArchitectureTechnicalName);

  const filteredImages = (images ?? []).filter((image) => {
    // For built-in registries, filter out images without aliases
    if (
      imageRegistry.builtin &&
      (!image.aliases || image.aliases.length === 0)
    ) {
      return false;
    }

    const matchesArch =
      filters.arch.length === 0 ||
      technicalArchFilters.includes(image.architecture);

    if (!matchesArch) return false;

    const matchesType =
      filters.type.length === 0 ||
      (image.type && filters.type.includes(getImageTypeDisplayName(image)));

    if (!matchesType) return false;

    if (filters.queries.length > 0) {
      const description = (image.properties?.description ?? "").toLowerCase();
      const matchesQuery = filters.queries.some(
        (q) =>
          description.includes(q) ||
          image.name?.toLowerCase().includes(q) ||
          (image.aliases?.some((alias) =>
            alias.name.toLowerCase().includes(q),
          ) ??
            false),
      );
      if (!matchesQuery) return false;
    }

    return true;
  });

  if (isImagesLoading) {
    return (
      <Row>
        <Spinner text="Loading images..." />
      </Row>
    );
  }

  return (
    <>
      {images && images.length > 0 && (
        <div className="u-sv3">
          <ImagesSearchFilter
            images={images}
            supportedArchitectures={supportedArchitectures}
            isImagesLoading={isImagesLoading}
          />
        </div>
      )}
      <ImageTable
        images={filteredImages}
        imageRegistryName={imageRegistry.name}
        supportedArchitectures={supportedArchitectures}
      />
    </>
  );
};

export default ImageRegistryImages;
