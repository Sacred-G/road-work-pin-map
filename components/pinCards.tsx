import React from 'react';
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';

interface PinCardsProps {
  pinsData: Array<any>; // Replace 'any' with your actual pin data type
  hoveredPin: number | null;
  onCardHover: (index: number | null) => void;
}

const PinCards: React.FC<PinCardsProps> = ({ pinsData, hoveredPin, onCardHover }) => {
  return (
    <div>
      {pinsData.map((pin, index) => (
        <Card
          key={pin.id}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{
            marginBottom: '1rem',
            transform: `scale(${hoveredPin === index ? 1.05 : 1})`,
            transition: 'transform 0.3s ease-in-out',
          }}
          onMouseEnter={() => onCardHover(index)}
          onMouseLeave={() => onCardHover(null)}
        >
          <Card.Section>
            <Image
              src={pin.image_url}
              height={160}
              alt={pin.pin_name}
            />
          </Card.Section>

          <Group position="apart" mt="md" mb="xs">
            <Text weight={500}>{pin.pin_name}</Text>
            <Badge color="pink" variant="light">
              {pin.category}
            </Badge>
          </Group>

          <Text size="sm" color="dimmed">
            {pin.description}
          </Text>

          <Button
            variant="light"
            color="blue"
            fullWidth
            mt="md"
            radius="md"
            component="a"
            href={`https://www.google.com/maps/@${pin.latitude},${pin.longitude},3a,75y,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Street View
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default PinCards;