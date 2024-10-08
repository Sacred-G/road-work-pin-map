export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);

  // Example format: '12/27/2023, 16:31'
  const formatDateTime = date.toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Change to true if you want 12-hour format
  });

  return formatDateTime;
}
