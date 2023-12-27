import {
    createSlice,
    nanoid,
    PayloadAction,
    createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";
import { client } from '../../api/client';
import { Post } from "./Post";
import { RootState } from "../../app/store";

interface InitialState {
    posts: Post[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: InitialState = {
    posts: [],
    status: "idle",
    error: null,
};

interface InitialPost {
    title: string;
    content: string;
    user: any;
}


export const fetchPosts: any = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await client.get('/fakeApi/posts')
    return response.data
  })
 

export const addNewPost = createAsyncThunk(
    "posts/addNewPost",
    // The payload creator receives the partial `{title, content, user}` object
    async (initialPost: InitialPost) => {
        // We send the initial data to the fake API server
        const response = await axios.post("fakeApi/posts", initialPost);
        // The response includes the complete post object, including unique ID
        return response.data;
    }
);

const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        reactionAdded(state, action) {
            const { postId, reaction } = action.payload;
            const existingPost = state.posts.find((post) => post.id === postId);
            if (existingPost) {
                existingPost.reactions[reaction]++;
            }
        },
        postAdded: {
            reducer(state, action: PayloadAction<Post>) {
                state.posts.push(action.payload);
            },
            prepare(title, content, userId) {
                return {
                    payload: {
                        id: nanoid(),
                        date: new Date().toISOString(),
                        title,
                        content,
                        user: userId,
                        reactions: {
                            thumbsUp: 0,
                            hooray: 0,
                            heart: 0,
                            rocket: 0,
                            eyes: 0,
                        },
                    },
                };
            },
        },
        postUpdated(state, action) {
            const { id, title, content } = action.payload;
            const existingPost = state.posts.find((post) => post.id === id);
            if (existingPost) {
                existingPost.title = title;
                existingPost.content = content;
            }
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchPosts.pending, (state: any, action: any) => {
                state.status = "loading";
            })
            .addCase(fetchPosts.fulfilled, (state: any, action: any) => {
                state.status = "succeeded";
                // Add any fetched posts to the array
                state.posts = state.posts.concat(action.payload);
            })
            .addCase(fetchPosts.rejected, (state: any, action: any) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                // We can directly add the new post object to our posts array
                state.posts.push(action.payload);
            });
    },
});

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions;
export default postsSlice.reducer;

export const selectAllPosts = (state: RootState) => state.posts.posts;

export const selectPostById = (state: RootState, postId: string) =>
    state.posts.posts.find((post) => post.id === postId);
