import type { ApiResponse } from "@/types/api.type";

import { endpoints } from "@/services/api/endpoints";
import { baseService } from "@/services/base/base.service";

export type UploadImageResponse = {
  fileName: string;
  url: string;
  publicId: string;
};

export const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await baseService.post<ApiResponse<UploadImageResponse>>(
      `${endpoints.uploads}/image`,
      formData,
    );

    return response.data;
  },
};
