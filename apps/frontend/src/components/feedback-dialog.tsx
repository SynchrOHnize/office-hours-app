import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { sendFeedback } from "@/services/userService";
import toast from "react-hot-toast";

export const FeedbackDialog = () => {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>("");

    const handleSubmit = async () => {
        console.log("Rating:", rating);
        console.log("Feedback:", feedback);
        if (rating === 0 || feedback === "") {
            toast.error("Rating and feedback cannot be empty.")
            return
        }

        try {
            const payload = await sendFeedback(rating, feedback);
            if (payload && payload.statusCode === 200) {
                toast.success("Feedback submitted successfully!"); // Show success toast
                setFeedback("");
                setRating(0);
            } else {
                toast.error("Failed to submit feedback. Please try again."); // Show error toast on failure
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later."); // Show error toast on exception
        }
    };

    return (
        <>
            <Dialog>
                <DialogTrigger className="hover:text-muted-foreground">Leave Feedback</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Leave Us Feedback!</DialogTitle>
                    </DialogHeader>
                    <hr className="my-4 border-dotted border-1 border-gray-200" />
                    <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write your feedback here..."
                    />
                    <div className="flex items-center justify-center">
                        {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;

                            return (
                                <label key={i}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                        className="hidden"
                                    />
                                    <FaStar
                                        className="star"
                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        size={36}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            );
                        })}
                    </div>
                    <hr className="my-4 border-dotted border-1 border-gray-300" />
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogContent>
            </Dialog>
        </>
    );
};