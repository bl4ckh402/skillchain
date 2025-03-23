"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    limit,
    serverTimestamp,
    increment,
    getDoc,
    setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
    Post,
    Comment,
    CommunityFilters,
    Category,
    Contributor,
} from "@/types/community";
import { useAuth } from "./AuthProvider";

interface CommunityContextType {
    posts: Post[];
    loading: boolean;
    filters: CommunityFilters;
    categories: Category[];
    topContributors: Contributor[];
    upcomingEvents: Event[];
    setFilters: (filters: CommunityFilters) => void;
    createPost: (
        post: Omit<Post, "id" | "createdAt" | "updatedAt">
    ) => Promise<string>;
    updatePost: (id: string, post: Partial<Post>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    likePost: (postId: string) => Promise<void>;
    getPosts: (filters?: CommunityFilters) => Promise<Post[]>;
    getPostById: (id: string) => Promise<Post>;
    createComment: (
        comment: Omit<Comment, "id" | "createdAt" | "updatedAt">
    ) => Promise<string>;
    updateComment: (id: string, comment: Partial<Comment>) => Promise<void>;
    deleteComment: (id: string) => Promise<void>;
    likeComment: (commentId: string) => Promise<void>;
    getComments: (postId: string) => Promise<Comment[]>;
    uploadAttachment: (file: File) => Promise<string>;
    getCategories: () => Promise<Category[]>;
    getTopContributors: (limit?: number) => Promise<Contributor[]>;
    getUpcomingEvents: () => Promise<Event[]>;
    registerForEvent: (eventId: string) => Promise<void>;
    unregisterFromEvent: (eventId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<CommunityFilters>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [topContributors, setTopContributors] = useState<Contributor[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        getCategories();
        getTopContributors();
        getUpcomingEvents();
    }, []);

    // Create new post
    const createPost = async (
        post: Omit<Post, "id" | "createdAt" | "updatedAt">
    ) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const docRef = await addDoc(collection(db, "posts"), {
                ...post,
                likes: 0,
                comments: 0,
                views: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                author: {
                    id: user.uid,
                    name: user.displayName || "Anonymous",
                    avatar: user.photoURL || "",
                },
            });
            return docRef.id;
        } catch (error: any) {
            throw new Error(`Error creating post: ${error.message}`);
        }
    };

    // Update existing post
    const updatePost = async (id: string, post: Partial<Post>) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const postRef = doc(db, "posts", id);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) throw new Error("Post not found");
            if (postSnap.data().author.id !== user.uid)
                throw new Error("Unauthorized");

            await updateDoc(postRef, {
                ...post,
                updatedAt: serverTimestamp(),
            });
        } catch (error: any) {
            throw new Error(`Error updating post: ${error.message}`);
        }
    };

    // Delete post
    const deletePost = async (id: string) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const postRef = doc(db, "posts", id);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) throw new Error("Post not found");
            if (postSnap.data().author.id !== user.uid)
                throw new Error("Unauthorized");

            await deleteDoc(postRef);
        } catch (error: any) {
            throw new Error(`Error deleting post: ${error.message}`);
        }
    };

    const getCategories = async () => {
        try {
            const categoriesQuery = query(
                collection(db, "categories"),
                orderBy("count", "desc")
            );
            const snapshot = await getDocs(categoriesQuery);
            const categories = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    count: data.count
                } as Category;
            });
            setCategories(categories);
            return categories;
        } catch (error: any) {
            throw new Error(`Error fetching categories: ${error.message}`);
        }
    };

    const getUpcomingEvents = async () => {
        try {
            const now = new Date();
            const eventsQuery = query(
                collection(db, "events"),
                where("date", ">=", now),
                orderBy("date", "asc")
            );
            const snapshot = await getDocs(eventsQuery);
            const events = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            })) as Event[];
            setUpcomingEvents(events);
            return events;
        } catch (error: any) {
            throw new Error(`Error fetching upcoming events: ${error.message}`);
        }
    };

    const getTopContributors = async (limitCount = 10) => {
        try {
            const contributorsQuery = query(
                collection(db, "users"),
                orderBy("reputation", "desc"),
                limit(limitCount)
            );
            const snapshot = await getDocs(contributorsQuery);
            const contributors = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Contributor[];
            setTopContributors(contributors);
            return contributors;
        } catch (error: any) {
            throw new Error(`Error fetching top contributors: ${error.message}`);
        }
    };

    const registerForEvent = async (eventId: string) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const eventRef = doc(db, "events", eventId);
            const registrationRef = doc(
                db,
                "event_registrations",
                `${eventId}_${user.uid}`
            );

            await updateDoc(eventRef, {
                participants: increment(1),
            });

            await setDoc(registrationRef, {
                eventId,
                userId: user.uid,
                registeredAt: serverTimestamp(),
            });
        } catch (error: any) {
            throw new Error(`Error registering for event: ${error.message}`);
        }
    };

    // Unregister from an event
    const unregisterFromEvent = async (eventId: string) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const eventRef = doc(db, "events", eventId);
            const registrationRef = doc(
                db,
                "event_registrations",
                `${eventId}_${user.uid}`
            );

            await updateDoc(eventRef, {
                participants: increment(-1),
            });

            await deleteDoc(registrationRef);
        } catch (error: any) {
            throw new Error(`Error unregistering from event: ${error.message}`);
        }
    };

    // Like/Unlike post
    const likePost = async (postId: string) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const likeRef = doc(db, "postLikes", `${postId}_${user.uid}`);
            const likeSnap = await getDoc(likeRef);
            const postRef = doc(db, "posts", postId);

            if (likeSnap.exists()) {
                await deleteDoc(likeRef);
                await updateDoc(postRef, {
                    likes: increment(-1),
                });
            } else {
                await addDoc(collection(db, "postLikes"), {
                    postId,
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                });
                await updateDoc(postRef, {
                    likes: increment(1),
                });
            }
        } catch (error: any) {
            throw new Error(`Error liking post: ${error.message}`);
        }
    };

    // Get posts with filters
    const getPosts = async (filters?: CommunityFilters) => {
        try {
            setLoading(true);
            let q = query(collection(db, "posts"));

            if (filters?.category?.length) {
                q = query(q, where("category", "in", filters.category));
            }

            if (filters?.tags?.length) {
                q = query(q, where("tags", "array-contains-any", filters.tags));
            }

            if (filters?.sortBy === "popular") {
                q = query(q, orderBy("likes", "desc"));
            } else if (filters?.sortBy === "unanswered") {
                q = query(q, where("comments", "==", 0));
            } else {
                q = query(q, orderBy("createdAt", "desc"));
            }

            const snapshot = await getDocs(q);
            const posts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];

            setPosts(posts);
            return posts;
        } catch (error: any) {
            throw new Error(`Error fetching posts: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Get single post by ID
    const getPostById = async (id: string) => {
        try {
            const postRef = doc(db, "posts", id);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) throw new Error("Post not found");

            await updateDoc(postRef, {
                views: increment(1),
            });

            return {
                id: postSnap.id,
                ...postSnap.data(),
            } as Post;
        } catch (error: any) {
            throw new Error(`Error fetching post: ${error.message}`);
        }
    };

    // Comment functions
    const createComment = async (
        comment: Omit<Comment, "id" | "createdAt" | "updatedAt">
    ) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                ...comment,
                likes: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                author: {
                    id: user.uid,
                    name: user.displayName || "Anonymous",
                    avatar: user.photoURL || "",
                },
            });

            await updateDoc(doc(db, "posts", comment.postId), {
                comments: increment(1),
            });

            return docRef.id;
        } catch (error: any) {
            throw new Error(`Error creating comment: ${error.message}`);
        }
    };

    // Update comment
    const updateComment = async (id: string, comment: Partial<Comment>) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const commentRef = doc(db, "comments", id);
            const commentSnap = await getDoc(commentRef);

            if (!commentSnap.exists()) throw new Error("Comment not found");
            if (commentSnap.data().author.id !== user.uid)
                throw new Error("Unauthorized");

            await updateDoc(commentRef, {
                ...comment,
                updatedAt: serverTimestamp(),
                isEdited: true,
            });
        } catch (error: any) {
            throw new Error(`Error updating comment: ${error.message}`);
        }
    };

    // Delete comment
    const deleteComment = async (id: string) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const commentRef = doc(db, "comments", id);
            const commentSnap = await getDoc(commentRef);

            if (!commentSnap.exists()) throw new Error("Comment not found");
            if (commentSnap.data().author.id !== user.uid)
                throw new Error("Unauthorized");

            const postId = commentSnap.data().postId;
            await deleteDoc(commentRef);

            await updateDoc(doc(db, "posts", postId), {
                comments: increment(-1),
            });
        } catch (error: any) {
            throw new Error(`Error deleting comment: ${error.message}`);
        }
    };

    // Like/Unlike comment
    const likeComment = async (commentId: string) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const likeRef = doc(db, "commentLikes", `${commentId}_${user.uid}`);
            const likeSnap = await getDoc(likeRef);
            const commentRef = doc(db, "comments", commentId);

            if (likeSnap.exists()) {
                await deleteDoc(likeRef);
                await updateDoc(commentRef, {
                    likes: increment(-1),
                });
            } else {
                await addDoc(collection(db, "commentLikes"), {
                    commentId,
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                });
                await updateDoc(commentRef, {
                    likes: increment(1),
                });
            }
        } catch (error: any) {
            throw new Error(`Error liking comment: ${error.message}`);
        }
    };

    // Get comments for a post
    const getComments = async (postId: string) => {
        try {
            const q = query(
                collection(db, "comments"),
                where("postId", "==", postId),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Comment[];
        } catch (error: any) {
            throw new Error(`Error fetching comments: ${error.message}`);
        }
    };

    // Upload attachment
    const uploadAttachment = async (file: File) => {
        if (!user) throw new Error("Must be logged in");

        try {
            const storageRef = ref(storage, `community/${user.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error: any) {
            throw new Error(`Error uploading attachment: ${error.message}`);
        }
    };

    const value = {
        posts,
        loading,
        filters,
        setFilters,
        createPost,
        updatePost,
        deletePost,
        likePost,
        getPosts,
        getPostById,
        createComment,
        updateComment,
        deleteComment,
        likeComment,
        getComments,
        uploadAttachment,
        categories,
        topContributors,
        upcomingEvents,
        getCategories,
        getTopContributors,
        getUpcomingEvents,
        registerForEvent,
        unregisterFromEvent,
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
}

export const useCommunity = () => {
    const context = useContext(CommunityContext);
    if (!context) {
        throw new Error("useCommunity must be used within a CommunityProvider");
    }
    return context;
};
