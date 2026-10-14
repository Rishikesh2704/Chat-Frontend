import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../lib/axios";

export const chatApi = createApi({
    reducerPath:"chatApi",
    baseQuery:axiosBaseQuery(),
    endpoints: (build) => ({
        getUsers: build.query<any,void>({
            query: () => ({
                url:'/messages/users',
                method:"GET"
            })
        }),

        getMessages: build.mutation<any,{selectedUserId: string, skipMessages:number}>({
            query: ({selectedUserId, skipMessages}) =>({
                url:`/messages/${selectedUserId}/${skipMessages}`,
                method:"GET",
            }),
            transformResponse: (data:any) => {
                return data.messages.toReversed();
            }
        }),

        sendMessage: build.mutation<any, {selectedUserId: string , data:any}>({
            query: ({selectedUserId, data}) => ({
                url:`/messages/sendMessage/${selectedUserId}`,
                method:"POST",
                data:data
            })
        }),

        sendGroupMessage: build.mutation<any, {groupId: string , data:any}>({
            query: ({groupId, data}) => ({
                url:`/group/${groupId}/message`,
                method:"POST",
                data:data
            })
        }),

        deleteMessages: build.mutation<any, {type:string, messageId: string}>({
            query: ({type, messageId}) => ({
                url:`/${type}/deleteMessage/${messageId}`,
                method:'DELETE'
            })
        }),

        setProfile: build.mutation<any,any>({
            query: (data) => ({
                url:"/auth/uploadProfile",
                method:"POST",
                data:data,
            })
        }),

        


    })
})

export const { useGetUsersQuery, useGetMessagesMutation, useSendMessageMutation, useSendGroupMessageMutation, useDeleteMessagesMutation, useSetProfileMutation,  } = chatApi