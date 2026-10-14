import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/axios";

export const modalApi = createApi({
  reducerPath: "modalApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (build) => ({
    search: build.mutation<any, string>({
      query: (keyword) => ({
        url: `/search?u=${keyword}&page=1`,
        method: "GET",
      }),
    }),
  }),
});

export const { useSearchMutation } = modalApi
