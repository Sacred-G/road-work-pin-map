'use client';

import { Container, Title, Box, Group, Divider, Text, Button } from '@mantine/core';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import { LoginForm } from '../../components/LoginForm';

const titleStyle = {
  fontFamily: 'Greycliff CF, sans-serif',
  fontWeight: 900,
  textAlign: 'center',
  
};

export default function AuthPage() {
  return (
    <Container size={420} my={40}>
      <Title>
        Welcome to React-Map
      </Title>
      <Text color="dimmed" size="sm" p="center" mt={5}>
        Sign in or create an account to get started
      </Text>

      <Box mt={30}>
        <LoginForm />
      </Box>

      <Divider label="Or continue with" labelPosition="center" my="lg" />

      <Group grow mb="md" mt="md">
        <Button
          leftSection={<IconBrandGithub size={16} />}
          variant="default"
          onClick={() => signIn('github')}
        >
          GitHub
        </Button>
        <Button
          leftSection={<IconBrandGoogle size={16} />}
          variant="default"
          onClick={() => signIn('google')}
        >
          Google
        </Button>
      </Group>
    </Container>
  );
}