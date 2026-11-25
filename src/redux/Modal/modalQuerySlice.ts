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

    call: build.mutation<
      any,
      { receiverId: string; conversationId: string | null; callType: string }
    >({
      query: ({ receiverId, conversationId, callType }) => ({
        url: `/call/${receiverId}`,
        method: "POST",
        data: { conversationId, callType },
      }),
    }),

    getCallLog: build.query<any, any>({
      query:(userId) => ({
        url:`/call/getCalls/${userId}`,
        method:"GET"
      })
    })


  }),
});

export const { useSearchMutation, useCallMutation, useGetCallLogQuery } = modalApi;
