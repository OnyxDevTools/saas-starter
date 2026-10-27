// filename: app/app/[organizationId]/team/page.tsx
import Link from "next/link";
import { requireActor } from "@/modules/auth/session";
import { services } from "@/modules/services";
import { ActionButton } from "@/components/saas/action-form";
import { InviteForm } from "@/components/saas/invite-form";
export default async function Team({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params,
    actor = await requireActor(),
    s = services();
  const { membership } = await s.organizations.access(actor, organizationId),
    members = await s.organizations.team(actor, organizationId);
  const invitations =
    membership.role !== "member"
      ? await s.invitations.list(actor, organizationId)
      : [];
  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold">People make the workspace.</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          A place for everyone, with permissions that make sense.
        </p>
      </header>
      <section className="bg-card border-border overflow-x-auto rounded-xl border p-6">
        <h2 className="mb-5 font-semibold">Team members</h2>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Active organization memberships</caption>
          <thead>
            <tr>
              <th className="pb-3" scope="col">
                Person
              </th>
              <th scope="col">Role</th>
              <th scope="col">Manage</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-border border-t">
                <td className="py-4 pr-4">
                  <p>{member.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {member.email}
                  </p>
                </td>
                <td className="pr-4 capitalize">{member.role}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {membership.role === "owner" &&
                      member.userId !== actor.uid && (
                        <>
                          {member.role !== "owner" && (
                            <ActionButton
                              operation="member.change"
                              organizationId={organizationId}
                              input={{ userId: member.userId, role: "owner" }}
                              confirmText="Grant ownership?"
                            >
                              Make owner
                            </ActionButton>
                          )}
                          {member.role !== "admin" && (
                            <ActionButton
                              operation="member.change"
                              organizationId={organizationId}
                              input={{ userId: member.userId, role: "admin" }}
                            >
                              Make admin
                            </ActionButton>
                          )}
                          {member.role !== "member" && (
                            <ActionButton
                              operation="member.change"
                              organizationId={organizationId}
                              input={{ userId: member.userId, role: "member" }}
                            >
                              Make member
                            </ActionButton>
                          )}
                        </>
                      )}
                    {(member.userId === actor.uid ||
                      membership.role === "owner" ||
                      (membership.role === "admin" &&
                        member.role === "member")) && (
                      <ActionButton
                        operation="member.change"
                        organizationId={organizationId}
                        input={{ userId: member.userId, role: "removed" }}
                        confirmText={
                          member.userId === actor.uid
                            ? "Leave this organization?"
                            : "Remove this member?"
                        }
                      >
                        {member.userId === actor.uid ? "Leave" : "Remove"}
                      </ActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {membership.role !== "member" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-card border-border rounded-xl border p-6">
            <h2 className="mb-5 font-semibold">Invite someone in</h2>
            <InviteForm
              organizationId={organizationId}
              isOwner={membership.role === "owner"}
            />
          </section>
          <section className="bg-card border-border space-y-5 rounded-xl border p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Invitations</h2>
              <Link
                href={`/app/${organizationId}/outbox`}
                className="text-primary text-sm"
              >
                Open outbox
              </Link>
            </div>
            <ul className="divide-border divide-y">
              {invitations.map((invite) => (
                <li key={invite.id} className="space-y-2 py-4 text-sm">
                  <p>{invite.email}</p>
                  <p className="text-muted-foreground text-xs">
                    {invite.status} · {invite.role} · expires{" "}
                    {invite.expiresAt.slice(0, 10)}
                  </p>
                  {invite.status === "pending" && (
                    <ActionButton
                      operation="invitation.revoke"
                      organizationId={organizationId}
                      input={{ id: invite.id }}
                    >
                      Revoke
                    </ActionButton>
                  )}
                </li>
              ))}
            </ul>
            {!invitations.length && (
              <p className="text-muted-foreground text-sm">
                No invitations yet.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
