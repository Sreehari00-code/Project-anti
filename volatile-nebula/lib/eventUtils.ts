// Shared utility for Event status
export const computeStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.date);

    if (event.isDisabled) return 'Not Available';
    if (eventDate < now) return 'Completed';
    if (eventDate.toDateString() === now.toDateString()) return 'Ongoing';
    return 'Upcoming';
};
