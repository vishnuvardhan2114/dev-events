'use server';

import { Event, EventDocument } from "@/database";
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event: EventDocument | null = await Event.findOne({ slug });
        if (!event) return [];
        return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();
   } catch {
      return [];
   }
};