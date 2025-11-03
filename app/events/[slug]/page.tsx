import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    const { slug } = await params;
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <EventDetails slug={slug} />
            </Suspense>
        </main>
    )
}

export default EventDetailsPage