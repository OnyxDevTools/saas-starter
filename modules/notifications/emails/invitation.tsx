// filename: modules/notifications/emails/invitation.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
export default function InvitationEmail({
  organization = "Your workspace",
  url = "https://example.test/invite",
  recipient = "team@example.test",
}: {
  organization?: string;
  url?: string;
  recipient?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>You’re invited to {organization}</Preview>
      <Body
        style={{
          backgroundColor: "#f5f0e7",
          fontFamily: "Arial,sans-serif",
          color: "#352b38",
        }}
      >
        <Container
          style={{
            backgroundColor: "#fffcf6",
            padding: "32px",
            margin: "32px auto",
            borderRadius: "12px",
          }}
        >
          <Heading>Join {organization}</Heading>
          <Text>
            An invitation was created for {recipient}. Sign in with that
            verified email address to accept it.
          </Text>
          <Button
            href={url}
            style={{
              backgroundColor: "#6d365f",
              color: "#fffcf6",
              padding: "12px 20px",
              borderRadius: "8px",
            }}
          >
            Review invitation
          </Button>
          <Text>
            This invitation expires in seven days. If you weren’t expecting it,
            you can ignore this message.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
