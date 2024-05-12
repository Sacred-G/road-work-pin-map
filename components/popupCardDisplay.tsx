import { Card, Image, Text, Badge, Group, Spoiler } from "@mantine/core";
import { formatDateTime } from "../lib/utils";

export default function PopupCardDisplay({ popupInfo }: { popupInfo: any }) {
  return (
    <Card shadow="md" padding="md" radius="md" withBorder>
      <Card.Section>
        <Image
          src={popupInfo.image_url}
          alt={popupInfo.pin_name}
          height={100}
          width={100}
         
        />
      </Card.Section>
      <Text fw={500} size="md">
        {popupInfo.pin_name}
      </Text>
      <Group gap={5}>
        <Badge color="pink">{popupInfo.category}</Badge>
        {popupInfo.is_active && <Badge color="green">Active</Badge>}
        {popupInfo.tag &&
          popupInfo.tag.map((tag: string, index: number) => (
            <Badge key={`tag${index}of${popupInfo.id}`}>{tag}</Badge>
          ))}
      </Group>

      <Spoiler maxHeight={520} showLabel="Show more" hideLabel="Hide">
        <Text c="#555" size="md">
          {popupInfo.description}
        </Text>
      </Spoiler>
      <Text size="md" c="dimmed">
        updated {formatDateTime(popupInfo.updated_at)}
      </Text>
      <Text size="md" c="darkgray">
        by {popupInfo.name}
      </Text>
    </Card>
  );
}
