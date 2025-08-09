import { type NextRequest, NextResponse } from "next/server";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";

// Firebase configuration - replace with your own values
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer for Firebase
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a reference to Firebase Storage
    const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);

    // Upload the file
    await uploadBytes(storageRef, buffer);

    // Get the download URL
    const imageUrl = await getDownloadURL(storageRef);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const file = formData.get("file") as File

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 })
//     }

//     // In a real app, upload to cloud storage (Cloudinary, AWS S3, etc.)
//     // For demo purposes, we'll return a placeholder URL
//     const imageUrl = `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(file.name)}`

//     return NextResponse.json({ imageUrl })
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
//   }
// }
