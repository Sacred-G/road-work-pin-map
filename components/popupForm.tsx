import { useForm } from "@mantine/form";
import { useSession } from "next-auth/react";
import {
  Card,
  Image,
  TextInput,
  Stack,
  Flex,
  Checkbox,
  Button,
  Autocomplete,
  LoadingOverlay,
  HoverCard,
  Box,
  FileInput,
  Notification,
} from "@mantine/core";
import { createPin } from "../lib/actions";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconX } from '@tabler/icons-react';

import CenterPin from "./centerPin";

export default function PopupForm({
  latitude,
  longitude,
  fetchPins,
  setShowCreateForm,
  setPopupInfo,
  showCreateForm,
}: {
  latitude: number;
  longitude: number;
  fetchPins: () => void;
  setShowCreateForm: (show: boolean) => void;
  setPopupInfo: (info: any) => void;
  showCreateForm: boolean;
}) {
  const { data: session, status } = useSession();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const [visible, { toggle }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      image_file: null,
      image_url: "",
      pin_name: "",
      category: "",
      description: "",
      is_active: true,
    },
  });

  const handleSubmit = async (formValues: any) => {
    toggle();
    setError(null);
    const formData = new FormData();
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    console.log('Session user:', session?.user);
    console.log('Session user ID:', session?.user?.id);

    if (!session?.user?.id) {
      setError('User ID is missing. Please try logging out and logging in again.');
      toggle();
      return;
    }

    formData.append('user_id', session.user.id.toString());

    for (const key in formValues) {
      if (key === 'image_file' && formValues[key]) {
        formData.append(key, formValues[key]);
      } else if (key === 'is_active') {
        formData.append(key, formValues[key].toString());
      } else {
        formData.append(key, formValues[key]);
      }
    }

    try {
      const res = await createPin(formData);
      form.reset();
      setShowCreateForm(false);
      setPopupInfo(res);
      fetchPins();
    } catch (error) {
      console.error('Error creating pin:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred while creating the pin');
    } finally {
      toggle();
    }
  };

  const fetchCategories = async () => {
    const res = await fetch(`/api/category`, {
      cache: "no-store",
    });
    const data = await res.json();
    const categories = data.map((category: { category: string }) => {
      return category.category;
    });
    setCategories(categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (status !== "authenticated" || !session?.user?.id || !showCreateForm) {
    return <></>;
  }

  return (
    <>
      <CenterPin />
      <Box
        pos={"absolute"}
        style={{
          zIndex: 10,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, 15px)",
        }}
      >
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <LoadingOverlay
            visible={visible}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Card>
            <Stack gap={10}>
              {error && (
                <Notification icon={<IconX size="1.1rem" />} color="red" onClose={() => setError(null)}>
                  {error}
                </Notification>
              )}
              <FileInput
                label="Upload Image"
                accept="image/*"
                placeholder="Choose image"
                {...form.getInputProps('image_file')}
              />
              <HoverCard width={300} shadow="md" position="top">
                <HoverCard.Target>
                  <TextInput
                    label="Image URL (optional)"
                    placeholder="https://example.com/image.jpg"
                    {...form.getInputProps("image_url")}
                  />
                </HoverCard.Target>

                {form.values.image_url && (
                  <HoverCard.Dropdown>
                    <Image
                      src={form.values.image_url}
                      alt={form.values.pin_name}
                      height={100}
                      width={100}
                      fit="cover"
                    />
                  </HoverCard.Dropdown>
                )}
              </HoverCard>

              <TextInput
                label="Pin Name"
                placeholder="Pin Name"
                required
                {...form.getInputProps("pin_name")}
              />
              <TextInput
                label="Description"
                placeholder="Description"
                required
                {...form.getInputProps("description")}
              />
              <TextInput
                label="Location"
                placeholder="Location ="
                required
                {...form.getInputProps("location")}
              />
              <Autocomplete
                label="Select Category"
                placeholder="Pick or enter category"
                required
                data={categories}
                maxDropdownHeight={200}
                {...form.getInputProps("category")}
              />
              <Flex direction="row" gap={10}>
                <Checkbox
                  label="Active"
                  color="green"
                  checked={form.values.is_active}
                  {...form.getInputProps("is_active")}
                ></Checkbox>
              </Flex>
              <Flex direction="row" gap={10}>
                <Button type="submit">Submit</Button>
                <Button color="red" type="reset">
                  Reset
                </Button>
              </Flex>
            </Stack>
          </Card>
        </form>
      </Box>
    </>
  );
}
