/**
 * Build a Google Calendar "Add event" URL.
 * Opens Google Calendar with a pre-filled event template.
 */

export function buildGoogleCalendarUrl(params: {
  title: string;
  startDate: Date;
  endDate: Date;
  details?: string;
  location?: string;
}): string {
  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const searchParams = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${format(params.startDate)}/${format(params.endDate)}`,
  });

  if (params.details) searchParams.set("details", params.details);
  if (params.location) searchParams.set("location", params.location);

  return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}
