import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function StarRating({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(star)}
          className={cn("transition-colors", disabled ? "cursor-default" : "cursor-pointer hover:scale-110")}
        >
          <Star className={cn("h-5 w-5", star <= value ? "fill-secondary text-secondary" : "text-muted-foreground/30")} />
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myReviews = [] } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => base44.entities.Review.filter({ reviewee_id: user.id }, '-created_date'),
  });

  const { data: completedLoads = [] } = useQuery({
    queryKey: ['completed-for-review'],
    queryFn: async () => {
      const isDriver = user?.account_type === 'driver';
      const loads = isDriver
        ? await base44.entities.Load.filter({ assigned_driver_user_id: user.id, status: 'delivered' })
        : await base44.entities.Load.filter({ shipper_user_id: user.id, status: 'delivered' });
      return loads;
    },
  });

  const { data: givenReviews = [] } = useQuery({
    queryKey: ['given-reviews'],
    queryFn: () => base44.entities.Review.filter({ reviewer_id: user.id }),
  });

  const reviewedLoadIds = new Set(givenReviews.map(r => r.load_id));
  const unreviewedLoads = completedLoads.filter(l => !reviewedLoadIds.has(l.id));

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', professionalism: 5, communication: 5, timeliness: 5 });
  const [reviewLoadId, setReviewLoadId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const submitReview = useMutation({
    mutationFn: async () => {
      const load = completedLoads.find(l => l.id === reviewLoadId);
      if (!load) return;
      const isDriver = user?.account_type === 'driver';
      await base44.entities.Review.create({
        load_id: reviewLoadId,
        reviewer_id: user.id,
        reviewee_id: isDriver ? load.shipper_user_id : load.assigned_driver_user_id,
        reviewer_type: isDriver ? 'driver' : 'shipper',
        ...reviewForm,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['given-reviews'] });
      setDialogOpen(false);
      setReviewForm({ rating: 5, comment: '', professionalism: 5, communication: 5, timeliness: 5 });
    },
  });

  const avgRating = myReviews.length > 0
    ? (myReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / myReviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Reviews & Ratings</h1>

      {/* Summary */}
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold">{avgRating}</p>
            <StarRating value={Math.round(Number(avgRating))} disabled />
            <p className="text-sm text-muted-foreground mt-1">{myReviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = myReviews.filter(r => Math.round(r.rating) === star).length;
              const pct = myReviews.length > 0 ? (count / myReviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 fill-secondary text-secondary" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-xs text-muted-foreground text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending reviews to give */}
      {unreviewedLoads.length > 0 && (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardHeader><CardTitle className="text-lg">Leave a Review</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {unreviewedLoads.map(load => (
              <div key={load.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div>
                  <p className="text-sm font-semibold">{load.title}</p>
                  <p className="text-xs text-muted-foreground">{load.pickup_city} → {load.delivery_city}</p>
                </div>
                <Dialog open={dialogOpen && reviewLoadId === load.id} onOpenChange={o => { setDialogOpen(o); if (o) setReviewLoadId(load.id); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white">Review</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Leave a Review</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Overall Rating</p>
                        <StarRating value={reviewForm.rating} onChange={v => setReviewForm(p => ({ ...p, rating: v }))} />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Comment</p>
                        <Textarea value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} placeholder="How was your experience?" rows={3} />
                      </div>
                      <Button onClick={() => submitReview.mutate()} disabled={submitReview.isPending} className="w-full bg-secondary hover:bg-secondary/90 text-white">
                        Submit Review
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reviews received */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Reviews About You</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {myReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No reviews yet</p>
          ) : myReviews.map(review => (
            <div key={review.id} className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <StarRating value={review.rating} disabled />
                <span className="text-xs text-muted-foreground">{format(new Date(review.created_date), 'MMM d, yyyy')}</span>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              <Badge variant="outline" className="mt-2 capitalize text-xs">{review.reviewer_type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}