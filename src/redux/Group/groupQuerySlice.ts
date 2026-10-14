import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/axios";

export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (build) => ({
    createGroup: build.mutation<
      any,
      {
        groupName: string;
        members: User[];
        admin: string;
      }
    >({
      query: (data) => ({
        url: "/group/createGroup",
        method: "POST",
        data: data,
      }),
    }),

    addMember: build.mutation<
      any,
      {
        groupId: string;
        members: string[];
      }
    >({
      query: (data) => ({
        url: "/group/addMember",
        method: "POST",
        data: data,
      }),
    }),

    removeMember: build.mutation<
      any,
      {
        groupId: string;
        members: string[];
      }
    >({
      query: (data) => ({
        url: "/group/removeMember",
        method: "POST",
        data: data,
      }),
    }),

    getMemberDetails: build.mutation<any, string>({
      query: (selectedUserId) => ({
        url:`/group/${selectedUserId}/details`,
        method:'GET',
      })
    })


  }),
});

export const {
  useCreateGroupMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useGetMemberDetailsMutation
} = groupApi;
