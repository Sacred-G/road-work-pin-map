import { ChangeEvent, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { IconChevronRight } from "@tabler/icons-react";
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
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useForm } from "@mantine/form";
import '../styles/globals.css'; // Import global styles if necessary
import { fetchCategories, fetchUsers, fetchPinsList } from "@/lib/data";
import './navbar.css';
import ControlPanel from "./controlPanel";

interface NavbarProps {
  setRoute: (addressA: string, addressB: string) => void;
  route?: string; // Assuming you want to pass a route prop optionally
  longitude: number;
  latitude: number;
  handleShowCreateForm: () => void;
  showCreateForm: boolean;
}

const accessToken = 'pk.eyJ1Ijoic2JvdWxkaW4iLCJhIjoiY2x2ajMxdHUyMTkxMDJpcHUydzZxMzV4ZSJ9.lsPxcmST-IYlN7BgejSRhw'; // Replace with your Mapbox access token

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}`);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return [longitude, latitude];
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

async function fetchAddressSuggestions(query: string) {
  if (!query) return [];
  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}`);
    const data = await response.json();
    if (data.features) {
      return data.features.map((feature: any) => ({
        value: feature.place_name,
        coordinates: feature.center,
      }));
    }
  } catch (error) {
    console.error("Error fetching address suggestions:", error);
  }
  return [];
}

export default function Navbar({ setRoute, longitude, latitude, handleShowCreateForm, showCreateForm }: NavbarProps) {
  const { data: session, status } = useSession();
  const userName = session?.user?.name;
  const userIcon = session?.user?.image;
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm({
    initialValues: {
      category: searchParams.get("category") || "",
      user: searchParams.get("user") || "",
      pin_name: searchParams.get("pin_name") || "",
      addressA: "",
      addressB: "",
    },
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [pinsList, setPinsList] = useState<string[]>([]);
  const [isHidden, setIsHidden] = useState(true);
  const [addressSuggestionsA, setAddressSuggestionsA] = useState<any[]>([]);
  const [addressSuggestionsB, setAddressSuggestionsB] = useState<any[]>([]);
  const smallDisplay = useMediaQuery("(max-width: 830px)");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categories = await fetchCategories();
        setCategories(categories);
        const users = await fetchUsers();
        setUsers(users);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
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
  }, [searchParams]);

  const handleSubmit = ({
    category,
    user,
    pin_name,
    addressA,
    addressB,
  }: {
    category: string;
    user: string;
    pin_name: string;
    addressA: string;
    addressB: string;
  }) => {
    const params = new URLSearchParams();
    if (category.length > 0) {
      params.set("category", category);
    }
    if (user.length > 0) {
      params.set("user", user);
    }
    if (pin_name.length > 0) {
      params.set("pin_name", pin_name);
    }
    router.push("map?" + params.toString());

    // Set route if both addresses are provided
    if (addressA && addressB) {
      setRoute(addressA, addressB);
    }
  };

  const handleAddressAChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.currentTarget.value;
    form.setFieldValue('addressA', query);
    const suggestions = await fetchAddressSuggestions(query);
    setAddressSuggestionsA(suggestions.map((s: { value: any; }) => s.value));
  };

  const handleAddressBChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.currentTarget.value;
    form.setFieldValue('addressB', query);
    const suggestions = await fetchAddressSuggestions(query);
    setAddressSuggestionsB(suggestions.map((s: { value: any; }) => s.value));
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
      ></Burger>
      <Flex
        className="glass-effect"
        direction="column"
        py={10}
        w={220}
        h={"100vh"}
        justify={"space-between"}
        pos={"absolute"}
        style={{ zIndex: 3 }}
        px={10}
        display={smallDisplay ? (isHidden ? "none" : "flex") : "flex"}
      >
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Stack gap={"md"} pt={30}>
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
          </Stack>
        </form>

        <ControlPanel
          longitude={longitude}
          latitude={latitude}
          handleShowCreateForm={handleShowCreateForm}
          showCreateForm={showCreateForm}
        />

        <Stack gap={0}>
          <Divider />
          {status === "authenticated" && (
            <Group wrap="nowrap">
              <Avatar variant="filled" radius={"xl"} src={userIcon}></Avatar>
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
            <NavLink
              component={Link}
              href="/api/auth/signin"
              label="Login"
              rightSection={<IconChevronRight size="1rem" stroke={1.5} />}
              color="gray"
            />
          )}
        </Stack>
      </Flex>
    </>
  );
}
