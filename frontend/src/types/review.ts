export interface FeedbackReview {
  id: string;
  movieId: string;
  movieTitle?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}
