'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Mock user types
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  provider: 'github' | 'google';
}

// Mock comment type
interface Comment {
  id: string;
  projectId: string;
  user: User;
  text: string;
  timestamp: Date;
}

interface CommentsSectionProps {
  projectId: string;
}

// Mock Authentication State (replace with actual auth logic)
type AuthState = User | null;

// Mock API functions (replace with actual API calls)
const fetchComments = async (projectId: string): Promise<Comment[]> => {
  console.log(`Fetching comments for project ${projectId}...`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return mock comments stored in localStorage or an empty array
  const storedComments = localStorage.getItem(`comments_${projectId}`);
  const comments = storedComments ? JSON.parse(storedComments) : [];
  // Ensure timestamps are Date objects
  return comments.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
};

const postComment = async (projectId: string, user: User, text: string): Promise<Comment> => {
    console.log(`Posting comment for project ${projectId}...`);
  const newComment: Comment = {
    id: `c${Date.now()}-${Math.random().toString(16).slice(2)}`, // Simple unique ID
    projectId,
    user,
    text,
    timestamp: new Date(),
  };
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Store in localStorage
  const storedComments = localStorage.getItem(`comments_${projectId}`);
  const comments = storedComments ? JSON.parse(storedComments) : [];
  comments.push(newComment);
  localStorage.setItem(`comments_${projectId}`, JSON.stringify(comments));

  return newComment;
};


export default function CommentsSection({ projectId }: CommentsSectionProps) {
  const [authState, setAuthState] = useState<AuthState>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load comments and check auth state on mount (client-side only)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Check localStorage for saved auth state
      const savedUser = localStorage.getItem('authUser');
      if (savedUser) {
        setAuthState(JSON.parse(savedUser));
      }
      const fetchedComments = await fetchComments(projectId);
      setComments(fetchedComments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setIsLoading(false);
    };
    loadData();
  }, [projectId]);

  // Mock Login Functions
  const handleGitHubLogin = () => {
    const githubUser: User = {
      id: 'gh-12345',
      name: 'GitHub User',
      avatarUrl: 'https://github.com/github.png', // Placeholder
      provider: 'github',
    };
    setAuthState(githubUser);
     localStorage.setItem('authUser', JSON.stringify(githubUser)); // Persist login
  };

  const handleGoogleLogin = () => {
      const googleUser: User = {
        id: 'g-67890',
        name: 'Google User',
        // Add a placeholder Google avatar if available, otherwise use fallback
        avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s64-c', // Example placeholder
        provider: 'google',
      };
      setAuthState(googleUser);
      localStorage.setItem('authUser', JSON.stringify(googleUser)); // Persist login
    };

   const handleLogout = () => {
       setAuthState(null);
       localStorage.removeItem('authUser'); // Clear persisted login
   };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !authState || isPosting) return;

    setIsPosting(true);
    try {
      const postedComment = await postComment(projectId, authState, newCommentText);
      setComments([postedComment, ...comments]); // Add to the top
      setNewCommentText('');
    } catch (error) {
      console.error("Failed to post comment:", error);
      // TODO: Show error toast to user
    } finally {
      setIsPosting(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
       const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
       let interval = seconds / 31536000; // years
       if (interval > 1) return Math.floor(interval) + " years ago";
       interval = seconds / 2592000; // months
       if (interval > 1) return Math.floor(interval) + " months ago";
       interval = seconds / 86400; // days
       if (interval > 1) return Math.floor(interval) + " days ago";
       interval = seconds / 3600; // hours
       if (interval > 1) return Math.floor(interval) + " hours ago";
       interval = seconds / 60; // minutes
       if (interval > 1) return Math.floor(interval) + " minutes ago";
       return Math.floor(seconds) + " seconds ago";
   };


  return (
    <Card>
       <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
      <CardContent className="space-y-6">
        {authState ? (
          <form onSubmit={handleCommentSubmit} className="space-y-4">
             <div className="flex items-center gap-4">
                 <Avatar className="h-10 w-10">
                   <AvatarImage src={authState.avatarUrl} alt={authState.name} />
                   <AvatarFallback>{authState.name.charAt(0).toUpperCase()}</AvatarFallback>
                 </Avatar>
                 <div className='flex-1'>
                    <p className="font-medium">{authState.name}</p>
                    <p className="text-xs text-muted-foreground">Posting as {authState.provider} user</p>
                 </div>
                 <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
             </div>
            <Textarea
              placeholder="Write your comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              rows={4}
              required
              disabled={isPosting}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newCommentText.trim() || isPosting}>
                {isPosting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-6 bg-secondary/50 rounded-lg p-4">
             <p className="text-muted-foreground">Log in to leave a comment.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={handleGitHubLogin} variant="outline">
                <Github className="mr-2 h-4 w-4" /> Login with GitHub
              </Button>
              <Button onClick={handleGoogleLogin} variant="outline">
                  {/* Basic Google Icon Placeholder */}
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,34.844,44,29.88,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                 Login with Google
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {isLoading ? (
          <div className="space-y-4">
             {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex items-start space-x-4">
                     <Avatar className="h-10 w-10">
                         <AvatarFallback>?</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 space-y-2">
                         <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                         <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
                     </div>
                 </div>
             ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{comment.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.timestamp)} via {comment.user.provider}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
           !authState && <p className="text-center text-muted-foreground py-4">Be the first to comment!</p>
        )}
      </CardContent>

    </Card>
  );
}
