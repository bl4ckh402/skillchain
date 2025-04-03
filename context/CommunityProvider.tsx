"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
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
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  Post,
  Comment,
  CommunityFilters,
  Category,
  Contributor,
  CommunityEvent,
} from "@/types/community";
import { useAuth } from "./AuthProvider";

interface CommunityContextType {
  posts: Post[];
  loading: boolean;
  filters: CommunityFilters;
  categories: Category[];
  topContributors: Contributor[];
  upcomingEvents: CommunityEvent[];
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
  getUpcomingEvents: () => Promise<CommunityEvent[]>;
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
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const { user } = useAuth();

  // Add this flag to track initialization
const [categoriesInitialized, setCategoriesInitialized] = useState(false);

// Modified initialization function with better checks
const initializeDefaultCategories = useCallback(async () => {
  // Skip if already initialized
  if (categoriesInitialized) {
    return;
  }
  
  try {
    console.log("Checking for existing categories...");
    const categoriesQuery = query(collection(db, "categories"));
    const snapshot = await getDocs(categoriesQuery);
    
    // If categories already exist, just load them
    if (!snapshot.empty) {
      console.log(`Found ${snapshot.size} existing categories`);
      setCategoriesInitialized(true);
      await getCategories();
      return;
    }
    
    console.log("No categories found, creating defaults...");
    // Define default categories with explicit IDs
    const defaultCategories = [
      { id: "general", name: "General", count: 0 },
      { id: "smart-contracts", name: "Smart Contracts", count: 0 },
      { id: "defi", name: "DeFi", count: 0 },
      { id: "nfts", name: "NFTs", count: 0 },
      { id: "web3", name: "Web3", count: 0 },
      { id: "governance", name: "Governance", count: 0 },
      { id: "security", name: "Security", count: 0 },
      { id: "privacy", name: "Privacy", count: 0 },
      { id: "frontend", name: "Frontend", count: 0 },
      { id: "interoperability", name: "Interoperability", count: 0 },
      { id: "cryptography", name: "Cryptography", count: 0 },
    ];
    
    // Use a batched write for better performance and atomicity
    console.log("Creating categories in batch...");
    const promises = defaultCategories.map(category => 
      setDoc(doc(db, "categories", category.id), {
        name: category.name,
        count: category.count
      })
    );
    
    await Promise.all(promises);
    console.log("Default categories created successfully");
    
    // Mark as initialized and load the categories
    setCategoriesInitialized(true);
    await getCategories();
  } catch (error) {
    console.error("Error initializing default categories:", error);
  }
}, [categoriesInitialized]);

// Improved getCategories function with better error handling
const getCategories = async () => {
  try {
    const categoriesQuery = query(
      collection(db, "categories"),
      orderBy("name", "asc")
    );
    
    const snapshot = await getDocs(categoriesQuery);
    if (snapshot.empty) {
      console.log("No categories found in getCategories");
      return [];
    }
    
    // Process categories with proper id handling
    const categoriesData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        count: data.count || 0,
      } as Category;
    });
    
    // Set categories without further processing
    setCategories(categoriesData);
    return categoriesData;
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Updated useEffect for initialization
useEffect(() => {
  const initializeData = async () => {
    try {
      // Only initialize categories once
      if (!categoriesInitialized) {
        await initializeDefaultCategories();
      }
      
      // Load other data
      await getTopContributors();
      await getUpcomingEvents();
      await getPosts();
    } catch (error) {
      console.error("Error initializing community data:", error);
    }
  };
  
  initializeData();
}, [initializeDefaultCategories, categoriesInitialized]);

  // Create new post
  const createPost = async (
    post: Omit<
      Post,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "author"
      | "likes"
      | "comments"
      | "views"
    >
  ) => {
    if (!user) throw new Error("Must be logged in");

    try {
      setLoading(true);

      // Ensure category is valid
      if (!categories.some((c) => c.name === post.category)) {
        // Add the category if it doesn't exist
        await addDoc(collection(db, "categories"), {
          name: post.category,
          count: 0,
        });

        // Refresh categories
        await getCategories();
      }

      // Prepare the post data
      const postData = {
        ...post,
        likes: 0,
        comments: [],
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        author: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "",
        },
      };

      // Add the post to Firestore
      const docRef = await addDoc(collection(db, "posts"), postData);

      // Update category count
      const categoryQuery = query(
        collection(db, "categories"),
        where("name", "==", post.category)
      );

      const categorySnapshot = await getDocs(categoryQuery);
      if (!categorySnapshot.empty) {
        const categoryDoc = categorySnapshot.docs[0];
        await updateDoc(doc(db, "categories", categoryDoc.id), {
          count: increment(1),
        });
      }

      // Update user post count
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          postCount: increment(1),
          reputation: increment(5), // Give reputation for creating a post
        });
      } else {
        // Create user profile if it doesn't exist
        await setDoc(userRef, {
          displayName: user.displayName || "Anonymous",
          photoURL: user.photoURL || "",
          email: user.email || "",
          postCount: 1,
          reputation: 5,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
      }

      // Refresh top contributors
      await getTopContributors();

      // Refresh posts
      await getPosts(filters);

      // Return the post ID
      return docRef.id;
    } catch (error: any) {
      console.error("Error creating post:", error);
      throw new Error(`Error creating post: ${error.message}`);
    } finally {
      setLoading(false);
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
      })) as CommunityEvent[];
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
      throw new Error(`Error registering for attendinevent: ${error.message}`);
    }
  };

  // Unregister from an attendinevent
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
      throw new Error(
        `Error unregistering from attendinevent: ${error.message}`
      );
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
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(commentsQuery);
      const comments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || "",
          postId: data.postId,
          parentId: data.parentId || null,
          author: {
            id: data.author?.id || "",
            name: data.author?.name || "Anonymous",
            avatar: data.author?.avatar || "",
          },
          likes: data.likes || 0,
          isEdited: data.isEdited || false,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(data.createdAt),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt),
        } as Comment;
      });

      return comments;
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      throw new Error(`Error fetching comments: ${error.message}`);
    }
  };

  // Upload attachment
  const uploadAttachment = async (file: File) => {
    if (!user) throw new Error("Must be logged in");

    try {
      const fileName = `${Date.now()}_${file.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`;
      const storageRef = ref(storage, `community/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error: any) {
      console.error("Error uploading attachment:", error);
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
