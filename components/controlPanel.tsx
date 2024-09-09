import * as React from "react";
import { Stack, Button, Text, Box, LoadingOverlay } from "@mantine/core";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import './glassEffect.css';

function round5(value: number) {
  return (Math.round(value * 1e5) / 1e5).toFixed(5);
}

interface ControlPanelProps {
  longitude: number;
  latitude: number;
  handleShowCreateForm: () => void;
  showCreateForm: boolean;
}

const AuthenticatedPanel = dynamic(() => Promise.resolve(({ longitude, latitude, handleShowCreateForm, showCreateForm }: ControlPanelProps) => (
  <Box
    className="glass-effect"
    style={{
      position: "absolute",
      top: "10px",
      right: "500px",
      borderRadius: "5px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    }}
  >
    <Stack p={10} gap={5}>
      <Text size="lg" fw={700}>
        Pin location
      </Text>
      <Text size="md">Drag the screen around</Text>
      <Text size="sm">Latitude</Text>
      <Text size="md">{round5(latitude)}</Text>
      <Text size="sm">Longitude</Text>
      <Text size="md">{round5(longitude)}</Text>
      {showCreateForm ? (
        <Button onClick={handleShowCreateForm} color="red">
          Cancel
        </Button>
      ) : (
        <Button onClick={handleShowCreateForm}>Add a pin</Button>
      )}
    </Stack>
  </Box>
)), { ssr: false });

function ControlPanel(props: ControlPanelProps) {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (status === "authenticated" && (session?.user?.id || session?.user?.email === "brent@pinmap.com")) {
    return <AuthenticatedPanel {...props} />;
  }

  if (status === "loading") {
    return (
      <Box
        style={{ position: "absolute", top: "10px", right: "230px" }}
        w={180}
        h={100}
      >
        <LoadingOverlay
          zIndex={1000}
          visible={true}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button
        style={{ position: "absolute", top: "10px", right: "230px" }}
        w={180}
        component={Link}
        href="/api/auth/signin"
        color="grey"
      >
        Sign in to pin location
      </Button>
    );
  }

  return null;
}

export default React.memo(ControlPanel);