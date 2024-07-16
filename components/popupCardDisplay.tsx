import { Card, Image, Text, Badge, Group, Spoiler, Button } from "@mantine/core";
import { formatDateTime } from "../lib/utils";

interface PopupInfo {
  id: string;
  pin_name: string;
  image_url: string;
  category: string;
  is_active: boolean;
  tag?: string[];
  description: string;
  created_at: string;
  updated_at: string;
  name: string;
  latitude: number;
  longitude: number;
}

const fallbackFormatDate = (dateString: string): string => {
  // Try parsing the date string directly
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // If direct parsing fails, try alternative formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, // ISO format
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/, // MySQL format
    /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, // Current format in utils
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      const [, year, month, day, hour, minute] = match;
      return `${month}/${day}/${year}, ${hour}:${minute}`;
    }
  }

  // If all parsing attempts fail
  console.error("Unable to parse date string:", dateString);
  return "Date not available";
};

export default function PopupCardDisplay({ popupInfo }: { popupInfo: PopupInfo }) {
  const streetViewUrl = `https://www.google.com/maps/@${popupInfo.latitude},${popupInfo.longitude},3a,75y,90t/data=!3m6!1e1!3m4!1s${popupInfo.id}!2e0!7i16384!8i8192`;

  const formattedDate = (() => {
    try {
      const formattedByUtil = formatDateTime(popupInfo.updated_at);
      if (formattedByUtil === "Invalid Date") {
        throw new Error("Util function returned Invalid Date");
      }
      return formattedByUtil;
    } catch (error) {
      console.error("Error formatting date with util function:", error);
      return fallbackFormatDate(popupInfo.updated_at);
    }
  })();

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Card.Section>
        <Image src={popupInfo.image_url} alt={popupInfo.pin_name} fit="cover" />
      </Card.Section>
      <Text fw={600} size="lg">
        {popupInfo.pin_name}
      </Text>
      <Group gap={5}>
        <Badge color="pink">{popupInfo.category}</Badge>
        {popupInfo.is_active && <Badge color="green">Active</Badge>}
        {popupInfo.tag && popupInfo.tag.map((tag, index) => (
          <Badge key={`tag${index}of${popupInfo.id}`}>{tag}</Badge>
        ))}
      </Group>

      <Spoiler maxHeight={420} showLabel="Show more" hideLabel="Hide">
        <Text c="#555" size="md">
          {popupInfo.description}
        </Text>
      </Spoiler>
      <Text size="md" c="dimmed">
        Updated {formattedDate}
      </Text>
      <Text size="md" c="darkgray">
        By {popupInfo.name}
      </Text>
      <Button 
        component="a" 
        href={streetViewUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        mt="sm"
      >
        View on Google Street View
      </Button>
    </Card>
  );
}
