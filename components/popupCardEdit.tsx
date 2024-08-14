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

// Defining and exporting a functional component named PopupCardEdit
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
  // Initializing state variables using useState hook
  const [visible, setVisible] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);

  // Initializing form state with initial values using useForm hook
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

  // Async function to handle form submission
  const handleSubmit = async (formValues: any) => {
    setVisible.open(); // Show loading overlay
    try {
      const res = await editPin(formValues); // Call editPin function
      setIsEditing(false); // Set isEditing state to false
      fetchPins(); // Fetch updated pin data
      setPopupInfo(res); // Set popup info with response data
      form.reset(); // Reset form values
    } catch (error) {
      console.error(error);
      setError("Failed to edit the pin. Please try again."); // Set error message
    } finally {
      setVisible.close(); // Hide loading overlay
    }
  };

  // Rendering form with input fields, buttons, and error message
  return (
    <>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Card>
          <LoadingOverlay
            visible={visible} // Set loading overlay visibility
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>} {/* Render error message if exists */}
          <Stack gap={10}>
            {/* Input fields for pin details */}
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
              {/* Checkbox for pin activity status */}
              <Checkbox
                label="Active"
                checked={form.values.is_active}
                {...form.getInputProps("is_active")}
              ></Checkbox>
            </Flex>
            <Flex direction="row" gap={10}>
              {/* Submit and cancel buttons */}
              <Button type="submit">Submit</Button>
              <Button
                type="reset"
                onClick={() => {
                  setIsEditing(false); // Set isEditing state to false on cancel
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