import mongoose, { type Model } from "mongoose";
import { Event } from "./event.model";

interface BookingDocument extends mongoose.Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema<BookingDocument>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index on eventId for faster queries when filtering bookings by event
bookingSchema.index({ eventId: 1 });

// Pre-save hook: verify referenced event exists before saving booking
bookingSchema.pre("save", async function (next) {
  try {
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      return next(new Error(`Event with ID ${this.eventId} does not exist`));
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      return next(new Error(`Error validating event: ${error.message}`));
    }
    return next(new Error("Error validating event reference"));
  }
});

const Booking: Model<BookingDocument> =
  mongoose.models.Booking || mongoose.model<BookingDocument>("Booking", bookingSchema);

export { Booking, type BookingDocument };

