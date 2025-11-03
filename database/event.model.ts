import mongoose, { type Model, Schema } from "mongoose";

interface EventDocument extends mongoose.Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: "Agenda must be a non-empty array",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags is required"],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: "Tags must be a non-empty array",
      },
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function (next) {
  // Generate URL-friendly slug from title: lowercase, remove special chars, replace spaces with hyphens
  // Only regenerate if title changed to preserve manually set slugs
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // Normalize date to ISO format (YYYY-MM-DD) if not already in that format
  if (this.isModified("date")) {
    const dateValue = this.date.trim();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateValue)) {
      try {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
          const day = String(parsedDate.getDate()).padStart(2, "0");
          this.date = `${year}-${month}-${day}`;
        } else {
          return next(new Error("Invalid date format. Expected YYYY-MM-DD or a valid date string"));
        }
      } catch {
        return next(new Error("Invalid date format. Expected YYYY-MM-DD or a valid date string"));
      }
    }
  }

  // Normalize time format: standardize to HH:MM AM/PM format
  if (this.isModified("time")) {
    this.time = this.time.trim();
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]\s*(AM|PM)?$/i;
    if (!timeRegex.test(this.time)) {
      try {
        const timeParts = this.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1], 10);
          const minutes = timeParts[2];
          const period = timeParts[3]?.toUpperCase();

          if (period === "PM" && hours !== 12) {
            hours += 12;
          } else if (period === "AM" && hours === 12) {
            hours = 0;
          }

          this.time = `${String(hours).padStart(2, "0")}:${minutes} ${period || ""}`.trim();
        }
      } catch {
        return next(new Error("Invalid time format. Expected HH:MM AM/PM or HH:MM"));
      }
    }
  }

  // Validate all required fields are non-empty

  const requiredStringFields: (keyof EventDocument)[] = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredStringFields) {
    if (!this[field] || (typeof this[field] === "string" && this[field].trim().length === 0)) {
      return next(new Error(`${String(field)} cannot be empty`));
    }
  }

  if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
    return next(new Error("Agenda must be a non-empty array"));
  }

  if (!Array.isArray(this.tags) || this.tags.length === 0) {
    return next(new Error("Tags must be a non-empty array"));
  }

  next();
});

const Event: Model<EventDocument> =
  mongoose.models.Event || mongoose.model<EventDocument>("Event", eventSchema);

export { Event, type EventDocument };

