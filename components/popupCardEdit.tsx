import { IconEdit } from "@tabler/icons-react";
import {
  Button,
  Card,
  TextInput,
  Stack,
  Flex,
  Checkbox,
  Skeleton,
  LoadingOverlay,
} from "@mantine/core";
import { useState } from "react";
import { editPin } from "../lib/actions";
import { useForm } from "@mantine/form";
import PopupCardDisplay from "./popupCardDisplay";
import { useDisclosure } from "@mantine/hooks";

export default function PopupCardEdit({
  pinData,
  fetchPins,
  setIsEditing,
  setPopupInfo,
}: {
  pinData: any;
  fetchPins: () => void;
  setIsEditing: (isEditing: boolean) => void;
  setPopupInfo: (info: any) => void;
}) {
  const [visible, setVisible] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      pin_id: pinData.id,
      image_url: pinData.image_url,
      pin_name: pinData.pin_name,
      category: pinData.category,
      description: pinData.description,
      is_active: pinData.is_active,
    },
  });

  const handleSubmit = async (formValues: any) => {
    setVisible.open();;
    try {
      const res = await editPin(formValues);
      setIsEditing(false);
      fetchPins();
      setPopupInfo(res);
      form.reset();
    } catch (error) {
      console.error(error);
      setError("Failed to edit the pin. Please try again.");
    } finally {
      setVisible.close();
    }
  };

  return (
    <>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Card>
          <LoadingOverlay
            visible={visible}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
          <Stack gap={10}>
            <TextInput
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              required
              {...form.getInputProps("image_url")}
            />
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
              label="Category"
              placeholder="Category"
              required
              {...form.getInputProps("category")}
            />
            <Flex direction="row" gap={10}>
              <Checkbox
                label="Active"
                checked={form.values.is_active}
                {...form.getInputProps("is_active")}
              ></Checkbox>
            </Flex>
            <Flex direction="row" gap={10}>
              <Button type="submit">Submit</Button>
              <Button
                type="reset"
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </Flex>
          </Stack>
        </Card>
      </form>
    </>
  );
}
