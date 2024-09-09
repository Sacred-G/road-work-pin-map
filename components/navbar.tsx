"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { IconChevronRight, IconSun, IconMoon } from "@tabler/icons-react";
import {
  Button,
  Flex,
  NavLink,
  Stack,
  Autocomplete,
  Group,
  Avatar,
  Divider,
  Burger,
  Text,
  ScrollArea,
  Modal,
  ActionIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@mantine/form";
import "./glassEffect.css";
import { fetchCategories, fetchUsers, fetchPinsList } from "../lib/data";
import mapboxgl from "mapbox-gl";
import Auth from "./auth";
import WeatherWidget from "./WeatherWidget";
import { ColorScheme } from "../types/colorscheme";

mapboxgl.accessToken = "pk.eyJ1Ijoic2JvdWxkaW4iLCJhIjoiY2x2ajMxdHUyMTkxMDJpcHUydzZxMzV4ZSJ9.lsPxcmST-IYlN7BgejSRhw";

// Wrapper component to handle search params
function SearchParamsWrapper({ children }: { children: (params: URLSearchParams) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const safeSearchParams = searchParams || new URLSearchParams();
  return <>{children(safeSearchParams)}</>;
}

interface NavbarProps {
  toggleColorScheme: (value?: ColorScheme) => void;
}

export default function Navbar({ toggleColorScheme }: NavbarProps) {
  const { data: session, status } = useSession();
  const userName = session?.user?.name;
  const userIcon = session?.user?.image;
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [pinsList, setPinsList] = useState([]);
  const [isHidden, setIsHidden] = useState(true);
  const smallDisplay = useMediaQuery("(max-width: 830px)");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // State to hold search parameters
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    } else {
      return new URLSearchParams();
    }
  });

  // Fetch pins based on search parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchData = async () => {
        try {
          const category = searchParams.get("category");
          const user = searchParams.get("user");
          const pin_name = searchParams.get("pin_name");
          const pins = await fetchPinsList(category, user, pin_name);
          setPinsList(pins);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, [searchParams]);

  // Form initialization
  const form = useForm({
    initialValues: {
      category: searchParams.get("category") || "",
      user: searchParams.get("user") || "",
      pin_name: searchParams.get("pin_name") || "",
    },
  });

  // Handle form submission
  const handleSubmit = (values: { category: string; user: string; pin_name: string }) => {
    const params = new URLSearchParams();
    if (values.category) params.set("category", values.category);
    if (values.user) params.set("user", values.user);
    if (values.pin_name) params.set("pin_name", values.pin_name);
    router.push("map?" + params.toString());
    setSearchParams(params); // Update the state
    if (smallDisplay) {
      setIsHidden(true); // Hide navbar on small screens after submission
    }
  };

  // Function to create Google Maps link
  const createGoogleMapsLink = (latitude: number, longitude: number, pin_name: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${"pin_name"}+${"latitude"},${"longitude"}`;
  };

  return (
    <>
      <Burger
        pos={"absolute"}
        top={15}
        left={5}
        size={"lg"}
        opened={!isHidden}
        onClick={() => setIsHidden(!isHidden)}
        display={smallDisplay ? "flex" : "none"}
        style={{ zIndex: 4 }}
      />
      <Flex
        className="glass-effect glass-navbar"
        direction="column"
        py={10}
        w={smallDisplay ? "100%" : 220}
        h={smallDisplay ? "auto" : "100vh"}
        justify={"space-between"}
        pos={"absolute"}
        style={{ zIndex: 3 }}
        px={10}
        display={smallDisplay ? (isHidden ? "none" : "flex") : "flex"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={"md"} pt={smallDisplay ? 50 : 30}>
            <Autocomplete
              label="Search"
              placeholder="Search"
              maxDropdownHeight={200}
              data={pinsList}
              {...form.getInputProps("pin_name")}
            />
            <Button type="submit">Search</Button>
            <Divider />
            <Autocomplete
              label="Select Category"
              placeholder="Pick or enter category"
              data={categories}
              maxDropdownHeight={200}
              {...form.getInputProps("category")}
            />
            <Autocomplete
              label="Select User"
              placeholder="Pick or enter user"
              data={users}
              maxDropdownHeight={200}
              {...form.getInputProps("user")}
            />
            <Button type="submit">Apply filter</Button>
          </Stack>
        </form>

        <Divider my="sm" />

        <ScrollArea h={smallDisplay ? 200 : 300}>
          <Stack gap={"md"} pt={30}>
            <WeatherWidget />
          </Stack>
        </ScrollArea>

        <Stack gap={0}>
          <Divider />
          {status === "authenticated" && (
            <Group wrap="nowrap">
              <Avatar variant="filled" radius={"xl"} src={userIcon} />
              <NavLink
                component={Link}
                href="/login"
                label={userName}
                rightSection={<IconChevronRight size="1rem" stroke={1.5} />}
                color="gray"
              />
            </Group>
          )}
          {status === "authenticated" ? (
            <Button onClick={() => signOut()}>Sign out</Button>
          ) : (
            <Button component={Link} href="/auth">Login / Register</Button>
          )}
          <Group justify="center" mt="xs">
            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              <IconSun size="1.2rem" style={{ display: 'var(--icon-sun-display)' }} />
              <IconMoon size="1.2rem" style={{ display: 'var(--icon-moon-display)' }} />
            </ActionIcon>
          </Group>
        </Stack>
      </Flex>
    </>
  );
}
