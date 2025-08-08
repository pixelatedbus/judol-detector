'use client';
import React, { useState, useEffect } from 'react';
// Make sure this file path is correct relative to your new app directory structure
import { processPatternsFile, processCommentsFile } from './fileProcessor';

// --- Constants ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// --- Type Definitions ---
interface Comment {
    id: string;
    author: string;
    text: string;
}

interface User {
    id: string;
    displayName: string;
}

// --- Reusable Components ---
const Spinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);


// --- Main Page Component ---
const HomePage: React.FC = () => {
    // --- State Management ---
    const [user, setUser] = useState<User | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [videoId, setVideoId] = useState('');
    const [algorithm, setAlgorithm] = useState('Regex');
    const [patternsFile, setPatternsFile] = useState<File | null>(null);
    const [commentsFile, setCommentsFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Authentication ---
    useEffect(() => {
        // Check if user is logged in when the app loads
        const checkAuthStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/status`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                    }
                }
            } catch (err) {
                console.error("Could not fetch auth status");
            }
        };
        checkAuthStatus();
    }, []);

    const handleLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/google/redirect`;
    };

    const handleLogout = () => {
        window.location.href = `${API_BASE_URL}/auth/logout`;
    };

    // --- API Handlers ---
    const handleSearch = async () => {
        if (!videoId) {
            setError("Please enter a Video ID.");
            return;
        }
        if (algorithm !== 'Regex' && !patternsFile) {
            setError("Please provide a patterns.txt file for this algorithm.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setComments([]);

        try {
            let patterns: string[] = [];
            if (algorithm !== 'Regex' && patternsFile) {
                patterns = await processPatternsFile(patternsFile);
            }

            const res = await fetch(`${API_BASE_URL}/processing/comments/search/${videoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: algorithm, patterns }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to search comments.');
            }

            const foundComments = await res.json();
            setComments(foundComments);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBatchPost = async () => {
        if (!commentsFile) {
            setError("Please select a comments file to upload.");
            return;
        }
        if (!videoId) {
            setError("Please enter a Video ID to post comments to.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const commentsToPost = await processCommentsFile(commentsFile);
            const res = await fetch(`${API_BASE_URL}/processing/comments/batch/${videoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentsToPost }),
                credentials: 'include',
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to post comments.');
            }
            alert("Batch comments posted successfully!");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/processing/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                 const errData = await res.json();
                throw new Error(errData.message || 'Failed to delete comment.');
            }
            // Remove the deleted comment from the state
            setComments(prev => prev.filter(c => c.id !== commentId));

        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm(`Are you sure you want to delete all ${comments.length} found comments?`)) return;
        
        setIsLoading(true);
        const deletePromises = comments.map(c => 
            fetch(`${API_BASE_URL}/processing/comments/${c.id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
        );

        try {
            await Promise.all(deletePromises);
            setComments([]); // Clear comments on successful deletion
        } catch (err: any) {
            setError("Failed to delete all comments. Some may have been removed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <img src="https://img1.picmix.com/output/stamp/normal/7/0/0/7/2747007_5fa3a.png" alt="Analyzer Icon" className="h-12 w-12" />
                        <h1 className="text-3xl font-bold text-cyan-900">JudolDetector88</h1>
                    </div>
                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">{user.displayName}</span>
                                <button onClick={handleLogout} className="btn-danger font-bold py-2 px-4 rounded transition-colors">Logout</button>
                            </div>
                        ) : (
                            <button onClick={handleLogin} className="btn-google font-bold py-2 px-4 rounded inline-flex items-center transition-colors">
                                <i className="fab fa-google mr-2"></i><span>Login with Google</span>
                            </button>
                        )}
                    </div>
                </header>

                <main>
                    <div className="card p-6 rounded-lg mb-6 shadow-sm">
                        <label htmlFor="video-id-input" className="block text-lg font-medium mb-2 text-gray-800">YouTube Video URL or ID</label>
                        <div className="flex gap-4">
                            <input type="text" id="video-id-input" placeholder="e.g., dQw4w9WgXcQ" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3" value={videoId} onChange={e => setVideoId(e.target.value)} />
                            <button onClick={handleSearch} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors btn">Search</button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {user && (
                            <div className="card p-6 rounded-lg shadow-sm">
                                <label className="block text-lg font-medium mb-2 text-gray-800">Add Comments (Batch)</label>
                                <p className="text-sm text-gray-500 mb-3">Upload a .txt file with comments separated by semicolons.</p>
                                <input type="file" accept=".txt" onChange={e => setCommentsFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
                                <button onClick={handleBatchPost} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors btn">Post from File</button>
                            </div>
                        )}
                        <div className={`card p-6 rounded-lg shadow-sm ${!user ? 'md:col-span-2' : ''}`}>
                            <label htmlFor="algorithm-select" className="block text-lg font-medium mb-2 text-gray-800">Search Algorithm</label>
                            <select id="algorithm-select" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 mb-4" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                                <option>Regex</option><option>KMP</option><option>BM</option><option>Rabin-Karp</option>
                            </select>
                            {algorithm !== 'Regex' && (
                                <>
                                    <label htmlFor="patterns-file" className="block text-md font-medium mb-2 text-gray-800">Search Patterns (.txt)</label>
                                    <p className="text-sm text-gray-500 mb-3">Upload a .txt file with search patterns separated by new lines.</p>
                                    <input type="file" id="patterns-file" accept=".txt" onChange={e => setPatternsFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300" />
                                </>
                            )}
                        </div>
                    </div>
                    
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                    <div className="card p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-900">Found Comments</h2>
                            {user && comments.length > 0 && (
                                <button onClick={handleDeleteAll} disabled={isLoading} className="btn-danger text-sm font-bold py-2 px-4 rounded btn">Delete All Found</button>
                            )}
                        </div>
                        {isLoading ? <Spinner /> : (
                            <div className="space-y-4">
                                {comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <div>
                                                <p className="font-bold text-gray-800">{comment.author}</p>
                                                <p className="text-gray-600 break-all">{comment.text}</p>
                                            </div>
                                            {user && <button onClick={() => handleDelete(comment.id)} className="text-red-500 hover:text-red-400 ml-4"><i className="fas fa-trash"></i></button>}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No comments found. Try a new search.</p>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;
