import { Card, Image, Text, Badge, Group, Spoiler } from "@mantine/core";
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
}
interface PopupInfoProps {
  popupInfo: PopupInfo;
}

export default function PopupCardDisplay({ popupInfo }:  PopupInfoProps) {
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
        Updated {formatDateTime(popupInfo.updated_at)}
      </Text>
      <Text size="md" c="darkgray">
        By {popupInfo.name}
      </Text>
    </Card>
  );
}
