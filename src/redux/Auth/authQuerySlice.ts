import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/axios";

export const authApi = createApi({
  reducerPath: "authenticationApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (build) => ({
    signUp: build.mutation<
      any,
      { email: string | null; username: string | null; password: string | null }
    >({
      query: (userCreds) => ({
        url: "/auth/signup",
        method: "POST",
        data: userCreds,
      }),
    }),

    login: build.mutation<any, { email: string | null; password: string | null }>({
      query: (userCreds) => ({
        url: "/auth/login",
        method: "POST",
        data: userCreds,
      }),
    }),

    logout: build.mutation<any, void>({
      query: () => ({
        url: "/auth/logout",
        method: "GET",
      }),
    }),
  }),
});

export const { useSignUpMutation, useLoginMutation, useLogoutMutation } = authApi;
