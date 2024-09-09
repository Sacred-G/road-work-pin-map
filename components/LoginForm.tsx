'use client';

import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Text, Paper, Group, Button, Divider, Anchor, Stack } from '@mantine/core';
import { signIn } from 'next-auth/react';

export function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      name: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length >= 6 ? null : 'Password should be at least 6 characters'),
      name: (val) => (isRegistering && val.length < 2 ? 'Name should be at least 2 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (isRegistering) {
      // Handle registration
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        // Registration successful, now sign in
        await signIn('credentials', { email: values.email, password: values.password, callbackUrl: '/map' });
      } else {
        // Handle registration error
        console.error('Registration failed');
      }
    } else {
      // Handle login
      await signIn('credentials', { email: values.email, password: values.password, callbackUrl: '/map' });
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder>
      <Text size="lg" w={500}>
        Welcome to React-Map, {isRegistering ? 'register' : 'login'} with
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {isRegistering && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              error={form.errors.name}
              radius="md"
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@example.com"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password}
            radius="md"
          />
        </Stack>

        <Group p="apart" mt="xl">
          <Anchor
            component="button"
            type="button"
            color="dimmed"
            onClick={() => setIsRegistering(!isRegistering)}
            size="xs"
          >
            {isRegistering
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl">
            {isRegistering ? 'Register' : 'Login'}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}